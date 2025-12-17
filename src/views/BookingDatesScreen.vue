<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import TimePickerScroll from '../components/TimePickerScroll.vue'

type Location = {
  id: string
  address: string
  lat: number
  lng: number
  priceHour: string
  priceDay: string
  priceMonth: string
  availability: 'hourly' | 'daily' | 'monthly'
}

const props = defineProps<{
  location: Location
  userCar?: { brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean } | null
  paymentCard?: { id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean } | null
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'book', bookingData: {
    address: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    rentalType: 'hourly' | 'daily' | 'monthly'
  }): void
  (e: 'add-car'): void
  (e: 'change-car'): void
  (e: 'change-payment-card'): void
}>()

const rentalType = ref<'hourly' | 'daily' | 'monthly'>('hourly')
// Инициализируем даты текущей датой
const today = new Date().toISOString().split('T')[0]
const startDate = ref(today)
const endDate = ref(today)
const startTime = ref('10:00')
const endTime = ref('12:00')

const canBook = computed(() => {
  return !!(props.userCar && props.paymentCard)
})

// Вычисляем продолжительность на основе дат и времени
const duration = computed(() => {
  if (!startDate.value || !endDate.value) return '0 минут'
  
  // Для помесячной аренды считаем дни и месяцы
  if (rentalType.value === 'monthly') {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    
    if (end <= start) return '0 дней'
    
    // Вычисляем разницу в месяцах и днях
    let months = 0
    let days = 0
    
    const startYear = start.getFullYear()
    const startMonth = start.getMonth()
    const startDay = start.getDate()
    
    const endYear = end.getFullYear()
    const endMonth = end.getMonth()
    const endDay = end.getDate()
    
    // Считаем месяцы
    months = (endYear - startYear) * 12 + (endMonth - startMonth)
    
    // Считаем дни
    if (endDay >= startDay) {
      days = endDay - startDay
    } else {
      // Если день окончания меньше дня начала, берем предыдущий месяц
      months--
      const daysInPrevMonth = new Date(endYear, endMonth, 0).getDate()
      days = daysInPrevMonth - startDay + endDay
    }
    
    // Форматируем результат
    if (months === 0) {
      if (days === 0) {
        return '0 дней'
      }
      if (days === 1) {
        return '1 день'
      }
      return `${days} ${days < 5 ? 'дня' : 'дней'}`
    }
    
    if (days === 0) {
      if (months === 1) {
        return '1 месяц'
      }
      if (months < 5) {
        return `${months} месяца`
      }
      return `${months} месяцев`
    }
    
    const monthText = months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'
    const dayText = days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'
    
    return `${months} ${monthText} ${days} ${dayText}`
  }
  
  // Для почасовой и посуточной аренды считаем время
  const start = new Date(`${startDate.value}T${startTime.value}`)
  const end = new Date(`${endDate.value}T${endTime.value}`)
  
  if (end <= start) return '0 минут'
  
  const diffMs = end.getTime() - start.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes} минут`
  }
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (hours < 24) {
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`
    }
    return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} ${minutes} ${minutes === 1 ? 'минута' : minutes < 5 ? 'минуты' : 'минут'}`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  
  if (days === 1) {
    if (remainingHours === 0) {
      return '1 день'
    }
    return `1 день ${remainingHours} ${remainingHours === 1 ? 'час' : remainingHours < 5 ? 'часа' : 'часов'}`
  }
  
  if (remainingHours === 0) {
    return `${days} ${days < 5 ? 'дня' : 'дней'}`
  }
  
  return `${days} ${days < 5 ? 'дня' : 'дней'} ${remainingHours} ${remainingHours === 1 ? 'час' : remainingHours < 5 ? 'часа' : 'часов'}`
})

// Валидация: для почасовой аренды дата окончания должна быть равна дате начала
watch([startDate, rentalType], () => {
  if (rentalType.value === 'hourly' && startDate.value) {
    endDate.value = startDate.value
  }
})

// При изменении типа аренды на почасовую, синхронизируем даты
watch(rentalType, (newType) => {
  if (newType === 'hourly' && startDate.value) {
    endDate.value = startDate.value
  }
})

// Валидация времени: если время начала больше времени окончания, устанавливаем время окончания равным времени начала
watch([startTime, endTime, startDate, endDate], () => {
  // Если даты одинаковые или для почасовой аренды
  if (startDate.value === endDate.value || rentalType.value === 'hourly') {
    if (startTime.value > endTime.value) {
      endTime.value = startTime.value
    }
  }
})

const totalPrice = computed(() => {
  if (rentalType.value === 'hourly') {
    const pricePerHour = parseInt(props.location.priceHour.replace('₽/ч', '').trim())
    // Вычисляем количество часов из продолжительности
    const start = new Date(`${startDate.value}T${startTime.value}`)
    const end = new Date(`${endDate.value}T${endTime.value}`)
    if (end <= start) return `₽0`
    
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)) // Округляем вверх до целых часов
    const total = pricePerHour * diffHours
    return `₽${total}`
  } else if (rentalType.value === 'daily') {
    return props.location.priceDay
  } else {
    return props.location.priceMonth
  }
})

const getRentalTypePrice = (type: 'hourly' | 'daily' | 'monthly') => {
  if (type === 'hourly') return props.location.priceHour
  if (type === 'daily') return props.location.priceDay
  return props.location.priceMonth
}

// При открытии экрана всегда прокручиваем контейнер приложения к началу,
// чтобы в видимой области был заголовок booking-dates__header
onMounted(() => {
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
  // На всякий случай сбрасываем и scroll окна (в Telegram WebApp)
  window.scrollTo(0, 0)
})
</script>

<template>
  <section class="booking-dates">
    <header class="booking-dates__header">
      <button type="button" class="booking-dates__back" @click="emit('back')" aria-label="Назад">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 11.375L8.1875 12C7.875 12.3125 7.40625 12.3125 7.125 12L1.3125 6.125C1 5.8125 1 5.34375 1.3125 5.0625L7.125 -0.8125C7.40625 -1.125 7.90625 -1.125 8.1875 -0.8125L8.75 -0.1875C9.0625 0.125 9.03125 0.59375 8.75 0.90625L4.84375 4.625H13.3438C13.75 4.625 14.0938 4.96875 14.0938 5.375V6.375C14.0938 6.8125 13.75 7.125 13.3438 7.125H4.84375L8.75 10.8438C9.03125 11.1562 9.0625 11.625 8.75 11.375Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="booking-dates__title">Детали бронирования</h1>
      <div class="booking-dates__header-spacer"></div>
    </header>

    <div class="booking-dates__content">
      <!-- Rental Type Selection -->
      <div class="booking-dates__section">
        <label class="booking-dates__label">Выберите тип аренды</label>
        <div class="booking-dates__rental-types">
          <button
            type="button"
            class="booking-dates__rental-type"
            :class="{ 'booking-dates__rental-type--active': rentalType === 'hourly' }"
            @click="rentalType = 'hourly'"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 6V10L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div class="booking-dates__rental-type-content">
              <span class="booking-dates__rental-type-name">Почасовая</span>
              <span class="booking-dates__rental-type-price">{{ getRentalTypePrice('hourly') }}</span>
            </div>
          </button>
          <button
            type="button"
            class="booking-dates__rental-type"
            :class="{ 'booking-dates__rental-type--active': rentalType === 'daily' }"
            @click="rentalType = 'daily'"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 8H17M7 3V5M13 3V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div class="booking-dates__rental-type-content">
              <span class="booking-dates__rental-type-name">Посуточная</span>
              <span class="booking-dates__rental-type-price">{{ getRentalTypePrice('daily') }}</span>
            </div>
          </button>
          <button
            type="button"
            class="booking-dates__rental-type"
            :class="{ 'booking-dates__rental-type--active': rentalType === 'monthly' }"
            @click="rentalType = 'monthly'"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 8H17M7 3V5M13 3V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div class="booking-dates__rental-type-content">
              <span class="booking-dates__rental-type-name">Помесячная</span>
              <span class="booking-dates__rental-type-price">{{ getRentalTypePrice('monthly') }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Date and Time Selection -->
      <div class="booking-dates__section">
        <label class="booking-dates__label">Когда планируете парковаться?</label>
        <div class="booking-dates__date-time">
          <!-- Для почасовой аренды - одно поле даты и время -->
          <template v-if="rentalType === 'hourly'">
            <div class="booking-dates__date-fields">
              <div class="booking-dates__date-field">
                <label class="booking-dates__date-label">Дата</label>
                <input
                  v-model="startDate"
                  type="date"
                  class="booking-dates__date-input"
                  :min="today"
                />
              </div>
            </div>
            <div class="booking-dates__time-fields">
              <div class="booking-dates__time-field">
                <label class="booking-dates__time-label">Время начала</label>
                <TimePickerScroll v-model="startTime" />
              </div>
              <div class="booking-dates__time-field">
                <label class="booking-dates__time-label">Время окончания</label>
                <TimePickerScroll v-model="endTime" />
              </div>
            </div>
          </template>

          <!-- Для помесячной аренды - только даты без времени -->
          <template v-else-if="rentalType === 'monthly'">
            <div class="booking-dates__date-fields">
              <div class="booking-dates__date-field">
                <label class="booking-dates__date-label">С даты</label>
                <input
                  v-model="startDate"
                  type="date"
                  class="booking-dates__date-input"
                  :min="today"
                />
              </div>
              <div class="booking-dates__date-field">
                <label class="booking-dates__date-label">По дату</label>
                <input
                  v-model="endDate"
                  type="date"
                  class="booking-dates__date-input"
                  :min="startDate || today"
                />
              </div>
            </div>
          </template>

          <!-- Для посуточной аренды - даты и время -->
          <template v-else>
            <div class="booking-dates__date-fields">
              <div class="booking-dates__date-field">
                <label class="booking-dates__date-label">С даты</label>
                <input
                  v-model="startDate"
                  type="date"
                  class="booking-dates__date-input"
                  :min="today"
                />
              </div>
              <div class="booking-dates__date-field">
                <label class="booking-dates__date-label">По дату</label>
                <input
                  v-model="endDate"
                  type="date"
                  class="booking-dates__date-input"
                  :min="startDate || today"
                />
              </div>
            </div>
            <div class="booking-dates__time-fields">
              <div class="booking-dates__time-field">
                <label class="booking-dates__time-label">Время начала</label>
                <TimePickerScroll v-model="startTime" />
              </div>
              <div class="booking-dates__time-field">
                <label class="booking-dates__time-label">Время окончания</label>
                <TimePickerScroll v-model="endTime" />
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Duration and Total -->
      <div class="booking-dates__summary">
        <div class="booking-dates__summary-item">
          <span class="booking-dates__summary-label">Продолжительность</span>
          <span class="booking-dates__summary-value">{{ duration }}</span>
        </div>
        <div class="booking-dates__summary-item">
          <span class="booking-dates__summary-label">Итого к оплате</span>
          <span class="booking-dates__summary-price">{{ totalPrice }}</span>
        </div>
      </div>

      <!-- Cancellation Info -->
      <div class="booking-dates__info">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 12C7.45 12 7 11.55 7 11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11C9 11.55 8.55 12 8 12ZM9 9H7V4H9V9Z" fill="#16A34A"/>
        </svg>
        <span>Бесплатная отмена до начала бронирования</span>
      </div>

      <!-- Rental Type Info -->
      <div v-if="rentalType === 'daily'" class="booking-dates__info">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 12C7.45 12 7 11.55 7 11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11C9 11.55 8.55 12 8 12ZM9 9H7V4H9V9Z" fill="#16A34A"/>
        </svg>
        <span>Суточный тариф- оплата за полные сутки, даже если вы приедете и уедете ранее</span>
      </div>

      <div v-if="rentalType === 'monthly'" class="booking-dates__info">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 12C7.45 12 7 11.55 7 11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11C9 11.55 8.55 12 8 12ZM9 9H7V4H9V9Z" fill="#16A34A"/>
        </svg>
        <span>Предоплата производится за один месяц. Далее списание по месяц. Не полный месяц оплачивается полностью</span>
      </div>

      <!-- Car Selection -->
      <div class="booking-dates__section">
        <label class="booking-dates__label">Автомобиль</label>
        <div v-if="userCar" class="booking-dates__car-card">
          <div class="booking-dates__car-icon">
            <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5703 4.375C19.8828 4.375 20.1172 4.6875 20.0391 4.96094L19.8047 5.89844C19.7656 6.13281 19.5703 6.25 19.375 6.25H18.5547C19.1016 6.71875 19.4531 7.38281 19.4531 8.125V10C19.4531 10.6641 19.1797 11.2109 18.8281 11.6406V13.75C18.8281 14.4531 18.2422 15 17.5781 15H16.3281C15.625 15 15.0781 14.4531 15.0781 13.75V12.5H5.07812V13.75C5.07812 14.4531 4.49219 15 3.82812 15H2.57812C1.875 15 1.32812 14.4531 1.32812 13.75V11.6406C0.9375 11.2109 0.703125 10.6641 0.703125 10V8.125C0.703125 7.38281 1.01562 6.71875 1.5625 6.25H0.78125C0.546875 6.25 0.351562 6.13281 0.3125 5.89844L0.078125 4.96094C0 4.6875 0.234375 4.375 0.546875 4.375H2.85156L3.51562 2.77344C4.17969 1.09375 5.78125 0 7.57812 0H12.5391C14.3359 0 15.9375 1.09375 16.6016 2.77344L17.2656 4.375H19.5703ZM5.82031 3.71094L5.07812 5.625H15.0781L14.2969 3.71094C13.9844 2.96875 13.3203 2.5 12.5391 2.5H7.57812C6.79688 2.5 6.13281 2.96875 5.82031 3.71094ZM3.82812 10C4.57031 10 5.70312 10.1172 5.70312 9.375C5.70312 8.63281 4.57031 7.5 3.82812 7.5C3.04688 7.5 2.57812 8.00781 2.57812 8.75C2.57812 9.53125 3.04688 10 3.82812 10ZM16.3281 10C17.0703 10 17.5781 9.53125 17.5781 8.75C17.5781 8.00781 17.0703 7.5 16.3281 7.5C15.5469 7.5 14.4531 8.63281 14.4531 9.375C14.4531 10.1172 15.5469 10 16.3281 10Z" fill="#4B5563"/>
            </svg>
          </div>
          <div class="booking-dates__car-info">
            <div class="booking-dates__car-name">{{ userCar.brand }} {{ userCar.model }}</div>
            <div class="booking-dates__car-details">{{ userCar.color || 'или в две линии' }}</div>
          </div>
          <div class="booking-dates__car-number">{{ userCar.number }}{{ userCar.region ? userCar.region : '' }}</div>
        </div>
        <button type="button" class="booking-dates__change-button" @click="userCar ? emit('change-car') : emit('add-car')">
          <div class="booking-dates__change-icon">+</div>
          <span>{{ userCar ? 'Изменить автомобиль' : 'Добавить автомобиль' }}</span>
        </button>
      </div>

      <!-- Payment Card Selection -->
      <div class="booking-dates__section">
        <label class="booking-dates__label">Карта для оплаты</label>
        <div v-if="paymentCard" class="booking-dates__card-selected">
          <div class="booking-dates__card-info">
            <div class="booking-dates__card-icon">
              <div v-if="paymentCard.type === 'visa'" class="booking-dates__card-icon-visa">
                <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5234 7.03125C16.5234 7.03125 16.7695 8.33203 16.8398 8.61328H15.6797C15.7852 8.29688 16.2422 7.06641 16.2422 7.06641C16.207 7.10156 16.3477 6.75 16.418 6.53906L16.5234 7.03125ZM20.25 1.6875V14.0625C20.25 15.0117 19.4766 15.75 18.5625 15.75H1.6875C0.738281 15.75 0 15.0117 0 14.0625V1.6875C0 0.773438 0.738281 0 1.6875 0H18.5625C19.4766 0 20.25 0.773438 20.25 1.6875ZM5.34375 10.5469L7.55859 5.0625H6.08203L4.67578 8.78906L4.53516 8.05078L4.04297 5.55469C3.97266 5.20312 3.72656 5.09766 3.41016 5.0625H1.125V5.20312C1.65234 5.34375 2.14453 5.51953 2.60156 5.80078L3.86719 10.5469H5.34375ZM8.64844 10.5469L9.5625 5.0625H8.12109L7.24219 10.5469H8.64844ZM13.5703 8.75391C13.6055 8.12109 13.2188 7.66406 12.4102 7.27734C11.918 7.03125 11.6016 6.85547 11.6016 6.60938C11.6016 6.36328 11.8477 6.11719 12.4102 6.11719C12.8672 6.11719 13.2188 6.22266 13.4648 6.32812L13.6055 6.39844L13.7812 5.20312C13.5 5.09766 13.0781 4.99219 12.5156 4.99219C11.1094 4.99219 10.125 5.73047 10.125 6.78516C10.125 7.55859 10.8281 8.01562 11.3555 8.26172C11.918 8.54297 12.0938 8.71875 12.0938 8.92969C12.0938 9.31641 11.6719 9.49219 11.25 9.49219C10.6875 9.49219 10.4062 9.38672 9.91406 9.17578L9.73828 9.10547L9.5625 10.3359C9.87891 10.4766 10.4766 10.6172 11.1094 10.6172C12.6211 10.6172 13.5703 9.87891 13.5703 8.75391ZM18.5625 10.5469L17.4023 5.0625H16.3125C15.9609 5.0625 15.7148 5.16797 15.5742 5.51953L13.4648 10.5469H14.9766C14.9766 10.5469 15.1875 9.87891 15.2578 9.73828H17.0859C17.1211 9.91406 17.2266 10.5469 17.2266 10.5469H18.5625Z" fill="#2563EB"/>
                </svg>
              </div>
              <div v-else-if="paymentCard.type === 'mastercard'" class="booking-dates__card-icon-mastercard">
                <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.9453 13.2891C16.9453 13.5352 16.8047 13.6758 16.5586 13.6758C16.3125 13.6758 16.1719 13.5 16.1719 13.2891C16.1719 13.043 16.3125 12.8672 16.5586 12.8672C16.8047 12.8672 16.9453 13.043 16.9453 13.2891ZM6.04688 12.8672C6.25781 12.8672 6.39844 13.043 6.43359 13.2891C6.43359 13.5352 6.25781 13.6758 6.04688 13.6758C5.80078 13.6758 5.625 13.5 5.625 13.2891C5.625 13.043 5.80078 12.8672 6.04688 12.8672ZM10.1602 12.8672C10.3359 12.8672 10.4766 12.9727 10.5117 13.1484H9.84375C9.84375 12.9727 9.98438 12.8672 10.1602 12.8672ZM13.957 12.8672C14.2031 12.8672 14.3438 13.043 14.3438 13.2891C14.3438 13.5352 14.2031 13.6758 13.957 13.6758C13.7109 13.6758 13.5703 13.5 13.5703 13.2891C13.5703 13.043 13.7109 12.8672 13.957 12.8672ZM17.6836 13.7812V13.8164C17.6836 13.8516 17.6836 13.8516 17.6836 13.8516C17.6836 13.8867 17.6836 13.8867 17.6484 13.8867C17.6484 13.8867 17.6484 13.9219 17.6133 13.9219C17.6133 13.9219 17.6133 13.9219 17.5781 13.9219C17.5781 13.9219 17.5781 13.9219 17.543 13.9219C17.543 13.9219 17.543 13.8867 17.5078 13.8867C17.5078 13.8867 17.5078 13.8867 17.5078 13.8516C17.4727 13.8516 17.4727 13.8516 17.4727 13.8164C17.4727 13.8164 17.4727 13.7812 17.5078 13.7812V13.7461C17.543 13.7461 17.543 13.7461 17.543 13.7461C17.5781 13.7109 17.5781 13.7109 17.5781 13.7109C17.6133 13.7109 17.6133 13.7109 17.6133 13.7461C17.6484 13.7461 17.6484 13.7461 17.6484 13.7461C17.6836 13.7461 17.6836 13.7812 17.6836 13.7812ZM17.6133 13.8516V13.8164C17.6484 13.8164 17.6484 13.8164 17.6484 13.7812C17.6484 13.7812 17.6484 13.7812 17.6133 13.7812C17.6133 13.7812 17.6133 13.7461 17.5781 13.7461H17.543V13.8867H17.5781V13.8164L17.6133 13.8867H17.6484L17.6133 13.8516ZM20.25 1.6875V14.0625C20.25 15.0117 19.4766 15.75 18.5625 15.75H1.6875C0.738281 15.75 0 15.0117 0 14.0625V1.6875C0 0.773438 0.738281 0 1.6875 0H18.5625C19.4766 0 20.25 0.773438 20.25 1.6875ZM2.25 6.60938C2.25 9.31641 4.42969 11.4961 7.10156 11.4961C8.05078 11.4961 9 11.1797 9.80859 10.6523C7.24219 8.57812 7.24219 4.64062 9.80859 2.56641C9 2.03906 8.05078 1.75781 7.10156 1.75781C4.42969 1.75781 2.25 3.9375 2.25 6.60938ZM10.125 10.4414C12.5859 8.50781 12.5859 4.74609 10.125 2.77734C7.62891 4.74609 7.62891 8.50781 10.125 10.4414ZM5.09766 13.1133C5.09766 12.7969 4.92188 12.6211 4.60547 12.5859C4.42969 12.5859 4.25391 12.6562 4.14844 12.832C4.04297 12.6914 3.90234 12.5859 3.72656 12.5859C3.58594 12.5859 3.44531 12.6562 3.33984 12.7969V12.6211H3.05859V13.9219H3.33984C3.33984 13.2539 3.23438 12.8672 3.65625 12.8672C4.00781 12.8672 3.9375 13.2188 3.9375 13.9219H4.21875C4.21875 13.2891 4.14844 12.8672 4.53516 12.8672C4.88672 12.8672 4.81641 13.2188 4.81641 13.9219H5.09766V13.1133ZM6.67969 12.6211H6.39844V12.7969C6.32812 12.6914 6.1875 12.5859 6.01172 12.5859C5.625 12.5859 5.34375 12.9023 5.34375 13.2891C5.34375 13.6758 5.625 13.957 6.01172 13.957C6.1875 13.957 6.32812 13.8867 6.39844 13.7812V13.9219H6.67969V12.6211ZM8.12109 13.5352C8.12109 13.0078 7.3125 13.2539 7.3125 13.0078C7.3125 12.7969 7.73438 12.832 7.94531 12.9727L8.08594 12.7266C7.73438 12.5156 6.99609 12.5156 6.99609 13.0078C6.99609 13.5352 7.80469 13.3242 7.80469 13.5352C7.80469 13.7812 7.34766 13.7461 7.10156 13.5703L6.96094 13.8164C7.34766 14.0625 8.12109 14.0273 8.12109 13.5352ZM9.35156 13.8516L9.28125 13.6406C9.14062 13.7109 8.85938 13.7812 8.85938 13.4648V12.9023H9.31641V12.6211H8.85938V12.2344H8.54297V12.6211H8.29688V12.9023H8.54297V13.4648C8.54297 14.0977 9.17578 13.9922 9.35156 13.8516ZM9.80859 13.3945H10.793C10.793 12.832 10.5117 12.5859 10.1602 12.5859C9.80859 12.5859 9.52734 12.8672 9.52734 13.2891C9.52734 13.9922 10.3359 14.1328 10.7227 13.7812L10.582 13.5703C10.3008 13.7812 9.91406 13.7812 9.80859 13.3945ZM11.8828 12.6211C11.7422 12.5508 11.4961 12.5859 11.3555 12.7969V12.6211H11.0742V13.9219H11.3555V13.1836C11.3555 12.7969 11.707 12.832 11.8125 12.9023L11.8828 12.6211ZM12.2695 13.2891C12.2695 12.8672 12.6914 12.7617 13.0078 12.9727L13.1484 12.7617C12.7266 12.4453 11.9883 12.6211 11.9883 13.2891C11.9883 13.9922 12.7617 14.1328 13.1484 13.8164L13.0078 13.5703C12.6914 13.8164 12.2695 13.6758 12.2695 13.2891ZM14.625 12.6211H14.3438V12.7969C14.0273 12.4102 13.2891 12.6211 13.2891 13.2891C13.2891 13.957 14.0625 14.1328 14.3438 13.7812V13.9219H14.625V12.6211ZM15.7852 12.6211C15.7148 12.5859 15.3984 12.5508 15.2578 12.7969V12.6211H14.9766V13.9219H15.2578V13.1836C15.2578 12.7969 15.5742 12.832 15.7148 12.9023L15.7852 12.6211ZM17.2266 12.1289H16.9453V12.7969C16.6641 12.4102 15.8906 12.6211 15.8906 13.2891C15.8906 13.957 16.6641 14.1328 16.9453 13.7812V13.9219H17.2266V12.1289ZM17.4727 9.45703V9.63281H17.5078V9.45703H17.5781H17.4023H17.4727ZM17.7188 13.8164V13.7812C17.6836 13.7461 17.6836 13.7461 17.6836 13.7461C17.6836 13.7109 17.6484 13.7109 17.6484 13.7109C17.6133 13.7109 17.6133 13.6758 17.5781 13.6758L17.543 13.7109C17.5078 13.7109 17.5078 13.7109 17.5078 13.7461C17.4727 13.7461 17.4727 13.7461 17.4727 13.7812V13.8164C17.4727 13.8516 17.4727 13.8516 17.4727 13.8867C17.4727 13.8867 17.4727 13.8867 17.5078 13.9219C17.5078 13.9219 17.5078 13.9219 17.543 13.957H17.5781C17.6133 13.957 17.6133 13.957 17.6484 13.957C17.6484 13.9219 17.6836 13.9219 17.6836 13.9219C17.6836 13.8867 17.6836 13.8867 17.7188 13.8867C17.7188 13.8516 17.7188 13.8516 17.7188 13.8164ZM17.8242 9.45703H17.7891L17.7188 9.5625L17.6836 9.45703H17.6133V9.63281H17.6484V9.49219L17.7188 9.59766H17.7539L17.7891 9.49219V9.63281H17.8242V9.45703ZM18 6.60938C18 3.9375 15.7852 1.75781 13.1133 1.75781C12.1641 1.75781 11.2148 2.03906 10.4414 2.56641C12.9727 4.64062 13.0078 8.57812 10.4414 10.6523C11.2148 11.1797 12.1641 11.4609 13.1133 11.4609C15.7852 11.4961 18 9.31641 18 6.60938Z" fill="#DC2626"/>
                </svg>
              </div>
              <div v-else-if="paymentCard.type === 'mir'" class="booking-dates__card-icon-mir">
                <svg width="23" height="8" viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-7.97288e-05 -3.00451e-05H1.93415L3.97705 4.98406H4.06398L6.10688 -3.00451e-05H8.04111V7.41815H6.51981V2.58981H6.45823L4.53849 7.38193H3.50255L1.5828 2.5717H1.52123V7.41815H-7.97288e-05V-3.00451e-05ZM9.33332 -3.00451e-05H10.8981V4.66531H10.9597L14.1653 -3.00451e-05H15.5381V7.41815H13.9697V2.74919H13.9153L10.6916 7.41815H9.33332V-3.00451e-05ZM16.8339 7.41815V-3.00451e-05H19.7606C20.3233 -3.00451e-05 20.8026 0.107427 21.1986 0.322342C21.5946 0.534842 21.8965 0.830652 22.1041 1.20977C22.3142 1.58648 22.4193 2.02113 22.4193 2.51375C22.4193 3.00636 22.313 3.44102 22.1005 3.81773C21.888 4.19443 21.5801 4.48783 21.1769 4.69791C20.776 4.908 20.2907 5.01304 19.7208 5.01304H17.8554V3.75615H19.4672C19.7691 3.75615 20.0178 3.70423 20.2134 3.6004C20.4114 3.49415 20.5587 3.34805 20.6553 3.16211C20.7543 2.97376 20.8038 2.75764 20.8038 2.51375C20.8038 2.26744 20.7543 2.05253 20.6553 1.869C20.5587 1.68307 20.4114 1.53939 20.2134 1.43797C20.0154 1.33413 19.7642 1.28221 19.46 1.28221H18.4023V7.41815H16.8339Z" fill="#10B981"/>
                </svg>
              </div>
            </div>
            <div class="booking-dates__card-details">
              <div class="booking-dates__card-name">{{ paymentCard.name }}</div>
              <div class="booking-dates__card-number">
                {{ paymentCard.type === 'visa' ? 'VISA' : paymentCard.type === 'mastercard' ? 'MasterCard' : 'МИР' }} •••• {{ paymentCard.lastFour }}
              </div>
            </div>
          </div>
        </div>
        <button v-if="paymentCard" type="button" class="booking-dates__change-button" @click="emit('change-payment-card')">
          <div class="booking-dates__change-icon">+</div>
          <span>Изменить карту</span>
        </button>
        <button v-else type="button" class="booking-dates__change-button" @click="emit('change-payment-card')">
          <div class="booking-dates__change-icon">+</div>
          <span>Выбрать карту</span>
        </button>
      </div>
    </div>

    <!-- Footer Button -->
    <footer class="booking-dates__footer">
      <button 
        type="button" 
        class="booking-dates__book-button"
        :class="{ 'booking-dates__book-button--disabled': !canBook }"
        :disabled="!canBook"
        @click="emit('book', {
          address: location.address,
          startDate: String(startDate || today),
          endDate: String(endDate || today),
          startTime: String(startTime || '10:00'),
          endTime: String(endTime || '12:00'),
          rentalType: rentalType as 'hourly' | 'daily' | 'monthly'
        })"
      >
        Забронировать
      </button>
    </footer>
  </section>
</template>

<style scoped>
.booking-dates {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-y: auto;
  padding-top: 0;
  margin-top: 0;
}

.booking-dates__header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: calc(env(safe-area-inset-top) + 12px) 18px 12px;
  background: white;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.booking-dates__back {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E2E8F0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.booking-dates__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  color: #1F2937;
  flex: 1;
  text-align: center;
}

.booking-dates__header-spacer {
  width: 30px;
  flex-shrink: 0;
}

.booking-dates__content {
  flex: 1;
  padding: 8.5px 18px;
  overflow-y: auto;
  padding-bottom: 20px;
}

.booking-dates__section {
  margin-bottom: 9px;
}

.booking-dates__label {
  display: block;
  margin-bottom: 3.5px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  line-height: 1.92;
  color: #4B5563;
}

.booking-dates__rental-types {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.booking-dates__rental-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 7.5px 13px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 78px;
}

.booking-dates__rental-type--active {
  background: #2563EB;
  border-color: #2563EB;
  color: white;
}

.booking-dates__rental-type svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

.booking-dates__rental-type--active svg {
  stroke: white;
}

.booking-dates__rental-type-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.booking-dates__rental-type-name {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.8px;
  line-height: 2.04;
  color: currentColor;
}

.booking-dates__rental-type-price {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.7px;
  line-height: 2.06;
  color: currentColor;
  opacity: 0.75;
}

.booking-dates__date-time {
  display: flex;
  flex-direction: column;
  gap: 9.5px;
}

.booking-dates__date-fields {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

/* Для одной даты (почасовая аренда) */
.booking-dates__date-fields:has(.booking-dates__date-field:only-child) {
  display: grid;
  grid-template-columns: 1fr;
}

.booking-dates__date-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3.5px;
  position: relative;
}

.booking-dates__date-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  line-height: 1.92;
  color: #4B5563;
}

.booking-dates__date-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: white;
  font-family: Inter, sans-serif;
  font-size: 12.8px;
  color: #000000;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.booking-dates__time-fields {
  display: flex;
  gap: 12px;
}

.booking-dates__time-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3.5px;
}

.booking-dates__time-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  line-height: 1.92;
  color: #4B5563;
}

.booking-dates__time-input {
  width: 100%;
  padding: 10px 28px 10px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: #FFFFFF;
  font-family: Inter, sans-serif;
  font-size: 11.6px;
  color: #000000;
  cursor: pointer;
}

.booking-dates__summary {
  background: #F3F4F6;
  border-radius: 12px;
  padding: 9.5px 12px 8.5px;
  margin-bottom: 9px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-dates__summary-item {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.booking-dates__summary-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  line-height: 1.92;
  color: #4B5563;
}

.booking-dates__summary-value {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 11.6px;
  line-height: 2.07;
  color: #1F2937;
}

.booking-dates__summary-price {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 11.3px;
  line-height: 2.48;
  color: #2563EB;
  text-align: right;
}

.booking-dates__info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7.5px 10px 8.5px 7px;
  background: #DCFCE7;
  border: 1px solid #DCFCE7;
  border-radius: 12px;
  margin-bottom: 9px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #166534;
}

.booking-dates__info svg {
  flex-shrink: 0;
}

.booking-dates__car-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  margin-bottom: 8px;
}

.booking-dates__car-icon {
  width: 40px;
  height: 40px;
  background: #E2E8F0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-dates__car-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.booking-dates__car-name {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #1F2937;
}

.booking-dates__car-details {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #1F2937;
}

.booking-dates__car-number {
  padding: 4px 12px;
  background: #E2E8F0;
  border-radius: 8px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #1F2937;
  white-space: nowrap;
}

.booking-dates__change-button {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 17px;
  border: 1px dashed #D1D5DB;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #1F2937;
}

.booking-dates__change-icon {
  width: 19px;
  height: 17px;
  background: #E2E8F0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Font Awesome 5 Free, sans-serif;
  font-weight: 900;
  font-size: 14px;
  color: #4B5563;
}

.booking-dates__footer {
  padding: 13px 18px;
  padding-bottom: calc(13px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #E2E8F0;
  box-shadow: 0 -4px 6px -4px rgba(0, 0, 0, 0.1);
}

.booking-dates__book-button {
  width: 100%;
  padding: 16px 0 16px;
  background: #3B60F4;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.2px;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.booking-dates__book-button:active {
  background: #254ED8;
}

.booking-dates__book-button--disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.booking-dates__book-button--disabled:active {
  background: #9CA3AF;
}

.booking-dates__card-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  margin-bottom: 8px;
}

.booking-dates__card-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.booking-dates__card-icon {
  width: 40px;
  height: 40px;
  background: #F3F4F6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-dates__card-icon-visa {
  background-color: transparent;
  width: 21px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-dates__card-icon-visa svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.booking-dates__card-icon-mastercard {
  /* background-color: #ea580c; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.booking-dates__card-icon-mir {
  /* background-color: #10b981; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.booking-dates__card-icon svg {
  width: 100%;
  height: auto;
}

.booking-dates__card-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  text-align: center;
}

.booking-dates__card-name {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #1F2937;
}

.booking-dates__card-number {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.4px;
  color: #1F2937;
}
</style>

