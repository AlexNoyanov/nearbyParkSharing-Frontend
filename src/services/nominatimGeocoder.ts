/**
 * Nominatim Geocoding Service
 *
 * Respects Nominatim usage policy:
 * - Maximum 1 request per second
 * - Valid User-Agent header
 * - Caching to avoid duplicate requests
 */

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

interface CacheEntry {
  data: NominatimResult[]
  timestamp: number
}

// Cache for search results (5 minute TTL)
const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Request queue to enforce 1 request per second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second

/**
 * Wait until at least 1 second has passed since last request
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }

  lastRequestTime = Date.now()
}

/**
 * Search for addresses using Nominatim
 */
export async function searchAddress(
  query: string,
  limit: number = 5
): Promise<Array<{ address: string; coords: [number, number] }>> {
  if (!query || query.length < 3) {
    return []
  }

  // Check cache first
  const cacheKey = `search:${query}:${limit}`
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Nominatim] Using cached result for:', query)
    return cached.data.map(item => ({
      address: item.display_name,
      coords: [parseFloat(item.lat), parseFloat(item.lon)]
    }))
  }

  try {
    // Wait for rate limit
    await waitForRateLimit()

    console.log('[Nominatim] Making API request for:', query)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&q=${encodeURIComponent(query)}&` +
      `limit=${limit}&accept-language=ru&addressdetails=1`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'NearbyParkingSharing/1.0 (Educational Project)',
          'Accept': 'application/json',
          'Accept-Language': 'ru',
        },
        mode: 'cors',
        credentials: 'omit',
      }
    )

    if (!response.ok) {
      console.error('[Nominatim] Request failed:', response.status, response.statusText)
      throw new Error(`Nominatim request failed: ${response.status}`)
    }

    const data: NominatimResult[] = await response.json()

    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data.map(item => ({
      address: item.display_name,
      coords: [parseFloat(item.lat), parseFloat(item.lon)]
    }))
  } catch (error) {
    console.error('[Nominatim] Search failed:', error)
    throw error
  }
}

/**
 * Clear old cache entries
 */
export function clearOldCache(): void {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}

// Clear old cache entries every minute
setInterval(clearOldCache, 60000)
