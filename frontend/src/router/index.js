import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PricingView from '../views/PricingView.vue'
import ReservationView from '../views/ReservationView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminView from '../views/AdminView.vue' //
import AdminMoviesView from '../views/AdminMoviesView.vue'
import AdminShowtimesView from '../views/AdminShowtimesView.vue'
import AdminReservationsView from '../views/AdminReservationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/pricing', component: PricingView },
    { path: '/reservation/:movieId', component: ReservationView },
    { path: '/profile', component: ProfileView },
    { 
      path: '/admin', 
      component: AdminView,
      // 🔥 Dodajemy podstrony panelu admina
      children: [
        {
          path: 'movies',
          component: AdminMoviesView,
          name: 'AdminMovies'
        },
        // 🔥 2. Dodaj nową ścieżkę tutaj:
        {
          path: 'showtimes',
          component: AdminShowtimesView,
          name: 'AdminShowtimes'
        },
        { path: 'reservations', component: AdminReservationsView }
      ]
    }
  ]
})

export default router