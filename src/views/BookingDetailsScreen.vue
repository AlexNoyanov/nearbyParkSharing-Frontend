<script setup lang="ts">
import { computed } from 'vue'
import { featuredParkings, type ParkingSpot } from '../data/parkings'

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
  userCar?: { brand: string; model: string; number: string; region?: string } | null
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-chat'): void
  (e: 'start-parking'): void
  (e: 'cancel-booking'): void
}>()

const parkingSpot = computed((): ParkingSpot | null => {
  if (props.booking.parkingSpotId) {
    return featuredParkings.find((p: ParkingSpot) => p.id === props.booking.parkingSpotId) || null
  }
  return featuredParkings.find((p: ParkingSpot) => 
    props.booking.address.includes(p.address) || 
    p.address.includes(props.booking.address)
  ) || null
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  if (isToday) return 'Сегодня'
  if (isTomorrow) return 'Завтра'
  
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatTime = (timeStr: string): string => {
  return timeStr
}

const getStatusText = (status: Booking['status']): string => {
  switch (status) {
    case 'awaiting':
      return 'Ожидает подтверждения'
    case 'confirmed':
      return 'Ожидает начала'
    case 'active':
      return 'Активно'
    case 'completed':
      return 'Завершено'
    default:
      return ''
  }
}

const getStatusDescription = (status: Booking['status']): string => {
  if (status === 'confirmed') {
    return 'Вы еще на сообщили о прибытии на место'
  }
  return ''
}

const getOwnerName = (): string => {
  return 'Михаил'
}

const getCarInfo = () => {
  if (props.userCar) {
    return {
      brand: props.userCar.brand,
      model: props.userCar.model,
      number: props.userCar.number,
      fullNumber: props.userCar.region 
        ? `${props.userCar.number}${props.userCar.region}` 
        : props.userCar.number
    }
  }
  return {
    brand: 'Toyota',
    model: 'Camry',
    number: 'A123',
    fullNumber: 'A1235B777'
  }
}

const carInfo = computed(() => getCarInfo())
</script>

<template>
  <section class="booking-details">
    <header class="booking-details__header">
      <button type="button" class="booking-details__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <h1 class="booking-details__title">Детали бронирования</h1>
      <div class="booking-details__header-spacer"></div>
    </header>

    <div class="booking-details__content">
      <!-- Status Card -->
      <div 
        v-if="booking.status === 'confirmed'"
        class="booking-details__status-card"
      >
        <div class="booking-details__status-card-icon"></div>
        <div class="booking-details__status-card-content">
          <div class="booking-details__status-card-title">{{ getStatusText(booking.status) }}</div>
          <div class="booking-details__status-card-description">{{ getStatusDescription(booking.status) }}</div>
        </div>
      </div>

      <!-- Status Indicator Circle -->
      <div v-if="booking.status === 'confirmed'" class="booking-details__status-indicator-wrapper">
        <div class="booking-details__status-circle">
          <div class="booking-details__status-line"></div>
          <div class="booking-details__status-text-small">не началось</div>
        </div>
        <div class="booking-details__status-time">
          Забронировано до {{ formatTime(booking.endTime) }} {{ formatDate(booking.endDate) }}
        </div>
      </div>

      <!-- Parking Details Card -->
      <div class="booking-details__parking-card">
        <h2 class="booking-details__parking-title">Детали парковки</h2>
        <div class="booking-details__parking-address">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C6.13 0 3 3.13 3 7C3 12.25 10 20 10 20C10 20 17 12.25 17 7C17 3.13 13.87 0 10 0ZM10 9.5C8.62 9.5 7.5 8.38 7.5 7C7.5 5.62 8.62 4.5 10 4.5C11.38 4.5 12.5 5.62 12.5 7C12.5 8.38 11.38 9.5 10 9.5Z" fill="#2563EB"/>
          </svg>
          <div class="booking-details__parking-address-text">
            <div class="booking-details__parking-address-main">{{ booking.address }}</div>
            <div v-if="parkingSpot" class="booking-details__parking-spot">
              Место №{{ parkingSpot.id }}, второй ряд от входа
            </div>
          </div>
        </div>
        <div class="booking-details__parking-times">
          <div class="booking-details__time-column">
            <div class="booking-details__time-label">Начало</div>
            <div class="booking-details__time-date">{{ formatDate(booking.startDate) }}</div>
            <div class="booking-details__time-value">{{ formatTime(booking.startTime) }}</div>
            <div class="booking-details__time-label">Автомобиль</div>
            <div class="booking-details__time-value">{{ carInfo.brand }} {{ carInfo.model }}</div>
          </div>
          <div class="booking-details__time-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="booking-details__time-column">
            <div class="booking-details__time-label">Выезд</div>
            <div class="booking-details__time-date">{{ formatDate(booking.endDate) }}</div>
            <div class="booking-details__time-value">{{ formatTime(booking.endTime) }}</div>
            <div class="booking-details__time-label">Номер</div>
            <div class="booking-details__time-value">{{ carInfo.fullNumber }}</div>
          </div>
        </div>
      </div>

      <!-- Auto-extension Warning -->
      <div class="booking-details__warning">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0L0 18H20L10 0ZM10 14C9.45 14 9 13.55 9 13C9 12.45 9.45 12 10 12C10.55 12 11 12.45 11 13C11 13.55 10.55 14 10 14ZM9 10H11V6H9V10Z" fill="#F59E0B"/>
        </svg>
        <div class="booking-details__warning-content">
          <div class="booking-details__warning-title">Автопродление</div>
          <div class="booking-details__warning-text">
            Если не завершить парковку вовремя, бронирование автоматически продлится на аналогичный срок
          </div>
        </div>
      </div>

      <!-- Owner Details -->
      <div class="booking-details__owner-card">
        <h2 class="booking-details__owner-title">Владелец места</h2>
        <div class="booking-details__owner-row">
          <div class="booking-details__owner-name">{{ getOwnerName() }}</div>
          <button
            type="button"
            class="booking-details__chat-button"
            @click="emit('open-chat')"
          >
            <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.02734 0C10.8828 0 14.0273 2.57031 14.0273 5.6875C14.0273 8.83203 10.8828 11.375 7.02734 11.375C5.96094 11.375 4.97656 11.1836 4.07422 10.8555C3.41797 11.4023 2.05078 12.25 0.246094 12.25C0.136719 12.25 0.0820312 12.2227 0.0273438 12.1406C0 12.0586 0.0273438 11.9492 0.0820312 11.8945C0.0820312 11.8672 1.23047 10.6641 1.58594 9.26953C0.601562 8.28516 0.0273438 7.05469 0.0273438 5.6875C0.0273438 2.57031 3.14453 0 7.02734 0Z" fill="#2563EB"/>
            </svg>
            Чат
          </button>
        </div>
      </div>

      <!-- Description -->
      <div v-if="parkingSpot && parkingSpot.description" class="booking-details__description">
        <h2 class="booking-details__description-title">Описание</h2>
        <p class="booking-details__description-text">{{ parkingSpot.description }}</p>
      </div>

      <!-- Features -->
      <div v-if="parkingSpot && parkingSpot.features" class="booking-details__features">
        <h2 class="booking-details__features-title">Особенности</h2>
        <div class="booking-details__features-grid">
          <div 
            v-for="feature in parkingSpot.features" 
            :key="feature.id"
            class="booking-details__feature-item"
          >
            <svg 
              v-if="feature.id === 'security' || feature.label.includes('Охрана')" 
              width="15" 
              height="17" 
              viewBox="0 0 15 17" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.0625 2.59375C14.625 2.84375 15 3.375 15 3.96875C15 10.9062 10.75 14.75 8.0625 15.875C7.6875 16.0312 7.28125 16.0312 6.90625 15.875C3.5625 14.4688 0 10.1875 0 3.96875C0 3.375 0.34375 2.84375 0.90625 2.59375L6.90625 0.09375C7.09375 0.03125 7.28125 0 7.5 0C7.6875 0 7.875 0.03125 8.0625 0.09375L14.0625 2.59375ZM7.5 13.9375C10.4062 12.4688 12.875 9.03125 12.9688 4.3125L7.5 2.03125V13.9375Z" fill="#16A34A"/>
            </svg>
            <svg 
              v-else-if="feature.id === 'charger' || feature.label.includes('Зарядка') || feature.label.includes('Электрозарядка')" 
              width="11" 
              height="16" 
              viewBox="0 0 11 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.3125 5C9.875 5 10.25 5.65625 9.9375 6.125L4.4375 15.625C4.3125 15.875 4.0625 16 3.78125 16C3.3125 16 2.96875 15.5625 3.0625 15.0938L4.5 9H0.8125C0.34375 9 0 8.625 0.0625 8.15625L1.0625 0.65625C1.09375 0.28125 1.4375 0 1.8125 0H6.3125C6.78125 0 7.15625 0.46875 7.03125 0.96875L5.6875 5H9.3125Z" fill="#CA8A04"/>
            </svg>
            <svg 
              v-else-if="feature.id === 'covered' || feature.label.includes('Крытая') || feature.label.includes('Под крышей')" 
              width="19" 
              height="14" 
              viewBox="0 0 19 14" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.78125 3.625C8.84375 3.5625 8.9375 3.53125 9.03125 3.53125C9.09375 3.53125 9.1875 3.5625 9.25 3.625L15.0312 8.34375V13.4688C15.0312 13.75 14.7812 13.9688 14.5312 13.9688H11C10.75 13.9688 10.5 13.75 10.5 13.4688V10.4688C10.5 10.2188 10.2812 9.96875 10 9.96875H8C7.75 9.96875 7.5 10.2188 7.5 10.4688V13.4688C7.5 13.75 7.28125 13.9688 7.03125 13.9688H3.53125C3.25 13.9688 3.03125 13.75 3.03125 13.4688V8.375L8.78125 3.625ZM17.875 6.84375C17.9688 6.90625 18.0312 7.03125 18.0312 7.125C18.0312 7.21875 18 7.3125 17.9375 7.375L17.125 8.34375C17.0625 8.4375 16.9688 8.46875 16.8438 8.46875C16.75 8.46875 16.6562 8.4375 16.5938 8.375L9.25 2.34375C9.1875 2.28125 9.09375 2.25 9.03125 2.25C8.9375 2.25 8.84375 2.28125 8.78125 2.34375L1.4375 8.375C1.375 8.4375 1.28125 8.46875 1.1875 8.46875C1.0625 8.46875 0.96875 8.4375 0.90625 8.34375L0.09375 7.375C0.0625 7.3125 0 7.21875 0 7.125C0 7.03125 0.0625 6.90625 0.15625 6.84375L8.0625 0.3125C8.3125 0.125 8.65625 0 9.03125 0C9.375 0 9.71875 0.125 9.96875 0.3125L12.7812 2.625V0.375C12.7812 0.15625 12.9375 0 13.1562 0H14.9062C15.0938 0 15.2812 0.15625 15.2812 0.375V4.6875L17.875 6.84375Z" fill="#2563EB"/>
            </svg>
            <span class="booking-details__feature-icon" v-else aria-hidden="true">{{ feature.icon }}</span>
            <span>{{ feature.id === 'covered' || feature.label.includes('Под крышей') ? 'Крытая парковка' : feature.label }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="booking-details__actions">
        <button
          v-if="booking.status === 'confirmed'"
          type="button"
          class="booking-details__action-button booking-details__action-button--primary"
          @click="emit('start-parking')"
        >
          Начать парковку
        </button>
        <button
          type="button"
          class="booking-details__action-button booking-details__action-button--danger"
          @click="emit('cancel-booking')"
        >
          Отменить бронирование
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-details {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

.booking-details__content {
  background: #ffffff;
}

.booking-details__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  color: #f8fafc;
}

.booking-details__back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.booking-details__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.booking-details__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  color: #ffffff;
  flex: 1;
  text-align: center;
}

.booking-details__header-spacer {
  width: 40px;
  flex-shrink: 0;
}

.booking-details__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Status Card */
.booking-details__status-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #2563EB;
  border-radius: 12px;
  margin-bottom: 8px;
}

.booking-details__status-card-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  flex-shrink: 0;
  margin-top: 4px;
}

