<script setup>
import { ref, onMounted, provide, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

// --- SYSTEM POWIADOMIEŃ (TOAST) ---
const notification = ref({ message: '', type: '', visible: false })

const notify = (message, type = 'success') => {
  notification.value = { message, type, visible: true }
  
  // Automatyczne ukrywanie po 3 sekundach
  setTimeout(() => {
    notification.value.visible = false
  }, 3000)
}

provide('notify', notify)

// --- OBSŁUGA UŻYTKOWNIKA ---
const checkUser = () => {
  const storedUser = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  
  if (storedUser && token) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) { user.value = null }
  } else {
    user.value = null
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  notify('Wylogowano pomyślnie', 'success')
  router.push('/login')
}

onMounted(() => {
  checkUser()
  window.addEventListener('login-success', checkUser)
  window.addEventListener('logout-success', checkUser)
})

onUnmounted(() => {
  window.removeEventListener('login-success', checkUser)
  window.removeEventListener('logout-success', checkUser)
})
</script>

<template>
  <div class="wrapper">
    <header>
      <h1><RouterLink to="/" class="logo">kinoVERSE</RouterLink></h1>
      <nav>
        <ul>
          <li><RouterLink to="/pricing" class="nav-btn">Cennik</RouterLink></li>
          <li v-if="user" class="auth-panel">
            <span class="welcome-text">Witaj, {{ user.firstName }}</span>
            <RouterLink to="/profile" class="nav-btn">👤 Profil</RouterLink>
            <button @click="logout" class="nav-btn logout">Wyloguj</button>
          </li>
          <li v-else class="auth-panel">
             <RouterLink to="/login" class="nav-btn">Logowanie</RouterLink>
             <RouterLink to="/register" class="nav-btn">Rejestracja</RouterLink>
          </li>
        </ul>
      </nav>
    </header>

    <RouterView />

    <footer id="footer">
      <p>&copy; 2025 kinoVERSE. Wszystkie prawa zastrzeżone.</p>
    </footer>

    <Transition name="toast-slide">
      <div v-if="notification.visible" class="toast-wrapper">
        <div :class="['toast-card', notification.type]">
          
          <div class="toast-icon">
            <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            
            <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>

          <p class="toast-message">{{ notification.message }}</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style>
/* --- STYLE OGÓLNE --- */
body { margin: 0; background-color: #0f172a; font-family: 'Segoe UI', sans-serif; color: #cbd5e1; }
.wrapper { display: flex; flex-direction: column; min-height: 100vh; }
header { background: #1e293b; padding: 0 30px; display: flex; align-items: center; justify-content: space-between; height: 80px; border-bottom: 1px solid #334155; position: sticky; top: 0; z-index: 50; }
.logo { color: white; text-decoration: none; font-weight: 800; font-size: 1.5rem; letter-spacing: 1px; }
nav { flex: 1; margin-left: 40px; }
nav ul { list-style: none; display: flex; gap: 15px; margin: 0; padding: 0; align-items: center; }
.auth-panel { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.welcome-text { color: #94a3b8; font-size: 0.9rem; margin-right: 10px; display: none; }
@media (min-width: 768px) { .welcome-text { display: inline; } }
.nav-btn { background-color: #0f172a; color: #cbd5e1; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
.nav-btn:hover { background-color: #334155; color: #fbbf24; border-color: #fbbf24; }
.router-link-active.nav-btn { background-color: #334155; color: #fbbf24; border-color: #fbbf24; }
.nav-btn.logout:hover { color: #ef4444; border-color: #ef4444; }
#footer { margin-top: auto; background: #1e293b; color: #64748b; text-align: center; padding: 20px; border-top: 1px solid #334155; font-size: 0.8rem; }


/* --- 🔥 STYLE TOAST (Przetłumaczone z Tailwind na CSS) --- */

/* Wrapper: fixed bottom-8 left-1/2 -translate-x-1/2 z-50 */
.toast-wrapper {
  position: fixed;
  bottom: 2rem; /* bottom-8 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none; /* Żeby wrapper nie blokował kliknięć obok */
}

/* Card: flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/95 backdrop-blur-sm border-l-4 shadow-2xl min-w-[320px] */
.toast-card {
  display: flex;
  align-items: center;
  gap: 12px; /* gap-3 */
  padding: 12px 20px; /* py-3 px-5 */
  border-radius: 12px; /* rounded-xl */
  
  /* Kolor tła: slate-800 z opacity 95% */
  background-color: rgba(30, 41, 59, 0.95);
  
  /* Efekt rozmycia tła */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  /* Cień: shadow-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  
  /* Rozmiar */
  min-width: 320px;
  max-width: 450px;
  
  /* Ramka z lewej (border-l-4) - kolor definiujemy niżej */
  border-left-width: 4px;
  border-left-style: solid;
  
  pointer-events: auto; /* Karta ma reagować */
}

/* Ikona i tekst */
.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.toast-message {
  color: white;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  flex: 1;
}

/* --- WARIANTY KOLORYSTYCZNE (Tailwind colors) --- */

/* Success: border-emerald-500, text-emerald-500 */
.toast-card.success {
  border-left-color: #10b981;
}
.toast-card.success .toast-icon {
  color: #10b981;
}

/* Error: border-red-500, text-red-500 */
.toast-card.error {
  border-left-color: #ef4444;
}
.toast-card.error .toast-icon {
  color: #ef4444;
}

/* Info: border-amber-500, text-amber-500 */
.toast-card.info {
  border-left-color: #f59e0b;
}
.toast-card.info .toast-icon {
  color: #f59e0b;
}

/* --- ANIMACJE (Vue Transition) --- */
/* Odpowiednik: transition-all duration-300 ease-out */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease-out;
}

/* Stan początkowy/końcowy: opacity-0 translate-y-4 */
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem); /* Przesunięcie w dół o 1rem */
}
</style>