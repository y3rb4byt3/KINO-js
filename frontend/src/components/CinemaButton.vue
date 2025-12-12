<script setup>
defineProps({
  // Typ przycisku: 'button', 'submit' lub 'reset'
  type: {
    type: String,
    default: 'button'
  },
  // Czy przycisk ma być nieaktywny?
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button 
    :type="type" 
    :class="['cinema-btn', { 'disabled': disabled }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.cinema-btn {
  width: 100%;
  height: 48px;
  
  /* Główny kolor: Czerwony gradient kinowy */
  background: linear-gradient(to right, #dc2626, #b91c1c);
  color: white;
  
  border: none;
  border-radius: 12px;
  
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px; /* Lekki odstęp między literami dla czytelności */
  
  cursor: pointer;
  
  /* Cień dający efekt "Glow" (poświaty) */
  box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3);
  
  transition: all 0.2s ease-in-out;
  
  /* Wyśrodkowanie tekstu */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Efekt po najechaniu myszką (Hover) */
.cinema-btn:hover:not(.disabled) {
  /* Przycisk lekko się unosi */
  transform: translateY(-2px);
  /* Cień staje się mocniejszy i większy */
  box-shadow: 0 20px 25px -5px rgba(220, 38, 38, 0.5);
}

/* Efekt wciśnięcia (Active) */
.cinema-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 5px 10px -2px rgba(220, 38, 38, 0.3);
}

/* Styl dla zablokowanego przycisku */
.cinema-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.8); /* Sprawia, że przycisk jest szary */
  transform: none;
  box-shadow: none;
}
</style>