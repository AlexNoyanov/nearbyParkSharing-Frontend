// API service for authentication

const API_BASE_URL = 'http://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'

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
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/call-check/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData, phoneNumber }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
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

