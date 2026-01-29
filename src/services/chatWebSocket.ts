// WebSocket service for real-time chat messaging using STOMP over SockJS

import SockJS from 'sockjs-client'
import { Client, type Message, type StompSubscription } from '@stomp/stompjs'

// ============================================================================
// Types
// ============================================================================

export interface WebSocketMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  type: 'TEXT' | 'SYSTEM'
  text: string
  createdAt: string // ISO-8601 datetime
}

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type MessageHandler = (message: WebSocketMessage) => void
export type StatusChangeHandler = (status: WebSocketStatus) => void
export type ErrorHandler = (error: Error) => void

// ============================================================================
// WebSocket Service
// ============================================================================

class ChatWebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private status: WebSocketStatus = 'disconnected'
  private statusHandlers: Set<StatusChangeHandler> = new Set()
  private errorHandlers: Set<ErrorHandler> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication token not found. Please login first.')
    }
    return token
  }

  /**
   * Get WebSocket URL based on environment
   * Note: SockJS handles URL conversion automatically, so we use HTTP/HTTPS URLs
   */
  private getWebSocketUrl(): string {
    const PROD_WS_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/ws'
    const DEV_WS_URL = 'http://localhost:8082/parkshare/ws'
    
    if (import.meta.env.DEV) {
      return DEV_WS_URL
    }
    return PROD_WS_URL
  }

  /**
   * Initialize WebSocket connection
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client && this.status === 'connected') {
        console.log('[ChatWebSocket] Already connected')
        resolve()
        return
      }

      if (this.status === 'connecting') {
        console.log('[ChatWebSocket] Connection already in progress')
        reject(new Error('Connection already in progress'))
        return
      }

      try {
        const token = this.getAuthToken()
        const wsUrl = this.getWebSocketUrl()

        console.log('[ChatWebSocket] ===== CONNECTING =====')
        console.log('[ChatWebSocket] WebSocket URL:', wsUrl)

        this.setStatus('connecting')

        // Create SockJS connection
        const socket = new SockJS(wsUrl)
        
        // Create STOMP client
        this.client = new Client({
          webSocketFactory: () => socket as any,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            if (import.meta.env.DEV) {
              console.log('[ChatWebSocket] STOMP:', str)
            }
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: (frame) => {
            console.log('[ChatWebSocket] ✓ Connected successfully')
            console.log('[ChatWebSocket] Frame:', frame)
            this.setStatus('connected')
            this.reconnectAttempts = 0
            resolve()
          },
          onStompError: (frame) => {
            console.error('[ChatWebSocket] ✗ STOMP error:', frame)
            this.setStatus('error')
            const error = new Error(frame.headers['message'] || 'STOMP connection error')
            this.notifyError(error)
            reject(error)
          },
          onWebSocketError: (event) => {
            console.error('[ChatWebSocket] ✗ WebSocket error:', event)
            this.setStatus('error')
            const error = new Error('WebSocket connection error')
            this.notifyError(error)
            reject(error)
          },
          onDisconnect: () => {
            console.log('[ChatWebSocket] Disconnected')
            this.setStatus('disconnected')
            this.subscriptions.clear()
            
            // Attempt to reconnect if not manually disconnected
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++
              console.log(`[ChatWebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
              setTimeout(() => {
                if (this.status !== 'disconnected') {
                  this.connect().catch(console.error)
                }
              }, this.reconnectDelay)
            } else {
              console.error('[ChatWebSocket] Max reconnection attempts reached')
            }
          },
        })

        // Activate the client
        this.client.activate()
      } catch (error) {
        console.error('[ChatWebSocket] Connection error:', error)
        this.setStatus('error')
        reject(error)
      }
    })
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    console.log('[ChatWebSocket] ===== DISCONNECTING =====')
    
    // Unsubscribe from all chats
    this.subscriptions.forEach((subscription, chatId) => {
      try {
        subscription.unsubscribe()
        console.log(`[ChatWebSocket] Unsubscribed from chat ${chatId}`)
      } catch (error) {
        console.warn(`[ChatWebSocket] Error unsubscribing from chat ${chatId}:`, error)
      }
    })
    this.subscriptions.clear()

    // Deactivate client
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }

    this.setStatus('disconnected')
    this.reconnectAttempts = 0
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToChat(chatId: string, onMessage: MessageHandler): void {
    if (!this.client || this.status !== 'connected') {
      throw new Error('WebSocket is not connected. Call connect() first.')
    }

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(chatId)) {
      console.log(`[ChatWebSocket] Already subscribed to chat ${chatId}, unsubscribing first`)
      this.unsubscribeFromChat(chatId)
    }

    const destination = `/user/queue/chat.${chatId}`
    console.log(`[ChatWebSocket] ===== SUBSCRIBING TO CHAT =====`)
    console.log(`[ChatWebSocket] Chat ID: ${chatId}`)
    console.log(`[ChatWebSocket] Destination: ${destination}`)

    try {
      const subscription = this.client.subscribe(destination, (message: Message) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body)
          console.log(`[ChatWebSocket] ✓ Message received for chat ${chatId}:`, data)
          onMessage(data)
        } catch (error) {
          console.error(`[ChatWebSocket] Error parsing message for chat ${chatId}:`, error)
          console.error(`[ChatWebSocket] Raw message body:`, message.body)
        }
      })

      this.subscriptions.set(chatId, subscription)
      console.log(`[ChatWebSocket] ✓ Subscribed to chat ${chatId}`)
    } catch (error) {
      console.error(`[ChatWebSocket] ✗ Failed to subscribe to chat ${chatId}:`, error)
      throw error
    }
  }

  /**
   * Unsubscribe from chat messages
   */
  unsubscribeFromChat(chatId: string): void {
    const subscription = this.subscriptions.get(chatId)
    if (subscription) {
      try {
        subscription.unsubscribe()
        this.subscriptions.delete(chatId)
        console.log(`[ChatWebSocket] ✓ Unsubscribed from chat ${chatId}`)
      } catch (error) {
        console.error(`[ChatWebSocket] ✗ Error unsubscribing from chat ${chatId}:`, error)
      }
    }
  }

  /**
   * Send message via WebSocket
   */
  sendMessage(chatId: string, text: string): void {
    if (!this.client || this.status !== 'connected') {
      throw new Error('WebSocket is not connected. Call connect() first.')
    }

    const destination = `/app/chat.${chatId}`
    const payload = JSON.stringify({ text })

    console.log(`[ChatWebSocket] ===== SENDING MESSAGE =====`)
    console.log(`[ChatWebSocket] Chat ID: ${chatId}`)
    console.log(`[ChatWebSocket] Destination: ${destination}`)
    console.log(`[ChatWebSocket] Payload:`, payload)

    try {
      this.client.publish({
        destination,
        body: payload,
      })
      console.log(`[ChatWebSocket] ✓ Message sent to chat ${chatId}`)
    } catch (error) {
      console.error(`[ChatWebSocket] ✗ Failed to send message to chat ${chatId}:`, error)
      throw error
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler)
    // Immediately call with current status
    handler(this.status)
    
    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  /**
   * Subscribe to errors
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)
    
    // Return unsubscribe function
    return () => {
      this.errorHandlers.delete(handler)
    }
  }

  /**
   * Set status and notify handlers
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status
      this.statusHandlers.forEach(handler => {
        try {
          handler(status)
        } catch (error) {
          console.error('[ChatWebSocket] Error in status handler:', error)
        }
      })
    }
  }

  /**
   * Notify error handlers
   */
  private notifyError(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (err) {
        console.error('[ChatWebSocket] Error in error handler:', err)
      }
    })
  }
}

// Export singleton instance
export const chatWebSocket = new ChatWebSocketService()
