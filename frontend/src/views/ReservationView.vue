<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = 'http://localhost:3000/api'
const router = useRouter()
const notify = inject('notify') // <--- Wstrzykujemy nasze powiadomienia

// Pobieranie danych z localStorage
const movieId = localStorage.getItem('selectedMovieId')
const movieTitle = localStorage.getItem('selectedMovieTitle')
const user = JSON.parse(localStorage.getItem('user'))

// Zmienne stanu
const showtimes = ref([])
const currentShowtime = ref(null)
const selectedSeats = ref([])
const rows = ['A','B','C','D','E','F','G','H','I','J']

// Walidacja dostępu
if (!user) {
    // Ponieważ setup uruchamia się przed zamontowaniem, tu notify może nie zadziałać idealnie,
    // ale router.push zadziała.
    router.push('/login')
}

if (!movieId) {
    router.push('/')
}

// 1. Pobieranie seansów
const loadShowtimes = async () => {
    try {
        const res = await fetch(`${API_URL}/showtimes?movieId=${movieId}`)
        showtimes.value = await res.json()
    } catch (e) {
        notify('Błąd pobierania seansów', 'error')
    }
}

// 2. Wybór godziny
const selectShowtime = (st) => {
    currentShowtime.value = st
    selectedSeats.value = [] // Resetujemy wybrane miejsca przy zmianie godziny
}

// 3. Sprawdzanie czy miejsce zajęte
const isOccupied = (seat) => {
    return currentShowtime.value.seatsLayout.occupiedSeats.includes(seat)
}

// 4. Klikanie w fotel
const toggleSeat = (seat) => {
    if (isOccupied(seat)) return // Nie można wybrać zajętego

    if (selectedSeats.value.includes(seat)) {
        // Jeśli już wybrany -> odznacz
        selectedSeats.value = selectedSeats.value.filter(s => s !== seat)
    } else {
        // Jeśli wolny -> zaznacz
        selectedSeats.value.push(seat)
    }
}

// 5. Finalizacja (Wysyłka do backendu)
const submitReservation = async () => {
    if (selectedSeats.value.length === 0) return

    const payload = {
        userId: user.id,
        showtimeId: currentShowtime.value.id,
        seats: selectedSeats.value
    }

    try {
        const res = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            // SUKCES: Używamy notify zamiast alert
            notify('Miejsce zarezerwowane! Dziękujemy.', 'success')
            router.push('/')
        } else {
            // BŁĄD BACKENDU:
            const err = await res.json()
            notify('Błąd rezerwacji: ' + (err.error || 'Nieznany błąd'), 'error')
        }
    } catch (e) {
        notify('Błąd połączenia z serwerem', 'error')
    }
}

onMounted(() => {
    if (user && movieId) {
        loadShowtimes()
    } else if (!user) {
        notify('Musisz być zalogowany, aby kupić bilet.', 'error')
    }
})
</script>

<template>
  <div class="container">
    <div class="sidebar"></div>
    <main>
        <h2>Rezerwacja filmu: {{ movieTitle }}</h2>
        
        <div v-if="!currentShowtime">
            <h3>Wybierz seans:</h3>
            
            <p v-if="showtimes.length === 0">Brak zaplanowanych seansów dla tego filmu.</p>
            
            <div class="showtimes-list">
                <button 
                    v-for="st in showtimes" 
                    :key="st.id" 
                    @click="selectShowtime(st)"
                    class="time-btn"
                >
                    {{ st.date }} | <strong>{{ st.time }}</strong> ({{ st.price }} PLN)
                </button>
            </div>
        </div>

        <div v-else>
             <button @click="currentShowtime = null" class="back-btn">&larr; Zmień godzinę</button>
             
             <div class="screen">EKRAN</div>

             <div class="seats-container">
                 <template v-for="row in rows" :key="row">
                     <div 
                        v-for="n in 10" 
                        :key="row + n" 
                        class="seat"
                        :class="{
                            'occupied': isOccupied(row + n), 
                            'selected': selectedSeats.includes(row + n)
                        }"
                        @click="toggleSeat(row + n)"
                     >
                          {{ row + n }}
                     </div>
                 </template>
             </div>

             <div class="summary-box">
                 <p v-if="selectedSeats.length > 0">
                    Wybrane miejsca: <strong>{{ selectedSeats.join(', ') }}</strong><br>
                    Do zapłaty: <strong>{{ selectedSeats.length * currentShowtime.price }} PLN</strong>
                 </p>
                 <p v-else>Wybierz miejsca na mapie sali.</p>

                 <button 
                    @click="submitReservation" 
                    class="action-btn buy-btn"
                    :disabled="selectedSeats.length === 0"
                 >
                    Kup i zapłać
                 </button>
             </div>
        </div>
    </main>
    <div class="sidebar"></div>
  </div>
</template>

<style scoped>
/* Lokalne style specyficzne tylko dla tego widoku */

.time-btn {
    margin: 5px;
    padding: 15px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
}
.time-btn:hover {
    background-color: #0056b3;
}

.back-btn {
    margin-bottom: 20px;
    padding: 5px 10px;
    cursor: pointer;
    background: transparent;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.screen {
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 5px;
    margin: 0 auto 20px auto;
    width: 80%;
    border-radius: 0 0 20px 20px;
    letter-spacing: 5px;
    font-size: 12px;
}

.summary-box {
    text-align: center;
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
}

.buy-btn {
    font-size: 18px;
    padding: 12px 30px;
    margin-top: 10px;
}
.buy-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>