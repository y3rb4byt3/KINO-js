const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Showtime = sequelize.define('Showtime', {
    movieId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seatsLayout: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '{"rows":10,"seatsPerRow":10,"occupiedSeats":[]}',
        get() {
            const rawValue = this.getDataValue('seatsLayout');
            return rawValue ? JSON.parse(rawValue) : { occupiedSeats: [] };
        },
        set(val) {
            this.setDataValue('seatsLayout', JSON.stringify(val));
        }
    }
});

module.exports = Showtime;