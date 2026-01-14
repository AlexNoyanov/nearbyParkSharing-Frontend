// API service for authentication

import { testMode } from './testMode'

const API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'

// Test phone number for call verification
const TEST_CALL_PHONE = '+7 (800) 123-45-67'
const TEST_CALL_PHONE_RAW = '+78001234567'

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
    console.log('[AuthAPI] Using REAL API for call check initialization')
    console.log('[AuthAPI] API Endpoint:', `${API_BASE_URL}/api/v1/auth/call-check/init`)
    console.log('[AuthAPI] Test mode status:', testMode.isEnabled(), '(ignored for registration)')

    // Validate inputs
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required')
    }

    try {
      // Prepare request body with proper format
      const requestBody = {
        initData: initData || '',
        phoneNumber: phoneNumber.trim()
      }
      
      // Stringify the body to ensure it's sent correctly
      const requestBodyString = JSON.stringify(requestBody)
      
      console.log('[AuthAPI] Init call check request:', { 
        url: `${API_BASE_URL}/api/v1/auth/call-check/init`,
        method: 'POST',
        hasInitData: !!initData,
        initDataLength: initData?.length || 0,
        phoneNumber: phoneNumber,
        requestBody: requestBody,
        requestBodyString: requestBodyString,
        bodyPreview: { 
          initData: initData ? `${initData.substring(0, 50)}...` : '(empty)',
          phoneNumber: phoneNumber
        }
      })
      
      // Make the API call with explicit error handling
      const apiUrl = `${API_BASE_URL}/api/v1/auth/call-check/init`
      console.log('[AuthAPI] Sending POST request to:', apiUrl)
      console.log('[AuthAPI] Request body (stringified):', requestBodyString)
      console.log('[AuthAPI] Request body (parsed back):', JSON.parse(requestBodyString))
      
      // Create fetch options
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBodyString,
        mode: 'cors',
        credentials: 'omit'
      }
      
      console.log('[AuthAPI] Fetch options:', {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        body: fetchOptions.body,
        mode: fetchOptions.mode
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

