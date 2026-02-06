<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { loadYandexMaps, createParkingPlacemark, createSimpleParkingPlacemark } from '../services/yandexMaps'
import { MONTHLY_RENT_ENABLED } from '../services/rentConfig'
import parkingLotImage from '../assets/images/parkinglot.jpg'
import { spotsApi, type SpotSearchItemResponse, type RentType } from '../services/spotsApi'
import type { ParkingSpot } from '../data/parkings'
import { getYandexSuggestions, geocodeYandexAddress } from '../services/yandexMaps'
import { searchAddress as nominatimSearch } from '../services/nominatimGeocoder'

type Location = {
  id: string
  address: string
  lat: number
  lng: number
  price: string
  rentType: string
}

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-details', parking: ParkingSpot): void
  (e: 'select-location', location: Location): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const filterSheetOpen = ref(false)
const filterSheetHeight = ref(0)
const selectedPreviewLocation = ref<Location | null>(null)
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartHeight = ref(0)

// Search functionality
const searchQuery = ref('')
const isSearching = ref(false)
const searchSuggestions = ref<Array<{ address: string; coords: [number, number] }>>([])
const showSuggestions = ref(false)
let suggestTimeout: number | null = null

// Gallery state
const previewGalleryContainer = ref<HTMLElement | null>(null)
const previewPhotos = [parkingLotImage, parkingLotImage, parkingLotImage]
const previewCurrentPhotoIndex = ref(0)

const handlePreviewGalleryScroll = () => {
  if (!previewGalleryContainer.value) return
  const container = previewGalleryContainer.value
  const width = container.offsetWidth || 1
  const index = Math.round(container.scrollLeft / width)
  previewCurrentPhotoIndex.value = Math.max(0, Math.min(previewPhotos.length - 1, index))
}

// Filter state
const today = new Date()
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

// Флаг: были ли применены фильтры пользователем
const filtersApplied = ref(false)

// Дефолтные значения фильтров
const filterDate = ref(today.toISOString().split('T')[0])
const filterTimeFrom = ref('10:00')
const filterTimeTo = ref('12:00')
const filterDateFrom = ref(today.toISOString().split('T')[0])
const filterDateTo = ref(nextWeek.toISOString().split('T')[0])

const rentType = ref<RentType>('HOURLY')
const hourlyRent = ref(true)
const dailyRent = ref(false)
const monthlyRent = ref(false)

let map: any = null
let markers: any[] = []
const currentZoom = ref(13)
const zoomThreshold = 15
let loadSpotsTimeout: number | null = null

// Spots from API
const apiSpots = ref<Location[]>([])
const isLoadingSpots = ref(false)
// Загрузка карты и первоначальных мест (Яндекс.Карты API + первый запрос мест)
const isMapLoading = ref(true)

// Convert API spot to Location
const spotToLocation = (spot: SpotSearchItemResponse): Location => {
  let priceStr = `${spot.price}₽`
  if (spot.rentType === 'HOURLY') {
    priceStr = `${spot.price}₽/ч`
  } else if (spot.rentType === 'DAILY') {
    priceStr = `${spot.price}₽/день`
  } else if (spot.rentType === 'MONTHLY') {
    priceStr = `${spot.price}₽/мес`
  }

  return {
    id: spot.id,
    address: spot.address,
    lat: spot.latitude,
    lng: spot.longitude,
    price: priceStr,
    rentType: spot.rentType,
  }
}

// Get current rentType (с учётом отключения помесячной аренды)
const getCurrentRentType = (): RentType => {
  const monthlyAllowed = MONTHLY_RENT_ENABLED
  if (hourlyRent.value && !dailyRent.value && (!monthlyAllowed || !monthlyRent.value)) return 'HOURLY'
  if (monthlyAllowed && monthlyRent.value && !hourlyRent.value && !dailyRent.value) return 'MONTHLY'
  if (dailyRent.value && !hourlyRent.value && (!monthlyAllowed || !monthlyRent.value)) return 'DAILY'
  if (hourlyRent.value) return 'HOURLY'
  if (dailyRent.value) return 'DAILY'
  if (monthlyAllowed && monthlyRent.value) return 'MONTHLY'
  return 'HOURLY'
}

