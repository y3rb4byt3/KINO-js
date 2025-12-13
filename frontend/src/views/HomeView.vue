<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// Import Twoich komponentów
import HeroSection from '../components/HeroSection.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import MovieCard from '../components/MovieCard.vue'
import TrailerModal from '../components/TrailerModal.vue'

const router = useRouter()
const API_URL = 'http://localhost:3000/api'
const PLACEHOLDER_IMAGE = 'https://dummyimage.com/500x750/1e293b/ffffff&text=Brak+Plakatu'

// Stan danych
const movies = ref([])
const availableMovieIds = ref(new Set()) 
const error = ref(null)
const isLoading = ref(true)

// Stan filtrów
const categories = ['Wszystkie', 'Akcja', 'Sci-Fi', 'Dramat', 'Animacja', 'Horror', 'Komedia']
const selectedCategory = ref('Wszystkie')
const selectedDate = ref('2024-06-01') // Domyślna data
// Stan Modala
const isTrailerOpen = ref(false)
const currentTrailerUrl = ref('')

// --- 1. POBIERANIE FILMÓW ---
const fetchMovies = async () => {
  try {
    // 🔥 WAŻNE: Dodaję limit=100, żeby pobrać wszystkie filmy do filtrowania client-side
    // inaczej backend zwróciłby tylko 8 (domyślna paginacja)
    const response = await fetch(`${API_URL}/movies?limit=100`)
    if (!response.ok) throw new Error(`Błąd sieci: ${response.status}`)
    
    const data = await response.json()
    
    // Obsługa: backend zwraca { movies: [...], pagination: {...} } LUB samą tablicę [...]
    const rawMovies = data.movies || data 

    // Mapowanie danych pod Twój komponent MovieCard
    movies.value = rawMovies.map(m => ({
      id: m.id,
      title: m.title,
      // Obsługa genre (czy to tablica czy string)
      genre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre,
      rating: m.rating || 0,
      desc: m.description,
      // MovieCard spodziewa się propsa 'image', a backend daje 'posterUrl'
      image: m.posterUrl || PLACEHOLDER_IMAGE, 
      trailerUrl: m.trailerUrl 
    }))

  } catch (err) {
    console.error("Błąd filmów:", err)
    error.value = "Nie udało się pobrać filmów."
  }
}

// --- 2. POBIERANIE SEANSÓW (DLA DATY) ---
const fetchShowtimesForDate = async (date) => {
  try {
    isLoading.value = true
    // Pobieramy wszystkie seanse (jeśli backend nie filtruje po dacie)
    const response = await fetch(`${API_URL}/showtimes`)
    if (!response.ok) throw new Error('Błąd pobierania seansów')
    
    const allShowtimes = await response.json()
    
    // Filtrujemy JS-em te, które są w wybranym dniu
    const showtimesForDate = allShowtimes.filter(s => s.date === date)
    
    availableMovieIds.value = new Set(showtimesForDate.map(s => s.movieId))
    
  } catch (err) {
    console.error("Błąd seansów:", err)
    availableMovieIds.value = new Set() 
  } finally {
    isLoading.value = false
  }
}

// --- OBSŁUGA ZDARZEŃ ---
onMounted(async () => {
  await fetchMovies()
  await fetchShowtimesForDate(selectedDate.value)
})

watch(selectedDate, (newDate) => {
  fetchShowtimesForDate(newDate)
})

const openTrailer = (url) => {
  currentTrailerUrl.value = url
  isTrailerOpen.value = true
}

const handleBuyTicket = (movieId) => {
  router.push({ 
    path: `/reservation/${movieId}`,
    query: { date: selectedDate.value } 
  })
}

// --- FILTROWANIE ---
const filteredMovies = computed(() => {
  // 1. Data
  let result = movies.value.filter(movie => availableMovieIds.value.has(movie.id))

  // 2. Kategoria
  if (selectedCategory.value !== 'Wszystkie') {
    const term = selectedCategory.value.toLowerCase()
    
    // Prosta mapa dla polskich nazw kategorii
    const categoryMapping = {
      'Akcja': ['action', 'adventure', 'akcja'],
      'Sci-Fi': ['sci-fi', 'science fiction'],
      'Dramat': ['drama', 'dramat'],
      'Animacja': ['animation', 'animacja'],
      'Horror': ['horror'],
      'Komedia': ['comedy', 'komedia']
    }
    
    const searchTerms = categoryMapping[selectedCategory.value] || [term]

    result = result.filter(movie => {
      if (!movie.genre) return false
      const movieGenreLower = movie.genre.toLowerCase()
      return searchTerms.some(t => movieGenreLower.includes(t))
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
/* Style układu strony (nie komponentów) */
.home-page { min-height: 100vh; background-color: #0f172a; color: white; }
.movies-section { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }

.filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 20px;
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
    margin: 0; 
    border-left: 5px solid #fbbf24; 
    padding-left: 15px; 
    color: white;
}

/* Styl inputa daty */
.date-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1e293b;
    padding: 10px 15px;
    border-radius: 20px; /* Dopasowane do CategoryFilter zazwyczaj */
    border: 1px solid #334155;
}
.date-picker-wrapper label { color: #94a3b8; font-weight: 600; }
.cinema-date-input {
    background: transparent; border: none; color: white;
    font-size: 1rem; outline: none; cursor: pointer; font-family: inherit;
}
.cinema-date-input::-webkit-calendar-picker-indicator {
    filter: invert(1); cursor: pointer;
}

.movies-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
    gap: 30px; 
}

.no-results { grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8; }
.loading { color: #fbbf24; font-style: italic; }
.error-message { color: #ef4444; }

@media (max-width: 768px) { 
    .movies-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } 
    .filters-container { flex-direction: column; }
}
</style>