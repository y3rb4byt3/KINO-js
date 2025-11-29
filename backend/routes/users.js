const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importujemy model bazy danych

// Rejestracja (CREATE)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Sprawdzamy czy user już istnieje
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Użytkownik o tym emailu już istnieje' });
    }

    // Tworzymy użytkownika w bazie
    const newUser = await User.create({ email, password, firstName, lastName });

    // Ukrywamy hasło w odpowiedzi
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'Rejestracja udana',
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera', message: error.message });
  }
});

// Logowanie (READ)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Szukamy w bazie
    const user = await User.findOne({ where: { email } });

    // Sprawdzamy hasło (proste porównanie tekstowe na potrzeby projektu)
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Błędny email lub hasło' });
    }

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Zalogowano pomyślnie',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd logowania', message: error.message });
  }
});

module.exports = router;