// Update rentType when toggles change
watch([hourlyRent, dailyRent, monthlyRent], () => {
  // Принудительно выключаем помесячную аренду, если она глобально отключена
  if (!MONTHLY_RENT_ENABLED && monthlyRent.value) {
    monthlyRent.value = false
  }
  rentType.value = getCurrentRentType()
})

// Get user location
async function getMyLocation(): Promise<{ lat: number; lng: number } | null> {
  if (!('geolocation' in navigator)) return null

  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 },
    )
  })
}

// Get search suggestions using Yandex Suggest API
const getSuggestions = async () => {
  if (!searchQuery.value.trim() || searchQuery.value.length < 2) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }

  isSearching.value = true

  try {
    // Используем Яндекс.Саджест
    const suggestions = await getYandexSuggestions(searchQuery.value, 5)
    
    // Если саджест не нашел результатов, не показываем пустой список
    // Функция getYandexSuggestions сама попробует прямое геокодирование
    if (suggestions.length === 0) {
      searchSuggestions.value = []
      showSuggestions.value = false
      console.log('[SearchScreen] No suggestions found, user can search directly')
    } else {
      searchSuggestions.value = suggestions.map(s => ({
        address: s.address,
        coords: s.coords,
      }))
      showSuggestions.value = true
      console.log('[SearchScreen] Yandex suggestions:', suggestions.length)
    }
  } catch (error) {
    console.error('[SearchScreen] Failed to get Yandex suggestions, falling back to Nominatim:', error)
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
      console.error('[SearchScreen] Nominatim fallback also failed:', nominatimError)
      searchSuggestions.value = []
      showSuggestions.value = false
    }
  } finally {
    isSearching.value = false
  }
}

// Debounced suggestions (1 second to respect Nominatim rate limits)
const getSuggestionsDebounced = () => {
  if (suggestTimeout) {
    clearTimeout(suggestTimeout)
  }

  suggestTimeout = window.setTimeout(() => {
    getSuggestions()
  }, 1000)
}

// Handle input change
const handleSearchInput = () => {
  getSuggestionsDebounced()
}

// Select a suggestion
const selectSuggestion = (suggestion: { address: string; coords: [number, number] }) => {
  console.log('[SearchScreen] selectSuggestion called:', suggestion)
  
  if (!map) {
    console.error('[SearchScreen] Map not initialized')
    return
  }

  console.log('[SearchScreen] Closing suggestions and moving map to:', suggestion.coords)
  showSuggestions.value = false
  searchSuggestions.value = []

  // Move to selected location
  map.setCenter(suggestion.coords, 15, {
    duration: 500,
  })

  // Load spots at new location after animation
  setTimeout(() => {
    loadSpotsFromApi()
    searchQuery.value = ''
  }, 600)
}

// Search for address using Nominatim (when pressing Enter)
const searchAddress = async () => {
  if (!searchQuery.value.trim() || !map) return

  // If there are suggestions, select the first one
  const firstSuggestion = searchSuggestions.value[0]
  if (firstSuggestion) {
    selectSuggestion(firstSuggestion)
    return
  }

  isSearching.value = true
  showSuggestions.value = false

  try {
    // Используем Яндекс.Геокодер
    const result = await geocodeYandexAddress(searchQuery.value)
    if (result) {
      map.setCenter(result.coords, 15, {
        duration: 500,
      })
      setTimeout(() => {
        loadSpotsFromApi()
        searchQuery.value = ''
      }, 600)
      return
    }
    
    // Fallback to Nominatim if Yandex fails
    const results = await nominatimSearch(searchQuery.value, 1)
    const firstResult = results[0]
    if (firstResult) {
      map.setCenter(firstResult.coords, 15, {
        duration: 500,
      })
      setTimeout(() => {
        loadSpotsFromApi()
        searchQuery.value = ''
      }, 600)
    }
  } catch (error) {
    console.error('[SearchScreen] Search failed:', error)
  } finally {
    isSearching.value = false
  }
}

