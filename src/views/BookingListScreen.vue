<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { ParkingSpot } from '../data/parkings'
import { featuredParkings } from '../data/parkings'
import parkingLotImage from '../assets/images/parkinglot.jpg'

type Booking = {
  id: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  rentalType: 'hourly' | 'daily' | 'monthly'
  createdAt: Date
  status: 'awaiting' | 'confirmed' | 'active' | 'completed'
  parkingSpotId?: string
}

const props = defineProps<{
  bookings?: Booking[]
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-booking', booking: Booking): void
  (e: 'open-chat', booking: Booking): void
}>()

const filterType = ref<'all' | 'active'>('all')
const contentRef = ref<HTMLElement | null>(null)

const filteredBookings = computed(() => {
  if (!props.bookings) return []
  
  if (filterType.value === 'active') {
    return props.bookings.filter(b => b.status === 'awaiting' || b.status === 'confirmed' || b.status === 'active')
  }
  
  return props.bookings
})

const formatBookingDate = (booking: Booking): string => {
  const startDate = new Date(`${booking.startDate}T${booking.startTime}`)
  const endDate = new Date(`${booking.endDate}T${booking.endTime}`)
  
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
  
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (booking.startDate === booking.endDate) {
    return `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} — ${timeFormatter.format(endDate)}`
  } else {
    return `${dateFormatter.format(startDate)} — ${dateFormatter.format(endDate)}`
  }
}

const getStatusLabel = (status: Booking['status']): string => {
  switch (status) {
    case 'awaiting':
      return 'Ожидает подтверждения'
    case 'confirmed':
      return 'Подтверждено'
    case 'active':
      return 'Активно'
    case 'completed':
      return 'Завершено'
    default:
      return ''
  }
}

const getStatusColor = (status: Booking['status']): string => {
  switch (status) {
    case 'awaiting':
      return '#DC2626'
    case 'confirmed':
      return '#22C55E'
    case 'active':
      return '#22C55E'
    case 'completed':
      return '#6B7280'
    default:
      return '#6B7280'
  }
}

const getStatusText = (status: Booking['status']): string => {
  switch (status) {
    case 'awaiting':
      return 'Ожидает подтверждения'
    case 'confirmed':
      return 'Ожидает старта бронирования'
    case 'active':
      return 'Активно'
    case 'completed':
      return 'Завершено'
    default:
      return ''
  }
}

const getParkingSpot = (booking: Booking): ParkingSpot | null => {
  if (booking.parkingSpotId) {
    return featuredParkings.find(p => p.id === booking.parkingSpotId) || null
  }
  // Если нет ID, ищем по адресу
  return featuredParkings.find(p => booking.address.includes(p.address) || p.address.includes(booking.address)) || null
}

const getOwnerName = (booking: Booking): string => {
  // Моковое имя владельца
  return 'Михаил'
}

const handleWriteClick = (e: Event, booking: Booking) => {
  e.stopPropagation()
  emit('open-chat', booking)
}

onMounted(async () => {
  await nextTick()
  if (contentRef.value) {
    contentRef.value.scrollTop = 0
  }
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
  window.scrollTo(0, 0)
})
</script>

