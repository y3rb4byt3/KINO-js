const sequelize = require('./config/database');
const Movie = require('./models/Movie');
const User = require('./models/User');
const Showtime = require('./models/Showtime');
const Reservation = require('./models/Reservation');

// --- DANE DO WPISANIA DO BAZY ---

const usersData = [
    {
        firstName: "Szef",
        lastName: "Admin",
        email: "admin@kino.pl",
        password: "admin", // Hasło admina
        role: "admin"      
    },
    {
        firstName: "Jan",
        lastName: "Kowalski",
        email: "test@example.com",
        password: "password123",
        role: "user"
    }
];

const moviesData = [
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        duration: 166,
        genre: ["Sci-Fi", "Adventure"],
        director: "Denis Villeneuve",
        posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        releaseDate: "2024-03-01",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w" // <--- NOWE
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        duration: 180,
        genre: ["Biography", "Drama", "History"],
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        releaseDate: "2023-07-21",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg" // <--- NOWE
    },
    {
        title: "The Batman",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
        duration: 176,
        genre: ["Action", "Crime", "Drama"],
        director: "Matt Reeves",
        posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        releaseDate: "2022-03-04",
        trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4" // <--- NOWE
    },
    {
        title: "Barbie",
        description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
        duration: 114,
        genre: ["Comedy", "Adventure", "Fantasy"],
        director: "Greta Gerwig",
        posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        releaseDate: "2023-07-21",
        trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM" // <--- NOWE
    },
    {
        title: "Killers of the Flower Moon",
        description: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one.",
        duration: 206,
        genre: ["Crime", "Drama", "History"],
        director: "Martin Scorsese",
        posterUrl: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
        releaseDate: "2023-10-20",
        trailerUrl: "https://www.youtube.com/watch?v=EP34Yoxs3FQ" // <--- NOWE
    }
];

// Przykładowe seanse (zakładamy, że filmy dostaną ID 1-5)
const showtimesData = [
    { movieId: 1, date: "2026-06-01", time: "14:00", price: 25 },
    { movieId: 1, date: "2026-06-01", time: "18:00", price: 30 },
    { movieId: 2, date: "2026-06-01", time: "20:00", price: 35 },
    { movieId: 3, date: "2026-06-02", time: "17:30", price: 28 },
    { movieId: 4, date: "2026-06-02", time: "15:00", price: 25 }
];

// --- GŁÓWNA FUNKCJA ---

async function seedDatabase() {
    try {
        // 1. Łączymy się i RESETUJEMY bazę (force: true usuwa tabele i tworzy nowe z kolumną ROLE)
        await sequelize.authenticate();
        console.log('🔌 Połączono z bazą SQLite.');
        
        await sequelize.sync({ force: true });
        console.log('🧹 Wyczyszczono stare dane i zaktualizowano strukturę tabel.');

        // 2. Dodajemy Użytkowników (w tym Admina)
        for (const user of usersData) {
            await User.create(user);
        }
        console.log('👤 Dodano użytkowników (w tym Admina).');

        // 3. Dodajemy Filmy
        for (const movie of moviesData) {
            await Movie.create(movie);
        }
        console.log('🎬 Dodano filmy.');

        // 4. Dodajemy Seanse
        for (const showtime of showtimesData) {
            await Showtime.create(showtime);
        }
        console.log('📅 Dodano seanse.');

        console.log('✅ SUKCES! Baza jest gotowa do pracy.');
        process.exit();

    } catch (error) {
        console.error('❌ Błąd krytyczny:', error);
        process.exit(1);
    }
}

seedDatabase();