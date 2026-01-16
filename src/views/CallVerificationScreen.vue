<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { User } from '../services/mockAuth'
import { authApi } from '../services/authApi'

const props = defineProps<{
  phone: string
  name?: string
  isRegistration: boolean
  onBack: () => void
  onSuccess: (user: User) => void
}>()

const isLoading = ref(false)
const error = ref('')
const hasCalled = ref(false)
const verificationPhone = ref('')
const rawPhone = ref('')
const statusPollInterval = ref<number | null>(null)
const isInitializing = ref(true)
const hasInitialized = ref(false)
const isInitializingInProgress = ref(false) // Guard to prevent concurrent calls

// Watch for props changes in case they're set after mount (but not immediate to avoid duplicate calls)
watch(() => props.phone, (newPhone, oldPhone) => {
  // Only trigger if phone actually changed (not on initial mount) and hasn't been initialized yet
  // Also check that we're not already in the mounting phase
  if (newPhone && newPhone !== oldPhone && oldPhone !== undefined && !hasInitialized.value && !isInitializingInProgress.value) {
    console.log('[CallVerification] Phone prop changed after mount, initializing...')
    initializeCallCheck()
  }
}, { flush: 'post' }) // Use 'post' flush to ensure this runs after onMounted

// Get Telegram initData
const getInitData = (): string => {
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData
  }
  // Dev-only fallback (allows local debugging without Telegram Mini App)
  if (import.meta.env.DEV) {
    const testInitData =
      'auth_date=1768317980&query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A111222333%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22Alexander%22%2C%22language_code%22%3A%22en%22%7D&hash=77794dcb2dd54b35f40010f1dcede46444340c01530bfd17849802cd6295c527'
    console.log('[CallVerification] DEV: Using test initData (Telegram WebApp not available)')
    return testInitData
  }
  return ''
}

// Initialize call verification and get phone number
const initializeCallCheck = async () => {
  // Prevent duplicate calls - check both flags
  if (hasInitialized.value || isInitializingInProgress.value) {
    console.log('[CallVerification] Already initialized or initialization in progress, skipping...')
    return
  }
  
  // Set guard flags immediately to prevent concurrent calls
  isInitializingInProgress.value = true
  isInitializing.value = true
  error.value = ''
  
  try {
    // Log props to debug
    console.log('[CallVerification] Initializing call check with props:', {
      phone: props.phone,
      name: props.name,
      isRegistration: props.isRegistration,
      phoneType: typeof props.phone,
      phoneLength: props.phone?.length || 0
    })
    
    // Import testMode to check and ensure it's disabled for registration
    const { testMode } = await import('../services/testMode')
    if (testMode.isEnabled()) {
      console.warn('[CallVerification] WARNING: Test mode is enabled! Disabling for registration...')
      testMode.disable()
    }
    
    const initData = getInitData()
    // Use phone from props - ensure it's a string and not empty
    let phoneNumber = props.phone || ''
    
    // If phone is still empty, wait a bit for props to update (Vue reactivity)
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      console.warn('[CallVerification] Phone number is empty, waiting for props update...')
      await new Promise(resolve => setTimeout(resolve, 200))
      phoneNumber = props.phone || ''
      console.log('[CallVerification] Phone number after wait:', phoneNumber)
    }
    
    console.log('[CallVerification] Final values before API call:', {
      hasInitData: !!initData,
      initData: initData || '(empty)',
      initDataLength: initData ? initData.length : 0,
      phoneNumber: phoneNumber || '(empty)',
      phoneNumberTrimmed: phoneNumber.trim(),
      isRegistration: props.isRegistration,
      name: props.name || '(not provided)',
      testModeEnabled: testMode.isEnabled()
    })
    
    // Validate required data
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      console.error('[CallVerification] ERROR: Phone number is still empty!')
      console.error('[CallVerification] Props at error:', {
        phone: props.phone,
        name: props.name,
        isRegistration: props.isRegistration
      })
      hasInitialized.value = false // Allow retry
      throw new Error('Phone number is required')
    }
    
    // Validate initData is available
    if (!initData || initData.trim().length === 0) {
      console.warn('[CallVerification] WARNING: initData is empty. API may require valid Telegram initData.')
    }
    
    // Prepare request payload for logging
    const requestPayload = {
      initData: initData || '',
      phoneNumber: phoneNumber.trim()
    }
    console.log('[CallVerification] Request payload to be sent:', requestPayload)
    console.log('[CallVerification] Phone number value:', phoneNumber)
    console.log('[CallVerification] Phone number type:', typeof phoneNumber)
    console.log('[CallVerification] Phone number length:', phoneNumber?.length || 0)
    console.log('[CallVerification] Calling REAL API to get verification phone number...')
    console.log('[CallVerification] API URL: https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/api/v1/auth/call-check/init')
    
    // Ensure phoneNumber is a valid string
    const phoneToSend = phoneNumber?.trim() || ''
    if (!phoneToSend) {
      console.error('[CallVerification] CRITICAL: Phone number is empty before API call!')
      console.error('[CallVerification] props.phone:', props.phone)
      console.error('[CallVerification] phoneNumber variable:', phoneNumber)
      throw new Error('Phone number is required')
    }
    
    console.log('[CallVerification] Calling authApi.initCallCheck with:', {
      initData: initData ? initData.substring(0, 50) + '...' : '(empty)',
      phoneNumber: phoneToSend
    })
    
    const response = await authApi.initCallCheck(initData, phoneToSend)
    
    if (!response.prettyPhone || !response.rawPhone) {
      throw new Error('Invalid response: missing phone number')
    }
    
    verificationPhone.value = response.prettyPhone
    rawPhone.value = response.rawPhone
    hasInitialized.value = true // Mark as successfully initialized
    console.log('[CallVerification] Call check initialized successfully:', {
      prettyPhone: response.prettyPhone,
      rawPhone: response.rawPhone
    })
  } catch (err: any) {
    hasInitialized.value = false // Allow retry on error
    isInitializingInProgress.value = false // Reset guard on error
    console.error('[CallVerification] Error initializing call check:', err)
    console.error('[CallVerification] Error details:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    })
    
    let errorMessage = err?.message || 'Неизвестная ошибка'
    
    // Provide user-friendly error messages
    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
      errorMessage = 'Сервер временно недоступен. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
    } else if (errorMessage.includes('401') || errorMessage.includes('Invalid Telegram data')) {
      errorMessage = 'Ошибка авторизации. Убедитесь, что вы открыли приложение через Telegram.'
    } else if (errorMessage.includes('Phone number is required')) {
      errorMessage = 'Номер телефона не указан. Пожалуйста, вернитесь назад и введите номер.'
    } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch') || errorMessage.includes('CORS')) {
      // Check if it's a CORS error specifically
      if (errorMessage.includes('CORS')) {
        errorMessage = 'Ошибка подключения к серверу. Обратитесь в поддержку.'
      } else {
        errorMessage = 'Проблема с подключением к интернету. Проверьте соединение и попробуйте снова.'
      }
    }
    
    error.value = `Ошибка при получении номера для звонка: ${errorMessage}`
    // Keep default phone number on error - but don't show it if there's an error
  } finally {
    isInitializing.value = false
    isInitializingInProgress.value = false // Always reset guard in finally
  }
}

