// API service for parking spots

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
// In dev, use Vite proxy to avoid backend CORS (see vite.config.ts)
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

export interface CreateSpotRequest {
  address: string
  latitude: number
  longitude: number
  vehicleType: 'CAR' | 'VAN' | 'TRUCK'
  pricePerHour?: number
  pricePerDay?: number
  pricePerMonth?: number
  scheduleType: 'ALWAYS' | 'SCHEDULED'
  availableFrom?: string // HH:mm format
  availableTo?: string // HH:mm format
  availableDays?: number[] // 1-7 (Monday-Sunday)
  covered?: boolean
  hasSecurity?: boolean
  hasEvCharging?: boolean
  openSpace?: boolean
  inYard?: boolean
  privateTerritory?: boolean
  hasCctv?: boolean
  description?: string
  accessGuide?: string
  photos?: string[] // Array of photo URLs
  hourlyEnabled: boolean
  dailyEnabled: boolean
  monthlyEnabled: boolean
  availableDateFrom?: string // YYYY-MM-DD format
  availableDateTo?: string // YYYY-MM-DD format
}

export interface CreateSpotResponse {
  id: string
  address: string
  latitude: number
  longitude: number
  // ... other fields from API response
}

export interface MySpot {
  id: string
  address: string
  latitude: number
  longitude: number
  vehicleType: 'CAR' | 'VAN' | 'TRUCK'
  pricePerHour?: number
  pricePerDay?: number
  pricePerMonth?: number
  scheduleType: 'ALWAYS' | 'SCHEDULED'
  availableFrom?: string
  availableTo?: string
  availableDays?: number[]
  covered?: boolean
  hasSecurity?: boolean
  hasEvCharging?: boolean
  openSpace?: boolean
  inYard?: boolean
  privateTerritory?: boolean
  hasCctv?: boolean
  description?: string
  accessGuide?: string
  photos?: string[]
  hourlyEnabled: boolean
  dailyEnabled: boolean
  monthlyEnabled: boolean
  availableDateFrom?: string
  availableDateTo?: string
  createdAt?: string
  updatedAt?: string
}

