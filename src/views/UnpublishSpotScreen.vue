<script setup lang="ts">
import { ref } from 'vue'

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

const handleConfirm = () => {
  emit('confirm', selectedAction.value === 'cancel')
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
          <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.7812 22.5C13.7812 23.3438 14.4375 24 15.2812 24C16.0781 24 16.7812 23.3438 16.7812 22.5V12C16.7812 11.2031 16.0781 10.5 15.2812 10.5C14.4375 10.5 13.7812 11.2031 13.7812 12V22.5ZM15.2812 30C16.5 30 17.5312 28.9688 17.5312 27.75C17.5312 26.5781 16.5 25.5 15.2812 25.5C14.0156 25.5 13.0312 26.5781 13.0312 27.75C13.0312 28.9688 14.0156 30 15.2812 30Z" fill="#EA580C"/>
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16Z" fill="#DC2626"/>
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
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.39062 9C5.39062 9.33594 5.66406 9.60938 6 9.60938C6.32812 9.60938 6.60938 9.33594 6.60938 9V5.39062C6.60938 5.0625 6.32812 4.78125 6 4.78125C5.66406 4.78125 5.39062 5.0625 5.39062 5.39062V9ZM6 11.25C6.5625 11.25 7.03125 10.7812 7.03125 10.2188C7.03125 9.66406 6.5625 9.1875 6 9.1875C5.42969 9.1875 4.96875 9.66406 4.96875 10.2188C4.96875 10.7812 5.42969 11.25 6 11.25Z" fill="#DC2626"/>
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0ZM8 14.4C6.73726 14.4 5.50217 14.0246 4.44439 13.3214C3.3866 12.6183 2.55596 11.6184 2.05013 10.4491C1.5443 9.27977 1.38594 7.99292 1.59301 6.74684C1.80008 5.50076 2.36301 4.34663 3.21177 3.42452C4.06054 2.50241 5.15641 1.85088 6.36549 1.55279C7.57457 1.2547 8.84195 1.32352 10.0137 1.75086C11.1855 2.17821 12.2133 2.94661 12.9747 3.96666C13.7362 4.98672 14.2 6.21334 14.2 7.5C14.2 9.22304 13.5256 10.8752 12.3182 12.0855C11.1109 13.2957 9.46304 13.9696 7.74 13.97L8 14.4ZM10.825 7.5C10.825 7.12812 10.5125 6.8125 10.1406 6.8125H8.6875V3.75C8.6875 3.37813 8.375 3.0625 8 3.0625C7.625 3.0625 7.3125 3.37813 7.3125 3.75V7.5C7.3125 7.87188 7.625 8.1875 8 8.1875H10.1406C10.5125 8.1875 10.825 7.87188 10.825 7.5Z" fill="#2563EB"/>
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
      <button
        type="button"
        class="unpublish-screen__confirm-button"
        @click="handleConfirm"
      >
        Снять с публикации
      </button>
      <button
        type="button"
        class="unpublish-screen__cancel-button"
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
