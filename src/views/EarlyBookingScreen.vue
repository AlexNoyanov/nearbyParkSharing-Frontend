<script setup lang="ts">
import { onMounted } from 'vue'

type Booking = {
  id: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  rentalType: 'hourly' | 'daily' | 'monthly'
  createdAt: Date
  status: 'awaiting' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  parkingSpotId?: string
}

const props = defineProps<{
  booking: Booking
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'pay-and-start'): void
  (e: 'wait-for-scheduled'): void
}>()

// Calculate time difference (mock data for now)
const daysEarly = 0
const hoursEarly = 0
const minutesEarly = 45
const surcharge = 160

onMounted(() => {
  window.scrollTo(0, 0)
  const contentElement = document.querySelector('.app__content')
  if (contentElement) {
    contentElement.scrollTo(0, 0)
  }
})
</script>

<template>
  <section class="early-booking">
    <header class="early-booking__header">
      <button type="button" class="early-booking__back-button" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="early-booking__header-title">Детали бронирования</h1>
      <div class="early-booking__header-spacer"></div>
    </header>

    <div class="early-booking__content">
      <!-- Warning Icon -->
      <div class="early-booking__warning-icon">
        <svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40.8516 31.5703C42.1172 33.8203 40.5 36.5625 37.8984 36.5625H4.21875C1.61719 36.5625 0 33.75 1.26562 31.5703L18.1406 2.25C19.4062 0 22.7109 0.0703125 23.9766 2.25L40.8516 31.5703ZM21.0938 25.4531C19.2656 25.4531 17.8594 26.9297 17.8594 28.6875C17.8594 30.5156 19.2656 31.9219 21.0938 31.9219C22.8516 31.9219 24.3281 30.5156 24.3281 28.6875C24.3281 26.9297 22.8516 25.4531 21.0938 25.4531ZM18 13.8516L18.4922 23.4141C18.5625 23.9062 18.9141 24.1875 19.3359 24.1875H22.7812C23.2031 24.1875 23.5547 23.9062 23.625 23.4141L24.1172 13.8516C24.1875 13.3594 23.7656 12.9375 23.2734 12.9375H18.8438C18.3516 12.9375 17.9297 13.3594 18 13.8516Z" fill="#2563EB"/>
        </svg>
      </div>

      <!-- Title -->
      <h1 class="early-booking__title">Вы планируете начать аренду ранее!</h1>

      <!-- White Card -->
      <div class="early-booking__white-card">
        <h2 class="early-booking__white-card-title">Начало ранее на:</h2>
        
        <div class="early-booking__time-grid">
          <div class="early-booking__time-col">
            <p class="early-booking__time-label">Дней</p>
            <p class="early-booking__time-value">{{ daysEarly }}</p>
          </div>
          <div class="early-booking__time-col">
            <p class="early-booking__time-label">Часов : минут</p>
            <p class="early-booking__time-value">{{ hoursEarly }}:{{ String(minutesEarly).padStart(2, '0') }}</p>
          </div>
        </div>

        <div class="early-booking__surcharge-bar">
          <span class="early-booking__surcharge-label">Доплата</span>
          <span class="early-booking__surcharge-amount">₽{{ surcharge }}</span>
        </div>
      </div>

      <!-- Yellow Warning Card -->
      <div class="early-booking__warning-card">
        <div class="early-booking__warning-card-icon">
          <svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.8516 31.5703C42.1172 33.8203 40.5 36.5625 37.8984 36.5625H4.21875C1.61719 36.5625 0 33.75 1.26562 31.5703L18.1406 2.25C19.4062 0 22.7109 0.0703125 23.9766 2.25L40.8516 31.5703ZM21.0938 25.4531C19.2656 25.4531 17.8594 26.9297 17.8594 28.6875C17.8594 30.5156 19.2656 31.9219 21.0938 31.9219C22.8516 31.9219 24.3281 30.5156 24.3281 28.6875C24.3281 26.9297 22.8516 25.4531 21.0938 25.4531ZM18 13.8516L18.4922 23.4141C18.5625 23.9062 18.9141 24.1875 19.3359 24.1875H22.7812C23.2031 24.1875 23.5547 23.9062 23.625 23.4141L24.1172 13.8516C24.1875 13.3594 23.7656 12.9375 23.2734 12.9375H18.8438C18.3516 12.9375 17.9297 13.3594 18 13.8516Z" fill="#CA8A04"/>
          </svg>
        </div>
        <div class="early-booking__warning-card-content">
          <h3 class="early-booking__warning-card-title">Оплачиваемый период</h3>
          <p class="early-booking__warning-card-text">
            Если аренда начинается ранее чем за 15 мин. от времени брони, то будет произведен перерасчет за полный час
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="early-booking__actions">
        <button
          type="button"
          class="early-booking__action-button early-booking__action-button--primary"
          @click="emit('pay-and-start')"
        >
          Оплатить и начать парковку
        </button>
        <button
          type="button"
          class="early-booking__action-button early-booking__action-button--secondary"
          @click="emit('wait-for-scheduled')"
        >
          Дождусь планового времени
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.early-booking {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

.early-booking__header {
  display: flex;
  align-items: center;
  gap: 7.19px;
  padding: 12px 18px 13px;
  border-bottom: 1.33px solid #E5E7EB;
  position: relative;
  background-color: #ffffff;
  flex-shrink: 0;
}

.early-booking__back-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F3F4F6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.early-booking__back-button:hover {
  background-color: #E5E7EB;
}

.early-booking__back-button svg {
  width: 15px;
  height: 14px;
  display: block;
}

.early-booking__header-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  color: #1F2937;
  margin: 0;
  text-align: center;
  flex: 1;
}

