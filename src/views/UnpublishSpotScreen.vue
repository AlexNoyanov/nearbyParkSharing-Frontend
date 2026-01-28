<script setup lang="ts">
import { ref } from 'vue'
import { spotsApi } from '../services/spotsApi'

const props = defineProps<{
  spotId: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'cancel'): void
  (e: 'confirm', cancelUpcomingBookings: boolean): void
}>()

// Radio selection: cancel upcoming or wait for completion
const selectedAction = ref<'cancel' | 'wait'>('cancel')
const isLoading = ref(false)
const error = ref<string | null>(null)

const handleConfirm = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const cancelUpcomingBookings = selectedAction.value === 'cancel'
    console.log('[UnpublishSpotScreen] Archiving spot:', props.spotId, 'cancel upcoming:', cancelUpcomingBookings)
    
    await spotsApi.archiveSpot(props.spotId, cancelUpcomingBookings)
    
    console.log('[UnpublishSpotScreen] ✓ Spot archived successfully')
    
    // Emit confirm event for parent component to handle navigation
    emit('confirm', cancelUpcomingBookings)
  } catch (err: any) {
    console.error('[UnpublishSpotScreen] ✗ Failed to archive spot:', err)
    error.value = err?.message || 'Не удалось снять место с публикации. Попробуйте еще раз.'
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <div class="unpublish-screen">
    <!-- Header -->
    <header class="unpublish-screen__header">
      <button
        type="button"
        class="unpublish-screen__back-button"
        @click="handleBack"
        aria-label="Назад"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.03125 14.7812C9.34375 15.0938 9.34375 15.5938 9.03125 15.9062C8.71875 16.2188 8.21875 16.2188 7.90625 15.9062L0.90625 8.90625C0.59375 8.59375 0.59375 8.09375 0.90625 7.78125L7.90625 0.78125C8.21875 0.46875 8.71875 0.46875 9.03125 0.78125C9.34375 1.09375 9.34375 1.59375 9.03125 1.90625L2.59375 8.34375L9.03125 14.7812Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="unpublish-screen__title">Снятие с публикации</h1>
    </header>

    <!-- Content -->
    <div class="unpublish-screen__content">
      <!-- Warning Icon and Message -->
      <div class="unpublish-screen__warning">
        <div class="unpublish-screen__warning-icon">
          <svg width="36" height="31" viewBox="0 0 36 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34.043 26.3086C35.0977 28.1836 33.75 30.4688 31.582 30.4688H3.51562C1.34766 30.4688 0 28.125 1.05469 26.3086L15.1172 1.875C16.1719 0 18.9258 0.0585938 19.9805 1.875L34.043 26.3086ZM17.5781 21.2109C16.0547 21.2109 14.8828 22.4414 14.8828 23.9062C14.8828 25.4297 16.0547 26.6016 17.5781 26.6016C19.043 26.6016 20.2734 25.4297 20.2734 23.9062C20.2734 22.4414 19.043 21.2109 17.5781 21.2109ZM15 11.543L15.4102 19.5117C15.4688 19.9219 15.7617 20.1562 16.1133 20.1562H18.9844C19.3359 20.1562 19.6289 19.9219 19.6875 19.5117L20.0977 11.543C20.1562 11.1328 19.8047 10.7812 19.3945 10.7812H15.7031C15.293 10.7812 14.9414 11.1328 15 11.543Z" fill="#EA580C"/>
          </svg>
        </div>
        <h2 class="unpublish-screen__warning-title">Внимание!</h2>
        <p class="unpublish-screen__warning-text">
          У вас есть активные и предстоящие<br>бронирования
        </p>
      </div>

      <!-- Active Bookings Section -->
      <section class="unpublish-screen__section">
        <h3 class="unpublish-screen__section-title">Активные бронирования (1)</h3>
        
        <div class="booking-card booking-card--active">
          <div class="booking-card__icon">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 7C13.3125 7 14 7.6875 14 8.5V14.5C14 15.3438 13.3125 16 12.5 16H1.5C0.65625 16 0 15.3438 0 14.5V8.5C0 7.6875 0.65625 7 1.5 7H2.25V4.75C2.25 2.15625 4.375 0 7 0C9.59375 0 11.75 2.15625 11.75 4.75V7H12.5ZM9.25 7V4.75C9.25 3.53125 8.21875 2.5 7 2.5C5.75 2.5 4.75 3.53125 4.75 4.75V7H9.25Z" fill="#DC2626"/>
            </svg>
          </div>
          
          <div class="booking-card__content">
            <div class="booking-card__header">
              <h4 class="booking-card__name">Алексей<br>Иванов</h4>
              <div class="booking-card__badge">Нельзя отменить</div>
            </div>
            
            <p class="booking-card__car">Toyota Camry • А123БВ777</p>
            
            <div class="booking-card__time">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14C3.13438 14 0 10.8656 0 7C0 3.13438 3.13438 0 7 0C10.8656 0 14 3.13438 14 7C14 10.8656 10.8656 14 7 14ZM7 1.75C4.10156 1.75 1.75 4.10156 1.75 7C1.75 9.89844 4.10156 12.25 7 12.25C9.89844 12.25 12.25 9.89844 12.25 7C12.25 4.10156 9.89844 1.75 7 1.75ZM9.625 7C9.625 6.51562 9.23438 6.125 8.75 6.125H7.875V3.5C7.875 3.01562 7.48438 2.625 7 2.625C6.51562 2.625 6.125 3.01562 6.125 3.5V7C6.125 7.48438 6.51562 7.875 7 7.875H8.75C9.23438 7.875 9.625 7.48438 9.625 7Z" fill="#4B5563"/>
              </svg>
              <span>Сейчас - 12:00</span>
            </div>
            
            <div class="booking-card__alert">
              <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 0.6875C9.1875 0.6875 11.8125 3.3125 11.8125 6.5C11.8125 9.71094 9.1875 12.3125 6 12.3125C2.78906 12.3125 0.1875 9.71094 0.1875 6.5C0.1875 3.3125 2.78906 0.6875 6 0.6875ZM6 3.26562C5.4375 3.26562 5.01562 3.71094 5.01562 4.25C5.01562 4.8125 5.4375 5.23438 6 5.23438C6.53906 5.23438 6.98438 4.8125 6.98438 4.25C6.98438 3.71094 6.53906 3.26562 6 3.26562ZM7.3125 9.21875V8.65625C7.3125 8.51562 7.17188 8.375 7.03125 8.375H6.75V6.03125C6.75 5.89062 6.60938 5.75 6.46875 5.75H4.96875C4.80469 5.75 4.6875 5.89062 4.6875 6.03125V6.59375C4.6875 6.75781 4.80469 6.875 4.96875 6.875H5.25V8.375H4.96875C4.80469 8.375 4.6875 8.51562 4.6875 8.65625V9.21875C4.6875 9.38281 4.80469 9.5 4.96875 9.5H7.03125C7.17188 9.5 7.3125 9.38281 7.3125 9.21875Z" fill="#DC2626"/>
              </svg>
              <span>Активное бронирование нельзя отменить</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Upcoming Bookings Section -->
      <section class="unpublish-screen__section">
        <h3 class="unpublish-screen__section-title">Предстоящие бронирования (1)</h3>
        
        <div class="booking-card booking-card--upcoming">
          <div class="booking-card__icon">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.6562 3.5C15.9062 3.5 16.0938 3.75 16.0312 3.96875L15.8438 4.71875C15.8125 4.90625 15.6562 5 15.5 5H14.8438C15.2812 5.375 15.5625 5.90625 15.5625 6.5V8C15.5625 8.53125 15.3438 8.96875 15.0625 9.3125V11C15.0625 11.5625 14.5938 12 14.0625 12H13.0625C12.5 12 12.0625 11.5625 12.0625 11V10H4.0625V11C4.0625 11.5625 3.59375 12 3.0625 12H2.0625C1.5 12 1.0625 11.5625 1.0625 11V9.3125C0.75 8.96875 0.5625 8.53125 0.5625 8V6.5C0.5625 5.90625 0.8125 5.375 1.25 5H0.625C0.4375 5 0.28125 4.90625 0.25 4.71875L0.0625 3.96875C0 3.75 0.1875 3.5 0.4375 3.5H2.28125L2.8125 2.21875C3.34375 0.875 4.625 0 6.0625 0H10.0312C11.4688 0 12.75 0.875 13.2812 2.21875L13.8125 3.5H15.6562ZM4.65625 2.96875L4.0625 4.5H12.0625L11.4375 2.96875C11.1875 2.375 10.6562 2 10.0312 2H6.0625C5.4375 2 4.90625 2.375 4.65625 2.96875ZM3.0625 8C3.65625 8 4.5625 8.09375 4.5625 7.5C4.5625 6.90625 3.65625 6 3.0625 6C2.4375 6 2.0625 6.40625 2.0625 7C2.0625 7.625 2.4375 8 3.0625 8ZM13.0625 8C13.6562 8 14.0625 7.625 14.0625 7C14.0625 6.40625 13.6562 6 13.0625 6C12.4375 6 11.5625 6.90625 11.5625 7.5C11.5625 8.09375 12.4375 8 13.0625 8Z" fill="#2563EB"/>
            </svg>
          </div>
          
          <div class="booking-card__content">
            <div class="booking-card__header">
              <h4 class="booking-card__name">Мария<br>Петрова</h4>
              <div class="booking-card__badge booking-card__badge--chat">Чат</div>
            </div>
            
            <p class="booking-card__car">BMW X3 • В456ГД123</p>
            
            <div class="booking-card__time">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.25 1.75H11.375V0.875C11.375 0.390625 10.9844 0 10.5 0C10.0156 0 9.625 0.390625 9.625 0.875V1.75H4.375V0.875C4.375 0.390625 3.98438 0 3.5 0C3.01562 0 2.625 0.390625 2.625 0.875V1.75H1.75C0.78125 1.75 0 2.53125 0 3.5V12.25C0 13.2188 0.78125 14 1.75 14H12.25C13.2188 14 14 13.2188 14 12.25V3.5C14 2.53125 13.2188 1.75 12.25 1.75ZM12.25 12.25H1.75V5.25H12.25V12.25Z" fill="#4B5563"/>
              </svg>
              <span>Начало:       16 дек, 09:00</span>
            </div>
            
            <div class="booking-card__time">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.25 1.75H11.375V0.875C11.375 0.390625 10.9844 0 10.5 0C10.0156 0 9.625 0.390625 9.625 0.875V1.75H4.375V0.875C4.375 0.390625 3.98438 0 3.5 0C3.01562 0 2.625 0.390625 2.625 0.875V1.75H1.75C0.78125 1.75 0 2.53125 0 3.5V12.25C0 13.2188 0.78125 14 1.75 14H12.25C13.2188 14 14 13.2188 14 12.25V3.5C14 2.53125 13.2188 1.75 12.25 1.75ZM12.25 12.25H1.75V5.25H12.25V12.25Z" fill="#4B5563"/>
              </svg>
              <span>Окончание: 16 дек, 11:00</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Action Selection -->
      <section class="unpublish-screen__section">
        <h3 class="unpublish-screen__section-title">Выберите действие</h3>
        
        <div class="action-options">
          <label class="action-option">
            <input
              type="radio"
              name="action"
              value="cancel"
              v-model="selectedAction"
              class="action-option__radio"
            >
            <div class="action-option__content">
              <h4 class="action-option__title">
                Отменить предстоящие<br>бронирования
              </h4>
              <p class="action-option__description">
                Место будет снято с публикации, а арендаторы получат сообщение об отмене бронирования
              </p>
            </div>
          </label>

          <label class="action-option">
            <input
              type="radio"
              name="action"
              value="wait"
              v-model="selectedAction"
              class="action-option__radio"
            >
            <div class="action-option__content">
              <h4 class="action-option__title">
                Дождаться завершения всех<br>бронирований
              </h4>
              <p class="action-option__description">
                Место будет снято с публикации сейчас, но предстоящие бронирования не отменять
              </p>
            </div>
          </label>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="unpublish-screen__footer">
      <div v-if="error" class="unpublish-screen__error">
        {{ error }}
      </div>
      <button
        type="button"
        class="unpublish-screen__confirm-button"
        :disabled="isLoading"
        @click="handleConfirm"
      >
        {{ isLoading ? 'Снятие с публикации...' : 'Снять с публикации' }}
      </button>
      <button
        type="button"
        class="unpublish-screen__cancel-button"
        :disabled="isLoading"
        @click="handleCancel"
      >
        Отмена
      </button>
    </footer>
  </div>
</template>

<style scoped>
.unpublish-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.unpublish-screen__header {
  display: flex;
  align-items: center;
  gap: 52px;
  padding: calc(env(safe-area-inset-top) + 12px) 18px 13px;
  border-bottom: 1.333px solid #E5E7EB;
  background: #ffffff;
}

.unpublish-screen__back-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #F3F4F6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.unpublish-screen__back-button:hover {
  background: #E5E7EB;
}

