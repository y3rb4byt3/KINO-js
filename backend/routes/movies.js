const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { Op } = require('sequelize'); // Operator do filtrowania (LIKE, OR)

// ==========================================
// GET / - Pobierz filmy (FILTROWANIE, SORTOWANIE, PAGINACJA)
// ==========================================
router.get('/', async (req, res) => {
    try {
        // 1. Pobieramy parametry z URL (z wartościami domyślnymi)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8; // Domyślnie 8 filmów na stronę
        const search = req.query.search || ''; // Fraza wyszukiwania
        const sortBy = req.query.sortBy || 'createdAt'; // Sortowanie po...
        const order = req.query.order || 'DESC'; // Kierunek (ASC/DESC)

        // 2. Obliczamy offset (ile rekordów pominąć)
        const offset = (page - 1) * limit;

        // 3. Budujemy warunek WHERE
        const whereCondition = {};

        // Jeśli jest fraza wyszukiwania, szukamy w Tytule LUB Gatunku
        if (search) {
            whereCondition[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { genre: { [Op.like]: `%${search}%` } } // Zakładając, że genre to string lub JSON string
            ];
        }

        // 4. Pobieramy dane (findAndCountAll zwraca też całkowitą liczbę wyników)
        const { count, rows } = await Movie.findAndCountAll({
            where: whereCondition,
            order: [[sortBy, order]], // np. [['title', 'ASC']]
            limit: limit,
            offset: offset
        });

        // 5. Zwracamy odpowiedź w formacie: { movies: [], pagination: {} }
        res.json({
            movies: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Nie udało się pobrać filmów', message: error.message });
    }
});

// ==========================================
// GET /:id - Pobierz pojedynczy film
// ==========================================
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

// ==========================================
// POST - Dodaj film (CREATE)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const newMovie = await Movie.create(req.body);
        res.status(201).json({ message: 'Film dodany', movie: newMovie });
    } catch (error) {
        res.status(400).json({ error: 'Błąd walidacji', message: error.message });
    }
});

// ==========================================
// PUT /:id - Aktualizuj film (UPDATE)
// ==========================================
router.put('/:id', async (req, res) => {
    try {
        const [updatedRowsCount] = await Movie.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Film o podanym ID nie istnieje.' });
        }

        const updatedMovie = await Movie.findByPk(req.params.id);
        res.json({ message: 'Film zaktualizowany pomyślnie', movie: updatedMovie });
    } catch (error) {
        res.status(400).json({ error: 'Błąd aktualizacji', message: error.message });
    }
});

// ==========================================
// DELETE /:id - Usuń film (DELETE)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const deletedRowCount = await Movie.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowCount === 0) {
            return res.status(404).json({ error: 'Film o podanym ID nie istnieje.' });
        }

        res.status(200).json({ message: 'Film usunięty pomyślnie.' });
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});

module.exports = router;