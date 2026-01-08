<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
  (e: 'finish-parking'): void
  (e: 'extend-parking'): void
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
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  if (sameDay) return 'Сегодня'

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date)
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

// Countdown timer state
const daysRemaining = ref(0)
const hoursRemaining = ref(0)
const minutesRemaining = ref(0)
const secondsRemaining = ref(0)
let countdownInterval: number | null = null

const updateCountdown = () => {
  if (props.booking.status !== 'active') {
    return
  }

  // For testing: set fixed 8 hours countdown
  const totalSeconds = 8 * 60 * 60 // 8 hours in seconds
  
  // Calculate current total seconds from current values
  const currentTotalSeconds = daysRemaining.value * 24 * 60 * 60 + 
                              hoursRemaining.value * 60 * 60 + 
                              minutesRemaining.value * 60 + 
                              secondsRemaining.value
  
  // If countdown hasn't started yet (all values are 0), initialize with 8 hours
  // Otherwise, decrease by 1 second
  let remainingSeconds = currentTotalSeconds > 0 ? currentTotalSeconds - 1 : totalSeconds
  
  if (remainingSeconds <= 0) {
    daysRemaining.value = 0
    hoursRemaining.value = 0
    minutesRemaining.value = 0
    secondsRemaining.value = 0
    return
  }

  daysRemaining.value = Math.floor(remainingSeconds / (24 * 60 * 60))
  const hoursInSeconds = remainingSeconds % (24 * 60 * 60)
  hoursRemaining.value = Math.floor(hoursInSeconds / (60 * 60))
  const minutesInSeconds = hoursInSeconds % (60 * 60)
  minutesRemaining.value = Math.floor(minutesInSeconds / 60)
  secondsRemaining.value = minutesInSeconds % 60
}

const formatCountdownTime = computed(() => {
  return {
    hours: String(hoursRemaining.value),
    minutes: String(minutesRemaining.value).padStart(2, '0')
  }
})

const formatCountdownDays = computed(() => {
  return `${daysRemaining.value} ${daysRemaining.value === 1 ? 'день' : daysRemaining.value < 5 ? 'дня' : 'дней'}`
})

const startCountdown = () => {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval)
  }
  updateCountdown()
  countdownInterval = window.setInterval(updateCountdown, 1000)
}

