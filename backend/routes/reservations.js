const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

const { authenticateToken } = require('../middleware/authMiddleware');

// ==========================================
// POST / - Utwórz nową rezerwację
// ==========================================
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
// DELETE /:id - Anuluj rezerwację (NAPRAWIONE)
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id;

        // 1. Znajdź rezerwację (żeby wiedzieć co usuwamy)
        const reservation = await Reservation.findOne({
            where: { id: reservationId, userId: userId }
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Rezerwacja nie znaleziona lub brak uprawnień.' });
        }

        // 2. Znajdź seans powiązany z tą rezerwacją
        const showtime = await Showtime.findByPk(reservation.showtimeId);
        
        if (showtime) {
            // 3. Pobierz aktualny układ sali
            let layout = showtime.seatsLayout;
            if (typeof layout === 'string') layout = JSON.parse(layout);

            // 4. Pobierz miejsca do usunięcia (z rezerwacji)
            let seatsToRemove = reservation.seats;
            // Sequelize czasem zwraca JSON jako string, czasem jako obiekt
            if (typeof seatsToRemove === 'string') seatsToRemove = JSON.parse(seatsToRemove);

            // 5. Wykreśl te miejsca z listy occupiedSeats
            // Zostawiamy tylko te miejsca, których NIE MA na liście do usunięcia
            if (layout.occupiedSeats && Array.isArray(layout.occupiedSeats)) {
                layout.occupiedSeats = layout.occupiedSeats.filter(seat => !seatsToRemove.includes(seat));
            }

            // 6. Zapisz zaktualizowany layout w seansie
            showtime.seatsLayout = layout;
            showtime.changed('seatsLayout', true); // Kluczowe dla Sequelize!
            await showtime.save();
        }

        // 7. Dopiero teraz usuń samą rezerwację z historii
        await reservation.destroy();

        res.json({ message: 'Rezerwacja anulowana, miejsca zwolnione.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Błąd usuwania rezerwacji.' });
    }
});

module.exports = router;