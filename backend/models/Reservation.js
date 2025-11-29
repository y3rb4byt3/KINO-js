const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    showtimeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seats: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('seats');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
            this.setDataValue('seats', JSON.stringify(val));
        }
    },
    totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Reservation;