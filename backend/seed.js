const sequelize = require('./config/database');
const Movie = require('./models/Movie');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Showtime = require('./models/Showtime');
const bcrypt = require('bcrypt'); // <--- WAŻNY IMPORT

const moviesData = [
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        duration: 166,
        genre: ["Sci-Fi", "Adventure"],
        director: "Denis Villeneuve",
        posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        releaseDate: "2024-03-01",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        duration: 180,
        genre: ["Biography", "Drama", "History"],
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        releaseDate: "2023-07-21",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
    },
    {
        title: "The Batman",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
        duration: 176,
        genre: ["Action", "Crime", "Drama"],
        director: "Matt Reeves",
        posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        releaseDate: "2022-03-04",
        trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4"
    },
    {
        title: "Barbie",
        description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
        duration: 114,
        genre: ["Comedy", "Adventure", "Fantasy"],
        director: "Greta Gerwig",
        posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        releaseDate: "2023-07-21",
        trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM"
    },
    {
        title: "Killers of the Flower Moon",
        description: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one.",
        duration: 206,
        genre: ["Crime", "Drama", "History"],
        director: "Martin Scorsese",
        posterUrl: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
        releaseDate: "2023-10-20",
        trailerUrl: "https://www.youtube.com/watch?v=EP34Yoxs3FQ"
    }
];

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Baza danych została wyczyszczona.');

        // 1. Tworzenie filmów
        const createdMovies = await Movie.bulkCreate(moviesData);
        console.log('Dodano filmy.');

        // 2. Szyfrowanie hasła Admina <--- TU JEST KLUCZ DO NAPRAWY
        const hashedPassword = await bcrypt.hash('admin', 10);

        // 3. Tworzenie Admina
        const adminUser = await User.create({
            firstName: "Admin",
            lastName: "System",
            email: "admin@kino.pl",
            password: hashedPassword, // Zapisujemy zaszyfrowane hasło!
            role: "admin"
        });
        console.log('Dodano konto administratora (admin@kino.pl / admin).');

        // 4. Generowanie seansów (dla każdego filmu po 2 seanse)
        for (const movie of createdMovies) {
            await Showtime.create({
                movieId: movie.id,
                date: "2024-06-01",
                time: "14:00",
                price: 25.00,
                seatsLayout: { totalSeats: 100, occupiedSeats: [] }
            });
            await Showtime.create({
                movieId: movie.id,
                date: "2024-06-01",
                time: "18:00",
                price: 30.00,
                seatsLayout: { totalSeats: 100, occupiedSeats: ['A1', 'A2'] } // Przykładowo zajęte
            });
        }
        console.log('Dodano przykładowe seanse.');

        console.log('✅ SUKCES! Baza jest gotowa do pracy.');
    } catch (error) {
        console.error('Błąd seedowania bazy:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();