<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted, provide } from 'vue'

const router = useRouter()
const user = ref(null)

// --- SYSTEM POWIADOMIEŃ (TOAST) ---
const toast = ref({
  message: '',
  type: 'success', // 'success' (zielony) lub 'error' (czerwony)
  visible: false
})

// Ta funkcja będzie dostępna w całej aplikacji
const showToast = (message, type = 'success') => {
  toast.value.message = message
  toast.value.type = type
  toast.value.visible = true

  // Ukryj po 3 sekundach
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}

// Udostępniamy funkcję 'notify' dla wszystkich dzieci (HomeView, LoginView itp.)
provide('notify', showToast)

// --- Logika Usera ---
const checkUser = () => {
  user.value = JSON.parse(localStorage.getItem('user'))
}

const logout = () => {
  localStorage.removeItem('user')
  user.value = null
  showToast('Wylogowano pomyślnie', 'success') // Użycie toasta
  router.push('/login')
}

onMounted(() => {
  checkUser()
  window.addEventListener('login-success', checkUser)
})
</script>

<template>
  <div class="wrapper">
    <div v-if="toast.visible" class="toast-notification" :class="toast.type">
      {{ toast.message }}
    </div>

    <header>
      <h1>Kino XYZ</h1>
      <nav>
        <ul>
          <li><RouterLink to="/">Home</RouterLink></li>
          <li class="dropdown-wrapper">
            <a href="#">Filmy &#9662;</a>
            <div class="dropdown-content">
               <RouterLink to="/?genre=action">Akcja</RouterLink>
               <RouterLink to="/?genre=comedy">Komedia</RouterLink>
               <RouterLink to="/?genre=drama">Dramat</RouterLink>
            </div>
          </li>
          <li><RouterLink to="/pricing">Cennik</RouterLink></li>
          <li><a href="#footer">Kontakt</a></li>

          <li v-if="user" style="margin-left: 20px; color: #aaa;">
            {{ user.firstName }}
            <button @click="logout" style="margin-left:5px; cursor:pointer;">Wyl</button>
          </li>
          <li v-else style="margin-left: 20px;">
             <RouterLink to="/login">Zaloguj</RouterLink>
          </li>
        </ul>
      </nav>
    </header>

    <RouterView />

    <footer id="footer">
        <h3>Kontakt</h3>
        <p>Adres: ul. Przykładowa 123, 00-000 Miasto</p>
        <p>Email: kontakt@kinoxyz.pl</p>
        <p>&copy; 2024 Kino XYZ. Wszelkie prawa zastrzeżone.</p>
    </footer>
  </div>
</template>

<style>
@import './assets/main.css';

/* STYL DLA POWIADOMIENIA */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  z-index: 9999;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  animation: slideIn 0.5s ease-out;
}

.toast-notification.success {
  background-color: #28a745; /* Zielony */
}

.toast-notification.error {
  background-color: #dc3545; /* Czerwony */
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.dropdown-wrapper { position: relative; }
.dropdown-wrapper:hover .dropdown-content { display: block; }
</style>