// Initialize call verification and get phone number
onMounted(async () => {
  console.log('[CallVerification] Component mounted')
  // Wait a bit for props to be set, then initialize
  // Only initialize if not already initialized (prevent duplicate calls)
  if (!hasInitialized.value && !isInitializingInProgress.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
    await initializeCallCheck()
  } else {
    console.log('[CallVerification] Already initialized or initialization in progress, skipping onMounted init')
  }
})

// Cleanup polling on unmount
onBeforeUnmount(() => {
  if (statusPollInterval.value) {
    clearInterval(statusPollInterval.value)
    statusPollInterval.value = null
  }
})

const handleCall = () => {
  // Открыть приложение для звонка
  window.location.href = `tel:${rawPhone.value}`
  
  // Отмечаем, что звонок был сделан
  hasCalled.value = true
  
  // Start polling for call status
  startStatusPolling()
}

const startStatusPolling = () => {
  // Clear any existing interval
  if (statusPollInterval.value) {
    clearInterval(statusPollInterval.value)
  }

  const initData = getInitData()
  if (!initData) {
    // Require Telegram initData for real API
    console.error('[CallVerification] No initData available - cannot verify call status')
    error.value = 'Ошибка авторизации. Убедитесь, что вы открыли приложение через Telegram.'
    return
  }

  // Poll every 4 seconds (between 3-5 seconds as recommended)
  statusPollInterval.value = window.setInterval(async () => {
    try {
      const response = await authApi.checkCallStatus(initData)
      
      if (response.status === 'OK' && response.token && response.user) {
        // Call verified successfully
        if (statusPollInterval.value) {
          clearInterval(statusPollInterval.value)
          statusPollInterval.value = null
        }

        // Convert API user to app User format
        const user: User = {
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
        }

        // Store token if needed
        if (response.token) {
          localStorage.setItem('auth_token', response.token)
        }

        props.onSuccess(user)
      } else if (response.status === 'FAILED') {
        // Call verification failed
        if (statusPollInterval.value) {
          clearInterval(statusPollInterval.value)
          statusPollInterval.value = null
        }
        error.value = 'Звонок не подтвержден. Попробуйте еще раз.'
        hasCalled.value = false
      }
      // If status is 'PENDING', continue polling
    } catch (err) {
      console.error('[CallVerification] Error checking call status:', err)
      // Continue polling on error, don't show error to user yet
    }
  }, 4000) // Poll every 4 seconds
}

