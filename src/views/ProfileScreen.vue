<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '../services/mockAuth'
import backIconSvg from '../assets/icons/icon-back.svg?raw'
import helpSupportIconSvg from '../assets/icons/icon-help-support.svg?raw'
import loginAnotherIconSvg from '../assets/icons/icon-login-another.svg?raw'
import logoutIconSvg from '../assets/icons/icon-logout.svg?raw'

type UserCar = {
  id: string
  brand: string
  model: string
  number: string
  region?: string
  color?: string
  isForeign: boolean
}

type PaymentCard = {
  id: string
  name: string
  type: 'visa' | 'mastercard' | 'mir'
  lastFour: string
  isActive: boolean
}

const props = defineProps<{
  currentUser?: User | null
  userCar?: UserCar | null
  paymentCard?: PaymentCard | null
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'edit-name'): void
  (e: 'edit-phone'): void
  (e: 'edit-car'): void
  (e: 'edit-payment'): void
  (e: 'help-support'): void
  (e: 'login-another'): void
  (e: 'logout'): void
  (e: 'settings'): void
}>()

// Generate user initials from name
const userInitials = computed(() => {
  if (!props.currentUser?.name) return 'П'
  const parts = props.currentUser.name.trim().split(' ')
  if (parts.length >= 2) {
    const first = parts[0]
    const second = parts[1]
    if (first && second && first[0] && second[0]) {
      return (first[0] + second[0]).toUpperCase()
    }
  }
  return props.currentUser.name.substring(0, 2).toUpperCase()
})

// Generate user ID from user data
const userId = computed(() => {
  if (props.currentUser?.id) {
    return `USR_2024_${props.currentUser.id.padStart(6, '0')}`
  }
  return 'USR_2024_000000'
})

// Format phone number
const formattedPhone = computed(() => {
  if (!props.currentUser?.phone) return '+7 (999) 123-45-67'
  return props.currentUser.phone
})

// Get car display text
const carDisplayText = computed(() => {
  if (!props.userCar) return 'Не указан'
  return `${props.userCar.brand} ${props.userCar.model}`
})

const carNumberText = computed(() => {
  if (!props.userCar) return ''
  return props.userCar.number
})

// Get payment card display text
const paymentCardDisplayText = computed(() => {
  if (!props.paymentCard) return 'Не указан'
  return props.paymentCard.name
})

const paymentCardNumberText = computed(() => {
  if (!props.paymentCard) return ''
  const typeUpper = props.paymentCard.type.toUpperCase()
  return `${typeUpper}***${props.paymentCard.lastFour}`
})
</script>

