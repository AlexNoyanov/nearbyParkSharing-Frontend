<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '../services/authApi'
import { testMode } from '../services/testMode'
import { mockUsers, type User } from '../services/mockAuth'
import backIconSvg from '../assets/icons/icon-back.svg?raw'

const props = defineProps<{
  onBack: () => void
  onLogin: (phone: string) => void
  onRegister: () => void
  onCallVerification?: (phone: string) => void
  onAuthSuccess?: (user: User) => void
}>()

const phone = ref('')
const isLoading = ref(false)
const error = ref('')

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

// Get Telegram initData - with fallback for dev mode
const getInitData = (): string => {
  // Primary: Get from Telegram WebApp
  if (window.Telegram?.WebApp?.initData) {
    const initData = window.Telegram.WebApp.initData
    if (initData && initData.trim().length > 0) {
      return initData
    }
  }
  
  // Fallback: Use dev fallback only in dev mode
  if (import.meta.env.DEV) {
    console.warn('[LoginScreen] DEV MODE: Using fallback initData for local testing')
    return 'auth_date=1768317980&query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A111222333%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22Alexander%22%2C%22language_code%22%3A%22en%22%7D&hash=77794dcb2dd54b35f40010f1dcede46444340c01530bfd17849802cd6295c527'
  }
  
  return ''
}

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Test mode: use mock users for login
    if (testMode.isEnabled()) {
      console.log('[LoginScreen] Test mode: Using mock authentication')
      
      const phoneDigits = phone.value.replace(/\D/g, '')
      const phoneToCheck = phoneDigits ? `+${phoneDigits}` : ''
      
      if (!phoneToCheck || phoneToCheck.length < 12) {
        error.value = 'Введите номер телефона'
        isLoading.value = false
        return
      }
      
      // Find user by phone number
      const mockUser = mockUsers.find(user => user.phone === phoneToCheck)
      
      // In test mode, always login directly without call verification
      if (mockUser) {
        // User found - login directly
        console.log('[LoginScreen] Test mode: Found mock user:', mockUser)
        if (props.onAuthSuccess) {
          props.onAuthSuccess(mockUser)
          isLoading.value = false
          return
        }
      } else {
        // User not found - create a temporary test user and login
        console.log('[LoginScreen] Test mode: User not found, creating temporary test user')
        const tempUser: User = {
          id: String(mockUsers.length + 1),
          name: 'Test User',
          phone: phoneToCheck,
        }
        if (props.onAuthSuccess) {
          props.onAuthSuccess(tempUser)
          isLoading.value = false
          return
        }
      }
      
      // Fallback: should not reach here if onAuthSuccess is provided
      error.value = 'Ошибка авторизации. Проверьте настройки.'
      isLoading.value = false
      return
    }

    // Production mode: Always use login API method
    console.log('[LoginScreen] ===== LOGIN REQUEST =====')
    const initData = getInitData()
    
    if (!initData || initData.trim().length === 0) {
      error.value = 'Ошибка: не удалось получить данные авторизации. Убедитесь, что приложение открыто через Telegram.'
      isLoading.value = false
      return
    }

    console.log('[LoginScreen] Calling authApi.login() with initData')
    console.log('[LoginScreen] InitData length:', initData.length)
    
    // Call login API method
    const loginResponse = await authApi.login(initData)
    
    console.log('[LoginScreen] Login response received:', loginResponse)
    console.log('[LoginScreen] Response status:', loginResponse.status)
    
    if (loginResponse.status === 'OK' && loginResponse.token) {
      // Login successful - user is authenticated
      console.log('[LoginScreen] ✓ Login successful, status: OK')
      console.log('[LoginScreen] Token received:', loginResponse.token ? 'yes' : 'no')
      console.log('[LoginScreen] User data from API:', loginResponse.user)
      
      // Save token to localStorage
      if (loginResponse.token) {
        localStorage.setItem('auth_token', loginResponse.token)
        console.log('[LoginScreen] Token saved to localStorage')
      }

      // Create user object - use API user if available, otherwise create from available data
      let user: User
      
      if (loginResponse.user) {
        // Use user data from API response
        user = {
          id: String(loginResponse.user.id),
          name: loginResponse.user.name,
          phone: loginResponse.user.phone,
        }
        console.log('[LoginScreen] Using user data from API response:', user)
      } else {
        // User data not in response - try to extract from initData or use phone from input
        console.log('[LoginScreen] User data not in API response, creating from available data')
        
        // Try to get user info from Telegram initData
        let userId = 'unknown'
        let userName = 'User'
        let userPhone = ''
        
        try {
          if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user
            userId = String(tgUser.id || 'unknown')
            userName = tgUser.first_name || tgUser.username || 'User'
            console.log('[LoginScreen] Extracted user data from Telegram:', { userId, userName })
          }
        } catch (e) {
          console.warn('[LoginScreen] Could not extract user from Telegram initData:', e)
        }
        
        // Use phone from input field if available
        const phoneDigits = phone.value.replace(/\D/g, '')
        if (phoneDigits && phoneDigits.length >= 10) {
          userPhone = phoneDigits.startsWith('7') ? `+${phoneDigits}` : `+7${phoneDigits}`
        }
        
        // Create user object with available data
        user = {
          id: userId,
          name: userName,
          phone: userPhone || loginResponse.user?.phone || '',
        }
        
        console.log('[LoginScreen] Created user object from available data:', user)
      }

      // Call success callback
      if (props.onAuthSuccess) {
        console.log('[LoginScreen] Calling onAuthSuccess with user:', user)
        props.onAuthSuccess(user)
      } else {
        // Fallback: navigate to home or call verification
        if (props.onCallVerification && user.phone) {
          props.onCallVerification(user.phone)
        } else if (user.phone) {
          props.onLogin(user.phone)
        } else {
          // No phone available - just proceed with auth success
          console.log('[LoginScreen] No phone available, proceeding with auth success')
          // Token is saved, user can continue
        }
      }
    } else if (loginResponse.status === 'NEED_PHONE') {
      // Phone verification needed - navigate to call verification
      console.log('[LoginScreen] Phone verification needed (NEED_PHONE)')
      
      // Get phone number from input field
      const phoneDigits = phone.value.replace(/\D/g, '')
      const phoneToUse = phoneDigits && phoneDigits.length >= 10
        ? (phoneDigits.startsWith('7') ? `+${phoneDigits}` : `+7${phoneDigits}`)
        : ''
      
      console.log('[LoginScreen] Phone from input:', phoneToUse)
      
      if (!phoneToUse || phoneToUse.length < 12) {
        error.value = 'Введите номер телефона для подтверждения'
        isLoading.value = false
        return
      }
      
      // Navigate to call verification
      if (props.onCallVerification) {
        console.log('[LoginScreen] Navigating to call verification with phone:', phoneToUse)
        props.onCallVerification(phoneToUse)
      } else {
        // Fallback to code verification if call verification not available
        props.onLogin(phoneToUse)
      }
    } else {
      console.error('[LoginScreen] Unexpected login response status:', loginResponse.status)
      error.value = 'Ошибка при входе. Попробуйте еще раз.'
    }
  } catch (err: any) {
    console.error('[LoginScreen] Login error:', err)
    console.error('[LoginScreen] Error details:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    })
    
    // Provide user-friendly error message
    const errorMessage = err?.message || 'Ошибка при входе'
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
      error.value = 'Ошибка подключения к серверу. Проверьте интернет-соединение.'
    } else if (errorMessage.includes('HTTP error')) {
      error.value = 'Ошибка сервера. Попробуйте позже.'
    } else {
      error.value = errorMessage.length > 100 ? 'Ошибка при входе. Попробуйте еще раз.' : errorMessage
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="login-screen">
    <div class="login-screen__container">
      <div class="login-screen__header">
        <button type="button" class="login-screen__back" @click="props.onBack" aria-label="Назад">
          <span v-html="backIconSvg" class="login-screen__back-icon"></span>
        </button>
        <div class="login-screen__badge">
          <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="login-screen__badge-icon">
            <path d="M24.375 29H19.4531C19.043 29 18.75 28.707 18.75 28.2969V25.9531C18.75 25.6016 19.043 25.25 19.4531 25.25H24.375C25.3711 25.25 26.25 24.4297 26.25 23.375V12.125C26.25 11.1289 25.3711 10.25 24.375 10.25H19.4531C19.043 10.25 18.75 9.95703 18.75 9.54688V7.20312C18.75 6.85156 19.043 6.5 19.4531 6.5H24.375C27.4805 6.5 30 9.01953 30 12.125V23.375C30 26.4805 27.4805 29 24.375 29ZM21.6211 17.2227C22.1484 17.8086 22.1484 18.6875 21.6211 19.2148L11.7773 29.0586C10.8984 29.9375 9.375 29.3516 9.375 28.0625V22.4375H1.40625C0.585938 22.4375 0 21.8516 0 21.0312V15.4062C0 14.6445 0.585938 14 1.40625 14H9.375V8.375C9.375 7.14453 10.8984 6.5 11.7773 7.37891L21.6211 17.2227Z" fill="white"/>
          </svg>
        </div>
        <h1 class="login-screen__title">Добро пожаловать!</h1>
        <p class="login-screen__subtitle">Войдите в свой аккаунт ParkShare</p>
      </div>

      <div class="login-screen__content">
        <div class="login-screen__form">
          <div class="login-screen__field login-screen__field--phone">
            <label class="login-screen__label">Номер телефона</label>
            <div class="login-screen__input-wrapper">
              <input
                v-model="phone"
                type="tel"
                class="login-screen__input"
                placeholder="+7 (999) 123-45-67"
                @input="handlePhoneInput"
                :disabled="isLoading"
              />
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="login-screen__input-icon">
                <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="#9CA3AF"/>
              </svg>
            </div>
          </div>

          <div v-if="error" class="login-screen__error">
            {{ error }}
          </div>
        </div>

      </div>

      <div class="login-screen__footer">
        <button
          type="button"
          class="login-screen__button login-screen__button--primary"
          @click="handleSubmit"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
        <div class="login-screen__footer-link">
          <p class="login-screen__footer-text">
            Нет аккаунта?
            <button
              type="button"
              class="login-screen__footer-link-button"
              @click="props.onRegister"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 0;
}

.login-screen__container {
  width: 100%;
  max-width: 281px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.login-screen__header {
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

.login-screen__back {
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

.login-screen__back-icon {
  width: 15px;
  height: 14px;
  display: block;
}

.login-screen__back-icon :deep(svg) {
  width: 15px;
  height: 14px;
  display: block;
}

.login-screen__badge {
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

.login-screen__badge-icon {
  width: 30px;
  height: 36px;
  display: block;
  flex-shrink: 0;
}

.login-screen__title {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  text-align: center;
  color: #ffffff;
}

.login-screen__subtitle {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
}

.login-screen__content {
  padding: 21px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
  justify-content: center;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.login-screen__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-screen__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.login-screen__label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #374151;
  margin-bottom: 0;
}

.login-screen__input-wrapper {
  position: relative;
  margin-top: 0;
}

.login-screen__input {
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

.login-screen__input::placeholder {
  color: #9CA3AF;
}

.login-screen__input:focus {
  outline: none;
  border-color: #2563EB;
  color: #374151;
}

.login-screen__input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  display: block;
}

.login-screen__field--phone {
  height: auto;
  margin-top: 24px;
}

.login-screen__hint {
  margin: 0;
  margin-top: 8px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
  text-align: center;
}

.login-screen__error {
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-family: Inter, sans-serif;
  font-size: 14px;
  text-align: center;
}

.login-screen__info {
  margin-top: 0;
  padding: 16px 20px;
  background: #EFF6FF;
  border: 1px solid #DBEAFE;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  position: relative;
}

.login-screen__info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  align-self: center;
}

.login-screen__info-icon svg {
  width: 16px;
  height: 16px;
  display: block;
}

.login-screen__info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.login-screen__info-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  color: #1E40AF;
  text-align: center;
}

.login-screen__info-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #2563EB;
  text-align: center;
}

.login-screen__footer {
  padding: 18px 18px 48px;
  display: flex;
  flex-direction: column;
  gap: 9.5px;
  background: #ffffff;
  flex-shrink: 0;
}

.login-screen__footer-link {
  text-align: center;
}

.login-screen__footer-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
}

.login-screen__footer-link-button {
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

.login-screen__footer-link-button:hover {
  text-decoration: underline;
}

.login-screen__button {
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

.login-screen__button--primary {
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  color: #ffffff;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.login-screen__button--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-screen__button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Mobile styles (480px and below) - These styles are preserved and not affected by tablet/desktop styles */
@media (max-width: 480px) {
  .login-screen__container {
    max-width: 100%;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .login-screen {
    padding: 0;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .login-screen__container {
    max-width: 100%;
    border-radius: 0;
  }

  .login-screen__header {
    padding: 100px 64px 40px;
  }

  .login-screen__badge {
    width: 120px;
    height: 120px;
  }

  .login-screen__badge-icon {
    width: 40px;
    height: 48px;
  }

  .login-screen__title {
    font-size: 32px;
  }

  .login-screen__subtitle {
    font-size: 18px;
  }

  .login-screen__content {
    padding: 48px 64px 48px;
  }

  .login-screen__form-group {
    gap: 28px;
  }

  .login-screen__label {
    font-size: 18px;
  }

  .login-screen__input {
    padding: 20px 20px 20px 56px;
    font-size: 18px;
  }

  .login-screen__input-icon {
    width: 20px;
    height: 20px;
    left: 20px;
  }

  .login-screen__hint {
    font-size: 16px;
  }

  .login-screen__info {
    padding: 20px 24px;
  }

  .login-screen__info-title {
    font-size: 20px;
  }

  .login-screen__info-text {
    font-size: 18px;
  }

  .login-screen__footer {
    padding: 32px 64px;
  }

  .login-screen__button {
    font-size: 18px;
    height: 56px;
  }

  .login-screen__footer-text {
    font-size: 16px;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .login-screen__header {
    padding: 120px 80px 48px;
  }

  .login-screen__badge {
    width: 140px;
    height: 140px;
  }

  .login-screen__badge-icon {
    width: 46px;
    height: 56px;
  }

  .login-screen__title {
    font-size: 36px;
  }

  .login-screen__subtitle {
    font-size: 20px;
  }

  .login-screen__content {
    padding: 56px 80px 56px;
  }

  .login-screen__form-group {
    gap: 32px;
  }

  .login-screen__label {
    font-size: 20px;
  }

  .login-screen__input {
    padding: 22px 24px 22px 64px;
    font-size: 20px;
  }

  .login-screen__input-icon {
    width: 22px;
    height: 22px;
    left: 24px;
  }

  .login-screen__hint {
    font-size: 18px;
  }

  .login-screen__info {
    padding: 24px 28px;
  }

  .login-screen__info-title {
    font-size: 22px;
  }

  .login-screen__info-text {
    font-size: 20px;
  }

  .login-screen__footer {
    padding: 40px 80px;
  }

  .login-screen__button {
    font-size: 20px;
    height: 60px;
  }

  .login-screen__footer-text {
    font-size: 18px;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .login-screen__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .login-screen__header {
    padding: 80px 48px 40px;
  }

  .login-screen__badge {
    width: 120px;
    height: 120px;
  }

  .login-screen__badge-icon {
    width: 40px;
    height: 48px;
  }

  .login-screen__title {
    font-size: 28px;
  }

  .login-screen__subtitle {
    font-size: 16px;
  }

  .login-screen__content {
    padding: 32px 48px 32px;
  }

  .login-screen__form-group {
    gap: 24px;
  }

  .login-screen__label {
    font-size: 16px;
  }

  .login-screen__input {
    padding: 18px 16px 18px 48px;
    font-size: 16px;
  }

  .login-screen__input-icon {
    width: 18px;
    height: 18px;
    left: 16px;
  }

  .login-screen__hint {
    font-size: 14px;
  }

  .login-screen__info {
    padding: 16px 20px;
  }

  .login-screen__info-title {
    font-size: 18px;
  }

  .login-screen__info-text {
    font-size: 16px;
  }

  .login-screen__footer {
    padding: 24px 48px;
  }

  .login-screen__button {
    font-size: 16px;
    height: 51px;
  }

  .login-screen__footer-text {
    font-size: 14px;
  }
}
</style>

