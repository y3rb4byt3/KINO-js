<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import MovieCard from '../components/MovieCard.vue'
import TrailerModal from '../components/TrailerModal.vue' // <--- IMPORT MODALA

const router = useRouter()
const API_URL = 'http://localhost:3000/api' 
const PLACEHOLDER_IMAGE = 'https://dummyimage.com/500x750/1e293b/ffffff&text=Brak+Plakatu'

const movies = ref([])
const error = ref(null)
const isLoading = ref(true)

// --- LOGIKA TRAILERA ---
const isTrailerOpen = ref(false)
const currentTrailerUrl = ref('')

const openTrailer = (url) => {
  currentTrailerUrl.value = url
  isTrailerOpen.value = true
}

const closeTrailer = () => {
  isTrailerOpen.value = false
  currentTrailerUrl.value = ''
}
// -----------------------

const fetchMovies = async () => {
  try {
    const response = await fetch(`${API_URL}/movies`)
    if (!response.ok) throw new Error(`Błąd sieci: ${response.status}`)
    
    const data = await response.json() 
    
    movies.value = data.map(movieFromDb => {
      let cleanGenre = 'Inne';
      if (Array.isArray(movieFromDb.genre)) {
        cleanGenre = movieFromDb.genre.join(', '); 
      } else if (movieFromDb.genre) {
        cleanGenre = movieFromDb.genre;
      }

      return {
        id: movieFromDb.id,
        title: movieFromDb.title,
        genre: cleanGenre, 
        rating: movieFromDb.rating || 0,
        desc: movieFromDb.description,
        image: movieFromDb.posterUrl ? movieFromDb.posterUrl : PLACEHOLDER_IMAGE,
        trailerUrl: movieFromDb.trailerUrl 
      }
    })
  } catch (err) {
    console.error("Błąd:", err)
    error.value = "Nie udało się połączyć z serwerem."
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMovies()
})

const handleBuyTicket = (movieId) => {
  router.push(`/reservation/${movieId}`)
}

// Filtrowanie (bez zmian)
const categories = ['Wszystkie', 'Akcja', 'Sci-Fi', 'Dramat', 'Animacja', 'Horror', 'Komedia']
const selectedCategory = ref('Wszystkie')
const categoryMapping = {
  'Akcja': ['action', 'adventure'],
  'Sci-Fi': ['sci-fi', 'science fiction'],
  'Dramat': ['drama'],
  'Animacja': ['animation'],
  'Horror': ['horror'],
  'Komedia': ['comedy']
}

const filteredMovies = computed(() => {
  if (selectedCategory.value === 'Wszystkie') return movies.value
  return movies.value.filter(movie => {
    if (!movie.genre) return false
    const movieGenreLower = movie.genre.toLowerCase()
    const searchTerms = categoryMapping[selectedCategory.value]
    if (!searchTerms) {
      return movieGenreLower.includes(selectedCategory.value.toLowerCase())
    }
    return searchTerms.some(term => movieGenreLower.includes(term))
  })
})
</script>

<template>
  <div class="home-page">
    <HeroSection />

    <section id="repertuar" class="movies-section">
      <div class="section-header">
        <h2>Repertuar</h2>
        <div v-if="isLoading" class="loading">Ładowanie filmów...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <CategoryFilter 
          :categories="categories" 
          :activeCategory="selectedCategory"
          @changeCategory="(cat) => selectedCategory = cat"
        />
      </div>

      <div class="movies-grid">
        <MovieCard 
          v-for="movie in filteredMovies" 
          :key="movie.id" 
          :movie="movie" 
          @buy-ticket="handleBuyTicket"
          @watch-trailer="openTrailer"
        />
        
        <p v-if="filteredMovies.length === 0 && !isLoading && !error" class="no-results">
            Brak filmów w kategorii: {{ selectedCategory }}
        </p>
      </div>
    </section>

    <TrailerModal 
      v-if="isTrailerOpen" 
      :url="currentTrailerUrl" 
      @close="closeTrailer"
    />

  </div>
</template>

<style scoped>
/* Style bez zmian */
.home-page { min-height: 100vh; }
.movies-section { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
.section-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; gap: 20px; }
.section-header h2 { font-size: 2rem; color: white; margin: 0; border-left: 5px solid #dc2626; padding-left: 15px; }
.movies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
.error-message { color: #ef4444; font-weight: bold; margin-top: 10px; }
.loading { color: #fbbf24; font-style: italic; }
.no-results { color: #94a3b8; grid-column: 1 / -1; text-align: center; padding: 40px; font-size: 1.1rem; }
@media (max-width: 768px) { .movies-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
</style>