.booking-details__status-card-content {
  flex: 1;
}

.booking-details__status-card-title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
  margin-bottom: 4px;
}

.booking-details__status-card-description {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

/* Status Indicator */
.booking-details__status-indicator-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.booking-details__status-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #ffffff;
}

.booking-details__status-line {
  width: 24px;
  height: 2px;
  background: #9CA3AF;
  border-radius: 1px;
}

.booking-details__status-text-small {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #6B7280;
}

.booking-details__status-time {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #6B7280;
  text-align: center;
}

/* Parking Details Card */
.booking-details__parking-card {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-details__parking-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
}

.booking-details__parking-address {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.booking-details__parking-address svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.booking-details__parking-address-text {
  flex: 1;
}

.booking-details__parking-address-main {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #1F2937;
  margin-bottom: 4px;
}

.booking-details__parking-spot {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #6B7280;
}

.booking-details__parking-times {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-top: 8px;
}

.booking-details__time-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.booking-details__time-arrow {
  display: flex;
  align-items: center;
  padding-top: 20px;
  flex-shrink: 0;
}

.booking-details__time-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #6B7280;
  margin-top: 8px;
}

.booking-details__time-label:first-child {
  margin-top: 0;
}

.booking-details__time-date {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #6B7280;
}

.booking-details__time-value {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #1F2937;
}

