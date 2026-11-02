<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

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
}

const props = defineProps<{
  bookings?: Booking[]
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-chat', booking: Booking): void
  (e: 'open-support-chat'): void
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
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
  
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (booking.startDate === booking.endDate) {
    return `${dateFormatter.format(startDate)} с ${timeFormatter.format(startDate)} по ${timeFormatter.format(endDate)}`
  } else {
    return `${dateFormatter.format(startDate)} с ${timeFormatter.format(startDate)} по ${dateFormatter.format(endDate)} ${timeFormatter.format(endDate)}`
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
    case 'completed':
      return '#6B7280'
    default:
      return '#6B7280'
  }
}

const getContactName = (booking: Booking): { name: string; role: string } => {
  // Моковые данные для контакта
  if (booking.status === 'awaiting') {
    return { name: 'Михаил', role: 'Владелец места' }
  } else {
    return { name: 'Елена', role: 'Арендатор' }
  }
}

onMounted(async () => {
  await nextTick()
  // Scroll to top when component is mounted
  if (contentRef.value) {
    contentRef.value.scrollTop = 0
  }
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
  // Also scroll window to top
  window.scrollTo(0, 0)
})
</script>

<template>
  <section class="chat-list">
    <header class="chat-list__header">
      <button type="button" class="chat-list__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <h1 class="chat-list__title">Чаты</h1>
      <div class="chat-list__header-spacer"></div>
    </header>

    <div class="chat-list__filters">
      <button
        type="button"
        class="chat-list__filter"
        :class="{ 'chat-list__filter--active': filterType === 'all' }"
        @click="filterType = 'all'"
      >
        Все бронирования
      </button>
      <button
        type="button"
        class="chat-list__filter"
        :class="{ 'chat-list__filter--active': filterType === 'active' }"
        @click="filterType = 'active'"
      >
        Только активные
      </button>
    </div>

    <div ref="contentRef" class="chat-list__content">
      <button type="button" class="chat-list__support" @click="emit('open-support-chat')">
        <span class="chat-list__support-mark">ИИ</span>
        <span class="chat-list__support-copy">
          <span class="chat-list__support-title">ИИ-техподдержка</span>
          <span class="chat-list__support-text">Отвечает по базе знаний ParkShare на этом компьютере</span>
        </span>
      </button>

      <div v-if="filteredBookings.length > 0" class="chat-list__bookings">
        <article
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="chat-list__booking-card"
        >
          <div class="chat-list__booking-status" :style="{ color: getStatusColor(booking.status) }">
            <span>{{ getStatusLabel(booking.status) }}</span>
            <span v-if="booking.status === 'awaiting'" class="chat-list__booking-status-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" fill="#F97316"/>
                <path d="M7.06941 3.00995C7.08275 3.00328 7.14275 2.99995 7.24941 2.99995C7.36275 3.01328 7.43608 3.02328 7.46941 3.02995C7.72941 3.10995 7.91608 3.26328 8.02941 3.48995C8.08941 3.61662 8.11941 3.73995 8.11941 3.85995C8.11941 3.98662 8.08941 4.10995 8.02941 4.22995C7.91608 4.46328 7.72941 4.61995 7.46941 4.69995C7.40941 4.71328 7.32608 4.71995 7.21941 4.71995C7.10608 4.71995 7.02275 4.71328 6.96941 4.69995C6.70275 4.61995 6.51275 4.46328 6.39941 4.22995C6.34608 4.12328 6.31941 3.99995 6.31941 3.85995C6.31941 3.76662 6.32275 3.69995 6.32941 3.65995C6.36275 3.53995 6.42275 3.42662 6.50941 3.31995C6.64941 3.15328 6.83608 3.04995 7.06941 3.00995ZM6.99941 5.48995C7.66608 5.46328 7.98608 5.44995 7.95941 5.44995H8.01941V7.33995V9.22995H8.32941H8.63941V9.58995V9.94995H8.54941L7.90941 9.92995C7.54275 9.92328 7.16275 9.92328 6.76941 9.92995L6.08941 9.94995H5.99941V9.58995V9.22995H6.34941H6.68941V7.85995C6.68941 6.93328 6.68608 6.45662 6.67941 6.42995C6.65275 6.34995 6.60941 6.30328 6.54941 6.28995C6.45608 6.26328 6.32275 6.24995 6.14941 6.24995H6.02941V5.88995V5.52995H6.05941L6.99941 5.48995Z" fill="white"/>
              </svg>
            </span>
          </div>
          
          <div class="chat-list__booking-role-tag" style="background-color: rgb(219, 234, 254) !important; color: rgb(37, 99, 235) !important;">
            Вы арендуете
          </div>

          <div class="chat-list__booking-content">
            <div class="chat-list__booking-icon">
              <div class="chat-list__booking-icon-circle">
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.6562 3.5C15.9062 3.5 16.0938 3.75 16.0312 3.96875L15.8438 4.71875C15.8125 4.90625 15.6562 5 15.5 5H14.8438C15.2812 5.375 15.5625 5.90625 15.5625 6.5V8C15.5625 8.53125 15.3438 8.96875 15.0625 9.3125V11C15.0625 11.5625 14.5938 12 14.0625 12H13.0625C12.5 12 12.0625 11.5625 12.0625 11V10H4.0625V11C4.0625 11.5625 3.59375 12 3.0625 12H2.0625C1.5 12 1.0625 11.5625 1.0625 11V9.3125C0.75 8.96875 0.5625 8.53125 0.5625 8V6.5C0.5625 5.90625 0.8125 5.375 1.25 5H0.625C0.4375 5 0.28125 4.90625 0.25 4.71875L0.0625 3.96875C0 3.75 0.1875 3.5 0.4375 3.5H2.28125L2.8125 2.21875C3.34375 0.875 4.625 0 6.0625 0H10.0312C11.4688 0 12.75 0.875 13.2812 2.21875L13.8125 3.5H15.6562ZM4.65625 2.96875L4.0625 4.5H12.0625L11.4375 2.96875C11.1875 2.375 10.6562 2 10.0312 2H6.0625C5.4375 2 4.90625 2.375 4.65625 2.96875ZM3.0625 8C3.65625 8 4.5625 8.09375 4.5625 7.5C4.5625 6.90625 3.65625 6 3.0625 6C2.4375 6 2.0625 6.40625 2.0625 7C2.0625 7.625 2.4375 8 3.0625 8ZM13.0625 8C13.6562 8 14.0625 7.625 14.0625 7C14.0625 6.40625 13.6562 6 13.0625 6C12.4375 6 11.5625 6.90625 11.5625 7.5C11.5625 8.09375 12.4375 8 13.0625 8Z" fill="#2563EB"/>
                </svg>
              </div>
            </div>

            <div class="chat-list__booking-details">
              <p class="chat-list__booking-address">Москва, {{ booking.address }}</p>
              <p class="chat-list__booking-address-placeholder">или в две строки</p>
              <p class="chat-list__booking-datetime">{{ formatBookingDate(booking) }}</p>
              
              <div class="chat-list__booking-contact">
                <span class="chat-list__booking-contact-name">{{ getContactName(booking).name }}</span>
                <span class="chat-list__booking-contact-role">{{ getContactName(booking).role }}</span>
              </div>
            </div>

            <button
              type="button"
              class="chat-list__booking-button"
              :class="{ 'chat-list__booking-button--disabled': booking.status === 'completed' }"
              :disabled="booking.status === 'completed'"
              @click="emit('open-chat', booking)"
            >
              Написать
            </button>
          </div>
        </article>
      </div>

      <div v-else class="chat-list__empty">
        <div class="chat-list__empty-icon">
          <svg width="46" height="37" viewBox="0 0 46 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.64062 17.0156C4.64062 15.75 4.85156 14.4844 5.20312 13.2891L28.125 30.9375C26.3672 31.4297 24.5391 31.6406 22.6406 31.6406C19.8984 31.6406 17.3672 31.1484 15.0469 30.3047C13.3594 31.7109 9.84375 33.8906 5.20312 33.8906C4.92188 33.8906 4.78125 33.8203 4.64062 33.6094C4.57031 33.3984 4.64062 33.1172 4.78125 32.9766C4.78125 32.9062 7.73438 29.7422 8.64844 26.2266C6.11719 23.6953 4.64062 20.5312 4.64062 17.0156ZM44.6484 32.4141C45.1406 32.7656 45.2812 33.4688 44.8594 33.9609L43.5234 35.7188C43.1016 36.2109 42.3984 36.2812 41.9062 35.9297L0.5625 3.9375C0.0703125 3.58594 0 2.88281 0.351562 2.39062L1.75781 0.632812C2.10938 0.140625 2.8125 0 3.30469 0.421875L10.6875 6.11719C13.8516 3.86719 18 2.39062 22.6406 2.39062C32.5547 2.39062 40.6406 9 40.6406 17.0156C40.6406 20.5312 39.0938 23.6953 36.6328 26.1562L44.6484 32.4141Z" fill="#D1D5DB"/>
          </svg>
        </div>
        <p class="chat-list__empty-text">Новые чаты появятся после бронирований</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;
}