<template>
  <section class="booking-list">
    <header class="booking-list__header">
      <button type="button" class="booking-list__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <h1 class="booking-list__title">Мои брони</h1>
      <div class="booking-list__header-spacer"></div>
    </header>

    <div class="booking-list__filters">
      <button
        type="button"
        class="booking-list__filter"
        :class="{ 'booking-list__filter--active': filterType === 'all' }"
        @click="filterType = 'all'"
      >
        Все бронирования
      </button>
      <button
        type="button"
        class="booking-list__filter"
        :class="{ 'booking-list__filter--active': filterType === 'active' }"
        @click="filterType = 'active'"
      >
        Только активные
      </button>
    </div>

    <div ref="contentRef" class="booking-list__content">
      <div v-if="filteredBookings.length > 0" class="booking-list__bookings">
        <article
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="booking-list__booking-card"
        >
          <!-- Status Bar -->
          <div 
            v-if="booking.status === 'confirmed' || booking.status === 'active'"
            class="booking-list__status-bar"
            :style="{ backgroundColor: getStatusColor(booking.status) === '#22C55E' ? '#D1FAE5' : '#F3F4F6' }"
          >
            <div 
              class="booking-list__status-indicator"
              :style="{ backgroundColor: getStatusColor(booking.status) }"
            ></div>
            <span class="booking-list__status-text">{{ getStatusText(booking.status) }}</span>
          </div>

          <!-- Photo Container -->
          <div class="booking-list__photo-wrapper">
            <div class="booking-list__photo-container">
              <img 
                :src="parkingLotImage" 
                alt="Парковочное место"
                class="booking-list__photo"
                @click="emit('open-booking', booking)"
              />
              <div class="booking-list__photo-overlay">
                <span>1/3</span>
              </div>
            </div>
          </div>

          <!-- Booking Details -->
          <div class="booking-list__booking-info">
            <div class="booking-list__info-content">
              <div class="booking-list__info-icon">
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.6562 3.5C15.9062 3.5 16.0938 3.75 16.0312 3.96875L15.8438 4.71875C15.8125 4.90625 15.6562 5 15.5 5H14.8438C15.2812 5.375 15.5625 5.90625 15.5625 6.5V8C15.5625 8.53125 15.3438 8.96875 15.0625 9.3125V11C15.0625 11.5625 14.5938 12 14.0625 12H13.0625C12.5 12 12.0625 11.5625 12.0625 11V10H4.0625V11C4.0625 11.5625 3.59375 12 3.0625 12H2.0625C1.5 12 1.0625 11.5625 1.0625 11V9.3125C0.75 8.96875 0.5625 8.53125 0.5625 8V6.5C0.5625 5.90625 0.8125 5.375 1.25 5H0.625C0.4375 5 0.28125 4.90625 0.25 4.71875L0.0625 3.96875C0 3.75 0.1875 3.5 0.4375 3.5H2.28125L2.8125 2.21875C3.34375 0.875 4.625 0 6.0625 0H10.0312C11.4688 0 12.75 0.875 13.2812 2.21875L13.8125 3.5H15.6562ZM4.65625 2.96875L4.0625 4.5H12.0625L11.4375 2.96875C11.1875 2.375 10.6562 2 10.0312 2H6.0625C5.4375 2 4.90625 2.375 4.65625 2.96875ZM3.0625 8C3.65625 8 4.5625 8.09375 4.5625 7.5C4.5625 6.90625 3.65625 6 3.0625 6C2.4375 6 2.0625 6.40625 2.0625 7C2.0625 7.625 2.4375 8 3.0625 8ZM13.0625 8C13.6562 8 14.0625 7.625 14.0625 7C14.0625 6.40625 13.6562 6 13.0625 6C12.4375 6 11.5625 6.90625 11.5625 7.5C11.5625 8.09375 12.4375 8 13.0625 8Z" fill="#2563EB"/>
                </svg>
              </div>
              <div class="booking-list__info-details">
                <p class="booking-list__address">{{ booking.address }}</p>
                <p class="booking-list__address-placeholder">или в две строки</p>
                <p class="booking-list__datetime">{{ formatBookingDate(booking) }}</p>
              </div>
            </div>
            <div class="booking-list__owner-row">
              <div class="booking-list__owner">
                <span class="booking-list__owner-name">{{ getOwnerName(booking) }}</span>
                <span class="booking-list__owner-role">Владелец места</span>
              </div>
              <button
                type="button"
                class="booking-list__write-button"
                @click="handleWriteClick($event, booking)"
              >
                Написать
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="booking-list__empty">
        <div class="booking-list__empty-icon">
          <svg width="46" height="37" viewBox="0 0 46 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.64062 17.0156C4.64062 15.75 4.85156 14.4844 5.20312 13.2891L28.125 30.9375C26.3672 31.4297 24.5391 31.6406 22.6406 31.6406C19.8984 31.6406 17.3672 31.1484 15.0469 30.3047C13.3594 31.7109 9.84375 33.8906 5.20312 33.8906C4.92188 33.8906 4.78125 33.8203 4.64062 33.6094C4.57031 33.3984 4.64062 33.1172 4.78125 32.9766C4.78125 32.9062 7.73438 29.7422 8.64844 26.2266C6.11719 23.6953 4.64062 20.5312 4.64062 17.0156ZM44.6484 32.4141C45.1406 32.7656 45.2812 33.4688 44.8594 33.9609L43.5234 35.7188C43.1016 36.2109 42.3984 36.2812 41.9062 35.9297L0.5625 3.9375C0.0703125 3.58594 0 2.88281 0.351562 2.39062L1.75781 0.632812C2.10938 0.140625 2.8125 0 3.30469 0.421875L10.6875 6.11719C13.8516 3.86719 18 2.39062 22.6406 2.39062C32.5547 2.39062 40.6406 9 40.6406 17.0156C40.6406 20.5312 39.0938 23.6953 36.6328 26.1562L44.6484 32.4141Z" fill="#D1D5DB"/>
          </svg>
        </div>
        <p class="booking-list__empty-text">У вас пока нет бронирований</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-list {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;
}