export const spotsApi = {
  /**
   * Get user's parking spots
   * GET /api/v1/spots/my
   */
  async getMySpots(): Promise<MySpot[]> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/my`
    
    console.log('[SpotsAPI] ===== GET MY SPOTS =====')
    console.log('[SpotsAPI] API Endpoint:', API_URL)
    
    // Get authentication token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }
    
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
      
      console.log('[SpotsAPI] Response status:', response.status)
      console.log('[SpotsAPI] Response ok:', response.ok)
      
      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null
        
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            console.log('[SpotsAPI] Error response body:', errorBody)
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
            console.log('[SpotsAPI] Error response text:', errorText)
            if (errorText) {
              try {
                errorBody = JSON.parse(errorText)
                errorMessage = errorBody.message || errorBody.error || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
            }
          }
        } catch (e) {
          console.warn('[SpotsAPI] Could not read error response:', e)
        }
        
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }
        
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).body = errorBody
        console.error('[SpotsAPI] ✗ Get my spots failed:', errorMessage)
        throw error
      }
      
      const result = await response.json()
      console.log('[SpotsAPI] ✓ My spots retrieved successfully')
      console.log('[SpotsAPI] Spots count:', Array.isArray(result) ? result.length : 'not an array')
      console.log('[SpotsAPI] Response:', result)
      
      // API might return array directly or wrapped in an object
      const spots = Array.isArray(result) ? result : (result.spots || result.data || [])
      return spots
    } catch (error) {
      console.error('[SpotsAPI] Get my spots error:', error)
      throw error
    }
  },

  /**
   * Get a parking spot by ID
   * GET /api/v1/spots/{id}
   */
  async getSpotById(id: string): Promise<MySpot> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}`
    
    console.log('[SpotsAPI] ===== GET SPOT BY ID =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] API Endpoint:', API_URL)
    
    // Get authentication token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }
    
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
      
      console.log('[SpotsAPI] Response status:', response.status)
      console.log('[SpotsAPI] Response ok:', response.ok)
      
      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null
        
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            console.log('[SpotsAPI] Error response body:', errorBody)
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
            console.log('[SpotsAPI] Error response text:', errorText)
            if (errorText) {
              try {
                errorBody = JSON.parse(errorText)
                errorMessage = errorBody.message || errorBody.error || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
            }
          }
        } catch (e) {
          console.warn('[SpotsAPI] Could not read error response:', e)
        }
        
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }
        
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).body = errorBody
        console.error('[SpotsAPI] ✗ Get spot by ID failed:', errorMessage)
        throw error
      }
      
      const result = await response.json()
      console.log('[SpotsAPI] ✓ Spot retrieved successfully')
      console.log('[SpotsAPI] Response:', result)
      return result
    } catch (error) {
      console.error('[SpotsAPI] Get spot by ID error:', error)
      throw error
    }
  },

  /**
   * Create a new parking spot
   * POST /api/v1/spots
   */
  async createSpot(data: CreateSpotRequest): Promise<CreateSpotResponse> {
    const API_URL = `${API_BASE_URL}/api/v1/spots`
    
    console.log('[SpotsAPI] ===== CREATE SPOT =====')
    console.log('[SpotsAPI] API Endpoint:', API_URL)
    console.log('[SpotsAPI] Request data:', JSON.stringify(data, null, 2))
    
    // Get authentication token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit',
      })
      
      console.log('[SpotsAPI] Response status:', response.status)
      console.log('[SpotsAPI] Response ok:', response.ok)
      
      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null
        
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            console.log('[SpotsAPI] Error response body:', errorBody)
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
            console.log('[SpotsAPI] Error response text:', errorText)
            if (errorText) {
              try {
                errorBody = JSON.parse(errorText)
                errorMessage = errorBody.message || errorBody.error || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
            }
          }
        } catch (e) {
          console.warn('[SpotsAPI] Could not read error response:', e)
        }
        
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }
        
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).body = errorBody
        console.error('[SpotsAPI] ✗ Create spot failed:', errorMessage)
        throw error
      }
      
      const result = await response.json()
      console.log('[SpotsAPI] ✓ Spot created successfully')
      console.log('[SpotsAPI] Response:', result)
      return result
    } catch (error) {
      console.error('[SpotsAPI] Create spot error:', error)
      throw error
    }
  },

  /**
   * Update an existing parking spot
   * PUT /api/v1/spots/{id}
   */
  async updateSpot(id: string, data: CreateSpotRequest): Promise<CreateSpotResponse> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}`

    console.log('[SpotsAPI] ===== UPDATE SPOT =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] API Endpoint:', API_URL)
    console.log('[SpotsAPI] Request data:', JSON.stringify(data, null, 2))

    // Get authentication token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)
      console.log('[SpotsAPI] Response ok:', response.ok)

      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null

        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            console.log('[SpotsAPI] Error response body:', errorBody)
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
            console.log('[SpotsAPI] Error response text:', errorText)
            if (errorText) {
              try {
                errorBody = JSON.parse(errorText)
                errorMessage = errorBody.message || errorBody.error || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
            }
          }
        } catch (e) {
          console.warn('[SpotsAPI] Could not read error response:', e)
        }

        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }

        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).body = errorBody
        console.error('[SpotsAPI] ✗ Update spot failed:', errorMessage)
        throw error
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ Spot updated successfully')
      console.log('[SpotsAPI] Response:', result)
      return result
    } catch (error) {
      console.error('[SpotsAPI] Update spot error:', error)
      throw error
    }
  },

  /**
   * Archive (unpublish) a parking spot
   * POST /api/v1/spots/{id}/archive
   *
   * @param id - Spot ID to archive
   * @param cancelUpcomingBookings - If true, cancel upcoming bookings; if false, wait for them to complete
   */
  async archiveSpot(id: string, cancelUpcomingBookings: boolean = false): Promise<void> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/archive`

    console.log('[SpotsAPI] ===== ARCHIVE SPOT =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] Cancel upcoming bookings:', cancelUpcomingBookings)
    console.log('[SpotsAPI] API Endpoint:', API_URL)

    // Get authentication token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cancelUpcomingBookings }),
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)
      console.log('[SpotsAPI] Response ok:', response.ok)

      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null

        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            console.log('[SpotsAPI] Error response body:', errorBody)
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
            console.log('[SpotsAPI] Error response text:', errorText)
            if (errorText) {
              try {
                errorBody = JSON.parse(errorText)
                errorMessage = errorBody.message || errorBody.error || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
            }
          }
        } catch (e) {
          console.warn('[SpotsAPI] Could not read error response:', e)
        }

        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }

        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).body = errorBody
        console.error('[SpotsAPI] ✗ Archive spot failed:', errorMessage)
        throw error
      }

      console.log('[SpotsAPI] ✓ Spot archived successfully')
    } catch (error) {
      console.error('[SpotsAPI] Archive spot error:', error)
      throw error
    }
  },
}
