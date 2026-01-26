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
  prettyPhone?: string
  rawPhone?: string
  callToNumber?: string  // API response format from api.md
}

export interface CallCheckStatusResponse {
  status: 'OK' | 'NEED_PHONE' | 'PENDING' | 'FAILED'
  token?: string
  user?: {
    id: string
    name: string
    phone: string
  }
}

export interface UserMeResponse {
  id: string
  telegramId: number
  phoneNumber: string
  firstName: string
  lastName: string | null
  username: string
}

/**
 * Parse Telegram initData query string to extract auth_date
 * @param initData - Telegram initData query string (e.g., "auth_date=1768317980&query_id=...")
 * @returns auth_date as number, or null if not found
 */
function parseAuthDate(initData: string): number | null {
  if (!initData || !initData.trim()) {
    return null
  }
  
  try {
    const params = new URLSearchParams(initData)
    const authDateStr = params.get('auth_date')
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10)
      if (!isNaN(authDate)) {
        return authDate
      }
    }
  } catch (error) {
    console.error('[AuthAPI] Error parsing auth_date from initData:', error)
  }
  
  return null
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
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorText = await response.text()
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.message || errorJson.error || errorMessage
            } catch {
              // If not JSON, use text as is
              errorMessage = errorText || errorMessage
            }
          }
        } catch (e) {
          // If we can't read error, use default message
          console.warn('[AuthAPI] Could not read error response:', e)
        }
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        throw error
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
  async initCallCheck(initData: string, phoneNumber: string, name?: string): Promise<CallCheckInitResponse> {
    // ALWAYS USE REAL API FOR REGISTRATION - Test mode is ignored for this endpoint
    // ALWAYS call the real backend API server - no conditions, no proxy, no dev mode changes
    // This is the REAL API server address - MUST be used in ALL environments
    const API_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/api/v1/auth/call-check/init'
    
    console.log('[AuthAPI] ===== INIT CALL CHECK START =====')
    console.log('[AuthAPI] Using REAL API for call check initialization')
    console.log('[AuthAPI] API Endpoint (ALWAYS REAL SERVER):', API_URL)
    console.log('[AuthAPI] Environment:', import.meta.env.MODE)
    console.log('[AuthAPI] Current page URL:', window.location.href)
    console.log('[AuthAPI] Current origin:', window.location.origin)
    
    // Use real Telegram initData (must be passed in from Telegram Mini App runtime).
    // NEVER use fallback in production - only in dev mode for local testing
    let finalInitData = initData && initData.trim() ? initData.trim() : ''
    
    // In dev mode only, if initData is empty, use fallback for local testing
    if (!finalInitData && import.meta.env.DEV) {
      console.warn('[AuthAPI] DEV MODE: Using fallback initData for local testing')
      finalInitData = DEV_FALLBACK_INIT_DATA
    }

    // Use user-provided phone number (but never send empty)
    // Process phone number - ensure it's in the correct format for API
    let finalPhoneNumber = (phoneNumber && phoneNumber.trim()) ? phoneNumber.trim() : ''
    
    // Remove all non-digit characters first
    finalPhoneNumber = finalPhoneNumber.replace(/\D/g, '')
    
    // Ensure Russian phone number format: must start with 7 and be 11 digits
    // If number doesn't start with 7, add it (for Russian numbers)
    if (finalPhoneNumber.length === 10 && !finalPhoneNumber.startsWith('7')) {
      // If 10 digits without 7 prefix, add 7 for Russian format
      finalPhoneNumber = '7' + finalPhoneNumber
    }
    
    // Remove + if present (shouldn't be after replace, but just in case)
    if (finalPhoneNumber.startsWith('+')) {
      finalPhoneNumber = finalPhoneNumber.substring(1)
    }
    
    // Use user-provided name (required by server)
    const finalName = (name && name.trim()) ? name.trim() : ''

    console.log('[AuthAPI] Phone number processing:')
    console.log('[AuthAPI] - Original phoneNumber:', phoneNumber)
    console.log('[AuthAPI] - Final phoneNumber (digits only):', finalPhoneNumber)
    
    // Validate required values
    if (!finalInitData || finalInitData.trim().length === 0) {
      const errorMsg = 'initData is empty. The app must be opened through Telegram Mini App to get authentication data. Please close and reopen the app from Telegram.'
      console.error('[AuthAPI]', errorMsg)
      console.error('[AuthAPI] Telegram.WebApp available:', !!window.Telegram?.WebApp)
      console.error('[AuthAPI] Telegram.WebApp.initData:', window.Telegram?.WebApp?.initData || '(empty)')
      throw new Error(errorMsg)
    }
    if (!finalPhoneNumber || finalPhoneNumber.length < 10) {
      throw new Error('phoneNumber is empty or invalid. It must come from the user registration phone field.')
    }
    if (!finalName) {
      throw new Error('name is empty. It must come from the user registration name field.')
    }

    // Extract auth_date from initData
    const authDate = parseAuthDate(finalInitData)
    
    console.log('[AuthAPI] FINAL VALUES TO SEND:')
    console.log('[AuthAPI] - initData length:', finalInitData.length)
    console.log('[AuthAPI] - initData preview:', finalInitData.substring(0, 100) + '...')
    console.log('[AuthAPI] - phoneNumber:', finalPhoneNumber)
    console.log('[AuthAPI] - phoneNumber length:', finalPhoneNumber.length)
    console.log('[AuthAPI] - name:', finalName)
    console.log('[AuthAPI] - auth_date:', authDate)

    try {
      // Prepare request body according to Swagger API documentation
      // PhoneRequest schema: initData, phoneNumber, name (all required)
      // Do NOT send auth_date separately - it's already in initData
      const requestBody: { initData: string; phoneNumber: string; name: string } = {
        initData: finalInitData,
        phoneNumber: finalPhoneNumber,
        name: finalName
      }
      
      // Double-check the body is not empty
      if (!requestBody.initData || requestBody.initData.length === 0) {
        throw new Error('requestBody.initData is empty after construction!')
      }
      if (!requestBody.phoneNumber || requestBody.phoneNumber.length === 0) {
        throw new Error('requestBody.phoneNumber is empty after construction!')
      }
      if (!requestBody.name || requestBody.name.length === 0) {
        throw new Error('requestBody.name is empty after construction!')
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
      
      // Make the API call - use proxy in dev mode to avoid CORS, direct URL in production
      console.log('[AuthAPI] ===== ABOUT TO MAKE FETCH REQUEST =====')
      console.log('[AuthAPI] Making POST request to:', API_URL)
      console.log('[AuthAPI] Request body will be:', requestBodyString)
      console.log('[AuthAPI] Request body type:', typeof requestBodyString)
      console.log('[AuthAPI] Request body is empty?', requestBodyString.length === 0)
      console.log('[AuthAPI] Current timestamp:', new Date().toISOString())
      console.log('[AuthAPI] Navigator.onLine:', navigator.onLine)
      console.log('[AuthAPI] Window location:', window.location.href)
      
      // Create fetch options with explicit body and CORS settings
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBodyString,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send cookies to avoid CORS preflight issues
      }
      
      // Log fetch options to verify body is set
      console.log('[AuthAPI] Fetch options configured:', {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        mode: fetchOptions.mode,
        credentials: fetchOptions.credentials,
        bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0,
        bodyPreview: fetchOptions.body ? String(fetchOptions.body).substring(0, 100) : '(empty)'
      })
      
      // Pre-flight checks before fetch
      console.log('[AuthAPI] ===== PRE-FLIGHT CHECKS =====')
      console.log('[AuthAPI] Checking navigator.onLine:', navigator.onLine)
      console.log('[AuthAPI] Checking window.fetch exists:', typeof window.fetch)
      console.log('[AuthAPI] Checking Telegram.WebApp:', {
        exists: !!window.Telegram?.WebApp,
        hasInitData: !!window.Telegram?.WebApp?.initData,
        initDataLength: window.Telegram?.WebApp?.initData?.length || 0
      })
      console.log('[AuthAPI] Current location:', {
        href: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol,
        host: window.location.host,
        hostname: window.location.hostname
      })
      console.log('[AuthAPI] ⚠️ IMPORTANT: API server must allow CORS from origin:', window.location.origin)
      console.log('[AuthAPI] ⚠️ Backend must set: Access-Control-Allow-Origin:', window.location.origin)
      
      console.log('[AuthAPI] Calling fetch() NOW...')
      console.log('[AuthAPI] URL:', API_URL)
      console.log('[AuthAPI] Request timestamp:', new Date().toISOString())
      console.log('[AuthAPI] Fetch options (without body):', {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        mode: fetchOptions.mode,
        credentials: fetchOptions.credentials,
        bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0
      })
      
      let response: Response
      const fetchStartTime = Date.now()
      try {
        console.log('[AuthAPI] About to execute: await fetch(API_URL, fetchOptions)')
        console.log('[AuthAPI] Fetch function type:', typeof fetch)
        console.log('[AuthAPI] Fetch function:', fetch.toString().substring(0, 200))
        
        response = await fetch(API_URL, fetchOptions)
        const fetchDuration = Date.now() - fetchStartTime
        console.log('[AuthAPI] ✓ Fetch completed after', fetchDuration, 'ms')
        console.log('[AuthAPI] ✓ Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          type: response.type,
          url: response.url
        })
      } catch (fetchError: any) {
        const fetchDuration = Date.now() - fetchStartTime
        console.error('[AuthAPI] ✗ Fetch threw an exception after', fetchDuration, 'ms')
        console.error('[AuthAPI] ===== FETCH ERROR DETAILS =====')
        console.error('[AuthAPI] Fetch error type:', typeof fetchError)
        console.error('[AuthAPI] Fetch error constructor:', fetchError?.constructor?.name)
        console.error('[AuthAPI] Fetch error name:', fetchError?.name)
        console.error('[AuthAPI] Fetch error message:', fetchError?.message)
        console.error('[AuthAPI] Fetch error stack:', fetchError?.stack)
        console.error('[AuthAPI] Fetch error cause:', fetchError?.cause)
        console.error('[AuthAPI] Is Error instance?', fetchError instanceof Error)
        console.error('[AuthAPI] Error keys:', Object.keys(fetchError || {}))
        
        // Try to stringify the error
        let errorDetailsString = ''
        try {
          errorDetailsString = JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError))
          console.error('[AuthAPI] Stringified fetch error:', errorDetailsString)
        } catch (stringifyError) {
          console.error('[AuthAPI] Could not stringify error:', stringifyError)
          errorDetailsString = String(fetchError)
          console.error('[AuthAPI] Error as string:', errorDetailsString)
        }
        
        // Check for specific error patterns
        const errorString = String(fetchError?.message || fetchError || '')
        const errorAnalysis = {
          containsFailedToFetch: errorString.includes('Failed to fetch'),
          containsNetworkError: errorString.includes('NetworkError'),
          containsCORS: errorString.includes('CORS'),
          containsNetworkRequestFailed: errorString.includes('Network request failed'),
          containsTypeError: errorString.includes('TypeError')
        }
        
        console.error('[AuthAPI] Error string analysis:', errorAnalysis)
        
        // Enhance error with diagnostic info for user
        const enhancedError = new Error(
          `Network error: Unable to connect to API server at ${API_URL}. ` +
          `Error: ${fetchError?.name || 'Unknown'} - ${fetchError?.message || errorString}. ` +
          `Duration: ${fetchDuration}ms. ` +
          `Analysis: ${JSON.stringify(errorAnalysis)}. ` +
          `Details: ${errorDetailsString.substring(0, 200)}`
        )
        
        // Copy original error properties
        if (fetchError?.stack) {
          enhancedError.stack = fetchError.stack
        }
        if ((fetchError as any)?.cause) {
          (enhancedError as any).cause = (fetchError as any).cause
        }
        
        throw enhancedError // Throw enhanced error to be caught by outer catch
      }
      
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
        
        // Log the request that was sent for debugging
        console.error('[AuthAPI] Request that failed:', {
          url: API_URL,
          method: fetchOptions.method,
          headers: fetchOptions.headers,
          body: requestBody,
          bodyString: requestBodyString
        })

        // Provide more detailed error message with validation details
        if (errorJson) {
          const errorMessage = errorJson.detail || errorJson.message || errorText
          const validationErrors = errorJson.errors || errorJson.validation_errors || errorJson.error_details
          
          // Log full error JSON for debugging
          console.error('[AuthAPI] Full error JSON:', JSON.stringify(errorJson, null, 2))
          
          // Check for specific error types
          const isSmsProviderError = errorMessage.includes('SMS Provider Error') || 
                                     errorMessage.includes('SMS Provider') ||
                                     errorMessage.includes('sms provider')
          
          let fullErrorMessage = errorMessage
          
          if (isSmsProviderError) {
            // SMS Provider Error - backend issue with SMS service
            fullErrorMessage = `SMS Provider Error: Не удалось создать номер для звонка. Это проблема на стороне сервера. Попробуйте позже или обратитесь в поддержку.`
            if (errorJson.error_details || errorJson.details) {
              console.error('[AuthAPI] SMS Provider Error details:', errorJson.error_details || errorJson.details)
            }
          } else if (validationErrors) {
            // Validation errors
            fullErrorMessage = `Server error (${response.status}): ${errorMessage}\nValidation errors: ${JSON.stringify(validationErrors, null, 2)}`
          } else {
            // Generic server error
            fullErrorMessage = `Server error (${response.status}): ${errorMessage}`
          }
          
          throw new Error(fullErrorMessage)
        } else {
          // Not JSON, check if text contains SMS Provider Error
          if (errorText && (errorText.includes('SMS Provider Error') || errorText.includes('SMS Provider'))) {
            throw new Error(`SMS Provider Error: Не удалось создать номер для звонка. Это проблема на стороне сервера. Попробуйте позже или обратитесь в поддержку.`)
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
      }

      // Get response as text first to handle potential parsing issues
      const responseText = await response.text()
      console.log('[AuthAPI] Response text (raw):', responseText)
      console.log('[AuthAPI] Response text length:', responseText.length)
      
      let result: any = {}
      try {
        result = JSON.parse(responseText)
        console.log('[AuthAPI] Response parsed successfully:', result)
      } catch (parseError) {
        console.error('[AuthAPI] Failed to parse response as JSON:', parseError)
        console.error('[AuthAPI] Response text was:', responseText)
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`)
      }
      
      console.log('[AuthAPI] Init call check success - parsed result:', result)
      console.log('[AuthAPI] Result keys:', Object.keys(result))
      console.log('[AuthAPI] Result has callToNumber?', !!result.callToNumber)
      console.log('[AuthAPI] Result has rawPhone?', !!result.rawPhone)
      console.log('[AuthAPI] Result has prettyPhone?', !!result.prettyPhone)
      console.log('[AuthAPI] Full result object:', JSON.stringify(result, null, 2))
      
      // Handle API response format: {"callToNumber": "79001112233"} (from api.md)
      // Transform to our expected format if needed
      if (result.callToNumber) {
        const callNumber = String(result.callToNumber).trim()
        console.log('[AuthAPI] Found callToNumber in response:', callNumber)
        
        if (!callNumber || callNumber.length === 0) {
          throw new Error('callToNumber in response is empty')
        }
        
        // Format for display (assuming Russian format)
        let prettyPhone = callNumber
        if (callNumber.startsWith('7') && callNumber.length === 11) {
          // Format: 7 (XXX) XXX-XX-XX
          prettyPhone = `+7 (${callNumber.substring(1, 4)}) ${callNumber.substring(4, 7)}-${callNumber.substring(7, 9)}-${callNumber.substring(9)}`
        } else if (callNumber.startsWith('+7') && callNumber.length === 12) {
          // Format: +7 (XXX) XXX-XX-XX
          prettyPhone = `+7 (${callNumber.substring(2, 5)}) ${callNumber.substring(5, 8)}-${callNumber.substring(8, 10)}-${callNumber.substring(10)}`
        } else if (!callNumber.startsWith('+')) {
          // If no + prefix, add it
          prettyPhone = `+${callNumber}`
        }
        
        const transformedResult = {
          prettyPhone,
          rawPhone: callNumber,
          callToNumber: callNumber
        }
        
        console.log('[AuthAPI] Transformed result:', transformedResult)
        return transformedResult
      }
      
      // If result already has prettyPhone and rawPhone, use it
      if (result.prettyPhone && result.rawPhone) {
        console.log('[AuthAPI] Result already has prettyPhone and rawPhone, using as is')
        return result
      }
      
      // If we get here, response format is unexpected
      console.error('[AuthAPI] Unexpected response format. Expected callToNumber, prettyPhone, or rawPhone')
      console.error('[AuthAPI] Received result:', result)
      throw new Error(`Invalid response format: missing callToNumber, prettyPhone, or rawPhone. Response: ${JSON.stringify(result)}`)
    } catch (error: any) {
      console.error('[AuthAPI] Init call check error:', error)
      console.error('[AuthAPI] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      })
      
      // Handle network/fetch errors specifically
      const isNetworkError = error?.message?.includes('Failed to fetch') || 
                           error?.message?.includes('NetworkError') ||
                           error?.name === 'TypeError' ||
                           error?.message?.includes('Network request failed') ||
                           error?.message?.includes('fetch')
      
      if (isNetworkError) {
        console.error('[AuthAPI] ===== NETWORK ERROR DETECTED =====')
        console.error('[AuthAPI] Error name:', error?.name)
        console.error('[AuthAPI] Error message:', error?.message)
        console.error('[AuthAPI] Error stack:', error?.stack)
        console.error('[AuthAPI] Possible causes:')
        console.error('  1. CORS issue with the API server')
        console.error('  2. Network connectivity problem')
        console.error('  3. API server is down or unreachable')
        console.error('  4. Request was blocked by browser security')
        console.error('  5. DNS resolution failure')
        console.error('[AuthAPI] Current page URL:', window.location.href)
        console.error('[AuthAPI] Current origin:', window.location.origin)
        console.error('[AuthAPI] API URL attempted:', API_URL)
        console.error('[AuthAPI] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
        
        // Check if it's a CORS error specifically
        const isCorsError = error?.message?.includes('CORS') || 
                           error?.message?.includes('Access-Control') ||
                           error?.message?.includes('cross-origin')
        
        const errorMsg = isCorsError
          ? `CORS error: The API server needs to allow requests from ${window.location.origin}. Request was blocked by browser security.`
          : `Network error: Unable to connect to API server at ${API_URL}. Please check your internet connection and try again.`
        
        throw new Error(errorMsg)
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
   * According to API: POST /auth/call-check/status
   * Request: {"phoneNumber": "79991234567"}
   * Response: Same as login (status: "OK" | "NEED_PHONE", token, user)
   */
  async checkCallStatus(phoneNumber: string): Promise<CallCheckStatusResponse> {
    // ALWAYS USE REAL API FOR STATUS CHECK - Test mode is ignored for this endpoint
    const API_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/api/v1/auth/call-check/status'
    
    console.log('[AuthAPI] ===== CHECK CALL STATUS =====')
    console.log('[AuthAPI] Using REAL API for call status check')
    console.log('[AuthAPI] API Endpoint:', API_URL)
    console.log('[AuthAPI] Phone number:', phoneNumber)
    
    // Use test mode if enabled (for local testing only)
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

    // Clean phone number (remove + prefix and non-digits)
    let cleanPhoneNumber = (phoneNumber && phoneNumber.trim()) ? phoneNumber.trim() : ''
    if (cleanPhoneNumber.startsWith('+')) {
      cleanPhoneNumber = cleanPhoneNumber.substring(1)
    }
    cleanPhoneNumber = cleanPhoneNumber.replace(/\D/g, '')
    
    if (!cleanPhoneNumber || cleanPhoneNumber.length < 10) {
      throw new Error('phoneNumber is required and must be valid')
    }
    
    console.log('[AuthAPI] Cleaned phone number:', cleanPhoneNumber)
    console.log('[AuthAPI] Making POST request to:', API_URL)
    console.log('[AuthAPI] Request body:', { phoneNumber: cleanPhoneNumber })

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: cleanPhoneNumber }),
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[AuthAPI] Status check response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        let errorText = ''
        let errorJson: any = null
        
        try {
          errorText = await response.text()
          try {
            errorJson = JSON.parse(errorText)
          } catch {
            // Not JSON
          }
        } catch (e) {
          errorText = `Failed to read error response: ${e}`
        }

        console.error('[AuthAPI] Status check error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorJson
        })
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('[AuthAPI] Status check success:', result)
      console.log('[AuthAPI] Response status:', result.status)
      console.log('[AuthAPI] Response has token?', !!result.token)
      console.log('[AuthAPI] Response has user?', !!result.user)
      
      return result
    } catch (error) {
      console.error('[AuthAPI] Check call status error:', error)
      throw error
    }
  },

  /**
   * Get current user data
   * GET /api/v1/users/me
   * Requires authentication token in Authorization header
   */
  async getCurrentUser(): Promise<UserMeResponse> {
    const API_URL = `${API_BASE_URL}/api/v1/users/me`
    
    console.log('[AuthAPI] ===== GET CURRENT USER =====')
    console.log('[AuthAPI] API Endpoint:', API_URL)
    
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }
    
    console.log('[AuthAPI] Token found:', token ? 'yes' : 'no')
    
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[AuthAPI] Get current user response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        let errorText = ''
        let errorJson: any = null
        
        try {
          errorText = await response.text()
          try {
            errorJson = JSON.parse(errorText)
          } catch {
            // Not JSON
          }
        } catch (e) {
          errorText = `Failed to read error response: ${e}`
        }

        console.error('[AuthAPI] Get current user error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorJson
        })
        
        if (response.status === 401) {
          // Unauthorized - token is invalid or expired
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('[AuthAPI] Get current user success:', result)
      console.log('[AuthAPI] User data:', {
        id: result.id,
        telegramId: result.telegramId,
        phoneNumber: result.phoneNumber,
        firstName: result.firstName,
        lastName: result.lastName,
        username: result.username
      })
      
      return result
    } catch (error) {
      console.error('[AuthAPI] Get current user error:', error)
      throw error
    }
  },
}

