const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import biblioteki JWT

// SEKRETNY KLUCZ (w produkcji powinien być w pliku .env)
const JWT_SECRET = 'TWOJ_SUPER_TAJNY_KLUCZ_KINO_XYZ'; 

// POST /users/register - Rejestracja nowego użytkownika
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Sprawdzenie, czy email jest wolny
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Użytkownik z tym adresem email już istnieje.' });
        }
        
        // Haszowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Tworzenie użytkownika w bazie
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'user' // Domyślna rola
        });
        
        // Przygotowanie odpowiedzi (bez hasła)
        const userResponse = newUser.get({ plain: true });
        delete userResponse.password;
        
        res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie', user: userResponse });
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});

// POST /users/login - Logowanie i generowanie tokena JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Szukanie użytkownika
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Nieprawidłowy login lub hasło.' });
        }
        
        // Sprawdzanie hasła
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Nieprawidłowy login lub hasło.' });
        }
        
        // Tworzenie payloadu (danych zaszyfrowanych w tokenie)
        const payload = { 
            id: user.id, 
            email: user.email,
            role: user.role
        };

        // Generowanie tokena (ważny 1 godzinę)
        const token = jwt.sign(
            payload, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Przygotowanie danych usera (bez hasła)
        const userResponse = user.get({ plain: true });
        delete userResponse.password;

        // Wysłanie odpowiedzi z tokenem
        res.json({ 
            message: 'Logowanie pomyślne', 
            token, 
            user: {
                id: userResponse.id,
                firstName: userResponse.firstName,
                role: userResponse.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera', message: error.message });
    }
});

module.exports = router;