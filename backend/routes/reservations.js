const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie'); // Potrzebny, żeby wyświetlić tytuł filmu

const { authenticateToken } = require('../middleware/authMiddleware');

// ==========================================
// POST / - Utwórz nową rezerwację
// ==========================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        // ID użytkownika bierzemy z tokena (dzięki middleware), a nie z body!
        const userId = req.user.id; 
        const { showtimeId, seats } = req.body; // seats to tablica np. ['A1', 'A2']

        // Walidacja: czy wybrano miejsca
        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ error: 'Musisz wybrać przynajmniej jedno miejsce.' });
        }

        // A. Pobierz seans
        const showtime = await Showtime.findByPk(showtimeId);
        if (!showtime) {
            return res.status(404).json({ error: 'Wybrany seans nie istnieje.' });
        }

        // B. Sprawdź dostępność miejsc
        // Musimy obsłużyć sytuację, gdy seatsLayout jest JSON-em lub obiektem
        let currentLayout = showtime.seatsLayout;
        if (typeof currentLayout === 'string') {
            currentLayout = JSON.parse(currentLayout);
        }
        // Jeśli nie ma pola occupiedSeats, to przyjmij pustą tablicę
        const occupied = currentLayout.occupiedSeats || [];

        // Sprawdź konflikt
        const isConflict = seats.some(seat => occupied.includes(seat));
        if (isConflict) {
            return res.status(409).json({ error: 'Jedno z wybranych miejsc zostało już zajęte.' });
        }

        // C. Zaktualizuj zajęte miejsca w seansie
        const newOccupiedSeats = [...occupied, ...seats];
        
        // Zapisujemy zaktualizowany layout do bazy
        // Zachowujemy rows i seatsPerRow, zmieniamy tylko occupiedSeats
        const updatedLayout = {
            ...currentLayout,
            occupiedSeats: newOccupiedSeats
        };

        await showtime.update({
            seatsLayout: updatedLayout
        });

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

        // 1. Pobieramy "surowe" rezerwacje użytkownika
        const reservations = await Reservation.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });

      
        const fullReservations = await Promise.all(reservations.map(async (res) => {
            // Zamieniamy obiekt Sequelize na zwykły obiekt JS
            const resData = res.toJSON();

            // Szukamy seansu dla tej rezerwacji
            const showtime = await Showtime.findByPk(resData.showtimeId);
            
            let movie = null;
            if (showtime) {
                // Szukamy filmu dla tego seansu
                movie = await Movie.findByPk(showtime.movieId);
            }

            // Doklejamy znalezione dane do wyniku
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
// DELETE /:id - Anuluj rezerwację
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id; // Z tokena

        // Szukamy rezerwacji, która należy do tego użytkownika
        const reservation = await Reservation.findOne({
            where: { id: reservationId, userId: userId }
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Rezerwacja nie znaleziona lub brak uprawnień.' });
        }

        // Usuwamy z bazy
        await reservation.destroy();

        

        res.json({ message: 'Rezerwacja została anulowana.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Błąd usuwania rezerwacji.' });
    }
});

module.exports = router;