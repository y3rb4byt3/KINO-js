// backend/config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Tworzymy połączenie do bazy danych SQLite
// Baza zapisze się w pliku 'kino.sqlite' w głównym folderze backendu
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../kino.sqlite'), 
    logging: false // Wyłączamy logowanie zapytań SQL w konsoli (żeby było czyściej)
});

module.exports = sequelize;