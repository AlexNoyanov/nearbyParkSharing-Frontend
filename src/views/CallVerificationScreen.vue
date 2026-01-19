<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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

// Computed property for tel: URL - works better in Telegram WebView than programmatic calls
const telUrl = computed(() => {
  if (!rawPhone.value || !rawPhone.value.trim()) {
    return ''
  }
  
  let phoneForCall = String(rawPhone.value).trim()
  
  // Format phone number for tel: protocol - must start with +
  if (!phoneForCall.startsWith('+')) {
    if (phoneForCall.startsWith('7') && phoneForCall.length === 11) {
      phoneForCall = '+' + phoneForCall
    } else {
      phoneForCall = '+' + phoneForCall
    }
  }
  
  // Clean phone number (only digits and + at start)
  const cleanPhone = phoneForCall.replace(/[^\d+]/g, '')
  if (cleanPhone !== phoneForCall) {
    phoneForCall = cleanPhone
  }
  
  return `tel:${phoneForCall}`
})

// Watch for props changes in case they're set after mount (but not immediate to avoid duplicate calls)
watch(() => props.phone, (newPhone, oldPhone) => {
  // Only trigger if phone actually changed (not on initial mount) and hasn't been initialized yet
  // Also check that we're not already in the mounting phase
  if (newPhone && newPhone !== oldPhone && oldPhone !== undefined && !hasInitialized.value && !isInitializingInProgress.value) {
    console.log('[CallVerification] Phone prop changed after mount, initializing...')
    initializeCallCheck()
  }
}, { flush: 'post' }) // Use 'post' flush to ensure this runs after onMounted