// Handle Enter key in search
const handleSearchKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    searchAddress()
  } else if (e.key === 'Escape') {
    showSuggestions.value = false
    searchSuggestions.value = []
  }
}

// Close suggestions when clicking outside
const handleClickOutside = () => {
  showSuggestions.value = false
}

// Load spots from API (debounced)
const loadSpotsFromApiDebounced = () => {
  if (loadSpotsTimeout) {
    clearTimeout(loadSpotsTimeout)
  }

  loadSpotsTimeout = window.setTimeout(() => {
    loadSpotsFromApi()
  }, 500) // Wait 500ms after user stops moving the map
}

// Load spots from API
const loadSpotsFromApi = async () => {
  if (!map) return

  console.log('[SearchScreen] loadSpotsFromApi called')
  console.log('[SearchScreen] filtersApplied:', filtersApplied.value)

  isLoadingSpots.value = true

  try {
    const center = map.getCenter()
    const centerLat = Number(center[0].toFixed(6))
    const centerLng = Number(center[1].toFixed(6))

    // Dynamic radius based on zoom level
    const zoom = map.getZoom()
    const radiusMeters = zoom >= 15 ? 1500 : zoom >= 13 ? 3000 : zoom >= 11 ? 5000 : 10000

    console.log('[SearchScreen] Map center:', { centerLat, centerLng, radiusMeters, zoom })

    const searchParams: Parameters<typeof spotsApi.searchSpots>[0] = {
      centerLat,
      centerLng,
      radiusMeters,
    }

    // При первом открытии: только availableNow + координаты
    // После применения фильтров: rentType + даты/время
    if (!filtersApplied.value) {
      searchParams.availableNow = true
      console.log('[SearchScreen] ✓ Default mode: availableNow=true + coordinates only')
    } else {
      const currentRentType = getCurrentRentType()
      searchParams.rentType = currentRentType

      if (currentRentType === 'HOURLY') {
        searchParams.date = filterDate.value
        searchParams.timeFrom = filterTimeFrom.value
        searchParams.timeTo = filterTimeTo.value
      } else {
        searchParams.dateFrom = filterDateFrom.value
        searchParams.dateTo = filterDateTo.value
      }
      console.log('[SearchScreen] ✓ Filters mode: rentType + dates/time')
    }

    console.log('[SearchScreen] Final search params:', searchParams)

    const spots = await spotsApi.searchSpots(searchParams)

    console.log('[SearchScreen] Spots loaded:', spots.length)
    apiSpots.value = spots.map(spotToLocation)
  } catch (error) {
    console.error('[SearchScreen] Failed to load spots:', error)
    apiSpots.value = []
  } finally {
    isLoadingSpots.value = false
  }
}

const filteredLocations = computed(() => {
  return apiSpots.value
})

const getLocationPrice = (location: Location): string => {
  return location.price
}

// Get user location will use browser geolocation

// Add markers to map
const addMarkers = () => {
  if (!map || !window.ymaps) return

  // Remove existing markers
  markers.forEach(marker => {
    map.geoObjects.remove(marker)
  })
  markers = []

  // Add new markers
  filteredLocations.value.forEach((location) => {
    const createMarker = currentZoom.value >= zoomThreshold
      ? createParkingPlacemark
      : createSimpleParkingPlacemark

    const marker = createMarker(
      window.ymaps,
      location.lat,
      location.lng,
      getLocationPrice(location),
      () => {
        selectedPreviewLocation.value = location
        filterSheetOpen.value = true
        filterSheetHeight.value = 500
      }
    )

    map.geoObjects.add(marker)
    markers.push(marker)
  })
}

// Update markers on zoom
const updateMarkersOnZoom = () => {
  if (map) {
    currentZoom.value = map.getZoom()
    // Redraw markers with appropriate style for new zoom level
    addMarkers()
  }
}

watch(filteredLocations, () => {
  addMarkers()
})

