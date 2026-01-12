<script setup lang="ts">
import { computed } from 'vue'

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
  extendedEndDate: string
  extendedEndTime: string
  surcharge: number
}>()

const emit = defineEmits<{
  (e: 'send-message'): void
  (e: 'close'): void
}>()

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

const formatTime = (timeStr: string): string => {
  return timeStr
}

const addressParts = computed(() => {
  // Разделяем адрес на основную часть и город
  const parts = props.booking.address.split(',')
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1]
    return {
      street: parts.slice(0, -1).join(',').trim(),
      city: lastPart ? lastPart.trim() : ''
    }
  }
  return {
    street: props.booking.address,
    city: ''
  }
})
</script>

<template>
  <section class="booking-extended">
    <div class="booking-extended__card">
      <!-- Header -->
      <div class="booking-extended__header">
        <div class="booking-extended__header-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 3C5.67157 3 5 3.67157 5 4.5V15.5C5 16.3284 5.67157 17 6.5 17H13.5C14.3284 17 15 16.3284 15 15.5V4.5C15 3.67157 14.3284 3 13.5 3H6.5ZM4.5 4.5C4.5 3.11929 5.61929 2 7 2H13C14.3807 2 15.5 3.11929 15.5 4.5V15.5C15.5 16.8807 14.3807 18 13 18H7C5.61929 18 4.5 16.8807 4.5 15.5V4.5ZM6.75 6C7.16421 6 7.5 6.33579 7.5 6.75C7.5 7.16421 7.16421 7.5 6.75 7.5C6.33579 7.5 6 7.16421 6 6.75C6 6.33579 6.33579 6 6.75 6ZM6.75 9C7.16421 9 7.5 9.33579 7.5 9.75C7.5 10.1642 7.16421 10.5 6.75 10.5C6.33579 10.5 6 10.1642 6 9.75C6 9.33579 6.33579 9 6.75 9ZM6.75 12C7.16421 12 7.5 12.3358 7.5 12.75C7.5 13.1642 7.16421 13.5 6.75 13.5C6.33579 13.5 6 13.1642 6 12.75C6 12.3358 6.33579 12 6.75 12ZM10 6.75C10 6.33579 10.3358 6 10.75 6H13.25C13.6642 6 14 6.33579 14 6.75C14 7.16421 13.6642 7.5 13.25 7.5H10.75C10.3358 7.5 10 7.16421 10 6.75ZM10 9.75C10 9.33579 10.3358 9 10.75 9H13.25C13.6642 9 14 9.33579 14 9.75C14 10.1642 13.6642 10.5 13.25 10.5H10.75C10.3358 10.5 10 10.1642 10 9.75ZM10 12.75C10 12.3358 10.3358 12 10.75 12H13.25C13.6642 12 14 12.3358 14 12.75C14 13.1642 13.6642 13.5 13.25 13.5H10.75C10.3358 13.5 10 13.1642 10 12.75Z" fill="white"/>
          </svg>
        </div>
        <h2 class="booking-extended__header-title">Бронирование продлено</h2>
      </div>

      <!-- Booking Details -->
      <div class="booking-extended__details">
        <div class="booking-extended__detail-row">
          <div class="booking-extended__detail-label">Место:</div>
          <div class="booking-extended__detail-value">
            <div>{{ addressParts.street }},</div>
            <div>{{ addressParts.city }}</div>
          </div>
        </div>

        <div class="booking-extended__detail-row">
          <div class="booking-extended__detail-label">Дата:</div>
          <div class="booking-extended__detail-value">{{ formatDate(extendedEndDate) }}</div>
        </div>

        <div class="booking-extended__detail-row">
          <div class="booking-extended__detail-label">Время:</div>
          <div class="booking-extended__detail-value">{{ formatTime(booking.startTime) }} - {{ formatTime(extendedEndTime) }}</div>
        </div>

        <div class="booking-extended__detail-row">
          <div class="booking-extended__detail-label">Стоимость:</div>
          <div class="booking-extended__detail-value">₽{{ surcharge }}</div>
        </div>
      </div>

      <!-- Separator -->
      <div class="booking-extended__separator"></div>

      <!-- Status Message -->
      <div class="booking-extended__status">
        <div class="booking-extended__status-icon">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="4" r="4" fill="#10B981"/>
          </svg>
        </div>
        <div class="booking-extended__status-text">Период свободен. Подтверждено.</div>
      </div>

      <!-- Action Buttons: две кнопки -->
      <div class="booking-extended__buttons">
        <button
          type="button"
          class="booking-extended__button booking-extended__button--secondary"
          @click="emit('send-message')"
        >
          Отправить сообщение в чат
        </button>
        <button
          type="button"
          class="booking-extended__button booking-extended__button--primary"
          @click="emit('close')"
        >
          ОК
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-extended {
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.booking-extended__card {
  background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.booking-extended__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.booking-extended__header-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.booking-extended__header-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
  color: white;
}

.booking-extended__details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-extended__detail-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  align-items: start;
}

.booking-extended__detail-label {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: white;
}

.booking-extended__detail-value {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: white;
  text-align: right;
}

.booking-extended__detail-value > div {
  margin-bottom: 4px;
}

.booking-extended__detail-value > div:last-child {
  margin-bottom: 0;
}

.booking-extended__separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 4px 0;
}

.booking-extended__status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.booking-extended__status-icon {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-extended__status-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: white;
}

.booking-extended__buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.booking-extended__button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

.booking-extended__button--primary {
  background: white;
  color: #9333ea;
}

.booking-extended__button--primary:hover {
  background: #F3F4F6;
}

.booking-extended__button--primary:active {
  background: #E5E7EB;
}

.booking-extended__button--secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.booking-extended__button--secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.booking-extended__button--secondary:active {
  background: rgba(255, 255, 255, 0.25);
}

.booking-extended__button--back {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.booking-extended__button--back:hover {
  background: rgba(255, 255, 255, 0.1);
}

.booking-extended__button--back:active {
  background: rgba(255, 255, 255, 0.15);
}
</style>

