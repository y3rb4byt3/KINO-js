const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Showtime = require('../models/Showtime');
const User = require('../models/User');

// GET - Pobierz rezerwacje (wszystkie lub dla konkretnego usera)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let options = {};

    if (userId) {
      options.where = { userId: userId };
    }

    const reservations = await Reservation.findAll(options);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać rezerwacji', message: error.message });
  }
});

// GET - Pojedyncza rezerwacja
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera', message: error.message });
  }
});

// POST - Utwórz nową rezerwację
router.post('/', async (req, res) => {
  try {
    const { userId, showtimeId, seats } = req.body;

    // 1. Walidacja danych wejściowych
    if (!userId || !showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Nieprawidłowe dane. Wymagane: userId, showtimeId, seats (tablica).' });
    }

    // 2. Sprawdzenie czy user istnieje
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje' });
    }

    // 3. Sprawdzenie czy seans istnieje
    const showtime = await Showtime.findByPk(showtimeId);
    if (!showtime) {
      return res.status(404).json({ error: 'Seans nie istnieje' });
    }

    // 4. Walidacja formatu miejsc (A1-J10)
    const seatRegex = /^[A-J]([1-9]|10)$/;
    const invalidSeats = seats.filter(seat => !seatRegex.test(seat));
    if (invalidSeats.length > 0) {
      return res.status(400).json({ error: 'Nieprawidłowy numer miejsca', invalidSeats });
    }

    // 5. Sprawdzenie dostępności miejsc
    // Dzięki getterom w modelu, seatsLayout jest obiektem JS, a occupiedSeats tablicą
    let currentLayout = showtime.seatsLayout; 
    const occupiedSeats = currentLayout.occupiedSeats;

    const unavailableSeats = seats.filter(seat => occupiedSeats.includes(seat));
    if (unavailableSeats.length > 0) {
      return res.status(409).json({ error: 'Wybrane miejsca są już zajęte', unavailableSeats });
    }

    // 6. Tworzenie rezerwacji w bazie
    const newReservation = await Reservation.create({
      userId,
      showtimeId,
      seats,
      totalPrice: seats.length * showtime.price
    });

    // 7. Aktualizacja zajętych miejsc w Seansie
    // Musimy sklonować layout, zmodyfikować go i przypisać ponownie, aby Sequelize wykrył zmianę
    const updatedLayout = { ...currentLayout };
    updatedLayout.occupiedSeats.push(...seats);
    
    showtime.seatsLayout = updatedLayout; // To wywoła setter w modelu (zamiana na JSON string)
    await showtime.save();

    res.status(201).json({
      message: 'Rezerwacja utworzona pomyślnie',
      reservation: newReservation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd podczas tworzenia rezerwacji', message: error.message });
  }
});

// DELETE - Anulowanie rezerwacji
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
    }

    // Znajdź seans, żeby zwolnić miejsca
    const showtime = await Showtime.findByPk(reservation.showtimeId);
    if (showtime) {
      let currentLayout = showtime.seatsLayout;
      
      // Usuwamy miejsca z listy zajętych
      currentLayout.occupiedSeats = currentLayout.occupiedSeats.filter(
        seat => !reservation.seats.includes(seat)
      );

      // Aktualizujemy seans (musimy przypisać cały obiekt layoutu na nowo)
      showtime.seatsLayout = { ...currentLayout };
      await showtime.save();
    }

    // Usuwamy rezerwację
    await reservation.destroy();

    res.json({ message: 'Rezerwacja anulowana pomyślnie' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas anulowania', message: error.message });
  }
});

module.exports = router;