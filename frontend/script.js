const API_URL = 'http://localhost:3000/api';

// --- 1. Funkcja usuwania filmu (Tylko dla Admina) ---
async function deleteMovie(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten film? Tej operacji nie można cofnąć.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Film został usunięty.');
            loadMovies();
        } else {
            const data = await response.json();
            alert('Błąd: ' + (data.error || 'Nie udało się usunąć filmu.'));
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd połączenia z serwerem.');
    }
}

// --- 2. Ładowanie filmów (POPRAWIONE) ---
async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/movies`);
        const movies = await response.json();
        const moviesContainer = document.getElementById('movies');
        
        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user && user.role === 'admin';

        moviesContainer.innerHTML = ''; 

        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');
            
            // --- TUTAJ BYŁ BŁĄD, OTO POPRAWKA ---
            // Backend wysyła tablicę ["Sci-Fi", "Action"], więc nie robimy split()
            let mainGenre = 'other';
            if (Array.isArray(movie.genre) && movie.genre.length > 0) {
                mainGenre = movie.genre[0].toLowerCase();
            } else if (typeof movie.genre === 'string') {
                // Zabezpieczenie, gdyby jednak przyszło jako tekst
                mainGenre = movie.genre.split(',')[0].toLowerCase();
            }
            
            movieElement.setAttribute('data-genre', mainGenre); 
            movieElement.setAttribute('data-release-date', movie.releaseDate);

            const imgUrl = movie.posterUrl ? movie.posterUrl : 'https://via.placeholder.com/150x225?text=Brak+Okladki';

            let deleteButtonHTML = '';
            if (isAdmin) {
                deleteButtonHTML = `<button class="delete-btn" onclick="deleteMovie(${movie.id})">Usuń</button>`;
            }

            movieElement.innerHTML = `
                <img src="${imgUrl}" alt="${movie.title}" class="movie-img">
                <div class="movie-details">
                    <h3>${movie.title}</h3>
                    <p>${movie.description.substring(0, 150)}...</p>
                    <p><strong>Reżyser:</strong> ${movie.director}</p>
                    <p><strong>Gatunek:</strong> ${Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</p>
                    <p><strong>Czas trwania:</strong> ${movie.duration} min</p>
                    <div class="movie-buttons">
                        <button onclick="buyTicket(${movie.id}, '${movie.title}')">Kup Bilet</button>
                        <button onclick="showTrailer('${movie.trailerUrl}')">Trailer</button>
                        ${deleteButtonHTML}
                    </div>
                </div>
            `;
            moviesContainer.appendChild(movieElement);
        });

        document.querySelectorAll('.movie-img').forEach(img => {
            img.addEventListener('mouseenter', () => img.classList.add('zoomed'));
            img.addEventListener('mouseleave', () => img.classList.remove('zoomed'));
        });

    } catch (error) {
        console.error('Błąd:', error);
        document.getElementById('movies').innerHTML = '<p style="text-align:center;">Nie udało się pobrać filmów.</p>';
    }
}

// --- 3. Obsługa Trailerów ---
function showTrailer(url) {
    if (!url || url.length < 5) {
        alert('Brak trailera dla tego filmu.');
        return;
    }
    let embedUrl = url;
    if (url.includes('watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/');
    }

    const trailerContainer = document.getElementById('trailerContainer');
    trailerContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="${embedUrl}?autoplay=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
        ></iframe>
    `;
    document.getElementById('trailerModal').style.display = 'block';
}

function closeTrailer() {
    document.getElementById('trailerModal').style.display = 'none';
    document.getElementById('trailerContainer').innerHTML = ''; 
}

// --- 4. Pozostałe funkcje ---

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
        const matchesGenre = genreSelect === 'all' || genre.includes(genreSelect);

        movie.style.display = (matchesSearch && matchesGenre) ? 'flex' : 'none';
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
    const loginLink = document.querySelector('.login-button');

    if (user && loginLink) {
        loginLink.textContent = `Wyloguj (${user.firstName})`;
        loginLink.href = "#";
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

// --- 5. Inicjalizacja ---
window.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    checkLoginState();
    
    const closeBtn = document.getElementById('closeTrailer');
    if(closeBtn) closeBtn.addEventListener('click', closeTrailer);
    
    window.onclick = function(event) {
        const modal = document.getElementById('trailerModal');
        if (event.target == modal) {
            closeTrailer();
        }
    }

    const searchInput = document.getElementById('searchInput');
    const genreSelect = document.getElementById('genreSelect');
    const sortSelect = document.getElementById('sortSelect');

    if(searchInput) searchInput.addEventListener('keyup', filterMovies);
    if(genreSelect) genreSelect.addEventListener('change', filterMovies);
    if(sortSelect) sortSelect.addEventListener('change', sortMovies);
});