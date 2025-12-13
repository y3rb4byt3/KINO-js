<script setup>
import { ref, onMounted, computed, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CinemaButton from '../components/CinemaButton.vue'
import CinemaHall from '../components/CinemaHall.vue'

const route = useRoute()
const router = useRouter()
const notify = inject('notify') // Zakładam, że masz plugin do powiadomień
const API_URL = 'http://localhost:3000/api'

// Dane
const movie = ref(null)
const showtimes = ref([])
const selectedShowtime = ref(null)
const selectedSeats = ref([]) 
const loading = ref(true)

// Pobieranie danych przy wejściu
onMounted(async () => {
  const movieId = route.params.movieId
  const queryDate = route.query.date || new Date().toISOString().split('T')[0]

  try {
    // Pobieramy film i seanse równolegle
    const [movieRes, showtimesRes] = await Promise.all([
      fetch(`${API_URL}/movies/${movieId}`),
      fetch(`${API_URL}/showtimes?movieId=${movieId}&date=${queryDate}`)
    ])

    if (movieRes.ok) movie.value = await movieRes.json()
    if (showtimesRes.ok) {
        showtimes.value = await showtimesRes.json()
        if (showtimes.value.length > 0) selectShowtime(showtimes.value[0])
    }
  } catch (e) {
    console.error(e)
    if (notify) notify('Błąd pobierania danych.', 'error')
  } finally {
    loading.value = false
  }
})

// Wybór godziny seansu
const selectShowtime = async (showtime) => {
  selectedShowtime.value = showtime
  selectedSeats.value = [] // Reset wyboru miejsc przy zmianie godziny
  
  // Przewiń płynnie do sali kinowej
  await nextTick()
  const hallElement = document.getElementById('hall-section')
  if (hallElement) {
    hallElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Obsługa kliknięcia w miejsce (odbierana z CinemaHall)
const handleToggleSeat = (seat) => {
  // Jeśli miejsce zajęte, CinemaHall i tak nie wyemituje zdarzenia, ale dla pewności:
  if (seat.status === 'occupied') return

  if (selectedSeats.value.includes(seat.id)) {
    selectedSeats.value = selectedSeats.value.filter(id => id !== seat.id)
  } else {
    selectedSeats.value.push(seat.id)
  }
}

// Obliczanie ceny
const totalPrice = computed(() => {
  if (!selectedShowtime.value) return 0
  return selectedSeats.value.length * selectedShowtime.value.price
})

// Wysyłanie rezerwacji
const submitReservation = async () => {
  const userStr = localStorage.getItem('user')
  const token = localStorage.getItem('token')

  if (!userStr || !token) {
    if (notify) notify('Musisz być zalogowany!', 'error')
    router.push('/login')
    return
  }
  
  const user = JSON.parse(userStr)

  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        // userId: user.id, // Backend bierze ID z tokena, nie trzeba wysyłać
        showtimeId: selectedShowtime.value.id,
        seats: selectedSeats.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
        // Obsługa wygasłego tokena
        if (response.status === 401 || response.status === 403) {
             localStorage.removeItem('token')
             localStorage.removeItem('user')
             if (notify) notify('Sesja wygasła. Zaloguj się ponownie.', 'error')
             router.push('/login')
             return
        }
        throw new Error(data.error || 'Błąd rezerwacji')
    }

    if (notify) notify('Rezerwacja udana! Miłego seansu.', 'success')
    router.push('/profile') // Przekierowanie do profilu

  } catch (error) {
    if (notify) notify(error.message, 'error')
  }
}
</script>

<template>
  <div class="reservation-page">
    <div class="container" v-if="movie">
      
      <div class="movie-sidebar">
        <img :src="movie.posterUrl || 'https://dummyimage.com/300x450/1e293b/fff'" class="poster">
        
        <div class="sidebar-content">
          <h1>{{ movie.title }}</h1>
          <p class="genre">{{ Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre }}</p>
          
          <div class="info-grid">
             <div class="info-item">
               <span class="label">Czas:</span>
               <span class="value">{{ movie.duration || 'N/A' }} min</span>
             </div>
             <div class="info-item">
               <span class="label">Reżyser:</span>
               <span class="value">{{ movie.director }}</span>
             </div>
          </div>
        </div>
      </div>

      <div class="booking-area">
        
        <h3>Wybierz godzinę:</h3>
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
          <p v-if="showtimes.length === 0" class="no-data">Brak seansów w tym dniu.</p>
        </div>

        <div v-if="selectedShowtime" id="hall-section" class="hall-wrapper">
          
          <div class="screen-container">
            <div class="screen">EKRAN</div>
            <div class="screen-glow"></div>
          </div>

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
    
    <div v-else-if="loading" class="loading">Ładowanie danych...</div>
  </div>
</template>

<style scoped>
.reservation-page { min-height: 100vh; padding: 40px 20px; color: white; background-color: #0f172a; }

.container {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 320px 1fr; gap: 50px;
}

/* Sidebar */
.movie-sidebar {
  background: #1e293b; border-radius: 16px; overflow: hidden;
  border: 1px solid #334155; position: sticky; top: 20px; height: fit-content;
}
.poster { width: 100%; display: block; height: 450px; object-fit: cover; }
.sidebar-content { padding: 25px; }
.movie-sidebar h1 { font-size: 22px; margin: 0 0 10px 0; color: #fbbf24; line-height: 1.3; }
.movie-sidebar .genre { color: #94a3b8; margin-bottom: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
.info-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.info-item:last-child { border: none; }
.info-item .label { color: #64748b; }
.info-item .value { color: #e2e8f0; font-weight: 500; }

/* Seanse */
.booking-area h3 { color: #fbbf24; margin-bottom: 15px; }
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
.no-data { color: #94a3b8; font-style: italic; }

/* Wrapper Sali */
.hall-wrapper {
  margin-top: 20px;
  animation: fadeIn 0.5s ease-out;
}

/* --- STYLIZACJA EKRANU --- */
.screen-container {
  perspective: 1000px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.screen {
  background: #cbd5e1;
  height: 40px;
  width: 70%;
  border-radius: 10px;
  transform: rotateX(-15deg) scale(0.9);
  box-shadow: 0 20px 40px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 12px;
  text-transform: uppercase;
  padding-left: 12px; 
}

.screen-glow {
  width: 60%;
  height: 20px;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  margin-top: -10px;
  transform: perspective(500px) rotateX(20deg);
}

/* Podsumowanie */
.summary-box {
  margin-top: 30px; padding: 25px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;
  display: flex; justify-content: space-between; align-items: center;
}
.summary-info p { margin: 5px 0; color: #94a3b8; }
.highlight { color: white; font-weight: bold; }
.highlight.total { color: #fbbf24; font-size: 24px; margin-left: 10px; }

.loading { text-align: center; font-size: 1.2rem; color: #fbbf24; padding: 50px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .container { grid-template-columns: 1fr; }
  .movie-sidebar { position: static; display: flex; align-items: center; height: auto; }
  .poster { width: 150px; height: 225px; }
  .sidebar-content { flex: 1; }
  .summary-box { flex-direction: column; gap: 20px; text-align: center; }
}
</style>