<script setup>
import { computed } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

// Funkcja zamieniająca zwykły link YouTube na wersję do osadzenia (embed)
const embedUrl = computed(() => {
  if (!props.url) return ''
  // Zamiana "watch?v=" na "embed/" oraz obsługa skróconych linków youtu.be
  const videoIdMatch = props.url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/)([\w-]{11}))/)
  const videoId = videoIdMatch ? videoIdMatch[1] : null
  
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : ''
})
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✕</button>
      
      <iframe 
        v-if="embedUrl"
        :src="embedUrl" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
      ></iframe>
      <div v-else class="error-msg">
        Nieprawidłowy link do wideo.
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9); /* Ciemne tło */
  z-index: 1000; /* Zawsze na wierzchu */
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 900px;
  aspect-ratio: 16/9; /* Zachowanie proporcji wideo */
  background: black;
  box-shadow: 0 0 30px rgba(220, 38, 38, 0.3); /* Czerwona poświata */
  border-radius: 12px;
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -10px;
  background: transparent;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
  color: #dc2626;
}

.error-msg {
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>