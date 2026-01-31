// API service for parking spots

import { getTestZaharikToken, PREVIEW_AS_ZAHARIK_KEY } from './authApi'

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
  // Optional backend flags / status fields (for archive/hide logic)
  active?: boolean // Swagger: «Активно ли объявление (снято ли с публикации)»
  status?: string
  archived?: boolean
  isArchived?: boolean
  isHidden?: boolean
}

export type RentType = 'HOURLY' | 'DAILY' | 'MONTHLY'

export interface SpotSearchItemResponse {
  id: string
  address: string
  latitude: number
  longitude: number
  price: number
  rentType: RentType
}

export interface SearchSpotsParams {
  /** Поиск по центру и радиусу (м) */
  centerLat?: number
  centerLng?: number
  radiusMeters?: number
  /** Поиск по bbox */
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
  /** Только доступные сейчас */
  availableNow?: boolean
  rentType?: RentType
  date?: string
  timeFrom?: string
  timeTo?: string
  dateFrom?: string
  dateTo?: string
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
      
      // API might return array directly or wrapped in an object (spots / data / content)
      const raw = Array.isArray(result)
        ? result
        : (result.spots ?? result.data ?? result.content ?? [])
      // Сохраняем все поля с бэка, включая active, без перезаписи
      return raw.map((s: Record<string, unknown>) => ({ ...s, active: s.active })) as MySpot[]
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
   * Поиск мест по карте (координаты + радиус или bbox).
   * GET /api/v1/spots/search с query-параметрами.
   */
  async searchSpots(params: SearchSpotsParams): Promise<SpotSearchItemResponse[]> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/search`
    const token =
      localStorage.getItem('auth_token') ??
      (localStorage.getItem(PREVIEW_AS_ZAHARIK_KEY) ? getTestZaharikToken() : null)
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }
    const q = new URLSearchParams()
    if (params.centerLat != null) q.set('centerLat', String(params.centerLat))
    if (params.centerLng != null) q.set('centerLng', String(params.centerLng))
    if (params.radiusMeters != null) q.set('radiusMeters', String(params.radiusMeters))
    if (params.minLat != null) q.set('minLat', String(params.minLat))
    if (params.maxLat != null) q.set('maxLat', String(params.maxLat))
    if (params.minLng != null) q.set('minLng', String(params.minLng))
    if (params.maxLng != null) q.set('maxLng', String(params.maxLng))
    if (params.availableNow === true) q.set('availableNow', 'true')
    if (params.rentType) q.set('rentType', params.rentType)
    if (params.date) q.set('date', params.date)
    if (params.timeFrom) q.set('timeFrom', params.timeFrom)
    if (params.timeTo) q.set('timeTo', params.timeTo)
    if (params.dateFrom) q.set('dateFrom', params.dateFrom)
    if (params.dateTo) q.set('dateTo', params.dateTo)
    const url = `${API_URL}?${q.toString()}`
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          throw new Error('Authentication failed. Please login again.')
        }
        const text = await response.text()
        let msg = text
        try {
          const j = JSON.parse(text)
          msg = j.message || j.error || text
        } catch {
          // use text
        }
        throw new Error(msg || `HTTP ${response.status}`)
      }
      const data = await response.json()
      const list = Array.isArray(data) ? data : (data.content ?? data.spots ?? data.data ?? [])
      return list.map((item: Record<string, unknown>) => ({
        id: String(item.id),
        address: String(item.address ?? ''),
        latitude: Number(item.latitude ?? item.lat),
        longitude: Number(item.longitude ?? item.lng),
        price: Number(item.price ?? item.pricePerHour ?? 0),
        rentType: (item.rentType as RentType) || 'HOURLY',
      }))
    } catch (error) {
      console.error('[SpotsAPI] searchSpots error:', error)
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
   * Снять место с публикации (архивировать).
   * POST /api/v1/spots/{id}/archive
   * Переводит место в архив (active=false). Доступно только владельцу.
   * Тело: cancelBlockingBookings=false — снять с публикации, бронирования не меняются.
   *       cancelBlockingBookings=true — отменяются предстоящие (WAITING_CONFIRMATION, WAITING_START);
   *       при активном бронировании (ACTIVE) бэкенд вернёт 409.
   * @see https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/swagger-ui/index.html#/Spots/archive
   */
  async archiveSpot(id: string, cancelBlockingBookings: boolean = false): Promise<void> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/archive`
    const requestBody = { cancelBlockingBookings }

    console.log('[SpotsAPI] ===== ARCHIVE SPOT =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] cancelBlockingBookings:', cancelBlockingBookings)
    console.log('[SpotsAPI] API Endpoint:', API_URL)
    console.log('[SpotsAPI] Request body:', JSON.stringify(requestBody))

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
        body: JSON.stringify(requestBody),
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
        if (response.status === 409) {
          throw new Error(
            errorMessage ||
              'Нельзя снять с публикации: есть активное бронирование. Дождитесь завершения или выберите «Ждать завершения бронирований».'
          )
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

  /**
   * Вернуть место из архива (опубликовать повторно).
   * POST /api/v1/spots/{id}/activate
   * Делает объявление снова активным (active=true).
   * @see https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/swagger-ui/index.html#/Spots/activate
   */
  async activateSpot(id: string): Promise<void> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/activate`

    console.log('[SpotsAPI] ===== ACTIVATE SPOT =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] API Endpoint:', API_URL)

    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)
      console.log('[SpotsAPI] Response ok:', response.ok)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
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
        console.error('[SpotsAPI] ✗ Activate spot failed:', errorMessage)
        throw error
      }
      console.log('[SpotsAPI] ✓ Spot activated successfully')
    } catch (error) {
      console.error('[SpotsAPI] Activate spot error:', error)
      throw error
    }
  },
}
