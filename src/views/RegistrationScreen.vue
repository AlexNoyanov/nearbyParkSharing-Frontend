<script setup lang="ts">
import { ref } from 'vue'
import backIconSvg from '../assets/icons/icon-back.svg?raw'
import userPlusIconSvg from '../assets/icons/icon-user-plus.svg?raw'

const props = defineProps<{
  onBack: () => void
  onRegister: (name: string, phone: string) => void
  onCallVerification: (name: string, phone: string) => void
  onLogin: () => void
}>()

const name = ref('')
const phone = ref('')
const isLoading = ref(false)
const error = ref('')
const contentRef = ref<HTMLElement | null>(null)

const formatPhone = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as +7 (XXX) XXX-XX-XX
  if (digits.length === 0) return ''
  if (digits.length <= 1) return `+${digits}`
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  phone.value = formatPhone(target.value)
  error.value = ''
}

const handleNameInput = () => {
  error.value = ''
}

const handleInputFocus = (e: Event) => {
  const target = e.target as HTMLElement
  if (!contentRef.value) return
  
  // Wait for keyboard to appear on iOS
  requestAnimationFrame(() => {
    setTimeout(() => {
      const inputRect = target.getBoundingClientRect()
      const contentRect = contentRef.value!.getBoundingClientRect()
      const headerHeight = 180
      const viewportHeight = window.innerHeight
      const keyboardHeight = viewportHeight - contentRect.bottom
      const availableHeight = viewportHeight - headerHeight - keyboardHeight
      
      // Calculate if input is hidden under header
      const inputTop = inputRect.top
      const inputBottom = inputRect.bottom
      const headerBottom = headerHeight
      
      if (inputTop < headerBottom) {
        // Input is hidden under header, scroll to show it
        const scrollAmount = headerBottom - inputTop + 20 // 20px padding
        contentRef.value!.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        })
      } else if (inputBottom > availableHeight + headerHeight) {
        // Input is below visible area, scroll to show it
        const scrollAmount = inputBottom - (availableHeight + headerHeight) + 20
        contentRef.value!.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        })
      }
    }, 400)
  })
}

