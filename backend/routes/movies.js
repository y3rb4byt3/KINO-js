const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime'); // Potrzebne do usuwania seansów razem z filmem
const { Op } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// ==========================================
// GET / - Pobierz filmy (Dla wszystkich)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100; // Zwiększony limit domyślny dla admina
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'DESC';
        const genre = req.query.genre || '';

        const offset = (page - 1) * limit;
        const whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { genre: { [Op.like]: `%${search}%` } }
            ];
        }
        
        // Obsługa filtrowania po gatunku
        if (genre && genre !== 'Wszystkie') {
            whereCondition.genre = { [Op.like]: `%${genre}%` };
        }

        const { count, rows } = await Movie.findAndCountAll({
            where: whereCondition,
            order: [[sortBy, order]],
            limit: limit,
            offset: offset
        });

        res.json({
            movies: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Nie udało się pobrać filmów', message: error.message });
    }
});

// ==========================================
// GET /:id - Pojedynczy film
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Film nie istnieje.' });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});

// ==========================================
// POST / - Dodaj film (TYLKO ADMIN)
// ==========================================
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        // Podstawowa walidacja
        if (!req.body.title || !req.body.duration) {
            return res.status(400).json({ error: 'Tytuł i czas trwania są wymagane.' });
        }

        const newMovie = await Movie.create(req.body);
        res.status(201).json({ message: 'Film dodany pomyślnie', movie: newMovie });
    } catch (error) {
        res.status(400).json({ error: 'Błąd dodawania filmu', message: error.message });
    }
});

// ==========================================
// DELETE /:id - Usuń film (TYLKO ADMIN)
// ==========================================
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ error: 'Film o podanym ID nie istnieje.' });
        }

        // KROK 1: Usuń wszystkie seanse powiązane z tym filmem
        await Showtime.destroy({ where: { movieId: movie.id } });

        // KROK 2: Usuń sam film
        await movie.destroy();

        res.status(200).json({ message: 'Film i jego seanse zostały usunięte.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});

module.exports = router;