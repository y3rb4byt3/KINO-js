<script setup>
import { ref, onMounted, inject } from 'vue'

const notify = inject('notify')
const API_URL = 'http://localhost:3000/api'
const token = localStorage.getItem('token')

const reservations = ref([])
const loading = ref(true)

// 1. Pobierz wszystkie rezerwacje
const fetchReservations = async () => {
  try {
    const res = await fetch(`${API_URL}/reservations/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!res.ok) throw new Error('Błąd pobierania')
    
    reservations.value = await res.json()
  } catch (e) {
    if(notify) notify('Nie udało się pobrać rezerwacji', 'error')
  } finally {
    loading.value = false
  }
}

// 2. Anuluj rezerwację
const cancelReservation = async (id) => {
  if (!confirm('Czy na pewno anulować tę rezerwację?')) return

  try {
    const res = await fetch(`${API_URL}/reservations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      if(notify) notify('Rezerwacja anulowana', 'success')
      reservations.value = reservations.value.filter(r => r.id !== id)
    } else {
      throw new Error('Błąd usuwania')
    }
  } catch (e) {
    if(notify) notify('Błąd podczas anulowania', 'error')
  }
}

onMounted(fetchReservations)
</script>

<template>
  <div class="admin-reservations">
    <h2>🎫 Wszystkie Rezerwacje</h2>
    
    <div v-if="loading" class="loading">Ładowanie...</div>
    
    <div v-else class="table-wrapper">
      <table v-if="reservations.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Klient</th>
            <th>Film</th>
            <th>Data</th>
            <th>Miejsca</th>
            <th>Kwota</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in reservations" :key="res.id">
            <td>#{{ res.id }}</td>
            <td>
              <div class="user-info">
                <strong>{{ res.user?.firstName }} {{ res.user?.lastName }}</strong>
                <span>{{ res.user?.email }}</span>
              </div>
            </td>
            <td>{{ res.movie?.title || 'Usunięty film' }}</td>
            <td>{{ res.showtime?.date }} <br> <small>{{ res.showtime?.time }}</small></td>
            <td>
               {{ Array.isArray(res.seats) ? res.seats.join(', ') : res.seats }}
            </td>
            <td class="price">{{ res.totalPrice }} zł</td>
            <td>
              <button class="cancel-btn" @click="cancelReservation(res.id)">Anuluj</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">Brak rezerwacji w systemie.</div>
    </div>
  </div>
</template>

<style scoped>
.admin-reservations { padding: 20px 0; color: white; }
h2 { color: #6366f1; border-bottom: 2px solid #334155; padding-bottom: 10px; }

.table-wrapper { overflow-x: auto; background: #1e293b; border-radius: 12px; padding: 20px; }
table { width: 100%; border-collapse: collapse; min-width: 800px; }
th { text-align: left; padding: 12px; color: #94a3b8; border-bottom: 1px solid #334155; }
td { padding: 12px; border-bottom: 1px solid #334155; vertical-align: middle; }
tr:last-child td { border-bottom: none; }

.user-info { display: flex; flex-direction: column; font-size: 0.9rem; }
.user-info span { color: #94a3b8; font-size: 0.8rem; }
.price { color: #10b981; font-weight: bold; }

.cancel-btn {
  background: transparent; border: 1px solid #ef4444; color: #ef4444;
  padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;
}
.cancel-btn:hover { background: #ef4444; color: white; }

.loading, .empty { text-align: center; padding: 40px; color: #94a3b8; }
</style>
