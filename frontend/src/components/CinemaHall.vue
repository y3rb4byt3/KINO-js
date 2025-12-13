<script setup>
import { computed } from 'vue'

// Przyjmujemy układ sali oraz listę wybranych ID
const props = defineProps({
  layout: {
    type: [Object, String], // Może przyjść jako obiekt lub JSON string
    required: true,
    default: () => ({ rows: 10, seatsPerRow: 10, occupiedSeats: [] })
  },
  selectedSeats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-seat'])

// Parsujemy layout (na wypadek gdyby przyszedł jako string z bazy)
const parsedLayout = computed(() => {
  if (typeof props.layout === 'string') {
    try {
      return JSON.parse(props.layout)
    } catch (e) {
      return { rows: 10, seatsPerRow: 10, occupiedSeats: [] }
    }
  }
  return props.layout || { rows: 10, seatsPerRow: 10, occupiedSeats: [] }
})

// Generujemy rzędy do wyświetlenia
const rows = computed(() => {
  const { rows: rowCount, seatsPerRow } = parsedLayout.value
  const occupied = parsedLayout.value.occupiedSeats || []
  
  const result = []
  const rowLabels = ['A','B','C','D','E','F','G','H','I','J','K','L','M']

  for (let i = 0; i < rowCount; i++) {
    const rowSeats = []
    for (let j = 1; j <= seatsPerRow; j++) {
      const id = `${rowLabels[i]}${j}` // np. A1, B5
      
      rowSeats.push({
        id: id,
        label: j, // Wyświetlamy tylko numer, np. "1"
        rowLabel: rowLabels[i], // A, B, C...
        status: occupied.includes(id) ? 'occupied' : 'available'
      })
    }
    result.push(rowSeats)
  }
  return result
})

// Obsługa kliknięcia
const handleSeatClick = (seat) => {
  if (seat.status === 'occupied') return
  emit('toggle-seat', seat)
}
</script>

<template>
  <div class="cinema-hall">
    <div class="seats-grid">
      <div v-for="(row, i) in rows" :key="i" class="seat-row">
        
        <div class="row-label">{{ row[0].rowLabel }}</div>

        <div 
          v-for="seat in row" 
          :key="seat.id"
          :class="[
            'seat', 
            seat.status,
            { selected: selectedSeats.includes(seat.id) }
          ]"
          @click="handleSeatClick(seat)"
          :title="`Rząd ${seat.rowLabel}, Miejsce ${seat.label}`"
        >
          {{ seat.label }}
        </div>
      
        <div class="row-label">{{ row[0].rowLabel }}</div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="seat-sample available"></div> Wolne
      </div>
      <div class="legend-item">
        <div class="seat-sample selected"></div> Wybrane
      </div>
      <div class="legend-item">
        <div class="seat-sample occupied"></div> Zajęte
      </div>
    </div>
  </div>
</template>

<style scoped>
.cinema-hall {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.seats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Odstęp między rzędami */
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 6px; /* Odstęp między fotelami w rzędzie */
  justify-content: center;
}

.row-label {
  width: 25px;
  text-align: center;
  color: #64748b;
  font-weight: bold;
  font-size: 14px;
  user-select: none;
}

/* Wygląd fotela */
.seat {
  width: 32px;
  height: 32px;
  background-color: #334155; /* Kolor wolnego miejsca (slate-700) */
  border-radius: 6px 6px 12px 12px; /* Zaokrąglenie przypominające fotel */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  box-shadow: 0 2px 0 #1e293b; /* Lekki efekt 3D */
}

/* Hover na wolne miejsce */
.seat.available:hover {
  background-color: #475569;
  transform: scale(1.1);
  color: white;
}

/* Wybrane miejsce */
.seat.selected {
  background-color: #fbbf24; /* Amber-400 (żółty) */
  color: #1e293b; /* Ciemny tekst */
  font-weight: bold;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
  transform: translateY(-2px);
}

/* Zajęte miejsce */
.seat.occupied {
  background-color: #7f1d1d; /* Ciemny czerwony */
  color: #450a0a; 
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

/* Legenda */
.legend {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  background: rgba(30, 41, 59, 0.5); /* Półprzezroczyste tło */
  padding: 10px 20px;
  border-radius: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 13px;
}

.seat-sample {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.seat-sample.available { background-color: #334155; }
.seat-sample.selected { background-color: #fbbf24; }
.seat-sample.occupied { background-color: #7f1d1d; opacity: 0.6; }

@media (max-width: 600px) {
  .seat { width: 26px; height: 26px; font-size: 10px; }
  .row-label { width: 15px; font-size: 12px; }
  .seat-row { gap: 4px; }
}
</style>