<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Konfiguracja
const API_URL = 'http://localhost:3000/api'
const router = useRouter()
const route = useRoute()
const notify = inject('notify') // Wstrzykujemy system powiadomień (Toast)

// Stan aplikacji
const movies = ref([])
const user = ref(JSON.parse(localStorage.getItem('user')))

// Stan filtrów
const searchQuery = ref('')
const selectedGenre = ref('all')
const sortOption = ref('default')

// Stan Modala (Trailer)
const showModal = ref(false)
const trailerUrl = ref('')

// Sprawdzanie czy user jest adminem
const isAdmin = computed(() => user.value && user.value.role === 'admin')

// --- 1. POBIERANIE FILMÓW ---
const loadMovies = async () => {
  try {
    const res = await fetch(`${API_URL}/movies`)
    const data = await res.json()
    
    // Normalizacja danych (backend czasem zwraca string, czasem tablicę gatunków)
    movies.value = data.map(m => ({
        ...m,
        // Tworzymy tablicę gatunków do filtrowania
        genreList: Array.isArray(m.genre) ? m.genre : (m.genre || '').split(','),
        // Wyciągamy główny gatunek
        mainGenre: (Array.isArray(m.genre) ? m.genre[0] : m.genre).toLowerCase()
    }))
  } catch (e) { 
    notify('Błąd pobierania filmów', 'error')
    console.error(e)
  }
}

// --- 2. FILTROWANIE I SORTOWANIE (Computed) ---
const filteredMovies = computed(() => {
    let result = movies.value

    // Wyszukiwanie po tytule
    if (searchQuery.value) {
        result = result.filter(m => m.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    }
    
    // Filtrowanie po gatunku
    if (selectedGenre.value !== 'all') {
        result = result.filter(m => 
            m.genreList.some(g => g.toLowerCase().includes(selectedGenre.value))
        )
    }

    // Sortowanie po dacie premiery
    if (sortOption.value === 'newest') {
        result = [...result].sort((a,b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    } else if (sortOption.value === 'oldest') {
        result = [...result].sort((a,b) => new Date(a.releaseDate) - new Date(b.releaseDate))
    }
    
    return result
})

// Obserwowanie zmian w URL (np. kliknięcie w nawigacji "Filmy -> Akcja")
watch(() => route.query.genre, (newGenre) => {
    if (newGenre) selectedGenre.value = newGenre
})

// --- 3. AKCJE UŻYTKOWNIKA ---

// Otwieranie Trailera
const openTrailer = (url) => {
    if (!url) {
        notify('Ten film nie ma trailera.', 'error')
        return
    }
    // Zamiana linku na wersję embed
    let embed = url.replace('watch?v=', 'embed/')
    if (url.includes('youtu.be/')) {
        embed = url.replace('youtu.be/', 'www.youtube.com/embed/')
    }

    trailerUrl.value = embed
    showModal.value = true
}

// Kupno biletu
const buyTicket = (movie) => {
    localStorage.setItem('selectedMovieId', movie.id)
    localStorage.setItem('selectedMovieTitle', movie.title)
    router.push('/reservation')
}

// Przejście do komentarzy
const goToComments = (title) => {
    localStorage.setItem('commentMovieTitle', title)
    router.push('/comments')
}

// Usuwanie filmu (ADMIN)
const deleteMovie = async (id) => {
    if(!confirm("Czy na pewno chcesz trwale usunąć ten film?")) return
    
    try {
        const res = await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' })
        if (res.ok) {
            loadMovies() // Odśwież listę
            notify('Film został usunięty.', 'success')
        } else {
            notify('Nie udało się usunąć filmu.', 'error')
        }
    } catch(e) { 
        notify('Błąd połączenia z serwerem.', 'error') 
    }
}

// Inicjalizacja przy wejściu na stronę
onMounted(() => {
    loadMovies()
    // Jeśli wchodzimy z linku np. /?genre=action, ustawiamy filtr
    if (route.query.genre) selectedGenre.value = route.query.genre
})
</script>

<template>
  <div class="container">
    <div class="sidebar"></div>
    <main>
        <h2>Repertuar</h2>
        
        <div id="search">
            <input v-model="searchQuery" type="text" placeholder="Szukaj filmów..." class="filter-input">
            
            <select v-model="selectedGenre" class="filter-select">
                <option value="all">Wszystkie gatunki</option>
                <option value="action">Akcja</option>
                <option value="comedy">Komedia</option>
                <option value="drama">Dramat</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="biography">Biografia</option>
            </select>
            
            <select v-model="sortOption" class="filter-select">
                <option value="default">Domyślne sortowanie</option>
                <option value="newest">Najnowsze premiery</option>
                <option value="oldest">Najstarsze premiery</option>
            </select>
        </div>

        <div v-if="filteredMovies.length === 0" style="text-align:center; margin-top:20px;">
            Nie znaleziono filmów spełniających kryteria.
        </div>

        <div v-for="movie in filteredMovies" :key="movie.id" class="movie">
            <img :src="movie.posterUrl || 'https://via.placeholder.com/150'" :alt="movie.title">
            
            <div class="movie-details">
                <h3>{{ movie.title }}</h3>
                <p>{{ movie.description }}</p>
                <p><strong>Reżyser:</strong> {{ movie.director }}</p>
                <p><strong>Gatunek:</strong> {{ movie.genreList.join(', ') }}</p>
                <p><strong>Czas trwania:</strong> {{ movie.duration }} min</p>
                
                <div class="movie-buttons">
                    <button @click="buyTicket(movie)">Kup Bilet</button>
                    <button @click="openTrailer(movie.trailerUrl)">Trailer</button>
                    <button @click="goToComments(movie.title)">Opinie</button>
                    
                    <button v-if="isAdmin" class="delete-btn" @click="deleteMovie(movie.id)">Usuń</button>
                </div>
            </div>
        </div>
    </main>
    <div class="sidebar"></div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
            <span class="close-button" @click="showModal = false">&times;</span>
            <div class="video-container">
                <iframe 
                    :src="trailerUrl + '?autoplay=1'" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Lokalne style dla filtrów, żeby wyglądały ładnie */
#search {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.filter-input, .filter-select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex: 1; /* Rozciągnij na dostępną szerokość */
    min-width: 150px;
}

/* Style przycisków wewnątrz karty filmu */
.movie-buttons button {
    margin-right: 5px;
    margin-top: 5px;
}
</style>