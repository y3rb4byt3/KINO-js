import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PricingView from '../views/PricingView.vue'
import ReservationView from '../views/ReservationView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/pricing', component: PricingView },
    { path: '/reservation/:movieId', component: ReservationView },
    { path: '/profile', component: ProfileView }
  ]
})

export default router