.unpublish-screen__title {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 13.2px;
  line-height: 28px;
  color: #1F2937;
  text-align: center;
}

/* Content */
.unpublish-screen__content {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 13.5px;
  overflow-y: auto;
}

/* Warning Section */
.unpublish-screen__warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 13.5px;
}

.unpublish-screen__warning-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FFEDD5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 9px;
}

.unpublish-screen__warning-title {
  margin: 0 0 -6px 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 28px;
  color: #1F2937;
  text-align: center;
}

.unpublish-screen__warning-text {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 24px;
  color: #4B5563;
  text-align: center;
}

/* Section */
.unpublish-screen__section {
  display: flex;
  flex-direction: column;
  gap: 3.3px;
}

.unpublish-screen__section-title {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 26.4px;
  color: #1F2937;
  text-align: center;
}

/* Booking Card */
.booking-card {
  display: flex;
  gap: 12px;
  padding: 13px;
  border-radius: 12px;
  border: 1px solid;
}

.booking-card--active {
  border-color: #FECACA;
  background: #EFF6FF;
}

.booking-card--upcoming {
  border-color: #BFDBFE;
  background: #F3F4F6;
}

.booking-card__icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-card--active .booking-card__icon {
  background: #FEE2E2;
}

.booking-card--upcoming .booking-card__icon {
  background: #DCFCE7;
}

