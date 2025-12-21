<script setup>
import { ref, onMounted, inject } from 'vue'
import CinemaButton from '../components/CinemaButton.vue'
import CinemaInput from '../components/CinemaInput.vue'

const notify = inject('notify')
const API_URL = 'http://localhost:3000/api'
const token = localStorage.getItem('token')

const movies = ref([])
const activeMovieId = ref(null) 
const activeMovieShowtimes = ref([]) 

// Generujemy listę godzin co 1h (od 09:00 do 23:00)
const availableHours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", 
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
]

const newShowtime = ref({
    date: '',
    time: '18:00', // Domyślna godzina
    price: 25
})

// 1. Pobierz listę filmów
const fetchMovies = async () => {
    try {
        const res = await fetch(`${API_URL}/movies?limit=100`)
        const data = await res.json()
        movies.value = data.movies || data
    } catch (e) {
        console.error(e)
    }
}

// 2. Otwórz panel zarządzania
const manageShowtimes = async (movie) => {
    if (activeMovieId.value === movie.id) {
        activeMovieId.value = null
        return
    }
    activeMovieId.value = movie.id
    await fetchShowtimes(movie.id)
}

// 3. Pobierz seanse
const fetchShowtimes = async (movieId) => {
    try {
        const res = await fetch(`${API_URL}/showtimes/movie/${movieId}`)
        const data = await res.json()
        activeMovieShowtimes.value = data.showtimes
    } catch (e) {
        if(notify) notify('Błąd pobierania seansów', 'error')
    }
}

