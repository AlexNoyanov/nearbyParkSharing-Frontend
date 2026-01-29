<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { bookingTimeline } from '../data/parkings'
import type { ParkingSpot } from '../data/parkings'
import type { Booking } from '../services/bookingsApi'

const props = defineProps<{
  parking: ParkingSpot
  booking?: Booking // Optional booking data from API
}>()

const emit = defineEmits<{
  (e: 'finish'): void
  (e: 'extend'): void
}>()

// Calculate remaining time
const remainingTime = ref('--:--:--')
let timerInterval: number | null = null

const updateRemainingTime = () => {
  if (!props.booking?.endAt) {
    remainingTime.value = '--:--:--'
    return
  }

  const now = new Date()
  const end = new Date(props.booking.endAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    remainingTime.value = '00:00:00'
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  remainingTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  updateRemainingTime()
  timerInterval = window.setInterval(updateRemainingTime, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Computed properties for display
const bookingId = computed(() => {
  if (props.booking?.id) {
    return `ID ${props.booking.id.substring(0, 8).toUpperCase()}`
  }
  return 'ID --'
})

const ownerName = computed(() => {
  if (props.booking?.owner) {
    const { firstName, lastName } = props.booking.owner
    return lastName ? `${firstName} ${lastName}` : firstName
  }
  return 'Владелец'
})

const ownerPhone = computed(() => {
  return props.booking?.owner?.phoneNumber || ''
})
</script>

<template>
  <section class="active">
    <header class="active__header">
      <div>
        <h1 class="active__title">Активная бронь</h1>
        <p class="active__subtitle">{{ booking?.spot?.address || parking.name }}</p>
      </div>
      <div class="active__status">{{ bookingId }}</div>
    </header>

    <article class="active__card">
      <div class="active__timer">
        <span class="active__timer-label">Осталось времени</span>
        <span class="active__timer-value">{{ remainingTime }}</span>
      </div>
      <div class="active__info">
        <div v-if="booking?.car">
          <p class="active__info-label">Автомобиль</p>
          <p class="active__info-value">{{ booking.car.licensePlate }}</p>
        </div>
        <div>
          <p class="active__info-label">Адрес</p>
          <p class="active__info-value">{{ booking?.spot?.address || parking.address }}</p>
        </div>
      </div>
    </article>

    <section class="active__section">
      <h2 class="active__section-title">Ход бронирования</h2>
      <ol class="active__timeline">
        <li v-for="step in bookingTimeline" :key="step.id" class="active__step">
          <span class="active__step-indicator" :class="{ 'active__step-indicator--done': step.isCompleted }" />
          <div>
            <p class="active__step-label">{{ step.label }}</p>
            <p class="active__step-time">{{ step.time }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="active__section" v-if="ownerName">
      <h2 class="active__section-title">Контакты владельца</h2>
      <div class="active__contacts">
        <div>
          <p class="active__contact-label">Владелец</p>
          <p class="active__contact-value">{{ ownerName }}</p>
        </div>
        <a v-if="ownerPhone" class="active__contact-action" :href="`tel:${ownerPhone}`">Позвонить</a>
      </div>
    </section>

    <footer class="active__footer">
      <button type="button" class="active__secondary" @click="emit('extend')">Продлить на 30 мин</button>
      <button type="button" class="active__primary" @click="emit('finish')">Завершить парковку</button>
    </footer>
  </section>
</template>

<style scoped>
.active {
  display: grid;
  gap: 24px;
  padding: 24px;
  background-color: #f8fafc;
}

.active__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.active__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.active__subtitle {
  margin: 4px 0 0;
  color: #64748b;
}

.active__status {
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  font-weight: 600;
}

.active__card {
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.12), rgba(37, 99, 235, 0.12));
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: grid;
  gap: 20px;
}

.active__timer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.active__timer-label {
  font-size: 14px;
  color: #475569;
}

.active__timer-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d4ed8;
  letter-spacing: 0.04em;
}

.active__info {
  display: grid;
  gap: 16px;
}

.active__info-label {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.active__info-value {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.active__section {
  display: grid;
  gap: 12px;
}

.active__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.active__timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.active__step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
}

.active__step-indicator {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  border: 2px solid #cbd5f5;
  background-color: #f1f5f9;
}

.active__step-indicator--done {
  border-color: #22c55e;
  background-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.active__step-label {
  margin: 0;
  font-weight: 600;
  color: #111827;
}

.active__step-time {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

.active__contacts {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.active__contact-label {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.active__contact-value {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 600;
}

.active__contact-action {
  text-decoration: none;
  color: #2563eb;
  font-weight: 600;
}

.active__footer {
  display: grid;
  gap: 12px;
}

.active__secondary,
.active__primary {
  padding: 16px 0;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.active__secondary {
  border: 1px solid #cbd5f5;
  background: #ffffff;
  color: #2563eb;
}

.active__primary {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #ffffff;
}

@media (max-width: 480px) {
  .active {
    padding: 16px;
  }

  .active__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .active__contacts {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

