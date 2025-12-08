<script setup>
import { ref, inject } from 'vue' // <--- Dodaj 'inject'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()
const API_URL = 'http://localhost:3000/api'

// Pobieramy funkcję powiadomień z App.vue
const notify = inject('notify') 

const handleLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)

    localStorage.setItem('user', JSON.stringify(data.user))
    
    // ZAMIAST ALERTU:
    notify('Zalogowano pomyślnie!', 'success')
    
    window.dispatchEvent(new Event('login-success'))
    router.push('/')
  } catch (error) {
    // ZAMIAST ALERTU:
    notify('Błąd logowania: ' + error.message, 'error')
  }
}
</script>

<template>
  <div class="container">
    <div class="sidebar"></div>
    <main>
      <section id="login">
        <h2>Logowanie</h2>
        <form class="login-form" @submit.prevent="handleLogin">
            <label>Adres email:</label>
            <input v-model="email" type="email" required>
            
            <label>Hasło:</label>
            <input v-model="password" type="password" required>
            
            <input type="submit" value="Zaloguj się">
        </form>
        <div style="text-align: center; margin-top: 10px;">
             Nie masz konta? <RouterLink to="/register">Zarejestruj się</RouterLink>
        </div>
      </section>
    </main>
    <div class="sidebar"></div>
  </div>
</template>