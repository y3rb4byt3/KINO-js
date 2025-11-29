const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false, // Walidacja: pole wymagane
        validate: {
            notEmpty: { msg: "Imię nie może być puste" }
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Walidacja: email musi być unikalny w bazie
        validate: {
            isEmail: { msg: "Niepoprawny format email" }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = User;