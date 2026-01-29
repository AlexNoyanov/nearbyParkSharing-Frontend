// API service for parking spots

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
// In dev, use Vite proxy to avoid backend CORS (see vite.config.ts)
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

// ============================================================================
// Types
// ============================================================================

// Frontend uses SCHEDULED, Backend uses CUSTOM
export type FrontendScheduleType = 'ALWAYS' | 'SCHEDULED'
export type BackendScheduleType = 'ALWAYS' | 'CUSTOM'

export type VehicleType = 'CAR' | 'SUV' | 'VAN' | 'TRUCK' | 'MOTORCYCLE'

export type RentType = 'HOURLY' | 'DAILY' | 'MONTHLY'

export interface CreateSpotRequest {
  address: string
  latitude: number
  longitude: number
  vehicleType: VehicleType
  pricePerHour?: number
  pricePerDay?: number
  pricePerMonth?: number
  scheduleType: FrontendScheduleType
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
  vehicleType: VehicleType
  pricePerHour?: number
  pricePerDay?: number
  pricePerMonth?: number
  scheduleType: FrontendScheduleType
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

export interface MySpot {
  id: string
  address: string
  latitude: number
  longitude: number
  vehicleType: VehicleType
  pricePerHour?: number
  pricePerDay?: number
  pricePerMonth?: number
  scheduleType: FrontendScheduleType
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
  status?: string
  archived?: boolean
  isArchived?: boolean
  isHidden?: boolean
}

export interface SpotSearchRequest {
  rentType: RentType // Required
  // For HOURLY
  date?: string // YYYY-MM-DD
  timeFrom?: string // HH:mm
  timeTo?: string // HH:mm
  // For DAILY/MONTHLY
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  // Geo: bounding box
  minLat?: number
  minLng?: number
  maxLat?: number
  maxLng?: number
  // Geo: radius search
  centerLat?: number
  centerLng?: number
  radiusMeters?: number
}

export interface SpotSearchItem {
  id: string
  address: string
  latitude: number
  longitude: number
  rentType: RentType
  price: number
  photos?: string[]
}

export interface ArchivePreviewResponse {
  spotId: string
  activeCount: number
  upcomingCount: number
  active: SpotBookingItem[]
  upcoming: SpotBookingItem[]
}

export interface SpotBookingItem {
  id: string
  renterName?: string
  startAt: string
  endAt: string
  status: string
}

// ============================================================================
// Schedule Type Mapping (Frontend ↔ Backend)
// ============================================================================

function toBackendScheduleType(frontendType: FrontendScheduleType): BackendScheduleType {
  return frontendType === 'SCHEDULED' ? 'CUSTOM' : frontendType
}

function toFrontendScheduleType(backendType: BackendScheduleType | string): FrontendScheduleType {
  return backendType === 'CUSTOM' ? 'SCHEDULED' : (backendType as FrontendScheduleType)
}

function mapSpotToBackend(data: CreateSpotRequest): Record<string, unknown> {
  return {
    ...data,
    scheduleType: toBackendScheduleType(data.scheduleType),
  }
}

function mapSpotFromBackend<T extends { scheduleType?: string }>(data: T): T & { scheduleType: FrontendScheduleType } {
  return {
    ...data,
    scheduleType: toFrontendScheduleType(data.scheduleType || 'ALWAYS'),
  }
}

// ============================================================================
// Helper: Handle API errors
// ============================================================================

async function handleApiError(response: Response, context: string): Promise<never> {
  let errorMessage = `HTTP error! status: ${response.status}`
  let errorBody = null

  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      errorBody = await response.json()
      console.log(`[SpotsAPI] ${context} error body:`, errorBody)
      errorMessage = errorBody.message || errorBody.error || errorMessage
    } else {
      const errorText = await response.text()
      console.log(`[SpotsAPI] ${context} error text:`, errorText)
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
    console.warn(`[SpotsAPI] Could not read error response:`, e)
  }

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    throw new Error('Authentication failed. Please login again.')
  }

  const error = new Error(errorMessage)
  ;(error as any).status = response.status
  ;(error as any).body = errorBody
  console.error(`[SpotsAPI] ✗ ${context} failed:`, errorMessage)
  throw error
}

function getAuthToken(): string {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token not found. Please login first.')
  }
  return token
}

// ============================================================================
// API Methods
// ============================================================================

