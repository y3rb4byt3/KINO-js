const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie'); // Potrzebne do endpointu z detalami filmu

// GET - Pobierz wszystkie seanse (z opcją filtrowania)
router.get('/', async (req, res) => {
  try {
    const { movieId, date } = req.query;
    let options = { where: {} };

    if (movieId) {
      options.where.movieId = movieId;
    }
    if (date) {
      options.where.date = date;
    }

    const showtimes = await Showtime.findAll(options);
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać seansów', message: error.message });
  }
});

// GET - Pobierz pojedynczy seans
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);

    if (!showtime) {
      return res.status(404).json({ error: 'Seans nie istnieje' });
    }

    res.json(showtime);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera', message: error.message });
  }
});

// GET - Pobierz film wraz z jego seansami (dla kompatybilności ze starym API)
router.get('/movie/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Film nie istnieje' });
    }

    const showtimes = await Showtime.findAll({ where: { movieId: movieId } });

    res.json({
      movie,
      showtimes
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera', message: error.message });
  }
});

module.exports = router;