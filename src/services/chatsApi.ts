// API service for chats

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

// ============================================================================
// Types
// ============================================================================

export type ChatState = 'LOCKED' | 'OPEN' | 'CLOSED'

export type ChatMessageType = 'USER' | 'SYSTEM'

export interface ChatInfo {
  chatId: string
  state: ChatState
}

export interface ChatMessage {
  id: string
  senderUserId: string
  type: ChatMessageType
  text: string
  createdAt: string // ISO-8601 datetime
}

export interface PaginatedMessages {
  content: ChatMessage[]
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
  sort?: string
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
      console.log(`[ChatsAPI] ${context} error body:`, errorBody)
      errorMessage = errorBody.message || errorBody.error || errorMessage
    } else {
      const errorText = await response.text()
      console.log(`[ChatsAPI] ${context} error text:`, errorText)
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
    console.warn(`[ChatsAPI] Could not read error response:`, e)
  }

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    throw new Error('Authentication failed. Please login again.')
  }

  const error = new Error(errorMessage)
  ;(error as any).status = response.status
  ;(error as any).body = errorBody
  console.error(`[ChatsAPI] ✗ ${context} failed:`, errorMessage)
  throw error
}

// ============================================================================
// API Methods
// ============================================================================

export const chatsApi = {
  /**
   * Get chat by booking ID
   * GET /api/v1/chats/by-booking/{bookingId}
   */
  async getChatByBooking(bookingId: string): Promise<ChatInfo> {
    const API_URL = `${API_BASE_URL}/api/v1/chats/by-booking/${bookingId}`

    console.log('[ChatsAPI] ===== GET CHAT BY BOOKING =====')
    console.log('[ChatsAPI] Booking ID:', bookingId)
    console.log('[ChatsAPI] API Endpoint:', API_URL)

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

      console.log('[ChatsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get chat by booking')
      }

      const result = await response.json()
      console.log('[ChatsAPI] ✓ Chat info retrieved successfully')
      console.log('[ChatsAPI] Chat ID:', result.chatId)
      console.log('[ChatsAPI] State:', result.state)

      return result
    } catch (error) {
      console.error('[ChatsAPI] Get chat by booking error:', error)
      throw error
    }
  },

  /**
   * Get chat messages
   * GET /api/v1/chats/{chatId}/messages
   */
  async getChatMessages(
    chatId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedMessages> {
    const queryParams = new URLSearchParams()
    if (pagination?.page !== undefined) queryParams.append('page', String(pagination.page))
    if (pagination?.size !== undefined) queryParams.append('size', String(pagination.size))
    if (pagination?.sort) queryParams.append('sort', pagination.sort)

    const query = queryParams.toString()
    const API_URL = `${API_BASE_URL}/api/v1/chats/${chatId}/messages${query ? `?${query}` : ''}`

    console.log('[ChatsAPI] ===== GET CHAT MESSAGES =====')
    console.log('[ChatsAPI] Chat ID:', chatId)
    console.log('[ChatsAPI] Pagination:', pagination)
    console.log('[ChatsAPI] API Endpoint:', API_URL)

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

      console.log('[ChatsAPI] Response status:', response.status)

      if (!response.ok) {
        await handleApiError(response, 'Get chat messages')
      }

      const result = await response.json()
      console.log('[ChatsAPI] ✓ Messages retrieved successfully')
      console.log('[ChatsAPI] Total messages:', result.totalElements)
      console.log('[ChatsAPI] Page:', result.number, '/', result.totalPages)

      return result
    } catch (error) {
      console.error('[ChatsAPI] Get chat messages error:', error)
      throw error
    }
  },
}
