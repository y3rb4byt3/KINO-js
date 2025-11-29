const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { Op } = require('sequelize'); // Potrzebne do filtrowania (LIKE)

// GET - Pobierz filmy (z opcją filtrowania po gatunku)
router.get('/', async (req, res) => {
  try {
    const { genre } = req.query;
    let options = {};

    if (genre && genre !== 'all') {
      // Szukanie gatunku w tekście (SQLite nie obsługuje tablic, więc trzymamy gatunki jako tekst)
      options.where = {
        genre: {
          [Op.like]: `%${genre}%` 
        }
      };
    }

    const movies = await Movie.findAll(options);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać filmów', message: error.message });
  }
});

// POST - Dodaj film (dla Admina / Postmana)
router.post('/', async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({ message: 'Film dodany', movie: newMovie });
  } catch (error) {
    res.status(400).json({ error: 'Błąd walidacji', message: error.message });
  }
});

module.exports = router;