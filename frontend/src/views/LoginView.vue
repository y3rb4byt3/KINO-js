<script setup>
import { ref, inject } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import CinemaInput from '../components/CinemaInput.vue'
import CinemaButton from '../components/CinemaButton.vue'

const router = useRouter()
const notify = inject('notify')
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

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    notify('Zalogowano pomyślnie!', 'success')
    window.dispatchEvent(new Event('login-success'))
    router.push('/')

  } catch (error) {
    notify('Błąd: ' + error.message, 'error')
  }
}
</script>

<template>
  <div class="login-page-wrapper">
      
      <div class="login-card">
        
        <div class="header-section">
            <div class="logo-wrapper">
                <div class="logo-glow"></div>
                <div class="logo-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>
                    </svg>
                </div>
            </div>
            <h1>Zaloguj się do świata filmu</h1>
            <p class="subtitle">Twoja brama do niezapomnianych seansów</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
            
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
              placeholder="Wprowadź hasło" 
              v-model="password"
            >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </template>
            </CinemaInput>

            <div class="forgot-password">
                <a href="#">Zapomniałeś hasła?</a>
            </div>

            <CinemaButton type="submit">
                Zaloguj się
            </CinemaButton>

            <div class="register-link">
                Nie masz konta? <RouterLink to="/register">Zarejestruj się</RouterLink>
            </div>
        </form>

      </div>
  </div>
</template>

<style scoped>
.login-page-wrapper {
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

.login-card {
    width: 100%;
    max-width: 450px;
    padding: 25px;
    background-color: rgba(2, 6, 23, 0.6); 
    backdrop-filter: blur(5px);            
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.header-section {
    display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 30px;
}
.logo-wrapper { position: relative; margin-bottom: 20px; }
.logo-glow { position: absolute; inset: 0; background-color: rgba(220, 38, 38, 0.2); filter: blur(20px); border-radius: 50%; }
.logo-box { position: relative; background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 16px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3); display: flex; justify-content: center; align-items: center; }

h1 {
    font-size: 24px; font-weight: bold; margin: 10px 0 5px 0;
    background: linear-gradient(to right, #ffffff, #d1d5db); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle { color: #9ca3af; font-size: 14px; }

.login-form { display: flex; flex-direction: column; gap: 20px; }

.forgot-password { text-align: right; }
.forgot-password a { color: #fbbf24; font-size: 14px; text-decoration: none; transition: color 0.2s; }
.forgot-password a:hover { color: #fcd34d; }

.register-link { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 15px; }
.register-link a { color: #fbbf24; text-decoration: none; margin-left: 5px; }
.register-link a:hover { color: #fcd34d; }
</style>