/* Warning */
.booking-details__warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #FEF3C7;
  border-radius: 12px;
}

.booking-details__warning svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.booking-details__warning-content {
  flex: 1;
}

.booking-details__warning-title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  color: #92400E;
  margin-bottom: 4px;
}

.booking-details__warning-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  color: #92400E;
}

/* Owner Card */
.booking-details__owner-card {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-details__owner-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
}

.booking-details__owner-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.booking-details__owner-name {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #1F2937;
}

.booking-details__chat-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #2563EB;
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.booking-details__chat-button svg {
  width: 15px;
  height: 13px;
  display: block;
}

.booking-details__chat-button:hover {
  background: #1D4ED8;
}

/* Description */
.booking-details__description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-details__description-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
}

.booking-details__description-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
}

/* Features */
.booking-details__features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-details__features-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
}

.booking-details__features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.booking-details__feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6.5px 9px;
  border-radius: 12px;
  background: #F3F4F6;
  font-family: Inter, sans-serif;
  font-size: 9.8px;
  font-weight: 400;
  color: #374151;
  white-space: nowrap;
}

.booking-details__feature-item svg {
  flex-shrink: 0;
  width: auto;
  height: auto;
}

.booking-details__feature-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.booking-details__feature-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Action Buttons */
.booking-details__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
}

.booking-details__action-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.booking-details__action-button--primary {
  background: #2563EB;
  color: #ffffff;
}

.booking-details__action-button--primary:hover {
  background: #1D4ED8;
}

.booking-details__action-button--danger {
  background: #EF4444;
  color: #ffffff;
}

.booking-details__action-button--danger:hover {
  background: #DC2626;
}

@media (max-width: 480px) {
  .booking-details__header {
    padding: calc(env(safe-area-inset-top) + 20px) 20px 20px;
  }

  .booking-details__content {
    padding: 12px 20px 20px;
  }
}
</style>
