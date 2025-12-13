<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = 'http://localhost:3000/api'

const user = ref(null)
const reservations = ref([])
const loading = ref(true)

// --- LOGIKA ---
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('logout-success')) 
  router.push('/login')
}

const cancelReservation = async (reservationId) => {
  if(!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      reservations.value = reservations.value.filter(r => r.id !== reservationId)
    } else {
      alert('Nie udało się anulować.')
    }
  } catch (err) { console.error(err) }
}

onMounted(async () => {
  const userData = localStorage.getItem('user')
  const token = localStorage.getItem('token')

  if (!userData || !token) {
    router.push('/login')
    return
  }

  user.value = JSON.parse(userData)

  try {
    const response = await fetch(`${API_URL}/reservations/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) reservations.value = await response.json()
  } catch (err) { console.error(err) } 
  finally { loading.value = false }
})
</script>

<template>
  <div class="profile-page-wrapper">
    <div class="profile-content-container">
        
        <h1 class="profile-title">Mój Profil</h1>

        <div v-if="user" class="user-info-box">
            <div class="user-data-group">
                <div class="user-avatar-circle">👤</div>
                <div class="user-text-details">
                    <h2>{{ user.firstName || 'Twój Profil' }}</h2>
                    <p>{{ user.email }}</p>
                </div>
            </div>
            <button @click="handleLogout" class="btn-logout-action">Wyloguj</button>
        </div>

        <div class="tickets-section-wrapper">
            <h3>Twoje Bilety</h3>

            <div v-if="loading" class="status-msg">Ładowanie...</div>
            <div v-else-if="reservations.length === 0" class="status-msg">
                Brak biletów. <RouterLink to="/" class="link-highlight">Kup bilet</RouterLink>
            </div>

            <div v-else class="tickets-vertical-list">
                <div v-for="res in reservations" :key="res.id" class="single-ticket-card">
                    
                    <div class="ticket-poster-area">
                        <img :src="res.movie?.posterUrl || 'https://via.placeholder.com/100'" alt="Plakat">
                    </div>
                    
                    <div class="ticket-info-area">
                        <h4>{{ res.movie?.title }}</h4>
                        <div class="ticket-meta">
                            <span>📅 {{ res.showtime?.date }}</span>
                            <span>🕒 {{ res.showtime?.time }}</span>
                        </div>
                        <p class="ticket-seats">Miejsca: <strong>{{ res.seats.join(', ') }}</strong></p>
                    </div>

                    <div class="ticket-actions-area">
                        <div class="ticket-price">{{ res.totalPrice }} zł</div>
                        <button @click="cancelReservation(res.id)" class="btn-cancel-action">Anuluj</button>
                    </div>

                </div>
            </div>
        </div>

    </div>
  </div>
</template>

<style scoped>
/* Reset podstawowy dla tego komponentu */
* { box-sizing: border-box; }

.profile-page-wrapper {
    background-color: #0f172a;
    min-height: 100vh;
    padding: 40px 20px;
    color: white;
    width: 100%;
}

/* GŁÓWNY KONTENER - Wymuszamy układ pionowy (column) */
.profile-content-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;            /* Flexbox */
    flex-direction: column;   /* Układ PIONOWY (jedno pod drugim) */
    gap: 40px;                /* Odstępy między sekcjami */
}

.profile-title {
    text-align: center;
    color: #fbbf24;
    margin: 0;
    font-size: 2rem;
}

/* --- KARTA UŻYTKOWNIKA --- */
.user-info-box {
    background: #1e293b;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #334155;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%; /* Rozciągnij na całą szerokość */
    flex-wrap: wrap; /* Pozwól na zawijanie na małych ekranach */
    gap: 20px;
}

.user-data-group {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-avatar-circle {
    font-size: 2rem;
    background: #334155;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
}

.user-text-details h2 { margin: 0; font-size: 1.1rem; color: white; }
.user-text-details p { margin: 0; color: #94a3b8; font-size: 0.9rem; }

.btn-logout-action {
    background: #dc2626;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    font-weight: bold;
}

/* --- LISTA BILETÓW --- */
.tickets-section-wrapper h3 {
    border-bottom: 1px solid #334155;
    padding-bottom: 10px;
    margin-bottom: 20px;
    color: #cbd5e1;
}

.tickets-vertical-list {
    display: flex;
    flex-direction: column; /* Lista pionowa */
    gap: 20px;
}

/* KARTA BILETU (GRID) */
.single-ticket-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 15px;
    
    display: grid;
    /* 3 kolumny: Obrazek (70px), Treść (reszta), Akcje (auto) */
    grid-template-columns: 70px 1fr auto; 
    gap: 20px;
    align-items: center;
    width: 100%;
}

.ticket-poster-area img {
    width: 70px;
    height: 100px;
    object-fit: cover;
    border-radius: 6px;
    display: block;
}

.ticket-info-area h4 { margin: 0 0 8px 0; color: #fbbf24; font-size: 1.1rem; }
.ticket-meta { display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.9rem; color: #cbd5e1; margin-bottom: 8px; }
.ticket-seats { margin: 0; color: white; font-size: 0.95rem; }

.ticket-actions-area {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    min-width: 80px;
}

.ticket-price { font-size: 1.2rem; font-weight: bold; color: #10b981; }

.btn-cancel-action {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: 0.2s;
}
.btn-cancel-action:hover { background: #ef4444; color: white; }

.status-msg { text-align: center; color: #64748b; padding: 20px; }
.link-highlight { color: #fbbf24; }

/* RESPONSYWNOŚĆ */
@media (max-width: 600px) {
    .single-ticket-card {
        grid-template-columns: 1fr; /* Jedna kolumna na telefonie */
        text-align: center;
        gap: 15px;
    }
    
    .ticket-poster-area { margin: 0 auto; }
    
    .ticket-meta { justify-content: center; }

    .ticket-actions-area {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        border-top: 1px solid #334155;
        padding-top: 10px;
    }
}
</style>