// Валидация имени: только буквы (любой язык), пробелы, дефис, апостроф; минимум 2 символа
const isNameValid = (value: string): boolean => {
  const trimmed = value.trim()
  if (trimmed.length < 2) return false
  return /^[\p{L}\s\-']+$/u.test(trimmed)
}

const handleSubmit = async () => {
  const trimmedName = name.value.trim()
  if (!trimmedName) {
    error.value = 'Введите ваше имя'
    return
  }
  if (!isNameValid(name.value)) {
    error.value = 'Имя может содержать только буквы, пробелы, дефис или апостроф. Минимум 2 символа.'
    return
  }

  if (!phone.value || phone.value.length < 18) {
    error.value = 'Введите корректный номер телефона'
    return
  }

  // Phone validation will be done by the API
  const phoneDigits = phone.value.replace(/\D/g, '')
  const fullPhone = `+${phoneDigits}`

  isLoading.value = true
  error.value = ''

  try {
    // Navigate to call verification
    console.log('[RegistrationScreen] Navigating to call verification with phone:', fullPhone, 'name:', name.value.trim())
    props.onCallVerification(trimmedName, fullPhone)
  } catch (err) {
    console.error('[RegistrationScreen] Error:', err)
    error.value = 'Ошибка. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="registration-screen">
    <div class="registration-screen__container">
      <div class="registration-screen__header">
        <button type="button" class="registration-screen__back" @click="props.onBack" aria-label="Назад">
          <span v-html="backIconSvg" class="registration-screen__back-icon"></span>
        </button>
        <div class="registration-screen__badge">
          <span v-html="userPlusIconSvg" class="registration-screen__badge-icon"></span>
        </div>
        <h1 class="registration-screen__title">Создать аккаунт</h1>
      </div>

      <div ref="contentRef" class="registration-screen__content">
        <div class="registration-screen__form">
          <div class="registration-screen__field">
            <label class="registration-screen__label">Ваше имя</label>
            <div class="registration-screen__input-wrapper">
              <input
                v-model="name"
                type="text"
                class="registration-screen__input"
                placeholder="Введите имя"
                @input="handleNameInput"
                @focus="handleInputFocus"
                :disabled="isLoading"
              />
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="registration-screen__input-icon registration-screen__input-icon--name">
                <path d="M7 8C4.78125 8 3 6.21875 3 4C3 1.8125 4.78125 0 7 0C9.1875 0 11 1.8125 11 4C11 6.21875 9.1875 8 7 8ZM9.78125 9C12.0938 9 14 10.9062 14 13.2188V14.5C14 15.3438 13.3125 16 12.5 16H1.5C0.65625 16 0 15.3438 0 14.5V13.2188C0 10.9062 1.875 9 4.1875 9H4.71875C5.40625 9.34375 6.1875 9.5 7 9.5C7.8125 9.5 8.5625 9.34375 9.25 9H9.78125Z" fill="#9CA3AF"/>
              </svg>
            </div>
          </div>

          <div class="registration-screen__field registration-screen__field--phone">
            <label class="registration-screen__label">Номер телефона</label>
            <div class="registration-screen__input-wrapper">
              <input
                v-model="phone"
                type="tel"
                class="registration-screen__input registration-screen__input--phone"
                placeholder="+7 (999) 123-45-67"
                @input="handlePhoneInput"
                @focus="handleInputFocus"
                :disabled="isLoading"
              />
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="registration-screen__input-icon">
                <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="#9CA3AF"/>
              </svg>
            </div>
            <p class="registration-screen__hint">
              <span>Для подтверждения нужно будет</span><br>
              <span>позвонить на указанный номер</span>
            </p>
          </div>

          <div v-if="error" class="registration-screen__error">
            {{ error }}
          </div>
        </div>

      </div>

      <div class="registration-screen__footer">
        <button
          type="button"
          class="registration-screen__button registration-screen__button--primary"
          @click="handleSubmit"
          :disabled="isLoading || !name.trim() || !isNameValid(name) || !phone || phone.length < 18"
        >
          {{ isLoading ? 'Загрузка...' : 'Зарегистрироваться' }}
        </button>
        <div class="registration-screen__footer-link">
          <p class="registration-screen__footer-text">
            Уже есть аккаунт?
            <button
              type="button"
              class="registration-screen__footer-link-button"
              @click="props.onLogin"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.registration-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
}

.registration-screen__container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  position: relative;
}

.registration-screen__header {
  padding: 24px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  flex-shrink: 0;
  flex-grow: 0;
  height: 180px;
  min-height: 180px;
}

.registration-screen__back {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.registration-screen__back-icon {
  width: 15px;
  height: 14px;
  display: block;
}

.registration-screen__back-icon :deep(svg) {
  width: 15px;
  height: 14px;
  display: block;
}

.registration-screen__badge {
  width: 60px;
  height: 60px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 0;
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.registration-screen__badge-icon {
  width: 36px;
  height: 36px;
  display: block;
}

.registration-screen__badge-icon :deep(svg) {
  width: 36px;
  height: 36px;
  display: block;
}

.registration-screen__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  margin-top: 70px;
  width: auto;
  max-width: 90%;
  padding-top: 30px;
}

.registration-screen__content {
  padding: 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: flex-start;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scroll-padding-top: 20px;
}

.registration-screen__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.registration-screen__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.registration-screen__label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #374151;
  margin-bottom: 0;
}

.registration-screen__input-wrapper {
  position: relative;
  margin-top: 0;
}

.registration-screen__input {
  width: 100%;
  padding: 18px 16px 18px 48px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #9CA3AF;
  background: #ffffff;
  box-sizing: border-box;
  text-align: left;
  -webkit-appearance: none;
  appearance: none;
}

.registration-screen__input::placeholder {
  color: #9CA3AF;
}

.registration-screen__input--phone {
  font-size: 16px;
}

.registration-screen__input:focus {
  outline: none;
  border-color: #2563EB;
  color: #374151;
}

.registration-screen__input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  display: block;
}

.registration-screen__input-icon--name {
  width: 14px;
  height: 16px;
}

.registration-screen__field--phone {
  height: auto;
}

.registration-screen__hint {
  margin: 0;
  margin-top: 8px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
  text-align: center;
}

.registration-screen__hint span {
  display: inline-block;
}

.registration-screen__error {
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-family: Inter, sans-serif;
  font-size: 14px;
  text-align: center;
}

.registration-screen__advantages {
  margin-top: 0;
  padding: 16px 20px;
  background: #FAF5FF;
  border: 1px solid #F3E8FF;
  border-radius: 12px;
  gap: 12px;
}

.registration-screen__advantages-title {
  margin: 0 0 12px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.5;
  text-align: center;
  color: #6B21A8;
}

.registration-screen__advantages-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.registration-screen__advantages-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #7E22CE;
}

.registration-screen__advantages-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-right: 0;
}

.registration-screen__advantages-icon :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.registration-screen__footer {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
  flex-shrink: 0;
  flex-grow: 0;
}

