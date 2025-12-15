<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute() // 1. Pobieramy informacje o aktualnym adresie
const notify = inject('notify') 
const API_URL = 'http://localhost:3000/api'

const isAdmin = ref(false)
const isLoading = ref(true)

// 2. Sprawdzamy: czy jesteśmy na głównej stronie panelu?
const isDashboard = computed(() => route.path === '/admin')

onMounted(() => {
    const user = localStorage.getItem('user')
    if (user) {
        try {
            const parsedUser = JSON.parse(user)
            if (parsedUser.role === 'admin') {
                isAdmin.value = true
            } else {
                if (notify) notify('Brak uprawnień.', 'error')
                router.push('/')
            }
        } catch (e) {}
    } else {
        if (notify) notify('Wymagane logowanie.', 'error')
        router.push('/login')
    }
    isLoading.value = false
})
</script>

<template>
  <div class="admin-page-wrapper">
    <div class="container">
      <div v-if="isLoading" class="loading-state">Ładowanie...</div>
      
      <div v-else-if="isAdmin">
        
        <div v-if="isDashboard">
            <h1>⚙️ Panel Administracyjny KINOVERSE</h1>
            <p class="subtitle">Zarządzaj filmami, seansami i rezerwacjami.</p>

            <div class="admin-sections-grid">
                
                <div class="admin-card primary">
                    <h2>Filmy</h2>
                    <p>Dodawaj, edytuj i usuwaj filmy z repertuaru.</p>
                    <RouterLink to="/admin/movies" class="manage-btn">Zarządzaj filmami</RouterLink>
                </div>
                
                <div class="admin-card secondary">
                    <h2>Seanse</h2>
                    <p>Twórz i edytuj godziny seansów dla każdego filmu.</p>
                    <RouterLink to="/admin/showtimes" class="manage-btn">Zarządzaj seansami</RouterLink>
                </div>

                <div class="admin-card info">
                    <h2>Rezerwacje</h2>
                    <p>Przeglądaj i anuluj rezerwacje wszystkich użytkowników.</p>
                    <RouterLink to="/admin/reservations" class="manage-btn">Przeglądaj rezerwacje</RouterLink>
                </div>
            </div>
        </div>

        <RouterView />
        
        <div v-if="!isDashboard" class="back-link-wrapper">
             <RouterLink to="/admin" class="back-btn">⬅ Wróć do Panelu</RouterLink>
        </div>

      </div>

      <div v-else-if="!isLoading" class="unauthorized-access">
          <h2>❌ Dostęp zabroniony</h2>
          <RouterLink to="/" class="go-home-link">Wróć na stronę główną</RouterLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-page-wrapper {
    min-height: 80vh;
    padding: 40px 20px;
    background-color: #0f172a;
}
.container { max-width: 1000px; margin: 0 auto; color: white; }
h1 { color: #dc2626; font-size: 2.2rem; margin-bottom: 5px; }
.subtitle { color: #94a3b8; margin-bottom: 30px; }

/* Siatka Sekcji */
.admin-sections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    margin-top: 40px;
}
.admin-card {
    background: #1e293b;
    padding: 30px;
    border-radius: 12px;
    border-left: 5px solid;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s;
}
.admin-card:hover { transform: translateY(-5px); }

.admin-card.primary { border-left-color: #fbbf24; }
.admin-card.secondary { border-left-color: #10b981; }
.admin-card.info { border-left-color: #6366f1; }

.admin-card h2 { margin-top: 0; color: white; font-size: 1.5rem; }
.admin-card p { color: #cbd5e1; font-size: 0.9rem; }
.manage-btn {
    display: inline-block;
    margin-top: 15px;
    padding: 8px 15px;
    background: #dc2626;
    color: white;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s;
}
.manage-btn:hover { background: #b91c1c; }

.back-link-wrapper { margin-top: 30px; border-top: 1px solid #334155; padding-top: 20px; }
.back-btn { color: #94a3b8; text-decoration: none; font-weight: 600; }
.back-btn:hover { color: white; }

.loading-state, .unauthorized-access { text-align: center; padding: 50px; color: #94a3b8; }
.unauthorized-access h2 { color: #ef4444; }
.go-home-link { color: #fbbf24; text-decoration: underline; }
</style>