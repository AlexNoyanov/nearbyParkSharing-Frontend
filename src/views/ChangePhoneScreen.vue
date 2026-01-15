<script setup lang="ts">
import { ref } from 'vue'
import backIconSvg from '../assets/icons/icon-back.svg?raw'

const props = defineProps<{
  currentPhone?: string
  onBack: () => void
  onChangePhone: (phone: string) => void
}>()

const phone = ref(props.currentPhone || '')
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

const handleSubmit = async () => {
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
    // Navigate to call verification or update phone
    console.log('[ChangePhoneScreen] Changing phone to:', fullPhone)
    props.onChangePhone(fullPhone)
  } catch (err) {
    console.error('[ChangePhoneScreen] Error:', err)
    error.value = 'Ошибка. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="change-phone-screen">
    <div class="change-phone-screen__container">
      <div class="change-phone-screen__header">
        <button type="button" class="change-phone-screen__back" @click="props.onBack" aria-label="Назад">
          <span v-html="backIconSvg" class="change-phone-screen__back-icon"></span>
        </button>
        <div class="change-phone-screen__badge">
          <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="change-phone-screen__badge-icon">
            <path d="M24.375 29H19.4531C19.043 29 18.75 28.707 18.75 28.2969V25.9531C18.75 25.6016 19.043 25.25 19.4531 25.25H24.375C25.3711 25.25 26.25 24.4297 26.25 23.375V12.125C26.25 11.1289 25.3711 10.25 24.375 10.25H19.4531C19.043 10.25 18.75 9.95703 18.75 9.54688V7.20312C18.75 6.85156 19.043 6.5 19.4531 6.5H24.375C27.4805 6.5 30 9.01953 30 12.125V23.375C30 26.4805 27.4805 29 24.375 29ZM21.6211 17.2227C22.1484 17.8086 22.1484 18.6875 21.6211 19.2148L11.7773 29.0586C10.8984 29.9375 9.375 29.3516 9.375 28.0625V22.4375H1.40625C0.585938 22.4375 0 21.8516 0 21.0312V15.4062C0 14.6445 0.585938 14 1.40625 14H9.375V8.375C9.375 7.14453 10.8984 6.5 11.7773 7.37891L21.6211 17.2227Z" fill="white"/>
          </svg>
        </div>
        <h1 class="change-phone-screen__title">Изменить номер</h1>
      </div>

      <div ref="contentRef" class="change-phone-screen__content">
        <div class="change-phone-screen__form">
          <div class="change-phone-screen__field change-phone-screen__field--phone">
            <label class="change-phone-screen__label">Номер телефона</label>
            <div class="change-phone-screen__input-wrapper">
              <input
                v-model="phone"
                type="tel"
                class="change-phone-screen__input change-phone-screen__input--phone"
                placeholder="+7 (999) 123-45-67"
                @input="handlePhoneInput"
                @focus="handleInputFocus"
                :disabled="isLoading"
              />
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="change-phone-screen__input-icon">
                <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="#9CA3AF"/>
              </svg>
            </div>
            <p class="change-phone-screen__hint">
              На этот номер придет SMS с кодом подтверждения
            </p>
          </div>

          <div v-if="error" class="change-phone-screen__error">
            {{ error }}
          </div>
        </div>
      </div>

      <div class="change-phone-screen__footer">
        <button
          type="button"
          class="change-phone-screen__button change-phone-screen__button--primary"
          @click="handleSubmit"
          :disabled="isLoading || !phone || phone.length < 18"
        >
          {{ isLoading ? 'Загрузка...' : 'Изменить номер' }}
        </button>
        <button
          type="button"
          class="change-phone-screen__button change-phone-screen__button--secondary"
          @click="props.onBack"
        >
          Отмена
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.change-phone-screen {
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

.change-phone-screen__container {
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

.change-phone-screen__header {
  padding: 60px 24px 20px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  flex-shrink: 0;
  justify-content: flex-start;
}

.change-phone-screen__back {
  position: absolute;
  top: 24px;
  left: 18px;
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

.change-phone-screen__back-icon {
  width: 15px;
  height: 14px;
  display: block;
}

.change-phone-screen__back-icon :deep(svg) {
  width: 15px;
  height: 14px;
  display: block;
}

.change-phone-screen__badge {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 32px;
  position: relative;
}

.change-phone-screen__badge-icon {
  width: 30px;
  height: 36px;
  display: block;
  flex-shrink: 0;
}

.change-phone-screen__title {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  text-align: center;
  color: #ffffff;
}

.change-phone-screen__content {
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

.change-phone-screen__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.change-phone-screen__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.change-phone-screen__label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #374151;
  margin-bottom: 0;
}

.change-phone-screen__input-wrapper {
  position: relative;
  margin-top: 0;
}

.change-phone-screen__input {
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

.change-phone-screen__input::placeholder {
  color: #9CA3AF;
}

.change-phone-screen__input--phone {
  font-size: 16px;
}

.change-phone-screen__input:focus {
  outline: none;
  border-color: #2563EB;
  color: #374151;
}

.change-phone-screen__input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  display: block;
}

.change-phone-screen__field--phone {
  height: auto;
}

.change-phone-screen__hint {
  margin: 0;
  margin-top: 8px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
  text-align: center;
}

.change-phone-screen__error {
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-family: Inter, sans-serif;
  font-size: 14px;
  text-align: center;
}

.change-phone-screen__footer {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
  flex-shrink: 0;
  flex-grow: 0;
}

.change-phone-screen__button {
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

.change-phone-screen__button--primary {
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  color: #ffffff;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.change-phone-screen__button--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.change-phone-screen__button--secondary {
  background: transparent;
  color: #6B7280;
  font-weight: 400;
  box-shadow: none;
  height: auto;
  padding: 8px 0;
}

.change-phone-screen__button--secondary:hover {
  color: #374151;
}

.change-phone-screen__button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Mobile styles (480px and below) */
@media (max-width: 480px) {
  .change-phone-screen__container {
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }

  .change-phone-screen__content {
    padding: 32px 24px 0px 24px;
    justify-content: flex-start;
  }
}

/* Tablet styles (768px and up) */
@media (min-width: 768px) {
  .change-phone-screen__header {
    padding: 100px 64px 40px;
  }

  .change-phone-screen__badge {
    width: 120px;
    height: 120px;
    margin-bottom: 32px;
  }

  .change-phone-screen__badge-icon {
    width: 40px;
    height: 48px;
  }

  .change-phone-screen__title {
    font-size: 32px;
  }

  .change-phone-screen__content {
    padding: 48px 64px 48px;
  }

  .change-phone-screen__label {
    font-size: 18px;
  }

  .change-phone-screen__input {
    padding: 20px 20px 20px 56px;
    font-size: 18px;
  }

  .change-phone-screen__input-icon {
    width: 20px;
    height: 20px;
    left: 20px;
  }

  .change-phone-screen__hint {
    font-size: 16px;
  }

  .change-phone-screen__footer {
    padding: 32px 64px;
  }

  .change-phone-screen__button {
    font-size: 18px;
    height: 56px;
  }

  .change-phone-screen__button--secondary {
    font-size: 16px;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .change-phone-screen__header {
    padding: 120px 80px 48px;
  }

  .change-phone-screen__badge {
    width: 140px;
    height: 140px;
    margin-bottom: 32px;
  }

  .change-phone-screen__badge-icon {
    width: 46px;
    height: 56px;
  }

  .change-phone-screen__title {
    font-size: 36px;
  }

  .change-phone-screen__content {
    padding: 56px 80px 56px;
  }

  .change-phone-screen__label {
    font-size: 20px;
  }

  .change-phone-screen__input {
    padding: 22px 24px 22px 64px;
    font-size: 20px;
  }

  .change-phone-screen__input-icon {
    width: 22px;
    height: 22px;
    left: 24px;
  }

  .change-phone-screen__hint {
    font-size: 18px;
  }

  .change-phone-screen__footer {
    padding: 40px 80px;
  }

  .change-phone-screen__button {
    font-size: 20px;
    height: 60px;
  }

  .change-phone-screen__button--secondary {
    font-size: 18px;
  }
}

/* Large desktop styles (1440px and up) */
@media (min-width: 1440px) {
  .change-phone-screen__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .change-phone-screen__header {
    padding: 80px 48px 40px;
  }

  .change-phone-screen__badge {
    width: 120px;
    height: 120px;
    margin-bottom: 32px;
  }

  .change-phone-screen__badge-icon {
    width: 40px;
    height: 48px;
  }

  .change-phone-screen__title {
    font-size: 28px;
  }

  .change-phone-screen__content {
    padding: 32px 48px 32px;
  }

  .change-phone-screen__label {
    font-size: 16px;
  }

  .change-phone-screen__input {
    padding: 18px 16px 18px 48px;
    font-size: 16px;
  }

  .change-phone-screen__input-icon {
    width: 18px;
    height: 18px;
    left: 16px;
  }

  .change-phone-screen__hint {
    font-size: 14px;
  }

  .change-phone-screen__footer {
    padding: 24px 48px;
  }

  .change-phone-screen__button {
    font-size: 16px;
    height: 51px;
  }

  .change-phone-screen__button--secondary {
    font-size: 14px;
  }
}
</style>
