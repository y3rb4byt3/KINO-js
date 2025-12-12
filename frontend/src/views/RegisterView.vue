<script setup>
import { ref, inject } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import CinemaInput from '../components/CinemaInput.vue'
import CinemaButton from '../components/CinemaButton.vue'

const router = useRouter()
const notify = inject('notify')
const API_URL = 'http://localhost:3000/api'

// Pola formularza
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value, 
            password: password.value,
            role: 'user'
        })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
        throw new Error(data.error || 'Błąd rejestracji')
    }

    notify('Konto utworzone! Możesz się zalogować.', 'success')
    router.push('/login')

  } catch (error) {
    notify('Błąd: ' + error.message, 'error')
  }
}
</script>

<template>
  <div class="register-page-wrapper">
      
      <div class="register-card">
        
        <div class="header-section">
            <div class="logo-wrapper">
                <div class="logo-glow"></div>
                <div class="logo-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                </div>
            </div>
            <h1>Stwórz nowe konto</h1>
            <p class="subtitle">Dołącz do społeczności KINOVERSE</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
            
            <div class="name-row">
                <div style="flex: 1">
                    <CinemaInput id="firstName" label="Imię" placeholder="Jan" v-model="firstName" />
                </div>
                <div style="flex: 1">
                    <CinemaInput id="lastName" label="Nazwisko" placeholder="Kowalski" v-model="lastName" />
                </div>
            </div>

            <CinemaInput 
              id="email" 
              label="Adres e-mail" 
              type="email" 
              placeholder="twoj@email.com" 
              v-model="email"
            >
                <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </template>
            </CinemaInput>

            <CinemaInput 
              id="password" 
              label="Hasło" 
              type="password" 
              placeholder="Minimum 6 znaków" 
              v-model="password"
            >
                <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </template>
            </CinemaInput>

            <CinemaButton type="submit">
                Zarejestruj się
            </CinemaButton>

            <div class="login-link">
                Masz już konto? 
                <RouterLink to="/login">Zaloguj się</RouterLink>
            </div>
        </form>
      </div>
  </div>
</template>

<style scoped>
/* Wrapper - IDENTYCZNY JAK CHCIAŁEŚ */
.register-page-wrapper {
    min-height: 85vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;

    background-image: 
        linear-gradient(to bottom, rgba(2, 6, 23, 0.6), rgba(2, 6, 23, 0.6)),
        url('https://images.unsplash.com/photo-1593940256067-fb4acd831804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjB0aGVhdGVyJTIwc2VhdHN8ZW58MXx8fHwxNzY1NTYxOTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');
    
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 20px;
}

.register-card {
    width: 100%;
    max-width: 450px;
    padding: 20px;
    background-color: rgba(2, 6, 23, 0.6); 
    border-radius: 20px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.header-section { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; }
.logo-wrapper { position: relative; margin-bottom: 20px; }
.logo-glow { position: absolute; inset: 0; background-color: rgba(220, 38, 38, 0.2); filter: blur(20px); border-radius: 50%; }
.logo-box { position: relative; background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 16px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3); display: flex; justify-content: center; align-items: center; }

h1 {
    font-size: 24px; font-weight: bold; margin: 10px 0 5px 0;
    background: linear-gradient(to right, #ffffff, #d1d5db); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle { color: #9ca3af; font-size: 14px; }

.register-form { display: flex; flex-direction: column; gap: 15px; }
.name-row { display: flex; gap: 15px; }

.login-link { text-align: center; color: #9ca3af; font-size: 14px; }
.login-link a { color: #fbbf24; text-decoration: none; margin-left: 5px; }
.login-link a:hover { color: #fcd34d; }
</style>