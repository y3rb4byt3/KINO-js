<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const notify = inject('notify') // Wstrzykujemy powiadomienia z App.vue
const API_URL = 'http://localhost:3000/api'

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
        throw new Error(data.error || 'Błąd logowania')
    }

    // 1. ZAPIS TOKENA JWT I DANYCH USERA
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    // 2. POWIADOMIENIE SUKCESU
    notify('Zalogowano pomyślnie!', 'success')
    
    // 3. ODŚWIEŻENIE APLIKACJI (żeby zniknął przycisk "Zaloguj" w menu)
    window.dispatchEvent(new Event('login-success'))
    
    // 4. PRZEKIEROWANIE NA STRONĘ GŁÓWNĄ
    router.push('/')

  } catch (error) {
    notify('Błąd: ' + error.message, 'error')
  }
}
</script>

<template>
  <div class="container">
    <div class="sidebar"></div>
    <main>
      <section id="login">
        <h2>Logowanie</h2>
        <p style="text-align:center; margin-bottom:20px;">Witaj ponownie! Zaloguj się, aby kupować bilety.</p>
        
        <form class="form-box" @submit.prevent="handleLogin">
            <label>Adres email:</label>
            <input v-model="email" type="email" required placeholder="np. jan@kowalski.pl">
            
            <label>Hasło:</label>
            <input v-model="password" type="password" required placeholder="Twoje hasło">
            
            <input type="submit" value="Zaloguj się">
        </form>
        
        <div style="text-align: center; margin-top: 15px;">
             Nie masz konta? <router-link to="/register">Zarejestruj się tutaj</router-link>
        </div>
      </section>
    </main>
    <div class="sidebar"></div>
  </div>
</template>