const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const MOVIES_FILE = path.join(__dirname, '../data/movies.json');

async function getMovies() {
  const data = await fs.readFile(MOVIES_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveMovies(movies) {
  await fs.writeFile(MOVIES_FILE, JSON.stringify(movies, null, 2));
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

// POST - Add new movie
router.post('/', async (req, res) => {
  try {
    const { title, description, duration, genre, director, cast, posterUrl, trailerUrl, rating, releaseDate } = req.body;

    // Validation
    if (!title || !description || !duration || !genre || !director) {
      return res.status(400).json({
        error: 'Required fields missing',
        required: ['title', 'description', 'duration', 'genre', 'director']
      });
    }

    if (!Array.isArray(genre) || genre.length === 0) {
      return res.status(400).json({ error: 'Genre must be a non-empty array' });
    }

    if (!Array.isArray(cast)) {
      return res.status(400).json({ error: 'Cast must be an array' });
    }

    const movies = await getMovies();

    // Create new movie
    const newMovie = {
      id: movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1,
      title,
      description,
      duration,
      genre,
      director,
      cast: cast || [],
      posterUrl: posterUrl || '',
      trailerUrl: trailerUrl || '',
      rating: rating || 'NR',
      releaseDate: releaseDate || new Date().toISOString().split('T')[0]
    };

    movies.push(newMovie);
    await saveMovies(movies);

    res.status(201).json({
      message: 'Movie added successfully',
      movie: newMovie
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add movie', message: error.message });
  }
});

module.exports = router;
