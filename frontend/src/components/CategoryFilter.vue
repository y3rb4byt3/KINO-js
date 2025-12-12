<script setup>
defineProps({
  categories: Array,
  activeCategory: String
})

// Emitujemy zdarzenie do rodzica, że wybrano nową kategorię
defineEmits(['changeCategory'])
</script>

<template>
  <div class="filters">
    <button 
      v-for="cat in categories" 
      :key="cat"
      :class="['filter-btn', { active: activeCategory === cat }]"
      @click="$emit('changeCategory', cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>

<style scoped>
.filters {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
}

.filter-btn {
  background: transparent; border: 1px solid #334155; color: #94a3b8;
  padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s;
}

.filter-btn:hover, .filter-btn.active {
  background: #dc2626; border-color: #dc2626; color: white;
}
</style>