const stopCountdown = () => {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// Watch for status changes
watch(() => props.booking.status, (newStatus) => {
  if (newStatus === 'active') {
    startCountdown()
  } else {
    stopCountdown()
  }
}, { immediate: true })

onMounted(() => {
  // Прокручиваем страницу в самый верх при открытии экрана
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
  window.scrollTo(0, 0)

  // Start countdown if booking is active
  if (props.booking.status === 'active') {
    startCountdown()
  }
})

onUnmounted(() => {
  stopCountdown()
})
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

      <!-- Active Status Card -->
      <div 
        v-if="booking.status === 'active'"
        class="booking-details__active-status-card"
      >
        <div class="booking-details__active-status-card-icon"></div>
        <div class="booking-details__active-status-card-content">
          <div class="booking-details__active-status-card-title">Парковка активна</div>
          <div class="booking-details__active-status-card-description">Вы припаркованы на забронированном месте</div>
        </div>
      </div>

      <!-- Countdown Timer Circle (for active bookings) -->
      <div v-if="booking.status === 'active'" class="booking-details__status-indicator-wrapper">
        <div class="booking-details__status-circle">
          <div class="booking-details__countdown-days">{{ formatCountdownDays }}</div>
          <div class="booking-details__countdown-time">
            <span>{{ formatCountdownTime.hours }}</span>
            <span class="booking-details__countdown-colon">:</span>
            <span>{{ formatCountdownTime.minutes }}</span>
          </div>
          <div class="booking-details__countdown-label">осталось</div>
        </div>
        <div class="booking-details__status-time">
          Забронировано до {{ formatTime(booking.endTime) }} {{ formatDate(booking.endDate) }}
        </div>
      </div>

      <!-- Parking Details Card -->
      <div class="booking-details__parking-card">
        <h2 class="booking-details__parking-title">Детали парковки</h2>
        
        <div class="booking-details__parking-address-row">
          <div class="booking-details__parking-icon-circle">
            <span class="booking-details__parking-icon-text">P</span>
          </div>
          <p class="booking-details__parking-address">
            {{ booking.address }}
            <span v-if="parkingSpot" class="booking-details__parking-spot-text">
              Место №{{ parkingSpot.id }}, второй ряд от входа
            </span>
          </p>
        </div>

        <div class="booking-details__parking-datetime">
          <div class="booking-details__parking-col">
            <p class="booking-details__parking-label">НАЧАЛО</p>
            <p class="booking-details__parking-date">{{ formatDate(booking.startDate) }}</p>
            <p class="booking-details__parking-time">{{ formatTime(booking.startTime) }}</p>
            <p class="booking-details__parking-label">АВТОМОБИЛЬ</p>
            <p class="booking-details__parking-car">{{ carInfo.brand }} {{ carInfo.model }}</p>
          </div>
          <div class="booking-details__parking-arrow">
            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.96875 12.8125L6.65625 13.5C6.96875 13.7812 7.4375 13.7812 7.71875 13.5L13.7812 7.40625C14.0938 7.125 14.0938 6.65625 13.7812 6.375L7.71875 0.28125C7.4375 0 6.9375 0 6.65625 0.28125L5.96875 0.96875C5.65625 1.28125 5.6875 1.75 5.96875 2.0625L9.75 5.625H0.75C0.34375 5.625 0 5.96875 0 6.375V7.375C0 7.8125 0.34375 8.125 0.75 8.125H9.75L5.96875 11.7188C5.6875 12.0312 5.65625 12.5 5.96875 12.8125Z" fill="#0077ED"/>
            </svg>
          </div>
          <div class="booking-details__parking-col booking-details__parking-col--right">
            <p class="booking-details__parking-label">ВЫЕЗД</p>
            <p class="booking-details__parking-date">{{ formatDate(booking.endDate) }}</p>
            <p class="booking-details__parking-time">{{ formatTime(booking.endTime) }}</p>
            <p class="booking-details__parking-label">НОМЕР</p>
            <p class="booking-details__parking-number">{{ carInfo.fullNumber }}</p>
          </div>
        </div>
      </div>

      <!-- Auto-extension Warning -->
      <div class="booking-details__warning">
        <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.1562 14.0312C18.7188 15.0312 18 16.25 16.8438 16.25H1.875C0.71875 16.25 0 15 0.5625 14.0312L8.0625 1C8.625 0 10.0938 0.03125 10.6562 1L18.1562 14.0312ZM9.375 11.3125C8.5625 11.3125 7.9375 11.9688 7.9375 12.75C7.9375 13.5625 8.5625 14.1875 9.375 14.1875C10.1562 14.1875 10.8125 13.5625 10.8125 12.75C10.8125 11.9688 10.1562 11.3125 9.375 11.3125ZM8 6.15625L8.21875 10.4062C8.25 10.625 8.40625 10.75 8.59375 10.75H10.125C10.3125 10.75 10.4688 10.625 10.5 10.4062L10.7188 6.15625C10.75 5.9375 10.5625 5.75 10.3438 5.75H8.375C8.15625 5.75 7.96875 5.9375 8 6.15625Z" fill="#CA8A04"/>
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
        <!-- Buttons for confirmed status -->
        <button
          v-if="booking.status === 'confirmed'"
          type="button"
          class="booking-details__action-button booking-details__action-button--primary"
          @click="emit('start-parking')"
        >
          Начать парковку
        </button>
        <button
          v-if="booking.status === 'confirmed'"
          type="button"
          class="booking-details__action-button booking-details__action-button--danger"
          @click="emit('cancel-booking')"
        >
          Отменить бронирование
        </button>

        <!-- Buttons for active status -->
        <button
          v-if="booking.status === 'active'"
          type="button"
          class="booking-details__action-button booking-details__action-button--success"
          @click="emit('finish-parking')"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.4375 8.71875C17.4375 13.5352 13.5 17.4375 8.71875 17.4375C3.90234 17.4375 0 13.5352 0 8.71875C0 3.9375 3.90234 0 8.71875 0C13.5 0 17.4375 3.9375 17.4375 8.71875ZM7.69922 13.3594L14.168 6.89062C14.3789 6.67969 14.3789 6.29297 14.168 6.08203L13.3594 5.30859C13.1484 5.0625 12.7969 5.0625 12.5859 5.30859L7.3125 10.582L4.81641 8.12109C4.60547 7.875 4.25391 7.875 4.04297 8.12109L3.23438 8.89453C3.02344 9.10547 3.02344 9.49219 3.23438 9.70312L6.89062 13.3594C7.10156 13.5703 7.48828 13.5703 7.69922 13.3594Z" fill="white"/>
          </svg>
          Завершить парковку
        </button>
        <button
          v-if="booking.status === 'active'"
          type="button"
          class="booking-details__action-button booking-details__action-button--extend"
          @click="emit('extend-parking')"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75 8.25V3.75C9.75 3.33594 9.41406 3 9 3C8.58594 3 8.25 3.33594 8.25 3.75V8.25H3.75C3.33594 8.25 3 8.58594 3 9C3 9.41406 3.33594 9.75 3.75 9.75H8.25V14.25C8.25 14.6641 8.58594 15 9 15C9.41406 15 9.75 14.6641 9.75 14.25V9.75H14.25C14.6641 9.75 15 9.41406 15 9C15 8.58594 14.6641 8.25 14.25 8.25H9.75Z" fill="white"/>
          </svg>
          Продлить
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
  align-items: center;
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

/* Active Status Card */
.booking-details__active-status-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #22C55E;
  border-radius: 12px;
  margin-bottom: 8px;
}