.booking-list__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  color: #f8fafc;
}

.booking-list__back {
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

.booking-list__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.booking-list__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  color: #ffffff;
  flex: 1;
  text-align: center;
}

.booking-list__header-spacer {
  width: 40px;
  flex-shrink: 0;
}

.booking-list__filters {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.booking-list__filter {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.booking-list__filter--active {
  background: #2563eb;
  color: #ffffff;
}

.booking-list__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  justify-content: center;
}

.booking-list__bookings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 428px;
}

.booking-list__booking-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.booking-list__status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin: 0 12px 12px 12px;
  border-radius: 9999px;
  border: 1px solid #22C55E;
  width: calc(100% - 24px);
  box-sizing: border-box;
}

.booking-list__photo-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.booking-list__status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.booking-list__status-text {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.5;
  color: #1f2937;
}

.booking-list__photo-container {
  position: relative;
  width: calc(100% - 24px);
  height: 192px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  margin: 0 12px;
  box-sizing: border-box;
}

.booking-list__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.booking-list__photo-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 4px 8px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #ffffff;
}

.booking-list__booking-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-list__info-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.booking-list__info-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-list__info-icon svg {
  width: 17px;
  height: 12px;
  display: block;
}

.booking-list__info-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.booking-list__address {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.4;
}

.booking-list__address-placeholder {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

.booking-list__datetime {
  margin: 4px 0 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.booking-list__owner-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.booking-list__owner {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.booking-list__owner-name {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
}

.booking-list__owner-role {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #6b7280;
}

.booking-list__write-button {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: #9333ea;
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.booking-list__write-button:hover {
  background: #7c3aed;
}

.booking-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  width: 100%;
  max-width: 428px;
  margin: 0 auto;
}

.booking-list__empty-icon {
  margin-bottom: 16px;
}

.booking-list__empty-icon svg {
  width: 46px;
  height: 37px;
  display: block;
}

.booking-list__empty-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .booking-list__header {
    padding: calc(env(safe-area-inset-top) + 20px) 20px 20px;
  }

  .booking-list__filters {
    padding: 12px 20px;
  }

  .booking-list__content {
    padding: 12px 20px;
  }

  .booking-list__bookings {
    max-width: 100%;
  }

  .booking-list__booking-card {
    padding: 14px;
  }
}

@media (min-width: 768px) {
  .booking-list__content {
    padding: 24px 48px;
  }

  .booking-list__bookings {
    max-width: 600px;
  }

  .booking-list__empty {
    max-width: 600px;
  }
}

@media (min-width: 1024px) {
  .booking-list__bookings {
    max-width: 700px;
  }

  .booking-list__empty {
    max-width: 700px;
  }
}

@media (min-width: 1440px) {
  .booking-list__bookings {
    max-width: 600px;
  }

  .booking-list__empty {
    max-width: 600px;
  }
}
</style>

