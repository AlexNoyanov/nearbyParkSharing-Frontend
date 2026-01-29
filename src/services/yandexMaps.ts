/**
 * Yandex Maps API loader and helper functions
 */

const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY || 'e0077d51-2fd9-4ff0-bb5d-4a80560041ae'
const YANDEX_MAPS_VERSION = '2.1'
const YANDEX_SUGGEST_API_KEY = import.meta.env.VITE_YANDEX_SUGGEST_API_KEY || YANDEX_MAPS_API_KEY

let isLoaded = false
let loadPromise: Promise<void> | null = null

/**
 * Load Yandex Maps API script
 */
export async function loadYandexMaps(): Promise<void> {
  if (isLoaded) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.ymaps) {
      isLoaded = true
      resolve()
      return
    }

    const script = document.createElement('script')
    // Use API with key and suggest_apikey for Suggest API support
    let apiUrl = ''
    if (YANDEX_MAPS_API_KEY) {
      // Include suggest_apikey parameter for Suggest API support
      apiUrl = `https://api-maps.yandex.ru/${YANDEX_MAPS_VERSION}/?apikey=${YANDEX_MAPS_API_KEY}&suggest_apikey=${YANDEX_SUGGEST_API_KEY}&lang=ru_RU`
    } else {
      apiUrl = `https://api-maps.yandex.ru/${YANDEX_MAPS_VERSION}/?lang=ru_RU`
    }
    script.src = apiUrl
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => {
          isLoaded = true
          resolve()
        })
      } else {
        reject(new Error('Yandex Maps failed to load'))
      }
    }

    script.onerror = () => {
      reject(new Error('Failed to load Yandex Maps script'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * Create custom placemark for parking spot
 */
export function createParkingPlacemark(
  ymaps: any,
  lat: number,
  lng: number,
  price: string,
  onClick?: () => void
): any {
  const placemark = new ymaps.Placemark(
    [lat, lng],
    {},
    {
      iconLayout: 'default#imageWithContent',
      iconImageHref: '',
      iconImageSize: [60, 75],
      iconImageOffset: [-30, -75],
      iconContentOffset: [0, 0],
      iconContentLayout: ymaps.templateLayoutFactory.createClass(
        `<div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 60px;">
          <div style="background: #2563EB; color: white; padding: 4px 8px; border-radius: 8px; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${price}
          </div>
          <div style="position: relative; width: 48px; height: 65px;">
            <svg width="48" height="65" viewBox="0 0 48 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0;">
              <path d="M21.5 62.75C3.25 36.5 0 33.75 0 24C0 10.75 10.625 0 24 0C37.25 0 48 10.75 48 24C48 33.75 44.625 36.5 26.375 62.75C25.25 64.5 22.625 64.5 21.5 62.75ZM24 34C29.5 34 34 29.625 34 24C34 18.5 29.5 14 24 14C18.375 14 14 18.5 14 24C14 29.625 18.375 34 24 34Z" fill="#10B981"/>
            </svg>
            <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 20px; height: 30px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10;">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                <path d="M-0.000195298 6.14003H0.499805V1.64003H-0.000195298V2.87294e-05H4.3898C5.2498 2.87294e-05 5.90647 0.186695 6.3598 0.560029C6.81314 0.926695 7.03981 1.52336 7.03981 2.35003C7.03981 3.1767 6.81314 3.7767 6.3598 4.15003C5.90647 4.5167 5.2498 4.70003 4.3898 4.70003H3.2998V6.14003H4.2598V7.78003H-0.000195298V6.14003ZM3.6398 3.28003C4.02647 3.28003 4.21981 3.0667 4.21981 2.64003V2.28003C4.21981 2.06003 4.1698 1.90003 4.0698 1.80003C3.97647 1.69336 3.83314 1.64003 3.6398 1.64003H3.2998V3.28003H3.6398Z" fill="#10B981"/>
              </svg>
            </div>
          </div>
        </div>`
      ),
    }
  )

  if (onClick) {
    placemark.events.add('click', onClick)
  }

  return placemark
}

/**
 * Create simple circle placemark for zoomed out view
 */
export function createSimpleParkingPlacemark(
  ymaps: any,
  lat: number,
  lng: number,
  price: string,
  onClick?: () => void
): any {
  const placemark = new ymaps.Placemark(
    [lat, lng],
    {},
    {
      iconLayout: 'default#imageWithContent',
      iconImageHref: '',
      iconImageSize: [50, 50],
      iconImageOffset: [-25, -50],
      iconContentOffset: [0, 0],
      iconContentLayout: ymaps.templateLayoutFactory.createClass(
        `<div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 50px;">
          <div style="background: #2563EB; color: white; padding: 3px 6px; border-radius: 6px; font-family: Inter, sans-serif; font-size: 10px; font-weight: 600; white-space: nowrap; margin-bottom: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            ${price}
          </div>
          <div style="width: 32px; height: 32px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid white;">
            <svg width="14" height="14" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M-0.000195298 6.14003H0.499805V1.64003H-0.000195298V2.87294e-05H4.3898C5.2498 2.87294e-05 5.90647 0.186695 6.3598 0.560029C6.81314 0.926695 7.03981 1.52336 7.03981 2.35003C7.03981 3.1767 6.81314 3.7767 6.3598 4.15003C5.90647 4.5167 5.2498 4.70003 4.3898 4.70003H3.2998V6.14003H4.2598V7.78003H-0.000195298V6.14003ZM3.6398 3.28003C4.02647 3.28003 4.21981 3.0667 4.21981 2.64003V2.28003C4.21981 2.06003 4.1698 1.90003 4.0698 1.80003C3.97647 1.69336 3.83314 1.64003 3.6398 1.64003H3.2998V3.28003H3.6398Z" fill="white"/>
            </svg>
          </div>
        </div>`
      ),
    }
  )

  if (onClick) {
    placemark.events.add('click', onClick)
  }

  return placemark
}

/**
 * Yandex Suggest API for address autocomplete
 * Uses Yandex Maps JS API SuggestView (no CORS issues)
 */
export interface YandexSuggestResult {
  address: string
  coords: [number, number] // [lat, lng]
  displayName: string
}

/**
 * Get address suggestions using Yandex Maps JS API suggest method
 * This uses the JS API which doesn't have CORS restrictions
 */
export async function getYandexSuggestions(
  query: string,
  limit: number = 5
): Promise<YandexSuggestResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    // Ensure Yandex Maps is loaded
    if (!window.ymaps) {
      await loadYandexMaps()
    }

    if (!window.ymaps) {
      throw new Error('Yandex Maps not loaded')
    }

    console.log('[YandexSuggest] Requesting suggestions for:', query)
    
    // Use Yandex Maps JS API suggest method (no CORS issues)
    const items = await window.ymaps.suggest(query, {
      results: limit,
      boundedBy: undefined, // No bounds restriction
    })

    console.log('[YandexSuggest] Response:', items)

    // Parse Yandex Maps JS API suggest response
    // Format: [{ displayName: string, value: string }]
    if (!items || !Array.isArray(items) || items.length === 0) {
      // Если саджест не нашел результатов, ищем напрямую по тексту через геокодирование
      console.log('[YandexSuggest] No suggestions found, trying direct geocoding for:', query)
      try {
        const geocoded = await geocodeYandexAddress(query)
        if (geocoded) {
          console.log('[YandexSuggest] Direct geocoding found:', geocoded.address)
          return [{
            address: geocoded.address,
            coords: geocoded.coords,
            displayName: geocoded.address,
          }]
        }
      } catch (geocodeError) {
        console.warn('[YandexSuggest] Direct geocoding failed:', geocodeError)
      }
      // Если и геокодирование не помогло, возвращаем пустой массив
      return []
    }

    const suggestions: YandexSuggestResult[] = []
    
    // Geocode each suggestion to get coordinates
    const geocodePromises = items.slice(0, limit).map(async (item: any) => {
      try {
        const address = item.displayName || item.value || ''
        if (!address) return null

        // Geocode the address to get coordinates
        const geocoded = await geocodeYandexAddress(address)
        if (geocoded) {
          return {
            address: geocoded.address,
            coords: geocoded.coords,
            displayName: item.displayName || geocoded.address,
          }
        }
      } catch (geocodeError) {
        console.warn('[YandexSuggest] Failed to geocode address:', item, geocodeError)
      }
      return null
    })
    
    const results = await Promise.all(geocodePromises)
    for (const result of results) {
      if (result) {
        suggestions.push(result)
      }
    }

    console.log('[YandexSuggest] Parsed suggestions:', suggestions.length)
    return suggestions
  } catch (error) {
    console.error('[YandexSuggest] Search failed:', error)
    throw error
  }
}

/**
 * Geocode address using Yandex Maps Geocoder
 */
export async function geocodeYandexAddress(
  address: string
): Promise<{ address: string; coords: [number, number] } | null> {
  if (!window.ymaps) {
    await loadYandexMaps()
  }

  if (!window.ymaps) {
    throw new Error('Yandex Maps not loaded')
  }

  try {
    const geocoder = await window.ymaps.geocode(address)
    const firstGeoObject = geocoder.geoObjects.get(0)

    if (firstGeoObject) {
      const coords = firstGeoObject.geometry.getCoordinates()
      // Yandex returns [lat, lng]
      const lat = coords[0]
      const lng = coords[1]
      const addressLine = firstGeoObject.getAddressLine()

      return {
        address: addressLine,
        coords: [lat, lng],
      }
    }

    return null
  } catch (error) {
    console.error('[YandexGeocoder] Geocoding failed:', error)
    throw error
  }
}

// Type declarations for Yandex Maps
declare global {
  interface Window {
    ymaps: any
  }
}
