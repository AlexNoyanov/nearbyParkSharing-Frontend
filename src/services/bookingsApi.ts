// API service for bookings

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

// ============================================================================
// Types
// ============================================================================

export type RentType = 'HOURLY' | 'DAILY' | 'MONTHLY'

export type BookingStatus =
  | 'WAITING_CONFIRMATION'
  | 'WAITING_START'
  | 'ACTIVE'
  | 'FINISHED'
  | 'CANCELED'

export interface SpotShort {
  id: string
  address: string
  photos?: string[]
}

export interface PersonShort {
  id: string
  firstName: string
  lastName?: string
  phoneNumber?: string
}

export interface CarShort {
  id: string
  licensePlate: string
  brand?: string
  model?: string
}

export interface Booking {
  id: string
  spot: SpotShort
  owner: PersonShort
  renter: PersonShort
  car: CarShort
  rentType: RentType
  status: BookingStatus
  startAt: string // ISO-8601 datetime
  endAt: string // ISO-8601 datetime
  totalAmount: number
  createdAt: string
}

export interface BookingListItem {
  id: string
  spot: SpotShort
  car?: CarShort
  rentType: RentType
  status: BookingStatus
  startAt: string
  endAt: string
  totalAmount: number
}

export interface CreateBookingRequest {
  spotId: string
  carId: string
  rentType: RentType
  // For HOURLY
  date?: string // YYYY-MM-DD
  timeFrom?: string // HH:mm
  timeTo?: string // HH:mm
  // For DAILY/MONTHLY
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  clientTotalAmount?: number
}

export interface CancelBookingRequest {
  reason?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string // e.g., "createdAt,desc"
}

// ============================================================================
// Helper functions
// ============================================================================

function getAuthToken(): string {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token not found. Please login first.')
  }
  return token
}

async function handleApiError(response: Response, context: string): Promise<never> {
  let errorMessage = `HTTP error! status: ${response.status}`
  let errorBody = null

  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      errorBody = await response.json()
      console.log(`[BookingsAPI] ${context} error body:`, errorBody)
      errorMessage = errorBody.message || errorBody.error || errorMessage
    } else {
      const errorText = await response.text()
      console.log(`[BookingsAPI] ${context} error text:`, errorText)
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
    console.warn(`[BookingsAPI] Could not read error response:`, e)
  }

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    throw new Error('Authentication failed. Please login again.')
  }

  const error = new Error(errorMessage)
  ;(error as any).status = response.status
  ;(error as any).body = errorBody
  console.error(`[BookingsAPI] ✗ ${context} failed:`, errorMessage)
  throw error
}

// ============================================================================
// API Methods
// ============================================================================