export const spotsApi = {
  /**
   * Get user's parking spots
   * GET /api/v1/spots/my
   */
  async getMySpots(): Promise<MySpot[]> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/my`

    console.log('[SpotsAPI] ===== GET MY SPOTS =====')
    console.log('[SpotsAPI] API Endpoint:', API_URL)

    const token = getAuthToken()

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

      if (!response.ok) {
        await handleApiError(response, 'Get my spots')
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ My spots retrieved successfully')
      console.log('[SpotsAPI] Spots count:', Array.isArray(result) ? result.length : 'not an array')

      // API might return array directly or wrapped in an object
      const spots = Array.isArray(result) ? result : (result.spots || result.data || [])

      // Map scheduleType from backend to frontend
      return spots.map((spot: any) => mapSpotFromBackend(spot))
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

    const token = getAuthToken()

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

      if (!response.ok) {
        await handleApiError(response, 'Get spot by ID')
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ Spot retrieved successfully')

      // Map scheduleType from backend to frontend
      return mapSpotFromBackend(result)
    } catch (error) {
      console.error('[SpotsAPI] Get spot by ID error:', error)
      throw error
    }
  },

  /**
   * Search parking spots
   * GET /api/v1/spots/search
   */
  async searchSpots(params: SpotSearchRequest): Promise<SpotSearchItem[]> {
    const queryParams = new URLSearchParams()

    // rentType is required
    queryParams.append('rentType', params.rentType)

    // Time params based on rentType
    if (params.rentType === 'HOURLY') {
      if (params.date) queryParams.append('date', params.date)
      if (params.timeFrom) queryParams.append('timeFrom', params.timeFrom)
      if (params.timeTo) queryParams.append('timeTo', params.timeTo)
    } else {
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params.dateTo) queryParams.append('dateTo', params.dateTo)
    }

    // Geo: bounding box
    if (params.minLat !== undefined) queryParams.append('minLat', String(params.minLat))
    if (params.minLng !== undefined) queryParams.append('minLng', String(params.minLng))
    if (params.maxLat !== undefined) queryParams.append('maxLat', String(params.maxLat))
    if (params.maxLng !== undefined) queryParams.append('maxLng', String(params.maxLng))

    // Geo: radius
    if (params.centerLat !== undefined) queryParams.append('centerLat', String(params.centerLat))
    if (params.centerLng !== undefined) queryParams.append('centerLng', String(params.centerLng))
    if (params.radiusMeters !== undefined) queryParams.append('radiusMeters', String(params.radiusMeters))

    const API_URL = `${API_BASE_URL}/api/v1/spots/search?${queryParams.toString()}`

    console.log('[SpotsAPI] ===== SEARCH SPOTS =====')
    console.log('[SpotsAPI] API Endpoint:', API_URL)
    console.log('[SpotsAPI] Search params:', params)

    const token = getAuthToken()

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Search spots')
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ Search completed successfully')
      console.log('[SpotsAPI] Results count:', Array.isArray(result) ? result.length : 'not an array')

      return Array.isArray(result) ? result : (result.content || result.data || [])
    } catch (error) {
      console.error('[SpotsAPI] Search spots error:', error)
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

    const token = getAuthToken()

    // Map scheduleType to backend format
    const backendData = mapSpotToBackend(data)
    console.log('[SpotsAPI] Request data (mapped):', JSON.stringify(backendData, null, 2))

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Create spot')
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ Spot created successfully')

      // Map scheduleType back to frontend format
      return mapSpotFromBackend(result)
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

    const token = getAuthToken()

    // Map scheduleType to backend format
    const backendData = mapSpotToBackend(data)
    console.log('[SpotsAPI] Request data (mapped):', JSON.stringify(backendData, null, 2))

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Update spot')
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ Spot updated successfully')

      // Map scheduleType back to frontend format
      return mapSpotFromBackend(result)
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
   * @param cancelBlockingBookings - If true, cancel blocking bookings; if false, wait for them to complete
   * @param cancelReason - Optional reason for cancellation
   */
  async archiveSpot(id: string, cancelBlockingBookings: boolean = false, cancelReason?: string): Promise<void> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/archive`

    console.log('[SpotsAPI] ===== ARCHIVE SPOT =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] Cancel blocking bookings:', cancelBlockingBookings)
    console.log('[SpotsAPI] Cancel reason:', cancelReason)
    console.log('[SpotsAPI] API Endpoint:', API_URL)

    const token = getAuthToken()

    // Build request body according to Swagger spec
    const requestBody: { cancelBlockingBookings?: boolean; cancelReason?: string } = {}
    if (cancelBlockingBookings) {
      requestBody.cancelBlockingBookings = true
    }
    if (cancelReason) {
      requestBody.cancelReason = cancelReason
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Archive spot')
      }

      console.log('[SpotsAPI] ✓ Spot archived successfully')
    } catch (error) {
      console.error('[SpotsAPI] Archive spot error:', error)
      throw error
    }
  },

  /**
   * Activate (restore from archive) a parking spot
   * POST /api/v1/spots/{id}/activate
   *
   * @param id - Spot ID to activate
   */
  async activateSpot(id: string): Promise<void> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/activate`

    console.log('[SpotsAPI] ===== ACTIVATE SPOT =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] API Endpoint:', API_URL)

    const token = getAuthToken()

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

      if (!response.ok) {
        await handleApiError(response, 'Activate spot')
      }

      console.log('[SpotsAPI] ✓ Spot activated successfully')
    } catch (error) {
      console.error('[SpotsAPI] Activate spot error:', error)
      throw error
    }
  },

  /**
   * Get archive preview - shows bookings that would be affected
   * GET /api/v1/spots/{id}/archive/preview
   *
   * @param id - Spot ID to preview archive impact
   */
  async getArchivePreview(id: string): Promise<ArchivePreviewResponse> {
    const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/archive/preview`

    console.log('[SpotsAPI] ===== GET ARCHIVE PREVIEW =====')
    console.log('[SpotsAPI] Spot ID:', id)
    console.log('[SpotsAPI] API Endpoint:', API_URL)

    const token = getAuthToken()

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[SpotsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get archive preview')
      }

      const result = await response.json()
      console.log('[SpotsAPI] ✓ Archive preview retrieved successfully')
      console.log('[SpotsAPI] Active bookings:', result.activeCount)
      console.log('[SpotsAPI] Upcoming bookings:', result.upcomingCount)

      return result
    } catch (error) {
      console.error('[SpotsAPI] Get archive preview error:', error)
      throw error
    }
  },
}