const handleVerify = async () => {
  // This is now handled by status polling
  // But keep for manual verification if needed
  if (!hasCalled.value) {
    error.value = 'Сначала позвоните на указанный номер'
    return
  }
}
</script>

<template>
  <section class="call-verification-screen">
    <div class="call-verification-screen__container">
      <!-- Header -->
      <div class="call-verification-screen__header">
        <button
          type="button"
          class="call-verification-screen__back"
          @click="props.onBack"
          aria-label="Назад"
        >
          <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__back-icon">
            <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="#374151"/>
          </svg>
        </button>
        <h1 class="call-verification-screen__header-title">Подтверждение</h1>
        <div class="call-verification-screen__header-spacer"></div>
      </div>

      <!-- Progress Indicator -->
      <div class="call-verification-screen__progress">
        <div class="call-verification-screen__progress-step call-verification-screen__progress-step--completed">
          <div class="call-verification-screen__progress-circle call-verification-screen__progress-circle--completed">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 6L5.5 10.5L15 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="call-verification-screen__progress-label">Номер введен</span>
        </div>
        <div class="call-verification-screen__progress-step call-verification-screen__progress-step--active">
          <div class="call-verification-screen__progress-circle call-verification-screen__progress-circle--active">
            <span style="color: white; font-weight: 700; font-size: 14px;">2</span>
          </div>
          <span class="call-verification-screen__progress-label">Подтверждение</span>
        </div>
        <div class="call-verification-screen__progress-line call-verification-screen__progress-line--completed"></div>
      </div>

      <!-- Content -->
      <div class="call-verification-screen__content">
        <!-- Phone Icon -->
        <div class="call-verification-screen__icon-wrapper">
          <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__icon">
            <path d="M34.8047 1.89844C35.5781 2.10938 36.1406 2.74219 36.1406 3.51562C36.1406 21.5859 21.5156 36.1406 3.51562 36.1406C2.67188 36.1406 2.03906 35.6484 1.82812 34.875L0.140625 27.5625C0 26.7891 0.351562 25.9453 1.125 25.5938L9 22.2188C9.70312 21.9375 10.4766 22.1484 10.9688 22.7109L14.4844 27C19.9688 24.3984 24.3984 19.8984 26.9297 14.5547L22.6406 11.0391C22.0781 10.5469 21.8672 9.77344 22.1484 9.07031L25.5234 1.19531C25.875 0.421875 26.7188 0 27.4922 0.210938L34.8047 1.89844Z" fill="#2563EB"/>
          </svg>
        </div>

        <!-- Title and Description -->
        <div class="call-verification-screen__title-section">
          <h2 class="call-verification-screen__title">Позвоните на номер</h2>
          <p class="call-verification-screen__description">
            Для подтверждения номера телефона позвоните на указанный ниже номер
          </p>
        </div>

        <!-- Phone Number Block -->
        <div class="call-verification-screen__phone-block">
          <p class="call-verification-screen__phone-label">Позвоните на номер:</p>
          <p class="call-verification-screen__phone-number">{{ verificationPhone }}</p>
          <div class="call-verification-screen__phone-info">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__phone-info-icon">
              <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM8.5 4H7.5V5.5H8.5V4ZM8.5 6.5H7.5V11.5H8.5V6.5Z" fill="#2563EB"/>
            </svg>
            <span class="call-verification-screen__phone-info-text">Звонок бесплатный, даже из-за рубежа</span>
          </div>
        </div>

        <!-- How It Works -->
        <div class="call-verification-screen__how-it-works">
          <div class="call-verification-screen__how-it-works-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__how-it-works-icon">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM9 5H11V7H9V5ZM9 9H11V15H9V9Z" fill="#2563EB"/>
            </svg>
            <h3 class="call-verification-screen__how-it-works-title">Как это работает:</h3>
          </div>
          <ol class="call-verification-screen__how-it-works-steps">
            <li class="call-verification-screen__how-it-works-step">Нажмите на номер или наберите его вручную</li>
            <li class="call-verification-screen__how-it-works-step">Дождитесь соединения (1-2 гудка)</li>
            <li class="call-verification-screen__how-it-works-step">Звонок автоматически сбросится</li>
          </ol>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="call-verification-screen__error">
          {{ error }}
        </div>
      </div>

      <!-- Footer -->
      <div class="call-verification-screen__footer">
        <button
          v-if="!hasCalled"
          type="button"
          class="call-verification-screen__button call-verification-screen__button--primary"
          @click="handleCall"
          :disabled="isLoading"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__button-icon">
            <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="white"/>
          </svg>
          <span>Позвонить {{ verificationPhone }}</span>
        </button>
        <button
          v-else
          type="button"
          class="call-verification-screen__button call-verification-screen__button--primary"
          @click="handleVerify"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Подтверждение...' : 'Подтвердить' }}
        </button>
        <button
          type="button"
          class="call-verification-screen__button call-verification-screen__button--secondary"
          @click="props.onBack"
          :disabled="isLoading"
        >
          Назад
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.call-verification-screen {
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

.call-verification-screen__container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  position: relative;
}

