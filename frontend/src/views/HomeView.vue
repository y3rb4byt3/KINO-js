<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = 'http://localhost:3000/api'
const movies = ref([])
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))

// Filtry
const searchQuery = ref('')
const selectedGenre = ref('Wszystkie gatunki')
const sortOption = ref('Sortuj według')

// Stan Modala Trailera
const showModal = ref(false)
const trailerUrl = ref('')

const isAdmin = computed(() => user.value && user.value.role === 'admin')

// --- Pobieranie filmów ---
const loadMovies = async () => {
  try {
    const response = await fetch(`${API_URL}/movies`)
    const data = await response.json()
    // Poprawka gatunków (array vs string)
    movies.value = data.map(m => {
      let mainGenre = 'other'
      if (Array.isArray(m.genre) && m.genre.length > 0) mainGenre = m.genre[0]
      else if (typeof m.genre === 'string') mainGenre = m.genre.split(',')[0]
      
      return {
        ...m,
        mainGenre: mainGenre.toLowerCase(),
        displayGenre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre
      }
    })
  } catch (error) {
    console.error('Błąd pobierania filmów', error)
  }
}

// --- Filtrowanie i Sortowanie (Computed) ---
const filteredMovies = computed(() => {
  let result = movies.value

  // Szukanie
  if (searchQuery.value) {
    result = result.filter(m => m.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  // Gatunek
  if (selectedGenre.value !== 'Wszystkie gatunki') {
    result = result.filter(m => m.mainGenre.includes(selectedGenre.value.toLowerCase()))
  }
  // Sortowanie
  if (sortOption.value === 'newest') {
    result = [...result].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
  } else if (sortOption.value === 'oldest') {
    result = [...result].sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
  }
  
  return result
})

// --- Akcje ---
const deleteMovie = async (id) => {
    // Confirm systemowy zostawiamy, bo to zabezpieczenie przed przypadkowym klikiem.
    // Ale komunikat o sukcesie/błędzie zmieniamy na Toast.
    if(!confirm("Czy na pewno chcesz usunąć ten film?")) return
    
    try {
        await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' })
        loadMovies()
        notify('Film został usunięty.', 'success') // <--- NOWE
    } catch(e) { 
        notify('Nie udało się usunąć filmu.', 'error') // <--- NOWE
    }
}

const buyTicket = (movie) => {
  localStorage.setItem('selectedMovieId', movie.id)
  localStorage.setItem('selectedMovieTitle', movie.title)
  router.push('/reservation')
}

const openTrailer = (url) => {
  if (!url) return alert('Brak trailera')
  let embed = url
  if (url.includes('watch?v=')) embed = url.replace('watch?v=', 'embed/')
  trailerUrl.value = embed
  showModal.value = true
}

onMounted(() => {
  loadMovies()
  // Odśwież usera w razie przelogowania
  window.addEventListener('login-success', () => {
      user.value = JSON.parse(localStorage.getItem('user'))
  })
})
</script>

<template>
  <div class="container">
    <div class="sidebar"></div>
    <main>
      <h2>Repertuar</h2>
      
      <input v-model="searchQuery" type="text" placeholder="Szukaj filmów..." style="width: 100%; margin-bottom: 10px; padding: 5px;">
      
      <select v-model="selectedGenre" style="width: 100%; margin-bottom: 10px; padding: 5px;">
        <option>Wszystkie gatunki</option>
        <option value="sci-fi">Sci-Fi</option>
        <option value="action">Akcja</option>
        <option value="drama">Dramat</option>
        <option value="comedy">Komedia</option>
      </select>

      <select v-model="sortOption" style="width: 100%; margin-bottom: 10px; padding: 5px;">
        <option>Sortuj według</option>
        <option value="newest">Najnowsze</option>
        <option value="oldest">Najstarsze</option>
      </select>

      <div id="movies">
        <div v-for="movie in filteredMovies" :key="movie.id" class="movie">
          <img :src="movie.posterUrl" :alt="movie.title">
          <div class="movie-details">
            <h3>{{ movie.title }}</h3>
            <p>{{ movie.description }}</p>
            <p><strong>Reżyser:</strong> {{ movie.director }}</p>
            <p><strong>Gatunek:</strong> {{ movie.displayGenre }}</p>
            <p><strong>Czas:</strong> {{ movie.duration }} min</p>
            
            <div class="movie-buttons">
              <button @click="buyTicket(movie)">Kup Bilet</button>
              <button @click="openTrailer(movie.trailerUrl)">Trailer</button>
              <button v-if="isAdmin" class="delete-btn" @click="deleteMovie(movie.id)">Usuń</button>
            </div>
          </div>
        </div>
        <p v-if="filteredMovies.length === 0">Nie znaleziono filmów.</p>
      </div>
    </main>
    <div class="sidebar"></div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <span class="close-button" @click="showModal = false">&times;</span>
        <div style="position: relative; padding-bottom: 56.25%; height: 0;">
           <iframe 
             :src="trailerUrl + '?autoplay=1'" 
             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
             allowfullscreen>
           </iframe>
        </div>
      </div>
    </div>
  </div>
</template>