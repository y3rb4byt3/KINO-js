<script setup>
defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="input-group">
    <label v-if="label" :for="id">{{ label }}</label>

    <div class="input-wrapper">
      <div class="icon-slot">
        <slot name="icon"></slot>
      </div>
      
      <input 
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="cinema-input"
      >
    </div>
  </div>
</template>

<style scoped>
.input-group {
  margin-bottom: 15px;
  width: 100%;
}

.input-group label {
  display: block;
  color: #d1d5db; /* Jasnoszary */
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

/* Kontener na ikonę */
.icon-slot {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #6b7280; /* Szary kolor ikony */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Żeby kliknięcie w ikonę aktywowało input pod spodem */
  z-index: 2;
}

/* Styl samego pola input */
.cinema-input {
  width: 100%;
  height: 48px;
  /* Ważne: Wcięcie z lewej na ikonę (40px), z prawej margines (12px) */
  padding-left: 40px; 
  padding-right: 12px;
  
  background-color: rgba(2, 6, 23, 0.5); /* Ciemne półprzezroczyste tło */
  border: 1px solid #334155;            /* Slate border */
  border-radius: 12px;
  
  color: white;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box; /* Żeby padding nie powiększał inputa */
}

/* Efekt po kliknięciu (Focus) */
.cinema-input:focus {
  outline: none;
  border-color: #dc2626; /* Czerwony kinowy */
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15); /* Czerwona poświata */
}

/* Efekt po najechaniu (Hover) */
.cinema-input:hover {
  border-color: #475569;
}

/* Obsługa placeholderów */
::placeholder {
  color: #64748b;
  opacity: 1;
}
</style>