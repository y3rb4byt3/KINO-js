const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING, // SQLite nie ma typu ARRAY, więc zapiszemy to jako tekst (np. "Sci-Fi,Action")
        allowNull: false,
        get() {
            // Magia: przy odczycie zamieniamy tekst na tablicę
            const rawValue = this.getDataValue('genre');
            return rawValue ? rawValue.split(',') : [];
        },
        set(val) {
            // Magia: przy zapisie zamieniamy tablicę na tekst
            this.setDataValue('genre', Array.isArray(val) ? val.join(',') : val);
        }
    },
    director: {
        type: DataTypes.STRING,
        allowNull: false
    },
    posterUrl: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    releaseDate: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Movie;