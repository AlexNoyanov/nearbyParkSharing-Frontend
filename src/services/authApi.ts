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
    // Use test mode if enabled
    if (testMode.isEnabled()) {
      console.log('[AuthAPI] Test mode: Using mock call check init')
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        prettyPhone: TEST_CALL_PHONE,
        rawPhone: TEST_CALL_PHONE_RAW
      }
    }

    try {
      const requestBody = { initData, phoneNumber }
      console.log('[AuthAPI] Init call check request:', { 
        url: `${API_BASE_URL}/api/v1/auth/call-check/init`,
        body: { ...requestBody, initData: initData ? `${initData.substring(0, 50)}...` : '' }
      })
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/call-check/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('[AuthAPI] Init call check response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AuthAPI] Init call check error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('[AuthAPI] Init call check success:', result)
      return result
    } catch (error) {
      console.error('[AuthAPI] Init call check error:', error)
      throw error
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