<template>
  <section class="profile">
    <!-- Header with gradient -->
    <header class="profile__header">
      <button 
        type="button" 
        class="profile__back" 
        @click="emit('back')" 
        aria-label="Назад"
      >
        <span v-html="backIconSvg"></span>
      </button>
      <h1 class="profile__title">Профиль</h1>
      <button 
        type="button" 
        class="profile__settings" 
        @click="emit('settings')" 
        aria-label="Настройки"
      >
        <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.6875 9.6875C14.8438 9.78125 14.9062 9.96875 14.875 10.125C14.5 11.25 13.9375 12.25 13.1562 13.0938C13.0312 13.2188 12.8438 13.25 12.6875 13.1562L11.3438 12.4062C10.7812 12.875 10.1562 13.25 9.46875 13.5V15.0312C9.46875 15.1875 9.34375 15.3438 9.15625 15.4062C8.0625 15.625 6.90625 15.6562 5.75 15.4062C5.59375 15.3438 5.46875 15.1875 5.46875 15.0312V13.5C4.75 13.25 4.125 12.875 3.5625 12.4062L2.21875 13.1562C2.0625 13.25 1.875 13.2188 1.75 13.0938C1 12.25 0.40625 11.25 0.0625 10.125C0 9.96875 0.0625 9.78125 0.21875 9.6875L1.5625 8.9375C1.4375 8.1875 1.4375 7.46875 1.5625 6.71875L0.21875 5.96875C0.0625 5.875 0 5.6875 0.0625 5.53125C0.40625 4.40625 1 3.40625 1.75 2.5625C1.875 2.4375 2.0625 2.40625 2.21875 2.5L3.5625 3.28125C4.125 2.78125 4.75 2.40625 5.46875 2.15625V0.625C5.46875 0.46875 5.5625 0.3125 5.75 0.28125C6.84375 0.03125 8 0 9.15625 0.28125C9.34375 0.3125 9.46875 0.46875 9.46875 0.625V2.15625C10.1562 2.40625 10.7812 2.78125 11.3438 3.25L12.6875 2.5C12.8438 2.40625 13.0312 2.4375 13.1562 2.5625C13.9062 3.40625 14.5 4.40625 14.8438 5.53125C14.9062 5.6875 14.8438 5.875 14.6875 5.96875L13.3438 6.71875C13.5 7.46875 13.5 8.1875 13.3438 8.9375L14.6875 9.6875ZM7.46875 10.3125C8.84375 10.3125 9.96875 9.21875 9.96875 7.8125C9.96875 6.4375 8.84375 5.3125 7.46875 5.3125C6.0625 5.3125 4.96875 6.4375 4.96875 7.8125C4.96875 9.21875 6.0625 10.3125 7.46875 10.3125Z" fill="white"/>
        </svg>
      </button>
    </header>

    <!-- Profile Content -->
    <div class="profile__content">
      <!-- Profile Info Section -->
      <div class="profile__info-section">
        <div class="profile__avatar">
          <span class="profile__avatar-text">{{ userInitials }}</span>
        </div>
        <div class="profile__user-info">
          <div class="profile__name-row">
            <h2 class="profile__name">{{ currentUser?.name || 'Пользователь' }}</h2>
            <button 
              type="button" 
              class="profile__edit-name-btn" 
              @click="emit('edit-name')"
              aria-label="Редактировать имя"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.75 2.25L15.75 8.25L5.25 18.75H0.75V14.25L9.75 2.25Z" fill="#4B5563" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="profile__user-id">
            <span class="profile__user-id-label">ID:</span>
            <span class="profile__user-id-value">{{ userId }}</span>
          </div>
        </div>
      </div>

      <!-- Account Details Cards -->
      <div class="profile__cards">
        <!-- Phone Number Card -->
        <div class="profile__card">
          <h3 class="profile__card-title">Номер для входа</h3>
          <div class="profile__card-content">
            <div class="profile__card-info">
              <div class="profile__card-icon profile__card-icon--phone">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="#2563EB"/>
                </svg>
              </div>
              <div class="profile__card-text">
                <span class="profile__card-main-text">{{ formattedPhone }}</span>
              </div>
            </div>
            <button 
              type="button" 
              class="profile__card-edit" 
              @click="emit('edit-phone')"
            >
              Изменить
            </button>
          </div>
        </div>

        <!-- Car Card -->
        <div class="profile__card">
          <h3 class="profile__card-title">Основной автомобиль</h3>
          <div class="profile__card-content">
            <div class="profile__card-info">
              <div class="profile__card-icon profile__card-icon--car">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 8.33333L4.16667 4.16667H15.8333L17.5 8.33333M2.5 8.33333V15.8333C2.5 16.2933 2.87333 16.6667 3.33333 16.6667H4.16667C4.62667 16.6667 5 16.2933 5 15.8333V14.1667H15V15.8333C15 16.2933 15.3733 16.6667 15.8333 16.6667H16.6667C17.1267 16.6667 17.5 16.2933 17.5 15.8333V8.33333M2.5 8.33333H17.5M5.83333 11.6667C5.83333 12.1267 6.20667 12.5 6.66667 12.5C7.12667 12.5 7.5 12.1267 7.5 11.6667C7.5 11.2067 7.12667 10.8333 6.66667 10.8333C6.20667 10.8333 5.83333 11.2067 5.83333 11.6667ZM14.1667 11.6667C14.1667 12.1267 14.54 12.5 15 12.5C15.46 12.5 15.8333 12.1267 15.8333 11.6667C15.8333 11.2067 15.46 10.8333 15 10.8333C14.54 10.8333 14.1667 11.2067 14.1667 11.6667Z" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="profile__card-text">
                <span class="profile__card-main-text">{{ carDisplayText }}</span>
                <span v-if="carNumberText" class="profile__card-sub-text">{{ carNumberText }}</span>
              </div>
            </div>
            <button 
              type="button" 
              class="profile__card-edit" 
              @click="emit('edit-car')"
            >
              Изменить
            </button>
          </div>
        </div>

        <!-- Payment Card -->
        <div class="profile__card">
          <h3 class="profile__card-title">Способ оплаты</h3>
          <div class="profile__card-content">
            <div class="profile__card-info">
              <div class="profile__card-icon profile__card-icon--payment">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 6.66667H2.5C1.39583 6.66667 0.5 7.5625 0.5 8.66667V15.3333C0.5 16.4375 1.39583 17.3333 2.5 17.3333H17.5C18.6042 17.3333 19.5 16.4375 19.5 15.3333V8.66667C19.5 7.5625 18.6042 6.66667 17.5 6.66667Z" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M0.5 10.8333H19.5" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5.83333 14.1667H8.33333" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="profile__card-text">
                <span class="profile__card-main-text">{{ paymentCardDisplayText }}</span>
                <span v-if="paymentCardNumberText" class="profile__card-sub-text">{{ paymentCardNumberText }}</span>
              </div>
            </div>
            <button 
              type="button" 
              class="profile__card-edit" 
              @click="emit('edit-payment')"
            >
              Изменить
            </button>
          </div>
        </div>
      </div>

      <!-- Help and Support -->
      <div class="profile__help-card">
        <div class="profile__help-content">
          <div class="profile__help-icon">
            <span v-html="helpSupportIconSvg"></span>
          </div>
          <div class="profile__help-text">
            <span class="profile__help-title">Помощь и поддержка</span>
            <span class="profile__help-subtitle">FAQ, контакты</span>
          </div>
        </div>
        <button 
          type="button" 
          class="profile__help-arrow" 
          @click="emit('help-support')"
          aria-label="Помощь и поддержка"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="profile__actions">
        <button 
          type="button" 
          class="profile__action-btn profile__action-btn--login" 
          @click="emit('login-another')"
        >
          <span class="profile__action-icon" v-html="loginAnotherIconSvg"></span>
          <span>Войти в другой аккаунт</span>
        </button>
        <button 
          type="button" 
          class="profile__action-btn profile__action-btn--logout" 
          @click="emit('logout')"
        >
          <span class="profile__action-icon" v-html="logoutIconSvg"></span>
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* Header */
.profile__header {
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  padding: 18px 18px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}

