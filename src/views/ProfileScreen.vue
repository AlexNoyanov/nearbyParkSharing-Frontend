<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '../services/mockAuth'
import backIconSvg from '../assets/icons/icon-back.svg?raw'

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
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.25 10C16.25 10.2083 16.2333 10.4167 16.2083 10.625L17.875 12.2917C18.0417 12.4583 18.0833 12.7083 17.9917 12.9167L17.0333 14.875C16.9417 15.0833 16.7083 15.1667 16.5 15.1083L14.5333 14.5333C14.0333 14.9833 13.4667 15.35 12.8333 15.625L12.625 17.625C12.5833 17.85 12.3833 18.0167 12.1583 18.0167H9.84167C9.61667 18.0167 9.41667 17.85 9.375 17.625L9.16667 15.625C8.53333 15.35 7.96667 14.9833 7.46667 14.5333L5.5 15.1083C5.29167 15.1667 5.05833 15.0833 4.96667 14.875L4.00833 12.9167C3.91667 12.7083 3.95833 12.4583 4.125 12.2917L5.79167 10.625C5.76667 10.4167 5.75 10.2083 5.75 10C5.75 9.79167 5.76667 9.58333 5.79167 9.375L4.125 7.70833C3.95833 7.54167 3.91667 7.29167 4.00833 7.08333L4.96667 5.125C5.05833 4.91667 5.29167 4.83333 5.5 4.89167L7.46667 5.46667C7.96667 5.01667 8.53333 4.65 9.16667 4.375L9.375 2.375C9.41667 2.15 9.61667 1.98333 9.84167 1.98333H12.1583C12.3833 1.98333 12.5833 2.15 12.625 2.375L12.8333 4.375C13.4667 4.65 14.0333 5.01667 14.5333 5.46667L16.5 4.89167C16.7083 4.83333 16.9417 4.91667 17.0333 5.125L17.9917 7.08333C18.0833 7.29167 18.0417 7.54167 17.875 7.70833L16.2083 9.375C16.2333 9.58333 16.25 9.79167 16.25 10Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.3333 14.075V16.575C18.3333 17.1 17.9 17.5333 17.375 17.5333C7.78333 17.5333 0.466667 10.2167 0.466667 0.625C0.466667 0.1 0.9 -0.333333 1.425 -0.333333H3.925C4.45 -0.333333 4.88333 0.1 4.88333 0.625V4.225C4.88333 4.75 4.45 5.18333 3.925 5.18333H2.64167C2.64167 6.18333 2.83333 7.15 3.2 8.03333C3.35 8.38333 3.55 8.7 3.79167 8.98333L5.64167 10.8333C7.19167 12.3833 9.25833 13.3583 11.5 13.3583H12.7833C13.3083 13.3583 13.7417 13.7917 13.7417 14.3167V16.8167C13.7417 17.3417 13.3083 17.775 12.7833 17.775H18.3333Z" fill="#2563EB"/>
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#9333EA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 14.1667V10" stroke="#9333EA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 7.5H10.0083" stroke="#9333EA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 5V10M10 10V15M10 10H15M5 10H10" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Войти в другой аккаунт</span>
        </button>
        <button 
          type="button" 
          class="profile__action-btn profile__action-btn--logout" 
          @click="emit('logout')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5H7.5" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.3333 14.1667L17.5 10L13.3333 5.83333" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17.5 10H7.5" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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
  padding: 18px;
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
  gap: 18px;
}

/* Profile Info Section */
.profile__info-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  padding-left: 56px;
  min-height: 60px;
}

.profile__avatar {
  position: absolute;
  left: 0;
  top: 0;
  width: 60px;
  height: 60px;
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
  gap: 0;
}

.profile__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.profile__name {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14.8px;
  line-height: 1.89;
  color: #1f2937;
  margin: 0;
}

.profile__edit-name-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  padding: 0;
}

.profile__edit-name-btn:hover {
  background: #d1d5db;
}

.profile__edit-name-btn :deep(svg) {
  display: block;
}

.profile__user-id {
  display: flex;
  align-items: center;
  gap: 4px;
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
  font-size: 10.9px;
  line-height: 2.2;
  color: #9ca3af;
}

/* Cards */
.profile__cards {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.profile__card {
  background: #e5e7eb;
  border-radius: 16px;
  padding: 7.5px 12px 9.5px;
  display: flex;
  flex-direction: column;
  gap: 0.3px;
  margin-bottom: 0;
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
  padding: 10px 13px;
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
  font-weight: 400;
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
  gap: 9px;
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
