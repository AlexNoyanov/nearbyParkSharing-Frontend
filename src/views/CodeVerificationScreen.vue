<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { mockAuth, type User } from '../services/mockAuth'

const props = defineProps<{
  phone: string
  name?: string
  isRegistration: boolean
  onBack: () => void
  onSuccess: (user: User) => void
}>()

const code = ref(['', '', '', ''])
const codeInputs = ref<(HTMLInputElement | null)[]>([])
const isLoading = ref(false)
const error = ref('')
const isAlreadyRegistered = ref(false)
const expectedCode = ref<string>('')

// Check if all 4 code inputs are filled with valid digits
const isCodeComplete = computed(() => {
  return code.value.every(digit => digit !== '' && /^\d$/.test(digit)) && code.value.length === 4
})

onMounted(async () => {
  // Initialize code as empty
  code.value = ['', '', '', '']
  
  // Get the expected code
  if (props.isRegistration) {
    // For registration, the code is always "0000" for testing
    expectedCode.value = '0000'
    
    // Log for debugging
    console.log('[CodeVerification] Registration flow for phone:', props.phone)
    console.log('[CodeVerification] Name:', props.name)
    console.log('[CodeVerification] Expected code: 0000')
    
    // Check if pending registration exists
    const pending = mockAuth.getPendingRegistration(props.phone)
    console.log('[CodeVerification] Pending registration:', pending)
    if (pending) {
      expectedCode.value = pending.code
    }
    if (!pending) {
      console.warn('[CodeVerification] WARNING: No pending registration found! Phone:', props.phone)
      console.warn('[CodeVerification] Make sure you completed the registration form before verifying the code')
    }
  } else {
    // For login, try to get the expected code
    // For testing, "0000" is accepted for any phone
    // But we'll use "0000" as the expected code for real-time validation
    expectedCode.value = '0000'
    
    // Try to get the actual code if it exists in mock data
    // This would require accessing mockVerificationCodes, but for simplicity,
    // we'll use "0000" as the expected code since it's accepted for testing
  }
})

const handleCodeInput = (index: number, value: string) => {
  // Only allow digits
  const digit = value.replace(/\D/g, '').slice(-1)
  
  if (digit) {
    code.value[index] = digit
    
    // Move to next input
    if (index < 3 && codeInputs.value[index + 1]) {
      codeInputs.value[index + 1]?.focus()
    }
  } else {
    code.value[index] = ''
  }
  
  error.value = ''
}

const handleKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    if (!code.value[index] && index > 0) {
      // If current input is empty, move to previous and clear it
      code.value[index - 1] = ''
      codeInputs.value[index - 1]?.focus()
    } else if (code.value[index]) {
      // If current input has value, clear it
      code.value[index] = ''
    }
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text') || ''
  const digits = pasted.replace(/\D/g, '').slice(0, 4)
  
  // Clear all inputs first
  code.value = ['', '', '', '']
  
  // Fill with pasted digits
  digits.split('').forEach((digit, i) => {
    if (i < 4) {
      code.value[i] = digit
    }
  })
  
  // Focus the last filled input or the last input
  const lastIndex = Math.min(digits.length - 1, 3)
  codeInputs.value[lastIndex]?.focus()
  error.value = ''
}

