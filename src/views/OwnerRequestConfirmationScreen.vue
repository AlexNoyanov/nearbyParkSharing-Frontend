<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  request: {
    id: string
    address: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    renterName: string
    status: 'awaiting' | 'cancelled' | 'completed' | 'active'
  }
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'confirm'): void
  (e: 'decline'): void
}>()

// Scroll to top when component mounts
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const formatDayLabel = (dateStr: string) => {
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

const formatTime = (timeStr: string) => timeStr.slice(0, 5)

const totalPrice = '₽160'
const ownerProfit = '₽144'
</script>

<template>
  <section class="owner-confirm">
    <header class="owner-confirm__header">
      <button type="button" class="owner-confirm__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z"
            fill="#4B5563"
          />
        </svg>
      </button>
      <h1 class="owner-confirm__title">Заявка на бронирование</h1>
    </header>

    <!-- Banner: new booking request -->
    <div class="owner-confirm__banner">
      <span class="owner-confirm__banner-dot"></span>
      <span class="owner-confirm__banner-text">Новый запрос на бронирование</span>
    </div>

    <!-- Booking details card -->
    <article class="owner-confirm__card owner-confirm__card--booking">
      <h2 class="owner-confirm__section-title-main">Детали бронирования</h2>

      <div class="owner-confirm__booking-address-row">
        <div class="owner-confirm__booking-icon">
          <div class="owner-confirm__booking-icon-circle">
            <span class="owner-confirm__booking-icon-text">P</span>
          </div>
        </div>
        <p class="owner-confirm__booking-address">
          Москва, {{ props.request.address }}
        </p>
      </div>

      <div class="owner-confirm__booking-datetime">
        <div class="owner-confirm__booking-col">
          <p class="owner-confirm__label">НАЧАЛО</p>
          <p class="owner-confirm__date">{{ formatDayLabel(props.request.startDate) }}</p>
          <p class="owner-confirm__time">{{ formatTime(props.request.startTime) }}</p>
        </div>
        <div class="owner-confirm__booking-arrow">
          <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.96875 12.8125L6.65625 13.5C6.96875 13.7812 7.4375 13.7812 7.71875 13.5L13.7812 7.40625C14.0938 7.125 14.0938 6.65625 13.7812 6.375L7.71875 0.28125C7.4375 0 6.9375 0 6.65625 0.28125L5.96875 0.96875C5.65625 1.28125 5.6875 1.75 5.96875 2.0625L9.75 5.625H0.75C0.34375 5.625 0 5.96875 0 6.375V7.375C0 7.8125 0.34375 8.125 0.75 8.125H9.75L5.96875 11.7188C5.6875 12.0312 5.65625 12.5 5.96875 12.8125Z" fill="#0077ED"/>
          </svg>
        </div>
        <div class="owner-confirm__booking-col owner-confirm__booking-col--right">
          <p class="owner-confirm__label">ВЫЕЗД</p>
          <p class="owner-confirm__date">{{ formatDayLabel(props.request.endDate) }}</p>
          <p class="owner-confirm__time">{{ formatTime(props.request.endTime) }}</p>
        </div>
      </div>

      <div class="owner-confirm__price-card">
        <div class="owner-confirm__price-row">
          <span class="owner-confirm__price-label">Стоимость аренды</span>
          <span class="owner-confirm__price">{{ totalPrice }}</span>
        </div>
        <div class="owner-confirm__profit-row">
          <span class="owner-confirm__profit-label">Ваша прибыль (после комиссии 10%)</span>
          <span class="owner-confirm__profit-value">{{ ownerProfit }}</span>
        </div>
      </div>
    </article>

    <!-- Renter car card -->
    <article class="owner-confirm__card owner-confirm__card--car">
      <h2 class="owner-confirm__section-title-main">Автомобиль арендатора</h2>

      <div class="owner-confirm__car-row">
        <div class="owner-confirm__car-icon">
          <div class="owner-confirm__car-icon-circle">
            <svg width="18" height="14" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.6562 3.5C15.9062 3.5 16.0938 3.75 16.0312 3.96875L15.8438 4.71875C15.8125 4.90625 15.6562 5 15.5 5H14.8438C15.2812 5.375 15.5625 5.90625 15.5625 6.5V8C15.5625 8.53125 15.3438 8.96875 15.0625 9.3125V11C15.0625 11.5625 14.5938 12 14.0625 12H13.0625C12.5 12 12.0625 11.5625 12.0625 11V10H4.0625V11C4.0625 11.5625 3.59375 12 3.0625 12H2.0625C1.5 12 1.0625 11.5625 1.0625 11V9.3125C0.75 8.96875 0.5625 8.53125 0.5625 8V6.5C0.5625 5.90625 0.8125 5.375 1.25 5H0.625C0.4375 5 0.28125 4.90625 0.25 4.71875L0.0625 3.96875C0 3.75 0.1875 3.5 0.4375 3.5H2.28125L2.8125 2.21875C3.34375 0.875 4.625 0 6.0625 0H10.0312C11.4688 0 12.75 0.875 13.2812 2.21875L13.8125 3.5H15.6562ZM4.65625 2.96875L4.0625 4.5H12.0625L11.4375 2.96875C11.1875 2.375 10.6562 2 10.0312 2H6.0625C5.4375 2 4.90625 2.375 4.65625 2.96875ZM3.0625 8C3.65625 8 4.5625 8.09375 4.5625 7.5C4.5625 6.90625 3.65625 6 3.0625 6C2.4375 6 2.0625 6.40625 2.0625 7C2.0625 7.625 2.4375 8 3.0625 8ZM13.0625 8C13.6562 8 14.0625 7.625 14.0625 7C14.0625 6.40625 13.6562 6 13.0625 6C12.4375 6 11.5625 6.90625 11.5625 7.5C11.5625 8.09375 12.4375 8 13.0625 8Z"
                fill="#2563EB"
              />
            </svg>
          </div>
        </div>

        <div class="owner-confirm__car-info">
          <p class="owner-confirm__car-title">Toyota Camry</p>
          <p class="owner-confirm__car-meta">Белый</p>
          <div class="owner-confirm__car-plate">A123ВВ777</div>
        </div>
      </div>
    </article>

    <footer class="owner-confirm__footer">
      <button
        type="button"
        class="owner-confirm__button owner-confirm__button--decline"
        @click="emit('decline')"
      >
        <span class="owner-confirm__button-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span>Отклонить</span>
      </button>

      <button
        type="button"
        class="owner-confirm__button owner-confirm__button--confirm"
        @click="emit('confirm')"
      >
        <span class="owner-confirm__button-icon">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.5 6.5L5.5 10.5L14.5 1.5"
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Подтвердить</span>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.owner-confirm {
  display: grid;
  gap: 20px;
  padding: 24px 24px 20px;
  background-color: #ffffff;
  min-height: 100vh;
  box-sizing: border-box;
}

.owner-confirm__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.owner-confirm__back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #e2e8f0;
  font-size: 20px;
  cursor: pointer;
}