.booking-details__active-status-card-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  flex-shrink: 0;
  margin-top: 6px;
}

.booking-details__active-status-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.booking-details__active-status-card-title {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
}

.booking-details__active-status-card-description {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #ffffff;
}

/* Status Indicator */
.booking-details__status-indicator-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  box-sizing: border-box;
}

.booking-details__status-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.booking-details__status-line {
  width: 32px;
  height: 3px;
  background: #9CA3AF;
  border-radius: 2px;
}

.booking-details__status-text-small {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #6B7280;
}

.booking-details__countdown-days {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.2;
  color: #1F2937;
  margin-bottom: 4px;
}

.booking-details__countdown-time {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
  color: #1F2937;
  margin-bottom: 4px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
}

.booking-details__countdown-colon {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.booking-details__countdown-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
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
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-details__parking-title {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.booking-details__parking-address-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  margin-bottom: 8px;
}

.booking-details__parking-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-details__parking-icon-text {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #2563EB;
}

.booking-details__parking-address {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.booking-details__parking-spot-text {
  font-size: 12px;
  color: #9ca3af;
}

.booking-details__parking-datetime {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.booking-details__parking-col {
  display: grid;
  gap: 4px;
  text-align: center;
  align-items: center;
}

.booking-details__parking-col--right {
  text-align: center;
  align-items: center;
}

.booking-details__parking-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-details__parking-label {
  margin: 0 0 4px 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: #6b7280;
  font-family: Inter, sans-serif;
}

.booking-details__parking-date {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #0077ED;
  font-family: Inter, sans-serif;
}

.booking-details__parking-time {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0077ED;
  font-family: Inter, sans-serif;
}

.booking-details__parking-car {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  font-family: Inter, sans-serif;
}

.booking-details__parking-number {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  font-family: Inter, sans-serif;
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
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #E5E7EB;
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
  background: #DBEAFE;
  color: #2563EB;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.booking-details__chat-button svg {
  width: 15px;
  height: 13px;
  display: block;
}

.booking-details__chat-button svg path {
  fill: #2563EB;
}

.booking-details__chat-button:hover {
  background: #BFDBFE;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.booking-details__action-button svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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

.booking-details__action-button--success {
  background: #22C55E;
  color: #ffffff;
}

.booking-details__action-button--success:hover {
  background: #16A34A;
}

.booking-details__action-button--extend {
  background: #2563EB;
  color: #ffffff;
}

.booking-details__action-button--extend:hover {
  background: #1D4ED8;
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
