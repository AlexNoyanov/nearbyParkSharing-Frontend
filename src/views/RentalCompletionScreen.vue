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

defineProps<{
  booking: Booking
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'complete'): void
}>()

// Scroll to top when component mounts
onMounted(() => {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  
  // Also scroll the content container if it exists
  const contentElement = document.querySelector('.rental-completion__content') as HTMLElement | null
  if (contentElement) {
    contentElement.scrollTop = 0
  }
  
  // Scroll app content if it exists
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const formatTime = (timeStr: string): string => {
  return timeStr
}
</script>

<template>
  <section class="rental-completion">
    <header class="rental-completion__header">
      <button type="button" class="rental-completion__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="rental-completion__title">Детали бронирования</h1>
      <div class="rental-completion__header-spacer"></div>
    </header>

    <div class="rental-completion__content">
      <!-- Completion Icon -->
      <div class="rental-completion__icon-wrapper">
        <div class="rental-completion__icon-circle">
          <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3125 22.0898L0.585938 12.3633C0 11.7773 0 10.7812 0.585938 10.1953L2.69531 8.08594C3.28125 7.5 4.21875 7.5 4.80469 8.08594L11.4258 14.6484L25.4883 0.585938C26.0742 0 27.0117 0 27.5977 0.585938L29.707 2.69531C30.293 3.28125 30.293 4.27734 29.707 4.86328L12.4805 22.0898C11.8945 22.6758 10.8984 22.6758 10.3125 22.0898Z" fill="#16A34A"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h2 class="rental-completion__main-title">Завершение аренды</h2>

      <!-- Time Details -->
      <div class="rental-completion__time-card">
        <div class="rental-completion__time-section">
          <div class="rental-completion__time-column">
            <div class="rental-completion__time-label">Время начала</div>
            <div class="rental-completion__time-date">{{ formatDate(booking.startDate) }}</div>
            <div class="rental-completion__time-time">{{ formatTime(booking.startTime) }}</div>
          </div>
          <div class="rental-completion__time-column">
            <div class="rental-completion__time-label">Время окончания</div>
            <div class="rental-completion__time-date">{{ formatDate(booking.endDate) }}</div>
            <div class="rental-completion__time-time">{{ formatTime(booking.endTime) }}</div>
          </div>
        </div>
      </div>

      <!-- Early Termination Warning -->
      <div class="rental-completion__warning">
        <div class="rental-completion__warning-icon">
          <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.1562 14.0312C18.7188 15.0312 18 16.25 16.8438 16.25H1.875C0.71875 16.25 0 15 0.5625 14.0312L8.0625 1C8.625 0 10.0938 0.03125 10.6562 1L18.1562 14.0312ZM9.375 11.3125C8.5625 11.3125 7.9375 11.9688 7.9375 12.75C7.9375 13.5625 8.5625 14.1875 9.375 14.1875C10.1562 14.1875 10.8125 13.5625 10.8125 12.75C10.8125 11.9688 10.1562 11.3125 9.375 11.3125ZM8 6.15625L8.21875 10.4062C8.25 10.625 8.40625 10.75 8.59375 10.75H10.125C10.3125 10.75 10.4688 10.625 10.5 10.4062L10.7188 6.15625C10.75 5.9375 10.5625 5.75 10.3438 5.75H8.375C8.15625 5.75 7.96875 5.9375 8 6.15625Z" fill="#CA8A04"/>
          </svg>
        </div>
        <div class="rental-completion__warning-content">
          <div class="rental-completion__warning-title">Досрочное завершение аренды</div>
          <div class="rental-completion__warning-text">
            Если вы завершаете аренду ранее, то перерасчет может быть инициирован только по согласованию с арендодателем. Сообщите в поддержку и мы сделаем перерасчет, если арендатор его согласует. Перерасчет доступен только в почасовом тарифе
          </div>
        </div>
      </div>

      <!-- Complete Button -->
      <button 
        type="button" 
        class="rental-completion__button"
        @click="emit('complete')"
      >
        Завершить аренду
      </button>
    </div>
  </section>
</template>

<style scoped>
.rental-completion {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.rental-completion__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 1.33px solid #E5E7EB;
}

.rental-completion__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F3F4F6;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.rental-completion__back:hover {
  background-color: #E5E7EB;
}

.rental-completion__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.rental-completion__header-spacer {
  width: 40px;
  flex-shrink: 0;
}

.rental-completion__content {
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.rental-completion__icon-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.rental-completion__icon-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: #D1FAE5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rental-completion__main-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
}

.rental-completion__time-card {
  width: 100%;
  max-width: 400px;
  background-color: #F9FAFB;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rental-completion__time-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
}

.rental-completion__time-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rental-completion__time-label {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rental-completion__time-date {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.rental-completion__time-time {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.rental-completion__warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #FFFBEB;
  border: none;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.rental-completion__warning-icon {
  flex-shrink: 0;
  width: 19px;
  height: 17px;
  margin-top: 2px;
}

.rental-completion__warning-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rental-completion__warning-title {
  font-size: 16px;
  font-weight: 600;
  color: #CA8A04;
}

.rental-completion__warning-text {
  font-size: 14px;
  line-height: 1.5;
  color: #92400E;
}

.rental-completion__button {
  width: 100%;
  max-width: 400px;
  padding: 16px 24px;
  background-color: #2563EB;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.rental-completion__button:hover {
  background-color: #1d4ed8;
}

.rental-completion__button:active {
  background-color: #1e40af;
}
</style>