.chat-list__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  color: #f8fafc;
}

.chat-list__back {
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

.chat-list__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.chat-list__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  color: #ffffff;
  flex: 1;
  text-align: center;
}

.chat-list__header-spacer {
  width: 40px;
  flex-shrink: 0;
}

.chat-list__filters {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.chat-list__filter {
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

.chat-list__filter--active {
  background: #2563eb;
  color: #ffffff;
}

.chat-list__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.chat-list__support {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 428px;
  padding: 14px 16px;
  border: none;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  text-align: left;
}

.chat-list__support-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #9333ea, #2563eb);
  color: #ffffff;
  font-weight: 700;
  flex-shrink: 0;
}

.chat-list__support-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-list__support-title {
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
}

.chat-list__support-text {
  font-size: 12px;
  color: #6b7280;
}

.chat-list__bookings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 428px;
}

.chat-list__booking-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-list__booking-status {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chat-list__booking-status-icon svg {
  display: block;
}

.chat-list__booking-role-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 12px;
  width: fit-content;
}

.chat-list__booking-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.chat-list__booking-icon {
  flex-shrink: 0;
}

.chat-list__booking-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-list__booking-icon-circle svg {
  width: 17px;
  height: 12px;
  display: block;
}

.chat-list__booking-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.chat-list__booking-address {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.4;
}

