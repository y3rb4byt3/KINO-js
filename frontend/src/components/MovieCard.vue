<script setup>
defineProps({
  movie: {
    type: Object,
    required: true
  }
})

// Emitujemy dwa zdarzenia: kup bilet ORAZ obejrzyj trailer
defineEmits(['buy-ticket', 'watch-trailer'])
</script>

<template>
  <div class="movie-card">
    <div class="poster-wrapper">
      <img :src="movie.image" :alt="movie.title">
      <div class="rating-badge">⭐ {{ movie.rating }}</div>
    </div>

    <div class="movie-info">
      <h3>{{ movie.title }}</h3>
      <p class="desc">{{ movie.desc }}</p>
      
      <div class="actions">
        <button class="book-btn" @click="$emit('buy-ticket', movie.id)">
          Kup bilet
        </button>

        <button 
          v-if="movie.trailerUrl"
          class="trailer-btn" 
          @click="$emit('watch-trailer', movie.trailerUrl)"
        >
          Trailer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Te same style co wcześniej */
.movie-card {
  background-color: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
}
.movie-card:hover { transform: translateY(-10px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border-color: #475569; }
.poster-wrapper { position: relative; height: 400px; overflow: hidden; }
.poster-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.movie-card:hover .poster-wrapper img { transform: scale(1.05); }
.rating-badge { position: absolute; top: 10px; right: 10px; background: rgba(0, 0, 0, 0.8); color: #fbbf24; padding: 5px 10px; border-radius: 8px; font-weight: bold; backdrop-filter: blur(4px); }
.movie-info { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
.movie-info h3 { margin: 0 0 10px 0; font-size: 1.25rem; color: white; }
.desc { color: #cbd5e1; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; flex-grow: 1; }

.actions { display: flex; gap: 10px; margin-top: 10px; }

.book-btn { flex-grow: 1; background: #dc2626; border: 1px solid #dc2626; color: white; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; text-transform: uppercase; }
.book-btn:hover { background: #b91c1c; border-color: #b91c1c; }

.trailer-btn { 
  flex-grow: 1;
  background: transparent; border: 1px solid #fbbf24; color: #fbbf24;
  padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; 
  transition: all 0.2s; text-transform: uppercase;
}
.trailer-btn:hover { background: #fbbf24; color: black; }
</style>