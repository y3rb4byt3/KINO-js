const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const SHOWTIMES_FILE = path.join(__dirname, '../data/showtimes.json');
const MOVIES_FILE = path.join(__dirname, '../data/movies.json');

async function getShowtimes() {
  const data = await fs.readFile(SHOWTIMES_FILE, 'utf8');
  return JSON.parse(data);
}

async function getMovies() {
  const data = await fs.readFile(MOVIES_FILE, 'utf8');
  return JSON.parse(data);
}

router.get('/', async (req, res) => {
  try {
    const showtimes = await getShowtimes();
    const { movieId, date } = req.query;

    let filtered = showtimes;

    if (movieId) {
      filtered = filtered.filter(st => st.movieId === parseInt(movieId));
    }

    if (date) {
      filtered = filtered.filter(st => st.date === date);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch showtimes', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const showtimes = await getShowtimes();
    const showtime = showtimes.find(st => st.id === parseInt(req.params.id));

    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    res.json(showtime);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch showtime', message: error.message });
  }
});

router.get('/movie/:movieId', async (req, res) => {
  try {
    const showtimes = await getShowtimes();
    const movies = await getMovies();
    const movieId = parseInt(req.params.movieId);

    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movieShowtimes = showtimes.filter(st => st.movieId === movieId);

    res.json({
      movie,
      showtimes: movieShowtimes
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie showtimes', message: error.message });
  }
});

module.exports = router;