// Initialize
onMounted(async () => {
  console.log('[SearchScreen] ===== MOUNTED =====')

  filtersApplied.value = false
  console.log('[SearchScreen] Initial state - filtersApplied:', filtersApplied.value)

  setTimeout(async () => {
    try {
      isMapLoading.value = true
      // Load Yandex Maps API
      await loadYandexMaps()

      if (mapContainer.value && window.ymaps) {
        const userLoc = await getMyLocation()
        const initialLat = userLoc?.lat || 55.7558
        const initialLng = userLoc?.lng || 37.6173

        // Create Yandex Map
        map = new window.ymaps.Map(mapContainer.value, {
          center: [initialLat, initialLng],
          zoom: 13,
          controls: [],
        })

        // Add zoom control
        map.controls.add('zoomControl', {
          position: { right: 10, top: 50 }
        })

        // Initial load of spots AFTER map is created
        await loadSpotsFromApi()
        // Markers will be added automatically by watch(filteredLocations)

        // Listen for map movement end (when user stops dragging/zooming)
        map.events.add('actionend', () => {
          const newZoom = map.getZoom()
          if (newZoom !== currentZoom.value) {
            currentZoom.value = newZoom
            updateMarkersOnZoom()
          }
          // Load spots when map movement ends (debounced)
          loadSpotsFromApiDebounced()
        })
      }
    } catch (error) {
      console.error('Failed to load Yandex Maps:', error)
    } finally {
      isMapLoading.value = false
    }
  }, 0)
})

onBeforeUnmount(() => {
  if (loadSpotsTimeout) {
    clearTimeout(loadSpotsTimeout)
  }
  if (suggestTimeout) {
    clearTimeout(suggestTimeout)
  }
  if (map) {
    markers.forEach(marker => {
      map.geoObjects.remove(marker)
    })
    markers = []
    map.destroy()
    map = null
  }
})

// Filter controls
const openFilters = () => {
  filterSheetOpen.value = true
  filterSheetHeight.value = 500
}

const toggleFilterSheet = () => {
  if (filterSheetHeight.value > 0) {
    filterSheetHeight.value = 0
    setTimeout(() => {
      filterSheetOpen.value = false
    }, 300)
  } else {
    filterSheetHeight.value = 500
  }
}

const handleClosePreview = () => {
  selectedPreviewLocation.value = null
}

const applyFilters = () => {
  console.log('[SearchScreen] Applying filters')
  filtersApplied.value = true
  toggleFilterSheet()
  loadSpotsFromApi()
}

const resetFilters = () => {
  console.log('[SearchScreen] Resetting filters')
  filtersApplied.value = false
  hourlyRent.value = true
  dailyRent.value = false
  monthlyRent.value = false
  filterDate.value = today.toISOString().split('T')[0]
  filterTimeFrom.value = '10:00'
  filterTimeTo.value = '12:00'
  filterDateFrom.value = today.toISOString().split('T')[0]
  filterDateTo.value = nextWeek.toISOString().split('T')[0]
  loadSpotsFromApi()
}

// Touch handling
const handleFilterTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  const t = e.touches[0]
  dragStartY.value = t?.clientY ?? 0
  dragStartHeight.value = filterSheetHeight.value
}

const handleFilterTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const t = e.touches[0]
  const deltaY = t ? dragStartY.value - t.clientY : 0
  const newHeight = Math.max(0, Math.min(window.innerHeight * 0.8, dragStartHeight.value + deltaY))
  filterSheetHeight.value = newHeight
}

const handleFilterTouchEnd = () => {
  isDragging.value = false
  if (filterSheetHeight.value < 200) {
    filterSheetHeight.value = 0
    setTimeout(() => {
      filterSheetOpen.value = false
    }, 300)
  } else {
    filterSheetHeight.value = 500
  }
}

</script>