// 4. Dodaj seans
const addShowtime = async () => {
    if (!newShowtime.value.date || !newShowtime.value.time) {
        if(notify) notify('Wybierz datę i godzinę', 'error')
        return
    }

    try {
        const res = await fetch(`${API_URL}/showtimes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                movieId: activeMovieId.value,
                ...newShowtime.value
            })
        })

        if (!res.ok) throw new Error('Błąd zapisu')

        if(notify) notify('Seans dodany!', 'success')
        await fetchShowtimes(activeMovieId.value)
    } catch (e) {
        if(notify) notify('Nie udało się dodać seansu', 'error')
    }
}

// 5. Usuń seans
const deleteShowtime = async (showtimeId) => {
    if(!confirm('Czy na pewno usunąć ten seans?')) return

    try {
        const res = await fetch(`${API_URL}/showtimes/${showtimeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (res.ok) {
            if(notify) notify('Seans usunięty', 'success')
            await fetchShowtimes(activeMovieId.value)
        }
    } catch (e) {
        if(notify) notify('Błąd usuwania', 'error')
    }
}

onMounted(fetchMovies)
</script>

<template>
  <div class="admin-showtimes">
    <h2>📅 Zarządzanie Seansami</h2>
    <p class="hint">Kliknij "Zarządzaj", aby dodać lub usunąć godziny seansów dla danego filmu.</p>

    <div class="movies-list">
        <div v-for="movie in movies" :key="movie.id" class="movie-row">
            
            <div class="movie-header">
                <div class="movie-info">
                    <span class="movie-title">🎬 {{ movie.title }}</span>
                    <span class="movie-meta">{{ movie.duration }} min | {{ Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre }}</span>
                </div>
                <button 
                    class="toggle-btn" 
                    :class="{ active: activeMovieId === movie.id }"
                    @click="manageShowtimes(movie)"
                >
                    {{ activeMovieId === movie.id ? 'Zamknij' : 'Zarządzaj' }}
                </button>
            </div>

            <div v-if="activeMovieId === movie.id" class="management-panel">
                
                <div class="panel-content">
                    <div class="add-form-card">
                        <h4>Dodaj nowy termin</h4>
                        <div class="form-grid">
                            
                            <div class="form-group">
                                <CinemaInput type="date" v-model="newShowtime.date" label="Data seansu" />
                            </div>

                            <div class="form-group">
                                <label class="custom-label">Godzina</label>
                                <select v-model="newShowtime.time" class="custom-select">
                                    <option v-for="hour in availableHours" :key="hour" :value="hour">
                                        {{ hour }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <CinemaInput type="number" v-model="newShowtime.price" label="Cena biletu (zł)" placeholder="np. 25" />
                            </div>

                            <div class="form-group btn-group">
                                <CinemaButton @click="addShowtime">➕ Dodaj</CinemaButton>
                            </div>
                        </div>
                    </div>

                    <div class="existing-showtimes">
                        <h4>Zaplanowane seanse:</h4>
                        <div v-if="activeMovieShowtimes.length === 0" class="empty">Brak zaplanowanych seansów.</div>
                        
                        <div class="showtimes-grid">
                            <div v-for="st in activeMovieShowtimes" :key="st.id" class="showtime-chip">
                                <div class="chip-info">
                                    <span class="st-date">📅 {{ st.date }}</span>
                                    <span class="st-time">⏰ {{ st.time }}</span>
                                    <span class="st-price">💵 {{ st.price }} zł</span>
                                </div>
                                <button class="st-delete" @click="deleteShowtime(st.id)" title="Usuń seans">×</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
  </div>
</template>

<style scoped>
.admin-showtimes { padding: 20px 0; color: white; }
.hint { color: #94a3b8; margin-bottom: 30px; }

/* Lista Filmów */
.movie-row {
    background: #1e293b;
    margin-bottom: 20px;
    border-radius: 12px;
    border: 1px solid #334155;
    overflow: hidden;
    transition: all 0.3s;
}

.movie-header {
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1e293b;
}

.movie-info { display: flex; flex-direction: column; }
.movie-title { font-weight: bold; font-size: 1.2rem; color: #fbbf24; margin-bottom: 4px; }
.movie-meta { font-size: 0.9rem; color: #94a3b8; }

.toggle-btn {
    background: #334155; color: white; border: 1px solid #475569; 
    padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 600;
}
.toggle-btn:hover { background: #475569; color: #fbbf24; }
.toggle-btn.active { background: #dc2626; border-color: #dc2626; color: white; }

/* Panel Wewnętrzny */
.management-panel {
    background: #0f172a;
    border-top: 1px solid #334155;
    animation: fadeIn 0.3s ease-out;
}

.panel-content { padding: 30px; }

/* Karta formularza */
.add-form-card {
    background: rgba(30, 41, 59, 0.5);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #334155;
    margin-bottom: 30px;
}

.add-form-card h4 { margin-top: 0; color: #cbd5e1; margin-bottom: 15px; }

/* GRID FORMULARZA - TO NAPRAWIA CIASNOTĘ */
.form-grid {
    display: grid;
    /* 4 kolumny: Data, Godzina, Cena, Przycisk */
    grid-template-columns: 2fr 1.5fr 1fr 1fr; 
    gap: 20px;
    align-items: end; /* Wyrównanie do dołu, żeby inputy i przycisk były w linii */
}

/* Własny styl dla selecta (Godzina) */
.custom-label {
    display: block; color: #d1d5db; margin-bottom: 8px; font-size: 14px; font-weight: 500;
}
.custom-select {
    width: 100%; height: 48px; padding: 0 15px;
    background-color: rgba(2, 6, 23, 0.5);
    border: 1px solid #334155; border-radius: 12px;
    color: white; font-size: 16px; outline: none; cursor: pointer;
    transition: 0.2s;
}
.custom-select:focus { border-color: #dc2626; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15); }

.btn-group { padding-bottom: 15px; /* drobna korekta wyrównania */ }

/* Lista seansów */
.existing-showtimes h4 { margin-bottom: 15px; color: #cbd5e1; }
.showtimes-grid { display: flex; flex-wrap: wrap; gap: 15px; }

.showtime-chip {
    background: #1e293b; padding: 10px 15px; border-radius: 12px; 
    display: flex; align-items: center; justify-content: space-between; gap: 15px;
    border: 1px solid #475569; min-width: 250px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

.chip-info { display: flex; gap: 15px; align-items: center; flex: 1; }
.st-date { color: #94a3b8; font-size: 0.9rem; }
.st-time { color: white; font-weight: bold; font-size: 1.1rem; }
.st-price { color: #10b981; font-weight: 600; margin-left: auto; }

.st-delete {
    background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; 
    color: #ef4444; width: 30px; height: 30px; border-radius: 50%; 
    cursor: pointer; display: flex; align-items: center; justify-content: center; 
    font-size: 1.2rem; transition: 0.2s;
}
.st-delete:hover { background: #ef4444; color: white; transform: scale(1.1); }

.empty { color: #64748b; font-style: italic; padding: 20px; text-align: center; border: 1px dashed #334155; border-radius: 12px; }

@keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
}

/* Responsywność formularza */
@media (max-width: 900px) {
    .form-grid { grid-template-columns: 1fr 1fr; } /* 2 kolumny na tabletach */
}
@media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; } /* 1 kolumna na telefonach */
    .showtime-chip { width: 100%; }
}
</style>