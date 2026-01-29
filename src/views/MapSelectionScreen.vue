<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { loadYandexMaps, getYandexSuggestions, geocodeYandexAddress } from '../services/yandexMaps'
import { searchAddress as nominatimSearch } from '../services/nominatimGeocoder'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'select-address', address: string, latitude?: number, longitude?: number): void
}>()

const searchQuery = ref('')
const selectedAddress = ref('')
const selectedLatitude = ref<number | null>(null)
const selectedLongitude = ref<number | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null
let isLoadingAddress = ref(false)

// Search suggestions state
const isSearching = ref(false)
const searchSuggestions = ref<Array<{ address: string; coords: [number, number] }>>([])
const showSuggestions = ref(false)
let suggestTimeout: number | null = null

onMounted(async () => {
  setTimeout(async () => {
    try {
      await loadYandexMaps()

      if (mapContainer.value && window.ymaps) {
        // Create Yandex Map
        map = new window.ymaps.Map(mapContainer.value, {
          center: [55.7558, 37.6173],
          zoom: 13,
          controls: [],
        })

        // Add click handler to map
        map.events.add('click', async (e: any) => {
          const coords = e.get('coords')
          const lat = coords[0]
          const lng = coords[1]

          // Save coordinates
          selectedLatitude.value = lat
          selectedLongitude.value = lng

          // Remove existing marker
          if (marker) {
            map.geoObjects.remove(marker)
          }

          // Add new marker at clicked location
          marker = new window.ymaps.Placemark([lat, lng])
          map.geoObjects.add(marker)

          // Get address from coordinates (reverse geocoding)
          await getAddressFromCoordinates(lat, lng)
        })
      }
    } catch (error) {
      console.error('Failed to load Yandex Maps:', error)
    }
  }, 100)
})

onBeforeUnmount(() => {
  if (suggestTimeout) {
    clearTimeout(suggestTimeout)
  }
  if (map) {
    if (marker) {
      map.geoObjects.remove(marker)
    }
    map.destroy()
    map = null
  }
  marker = null
})

// Get search suggestions using Yandex Suggest API
const getSuggestions = async () => {
  if (!searchQuery.value.trim() || searchQuery.value.length < 2) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }

  isSearching.value = true

  try {
    // Use Yandex Suggest
    const suggestions = await getYandexSuggestions(searchQuery.value, 5)

    if (suggestions.length === 0) {
      searchSuggestions.value = []
      showSuggestions.value = false
      console.log('[MapSelection] No suggestions found, user can search directly')
    } else {
      searchSuggestions.value = suggestions.map(s => ({
        address: s.address,
        coords: s.coords,
      }))
      showSuggestions.value = true
      console.log('[MapSelection] Yandex suggestions:', suggestions.length)
    }
  } catch (error) {
    console.error('[MapSelection] Failed to get Yandex suggestions, falling back to Nominatim:', error)
    // Fallback to Nominatim if Yandex fails
    try {
      const suggestions = await nominatimSearch(searchQuery.value, 5)
      if (suggestions.length > 0) {
        searchSuggestions.value = suggestions
        showSuggestions.value = true
      } else {
        searchSuggestions.value = []
        showSuggestions.value = false
      }
    } catch (nominatimError) {
      console.error('[MapSelection] Nominatim fallback also failed:', nominatimError)
      searchSuggestions.value = []
      showSuggestions.value = false
    }
  } finally {
    isSearching.value = false
  }
}

// Debounced suggestions
const getSuggestionsDebounced = () => {
  if (suggestTimeout) {
    clearTimeout(suggestTimeout)
  }

  suggestTimeout = window.setTimeout(() => {
    getSuggestions()
  }, 800)
}

// Handle input change
const handleSearchInput = () => {
  getSuggestionsDebounced()
}

// Select a suggestion
const selectSuggestion = (suggestion: { address: string; coords: [number, number] }) => {
  if (!map) return

  showSuggestions.value = false
  searchSuggestions.value = []
  searchQuery.value = suggestion.address

  map.setCenter(suggestion.coords, 15)

  // Remove existing marker
  if (marker) {
    map.geoObjects.remove(marker)
  }

  // Add marker at found location
  marker = new window.ymaps.Placemark(suggestion.coords)
  map.geoObjects.add(marker)

  selectedAddress.value = suggestion.address
  selectedLatitude.value = suggestion.coords[0]
  selectedLongitude.value = suggestion.coords[1]
}

// Close suggestions when clicking outside
const handleClickOutside = () => {
  showSuggestions.value = false
}

