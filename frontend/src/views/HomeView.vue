<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import MovieCard from '../components/MovieCard.vue'
import TrailerModal from '../components/TrailerModal.vue'

const router = useRouter()
const API_URL = 'http://localhost:3000/api' 
const PLACEHOLDER_IMAGE = 'https://dummyimage.com/500x750/1e293b/ffffff&text=Brak+Plakatu'

// Stan danych
const movies = ref([])
const availableMovieIds = ref(new Set()) // Zbiór ID filmów dostępnych w wybranym dniu
const error = ref(null)
const isLoading = ref(true)

// Stan filtrów
const categories = ['Wszystkie', 'Akcja', 'Sci-Fi', 'Dramat', 'Animacja', 'Horror', 'Komedia']
const selectedCategory = ref('Wszystkie')
// Domyślna data to dzisiaj (format YYYY-MM-DD)
const selectedDate = ref('2024-06-01')

// Stan Modala
const isTrailerOpen = ref(false)
const currentTrailerUrl = ref('')

// --- POBIERANIE FILMÓW (LISTA BAZOWA) ---
const fetchMovies = async () => {
  try {
    const response = await fetch(`${API_URL}/movies`)
    if (!response.ok) throw new Error(`Błąd sieci: ${response.status}`)
    const data = await response.json() 
    
    movies.value = data.map(m => ({
      id: m.id,
      title: m.title,
      genre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre,
      rating: m.rating || 0,
      desc: m.description,
      image: m.posterUrl || PLACEHOLDER_IMAGE,
      trailerUrl: m.trailerUrl 
    }))
  } catch (err) {
    console.error("Błąd filmów:", err)
    error.value = "Nie udało się pobrać filmów."
  }
}

// --- POBIERANIE DOSTĘPNOŚCI (SEANSE NA DANY DZIEŃ) ---
const fetchShowtimesForDate = async (date) => {
  try {
    isLoading.value = true
    // Twój backend obsługuje filtrowanie po dacie: /api/showtimes?date=YYYY-MM-DD
    const response = await fetch(`${API_URL}/showtimes?date=${date}`)
    if (!response.ok) throw new Error('Błąd pobierania seansów')
    
    const showtimes = await response.json()
    
    // Wyciągamy unikalne ID filmów, które mają seans tego dnia
    // Set automatycznie usuwa duplikaty
    availableMovieIds.value = new Set(showtimes.map(s => s.movieId))
    
  } catch (err) {
    console.error("Błąd seansów:", err)
    // W razie błędu nie blokujemy wszystkiego, ale możemy pokazać pustą listę
    availableMovieIds.value = new Set() 
  } finally {
    isLoading.value = false
  }
}

// --- OBSŁUGA ZMIAN ---
onMounted(async () => {
  await fetchMovies()
  await fetchShowtimesForDate(selectedDate.value)
})

// Obserwuj zmianę daty i pobieraj nowe seanse
watch(selectedDate, (newDate) => {
  fetchShowtimesForDate(newDate)
})

const openTrailer = (url) => {
  currentTrailerUrl.value = url
  isTrailerOpen.value = true
}

const handleBuyTicket = (movieId) => {
  // Przekazujemy wybraną datę w URL, żeby strona rezerwacji wiedziała, jaki dzień ustawić
  router.push({ 
    path: `/reservation/${movieId}`,
    query: { date: selectedDate.value } 
  })
}

// --- LOGIKA FILTROWANIA (KATEGORIA + DATA) ---
const filteredMovies = computed(() => {
  // 1. Najpierw filtrujemy po dacie (czy film jest na liście dostępnych ID)
  let result = movies.value.filter(movie => availableMovieIds.value.has(movie.id))

  // 2. Potem filtrujemy po kategorii (jeśli wybrana inna niż Wszystkie)
  if (selectedCategory.value !== 'Wszystkie') {
    const categoryMapping = {
      'Akcja': ['action', 'adventure'],
      'Sci-Fi': ['sci-fi', 'science fiction'],
      'Dramat': ['drama'],
      'Animacja': ['animation'],
      'Horror': ['horror'],
      'Komedia': ['comedy']
    }
    
    result = result.filter(movie => {
      if (!movie.genre) return false
      const movieGenreLower = movie.genre.toLowerCase()
      const searchTerms = categoryMapping[selectedCategory.value]
      
      if (!searchTerms) return movieGenreLower.includes(selectedCategory.value.toLowerCase())
      return searchTerms.some(term => movieGenreLower.includes(term))
    })
  }
  
  return result
})
</script>

<template>
  <div class="home-page">
    <HeroSection />

    <section id="repertuar" class="movies-section">
      <div class="section-header">
        <h2>Repertuar</h2>
        
        <div class="filters-container">
            <CategoryFilter 
            :categories="categories" 
            :activeCategory="selectedCategory"
            @changeCategory="(cat) => selectedCategory = cat"
            />

            <div class="date-picker-wrapper">
                <label for="date-select">Wybierz dzień:</label>
                <input 
                    id="date-select"
                    type="date" 
                    v-model="selectedDate"
                    class="cinema-date-input"
                >
            </div>
        </div>

        <div v-if="isLoading" class="loading">Sprawdzam repertuar...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <div class="movies-grid">
        <MovieCard 
          v-for="movie in filteredMovies" 
          :key="movie.id" 
          :movie="movie" 
          @buy-ticket="handleBuyTicket"
          @watch-trailer="openTrailer"
        />
        
        <div v-if="filteredMovies.length === 0 && !isLoading" class="no-results">
            <h3>Brak seansów w dniu {{ selectedDate }}</h3>
            <p>Spróbuj wybrać inną datę lub kategorię.</p>
        </div>
      </div>
    </section>

    <TrailerModal 
      v-if="isTrailerOpen" 
      :url="currentTrailerUrl" 
      @close="isTrailerOpen = false"
    />
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; }
.movies-section { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }

/* Nowy kontener dla filtrów */
.filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.section-header { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    margin-bottom: 40px; 
    gap: 20px; 
}
.section-header h2 { 
    font-size: 2rem; 
    color: white; 
    margin: 0; 
    border-left: 5px solid #dc2626; 
    padding-left: 15px; 
}

/* Stylizacja Kalendarza */
.date-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1e293b;
    padding: 10px 15px;
    border-radius: 8px;
    border: 1px solid #334155;
}

.date-picker-wrapper label {
    color: #94a3b8;
    font-weight: 600;
}

.cinema-date-input {
    background: transparent;
    border: none;
    color: white;
    font-family: inherit;
    font-size: 1rem;
    outline: none;
    cursor: pointer;
}

/* Ikona kalendarza w input type="date" (tylko dla Chrome/Edge) */
.cinema-date-input::-webkit-calendar-picker-indicator {
    filter: invert(1); /* Zmienia kolor ikony na biały */
    cursor: pointer;
}

.movies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
.error-message { color: #ef4444; font-weight: bold; }
.loading { color: #fbbf24; font-style: italic; }
.no-results { color: #94a3b8; grid-column: 1 / -1; text-align: center; padding: 40px; }
.no-results h3 { color: white; margin-bottom: 10px; }

@media (max-width: 768px) { 
    .movies-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } 
    .filters-container { flex-direction: column; }
}
</style>