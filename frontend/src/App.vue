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
    user.value = JSON.parse(storedUser)
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
          <li><RouterLink to="/pricing">Cennik</RouterLink></li>

          <li v-if="user" style="margin-left: auto; display: flex; align-items: center; color: #cbd5e1;">
            Witaj, {{ user.firstName }}
            <button @click="logout" style="margin-left: 15px; cursor: pointer;">Wyloguj</button>
          </li>
          
          <li v-else style="margin-left: auto; display: flex; align-items: center; gap: 15px;">
             
             <RouterLink to="/login" style="color: #cbd5e1; font-weight: 500; border: none; padding: 0;">
                Logowanie
             </RouterLink>

             <RouterLink to="/register" style="color: #cbd5e1; font-weight: 500; border: none; padding: 0;">
                Rejestracja
             </RouterLink>

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