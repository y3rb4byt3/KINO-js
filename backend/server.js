const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const moviesRouter = require('./routes/movies');
const usersRouter = require('./routes/users');
const reservationsRouter = require('./routes/reservations');
const showtimesRouter = require('./routes/showtimes');

app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/showtimes', showtimesRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KINO-js API',
    version: '1.0.0',
    endpoints: {
      movies: '/api/movies',
      showtimes: '/api/showtimes',
      users: '/api/users',
      reservations: '/api/reservations'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
