<script setup>
import { ref, onMounted, inject } from 'vue'
import CinemaButton from '../components/CinemaButton.vue'
import CinemaInput from '../components/CinemaInput.vue'

const notify = inject('notify') 
const API_URL = 'http://localhost:3000/api'
const movies = ref([])
const loading = ref(true)
const token = localStorage.getItem('token')

// Stan formularza nowego filmu
const newMovie = ref({
    title: '',
    description: '',
    duration: 0,
    genre: '',
    director: '',
    posterUrl: '',
    trailerUrl: '',
    releaseDate: ''
})

// --- 1. POBIERANIE DANYCH ---
const fetchMovies = async () => {
    if (!token) {
        if (notify) notify('Sesja wygasła. Zaloguj się ponownie.', 'error')
        return
    }

    try {
        const response = await fetch(`${API_URL}/movies?limit=100&order=DESC`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Błąd pobierania filmów')
        }
        
        const data = await response.json()
        movies.value = data.movies
        
    } catch (error) {
        console.error("Błąd pobierania filmów:", error)
        if (notify) notify(error.message, 'error')
    } finally {
        loading.value = false
    }
}

// --- 2. DODAWANIE NOWEGO FILMU ---
const createMovie = async () => {
    if (!newMovie.value.title || !newMovie.value.duration) {
        if (notify) notify('Tytuł i czas trwania są wymagane.', 'error')
        return
    }

    try {
        const response = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(newMovie.value)
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Błąd dodawania filmu.')
        }

        if (notify) notify('Film dodany pomyślnie!', 'success')
        
        // Odśwież listę i wyczyść formularz
        await fetchMovies()
        newMovie.value = {
            title: '', description: '', duration: 0, genre: '', director: '', posterUrl: '', trailerUrl: '', releaseDate: ''
        }

    } catch (error) {
        console.error("Błąd tworzenia filmu:", error)
        if (notify) notify(error.message, 'error')
    }
}

// --- 3. USUWANIE FILMU ---
const deleteMovie = async (movieId) => {
    if (!confirm('Czy na pewno chcesz usunąć ten film? Spowoduje to usunięcie wszystkich powiązanych seansów.')) return

    try {
        const response = await fetch(`${API_URL}/movies/${movieId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Błąd usuwania filmu.')
        }

        if (notify) notify('Film usunięty pomyślnie.', 'success')
        
        // Odśwież listę
        await fetchMovies()

    } catch (error) {
        console.error("Błąd usuwania filmu:", error)
        if (notify) notify(error.message, 'error')
    }
}

onMounted(fetchMovies)
</script>

<template>
  <div class="admin-movies-view">
    
    <div class="header">
      <h2>Zarządzanie Filmami ({{ movies.length }})</h2>
    </div>

    <div class="add-movie-section">
      <h3>Dodaj Nowy Film</h3>
      <form @submit.prevent="createMovie" class="movie-form-grid">
        
        <CinemaInput id="title" label="Tytuł" v-model="newMovie.title" placeholder="Tytuł filmu" required />
        <CinemaInput id="director" label="Reżyser" v-model="newMovie.director" placeholder="Imię i nazwisko" />
        <CinemaInput id="duration" label="Czas (min)" type="number" v-model.number="newMovie.duration" placeholder="np. 120" required />
        <CinemaInput id="genre" label="Gatunki (oddzielone przecinkami)" v-model="newMovie.genre" placeholder="Akcja, Sci-Fi, Dramat" />
        <CinemaInput id="releaseDate" label="Data premiery (YYYY-MM-DD)" v-model="newMovie.releaseDate" placeholder="np. 2024-01-01" />
        <CinemaInput id="posterUrl" label="Link do plakatu (URL)" v-model="newMovie.posterUrl" placeholder="https://..." />
        <CinemaInput id="trailerUrl" label="Link do zwiastuna (YouTube URL)" v-model="newMovie.trailerUrl" placeholder="https://www.youtube.com/watch?v=..." />
        
        <div class="full-width">
            <label for="description" class="desc-label">Opis</label>
            <textarea id="description" v-model="newMovie.description" placeholder="Krótki opis filmu..." rows="3"></textarea>
        </div>
        
        <div class="full-width">
          <CinemaButton type="submit">Dodaj Film</CinemaButton>
        </div>
      </form>
    </div>

    <div class="movie-list-section">
        <h3>Lista filmów</h3>
        
        <div v-if="loading" class="loading-state">Ładowanie filmów...</div>
        <div v-else class="movie-table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tytuł</th>
                        <th>Gatunki</th>
                        <th>Czas</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="movie in movies" :key="movie.id">
                        <td>{{ movie.id }}</td>
                        <td>{{ movie.title }}</td>
                        <td>{{ Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre }}</td>
                        <td>{{ movie.duration }} min</td>
                        <td>
                            <button class="small-btn delete-btn" @click="deleteMovie(movie.id)">Usuń</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>

<style scoped>
.admin-movies-view {
    padding: 20px 0;
}

.header h2 {
    color: #fbbf24;
    border-bottom: 2px solid #334155;
    padding-bottom: 10px;
}

.add-movie-section, .movie-list-section {
    background: #1e293b;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 30px;
}

h3 {
    color: #dc2626;
    margin-top: 0;
    border-bottom: 1px solid #334155;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.movie-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.full-width {
    grid-column: 1 / -1;
}

.desc-label {
    display: block;
    color: #d1d5db; 
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
}
textarea {
    width: 100%;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid #334155;
    background-color: rgba(2, 6, 23, 0.5); 
    color: white;
    font-size: 16px;
    transition: all 0.2s;
    box-sizing: border-box;
    font-family: inherit;
    resize: vertical;
}
textarea:focus {
    outline: none;
    border-color: #dc2626; 
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15); 
}

.movie-table-wrapper {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #334155;
    font-size: 14px;
}

th {
    background-color: #334155;
    color: #fbbf24;
    font-weight: 600;
    text-transform: uppercase;
}

tbody tr:hover {
    background-color: #2d3b4d;
}

.small-btn {
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    margin-right: 5px;
}
.delete-btn {
    background: #ef4444;
    color: white;
    border: none;
}
</style>