// Wait for Telegram WebApp to be ready and return initData
// Returns initData or throws error if not available
// According to: https://docs.telegram-mini-apps.com/platform/init-data
const waitForTelegramInitData = async (maxWaitMs: number = 5000): Promise<string> => {
  console.log('[CallVerification] waitForTelegramInitData: Starting...')
  console.log('[CallVerification] window.Telegram exists?', !!window.Telegram)
  console.log('[CallVerification] window.Telegram.WebApp exists?', !!window.Telegram?.WebApp)
  
  // First, ensure Telegram WebApp is initialized and ready
  if (window.Telegram?.WebApp) {
    console.log('[CallVerification] Calling Telegram.WebApp.ready()...')
    try {
      window.Telegram.WebApp.ready()
      console.log('[CallVerification] Telegram.WebApp.ready() called successfully')
    } catch (e) {
      console.warn('[CallVerification] Error calling ready():', e)
    }
    
    // Log all available properties
    console.log('[CallVerification] Telegram.WebApp properties:', Object.keys(window.Telegram.WebApp))
    console.log('[CallVerification] Telegram.WebApp.initData exists?', 'initData' in window.Telegram.WebApp)
    console.log('[CallVerification] Telegram.WebApp.initData value:', window.Telegram.WebApp.initData || '(empty)')
    console.log('[CallVerification] Telegram.WebApp.initData type:', typeof window.Telegram.WebApp.initData)
    console.log('[CallVerification] Telegram.WebApp.initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe)
  } else {
    console.warn('[CallVerification] window.Telegram.WebApp is NOT available!')
    console.warn('[CallVerification] This means the app is NOT running inside Telegram Mini App')
  }
  
  // Try to get initData immediately
  if (window.Telegram?.WebApp?.initData) {
    const initData = window.Telegram.WebApp.initData
    console.log('[CallVerification] Found initData immediately:', initData ? `length=${initData.length}` : '(empty)')
    if (initData && typeof initData === 'string' && initData.trim().length > 0) {
      console.log('[CallVerification] ✓ Returning initData immediately')
      return initData
    }
  }
  
  // If not available, wait a bit (Telegram might still be initializing)
  console.log('[CallVerification] initData not available immediately, waiting up to', maxWaitMs, 'ms...')
  const startTime = Date.now()
  let checkCount = 0
  while (Date.now() - startTime < maxWaitMs) {
    checkCount++
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (window.Telegram?.WebApp?.initData) {
      const initData = window.Telegram.WebApp.initData
      if (initData && typeof initData === 'string' && initData.trim().length > 0) {
        console.log('[CallVerification] ✓ Got initData after', checkCount * 200, 'ms')
        return initData
      }
    }
    
    // Log progress every second
    if (checkCount % 5 === 0) {
      console.log('[CallVerification] Still waiting for initData...', checkCount * 200, 'ms elapsed')
      console.log('[CallVerification] window.Telegram.WebApp.initData:', window.Telegram?.WebApp?.initData || '(still empty)')
    }
  }
  
  console.error('[CallVerification] ✗ initData not available after', maxWaitMs, 'ms')
  console.error('[CallVerification] Final check - window.Telegram.WebApp.initData:', window.Telegram?.WebApp?.initData || '(empty)')
  throw new Error('Telegram initData is not available. Make sure the app is opened through Telegram Mini App (not via direct URL).')
}

// Get Telegram initData from Telegram Mini App
// Format: "auth_date=1768317980&query_id=...&user=...&hash=..."
// According to Telegram Mini Apps documentation: https://docs.telegram-mini-apps.com/platform/init-data
const getInitData = (): string => {
  console.log('[CallVerification] getInitData() called')
  console.log('[CallVerification] Checking window.Telegram.WebApp.initData...')
  
  // Primary method: Get from window.Telegram.WebApp.initData
  // This is the official way according to Telegram Mini Apps docs
  if (window.Telegram?.WebApp) {
    // Ensure WebApp is ready
    try {
      window.Telegram.WebApp.ready()
    } catch (e) {
      console.warn('[CallVerification] Error calling ready() in getInitData:', e)
    }
    
    if (window.Telegram.WebApp.initData) {
      const initData = window.Telegram.WebApp.initData
      console.log('[CallVerification] ✓ Got initData from window.Telegram.WebApp.initData')
      console.log('[CallVerification] initData type:', typeof initData)
      console.log('[CallVerification] initData length:', initData ? initData.length : 0)
      console.log('[CallVerification] initData is string?', typeof initData === 'string')
      console.log('[CallVerification] initData is empty?', !initData || (typeof initData === 'string' && initData.trim().length === 0))
      
      if (initData && typeof initData === 'string' && initData.trim().length > 0) {
        console.log('[CallVerification] initData full value:', initData)
        // Verify it's in the expected format (query string with auth_date, hash, etc.)
        if (initData.includes('auth_date=') && initData.includes('hash=')) {
          console.log('[CallVerification] ✓ initData format is valid (contains auth_date and hash)')
          // Try to parse and log the auth_date
          try {
            const params = new URLSearchParams(initData)
            const authDate = params.get('auth_date')
            const hash = params.get('hash')
            const user = params.get('user')
            if (authDate) {
              console.log('[CallVerification] ✓ Found auth_date in initData:', authDate)
            }
            if (hash) {
              console.log('[CallVerification] ✓ Found hash in initData:', hash.substring(0, 20) + '...')
            }
            if (user) {
              console.log('[CallVerification] ✓ Found user in initData:', user)
            }
          } catch (e) {
            console.warn('[CallVerification] Could not parse initData as URLSearchParams:', e)
          }
        } else {
          console.warn('[CallVerification] ⚠ initData format may be invalid (missing expected parameters)')
          console.warn('[CallVerification] initData contains auth_date?', initData.includes('auth_date='))
          console.warn('[CallVerification] initData contains hash?', initData.includes('hash='))
        }
        return initData
      } else {
        console.warn('[CallVerification] initData exists but is empty or not a string')
      }
    } else {
      console.warn('[CallVerification] window.Telegram.WebApp.initData is falsy')
    }
  } else {
    console.warn('[CallVerification] window.Telegram.WebApp is not available')
  }
  
  // Fallback: Try to get from URL parameter tgWebAppData
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const tgWebAppData = urlParams.get('tgWebAppData')
    if (tgWebAppData) {
      console.log('[CallVerification] Got initData from URL parameter tgWebAppData')
      console.log('[CallVerification] initData length:', tgWebAppData.length)
      return tgWebAppData
    }
  } catch (error) {
    console.error('[CallVerification] Error extracting initData from URL:', error)
  }
  
  // Also check hash fragment
  try {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const tgWebAppData = hashParams.get('tgWebAppData')
    if (tgWebAppData) {
      console.log('[CallVerification] Got initData from hash parameter tgWebAppData')
      return tgWebAppData
    }
  } catch (error) {
    console.error('[CallVerification] Error extracting initData from hash:', error)
  }
  
  // Debug: Log what's available in Telegram WebApp
  if (window.Telegram?.WebApp) {
    console.warn('[CallVerification] Telegram.WebApp is available but initData is missing')
    console.log('[CallVerification] Available WebApp properties:', Object.keys(window.Telegram.WebApp))
    console.log('[CallVerification] initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe)
    if (window.Telegram.WebApp.initDataUnsafe) {
      console.log('[CallVerification] initDataUnsafe.user:', window.Telegram.WebApp.initDataUnsafe.user)
    }
  } else {
    console.warn('[CallVerification] window.Telegram.WebApp is not available')
    console.log('[CallVerification] window.Telegram:', window.Telegram)
  }
  
  // Dev-only fallback (allows local debugging without Telegram Mini App)
  if (import.meta.env.DEV) {
    const testInitData =
      'auth_date=1768317980&query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A111222333%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22Alexander%22%2C%22language_code%22%3A%22en%22%7D&hash=77794dcb2dd54b35f40010f1dcede46444340c01530bfd17849802cd6295c527'
    console.warn('[CallVerification] DEV: Using test initData (Telegram WebApp not available)')
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
  
  // Request info for error diagnostics (declared here to be accessible in catch)
  let requestInfo: any = null
  
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
    
    // Wait for Telegram WebApp to be ready and get initData
    console.log('[CallVerification] ===== STEP 1: Getting initData =====')
    console.log('[CallVerification] window.Telegram exists?', !!window.Telegram)
    console.log('[CallVerification] window.Telegram.WebApp exists?', !!window.Telegram?.WebApp)
    console.log('[CallVerification] window.Telegram.WebApp.initData exists?', !!window.Telegram?.WebApp?.initData)
    console.log('[CallVerification] window.Telegram.WebApp.initData value:', window.Telegram?.WebApp?.initData || '(empty)')
    console.log('[CallVerification] window.location.href:', window.location.href)
    console.log('[CallVerification] window.location.origin:', window.location.origin)
    console.log('[CallVerification] window.location.search:', window.location.search)
    console.log('[CallVerification] window.location.hash:', window.location.hash)
    
    let initData: string
    try {
      console.log('[CallVerification] Calling waitForTelegramInitData with 3s timeout...')
      initData = await waitForTelegramInitData(3000) // Wait up to 3 seconds
      console.log('[CallVerification] ✓ Successfully got initData after wait')
      console.log('[CallVerification] initData type:', typeof initData)
      console.log('[CallVerification] initData length:', initData ? initData.length : 0)
      console.log('[CallVerification] initData is empty?', !initData || initData.trim().length === 0)
      if (initData) {
        console.log('[CallVerification] initData full value:', initData)
        console.log('[CallVerification] initData preview (first 200 chars):', initData.substring(0, 200))
      }
    } catch (err: any) {
      console.error('[CallVerification] waitForTelegramInitData threw error:', err)
      console.error('[CallVerification] Error details:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack
      })
      // If wait fails, try immediate get as fallback
      console.warn('[CallVerification] waitForTelegramInitData failed, trying immediate getInitData() as fallback')
      initData = getInitData()
      console.log('[CallVerification] getInitData() returned:', initData ? `length=${initData.length}` : '(empty)')
      if (!initData || initData.trim().length === 0) {
        const errorMsg = 'initData is not available. Please open the app through Telegram Mini App.'
        console.error('[CallVerification] initData is still empty after fallback!')
        throw new Error(errorMsg)
      }
    }
    
    console.log('[CallVerification] ===== STEP 1 COMPLETE =====')
    console.log('[CallVerification] Final initData:', initData ? `length=${initData.length}, preview=${initData.substring(0, 100)}...` : '(EMPTY!)')
    
    // Use phone from props - ensure it's a string and not empty
    let phoneNumber = props.phone || ''
    
    // If phone is still empty, wait a bit for props to update (Vue reactivity)
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      console.warn('[CallVerification] Phone number is empty, waiting for props update...')
      await new Promise(resolve => setTimeout(resolve, 200))
      phoneNumber = props.phone || ''
      console.log('[CallVerification] Phone number after wait:', phoneNumber)
    }
    
    console.log('[CallVerification] ===== STEP 2: Preparing data for API call =====')
    console.log('[CallVerification] Props received:', {
      phone: props.phone,
      name: props.name,
      isRegistration: props.isRegistration,
      phoneType: typeof props.phone,
      phoneLength: props.phone?.length || 0,
      nameType: typeof props.name,
      nameLength: props.name?.length || 0
    })
    console.log('[CallVerification] Phone processing:', {
      originalPhone: phoneNumber,
      phoneType: typeof phoneNumber,
      phoneLength: phoneNumber?.length || 0,
      phoneIsEmpty: !phoneNumber || phoneNumber.trim().length === 0,
      phoneTrimmed: phoneNumber?.trim() || '(empty)'
    })
    console.log('[CallVerification] InitData status:', {
      hasInitData: !!initData,
      initDataType: typeof initData,
      initDataLength: initData ? initData.length : 0,
      initDataIsEmpty: !initData || initData.trim().length === 0,
      initDataPreview: initData ? initData.substring(0, 100) + '...' : '(empty)'
    })
    console.log('[CallVerification] Name status:', {
      name: props.name,
      nameType: typeof props.name,
      nameLength: props.name?.length || 0,
      nameIsEmpty: !props.name || props.name.trim().length === 0,
      nameTrimmed: props.name?.trim() || '(empty)'
    })
    console.log('[CallVerification] Final values before API call:', {
      hasInitData: !!initData,
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
    
    console.log('[CallVerification] ===== STEP 3: Calling API =====')
    console.log('[CallVerification] About to call authApi.initCallCheck')
    console.log('[CallVerification] Parameters:', {
      initDataLength: initData ? initData.length : 0,
      initDataPreview: initData ? initData.substring(0, 100) + '...' : '(empty)',
      initDataFull: initData || '(empty)',
      phoneNumber: phoneToSend,
      phoneNumberLength: phoneToSend?.length || 0,
      phoneNumberType: typeof phoneToSend,
      name: props.name,
      nameLength: props.name?.length || 0,
      nameType: typeof props.name
    })
    const API_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/api/v1/auth/call-check/init'
    console.log('[CallVerification] API will be called at:', API_URL)
    console.log('[CallVerification] Current environment:', import.meta.env.MODE)
    console.log('[CallVerification] Is DEV mode?', import.meta.env.DEV)
    console.log('[CallVerification] Making API call now...')
    
    // Save request info for error diagnostics
    requestInfo = {
      url: API_URL,
      method: 'POST',
      initDataLength: initData ? initData.length : 0,
      initDataPreview: initData ? initData.substring(0, 50) + '...' : '(empty)',
      phoneNumber: phoneToSend,
      phoneNumberLength: phoneToSend?.length || 0,
      name: props.name || '(not provided)',
      nameLength: props.name?.length || 0
    }
    
    const response = await authApi.initCallCheck(initData, phoneToSend, props.name)
    
    console.log('[CallVerification] ===== STEP 4: API call completed =====')
    console.log('[CallVerification] Response received:', response)
    console.log('[CallVerification] Response type:', typeof response)
    console.log('[CallVerification] Response keys:', response ? Object.keys(response) : 'null/undefined')
    console.log('[CallVerification] Response.prettyPhone:', response?.prettyPhone)
    console.log('[CallVerification] Response.rawPhone:', response?.rawPhone)
    console.log('[CallVerification] Response.callToNumber:', response?.callToNumber)
    
    // КРИТИЧЕСКИ ВАЖНО: Номер для звонка ДОЛЖЕН браться ТОЛЬКО из ответа бэкенда
    // Приоритет: rawPhone > callToNumber (оба из ответа API)
    let phoneToCall: string | null = null
    let phoneToDisplay: string | null = null
    
    // Сначала пытаемся получить rawPhone (основной номер для звонка)
    if (response.rawPhone && String(response.rawPhone).trim()) {
      phoneToCall = String(response.rawPhone).trim()
      console.log('[CallVerification] ✓ Using rawPhone from API response:', phoneToCall)
    } else if (response.callToNumber && String(response.callToNumber).trim()) {
      // Если rawPhone нет, используем callToNumber из ответа
      phoneToCall = String(response.callToNumber).trim()
      console.log('[CallVerification] ✓ Using callToNumber from API response:', phoneToCall)
    }
    
    // Получаем номер для отображения
    if (response.prettyPhone && String(response.prettyPhone).trim()) {
      phoneToDisplay = String(response.prettyPhone).trim()
    } else if (phoneToCall) {
      // Если prettyPhone нет, используем phoneToCall для отображения
      phoneToDisplay = phoneToCall
    }
    
    console.log('[CallVerification] ===== PROCESSING API RESPONSE =====')
    console.log('[CallVerification] Response object:', response)
    console.log('[CallVerification] - response.prettyPhone:', response.prettyPhone)
    console.log('[CallVerification] - response.rawPhone:', response.rawPhone)
    console.log('[CallVerification] - response.callToNumber:', response.callToNumber)
    console.log('[CallVerification] - Extracted phoneToCall (for tel:):', phoneToCall)
    console.log('[CallVerification] - Extracted phoneToDisplay (for UI):', phoneToDisplay)
    
    // КРИТИЧЕСКАЯ ПРОВЕРКА: номер для звонка ОБЯЗАТЕЛЬНО должен быть из ответа бэкенда
    if (!phoneToCall || phoneToCall.length === 0) {
      console.error('[CallVerification] ✗ ERROR: Phone number for call is missing in API response!')
      console.error('[CallVerification] Response object:', JSON.stringify(response, null, 2))
      throw new Error('Invalid response: missing phone number (rawPhone or callToNumber) in API response')
    }
    
    if (!phoneToDisplay || phoneToDisplay.length === 0) {
      console.error('[CallVerification] ✗ ERROR: Phone number for display is missing in API response!')
      console.error('[CallVerification] Response object:', JSON.stringify(response, null, 2))
      throw new Error('Invalid response: missing phone number for display in API response')
    }
    
    // Сохраняем номера из ответа бэкенда
    // ВАЖНО: rawPhone.value будет использоваться для window.location.href = 'tel:...'
    rawPhone.value = phoneToCall
    verificationPhone.value = phoneToDisplay
    
    console.log('[CallVerification] ✓ Phone numbers saved from API response:')
    console.log('[CallVerification] ✓ rawPhone.value (for tel:):', rawPhone.value)
    console.log('[CallVerification] ✓ verificationPhone.value (for display):', verificationPhone.value)
    hasInitialized.value = true // Mark as successfully initialized
    isInitializing.value = false // Mark initialization as complete
    
    console.log('[CallVerification] ✓ Call check initialized successfully')
    console.log('[CallVerification] ✓ verificationPhone.value:', verificationPhone.value)
    console.log('[CallVerification] ✓ rawPhone.value:', rawPhone.value)
    console.log('[CallVerification] ✓ Button should now be enabled')
  } catch (err: any) {
    hasInitialized.value = false // Allow retry on error
    isInitializingInProgress.value = false // Reset guard on error
      
      // Enhanced error logging for debugging
      console.error('[CallVerification] ===== ERROR DURING CALL CHECK INIT =====')
      console.error('[CallVerification] Error object:', err)
      console.error('[CallVerification] Error constructor:', err?.constructor?.name)
      console.error('[CallVerification] Error name:', err?.name)
      console.error('[CallVerification] Error message:', err?.message)
      console.error('[CallVerification] Error stack:', err?.stack)
      console.error('[CallVerification] Error cause:', err?.cause)
      console.error('[CallVerification] Error type:', typeof err)
      console.error('[CallVerification] Error string:', String(err))
      console.error('[CallVerification] Is Error instance?', err instanceof Error)
      console.error('[CallVerification] Error keys:', Object.keys(err || {}))
      
      // Log all available error properties
      try {
        console.error('[CallVerification] Full error JSON:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
      } catch (jsonError) {
        console.error('[CallVerification] Could not stringify error:', jsonError)
      }
      
      // Collect diagnostic information
      const networkStatus = {
        onLine: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        fetchAvailable: typeof window.fetch === 'function',
        telegramWebApp: {
          exists: !!window.Telegram?.WebApp,
          hasInitData: !!window.Telegram?.WebApp?.initData,
          initDataLength: window.Telegram?.WebApp?.initData?.length || 0
        },
        location: {
          href: window.location.href,
          origin: window.location.origin,
          protocol: window.location.protocol
        }
      }
      
      // Get request info if available (may not be set if error occurred before API call)
      const reqInfo = requestInfo || {}
      
      // Log network-related information
      console.error('[CallVerification] Network status:', networkStatus)
      console.error('[CallVerification] Request info:', reqInfo)
    
    // Check error type more specifically
    const errorMessage = err?.message || String(err) || 'Неизвестная ошибка'
    const errorName = err?.name || ''
    
    console.error('[CallVerification] Processing error message:', errorMessage)
    console.error('[CallVerification] Error name:', errorName)
    
    // Extract more details from error message (may contain enhanced info from authApi)
    const hasNetworkError = errorMessage.includes('Network error:') || errorMessage.includes('Unable to connect')
    
    // Build detailed error message with diagnostic info
    const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('Access-Control')
    
    const diagnosticInfo = [
      `Тип ошибки: ${errorName || 'Unknown'}`,
      `Сообщение: ${errorMessage.substring(0, 200)}${errorMessage.length > 200 ? '...' : ''}`,
      `---`,
      `Сеть: ${networkStatus.onLine ? 'онлайн ✓' : 'оффлайн ✗'}`,
      `Fetch API: ${networkStatus.fetchAvailable ? 'доступен ✓' : 'недоступен ✗'}`,
      `Telegram WebApp: ${networkStatus.telegramWebApp.exists ? 'есть ✓' : 'нет ✗'}`,
      `initData: ${networkStatus.telegramWebApp.hasInitData ? `есть ✓ (${networkStatus.telegramWebApp.initDataLength} символов)` : 'нет ✗'}`,
      `---`,
      `API URL: ${reqInfo.url || 'не определен'}`,
      `Метод: ${reqInfo.method || 'POST'}`,
      `Телефон: ${reqInfo.phoneNumber || 'не указан'} (${reqInfo.phoneNumberLength || 0} символов)`,
      `Имя: ${reqInfo.name || 'не указано'} (${reqInfo.nameLength || 0} символов)`,
      `initData длина: ${reqInfo.initDataLength || 0} символов`,
      `---`,
      `Страница: ${networkStatus.location.href.substring(0, 100)}${networkStatus.location.href.length > 100 ? '...' : ''}`,
      `Origin: ${networkStatus.location.origin}`,
      `Протокол: ${networkStatus.location.protocol}`,
      ...(isCorsError ? [
        `---`,
        `🚫 CORS ERROR - Требуется настройка бэкенда`,
        ``,
        `Проблема: Бэкенд не разрешает запросы с этого домена.`,
        `Origin запроса: ${networkStatus.location.origin}`,
        ``,
        `Решение:`,
        `На бэкенде нужно добавить заголовок:`,
        `Access-Control-Allow-Origin: ${networkStatus.location.origin}`,
        ``,
        `Или для всех доменов (менее безопасно):`,
        `Access-Control-Allow-Origin: *`,
        ``,
        `Также могут понадобиться:`,
        `Access-Control-Allow-Methods: POST, OPTIONS`,
        `Access-Control-Allow-Headers: Content-Type, Accept`,
        `Access-Control-Allow-Credentials: true`
      ] : hasNetworkError ? [
        `---`,
        `⚠️ Network Error detected`,
        `Возможные причины:`,
        `1. CORS блокировка сервера`,
        `2. DNS не разрешается`,
        `3. Сервер недоступен`,
        `4. Telegram WebView блокирует запрос`
      ] : [])
    ].join('\n')
    
    // Try to show alert in Telegram if available (using showAlert if it exists)
    if (window.Telegram?.WebApp) {
      try {
        const webApp = window.Telegram.WebApp as any
        if (typeof webApp.showAlert === 'function') {
          webApp.showAlert(diagnosticInfo)
        } else if (typeof webApp.alert === 'function') {
          webApp.alert(diagnosticInfo)
        }
      } catch (alertError) {
        console.error('[CallVerification] Could not show Telegram alert:', alertError)
      }
    }
    
    // Build base message first
    let baseMessage = errorMessage
    
    // Handle specific HTTP status codes first
    if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
      if (errorMessage.includes('SMS Provider Error') || errorMessage.includes('SMS Provider')) {
        baseMessage = errorMessage // Keep the SMS Provider Error message as is
      } else if (errorMessage.includes('Validation failed') || errorMessage.includes('validation')) {
        baseMessage = errorMessage // Keep the detailed validation message
      } else {
        baseMessage = 'Неверный запрос. Проверьте введенные данные.'
      }
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid Telegram data')) {
      baseMessage = 'Ошибка авторизации. Убедитесь, что вы открыли приложение через Telegram.'
    } else if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
      baseMessage = errorMessage // Keep the detailed conflict message
    } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
      baseMessage = 'Сервер временно недоступен. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
    } else if (errorMessage.includes('Phone number is required') || errorMessage.includes('name is empty')) {
      baseMessage = errorMessage // Keep validation messages
    } else if (errorMessage.includes('initData is empty')) {
      baseMessage = 'Ошибка авторизации. Убедитесь, что вы открыли приложение через Telegram.'
    } else if (errorName === 'TypeError' && (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError'))) {
      // This is a real network/fetch error
      console.error('[CallVerification] Real network error detected (TypeError + Failed to fetch)')
      if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control') || errorMessage.includes('cross-origin')) {
        baseMessage = 'Ошибка подключения к серверу (CORS).'
      } else {
        baseMessage = 'Проблема с подключением к интернету.'
      }
    } else if (errorMessage.includes('CORS error:')) {
      baseMessage = 'Ошибка подключения к серверу (CORS).'
    } else if (errorMessage.includes('Network error:') && errorMessage.includes('Unable to connect')) {
      // This is the specific network error message from authApi
      baseMessage = 'Проблема с подключением к интернету.'
    } else {
      // For any other error, show the original message (it might contain useful info)
      baseMessage = errorMessage
      console.warn('[CallVerification] Unknown error type, showing original message')
    }
    
    // Always append diagnostic information
    const userFriendlyMessage = `${baseMessage}\n\n--- Детали для отладки ---\n${diagnosticInfo}`
    
    console.error('[CallVerification] Final user-friendly message:', userFriendlyMessage)
    error.value = `Ошибка при получении номера для звонка:\n${userFriendlyMessage}`
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

// Handle call link click - based on Telegram Web App example
// Function to make a phone call - similar to the provided example
const handleCallLinkClick = (e?: Event) => {
  console.log('[CallVerification] ===== CALL LINK CLICKED =====')
  console.log('[CallVerification] Tel URL:', telUrl.value)
  console.log('[CallVerification] Checking if running in Telegram WebView:', !!window.Telegram?.WebApp)
  
  if (!telUrl.value || !rawPhone.value) {
    console.error('[CallVerification] ✗ ERROR: Tel URL or phone number is missing!')
    error.value = 'Номер для звонка еще не получен. Пожалуйста, подождите.'
    if (e) {
      e.preventDefault()
    }
    return
  }
  
  const phoneToCall = telUrl.value
  
  // PRIORITY 1: Use Telegram.WebApp.openLink() as in the example (official API)
  // This is the method from the provided example
  if (window.Telegram?.WebApp?.openLink) {
    console.log('[CallVerification] Attempting method 1: Telegram.WebApp.openLink() (official API)')
    try {
      // Prevent default only if we're using Telegram API
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      window.Telegram.WebApp.openLink(phoneToCall)
      console.log('[CallVerification] ✓ Telegram.WebApp.openLink() called successfully')
      hasCalled.value = true
      setTimeout(() => {
        startStatusPolling()
      }, 500)
      return
    } catch (err) {
      console.warn('[CallVerification] Telegram.WebApp.openLink() failed:', err)
    }
  }
  
  // PRIORITY 2: Try window.open with _blank (as suggested in user's request)
  console.log('[CallVerification] Attempting method 2: window.open(tel:, _blank)')
  try {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    window.open(phoneToCall, '_blank')
    console.log('[CallVerification] ✓ window.open(_blank) called')
    hasCalled.value = true
    setTimeout(() => {
      startStatusPolling()
    }, 500)
    return
  } catch (err) {
    console.warn('[CallVerification] window.open(_blank) failed:', err)
  }
  
  // PRIORITY 3: Fallback for regular browser - window.location.href
  console.log('[CallVerification] Attempting method 3: window.location.href (fallback)')
  try {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    window.location.href = phoneToCall
    console.log('[CallVerification] ✓ window.location.href set')
    hasCalled.value = true
    setTimeout(() => {
      startStatusPolling()
    }, 500)
    return
  } catch (err) {
    console.warn('[CallVerification] window.location.href failed:', err)
  }
  
  // PRIORITY 4: If all programmatic methods fail, allow default link behavior
  // Don't preventDefault - let the browser handle tel: link naturally
  console.log('[CallVerification] All programmatic methods failed, allowing default link behavior')
  hasCalled.value = true
  setTimeout(() => {
    startStatusPolling()
  }, 500)
  // Don't preventDefault here - let the link work naturally
}

const startStatusPolling = () => {
  // Clear any existing interval
  if (statusPollInterval.value) {
    clearInterval(statusPollInterval.value)
  }

  // Use phone number from props or rawPhone (from API response)
  // According to API: POST /auth/call-check/status requires phoneNumber
  let phoneNumberForStatus = props.phone || ''
  
  // If rawPhone is available (from init response), use it instead
  if (rawPhone.value) {
    phoneNumberForStatus = rawPhone.value
  }
  
  // Clean phone number (remove + and non-digits)
  if (phoneNumberForStatus.startsWith('+')) {
    phoneNumberForStatus = phoneNumberForStatus.substring(1)
  }
  phoneNumberForStatus = phoneNumberForStatus.replace(/\D/g, '')
  
  if (!phoneNumberForStatus || phoneNumberForStatus.length < 10) {
    console.error('[CallVerification] No valid phone number available for status check')
    error.value = 'Не удалось получить номер телефона для проверки статуса.'
    return
  }
  
  console.log('[CallVerification] Starting status polling with phone:', phoneNumberForStatus)
  console.log('[CallVerification] Polling every 4 seconds (3-5 seconds as per API requirements)')

  // Poll every 4 seconds (between 3-5 seconds as recommended by API)
  statusPollInterval.value = window.setInterval(async () => {
    try {
      console.log('[CallVerification] Polling call status...')
      const response = await authApi.checkCallStatus(phoneNumberForStatus)
      
      console.log('[CallVerification] Status check response:', response)
      console.log('[CallVerification] Response status:', response.status)
      
      if (response.status === 'OK' && response.token && response.user) {
        // Call verified successfully - user completed the call
        console.log('[CallVerification] ✓ Call verified successfully!')
        console.log('[CallVerification] User:', response.user)
        console.log('[CallVerification] Token received:', response.token ? 'yes' : 'no')
        
        // Stop polling immediately
        if (statusPollInterval.value) {
          clearInterval(statusPollInterval.value)
          statusPollInterval.value = null
          console.log('[CallVerification] Status polling stopped')
        }

        // Convert API user to app User format
        const user: User = {
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
        }

        // Store token
        if (response.token) {
          localStorage.setItem('auth_token', response.token)
          console.log('[CallVerification] Token saved to localStorage')
          console.log('[CallVerification] Token:', response.token.substring(0, 50) + '...')
        }

        console.log('[CallVerification] Calling onSuccess callback to navigate to home screen')
        // Call success callback - this should navigate to home screen
        props.onSuccess(user)
      } else if (response.status === 'NEED_PHONE') {
        // User hasn't called yet or call not verified - continue polling
        console.log('[CallVerification] Status: NEED_PHONE - continuing to poll...')
        // Keep polling, don't do anything
      } else if (response.status === 'FAILED' || response.status === 'PENDING') {
        // Call verification failed or still pending
        // For FAILED, we might want to stop after some time, but for now continue polling
        console.log('[CallVerification] Status:', response.status, '- continuing to poll...')
        // Continue polling - API might return FAILED temporarily
      }
      // Continue polling for any other status
    } catch (err) {
      console.error('[CallVerification] Error checking call status:', err)
      // Continue polling on error - don't stop the polling unless user explicitly cancels
      // Network errors might be temporary
    }
  }, 4000) // Poll every 4 seconds (within 3-5 second range as per API requirements)
  
  console.log('[CallVerification] Status polling started')
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
          <p class="call-verification-screen__phone-number">{{ verificationPhone || (isInitializing ? 'Получение номера...' : 'Номер не получен') }}</p>
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
        <a
          v-if="!hasCalled && rawPhone && verificationPhone && telUrl"
          :href="telUrl"
          class="call-verification-screen__button call-verification-screen__button--primary"
          @click="handleCallLinkClick"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__button-icon">
            <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="white"/>
          </svg>
          <span>Позвонить {{ verificationPhone }}</span>
        </a>
        <button
          v-else-if="!hasCalled"
          type="button"
          class="call-verification-screen__button call-verification-screen__button--primary"
          disabled
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="call-verification-screen__button-icon">
            <path d="M15.4688 0.84375C15.8125 0.9375 16.0625 1.21875 16.0625 1.5625C16.0625 9.59375 9.5625 16.0625 1.5625 16.0625C1.1875 16.0625 0.90625 15.8438 0.8125 15.5L0.0625 12.25C0 11.9062 0.15625 11.5312 0.5 11.375L4 9.875C4.3125 9.75 4.65625 9.84375 4.875 10.0938L6.4375 12C8.875 10.8438 10.8438 8.84375 11.9688 6.46875L10.0625 4.90625C9.8125 4.6875 9.71875 4.34375 9.84375 4.03125L11.3438 0.53125C11.5 0.1875 11.875 0 12.2188 0.09375L15.4688 0.84375Z" fill="white"/>
          </svg>
          <span v-if="isInitializing">Получение номера...</span>
          <span v-else>Номер не получен</span>
        </button>
        <div
          v-else
          class="call-verification-screen__status"
        >
          <div class="call-verification-screen__status-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16L17 10L15.59 8.59L11 13.17L8.41 10.59L7 12L11 16Z" fill="#22C55E"/>
            </svg>
          </div>
          <p class="call-verification-screen__status-text">Ожидание подтверждения звонка...</p>
          <p class="call-verification-screen__status-hint">Проверка статуса автоматически</p>
        </div>
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

/* Hide any call buttons inside content block - button should only be in footer */
.call-verification-screen__content .call-verification-screen__call-button,
.call-verification-screen__content .call-button {
  display: none !important;
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

.call-verification-screen__call-button {
  width: 100%;
  padding: 30px 60px;
  font-size: 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-family: Inter, sans-serif;
  font-weight: 600;
  margin-top: 24px;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: inline-block;
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
}

.call-verification-screen__call-button:hover {
  background: #45a049;
}

.call-verification-screen__call-button:active:not(:disabled),
a.call-verification-screen__call-button:active {
  transform: translateY(1px);
  background: #3d8b40;
}

.call-verification-screen__call-button:disabled,
.call-verification-screen__call-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #9ca3af;
}

.call-verification-screen__call-button:disabled:hover,
.call-verification-screen__call-button--disabled:hover {
  background: #9ca3af;
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
  text-decoration: none;
  box-sizing: border-box;
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

.call-verification-screen__button:active:not(:disabled),
a.call-verification-screen__button:active {
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

.call-verification-screen__status {
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #F9FAFB;
  border-radius: 12px;
  margin-bottom: 12px;
}

.call-verification-screen__status-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #DBEAFE;
  border-radius: 50%;
  flex-shrink: 0;
}

.call-verification-screen__status-icon svg {
  width: 24px;
  height: 24px;
  display: block;
}

.call-verification-screen__status-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #1f2937;
}

.call-verification-screen__status-hint {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  color: #6B7280;
}
</style>

