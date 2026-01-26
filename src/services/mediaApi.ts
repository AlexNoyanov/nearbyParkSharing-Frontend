// API service for media upload

const PROD_API_BASE_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare'
// In dev, use Vite proxy to avoid backend CORS (see vite.config.ts)
const API_BASE_URL = import.meta.env.DEV ? '/parkshare' : PROD_API_BASE_URL

export interface MediaUploadResponse {
  id: string
  url: string
  fileName: string
  contentType: string
  size: number
}

export const mediaApi = {
  /**
   * Upload media file (image)
   * POST /api/v1/media/upload
   * Request: multipart/form-data with file
   * Response: MediaUploadResponse
   */
  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const API_URL = `${API_BASE_URL}/api/v1/media/upload`
    
    console.log('[MediaAPI] ===== UPLOAD MEDIA START =====')
    console.log('[MediaAPI] API Endpoint:', API_URL)
    console.log('[MediaAPI] File name:', file.name)
    console.log('[MediaAPI] File size:', file.size, 'bytes')
    console.log('[MediaAPI] File type:', file.type)
    
    // Get authentication token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      const error = new Error('Authentication token not found. Please login first.')
      console.error('[MediaAPI] ✗', error.message)
      throw error
    }
    
    console.log('[MediaAPI] Token found:', token.substring(0, 20) + '...')
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // Log FormData contents (for debugging)
    console.log('[MediaAPI] FormData created, file appended')
    console.log('[MediaAPI] FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`  ${key}:`, value)
      }
    }
    
    try {
      console.log('[MediaAPI] Sending fetch request...')
      const startTime = Date.now()
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically with boundary for multipart/form-data
        },
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      })
      
      const duration = Date.now() - startTime
      console.log(`[MediaAPI] Response received in ${duration}ms`)
      console.log('[MediaAPI] Response status:', response.status)
      console.log('[MediaAPI] Response ok:', response.ok)
      console.log('[MediaAPI] Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorBody = null
        
        try {
          const contentType = response.headers.get('content-type')
          console.log('[MediaAPI] Error response content-type:', contentType)
          
          if (contentType && contentType.includes('application/json')) {
            errorBody = await response.json()
            console.log('[MediaAPI] Error response body (JSON):', errorBody)
            errorMessage = errorBody.message || errorBody.error || errorMessage
          } else {
            const errorText = await response.text()
            console.log('[MediaAPI] Error response body (text):', errorText)
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
          console.warn('[MediaAPI] Could not read error response:', e)
        }
        
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          const error = new Error('Authentication failed. Please login again.')
          console.error('[MediaAPI] ✗', error.message)
          throw error
        }
        
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).body = errorBody
        console.error('[MediaAPI] ✗ Upload failed:', errorMessage)
        throw error
      }
      
      // Check content type before parsing
      const contentType = response.headers.get('content-type')
      console.log('[MediaAPI] Success response content-type:', contentType)
      
      let result: MediaUploadResponse
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        // Try to parse as JSON anyway
        const text = await response.text()
        console.log('[MediaAPI] Response text:', text)
        try {
          result = JSON.parse(text)
        } catch (e) {
          throw new Error(`Invalid response format. Expected JSON, got: ${contentType}`)
        }
      }
      
      console.log('[MediaAPI] ✓ Upload successful')
      console.log('[MediaAPI] Response data:', JSON.stringify(result, null, 2))
      console.log('[MediaAPI] ===== UPLOAD MEDIA END =====')
      return result
    } catch (error: any) {
      console.error('[MediaAPI] ===== UPLOAD MEDIA ERROR =====')
      console.error('[MediaAPI] Error type:', error?.constructor?.name)
      console.error('[MediaAPI] Error message:', error?.message)
      console.error('[MediaAPI] Error stack:', error?.stack)
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[MediaAPI] Network error detected')
        throw new Error('Ошибка сети. Проверьте подключение к интернету.')
      }
      
      throw error
    }
  },
  
  /**
   * Upload multiple media files
   * Uploads files sequentially to avoid overwhelming the server
   */
  async uploadMultipleMedia(files: File[]): Promise<MediaUploadResponse[]> {
    console.log('[MediaAPI] Uploading', files.length, 'files')
    const results: MediaUploadResponse[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) {
        console.warn(`[MediaAPI] File at index ${i} is undefined, skipping`)
        continue
      }
      try {
        console.log(`[MediaAPI] Uploading file ${i + 1}/${files.length}`)
        const result = await this.uploadMedia(file)
        results.push(result)
      } catch (error) {
        console.error(`[MediaAPI] Failed to upload file ${i + 1}:`, error)
        throw error
      }
    }
    
    return results
  },
}
