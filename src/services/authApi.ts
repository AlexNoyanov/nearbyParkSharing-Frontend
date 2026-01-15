// API service for authentication

import { testMode } from './testMode'

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
// In dev, use Vite proxy to avoid backend CORS (see vite.config.ts)
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

// Dev-only fallback initData (only used when not running inside Telegram WebApp)
const DEV_FALLBACK_INIT_DATA =
  'auth_date=1768317980&query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A111222333%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22Alexander%22%2C%22language_code%22%3A%22en%22%7D&hash=77794dcb2dd54b35f40010f1dcede46444340c01530bfd17849802cd6295c527'

export interface LoginResponse {
  status: 'OK' | 'NEED_PHONE'
  token?: string
  user?: {
    id: string
    name: string
    phone: string
  }
}

export interface CallCheckInitResponse {
  prettyPhone: string
  rawPhone: string
}

export interface CallCheckStatusResponse {
  status: 'PENDING' | 'OK' | 'FAILED'
  token?: string
  user?: {
    id: string
    name: string
    phone: string
  }
}

export const authApi = {
  /**
   * Login with Telegram initData
   * Should be called on app startup
   */
  async login(initData: string): Promise<LoginResponse> {
    // Use test mode if enabled
    if (testMode.isEnabled()) {
      console.log('[AuthAPI] Test mode: Using mock login')
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For test mode, always return NEED_PHONE status
      // User will need to go through call verification
      return {
        status: 'NEED_PHONE',
        user: {
          id: 'test-user-id',
          name: 'Test User',
          phone: '',
        }
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[AuthAPI] Login error:', error)
      throw error
    }
  },

  /**
   * Initialize call verification
   * Returns phone number to call
   */
  async initCallCheck(initData: string, phoneNumber: string): Promise<CallCheckInitResponse> {
    // ALWAYS USE REAL API FOR REGISTRATION - Test mode is ignored for this endpoint
    console.log('[AuthAPI] ===== INIT CALL CHECK START =====')
    console.log('[AuthAPI] Using REAL API for call check initialization')
    console.log('[AuthAPI] API Endpoint:', `${API_BASE_URL}/api/v1/auth/call-check/init`)
    
    // Use real Telegram initData (must be passed in from Telegram Mini App runtime).
    // In local dev only, fall back to a known-good initData for debugging.
    const finalInitData =
      (initData && initData.trim()) ? initData.trim() : (import.meta.env.DEV ? DEV_FALLBACK_INIT_DATA : '')

    // Use user-provided phone number (but never send empty)
    const finalPhoneNumber = (phoneNumber && phoneNumber.trim()) ? phoneNumber.trim() : ''

    // Validate required values
    if (!finalInitData) {
      throw new Error('initData is empty. Open the app inside Telegram Mini App so Telegram.WebApp.initData is available.')
    }
    if (!finalPhoneNumber) {
      throw new Error('phoneNumber is empty. It must come from the user registration phone field.')
    }

    console.log('[AuthAPI] FINAL VALUES TO SEND:')
    console.log('[AuthAPI] - initData length:', finalInitData.length)
    console.log('[AuthAPI] - initData preview:', finalInitData.substring(0, 100) + '...')
    console.log('[AuthAPI] - phoneNumber:', finalPhoneNumber)
    console.log('[AuthAPI] - phoneNumber length:', finalPhoneNumber.length)

    try {
      // Prepare request body
      const requestBody: { initData: string; phoneNumber: string } = {
        initData: finalInitData,
        phoneNumber: finalPhoneNumber
      }
      
      // Double-check the body is not empty
      if (!requestBody.initData || requestBody.initData.length === 0) {
        throw new Error('requestBody.initData is empty after construction!')
      }
      if (!requestBody.phoneNumber || requestBody.phoneNumber.length === 0) {
        throw new Error('requestBody.phoneNumber is empty after construction!')
      }
      
      console.log('[AuthAPI] Request body object:', requestBody)
      console.log('[AuthAPI] Request body initData length:', requestBody.initData.length)
      console.log('[AuthAPI] Request body phoneNumber:', requestBody.phoneNumber)
      
      console.log('[AuthAPI] Request body constructed:', {
        initDataLength: requestBody.initData.length,
        phoneNumber: requestBody.phoneNumber,
        initDataPreview: requestBody.initData.substring(0, 100) + '...'
      })
      
      // Stringify the body
      const requestBodyString = JSON.stringify(requestBody)
      
      // Verify stringified body is not empty
      if (!requestBodyString || requestBodyString.length === 0) {
        throw new Error('requestBodyString is empty after JSON.stringify!')
      }
      
      // Verify the stringified body contains the expected data
      const parsedBack = JSON.parse(requestBodyString)
      if (!parsedBack.initData || parsedBack.initData.length === 0) {
        throw new Error('Parsed initData is empty!')
      }
      if (!parsedBack.phoneNumber || parsedBack.phoneNumber.length === 0) {
        throw new Error('Parsed phoneNumber is empty!')
      }
      
      console.log('[AuthAPI] Stringified body:', requestBodyString)
      console.log('[AuthAPI] Stringified body length:', requestBodyString.length)
      console.log('[AuthAPI] Parsed back from string:', parsedBack)
      console.log('[AuthAPI] Parsed initData length:', parsedBack.initData?.length || 0)
      console.log('[AuthAPI] Parsed phoneNumber:', parsedBack.phoneNumber)
      
      // Make the API call
      const apiUrl = `${API_BASE_URL}/api/v1/auth/call-check/init`
      console.log('[AuthAPI] Making POST request to:', apiUrl)
      console.log('[AuthAPI] Request body will be:', requestBodyString)
      console.log('[AuthAPI] Request body type:', typeof requestBodyString)
      console.log('[AuthAPI] Request body is empty?', requestBodyString.length === 0)
      
      // Create fetch options with explicit body
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBodyString
      }
      
      // Log fetch options to verify body is set
      console.log('[AuthAPI] Fetch options:', {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0,
        bodyPreview: fetchOptions.body ? String(fetchOptions.body).substring(0, 100) : '(empty)'
      })
      
      const response = await fetch(apiUrl, fetchOptions)
      
      console.log('[AuthAPI] Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      console.log('[AuthAPI] Init call check response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorText = ''
        let errorJson: any = null
        
        try {
          errorText = await response.text()
          // Try to parse as JSON
          try {
            errorJson = JSON.parse(errorText)
          } catch {
            // Not JSON, use as text
          }
        } catch (e) {
          errorText = `Failed to read error response: ${e}`
        }

        console.error('[AuthAPI] Init call check error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorJson
        })

        // Provide more detailed error message
        if (errorJson) {
          const errorMessage = errorJson.detail || errorJson.message || errorText
          throw new Error(`Server error (${response.status}): ${errorMessage}`)
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
      }

      const result = await response.json()
      console.log('[AuthAPI] Init call check success:', result)
      console.log('[AuthAPI] Response data:', JSON.stringify(result, null, 2))
      return result
    } catch (error: any) {
      console.error('[AuthAPI] Init call check error:', error)
      console.error('[AuthAPI] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      })
      
      // Handle "Failed to fetch" errors specifically
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        console.error('[AuthAPI] Network error detected. Possible causes:')
        console.error('  - CORS issue with the API server')
        console.error('  - Network connectivity problem')
        console.error('  - API server is down or unreachable')
        console.error('  - Request was blocked by browser security')
        throw new Error(`Network error: Unable to connect to API server. Please check your internet connection and try again.`)
      }
      
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error(`Failed to initialize call check: ${String(error)}`)
      }
    }
  },

  /**
   * Check call verification status
   * Should be polled every 3-5 seconds while user is making a call
   */
  async checkCallStatus(initData: string): Promise<CallCheckStatusResponse> {
    // Use test mode if enabled
    if (testMode.isEnabled()) {
      console.log('[AuthAPI] Test mode: Using mock call status check')
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For test mode, after a short delay, return success
      // In real scenario, this would check if call was made
      // For now, we'll use a simple test user
      return {
        status: 'OK',
        token: 'test-jwt-token-' + Date.now(),
        user: {
          id: 'test-user-1',
          name: 'Test User',
          phone: '+79991234567'
        }
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/call-check/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[AuthAPI] Check call status error:', error)
      throw error
    }
  },
}

