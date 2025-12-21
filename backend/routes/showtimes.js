const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Domyślny układ sali (taki sam jak używasz na frontendzie)
const DEFAULT_LAYOUT = {
    rows: 10,
    seatsPerRow: 15, // lub cols
    occupiedSeats: [] 
};

// ==========================================
// GET / - Pobierz seanse (z opcją filtrowania)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { movieId, date } = req.query;
    let options = { where: {}, order: [['date', 'ASC'], ['time', 'ASC']] };

    if (movieId) options.where.movieId = movieId;
    if (date) options.where.date = date;

    const showtimes = await Showtime.findAll(options);
    res.json(showtimes); // Jeśli frontend oczekuje { showtimes: [] }, zmień na res.json({ showtimes })
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać seansów', message: error.message });
  }
});

// ==========================================
// GET /movie/:movieId - Seanse dla konkretnego filmu (używane w panelu admina)
// ==========================================
router.get('/movie/:movieId', async (req, res) => {
    try {
      const showtimes = await Showtime.findAll({ 
          where: { movieId: req.params.movieId },
          order: [['date', 'ASC'], ['time', 'ASC']]
      });
      // Frontend oczekuje obiektu { showtimes: [...] } w AdminShowtimesView.vue
      res.json({ showtimes }); 
    } catch (error) {
      res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
  });

// ==========================================
// GET /:id - Pojedynczy seans (dla rezerwacji)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);
    if (!showtime) return res.status(404).json({ error: 'Seans nie istnieje' });
    
    // Opcjonalnie dołącz dane filmu, jeśli frontend tego potrzebuje w tym miejscu
    const movie = await Movie.findByPk(showtime.movieId);
    const result = showtime.toJSON();
    if (movie) result.movie = movie;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera', message: error.message });
  }
});

// ==========================================
// POST / - Dodaj nowy seans (TYLKO ADMIN)
// ==========================================
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const { movieId, date, time, price } = req.body;

        if (!movieId || !date || !time) {
            return res.status(400).json({ error: 'Brak wymaganych danych (film, data, czas).' });
        }

        const movie = await Movie.findByPk(movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Wybrany film nie istnieje.' });
        }

        // Tworzenie seansu z domyślnym układem sali
        const newShowtime = await Showtime.create({
            movieId,
            date,
            time,
            price: price || 25,
            seatsLayout: DEFAULT_LAYOUT // Ważne! Inicjalizacja pustej sali
        });

        res.status(201).json({ message: 'Seans dodany pomyślnie', showtime: newShowtime });

    } catch (error) {
        console.error("Błąd dodawania seansu:", error);
        res.status(500).json({ error: 'Nie udało się dodać seansu.' });
    }
});

// ==========================================
// DELETE /:id - Usuń seans (TYLKO ADMIN)
// ==========================================
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const showtime = await Showtime.findByPk(req.params.id);
        if (!showtime) {
            return res.status(404).json({ error: 'Seans nie istnieje.' });
        }

        // Tu można by dodać sprawdzanie, czy są rezerwacje na ten seans,
        // ale w prostej wersji po prostu usuwamy.
        await showtime.destroy();

        res.json({ message: 'Seans usunięty.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Błąd usuwania seansu.' });
    }
});

module.exports = router;