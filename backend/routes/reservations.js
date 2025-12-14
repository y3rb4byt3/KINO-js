const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');


// GET /api/reservations/all 
router.get('/all', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        // 1. Pobierz same rezerwacje (bez include)
        const rawReservations = await Reservation.findAll({
            order: [['createdAt', 'DESC']]
        });

        const fullReservations = await Promise.all(rawReservations.map(async (r) => {
            // Zamieniamy obiekt Sequelize na zwykły JSON, żeby móc dopisywać pola
            const reservationJson = r.toJSON();

            // A. Ręcznie pobieramy użytkownika
            const user = await User.findByPk(reservationJson.userId);

            // B. Ręcznie pobieramy seans
            const showtime = await Showtime.findByPk(reservationJson.showtimeId);

            // C. Ręcznie pobieramy film (tylko jeśli seans istnieje)
            let movie = null;
            if (showtime) {
                movie = await Movie.findByPk(showtime.movieId);
            }

            // D. Składamy wszystko w jeden obiekt
            return {
                ...reservationJson, // id, seats, price, etc.
                user: user ? { email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
                showtime: showtime ? { date: showtime.date, time: showtime.time } : null,
                movie: movie ? { title: movie.title } : null
            };
        }));

        // 3. Zwracamy gotową listę
        res.json(fullReservations);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Błąd podczas pobierania rezerwacji.' });
    }
});


router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; 
        const { showtimeId, seats } = req.body;

        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ error: 'Musisz wybrać przynajmniej jedno miejsce.' });
        }

        const showtime = await Showtime.findByPk(showtimeId);
        if (!showtime) {
            return res.status(404).json({ error: 'Wybrany seans nie istnieje.' });
        }

        // B. Sprawdź dostępność
        let currentLayout = showtime.seatsLayout;
        if (typeof currentLayout === 'string') {
            currentLayout = JSON.parse(currentLayout);
        }
        
        const occupied = currentLayout.occupiedSeats || [];

        const isConflict = seats.some(seat => occupied.includes(seat));
        if (isConflict) {
            return res.status(409).json({ error: 'Jedno z wybranych miejsc zostało już zajęte.' });
        }

        // C. Zaktualizuj zajęte miejsca w seansie (DODAJEMY)
        const newOccupiedSeats = [...occupied, ...seats];
        
        const updatedLayout = {
            ...currentLayout,
            occupiedSeats: newOccupiedSeats
        };

        // Ważne dla Sequelize przy polach JSON - wymuszamy update
        showtime.seatsLayout = updatedLayout;
        showtime.changed('seatsLayout', true);
        await showtime.save();

        // D. Utwórz rezerwację
        const reservation = await Reservation.create({
            userId: userId,
            showtimeId: showtimeId,
            seats: seats, 
            totalPrice: showtime.price * seats.length,
            status: 'confirmed'
        });

        res.status(201).json({
            message: 'Rezerwacja udana!',
            reservation
        });

    } catch (error) {
        console.error('Błąd rezerwacji:', error);
        res.status(500).json({ error: 'Wystąpił błąd serwera.' });
    }
});

// ==========================================
// GET /my - Pobierz moje rezerwacje
// ==========================================
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const reservations = await Reservation.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });
      
        const fullReservations = await Promise.all(reservations.map(async (res) => {
            const resData = res.toJSON();
            const showtime = await Showtime.findByPk(resData.showtimeId);
            
            let movie = null;
            if (showtime) {
                movie = await Movie.findByPk(showtime.movieId);
            }

            return {
                ...resData,
                showtime: showtime ? showtime.toJSON() : null,
                movie: movie ? movie.toJSON() : null
            };
        }));

        res.json(fullReservations);

    } catch (error) {
        console.error('Błąd pobierania rezerwacji:', error);
        res.status(500).json({ error: 'Nie udało się pobrać rezerwacji.' });
    }
});

// ==========================================
// DELETE /:id - Anuluj rezerwację (Właściciel LUB Admin)
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const user = req.user; // Zalogowany user (ma id oraz role)

        // 1. Znajdź rezerwację po SAMYM ID (nie filtrujemy jeszcze po userId)
        const reservation = await Reservation.findByPk(reservationId);

        if (!reservation) {
            return res.status(404).json({ error: 'Rezerwacja nie znaleziona.' });
        }

        // 2. SPRAWDZENIE UPRAWNIEŃ
        // Czy użytkownik jest właścicielem?
        const isOwner = reservation.userId === user.id;
        // Czy użytkownik jest adminem?
        const isAdmin = user.role === 'admin';

        // Jeśli ani jedno, ani drugie -> brak dostępu
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej rezerwacji.' });
        }

        // 3. Znajdź seans i zwolnij miejsca 
        const showtime = await Showtime.findByPk(reservation.showtimeId);
        
        if (showtime) {
            let layout = showtime.seatsLayout;
            if (typeof layout === 'string') layout = JSON.parse(layout);

            let seatsToRemove = reservation.seats;
            if (typeof seatsToRemove === 'string') seatsToRemove = JSON.parse(seatsToRemove);

            if (layout.occupiedSeats && Array.isArray(layout.occupiedSeats)) {
                // Usuwamy z listy zajętych te, które zwalniamy
                layout.occupiedSeats = layout.occupiedSeats.filter(seat => !seatsToRemove.includes(seat));
            }

            showtime.seatsLayout = layout;
            showtime.changed('seatsLayout', true);
            await showtime.save();
        }

        // 4. Usuń rezerwację z bazy
        await reservation.destroy();

        res.json({ message: 'Rezerwacja anulowana, miejsca zwolnione.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Błąd usuwania rezerwacji.' });
    }
});



module.exports = router;