.registration-screen__footer-link {
  text-align: center;
}

.registration-screen__footer-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
}

.registration-screen__footer-link-button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  color: #9333EA;
  cursor: pointer;
  text-decoration: none;
}

.registration-screen__footer-link-button:hover {
  text-decoration: underline;
}

.registration-screen__button {
  width: 100%;
  height: 51px;
  padding: 0;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registration-screen__button--primary {
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  color: #ffffff;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.registration-screen__button--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.registration-screen__button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Mobile styles (480px and below) - These styles are preserved and not affected by tablet/desktop styles */
@media (max-width: 480px) {
  .registration-screen__container {
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }

  .registration-screen__content {
    /* padding: 32px 24px; */
    padding: 32px 24px 0px 24px;
    justify-content: flex-start;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .registration-screen__header {
    padding: 100px 64px 40px;
  }

  .registration-screen__badge {
    width: 120px;
    height: 120px;
  }

  .registration-screen__badge-icon {
    width: 46px;
    height: 46px;
  }

  .registration-screen__title {
    font-size: 32px;
  }

  .registration-screen__subtitle {
    font-size: 18px;
  }

  .registration-screen__content {
    padding: 48px 64px 48px;
  }

  .registration-screen__form-group {
    gap: 28px;
  }

  .registration-screen__label {
    font-size: 18px;
  }

  .registration-screen__input {
    padding: 20px 20px 20px 56px;
    font-size: 18px;
  }

  .registration-screen__input-icon {
    width: 20px;
    height: 20px;
    left: 20px;
  }

  .registration-screen__hint {
    font-size: 16px;
  }

  .registration-screen__advantages {
    padding: 20px 28px;
  }

  .registration-screen__advantages-title {
    font-size: 22px;
  }

  .registration-screen__advantages-item {
    font-size: 18px;
  }

  .registration-screen__footer {
    padding: 32px 64px;
  }

  .registration-screen__button {
    font-size: 18px;
    height: 56px;
  }

  .registration-screen__footer-text {
    font-size: 16px;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .registration-screen__header {
    padding: 120px 80px 48px;
  }

  .registration-screen__badge {
    width: 140px;
    height: 140px;
  }

  .registration-screen__badge-icon {
    width: 52px;
    height: 52px;
  }

  .registration-screen__title {
    font-size: 36px;
  }

  .registration-screen__subtitle {
    font-size: 20px;
  }

  .registration-screen__content {
    padding: 56px 80px 56px;
  }

  .registration-screen__form-group {
    gap: 32px;
  }

  .registration-screen__label {
    font-size: 20px;
  }

  .registration-screen__input {
    padding: 22px 24px 22px 64px;
    font-size: 20px;
  }

  .registration-screen__input-icon {
    width: 22px;
    height: 22px;
    left: 24px;
  }

  .registration-screen__hint {
    font-size: 18px;
  }

  .registration-screen__advantages {
    padding: 24px 32px;
  }

  .registration-screen__advantages-title {
    font-size: 24px;
  }

  .registration-screen__advantages-item {
    font-size: 20px;
  }

  .registration-screen__footer {
    padding: 40px 80px;
  }

  .registration-screen__button {
    font-size: 20px;
    height: 60px;
  }

  .registration-screen__footer-text {
    font-size: 18px;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .registration-screen__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .registration-screen__header {
    padding: 80px 48px 40px;
  }

  .registration-screen__badge {
    width: 120px;
    height: 120px;
  }

  .registration-screen__badge-icon {
    width: 46px;
    height: 46px;
  }

  .registration-screen__title {
    font-size: 24px;
  }

  .registration-screen__subtitle {
    font-size: 16px;
  }

  .registration-screen__content {
    padding: 32px 48px 32px;
  }

  .registration-screen__form-group {
    gap: 24px;
  }

  .registration-screen__label {
    font-size: 16px;
  }

  .registration-screen__input {
    padding: 18px 16px 18px 48px;
    font-size: 16px;
  }

  .registration-screen__input-icon {
    width: 18px;
    height: 18px;
    left: 16px;
  }

  .registration-screen__hint {
    font-size: 14px;
  }

  .registration-screen__advantages {
    padding: 16px 20px;
  }

  .registration-screen__advantages-title {
    font-size: 16px;
  }

  .registration-screen__advantages-item {
    font-size: 14px;
  }

  .registration-screen__footer {
    padding: 24px 48px;
  }

  .registration-screen__button {
    font-size: 16px;
    height: 51px;
  }

  .registration-screen__footer-text {
    font-size: 14px;
  }
}
</style>

