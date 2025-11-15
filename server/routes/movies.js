const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const MOVIES_FILE = path.join(__dirname, '../data/movies.json');

async function getMovies() {
  const data = await fs.readFile(MOVIES_FILE, 'utf8');
  return JSON.parse(data);
}

router.get('/', async (req, res) => {
  try {
    const movies = await getMovies();
    const { genre } = req.query;

    if (genre) {
      const filtered = movies.filter(movie =>
        movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
      return res.json(filtered);
    }

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movies = await getMovies();
    const movie = movies.find(m => m.id === parseInt(req.params.id));

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie', message: error.message });
  }
});

module.exports = router;
