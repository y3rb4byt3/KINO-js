const sequelize = require('./config/database');
const Movie = require('./models/Movie');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Showtime = require('./models/Showtime');
const bcrypt = require('bcrypt'); // <--- WAŻNY IMPORT

const moviesData = [
    {
        title: "Diuna: Część druga",
        description: "Paul Atreides jednoczy siły z Chani i Fremenami, szukając zemsty na spiskowcach, którzy zniszczyli jego rodzinę.",
        duration: 166,
        genre: ["Sci-Fi", "Przygodowy", "Akcja"],
        director: "Denis Villeneuve",
        posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        releaseDate: "2024-03-01",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
    },
    {
        title: "Oppenheimer",
        description: "Historia amerykańskiego naukowca J. Roberta Oppenheimera i jego roli w stworzeniu bomby atomowej.",
        duration: 180,
        genre: ["Biografia", "Dramat", "Historyczny"],
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        releaseDate: "2023-07-21",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
    },
    {
        title: "Batman",
        description: "Kiedy sadystyczny seryjny morderca zaczyna eliminować kluczowe postacie polityczne w Gotham, Batman jest zmuszony zbadać ukrytą korupcję w mieście.",
        duration: 176,
        genre: ["Akcja", "Kryminał", "Dramat"],
        director: "Matt Reeves",
        posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        releaseDate: "2022-03-04",
        trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4"
    },
    {
        title: "Barbie",
        description: "Barbie i Ken świetnie się bawią w kolorowym i pozornie idealnym świecie Barbie Land, dopóki nie trafiają do prawdziwego świata.",
        duration: 114,
        genre: ["Komedia", "Przygodowy", "Fantasy"],
        director: "Greta Gerwig",
        posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        releaseDate: "2023-07-21",
        trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM"
    },
    {
        title: "Czas krwawego księżyca",
        description: "Gdy w latach 20. XX wieku na ziemiach plemienia Osagów odkryta zostaje ropa naftowa, członkowie plemienia zaczynają ginąć w tajemniczych okolicznościach.",
        duration: 206,
        genre: ["Kryminał", "Dramat", "Historyczny"],
        director: "Martin Scorsese",
        posterUrl: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
        releaseDate: "2023-10-20",
        trailerUrl: "https://www.youtube.com/watch?v=EP34Yoxs3FQ"
    }
];

const seedDatabase = async () => {
    try {
        // force: true resetuje bazę danych (usuwa tabele i tworzy na nowo)
        await sequelize.sync({ force: true });
        console.log('Baza danych została wyczyszczona.');

        // 1. Tworzenie filmów
        const createdMovies = await Movie.bulkCreate(moviesData);
        console.log('Dodano filmy (PL).');

        // 2. Szyfrowanie hasła Admina
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

        // 4. Generowanie seansów
        for (const movie of createdMovies) {
            await Showtime.create({
                movieId: movie.id,
                date: "2024-06-01",
                time: "14:00",
                price: 25.00,
                seatsLayout: { 
                    rows: 10, 
                    seatsPerRow: 10, 
                    occupiedSeats: [] 
                }
            });
            await Showtime.create({
                movieId: movie.id,
                date: "2024-06-01",
                time: "18:00",
                price: 30.00,
                // 👇 TUTAJ TEŻ:
                seatsLayout: { 
                    rows: 10, 
                    seatsPerRow: 10, 
                    occupiedSeats: ['A1', 'A2'] 
                } 
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