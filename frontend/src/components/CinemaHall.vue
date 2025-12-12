<script setup>
import { computed } from 'vue'

const props = defineProps({
  layout: {
    type: Object, // { rows: 10, seatsPerRow: 10, occupiedSeats: [] }
    required: true
  },
  selectedSeats: {
    type: Array, // ['A1', 'A2']
    default: () => []
  }
})

const emit = defineEmits(['toggle-seat'])

// Logika generowania rzędów (przeniesiona z widoku tutaj)
const seatRows = computed(() => {
  if (!props.layout) return []
  
  const rows = []
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let r = 0; r < props.layout.rows; r++) {
    const rowLabel = alphabet[r]
    const seatsInRow = []
    
    for (let s = 1; s <= props.layout.seatsPerRow; s++) {
      const seatId = `${rowLabel}${s}`
      
      const isOccupied = props.layout.occupiedSeats.includes(seatId)
      const isSelected = props.selectedSeats.includes(seatId)
      
      seatsInRow.push({
        id: seatId,
        status: isOccupied ? 'occupied' : (isSelected ? 'selected' : 'available')
      })
    }
    rows.push({ label: rowLabel, seats: seatsInRow })
  }
  return rows
})
</script>

<template>
  <div class="cinema-hall">
    <div class="screen">EKRAN</div>

    <div class="seats-grid">
      <div v-for="row in seatRows" :key="row.label" class="seat-row">
        <span class="row-label">{{ row.label }}</span>
        
        <div 
          v-for="seat in row.seats" 
          :key="seat.id"
          :class="['seat', seat.status]"
          @click="$emit('toggle-seat', seat)"
        >
          {{ seat.id.substring(1) }}
        </div>

        <span class="row-label">{{ row.label }}</span>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="seat available"></div> Wolne</div>
      <div class="legend-item"><div class="seat selected"></div> Wybrane</div>
      <div class="legend-item"><div class="seat occupied"></div> Zajęte</div>
    </div>
  </div>
</template>

<style scoped>
.cinema-hall {
  background: #0f172a;
  padding: 30px;
  border-radius: 20px;
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid #334155;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.screen {
  width: 80%; height: 8px; background: #cbd5e1;
  border-radius: 50%; box-shadow: 0 10px 40px rgba(255,255,255,0.15);
  margin-bottom: 50px; text-align: center; color: #64748b; font-size: 10px; padding-top: 10px;
  letter-spacing: 2px;
}

.seat-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.row-label { width: 20px; text-align: center; color: #64748b; font-weight: bold; font-size: 14px; }

.seat {
  width: 32px; height: 32px;
  border-top-left-radius: 8px; border-top-right-radius: 8px;
  border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;
  background: #334155;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #94a3b8; font-weight: 600;
  transition: all 0.2s;
  border-bottom: 2px solid #1e293b;
}

.seat.available:hover { background: #475569; transform: scale(1.1); border-color: #334155; }
.seat.selected { background: #fbbf24; color: black; box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); border-color: #d97706; transform: translateY(-2px); }
.seat.occupied { background: #7f1d1d; color: rgba(255,255,255,0.2); cursor: not-allowed; border-color: #450a0a; }

.legend { display: flex; gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b; width: 100%; justify-content: center; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #cbd5e1; }
.legend-item .seat { width: 16px; height: 16px; cursor: default; }
</style>