// Reverse geocoding using Yandex Geocoder
const getAddressFromCoordinates = async (lat: number, lng: number) => {
  isLoadingAddress.value = true
  try {
    if (!window.ymaps) {
      throw new Error('Yandex Maps not loaded')
    }

    const geocoder = await window.ymaps.geocode([lat, lng])
    const firstGeoObject = geocoder.geoObjects.get(0)

    if (firstGeoObject) {
      const address = firstGeoObject.getAddressLine()
      selectedAddress.value = address
      searchQuery.value = address
    } else {
      selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      searchQuery.value = selectedAddress.value
    }
  } catch (error) {
    console.error('Error getting address:', error)
    selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    searchQuery.value = selectedAddress.value
  } finally {
    isLoadingAddress.value = false
  }
}

// Search for address and move map
const searchAddress = async () => {
  if (!searchQuery.value.trim() || !map) return

  // If there are suggestions, use the first one
  if (searchSuggestions.value.length > 0) {
    selectSuggestion(searchSuggestions.value[0])
    return
  }

  isSearching.value = true
  showSuggestions.value = false

  try {
    // Use Yandex Geocoder
    const result = await geocodeYandexAddress(searchQuery.value)
    if (result) {
      // Move map to found location
      map.setCenter(result.coords, 15)

      // Remove existing marker
      if (marker) {
        map.geoObjects.remove(marker)
      }

      // Add marker at found location
      marker = new window.ymaps.Placemark(result.coords)
      map.geoObjects.add(marker)

      selectedAddress.value = result.address
      selectedLatitude.value = result.coords[0]
      selectedLongitude.value = result.coords[1]
      searchQuery.value = result.address
      return
    }

    // Fallback to Nominatim if Yandex fails
    const results = await nominatimSearch(searchQuery.value, 1)
    if (results.length > 0) {
      // Move map to found location
      map.setCenter(results[0].coords, 15)

      // Remove existing marker
      if (marker) {
        map.geoObjects.remove(marker)
      }

      // Add marker at found location
      marker = new window.ymaps.Placemark(results[0].coords)
      map.geoObjects.add(marker)

      selectedAddress.value = results[0].address
      selectedLatitude.value = results[0].coords[0]
      selectedLongitude.value = results[0].coords[1]
      searchQuery.value = results[0].address
    }
  } catch (error) {
    console.error('[MapSelection] Search failed:', error)
  } finally {
    isSearching.value = false
  }
}

// Handle search on Enter key
const handleSearchKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    searchAddress()
  } else if (e.key === 'Escape') {
    showSuggestions.value = false
    searchSuggestions.value = []
  }
}

// Zoom controls
const zoomIn = () => {
  if (map) {
    const currentZoom = map.getZoom()
    map.setZoom(currentZoom + 1)
  }
}

const zoomOut = () => {
  if (map) {
    const currentZoom = map.getZoom()
    map.setZoom(currentZoom - 1)
  }
}

// Get current location
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        if (map && window.ymaps) {
          map.setCenter([latitude, longitude], 15)

          if (marker) {
            map.geoObjects.remove(marker)
          }

          marker = new window.ymaps.Placemark([latitude, longitude])
          map.geoObjects.add(marker)

          selectedLatitude.value = latitude
          selectedLongitude.value = longitude
          getAddressFromCoordinates(latitude, longitude)
        }
      },
      () => {
        alert('Не удалось получить ваше местоположение')
      }
    )
  }
}

const handleSelectAddress = () => {
  if (selectedAddress.value || searchQuery.value) {
    emit('select-address', selectedAddress.value || searchQuery.value, selectedLatitude.value || undefined, selectedLongitude.value || undefined)
  }
}
</script>