.call-verification-screen__header {
  padding: 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.call-verification-screen__back {
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

.call-verification-screen__back-icon {
  width: 15px;
  height: 14px;
  display: block;
}

.call-verification-screen__header-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.call-verification-screen__header-spacer {
  width: 40px;
}

.call-verification-screen__progress {
  padding: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 30px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  position: relative;
}

.call-verification-screen__progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.call-verification-screen__progress-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
}

.call-verification-screen__progress-circle--completed {
  background: #22C55E;
}

.call-verification-screen__progress-circle--active {
  background: #2563EB;
}

.call-verification-screen__progress-line {
  position: absolute;
  height: 2px;
  background: #22C55E;
  top: calc(24px + 16px - 1px);
  left: calc(50% - 45px);
  width: 90px;
  z-index: 1;
}

.call-verification-screen__progress-line--completed {
  background: #22C55E;
}

.call-verification-screen__progress-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
}

.call-verification-screen__progress-step--completed .call-verification-screen__progress-label {
  color: #22C55E;
}

.call-verification-screen__progress-step--active .call-verification-screen__progress-label {
  color: #2563EB;
}

.call-verification-screen__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 24px;
  text-align: center;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.call-verification-screen__icon-wrapper {
  width: 96px;
  height: 96px;
  background: #DBEAFE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.call-verification-screen__icon {
  width: 30px;
  height: 30px;
  display: block;
}

.call-verification-screen__title-section {
  margin-bottom: 32px;
  width: 100%;
}

.call-verification-screen__title {
  margin: 0 0 12px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.call-verification-screen__description {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #4b5563;
}

.call-verification-screen__phone-block {
  width: 100%;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
  margin-bottom: 24px;
}

.call-verification-screen__phone-label {
  margin: 0 0 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  color: #6B7280;
}

.call-verification-screen__phone-number {
  margin: 0 0 12px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.5;
  text-align: left;
  color: #1f2937;
}

.call-verification-screen__phone-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.call-verification-screen__phone-info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.call-verification-screen__phone-info-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #2563EB;
  text-align: left;
}

.call-verification-screen__how-it-works {
  width: 100%;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
  text-align: left;
}

.call-verification-screen__how-it-works-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.call-verification-screen__how-it-works-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.call-verification-screen__how-it-works-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
}

.call-verification-screen__how-it-works-steps {
  margin: 0;
  padding-left: 28px;
  list-style: decimal;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.call-verification-screen__how-it-works-step {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
}

.call-verification-screen__error {
  width: 100%;
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-family: Inter, sans-serif;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
}

.call-verification-screen__footer {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  flex-shrink: 0;
}

.call-verification-screen__button {
  width: 100%;
  height: 56px;
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
  gap: 8px;
}

.call-verification-screen__button--primary {
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  color: #ffffff;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.call-verification-screen__button--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.call-verification-screen__button--secondary {
  background: #F3F4F6;
  color: #374151;
}

.call-verification-screen__button--secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.call-verification-screen__button-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.call-verification-screen__button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Mobile styles */
@media (max-width: 480px) {
  .call-verification-screen__container {
    max-width: 100%;
    border-radius: 0;
  }

  .call-verification-screen__progress {
    padding: 24px 16px;
    gap: 20px;
  }

  .call-verification-screen__progress-step {
    min-width: 0;
    flex: 0 1 auto;
  }

  .call-verification-screen__progress-circle {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }

  .call-verification-screen__progress-label {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
  }

  .call-verification-screen__progress-line {
    left: calc(50% - 10px);
    width: 20px;
  }
}

/* Small mobile styles */
@media (max-width: 360px) {
  .call-verification-screen__progress {
    gap: 10px;
    padding: 24px 12px;
  }

  .call-verification-screen__progress-circle {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .call-verification-screen__progress-label {
    font-size: 10px;
    max-width: 60px;
  }

  .call-verification-screen__progress-line {
    left: calc(50% - 5px);
    width: 20px;
  }
}
</style>