export const bookingsApi = {
  /**
   * Create a new booking
   * POST /api/v1/bookings
   */
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const API_URL = `${API_BASE_URL}/api/v1/bookings`

    console.log('[BookingsAPI] ===== CREATE BOOKING =====')
    console.log('[BookingsAPI] API Endpoint:', API_URL)
    console.log('[BookingsAPI] Request data:', data)

    const token = getAuthToken()

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Create booking')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Booking created successfully')
      console.log('[BookingsAPI] Booking ID:', result.id)
      console.log('[BookingsAPI] Status:', result.status)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Create booking error:', error)
      throw error
    }
  },

  /**
   * Get booking by ID
   * GET /api/v1/bookings/{id}
   */
  async getBookingById(id: string): Promise<Booking> {
    const API_URL = `${API_BASE_URL}/api/v1/bookings/${id}`

    console.log('[BookingsAPI] ===== GET BOOKING =====')
    console.log('[BookingsAPI] Booking ID:', id)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get booking')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Booking retrieved successfully')

      return result
    } catch (error) {
      console.error('[BookingsAPI] Get booking error:', error)
      throw error
    }
  },

  /**
   * Get my rentals (I'm the renter)
   * GET /api/v1/bookings/my/renting
   */
  async getMyRentals(
    activeOnly: boolean = false,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<BookingListItem>> {
    const queryParams = new URLSearchParams()
    if (activeOnly) queryParams.append('activeOnly', 'true')
    if (pagination?.page !== undefined) queryParams.append('page', String(pagination.page))
    if (pagination?.size !== undefined) queryParams.append('size', String(pagination.size))
    if (pagination?.sort) queryParams.append('sort', pagination.sort)

    const query = queryParams.toString()
    const API_URL = `${API_BASE_URL}/api/v1/bookings/my/renting${query ? `?${query}` : ''}`

    console.log('[BookingsAPI] ===== GET MY RENTALS =====')
    console.log('[BookingsAPI] Active only:', activeOnly)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get my rentals')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Rentals retrieved successfully')
      console.log('[BookingsAPI] Total elements:', result.totalElements)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Get my rentals error:', error)
      throw error
    }
  },

  /**
   * Get my leases (I'm the owner)
   * GET /api/v1/bookings/my/leasing
   */
  async getMyLeases(
    activeOnly: boolean = false,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<BookingListItem>> {
    const queryParams = new URLSearchParams()
    if (activeOnly) queryParams.append('activeOnly', 'true')
    if (pagination?.page !== undefined) queryParams.append('page', String(pagination.page))
    if (pagination?.size !== undefined) queryParams.append('size', String(pagination.size))
    if (pagination?.sort) queryParams.append('sort', pagination.sort)

    const query = queryParams.toString()
    const API_URL = `${API_BASE_URL}/api/v1/bookings/my/leasing${query ? `?${query}` : ''}`

    console.log('[BookingsAPI] ===== GET MY LEASES =====')
    console.log('[BookingsAPI] Active only:', activeOnly)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get my leases')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Leases retrieved successfully')
      console.log('[BookingsAPI] Total elements:', result.totalElements)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Get my leases error:', error)
      throw error
    }
  },

  /**
   * Confirm a booking (Owner action)
   * POST /api/v1/bookings/{id}/confirm
   * Transitions: WAITING_CONFIRMATION → WAITING_START
   */
  async confirmBooking(id: string): Promise<Booking> {
    const API_URL = `${API_BASE_URL}/api/v1/bookings/${id}/confirm`

    console.log('[BookingsAPI] ===== CONFIRM BOOKING =====')
    console.log('[BookingsAPI] Booking ID:', id)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Confirm booking')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Booking confirmed successfully')
      console.log('[BookingsAPI] New status:', result.status)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Confirm booking error:', error)
      throw error
    }
  },

  /**
   * Start a booking (Renter action)
   * POST /api/v1/bookings/{id}/start
   * Transitions: WAITING_START → ACTIVE
   */
  async startBooking(id: string): Promise<Booking> {
    const API_URL = `${API_BASE_URL}/api/v1/bookings/${id}/start`

    console.log('[BookingsAPI] ===== START BOOKING =====')
    console.log('[BookingsAPI] Booking ID:', id)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Start booking')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Booking started successfully')
      console.log('[BookingsAPI] New status:', result.status)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Start booking error:', error)
      throw error
    }
  },

  /**
   * Finish a booking
   * POST /api/v1/bookings/{id}/finish
   * Transitions: ACTIVE → FINISHED
   */
  async finishBooking(id: string): Promise<Booking> {
    const API_URL = `${API_BASE_URL}/api/v1/bookings/${id}/finish`

    console.log('[BookingsAPI] ===== FINISH BOOKING =====')
    console.log('[BookingsAPI] Booking ID:', id)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Finish booking')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Booking finished successfully')
      console.log('[BookingsAPI] New status:', result.status)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Finish booking error:', error)
      throw error
    }
  },

  /**
   * Cancel a booking
   * POST /api/v1/bookings/{id}/cancel
   * Transitions: any → CANCELED
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const API_URL = `${API_BASE_URL}/api/v1/bookings/${id}/cancel`

    console.log('[BookingsAPI] ===== CANCEL BOOKING =====')
    console.log('[BookingsAPI] Booking ID:', id)
    console.log('[BookingsAPI] Reason:', reason)
    console.log('[BookingsAPI] API Endpoint:', API_URL)

    const token = getAuthToken()

    const requestBody: CancelBookingRequest = {}
    if (reason) {
      requestBody.reason = reason
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

      console.log('[BookingsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Cancel booking')
      }

      const result = await response.json()
      console.log('[BookingsAPI] ✓ Booking canceled successfully')
      console.log('[BookingsAPI] New status:', result.status)

      return result
    } catch (error) {
      console.error('[BookingsAPI] Cancel booking error:', error)
      throw error
    }
  },
}
