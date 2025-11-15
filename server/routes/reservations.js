const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const RESERVATIONS_FILE = path.join(__dirname, '../data/reservations.json');
const SHOWTIMES_FILE = path.join(__dirname, '../data/showtimes.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

async function getReservations() {
  const data = await fs.readFile(RESERVATIONS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveReservations(reservations) {
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
}

async function getShowtimes() {
  const data = await fs.readFile(SHOWTIMES_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveShowtimes(showtimes) {
  await fs.writeFile(SHOWTIMES_FILE, JSON.stringify(showtimes, null, 2));
}

async function getUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

router.get('/', async (req, res) => {
  try {
    const reservations = await getReservations();
    const { userId } = req.query;

    if (userId) {
      const userReservations = reservations.filter(r => r.userId === parseInt(userId));
      return res.json(userReservations);
    }

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reservations = await getReservations();
    const reservation = reservations.find(r => r.id === parseInt(req.params.id));

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservation', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, showtimeId, seats } = req.body;

    if (!userId || !showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        required: {
          userId: 'number',
          showtimeId: 'number',
          seats: 'array of seat codes (e.g., ["A1", "A2"])'
        }
      });
    }

    const users = await getUsers();
    if (!users.find(u => u.id === userId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const showtimes = await getShowtimes();
    const showtime = showtimes.find(st => st.id === showtimeId);

    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    const occupiedSeats = showtime.seatsLayout.occupiedSeats;
    const unavailableSeats = seats.filter(seat => occupiedSeats.includes(seat));

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        error: 'Some seats are not available',
        unavailableSeats
      });
    }

    const seatRegex = /^[A-J]([1-9]|10)$/;
    const invalidSeats = seats.filter(seat => !seatRegex.test(seat));

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        error: 'Invalid seat format',
        invalidSeats,
        format: 'Seats should be in format A1-J10'
      });
    }

    const reservations = await getReservations();
    const newReservation = {
      id: reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1,
      userId,
      showtimeId,
      seats,
      totalPrice: seats.length * showtime.price,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    await saveReservations(reservations);

    showtime.seatsLayout.occupiedSeats.push(...seats);
    showtime.availableSeats -= seats.length;

    await saveShowtimes(showtimes);

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: newReservation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reservations = await getReservations();
    const reservationIndex = reservations.findIndex(r => r.id === parseInt(req.params.id));

    if (reservationIndex === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservations[reservationIndex];

    const showtimes = await getShowtimes();
    const showtime = showtimes.find(st => st.id === reservation.showtimeId);

    if (showtime) {
      showtime.seatsLayout.occupiedSeats = showtime.seatsLayout.occupiedSeats.filter(
        seat => !reservation.seats.includes(seat)
      );
      showtime.availableSeats += reservation.seats.length;
      await saveShowtimes(showtimes);
    }

    reservations.splice(reservationIndex, 1);
    await saveReservations(reservations);

    res.json({
      message: 'Reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel reservation', message: error.message });
  }
});

module.exports = router;
