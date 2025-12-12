<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CinemaButton from '../components/CinemaButton.vue'
import CinemaHall from '../components/CinemaHall.vue' // <--- IMPORTUJEMY NOWY KOMPONENT

const route = useRoute()
const router = useRouter()
const notify = inject('notify')
const API_URL = 'http://localhost:3000/api'

// Dane
const movie = ref(null)
const showtimes = ref([])
const selectedShowtime = ref(null)
const selectedSeats = ref([]) 

onMounted(async () => {
  const movieId = route.params.movieId
  await fetchMovieDetails(movieId)
  await fetchShowtimes(movieId)
})

const fetchMovieDetails = async (id) => {
  try {
    const res = await fetch(`${API_URL}/movies/${id}`)
    if (res.ok) movie.value = await res.json()
  } catch (e) { console.error(e) }
}

const fetchShowtimes = async (id) => {
  try {
    const res = await fetch(`${API_URL}/showtimes?movieId=${id}`)
    if (res.ok) {
      showtimes.value = await res.json()
      if (showtimes.value.length > 0) selectShowtime(showtimes.value[0])
    }
  } catch (e) { console.error(e) }
}

const selectShowtime = (showtime) => {
  selectedShowtime.value = showtime
  selectedSeats.value = []
}

// Logika klikania w miejsce (uproszczona, bo CinemaHall daje nam gotowy obiekt seat)
const handleToggleSeat = (seat) => {
  if (seat.status === 'occupied') return

  if (selectedSeats.value.includes(seat.id)) {
    selectedSeats.value = selectedSeats.value.filter(id => id !== seat.id)
  } else {
    selectedSeats.value.push(seat.id)
  }
}

const totalPrice = computed(() => {
  if (!selectedShowtime.value) return 0
  return selectedSeats.value.length * selectedShowtime.value.price
})

const submitReservation = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    notify('Musisz być zalogowany, aby zarezerwować!', 'error')
    router.push('/login')
    return
  }
  
  const user = JSON.parse(userStr)

  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        showtimeId: selectedShowtime.value.id,
        seats: selectedSeats.value
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Błąd rezerwacji')

    notify('Rezerwacja udana! Miłego seansu.', 'success')
    router.push('/')

  } catch (error) {
    notify(error.message, 'error')
  }
}
</script>

<template>
  <div class="reservation-page">
    <div class="container" v-if="movie">
      
      <div class="movie-sidebar">
        <img :src="movie.posterUrl || 'https://via.placeholder.com/300x450'" class="poster">
        
        <div class="sidebar-content">
          <h1>{{ movie.title }}</h1>
          <p class="genre">{{ Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre }}</p>
          
          <div class="info-grid">
             <div class="info-item">
               <span class="label">Czas:</span>
               <span class="value">{{ movie.duration }} min</span>
             </div>
             <div class="info-item">
               <span class="label">Reżyser:</span>
               <span class="value">{{ movie.director }}</span>
             </div>
          </div>
        </div>
      </div>

      <div class="booking-area">
        
        <h3>Wybierz seans:</h3>
        <div class="showtimes-list">
          <button 
            v-for="st in showtimes" 
            :key="st.id"
            :class="['time-btn', { active: selectedShowtime?.id === st.id }]"
            @click="selectShowtime(st)"
          >
            <span class="time">{{ st.time }}</span>
            <span class="price-tag">{{ st.price }} zł</span>
          </button>
          <p v-if="showtimes.length === 0">Brak seansów dla tego filmu.</p>
        </div>

        <div v-if="selectedShowtime" class="hall-wrapper">
          <CinemaHall 
            :layout="selectedShowtime.seatsLayout"
            :selectedSeats="selectedSeats"
            @toggle-seat="handleToggleSeat"
          />

          <div class="summary-box">
            <div class="summary-info">
              <p>Miejsca: <span class="highlight">{{ selectedSeats.join(', ') || 'Brak' }}</span></p>
              <p>Razem: <span class="highlight total">{{ totalPrice }} PLN</span></p>
            </div>
            <div style="width: 200px">
              <CinemaButton 
                @click="submitReservation" 
                :disabled="selectedSeats.length === 0"
              >
                Rezerwuj
              </CinemaButton>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-page { min-height: 100vh; padding: 40px 20px; color: white; }

.container {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 320px 1fr; gap: 50px;
}

/* Sidebar */
.movie-sidebar {
  background: #1e293b; border-radius: 16px; overflow: hidden;
  border: 1px solid #334155; position: sticky; top: 20px; height: fit-content;
}
.poster { width: 100%; display: block; }
.sidebar-content { padding: 25px; }
.movie-sidebar h1 { font-size: 22px; margin: 0 0 10px 0; color: #fbbf24; line-height: 1.3; }
.movie-sidebar .genre { color: #94a3b8; margin-bottom: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
.info-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.info-item:last-child { border: none; }
.info-item .label { color: #64748b; }
.info-item .value { color: #e2e8f0; font-weight: 500; }

/* Seanse */
.showtimes-list { display: flex; gap: 12px; margin-bottom: 40px; flex-wrap: wrap; }
.time-btn {
  background: #0f172a; border: 1px solid #334155; color: white;
  padding: 12px 24px; border-radius: 12px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: all 0.2s; min-width: 100px;
}
.time-btn.active { background: #dc2626; border-color: #dc2626; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2); }
.time-btn:hover:not(.active) { background: #334155; border-color: #475569; }
.time { font-size: 18px; font-weight: bold; }
.price-tag { font-size: 13px; color: #94a3b8; }
.time-btn.active .price-tag { color: rgba(255,255,255,0.8); }

/* Podsumowanie */
.summary-box {
  margin-top: 30px; padding: 25px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;
  display: flex; justify-content: space-between; align-items: center;
}
.summary-info p { margin: 5px 0; color: #94a3b8; }
.highlight { color: white; font-weight: bold; }
.highlight.total { color: #fbbf24; font-size: 24px; margin-left: 10px; }

@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
  .movie-sidebar { position: static; display: flex; align-items: center; }
  .poster { width: 150px; height: 225px; object-fit: cover; }
  .sidebar-content { flex: 1; }
}
</style>