.booking-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: -2.5px;
}

.booking-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.booking-card__name {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 12px;
  line-height: 24px;
  color: #1F2937;
}

.booking-card__badge {
  padding: 0.5px 11px 1.5px;
  border-radius: 9999px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 9px;
  line-height: 16px;
  white-space: nowrap;
}

.booking-card--active .booking-card__badge {
  background: #FEE2E2;
  color: #B91C1C;
}

.booking-card__badge--chat {
  background: #DCFCE7;
  color: #2563EB;
}

.booking-card__car {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #4B5563;
  text-align: center;
}

.booking-card__time {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 3.5px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #4B5563;
}

.booking-card__time svg {
  flex-shrink: 0;
}

.booking-card__alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10.7px 0 11.3px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 8px;
  line-height: 16px;
  color: #DC2626;
}

.booking-card__alert svg {
  flex-shrink: 0;
}

/* Action Options */
.action-options {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.action-option {
  display: flex;
  gap: 12px;
  padding: 12px 13px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-option:hover {
  border-color: #2563EB;
}

.action-option__radio {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid #6B7280;
  background: #ffffff;
  flex-shrink: 0;
  margin-top: 6px;
  cursor: pointer;
  appearance: none;
}

.action-option__radio:checked {
  border-color: #2563EB;
  border-width: 3px;
}

.action-option__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: -5.5px;
}

.action-option__title {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 24px;
  color: #1F2937;
  text-align: center;
}

.action-option__description {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #4B5563;
  text-align: center;
}

/* Footer */
.unpublish-screen__footer {
  padding: 13px 18px 12px;
  border-top: 1.333px solid #E5E7EB;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.unpublish-screen__confirm-button {
  width: 100%;
  padding: 8px 0 9px;
  border-radius: 12px;
  border: none;
  background: #2563EB;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 28px;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.unpublish-screen__confirm-button:hover {
  background: #1D4ED8;
}

.unpublish-screen__cancel-button {
  width: 100%;
  padding: 3.5px 0;
  border: none;
  background: transparent;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #4B5563;
  cursor: pointer;
  transition: color 0.2s ease;
}

.unpublish-screen__cancel-button:hover {
  color: #1F2937;
}

.unpublish-screen__cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unpublish-screen__confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.unpublish-screen__error {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: #FEE2E2;
  color: #DC2626;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .unpublish-screen__header {
    padding: calc(env(safe-area-inset-top) + 10px) 16px 11px;
    gap: 40px;
  }

  .unpublish-screen__title {
    font-size: 12px;
  }

  .unpublish-screen__content {
    padding: 16px;
    gap: 12px;
  }

  .unpublish-screen__warning-icon {
    width: 50px;
    height: 50px;
  }

  .unpublish-screen__warning-icon svg {
    width: 24px;
    height: 28px;
  }

  .unpublish-screen__section-title {
    font-size: 12px;
  }

  .booking-card {
    padding: 11px;
    gap: 10px;
  }

  .action-option {
    padding: 10px 11px;
  }

  .unpublish-screen__footer {
    padding: 11px 16px 10px;
    gap: 8px;
  }

  .unpublish-screen__confirm-button {
    font-size: 12px;
    padding: 7px 0 8px;
  }

  .unpublish-screen__cancel-button {
    font-size: 9px;
  }
}
</style>