<template>
  <section class="search-screen">
    <header class="search-screen__header">
      <button type="button" class="search-screen__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <div class="search-screen__search-container">
        <input
          v-model="searchQuery"
          type="text"
          class="search-screen__search-input"
          placeholder="Поиск адреса..."
          @input="handleSearchInput"
          @keydown="handleSearchKeydown"
        />
        <svg v-if="!isSearching" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="search-screen__search-icon">
          <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 14L11.1 11.1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-else class="search-screen__search-spinner"></div>

        <!-- Suggestions dropdown -->
        <div v-if="showSuggestions" class="search-screen__suggestions">
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="index"
            class="search-screen__suggestion-item"
            @click.stop.prevent="selectSuggestion(suggestion)"
            @mousedown.stop.prevent
            @touchstart.stop.prevent
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="search-screen__suggestion-icon">
              <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 8 16 8 16C8 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10Z" fill="#9CA3AF"/>
            </svg>
            <span class="search-screen__suggestion-text">{{ suggestion.address }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Overlay to close suggestions -->
    <div v-if="showSuggestions" class="search-screen__overlay" @click="handleClickOutside"></div>

    <div class="search-screen__map-area">
      <div ref="mapContainer" class="search-screen__map-container"></div>

      <!-- Loader: пока загружаются карта и места -->
      <div v-if="isMapLoading || isLoadingSpots" class="search-screen__loading-overlay">
        <div class="search-screen__loading">
          <div class="search-screen__spinner"></div>
          <span>{{ isMapLoading ? 'Загрузка карты...' : 'Загрузка мест...' }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Button -->
    <div v-if="!filterSheetOpen" class="search-screen__filter-button-container">
      <button type="button" class="search-screen__filter-button" @click="openFilters">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 0C16.1875 0 16.5312 0.8125 16.0312 1.28125L10.2812 7.0625V15.25C10.2812 15.875 9.59375 16.2188 9.09375 15.875L6.59375 14.125C6.375 14 6.28125 13.75 6.28125 13.5V7.0625L0.5 1.28125C0 0.8125 0.34375 0 1.03125 0H15.5Z" fill="white"/>
        </svg>
        <span>Показать фильтры</span>
      </button>
      <div class="search-screen__results-count">Найдено: {{ filteredLocations.length }}</div>
    </div>

    <!-- Filter Sheet -->
    <div
      v-if="filterSheetOpen"
      class="search-screen__filter-sheet"
      :style="{ height: filterSheetHeight + 'px' }"
    >
      <div
        class="search-screen__filter-handle"
        @click="toggleFilterSheet"
        @touchstart.stop.prevent="handleFilterTouchStart"
        @touchmove.stop.prevent="handleFilterTouchMove"
        @touchend.stop.prevent="handleFilterTouchEnd"
      >
        <div class="search-screen__handle-bar"></div>
      </div>

      <div class="search-screen__filter-content">
        <!-- Preview -->
        <div v-if="selectedPreviewLocation" class="search-screen__preview">
          <div class="search-screen__preview-header">
            <button
              type="button"
              class="search-screen__preview-close"
              @click="handleClosePreview"
            >
              ✕
            </button>
          </div>

          <div class="parking-details__gallery">
            <div
              ref="previewGalleryContainer"
              class="parking-details__main-photo-container"
              @scroll.passive="handlePreviewGalleryScroll"
            >
              <div
                v-for="(photo, index) in previewPhotos"
                :key="index"
                class="parking-details__main-photo"
              >
                <img
                  :src="photo"
                  alt="Парковочное место"
                  class="parking-details__photo-image"
                />
              </div>
            </div>
            <div class="parking-details__photo-overlay">
              <span>{{ previewCurrentPhotoIndex + 1 }} / {{ previewPhotos.length }}</span>
            </div>
          </div>

          <div class="parking-details__section">
            <h2 class="parking-details__section-title">Адрес парковки</h2>
            <div class="parking-details__address-row">
              <div class="parking-details__address-content">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 8 16 8 16C8 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10Z" fill="#9CA3AF"/>
                </svg>
                <div class="parking-details__address-text">
                  <span>{{ selectedPreviewLocation.address }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="parking-details__section parking-details__rates">
            <h3 class="parking-details__rates-title">Тариф</h3>
            <div class="parking-details__rates-list">
              <div class="parking-details__rate-item">
                <div class="parking-details__rate-price parking-details__rate-price--green">{{ selectedPreviewLocation.price }}</div>
                <div class="parking-details__rate-label">
                  {{ selectedPreviewLocation.rentType === 'HOURLY' ? 'за час' : selectedPreviewLocation.rentType === 'DAILY' ? 'за день' : 'за месяц' }}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="search-screen__preview-open-button"
            @click="emit('select-location', selectedPreviewLocation)"
          >
            Открыть
          </button>
        </div>

        <!-- Filters -->
        <template v-else>
          <div class="search-screen__filter-header">
            <h2 class="search-screen__filter-title">Фильтры поиска</h2>
            <button
              v-if="filtersApplied"
              type="button"
              class="search-screen__reset-button"
              @click="resetFilters"
            >
              Сбросить
            </button>
          </div>

          <div class="search-screen__filter-section">
            <h3 class="search-screen__filter-section-title">Когда планируете припарковаться?</h3>

            <template v-if="hourlyRent && !dailyRent && !monthlyRent">
              <div class="search-screen__date-fields">
                <div class="search-screen__date-field">
                  <label class="search-screen__date-label">Дата</label>
                  <input v-model="filterDate" type="date" class="search-screen__date-input" />
                </div>
              </div>
              <div class="search-screen__time-fields">
                <div class="search-screen__time-field">
                  <label class="search-screen__time-label">С времени</label>
                  <input v-model="filterTimeFrom" type="time" class="search-screen__time-input" />
                </div>
                <div class="search-screen__time-field">
                  <label class="search-screen__time-label">До времени</label>
                  <input v-model="filterTimeTo" type="time" class="search-screen__time-input" />
                </div>
              </div>
            </template>

            <template v-else>
              <div class="search-screen__date-fields">
                <div class="search-screen__date-field">
                  <label class="search-screen__date-label">С даты</label>
                  <input v-model="filterDateFrom" type="date" class="search-screen__date-input" />
                </div>
                <div class="search-screen__date-field">
                  <label class="search-screen__date-label">По дату</label>
                  <input v-model="filterDateTo" type="date" class="search-screen__date-input" />
                </div>
              </div>
            </template>
          </div>

          <div class="search-screen__filter-section">
            <h3 class="search-screen__filter-section-title">Тип аренды</h3>
      
            <div class="search-screen__availability-item">
              <div class="search-screen__availability-content">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7" stroke="#2563EB" stroke-width="1.5"/>
                  <path d="M10 6V10L12 12" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span>Почасовая аренда</span>
              </div>
              <label class="search-screen__toggle">
                <input type="checkbox" v-model="hourlyRent" />
                <span class="search-screen__toggle-slider"></span>
              </label>
            </div>

            <div class="search-screen__availability-item">
              <div class="search-screen__availability-content">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
                  <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span>Посуточная аренда</span>
              </div>
              <label class="search-screen__toggle">
                <input type="checkbox" v-model="dailyRent" />
                <span class="search-screen__toggle-slider"></span>
              </label>
            </div>
      
            <div
              v-if="MONTHLY_RENT_ENABLED"
              class="search-screen__availability-item"
            >
              <div class="search-screen__availability-content">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
                  <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span>Помесячная аренда</span>
              </div>
              <label class="search-screen__toggle">
                <input type="checkbox" v-model="monthlyRent" />
                <span class="search-screen__toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="search-screen__filter-apply">
            <button type="button" class="search-screen__apply-button" @click="applyFilters">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 0C16.1875 0 16.5312 0.8125 16.0312 1.28125L10.2812 7.0625V15.25C10.2812 15.875 9.59375 16.2188 9.09375 15.875L6.59375 14.125C6.375 14 6.28125 13.75 6.28125 13.5V7.0625L0.5 1.28125C0 0.8125 0.34375 0 1.03125 0H15.5Z" fill="white"/>
              </svg>
              <span>Применить фильтры</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.search-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  max-height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
  position: relative;
}

.search-screen__header {
  padding: calc(env(safe-area-inset-top) + 16px) 16px 16px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2001;
  position: relative;
}

.search-screen__back {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.search-screen__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.search-screen__search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  z-index: 2002;
}

.search-screen__search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s ease;
}

.search-screen__search-input::placeholder {
  color: #9ca3af;
}

.search-screen__search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.search-screen__search-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
  opacity: 0.7;
}

