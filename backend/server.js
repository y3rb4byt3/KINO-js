const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

// Import modeli 
const User = require('./models/User');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');     
const Reservation = require('./models/Reservation'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serwowanie plików statycznych 
app.use(express.static(path.join(__dirname, '../frontend')));

// --- IMPORTY ROUTERÓW 
const moviesRouter = require('./routes/movies');
const usersRouter = require('./routes/users');
const reservationsRouter = require('./routes/reservations'); 
const showtimesRouter = require('./routes/showtimes');      

// --- PODŁĄCZENIE ROUTERÓW ---
app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/showtimes', showtimesRouter);

// Synchronizacja bazy danych i start serwera
sequelize.sync({ force: false })
  .then(() => {
    console.log('Baza danych została zsynchronizowana.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Nie udało się połączyć z bazą danych:', err);
  });