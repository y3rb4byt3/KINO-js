const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { Op } = require('sequelize'); // Operator do filtrowania (LIKE)

// GET - Pobierz filmy (READ)
router.get('/', async (req, res) => {
  try {
    const { genre } = req.query;
    let options = {};

    if (genre && genre !== 'all') {
      // Użycie operatora LIKE do wyszukiwania gatunku w ciągu znaków (jak w SQLite)
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

// GET /:id - Pobierz pojedynczy film
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Film nie istnieje.' });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});


// POST - Dodaj film (CREATE)
router.post('/', async (req, res) => {
  try {
    // Movie.create automatycznie sprawdza walidację z modelu
    const newMovie = await Movie.create(req.body);
    res.status(201).json({ message: 'Film dodany', movie: newMovie });
  } catch (error) {
    // Obsługa błędów walidacji Sequelize
    res.status(400).json({ error: 'Błąd walidacji', message: error.message });
  }
});

// PUT /:id - Aktualizuj film (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const [updatedRowsCount] = await Movie.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRowsCount === 0) {
            // Zwraca 404 jeśli film o danym ID nie został znaleziony
            return res.status(404).json({ error: 'Film o podanym ID nie istnieje.' });
        }

        // Pobierz zaktualizowany film, aby go zwrócić
        const updatedMovie = await Movie.findByPk(req.params.id);

        res.json({ message: 'Film zaktualizowany pomyślnie', movie: updatedMovie });
    } catch (error) {
        // Zwracanie błędu 400 w przypadku niepowodzenia walidacji danych
        res.status(400).json({ error: 'Błąd aktualizacji', message: error.message });
    }
});

// DELETE /:id - Usuń film (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedRowCount = await Movie.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowCount === 0) {
            return res.status(404).json({ error: 'Film o podanym ID nie istnieje.' });
        }

        // 200 OK z komunikatem, że film został usunięty
        res.status(200).json({ message: 'Film usunięty pomyślnie.' });
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});


module.exports = router;