.search-screen__search-spinner {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.search-screen__suggestions {
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
  pointer-events: auto;
}

.search-screen__suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
  pointer-events: auto;
  user-select: none;
  -webkit-user-select: none;
}

.search-screen__suggestion-item:last-child {
  border-bottom: none;
}

.search-screen__suggestion-item:hover {
  background-color: #f9fafb;
}

.search-screen__suggestion-item:active {
  background-color: #f3f4f6;
}

.search-screen__suggestion-icon {
  flex-shrink: 0;
}

.search-screen__suggestion-text {
  flex: 1;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.search-screen__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1999;
  pointer-events: auto;
  /* Overlay should not block header area where suggestions are */
  background: transparent;
}

.search-screen__map-area {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.search-screen__map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.search-screen__map-container :deep(.leaflet-container) {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: #e5e7eb;
}

.search-screen__map-container :deep(.leaflet-tile-container img) {
  max-width: none !important;
  max-height: none !important;
}

.search-screen__loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.95);
}

.search-screen__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.search-screen__loading span {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.search-screen__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: search-screen-spin 0.8s linear infinite;
}

@keyframes search-screen-spin {
  to { transform: rotate(360deg); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-screen__filter-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 24px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-screen__filter-button {
  width: 100%;
  padding: 14px 20px;
  background: #2563EB;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.search-screen__filter-button:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.search-screen__filter-button svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.search-screen__results-count {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.search-screen__filter-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.search-screen__filter-handle {
  padding: 12px 0;
  display: flex;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.search-screen__handle-bar {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
}

.search-screen__filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: #ffffff;
}

.search-screen__filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-screen__filter-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.search-screen__reset-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-screen__reset-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.search-screen__preview {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.search-screen__preview-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.search-screen__preview-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-screen__preview-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.search-screen__preview-open-button {
  width: 100%;
  padding: 14px 20px;
  background: #2563EB;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s ease;
}

.search-screen__preview-open-button:hover {
  background: #1D4ED8;
}

.parking-details__gallery {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.parking-details__main-photo-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-radius: 12px;
}

.parking-details__main-photo-container::-webkit-scrollbar {
  display: none;
}

.parking-details__main-photo {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.parking-details__photo-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.parking-details__photo-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.parking-details__section {
  margin-bottom: 20px;
}

.parking-details__section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.parking-details__address-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.parking-details__address-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.parking-details__address-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.parking-details__rates {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.parking-details__rates-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.parking-details__rates-list {
  display: flex;
  gap: 12px;
}

.parking-details__rate-item {
  text-align: center;
}

.parking-details__rate-price {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.parking-details__rate-price--green {
  color: #10b981;
}

.parking-details__rate-label {
  font-size: 12px;
  color: #6b7280;
}

.search-screen__filter-section {
  margin-bottom: 24px;
}

.search-screen__filter-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.search-screen__date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.search-screen__date-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-screen__date-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.search-screen__date-input,
.search-screen__time-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  box-sizing: border-box;
}

.search-screen__time-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.search-screen__time-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-screen__time-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.search-screen__availability-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 8px;
}

.search-screen__availability-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-screen__availability-content span {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

.search-screen__toggle {
  position: relative;
  width: 44px;
  height: 24px;
  display: inline-block;
}

.search-screen__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.search-screen__toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;
}

.search-screen__toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.search-screen__toggle input:checked + .search-screen__toggle-slider {
  background-color: #2563EB;
}

.search-screen__toggle input:checked + .search-screen__toggle-slider:before {
  transform: translateX(20px);
}

.search-screen__filter-apply {
  margin-top: 24px;
}

.search-screen__apply-button {
  width: 100%;
  padding: 14px 20px;
  background: #2563EB;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.search-screen__apply-button:hover {
  background: #1D4ED8;
}

.search-screen__apply-button svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
</style>