const handleSubmit = async () => {
  const codeString = code.value.join('')
  
  if (codeString.length !== 4) {
    error.value = 'Введите 4-значный код'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    let user: User | null = null

    if (props.isRegistration) {
      if (!props.name) {
        error.value = 'Имя не указано'
        isLoading.value = false
        return
      }

      // Complete registration
      console.log('[CodeVerification] Attempting registration with:', { phone: props.phone, code: codeString, name: props.name })
      user = await mockAuth.completeRegistration(props.phone, codeString, props.name)
      
      if (!user) {
        // Check if account already exists
        if (mockAuth.isPhoneRegistered(props.phone)) {
          isAlreadyRegistered.value = true
          isLoading.value = false
          return
        }
        error.value = 'Код введен неверно. Попробуйте еще раз'
        return
      }
    } else {
      // Login - for testing, code 0000 is accepted for any registered user
      user = await mockAuth.verifyCodeAndLogin(props.phone, codeString)
      
      if (!user) {
        error.value = 'Неверный код. Для входа используйте код 0000.'
        return
      }
    }

    if (user) {
      props.onSuccess(user)
    }
  } catch (err) {
    error.value = 'Ошибка при проверке кода. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}

const handleResendSMS = async () => {
  isLoading.value = true
  try {
    await mockAuth.sendVerificationCode(props.phone, props.isRegistration)
    // Reset timer or show success message
  } catch (err) {
    error.value = 'Ошибка при отправке кода. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}

const handleGoToLogin = () => {
  // Navigate to login screen - this will be handled by parent component
  // For now, we'll go back and let the parent handle navigation
  props.onBack()
}

const handleRecoverPassword = () => {
  // TODO: Implement password recovery flow
  console.log('Password recovery requested for:', props.phone)
}

const handleContactSupport = () => {
  // TODO: Implement support contact flow
  console.log('Contact support requested')
}

const handleClearCode = () => {
  // Clear all code inputs
  code.value = ['', '', '', '']
  error.value = ''
  // Focus the first input to open numeric keyboard on mobile
  if (codeInputs.value[0]) {
    codeInputs.value[0].focus()
  }
}


// Clear error when code is being entered
watch(
  isCodeComplete,
  (complete) => {
    if (complete) {
      // Clear any previous errors when code is complete
      error.value = ''
    }
  }
)
</script>

<template>
  <section class="code-verification-screen">
    <div class="code-verification-screen__container">
      <!-- Header -->
      <div class="code-verification-screen__header">
        <button
          type="button"
          class="code-verification-screen__back"
          @click="props.onBack"
          aria-label="Назад"
        >
          <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__back-icon">
            <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="#374151"/>
          </svg>
        </button>
        <h1 class="code-verification-screen__header-title">
          {{ isAlreadyRegistered && isRegistration ? 'Регистрация' : 'Подтверждение' }}
        </h1>
        <div class="code-verification-screen__header-spacer"></div>
      </div>

      <!-- Content -->
      <div class="code-verification-screen__content">
        <div v-if="isAlreadyRegistered" class="code-verification-screen__already-registered">
          <!-- Icon -->
          <div class="code-verification-screen__registered-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__registered-icon">
              <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM22.707 12.707L15.707 19.707C15.512 19.902 15.256 20 15 20C14.744 20 14.488 19.902 14.293 19.707L11.293 16.707C10.902 16.316 10.902 15.684 11.293 15.293C11.684 14.902 12.316 14.902 12.707 15.293L15 17.586L21.293 11.293C21.684 10.902 22.316 10.902 22.707 11.293C23.098 11.684 23.098 12.316 22.707 12.707Z" fill="#EA580C"/>
            </svg>
          </div>

          <!-- Title and Description -->
          <div class="code-verification-screen__registered-title-section">
            <h2 class="code-verification-screen__registered-title">Аккаунт уже существует</h2>
            <p class="code-verification-screen__registered-description">
              Пользователь с номером телефона
            </p>
            <p class="code-verification-screen__registered-phone">{{ props.phone }}</p>
            <p class="code-verification-screen__registered-description">
              уже зарегистрирован в системе ParkShare
            </p>
          </div>

          <!-- Account Info -->
          <div class="code-verification-screen__account-info">
            <div class="code-verification-screen__account-info-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__account-info-icon">
                <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM10 16C6.69 16 4 13.31 4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16ZM9.5 5.5H10.5V7.5H9.5V5.5ZM9.5 9H10.5V14.5H9.5V9Z" fill="#EA580C"/>
              </svg>
              <div class="code-verification-screen__account-info-text">
                <h4 class="code-verification-screen__account-info-title">Информация об аккаунте</h4>
                <div class="code-verification-screen__account-info-details">
                  <div class="code-verification-screen__account-info-row">
                    <span>Дата регистрации:</span>
                    <span class="code-verification-screen__account-info-value">15 ноября 2024</span>
                  </div>
                  <div class="code-verification-screen__account-info-row">
                    <span>Статус:</span>
                    <span class="code-verification-screen__account-info-value">Активный</span>
                  </div>
                  <div class="code-verification-screen__account-info-row">
                    <span>Последний вход:</span>
                    <span class="code-verification-screen__account-info-value">2 дня назад</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="code-verification-screen__options">
            <h3 class="code-verification-screen__options-title">Что вы хотите сделать?</h3>
            <div class="code-verification-screen__options-list">
              <button
                type="button"
                class="code-verification-screen__option-button code-verification-screen__option-button--primary"
                @click="handleGoToLogin"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__option-icon">
                  <path d="M7 10L13 4M13 4H9M13 4V8M13 10L7 16M13 16H9M13 16V12" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="code-verification-screen__option-content">
                  <p class="code-verification-screen__option-title">Войти в существующий аккаунт</p>
                  <p class="code-verification-screen__option-subtitle">Использовать этот номер телефона</p>
                </div>
              </button>

              <button
                type="button"
                class="code-verification-screen__option-button code-verification-screen__option-button--secondary"
                @click="handleRecoverPassword"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__option-icon">
                  <rect x="4" y="8" width="12" height="8" rx="1" stroke="#6B7280" stroke-width="1.5"/>
                  <path d="M6 8V6C6 4.34315 7.34315 3 9 3H11C12.6569 3 14 4.34315 14 6V8" stroke="#6B7280" stroke-width="1.5"/>
                  <path d="M10 11V13" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <div class="code-verification-screen__option-content">
                  <p class="code-verification-screen__option-title">Восстановить пароль</p>
                  <p class="code-verification-screen__option-subtitle">Если забыли данные для входа</p>
                </div>
              </button>

              <button
                type="button"
                class="code-verification-screen__option-button code-verification-screen__option-button--secondary"
                @click="props.onBack"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__option-icon">
                  <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="#6B7280"/>
                </svg>
                <div class="code-verification-screen__option-content">
                  <p class="code-verification-screen__option-title">Использовать другой номер</p>
                  <p class="code-verification-screen__option-subtitle">Зарегистрироваться с новым номером</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Help -->
          <div class="code-verification-screen__help-section">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__help-section-icon">
              <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM10 16C6.69 16 4 13.31 4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16ZM9.5 5.5H10.5V7.5H9.5V5.5ZM9.5 9H10.5V14.5H9.5V9Z" fill="#6B7280"/>
            </svg>
            <div class="code-verification-screen__help-section-content">
              <h4 class="code-verification-screen__help-section-title">Нужна помощь?</h4>
              <p class="code-verification-screen__help-section-text">
                Если вы не помните, что регистрировались ранее, или у вас возникли проблемы с доступом к аккаунту
              </p>
              <button
                type="button"
                class="code-verification-screen__help-section-link"
                @click="handleContactSupport"
              >
                Связаться с поддержкой
              </button>
            </div>
          </div>
        </div>

        <div v-else class="code-verification-screen__form">
          <!-- Icon -->
          <div class="code-verification-screen__icon-wrapper">
            <svg width="31" height="36" viewBox="0 0 31 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__icon">
              <path d="M15.0586 4.625C23.3203 4.625 30.0586 10.1328 30.0586 16.8125C30.0586 23.5508 23.3203 29 15.0586 29C12.7734 29 10.6641 28.5898 8.73047 27.8867C7.32422 29.0586 4.39453 30.875 0.527344 30.875C0.292969 30.875 0.175781 30.8164 0.0585938 30.6406C0 30.4648 0.0585938 30.2305 0.175781 30.1133C0.175781 30.0547 2.63672 27.4766 3.39844 24.4883C1.28906 22.3789 0.0585938 19.7422 0.0585938 16.8125C0.0585938 10.1328 6.73828 4.625 15.0586 4.625ZM7.55859 20.5625C8.90625 20.5625 10.0195 19.5664 10.0195 18.3359C10.0195 17.6914 9.72656 17.1055 9.25781 16.6953L7.96875 15.582C7.91016 15.5234 7.85156 15.4062 7.85156 15.3477C7.85156 15.1719 8.08594 14.9961 8.4375 14.9961H9.19922C9.43359 14.9961 9.66797 14.7617 9.66797 14.5273V13.5898C9.66797 13.2969 9.43359 13.1211 9.19922 13.1211H8.4375C7.08984 13.1211 5.97656 14.1172 5.97656 15.3477C5.97656 15.9922 6.26953 16.5781 6.73828 16.9883L8.02734 18.1016C8.08594 18.1602 8.14453 18.2773 8.14453 18.3359C8.14453 18.5117 7.91016 18.6875 7.55859 18.6875H6.85547C6.5625 18.6875 6.38672 18.9219 6.38672 19.1562V20.0938C6.38672 20.3867 6.5625 20.5625 6.85547 20.5625H7.55859ZM18.8086 20.0938V14C18.8086 13.5312 18.3398 13.0625 17.8711 13.0625H16.9336C16.582 13.0625 16.2305 13.2969 16.0547 13.5898L15.0586 15.6992L14.0039 13.5898C13.8281 13.2969 13.5352 13.0625 13.1836 13.0625H12.2461C11.7188 13.0625 11.3086 13.5312 11.3086 14V20.0938C11.3086 20.3867 11.4844 20.5625 11.7773 20.5625H12.7148C12.9492 20.5625 13.1836 20.3867 13.1836 20.0938V16.1094L14.5898 19.3906C14.7656 19.7422 15.293 19.7422 15.4688 19.3906L16.9336 16.1094V20.0938C16.9336 20.3867 17.1094 20.5625 17.4023 20.5625H18.3398C18.5742 20.5625 18.8086 20.3867 18.8086 20.0938ZM21.6211 20.5625C22.9688 20.5625 24.082 19.5664 24.082 18.3359C24.082 17.6914 23.7891 17.1055 23.3203 16.6953L22.0312 15.582C21.9727 15.5234 21.9141 15.4062 21.9141 15.3477C21.9141 15.1719 22.1484 14.9961 22.5 14.9961H23.2617C23.4961 14.9961 23.7305 14.7617 23.7305 14.5273V13.5898C23.7305 13.2969 23.4961 13.1211 23.2617 13.1211H22.5C21.1523 13.1211 20.0391 14.1172 20.0391 15.3477C20.0391 15.9922 20.332 16.5781 20.8008 16.9883L22.0898 18.1016C22.1484 18.1602 22.207 18.2773 22.207 18.3359C22.207 18.5117 21.9727 18.6875 21.6211 18.6875H20.918C20.625 18.6875 20.4492 18.9219 20.4492 19.1562V20.0938C20.4492 20.3867 20.625 20.5625 20.918 20.5625H21.6211Z" fill="#2563EB"/>
            </svg>
          </div>

          <!-- Title and Description -->
          <div class="code-verification-screen__title-section">
            <h2 class="code-verification-screen__title">Введите код из SMS</h2>
            <p class="code-verification-screen__description">
              Мы отправили 4-значный код подтверждения на номер
            </p>
            <p class="code-verification-screen__phone">{{ props.phone }}</p>
          </div>

          <!-- Code Input -->
          <div class="code-verification-screen__code-section">
            <div class="code-verification-screen__code-inputs">
              <input
                v-for="(_, index) in code"
                :key="index"
                ref="codeInputs"
                :value="code[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="code-verification-screen__code-input"
                :class="{ 
                  'code-verification-screen__code-input--filled': code[index],
                  'code-verification-screen__code-input--error': error 
                }"
                @input="(e) => handleCodeInput(index, (e.target as HTMLInputElement).value)"
                @keydown="(e) => handleKeyDown(index, e as KeyboardEvent)"
                @paste="handlePaste"
                :disabled="isLoading"
              />
            </div>

            <!-- Timer -->
            <div class="code-verification-screen__timer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__timer-icon">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 4V8L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Код действителен еще</span>
              <span class="code-verification-screen__timer-value">01:30</span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="code-verification-screen__error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__error-icon">
              <path d="M7.75 0C12.0312 0 15.5 3.46875 15.5 7.75C15.5 12.0312 12.0312 15.5 7.75 15.5C3.46875 15.5 0 12.0312 0 7.75C0 3.46875 3.46875 0 7.75 0ZM11.5312 9.8125L9.5 7.75L11.5312 5.71875C11.6875 5.59375 11.6875 5.34375 11.5312 5.1875L10.3125 3.96875C10.1562 3.8125 9.90625 3.8125 9.78125 3.96875L7.75 6L5.71875 3.96875C5.5625 3.8125 5.3125 3.8125 5.1875 3.96875L3.9375 5.1875C3.78125 5.34375 3.78125 5.59375 3.9375 5.71875L6 7.75L3.9375 9.78125C3.78125 9.9375 3.78125 10.1875 3.9375 10.3125L5.15625 11.5625C5.3125 11.7188 5.5625 11.7188 5.6875 11.5625L7.75 9.5L9.78125 11.5625C9.90625 11.7188 10.1562 11.7188 10.3125 11.5625L11.5312 10.3438C11.6875 10.1875 11.6875 9.9375 11.5312 9.8125Z" fill="#B91C1C"/>
            </svg>
            <span>{{ error }}</span>
          </div>


          <!-- Resend Section -->
          <div class="code-verification-screen__resend-section">
            <p class="code-verification-screen__resend-title">Не получили код?</p>
            <div class="code-verification-screen__resend-buttons">
              <button
                type="button"
                class="code-verification-screen__resend-button"
                @click="handleResendSMS"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__resend-icon">
                  <path d="M15.625 0C15.8125 0 16 0.1875 16 0.375V6.65625C16 6.84375 15.8125 7.03125 15.625 7.03125H9.375C9.15625 7.03125 9 6.84375 9 6.65625V5.15625H8.96875C8.96875 4.96875 9.15625 4.78125 9.34375 4.78125C9.375 4.78125 9.375 4.78125 9.375 4.78125L12.5625 4.9375C11.5625 3.46875 9.875 2.5 8 2.5C4.9375 2.5 2.5 4.96875 2.5 8C2.5 11.0625 4.9375 13.5 8 13.5C9.375 13.5 10.6562 13 11.625 12.1562C11.6875 12.0938 11.7812 12.0625 11.875 12.0625C11.9688 12.0625 12.0625 12.0938 12.125 12.1562L13.1875 13.2188C13.25 13.2812 13.3125 13.375 13.3125 13.5C13.3125 13.5938 13.25 13.6875 13.1875 13.7812C11.8125 15 10 15.75 8 15.75C3.71875 15.75 0.25 12.3125 0.25 8.03125C0.21875 3.75 3.71875 0.25 8 0.25C10.3438 0.25 12.4688 1.3125 13.875 3L13.75 0.40625C13.75 0.40625 13.75 0.40625 13.75 0.375C13.75 0.1875 13.9375 0 14.125 0H15.625Z" fill="#374151"/>
                </svg>
                Отправить SMS повторно
              </button>
              <!-- <button
                type="button"
                class="code-verification-screen__resend-button"
                @click="handleCallCode"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__resend-icon">
                  <path d="M3.5 2.5C3.5 2.22386 3.72386 2 4 2H5.5C5.77614 2 6 2.22386 6 2.5V3.5C6 3.77614 5.77614 4 5.5 4H4.5C4.22386 4 4 4.22386 4 4.5V11.5C4 11.7761 4.22386 12 4.5 12H5.5C5.77614 12 6 12.2239 6 12.5V13.5C6 13.7761 5.77614 14 5.5 14H4C3.22386 14 2.5 13.2761 2.5 12.5V3.5C2.5 2.72386 3.22386 2 4 2H3.5Z" fill="currentColor"/>
                  <rect x="7" y="2" width="6" height="12" rx="1" fill="currentColor"/>
                </svg>
                Получить код по звонку
              </button> -->
            </div>
          </div>

          <!-- Change Phone -->
          <button
            type="button"
            class="code-verification-screen__change-phone"
            @click="props.onBack"
          >
            <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__change-phone-icon">
              <path d="M12.5625 2.71875L15.375 5.53125C15.5 5.65625 15.5 5.84375 15.375 5.96875L8.5625 12.7812L5.65625 13.0938C5.28125 13.1562 4.9375 12.8125 5 12.4375L5.3125 9.53125L12.125 2.71875C12.25 2.59375 12.4375 2.59375 12.5625 2.71875ZM17.625 2C18.0938 2.46875 18.0938 3.25 17.625 3.71875L16.5312 4.8125C16.4062 4.9375 16.2188 4.9375 16.0938 4.8125L13.2812 2C13.1562 1.875 13.1562 1.6875 13.2812 1.5625L14.375 0.46875C14.8438 0 15.625 0 16.0938 0.46875L17.625 2ZM12 10.9375C12 10.8125 12.0312 10.7188 12.0938 10.6562L13.3438 9.40625C13.5938 9.1875 14 9.34375 14 9.6875V14.5938C14 15.4375 13.3125 16.0938 12.5 16.0938H1.5C0.65625 16.0938 0 15.4375 0 14.5938V3.59375C0 2.78125 0.65625 2.09375 1.5 2.09375H10.4062C10.75 2.09375 10.9062 2.5 10.6875 2.75L9.4375 4C9.375 4.0625 9.28125 4.09375 9.15625 4.09375H2V14.0938H12V10.9375Z" fill="#2563EB"/>
            </svg>
            Изменить номер телефона
          </button>

          <!-- Help Section -->
          <!-- <div class="code-verification-screen__help">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__help-icon">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 5C7.5 5 7 5.5 7 6C7 6.5 7.5 7 8 7C8.5 7 9 6.5 9 6C9 5.5 8.5 5 8 5Z" fill="currentColor"/>
              <path d="M8 9V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div class="code-verification-screen__help-content">
              <h4 class="code-verification-screen__help-title">Проблемы с получением кода?</h4>
              <p class="code-verification-screen__help-text">
                Проверьте папку "Спам" или убедитесь, что у вас хороший сигнал сети. Код может прийти с задержкой до 5 минут.
              </p>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Bottom Button -->
      <div class="code-verification-screen__footer">
        <button
          v-if="isAlreadyRegistered"
          type="button"
          class="code-verification-screen__button code-verification-screen__button--primary"
          @click="handleGoToLogin"
        >
          Войти
        </button>
        <button
          v-else-if="!error"
          type="button"
          class="code-verification-screen__button code-verification-screen__button--primary"
          @click="handleSubmit"
          :disabled="isLoading || !isCodeComplete"
        >
          {{ isLoading ? 'Проверка...' : 'Подтвердить' }}
        </button>
        <button
          v-else
          type="button"
          class="code-verification-screen__button code-verification-screen__button--clear-code"
          @click="handleClearCode"
        >
          <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="code-verification-screen__clear-code-icon">
            <path d="M18.5625 13.5H1.6875C0.738281 13.5 0 12.7617 0 11.8125V1.6875C0 0.773438 0.738281 0 1.6875 0H18.5625C19.4766 0 20.25 0.773438 20.25 1.6875V11.8125C20.25 12.7617 19.4766 13.5 18.5625 13.5ZM4.5 4.07812V2.67188C4.5 2.46094 4.28906 2.25 4.07812 2.25H2.67188C2.42578 2.25 2.25 2.46094 2.25 2.67188V4.07812C2.25 4.32422 2.42578 4.5 2.67188 4.5H4.07812C4.28906 4.5 4.5 4.32422 4.5 4.07812ZM7.875 4.07812V2.67188C7.875 2.46094 7.66406 2.25 7.45312 2.25H6.04688C5.80078 2.25 5.625 2.46094 5.625 2.67188V4.07812C5.625 4.32422 5.80078 4.5 6.04688 4.5H7.45312C7.66406 4.5 7.875 4.32422 7.875 4.07812ZM11.25 4.07812V2.67188C11.25 2.46094 11.0391 2.25 10.8281 2.25H9.42188C9.17578 2.25 9 2.46094 9 2.67188V4.07812C9 4.32422 9.17578 4.5 9.42188 4.5H10.8281C11.0391 4.5 11.25 4.32422 11.25 4.07812ZM14.625 4.07812V2.67188C14.625 2.46094 14.4141 2.25 14.2031 2.25H12.7969C12.5508 2.25 12.375 2.46094 12.375 2.67188V4.07812C12.375 4.32422 12.5508 4.5 12.7969 4.5H14.2031C14.4141 4.5 14.625 4.32422 14.625 4.07812ZM18 4.07812V2.67188C18 2.46094 17.7891 2.25 17.5781 2.25H16.1719C15.9258 2.25 15.75 2.46094 15.75 2.67188V4.07812C15.75 4.32422 15.9258 4.5 16.1719 4.5H17.5781C17.7891 4.5 18 4.32422 18 4.07812ZM6.1875 7.45312V6.04688C6.1875 5.83594 5.97656 5.625 5.76562 5.625H4.35938C4.11328 5.625 3.9375 5.83594 3.9375 6.04688V7.45312C3.9375 7.69922 4.11328 7.875 4.35938 7.875H5.76562C5.97656 7.875 6.1875 7.69922 6.1875 7.45312ZM9.5625 7.45312V6.04688C9.5625 5.83594 9.35156 5.625 9.14062 5.625H7.73438C7.48828 5.625 7.3125 5.83594 7.3125 6.04688V7.45312C7.3125 7.69922 7.48828 7.875 7.73438 7.875H9.14062C9.35156 7.875 9.5625 7.69922 9.5625 7.45312ZM12.9375 7.45312V6.04688C12.9375 5.83594 12.7266 5.625 12.5156 5.625H11.1094C10.8633 5.625 10.6875 5.83594 10.6875 6.04688V7.45312C10.6875 7.69922 10.8633 7.875 11.1094 7.875H12.5156C12.7266 7.875 12.9375 7.69922 12.9375 7.45312ZM16.3125 7.45312V6.04688C16.3125 5.83594 16.1016 5.625 15.8906 5.625H14.4844C14.2383 5.625 14.0625 5.83594 14.0625 6.04688V7.45312C14.0625 7.69922 14.2383 7.875 14.4844 7.875H15.8906C16.1016 7.875 16.3125 7.69922 16.3125 7.45312ZM4.5 10.8281V9.42188C4.5 9.21094 4.28906 9 4.07812 9H2.67188C2.42578 9 2.25 9.21094 2.25 9.42188V10.8281C2.25 11.0742 2.42578 11.25 2.67188 11.25H4.07812C4.28906 11.25 4.5 11.0742 4.5 10.8281ZM14.625 10.8281V9.42188C14.625 9.21094 14.4141 9 14.2031 9H6.04688C5.80078 9 5.625 9.21094 5.625 9.42188V10.8281C5.625 11.0742 5.80078 11.25 6.04688 11.25H14.2031C14.4141 11.25 14.625 11.0742 14.625 10.8281ZM18 10.8281V9.42188C18 9.21094 17.7891 9 17.5781 9H16.1719C15.9258 9 15.75 9.21094 15.75 9.42188V10.8281C15.75 11.0742 15.9258 11.25 16.1719 11.25H17.5781C17.7891 11.25 18 11.0742 18 10.8281Z" fill="white"/>
          </svg>
          <span>Ввести код заново</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.code-verification-screen {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: #f3f4f6;
}

.code-verification-screen__container {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  height: 100vh;
  background: white;
  border-radius: 50px;
  overflow: hidden;
  position: relative;
  box-shadow: 0px 20px 25px -5px rgba(0, 0, 0, 0.1),
    0px 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.code-verification-screen__header {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.code-verification-screen__back {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.code-verification-screen__back-icon {
  width: 15px;
  height: 14px;
  display: block;
}

.code-verification-screen__header-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.code-verification-screen__header-spacer {
  width: 40px;
}

.code-verification-screen__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem;
  text-align: center;
  overflow-y: auto;
}

.code-verification-screen__already-registered {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0;
  padding-top: 1rem;
}

.code-verification-screen__registered-icon-wrapper {
  width: 96px;
  height: 96px;
  background: #FED7AA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.code-verification-screen__registered-icon {
  width: 32px;
  height: 32px;
  display: block;
}

.code-verification-screen__registered-title-section {
  margin-bottom: 2rem;
  width: 100%;
}

.code-verification-screen__registered-title {
  margin: 0 0 1rem;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.code-verification-screen__registered-description {
  margin: 0 0 0.5rem;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  color: #4b5563;
}

.code-verification-screen__registered-phone {
  margin: 0 0 0.5rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.code-verification-screen__account-info {
  width: 100%;
  padding: 1rem;
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: left;
}

.code-verification-screen__account-info-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.code-verification-screen__account-info-icon {
  width: 20px;
  height: 20px;
  color: #EA580C;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.code-verification-screen__account-info-text {
  flex: 1;
}

.code-verification-screen__account-info-title {
  margin: 0 0 0.5rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  color: #9A3412;
}

.code-verification-screen__account-info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.code-verification-screen__account-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  color: #C2410C;
}

.code-verification-screen__account-info-value {
  font-weight: 500;
}

.code-verification-screen__options {
  width: 100%;
  margin-bottom: 2rem;
  text-align: left;
}

.code-verification-screen__options-title {
  margin: 0 0 1rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
}

.code-verification-screen__options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.code-verification-screen__option-button {
  width: 100%;
  padding: 1rem;
  border: 1px solid;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  transition: background-color 0.2s ease;
  background: transparent;
}

.code-verification-screen__option-button--primary {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #1E40AF;
}

.code-verification-screen__option-button--primary:hover {
  background: #DBEAFE;
}

.code-verification-screen__option-button--secondary {
  background: #F9FAFB;
  border-color: #E5E7EB;
  color: #374151;
}

.code-verification-screen__option-button--secondary:hover {
  background: #F3F4F6;
}

.code-verification-screen__option-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.code-verification-screen__option-content {
  flex: 1;
}

.code-verification-screen__option-title {
  margin: 0 0 0.25rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-verification-screen__option-subtitle {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.8;
}

.code-verification-screen__help-section {
  width: 100%;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}

.code-verification-screen__help-section-icon {
  width: 20px;
  height: 20px;
  color: #6B7280;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.code-verification-screen__help-section-content {
  flex: 1;
}

.code-verification-screen__help-section-title {
  margin: 0 0 0.25rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}

.code-verification-screen__help-section-text {
  margin: 0 0 0.75rem;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #4b5563;
}

.code-verification-screen__help-section-link {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #2563EB;
  cursor: pointer;
  text-decoration: none;
}

.code-verification-screen__help-section-link:hover {
  text-decoration: underline;
}

.code-verification-screen__form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.code-verification-screen__icon-wrapper {
  width: 96px;
  height: 96px;
  background: #DBEAFE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.code-verification-screen__icon {
  width: 31px;
  height: 36px;
  display: block;
}

.code-verification-screen__title-section {
  margin-bottom: 2rem;
  width: 100%;
}

.code-verification-screen__title {
  margin: 0 0 1rem;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.code-verification-screen__description {
  margin: 0 0 0.5rem;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  color: #4b5563;
}

.code-verification-screen__phone {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.code-verification-screen__code-section {
  margin-bottom: 2rem;
  width: 100%;
}

.code-verification-screen__code-inputs {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.code-verification-screen__code-input {
  width: 50px;
  height: 60px;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  text-align: center;
  background: #ffffff;
  color: #374151;
  transition: all 0.2s ease;
}

.code-verification-screen__code-input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.code-verification-screen__code-input--filled {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.code-verification-screen__code-input--error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.code-verification-screen__timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  color: #4b5563;
}

.code-verification-screen__timer-icon {
  width: 16px;
  height: 16px;
  color: #4b5563;
}

.code-verification-screen__timer-value {
  font-weight: 600;
  color: #2563EB;
}

.code-verification-screen__error {
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  color: #DC2626;
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.code-verification-screen__error-icon {
  width: 16px;
  height: 16px;
  color: #DC2626;
  flex-shrink: 0;
}

.code-verification-screen__resend-section {
  margin-bottom: 1.5rem;
  width: 100%;
}

.code-verification-screen__resend-title {
  margin: 0 0 1rem;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #4b5563;
  text-align: center;
}

.code-verification-screen__resend-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.code-verification-screen__resend-button {
  width: 100%;
  padding: 0.75rem;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.code-verification-screen__resend-button:hover {
  background: #e5e7eb;
}

.code-verification-screen__resend-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.code-verification-screen__change-phone {
  background: transparent;
  border: none;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #2563EB;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  transition: color 0.2s ease;
}

.code-verification-screen__change-phone:hover {
  color: #1d4ed8;
}

.code-verification-screen__change-phone-icon {
  width: 19px;
  height: 17px;
  display: block;
}

.code-verification-screen__help {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}

.code-verification-screen__help-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.code-verification-screen__help-content {
  flex: 1;
}

.code-verification-screen__help-title {
  margin: 0 0 0.25rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}

.code-verification-screen__help-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #4b5563;
}

.code-verification-screen__footer {
  padding: 2rem;
  background: #ffffff;
  flex-shrink: 0;
}

.code-verification-screen__button {
  width: 100%;
  padding: 1rem 0;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-verification-screen__button--primary {
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.code-verification-screen__button--primary:disabled {
  background: #D1D5DB;
  color: #6B7280;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 1;
}

.code-verification-screen__button--clear-code {
  background: #DC2626;
  color: #ffffff;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.code-verification-screen__button--clear-code:hover {
  background: #B91C1C;
}

.code-verification-screen__button--clear-code:active {
  background: #991B1B;
  transform: translateY(1px);
}

.code-verification-screen__clear-code-icon {
  width: 21px;
  height: 14px;
  display: block;
  flex-shrink: 0;
}

.code-verification-screen__button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Mobile styles (480px and below) - These styles are preserved and not affected by tablet/desktop styles */
@media (max-width: 480px) {
  .code-verification-screen {
    padding: 0;
  }

  .code-verification-screen__container {
    max-width: 100%;
    width: 100%;
    min-height: 100vh;
    border-radius: 0;
    border: none;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .code-verification-screen__container {
    max-width: 100%;
    border-radius: 0;
  }

  .code-verification-screen__header {
    padding: 24px 48px;
  }

  .code-verification-screen__content {
    padding: 40px 48px;
  }

  .code-verification-screen__title {
    font-size: 32px;
  }

  .code-verification-screen__description {
    font-size: 18px;
  }

  .code-verification-screen__phone {
    font-size: 20px;
  }

  .code-verification-screen__code-input {
    width: 60px;
    height: 72px;
    font-size: 28px;
  }

  .code-verification-screen__button {
    font-size: 18px;
    padding: 18px 0;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .code-verification-screen__header {
    padding: 32px 64px;
  }

  .code-verification-screen__content {
    padding: 48px 64px;
  }

  .code-verification-screen__title {
    font-size: 36px;
  }

  .code-verification-screen__description {
    font-size: 20px;
  }

  .code-verification-screen__phone {
    font-size: 22px;
  }

  .code-verification-screen__code-input {
    width: 70px;
    height: 84px;
    font-size: 32px;
  }

  .code-verification-screen__button {
    font-size: 20px;
    padding: 20px 0;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .code-verification-screen__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 50px;
    box-shadow: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .code-verification-screen__header {
    padding: 24px 32px;
  }

  .code-verification-screen__content {
    padding: 32px 32px;
  }

  .code-verification-screen__title {
    font-size: 24px;
  }

  .code-verification-screen__description {
    font-size: 16px;
  }

  .code-verification-screen__phone {
    font-size: 18px;
  }

  .code-verification-screen__code-input {
    width: 50px;
    height: 60px;
    font-size: 24px;
  }

  .code-verification-screen__button {
    font-size: 16px;
    padding: 16px 0;
  }
}
</style>