.early-booking__header-spacer {
  width: 30px;
  flex-shrink: 0;
}

.early-booking__content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  background: #ffffff;
}

/* Warning Icon */
.early-booking__warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.early-booking__warning-icon svg {
  display: block;
}

/* Title */
.early-booking__title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.3;
  color: #000000;
  margin: 0;
  text-align: center;
  max-width: 380px;
}

/* White Card */
.early-booking__white-card {
  width: 100%;
  max-width: 380px;
  background: #F3F4F6;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.early-booking__white-card-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.4;
  color: #1F2937;
  margin: 0;
}

.early-booking__time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.early-booking__time-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.early-booking__time-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #6B7280;
  margin: 0;
}

.early-booking__time-value {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.3;
  color: #1F2937;
  margin: 0;
}

.early-booking__surcharge-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #DBEAFE;
  border-radius: 12px;
}

.early-booking__surcharge-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #6B7280;
}

.early-booking__surcharge-amount {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.4;
  color: #2563EB;
}

/* Yellow Warning Card */
.early-booking__warning-card {
  width: 100%;
  max-width: 380px;
  background: #FEF3C7;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.early-booking__warning-card-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.early-booking__warning-card-icon svg {
  display: block;
  width: 24px;
  height: 20px;
}

.early-booking__warning-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.early-booking__warning-card-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.4;
  color: #92400E;
  margin: 0;
}

.early-booking__warning-card-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #92400E;
  margin: 0;
}

/* Action Buttons */
.early-booking__actions {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.early-booking__action-button {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.early-booking__action-button--primary {
  background: #2563EB;
  color: #ffffff;
}

.early-booking__action-button--primary:hover {
  background: #1D4ED8;
}

.early-booking__action-button--secondary {
  background: #E5E7EB;
  color: #374151;
}

.early-booking__action-button--secondary:hover {
  background: #D1D5DB;
}

@media (max-width: 480px) {
  .early-booking__content {
    padding: 32px 20px 20px;
  }

  .early-booking__title {
    font-size: 20px;
  }

  .early-booking__white-card,
  .early-booking__warning-card,
  .early-booking__actions {
    max-width: 100%;
  }
}
</style>

