<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const notify = inject('notify') // <--- Wstrzykujemy powiadomienia zamiast alertów
const API_URL = 'http://localhost:3000/api'

// Stan formularza
const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const handleRegister = async () => {
    // 1. Sprawdzenie czy hasła są takie same
    if (form.value.password !== form.value.confirmPassword) {
        notify('Podane hasła nie są identyczne.', 'error')
        return
    }

    try {
        // 2. Wysyłka danych do backendu
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: form.value.firstName,
                lastName: form.value.lastName,
                email: form.value.email,
                password: form.value.password
            })
        })

        const data = await response.json()

        if (response.ok) {
            // SUKCES
            notify('Rejestracja zakończona sukcesem! Zaloguj się.', 'success')
            router.push('/login')
        } else {
            // BŁĄD BACKENDU (np. email zajęty)
            notify('Błąd rejestracji: ' + (data.error || 'Nieznany błąd'), 'error')
        }
    } catch (error) {
        // BŁĄD SIECI
        notify('Błąd połączenia z serwerem.', 'error')
    }
}
</script>

<template>
  <div class="container">
    <div class="sidebar"></div>
    <main>
      <section>
        <h2>Rejestracja</h2>
        <p style="text-align:center; margin-bottom:20px;">Dołącz do nas, aby kupić bilet!</p>
        
        <form class="form-box" @submit.prevent="handleRegister">
            <label>Imię:</label>
            <input v-model="form.firstName" type="text" required placeholder="Np. Jan">

            <label>Nazwisko:</label>
            <input v-model="form.lastName" type="text" required placeholder="Np. Kowalski">
            
            <label>Adres email:</label>
            <input v-model="form.email" type="email" required placeholder="twoj@email.com">
            
            <label>Hasło:</label>
            <input v-model="form.password" type="password" required placeholder="Minimum 5 znaków">
            
            <label>Potwierdź hasło:</label>
            <input v-model="form.confirmPassword" type="password" required placeholder="Powtórz hasło">
            
            <input type="submit" value="Załóż konto">
        </form>
        
        <div style="text-align: center; margin-top: 15px;">
             Masz już konto? <router-link to="/login">Zaloguj się tutaj</router-link>
        </div>
      </section>
    </main>
    <div class="sidebar"></div>
  </div>
</template>