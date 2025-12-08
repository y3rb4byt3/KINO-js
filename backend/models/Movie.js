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
        type: DataTypes.STRING, 
        allowNull: false,
        get() {
            
            const rawValue = this.getDataValue('genre');
            return rawValue ? rawValue.split(',') : [];
        },
        set(val) {
            
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
    trailerUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    releaseDate: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Movie;