.owner-confirm__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.owner-confirm__banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  background: #ffe7c2;
  border: none;
}

.owner-confirm__banner-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #f97316;
}

.owner-confirm__banner-text {
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #d97706;
}

.owner-confirm__card {
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  display: grid;
  gap: 16px;
}

.owner-confirm__card--booking {
  padding: 20px;
  background-color: #f3f4f6;
}

.owner-confirm__card--car {
  padding: 16px 18px 18px;
  background-color: #f9fafb;
}

.owner-confirm__status {
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 9999px;
  padding: 6px 12px;
  width: fit-content;
}

.owner-confirm__section-title-main {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.owner-confirm__booking-address-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  margin-bottom: 8px;
}

.owner-confirm__booking-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.owner-confirm__booking-icon-text {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
}

.owner-confirm__booking-address {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
}

.owner-confirm__booking-datetime {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.owner-confirm__booking-col {
  display: grid;
  gap: 4px;
  text-align: center;
  align-items: center;
}

.owner-confirm__booking-col--right {
  text-align: center;
  align-items: center;
}

.owner-confirm__booking-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.owner-confirm__section {
  display: grid;
  gap: 4px;
}

.owner-confirm__label {
  margin: 0 0 4px 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: #6b7280;
}

.owner-confirm__value {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}

.owner-confirm__date {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #0077ED;
}

.owner-confirm__time {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0077ED;
}

.owner-confirm__price-card {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  display: grid;
  gap: 12px;
}

.owner-confirm__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.owner-confirm__profit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.owner-confirm__price-label {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #111827;
}

.owner-confirm__price {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0077ED;
}

.owner-confirm__profit-label {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #111827;
}

.owner-confirm__profit-value {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #22C55E;
}

.owner-confirm__car-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background-color: #f3f4f6;
}

.owner-confirm__car-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: #e5edff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.owner-confirm__car-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.owner-confirm__car-meta {
  margin: 2px 0 6px;
  font-family: Inter, sans-serif;
  font-size: 13px;
  color: #6b7280;
}

.owner-confirm__car-plate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 9999px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.owner-confirm__footer {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  gap: 12px;
}

.owner-confirm__button {
  flex: 1;
  padding: 14px 0;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.owner-confirm__button--decline {
  background-color: #ef4444;
  color: #ffffff;
}

.owner-confirm__button--confirm {
  background-color: #22c55e;
  color: #ffffff;
}

.owner-confirm__button-icon svg {
  display: block;
}

.owner-confirm__hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
