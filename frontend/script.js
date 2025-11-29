const API_URL = 'http://localhost:3000/api';

// --- 1. Ładowanie filmów ---
async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/movies`);
        const movies = await response.json();
        const moviesContainer = document.getElementById('movies');
        
        moviesContainer.innerHTML = ''; // Czyścimy stare dane

        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');
            
            // Pobieramy gatunek i datę do filtrowania/sortowania
            const mainGenre = movie.genre && movie.genre.length > 0 ? movie.genre[0].toLowerCase() : 'other';
            movieElement.setAttribute('data-genre', mainGenre); 
            movieElement.setAttribute('data-release-date', movie.releaseDate);

            // Jeśli brak posterUrl, używamy placeholder
            const imgUrl = movie.posterUrl ? movie.posterUrl : 'https://via.placeholder.com/150x225?text=Brak+Okladki';

            movieElement.innerHTML = `
                <img src="${imgUrl}" alt="${movie.title}" class="movie-img">
                <div class="movie-details">
                    <h3>${movie.title}</h3>
                    <p>${movie.description.substring(0, 150)}...</p>
                    <p><strong>Reżyser:</strong> ${movie.director}</p>
                    <p><strong>Gatunek:</strong> ${movie.genre.join(', ')}</p>
                    <p><strong>Czas trwania:</strong> ${movie.duration} min</p>
                    <div class="movie-buttons">
                        <button onclick="buyTicket(${movie.id}, '${movie.title}')">Kup Bilet</button>
                    </div>
                </div>
            `;
            moviesContainer.appendChild(movieElement);
        });

        // Efekt zoom
        document.querySelectorAll('.movie-img').forEach(img => {
            img.addEventListener('mouseenter', () => img.classList.add('zoomed'));
            img.addEventListener('mouseleave', () => img.classList.remove('zoomed'));
        });

    } catch (error) {
        console.error('Błąd pobierania filmów:', error);
        document.getElementById('movies').innerHTML = '<p style="text-align:center; padding:20px;">Nie udało się połączyć z serwerem. Sprawdź, czy backend działa.</p>';
    }
}

// --- 2. Funkcje pomocnicze ---
function buyTicket(movieId, movieTitle) {
    localStorage.setItem('selectedMovieId', movieId);
    localStorage.setItem('selectedMovieTitle', movieTitle);
    window.location.href = 'zakupbiletow.html';
}

function filterMovies() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const genreSelect = document.getElementById('genreSelect').value.toLowerCase();
    const movies = document.querySelectorAll('.movie');

    movies.forEach(movie => {
        const title = movie.querySelector('h3').textContent.toLowerCase();
        const genre = movie.getAttribute('data-genre');

        const matchesSearch = title.includes(searchInput);
        const matchesGenre = genreSelect === 'all' || genre === genreSelect || genre.includes(genreSelect);

        if (matchesSearch && matchesGenre) {
            movie.style.display = 'flex';
        } else {
            movie.style.display = 'none';
        }
    });
}

function sortMovies() {
    const sortSelect = document.getElementById('sortSelect').value;
    const moviesContainer = document.getElementById('movies');
    const movies = Array.from(document.querySelectorAll('.movie'));

    if (sortSelect === 'newest') {
        movies.sort((a, b) => new Date(b.getAttribute('data-release-date')) - new Date(a.getAttribute('data-release-date')));
    } else if (sortSelect === 'oldest') {
        movies.sort((a, b) => new Date(a.getAttribute('data-release-date')) - new Date(b.getAttribute('data-release-date')));
    }

    movies.forEach(movie => moviesContainer.appendChild(movie));
}

function checkLoginState() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginLink = document.querySelector('.login-button'); // Szukamy linku w headerze

    if (user && loginLink) {
        loginLink.textContent = `Wyloguj (${user.firstName})`;
        loginLink.href = "#";
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.reload();
        });
    }
}

// --- 3. Inicjalizacja ---
window.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    checkLoginState();
    
    const searchInput = document.getElementById('searchInput');
    const genreSelect = document.getElementById('genreSelect');
    const sortSelect = document.getElementById('sortSelect');

    if(searchInput) searchInput.addEventListener('keyup', filterMovies);
    if(genreSelect) genreSelect.addEventListener('change', filterMovies);
    if(sortSelect) sortSelect.addEventListener('change', sortMovies);
});