.profile__back,
.profile__settings {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.profile__back:hover,
.profile__settings:hover {
  background: rgba(255, 255, 255, 0.3);
}

.profile__back:active,
.profile__settings:active {
  transform: scale(0.95);
}

.profile__back :deep(svg),
.profile__settings :deep(svg) {
  display: block;
}

.profile__title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 15.2px;
  line-height: 1.84;
  color: white;
  margin: 0;
  flex: 1;
  text-align: center;
}

/* Content */
.profile__content {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Profile Info Section */
.profile__info-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.profile__avatar {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 1) 0%, rgba(59, 130, 246, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile__avatar-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 17.4px;
  line-height: 1.84;
  color: white;
}

.profile__user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.profile__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.profile__name {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile__edit-name-btn {
  width: 18px;
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.profile__edit-name-btn:hover {
  background: #d1d5db;
}

.profile__edit-name-btn :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.profile__user-id {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}

.profile__user-id-label {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 8.8px;
  line-height: 1.82;
  color: #9ca3af;
}

.profile__user-id-value {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.6;
  color: #9ca3af;
}

/* Cards */
.profile__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile__card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.08);
}

.profile__card:not(:last-child) {
  margin-bottom: 0;
}

.profile__card-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 12.9px;
  line-height: 2.05;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.profile__card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.profile__card-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.profile__card-icon {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile__card-icon--phone {
  background: #e2e8f0;
}

.profile__card-icon--car {
  background: #e2e8f0;
}

.profile__card-icon--payment {
  background: #e2e8f0;
}

.profile__card-icon :deep(svg) {
  display: block;
}

.profile__card-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
}

.profile__card-main-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 10.9px;
  line-height: 2.2;
  color: #1f2937;
  display: block;
}

.profile__card-sub-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 9.8px;
  line-height: 2.04;
  color: #4b5563;
  display: block;
}

.profile__card-edit {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 9.8px;
  line-height: 2.04;
  color: #9333ea;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
}

.profile__card-edit:hover {
  text-decoration: underline;
}

/* Help Card */
.profile__help-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
}

.profile__help-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.profile__help-icon {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: #fefce8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile__help-icon :deep(svg) {
  display: block;
}

.profile__help-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
}

.profile__help-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
  display: block;
}

.profile__help-subtitle {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.5;
  color: #4b5563;
  display: block;
}

.profile__help-arrow {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.profile__help-arrow :deep(svg) {
  display: block;
}

/* Action Buttons */
.profile__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 17.33px;
  border-radius: 12px;
  border: 1px solid;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.profile__action-btn :deep(svg) {
  display: block;
  flex-shrink: 0;
}

.profile__action-icon :deep(svg) {
  display: block;
}

.profile__action-btn span {
  flex: 1;
  text-align: left;
}

.profile__action-btn--login {
  background: #f5f5f5;
  border-color: #dcfce7;
  color: #2563eb;
}

.profile__action-btn--login:hover {
  background: #e5e5e5;
}

.profile__action-btn--logout {
  background: #eff6ff;
  border-color: #fee2e2;
  color: #dc2626;
}

.profile__action-btn--logout:hover {
  background: #dbeafe;
}

.profile__action-btn:active {
  transform: scale(0.98);
}
</style>