.chat-list__booking-address-placeholder {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

.chat-list__booking-datetime {
  margin: 4px 0 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.chat-list__booking-contact {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
}

.chat-list__booking-contact-name {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
}

.chat-list__booking-contact-role {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #6b7280;
}

.chat-list__booking-button {
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
  align-self: flex-end;
  margin-top: auto;
}

.chat-list__booking-button:hover:not(:disabled) {
  background: #7c3aed;
}

.chat-list__booking-button--disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.chat-list__empty {
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

.chat-list__empty-icon {
  margin-bottom: 16px;
}

.chat-list__empty-icon svg {
  width: 46px;
  height: 37px;
  display: block;
}

.chat-list__empty-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .chat-list__header {
    padding: calc(env(safe-area-inset-top) + 20px) 20px 20px;
  }

  .chat-list__filters {
    padding: 12px 20px;
  }

  .chat-list__content {
    padding: 12px 20px;
  }

  .chat-list__bookings {
    max-width: 100%;
  }

  .chat-list__booking-card {
    padding: 14px;
  }
}

@media (min-width: 768px) {
  .chat-list__content {
    padding: 24px 48px;
  }

  .chat-list__bookings {
    max-width: 600px;
  }

  .chat-list__empty {
    max-width: 600px;
  }
}

@media (min-width: 1024px) {
  .chat-list__bookings {
    max-width: 700px;
  }

  .chat-list__empty {
    max-width: 700px;
  }
}

@media (min-width: 1440px) {
  .chat-list__bookings {
    max-width: 600px;
  }

  .chat-list__empty {
    max-width: 600px;
  }
}
</style>
