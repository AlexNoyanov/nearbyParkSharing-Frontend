// API service for user cars/vehicles

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

// ============================================================================
// Types
// ============================================================================

export interface Car {
  id: string
  licensePlate: string
  brand: string
  model?: string
  color?: string
}

export interface CreateCarRequest {
  licensePlate: string // Pattern: ^[А-Яа-яA-Z0-9\s]+$
  brand: string
  model?: string
  color?: string
}

export interface UpdateCarRequest {
  licensePlate: string
  brand: string
  model?: string
  color?: string
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
      console.log(`[CarsAPI] ${context} error body:`, errorBody)
      errorMessage = errorBody.message || errorBody.error || errorMessage
    } else {
      const errorText = await response.text()
      console.log(`[CarsAPI] ${context} error text:`, errorText)
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
    console.warn(`[CarsAPI] Could not read error response:`, e)
  }

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    throw new Error('Authentication failed. Please login again.')
  }

  const error = new Error(errorMessage)
  ;(error as any).status = response.status
  ;(error as any).body = errorBody
  console.error(`[CarsAPI] ✗ ${context} failed:`, errorMessage)
  throw error
}

// ============================================================================
// API Methods
// ============================================================================

export const carsApi = {
  /**
   * Get user's cars
   * GET /api/v1/cars
   */
  async getMyCars(): Promise<Car[]> {
    const API_URL = `${API_BASE_URL}/api/v1/cars`

    console.log('[CarsAPI] ===== GET MY CARS =====')
    console.log('[CarsAPI] API Endpoint:', API_URL)

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

      console.log('[CarsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get my cars')
      }

      const result = await response.json()
      console.log('[CarsAPI] ✓ Cars retrieved successfully')
      console.log('[CarsAPI] Cars count:', Array.isArray(result) ? result.length : 'not an array')

      return Array.isArray(result) ? result : (result.data || result.cars || [])
    } catch (error) {
      console.error('[CarsAPI] Get my cars error:', error)
      throw error
    }
  },

  /**
   * Create a new car
   * POST /api/v1/cars
   */
  async createCar(data: CreateCarRequest): Promise<Car> {
    const API_URL = `${API_BASE_URL}/api/v1/cars`

    console.log('[CarsAPI] ===== CREATE CAR =====')
    console.log('[CarsAPI] API Endpoint:', API_URL)
    console.log('[CarsAPI] Request data:', data)

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

      console.log('[CarsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Create car')
      }

      const result = await response.json()
      console.log('[CarsAPI] ✓ Car created successfully')
      console.log('[CarsAPI] Created car:', result)

      return result
    } catch (error) {
      console.error('[CarsAPI] Create car error:', error)
      throw error
    }
  },

  /**
   * Update a car
   * PUT /api/v1/cars/{id}
   */
  async updateCar(id: string, data: UpdateCarRequest): Promise<Car> {
    const API_URL = `${API_BASE_URL}/api/v1/cars/${id}`

    console.log('[CarsAPI] ===== UPDATE CAR =====')
    console.log('[CarsAPI] Car ID:', id)
    console.log('[CarsAPI] API Endpoint:', API_URL)
    console.log('[CarsAPI] Request data:', data)

    const token = getAuthToken()

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

      console.log('[CarsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Update car')
      }

      const result = await response.json()
      console.log('[CarsAPI] ✓ Car updated successfully')

      return result
    } catch (error) {
      console.error('[CarsAPI] Update car error:', error)
      throw error
    }
  },

  /**
   * Delete a car
   * DELETE /api/v1/cars/{id}
   */
  async deleteCar(id: string): Promise<void> {
    const API_URL = `${API_BASE_URL}/api/v1/cars/${id}`

    console.log('[CarsAPI] ===== DELETE CAR =====')
    console.log('[CarsAPI] Car ID:', id)
    console.log('[CarsAPI] API Endpoint:', API_URL)

    const token = getAuthToken()

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      })

      console.log('[CarsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Delete car')
      }

      console.log('[CarsAPI] ✓ Car deleted successfully')
    } catch (error) {
      console.error('[CarsAPI] Delete car error:', error)
      throw error
    }
  },
}