<template>
  <section class="map-selection">
    <header class="map-selection__header">
      <button type="button" class="map-selection__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="#374151"/>
        </svg>
      </button>
      <div class="map-selection__search-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="map-selection__search"
          placeholder="Поиск по адресу..."
          @input="handleSearchInput"
          @keydown="handleSearchKeydown"
        />
        <svg v-if="!isSearching" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-selection__search-icon">
          <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 14L11.1 11.1" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-else class="map-selection__search-spinner"></div>

        <!-- Suggestions dropdown -->
        <div v-if="showSuggestions" class="map-selection__suggestions">
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="index"
            class="map-selection__suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-selection__suggestion-icon">
              <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 8 16 8 16C8 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10Z" fill="#9CA3AF"/>
            </svg>
            <span class="map-selection__suggestion-text">{{ suggestion.address }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Overlay to close suggestions -->
    <div v-if="showSuggestions" class="map-selection__overlay" @click="handleClickOutside"></div>

    <div class="map-selection__map-area">
      <div ref="mapContainer" class="map-selection__map-container"></div>
      
      <div class="map-selection__controls">
        <button type="button" class="map-selection__control-button" @click="zoomIn" aria-label="Увеличить">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3V13M3 8H13" stroke="#374151" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button type="button" class="map-selection__control-button" @click="zoomOut" aria-label="Уменьшить">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="#374151" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button type="button" class="map-selection__control-button" @click="getCurrentLocation" aria-label="Мое местоположение">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" stroke="#374151" stroke-width="1.5"/>
            <circle cx="8" cy="8" r="2" fill="#374151"/>
          </svg>
        </button>
      </div>
    </div>

    <footer class="map-selection__footer">
      <button 
        type="button" 
        class="map-selection__select-button" 
        @click="handleSelectAddress"
        :disabled="!selectedAddress && !searchQuery"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-selection__select-icon">
          <path d="M4 6H6V4H4V6ZM4 10H6V8H4V10ZM4 14H6V12H4V14ZM8 6H10V4H8V6ZM8 10H10V8H8V10ZM8 14H10V12H8V14ZM12 6H14V4H12V6ZM12 10H14V8H12V10ZM12 14H14V12H12V14ZM16 6H18V4H16V6ZM16 10H18V8H16V10ZM16 14H18V12H16V14Z" fill="white"/>
        </svg>
        <span>{{ isLoadingAddress ? 'Загрузка...' : 'Выбрать адрес' }}</span>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.map-selection {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  max-height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.map-selection__header {
  padding: calc(env(safe-area-inset-top) + 16px) 16px 16px;
  background-color: #f3f4f6;
  border-radius: 0 0 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
}

.map-selection__back {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.map-selection__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.map-selection__search-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.map-selection__search {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: none;
  border-radius: 12px;
  background-color: #ffffff;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: #1f2937;
}

.map-selection__search::placeholder {
  color: #9ca3af;
}

.map-selection__search:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.map-selection__search-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
}

.map-selection__search-spinner {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-top-color: #374151;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.map-selection__suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 2000;
}

.map-selection__suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.map-selection__suggestion-item:last-child {
  border-bottom: none;
}

.map-selection__suggestion-item:hover {
  background-color: #f9fafb;
}

.map-selection__suggestion-item:active {
  background-color: #f3f4f6;
}

.map-selection__suggestion-icon {
  flex-shrink: 0;
}

.map-selection__suggestion-text {
  flex: 1;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.map-selection__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1999;
}

.map-selection__map-area {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.map-selection__map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* Ensure Leaflet map tiles display correctly */
.map-selection__map-container :deep(.leaflet-container) {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: #e5e7eb;
}

.map-selection__map-container :deep(.leaflet-tile-container img) {
  max-width: none !important;
  max-height: none !important;
}

.map-selection__map-container :deep(.leaflet-pane) {
  z-index: 1;
}

.map-selection__map-container :deep(.leaflet-tile-pane) {
  z-index: 2;
}

.map-selection__map-container :deep(.leaflet-overlay-pane) {
  z-index: 3;
}

.map-selection__map-container :deep(.leaflet-marker-pane) {
  z-index: 4;
}

.map-selection__controls {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.map-selection__control-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.map-selection__control-button:hover {
  background-color: #f3f4f6;
}

.map-selection__control-button svg {
  width: 16px;
  height: 16px;
  display: block;
}

.map-selection__footer {
  padding: 16px;
  background-color: #ffffff;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 1000;
}

.map-selection__select-button {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s ease;
}

.map-selection__select-button:hover:not(:disabled) {
  opacity: 0.9;
}

.map-selection__select-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.map-selection__select-icon {
  width: 20px;
  height: 20px;
  display: block;
}

@media (min-width: 768px) {
  .map-selection__header {
    padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  }

  .map-selection__controls {
    right: 24px;
  }

  .map-selection__footer {
    padding: 24px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
}

@media (min-width: 1024px) {
  .map-selection__header {
    padding: calc(env(safe-area-inset-top) + 32px) 32px 32px;
  }

  .map-selection__controls {
    right: 32px;
  }

  .map-selection__footer {
    padding: 32px;
    padding-bottom: calc(32px + env(safe-area-inset-bottom));
  }
}
</style>
