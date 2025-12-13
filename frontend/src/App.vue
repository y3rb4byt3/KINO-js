<script setup>
import { ref, onMounted, provide } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

// --- SYSTEM POWIADOMIEŃ ---
const notification = ref({ message: '', type: '', visible: false })

const notify = (message, type = 'success') => {
  notification.value = { message, type, visible: true }
  setTimeout(() => {
    notification.value.visible = false
  }, 3000)
}

provide('notify', notify)

// --- OBSŁUGA UŻYTKOWNIKA ---
const checkUser = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
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
})
</script>

<template>
  <div class="wrapper">
    <header>
      <h1>
        <RouterLink to="/" style="color: white; text-decoration: none;">kinoVERSE</RouterLink>
      </h1>
      
      <nav>
        <ul>
          <li>
            <RouterLink to="/pricing" class="nav-btn">Cennik</RouterLink>
          </li>

          <li v-if="user" class="user-panel">
            <span class="welcome-text">Witaj, {{ user.firstName || 'Kinomaniaku' }}</span>

            <RouterLink to="/profile" class="nav-btn">
              👤 Profil
            </RouterLink>

            <button @click="logout" class="nav-btn">
              Wyloguj
            </button>
          </li>
          
          <li v-else class="guest-panel">
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

    <div v-if="notification.visible" :class="['toast-notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<style>
/* --- UNIWERSALNY STYL PRZYCISKÓW MENU --- */
.nav-btn {
  /* Wygląd podstawowy */
  background-color: #1e293b; /* Ciemne tło (spójne z nagłówkiem) */
  color: #cbd5e1;            /* Jasnoszary tekst */
  border: 1px solid #475569; /* Delikatna ramka */
  
  /* Wymiary i font */
  padding: 8px 16px;
  border-radius: 8px;        /* Zaokrąglone rogi */
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;     /* Usuwa podkreślenie linków */
  cursor: pointer;
  
  /* Wyrównanie */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  /* Płynna animacja */
  transition: all 0.2s ease-in-out;
  font-family: inherit;      /* Żeby button miał ten sam font co linki */
}

/* Efekt po najechaniu myszką (Hover) */
.nav-btn:hover {
  background-color: #334155; /* Nieco jaśniejsze tło */
  color: #fbbf24;            /* Złoty tekst */
  border-color: #fbbf24;     /* Złota ramka */
  transform: translateY(-2px); /* Lekkie uniesienie */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Aktywny link (np. gdy jesteś na stronie cennika) */
.router-link-active.nav-btn {
  background-color: #334155;
  color: #fbbf24;
  border-color: #fbbf24;
}

/* --- UKŁAD ELEMENTÓW --- */
.user-panel, .guest-panel {
  margin-left: auto; 
  display: flex; 
  align-items: center; 
  gap: 12px;
}

.welcome-text {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-right: 5px;
}

/* Layout */
.wrapper { display: flex; flex-direction: column; min-height: 100vh; }
header { 
  background: #0f172a; /* Bardzo ciemny granat */
  padding: 0 30px; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  height: 80px; 
  border-bottom: 1px solid #1e293b; 
}
nav ul { list-style: none; display: flex; gap: 15px; margin: 0; padding: 0; width: 100%; align-items: center; }
nav { flex: 1; margin-left: 40px; }
#footer { margin-top: auto; background: #0f172a; color: #475569; text-align: center; padding: 20px; border-top: 1px solid #1e293b; font-size: 0.8rem; }

/* --- NOWY WYGLĄD POWIADOMIEŃ (DYMEK) --- */
.toast-notification {
  /* Pozycjonowanie na środku ekranu */
  position: fixed;
  top: 15%; /* 15% od góry - żeby nie zasłaniało najważniejszych treści, ale było widoczne */
  left: 50%;
  transform: translateX(-50%); /* Idealne wycentrowanie w poziomie */
  
  /* Wygląd dymka */
  min-width: 300px;
  max-width: 90%;
  padding: 16px 30px;
  border-radius: 50px; /* Mocno zaokrąglone rogi (kształt pastylki) */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); /* Mocny cień dla efektu "lewitacji" */
  
  /* Tekst */
  color: white;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  z-index: 10000; /* Musi być na samym wierzchu */
  
  /* Animacja pojawiania się */
  animation: slideDownFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Kolory w zależności od typu */
.toast-notification.success {
  background: linear-gradient(135deg, #16a34a, #15803d); /* Zielony gradient */
  border: 2px solid #22c55e;
}

.toast-notification.error {
  background: linear-gradient(135deg, #dc2626, #b91c1c); /* Czerwony gradient */
  border: 2px solid #ef4444;
}

/* Animacja - sprężyste pojawienie się */
@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translate(-50%, -20px) scale(0.9); /* Startuje trochę wyżej i mniejszy */
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1); /* Ląduje na miejscu */
  }
}
</style>