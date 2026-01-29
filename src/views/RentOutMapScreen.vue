<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { loadYandexMaps, createParkingPlacemark, createSimpleParkingPlacemark } from '../services/yandexMaps'
import parkingLotImage from '../assets/images/parkinglot.jpg'
import { spotsApi, type SpotSearchItemResponse } from '../services/spotsApi'
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
  (e: 'select-location', location: Location): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const filterSheetOpen = ref(false)
const filterSheetHeight = ref(0) // Start closed
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

// Gallery state for preview
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
const availableNow = ref(true)
// Используем формат YYYY-MM-DD для date input
// Default to today + 7 days
const today = new Date()
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
const fromDate = ref(today.toISOString().split('T')[0])
const toDate = ref(nextWeek.toISOString().split('T')[0])
const fromTime = ref('08:00')
const toTime = ref('22:00')
const hourlyRent = ref(false)
const dailyRent = ref(true)
const monthlyRent = ref(false)

let map: any = null
let markers: any[] = []
const currentZoom = ref(13)
const zoomThreshold = 15
let loadSpotsTimeout: number | null = null

// Spots loaded from API
const apiSpots = ref<Location[]>([])
const isLoadingSpots = ref(false)

// Convert API spot to Location format
const spotToLocation = (spot: SpotSearchItemResponse): Location => {
  // Format price based on rentType
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

// Get current rentType based on selected filter
const getCurrentRentType = (): 'HOURLY' | 'DAILY' | 'MONTHLY' => {
  console.log('[RentOutMap] getCurrentRentType called:', {
    hourlyRent: hourlyRent.value,
    dailyRent: dailyRent.value,
    monthlyRent: monthlyRent.value
  })
  if (hourlyRent.value === true) return 'HOURLY'
  if (monthlyRent.value === true) return 'MONTHLY'
  // Default to DAILY
  return 'DAILY'
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

// Load spots from API based on map bounds
const loadSpotsFromApi = async () => {
  if (!map) return

  // Check if user is logged in
  const token = localStorage.getItem('auth_token')
  if (!token) {
    console.log('[RentOutMap] No auth token, skipping spots load')
    return
  }

  const bounds = map.getBounds()
  const minLat = bounds[0][0]
  const maxLat = bounds[1][0]
  const minLng = bounds[0][1]
  const maxLng = bounds[1][1]

  // Get zoom level for logging
  const zoom = map.getZoom()

  const rentType = getCurrentRentType()
  console.log('[RentOutMap] Loading spots for bounds:', { minLat, maxLat, minLng, maxLng, rentType, zoom })
  isLoadingSpots.value = true

  try {
    // Build search params based on rentType
    const searchParams: Parameters<typeof spotsApi.searchSpots>[0] = {
      rentType,
      minLat,
      maxLat,
      minLng,
      maxLng,
    }

    // Add date/time params based on rentType
    if (rentType === 'HOURLY') {
      // For hourly: use today's date and selected times
      const today = new Date().toISOString().split('T')[0]
      searchParams.date = today
      searchParams.timeFrom = fromTime.value
      searchParams.timeTo = toTime.value
    } else {
      // For DAILY/MONTHLY: use selected date range
      searchParams.dateFrom = fromDate.value
      searchParams.dateTo = toDate.value
    }

    console.log('[RentOutMap] Search params:', searchParams)
    const spots = await spotsApi.searchSpots(searchParams)

    console.log('[RentOutMap] Spots loaded:', spots.length)
    apiSpots.value = spots.map(spotToLocation)
  } catch (error) {
    console.error('[RentOutMap] Failed to load spots:', error)
    // Keep existing spots on error
  } finally {
    isLoadingSpots.value = false
  }
}

// Filtered locations - API already returns spots filtered by rentType
const filteredLocations = computed(() => {
  return apiSpots.value
})

// Get price for location
const getLocationPrice = (location: Location): string => {
  return location.price
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
      console.log('[RentOutMap] No suggestions found, user can search directly')
    } else {
      searchSuggestions.value = suggestions.map(s => ({
        address: s.address,
        coords: s.coords,
      }))
      showSuggestions.value = true
      console.log('[RentOutMap] Yandex suggestions:', suggestions.length)
    }
  } catch (error) {
    console.error('[RentOutMap] Failed to get Yandex suggestions, falling back to Nominatim:', error)
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
      console.error('[RentOutMap] Nominatim fallback also failed:', nominatimError)
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
  console.log('[RentOutMap] Suggestion selected:', suggestion)

  if (!map) {
    console.error('[RentOutMap] Map not initialized')
    return
  }

  showSuggestions.value = false
  searchSuggestions.value = []

  console.log('[RentOutMap] Setting map center to:', suggestion.coords)
  map.setCenter(suggestion.coords, 15, {
    duration: 500,
  })

  setTimeout(() => {
    loadSpotsFromApi()
    searchQuery.value = ''
    console.log('[RentOutMap] Spots reloaded, search cleared')
  }, 600)
}

// Search for address using Yandex Geocoder
const searchAddress = async () => {
  if (!searchQuery.value.trim() || !map) return

  if (searchSuggestions.value.length > 0) {
    selectSuggestion(searchSuggestions.value[0])
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
    if (results.length > 0) {
      map.setCenter(results[0].coords, 15, {
        duration: 500,
      })
      setTimeout(() => {
        loadSpotsFromApi()
        searchQuery.value = ''
      }, 600)
    }
  } catch (error) {
    console.error('[RentOutMap] Search failed:', error)
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

// Helper to get location price

onMounted(() => {
  setTimeout(async () => {
    try {
      // Load Yandex Maps API
      await loadYandexMaps()

      if (mapContainer.value && window.ymaps) {
        // Create Yandex Map
        map = new window.ymaps.Map(mapContainer.value, {
          center: [55.7558, 37.6173],
          zoom: 13,
          controls: [],
        })

        // Add zoom control
        map.controls.add('zoomControl', {
          position: { right: 10, top: 50 }
        })

        // Add markers function
        const addMarkers = () => {
          if (!map || !window.ymaps) return

          // Remove existing markers
          markers.forEach(marker => {
            map.geoObjects.remove(marker)
          })
          markers = []

          // Add filtered location markers
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

        // Update markers when zoom changes
        const updateMarkersOnZoom = () => {
          if (map) {
            currentZoom.value = map.getZoom()
            // Redraw markers with appropriate style
            addMarkers()
          }
        }

        // Listen for map movement end (when user stops dragging/zooming)
        map.events.add('actionend', (e: any) => {
          const newZoom = map.getZoom()
          if (newZoom !== currentZoom.value) {
            currentZoom.value = newZoom
            updateMarkersOnZoom()
          }
          // Load spots when map movement ends (debounced)
          loadSpotsFromApiDebounced()
        })

        // Watch for filter changes - reload spots from API with new rentType
        watch([hourlyRent, dailyRent, monthlyRent], () => {
          if (map) {
            loadSpotsFromApi()
            // addMarkers will be called automatically by watch(apiSpots)
          }
        })

        // Watch for API spots changes and update markers automatically
        watch(apiSpots, () => {
          if (map) {
            addMarkers()
          }
        })

        // Initial load of spots
        await loadSpotsFromApi()
        // addMarkers will be called automatically by watch(apiSpots)
      }
    } catch (error) {
      console.error('Failed to load Yandex Maps:', error)
    }
  }, 100)
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

// Filter sheet drag handlers
const handleFilterTouchStart = (e: TouchEvent) => {
  if (!e.touches || e.touches.length === 0 || !e.touches[0]) return
  isDragging.value = true
  dragStartY.value = e.touches[0].clientY
  dragStartHeight.value = filterSheetHeight.value
}

const handleFilterTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !e.touches || e.touches.length === 0 || !e.touches[0]) return
  
  const deltaY = dragStartY.value - e.touches[0].clientY
  const newHeight = Math.max(200, Math.min(600, dragStartHeight.value + deltaY))
  filterSheetHeight.value = newHeight
}

const handleFilterTouchEnd = () => {
  isDragging.value = false

  // Если шторку утащили достаточно вниз — сворачиваем до конца
  if (filterSheetHeight.value < 300) {
    filterSheetOpen.value = false
    filterSheetHeight.value = 0
    selectedPreviewLocation.value = null
    return
  }

  // Если тянут почти до максимума и есть выбранное место — открываем полный предпросмотр
  if (selectedPreviewLocation.value && filterSheetHeight.value > 580) {
    emit('select-location', selectedPreviewLocation.value)
    return
  }

  // Иначе фиксируем в среднем раскрытом состоянии
  filterSheetOpen.value = true
  filterSheetHeight.value = 500
}

const handleClosePreview = () => {
  // Закрываем предпросмотр и саму шторку
  selectedPreviewLocation.value = null
  filterSheetOpen.value = false
  filterSheetHeight.value = 0
}

// Toggle filter sheet
const toggleFilterSheet = () => {
  filterSheetOpen.value = !filterSheetOpen.value
  if (filterSheetOpen.value) {
    filterSheetHeight.value = 500
  } else {
    filterSheetHeight.value = 0
  }
}

// Open filter sheet
const openFilters = () => {
  filterSheetOpen.value = true
  filterSheetHeight.value = 500
}

// Make availability filters mutually exclusive
watch(hourlyRent, (isHourly) => {
  if (isHourly) {
    dailyRent.value = false
    monthlyRent.value = false
  }
})

watch(dailyRent, (isDaily) => {
  if (isDaily) {
    hourlyRent.value = false
    monthlyRent.value = false
  }
})

watch(monthlyRent, (isMonthly) => {
  if (isMonthly) {
    hourlyRent.value = false
    dailyRent.value = false
  }
})
</script>

<template>
  <section class="rent-out-map">
    <header class="rent-out-map__header">
      <button type="button" class="rent-out-map__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <div class="rent-out-map__search-container">
        <input
          v-model="searchQuery"
          type="text"
          class="rent-out-map__search-input"
          placeholder="Поиск адреса..."
          @input="handleSearchInput"
          @keydown="handleSearchKeydown"
        />
        <svg v-if="!isSearching" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="rent-out-map__search-icon">
          <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 14L11.1 11.1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-else class="rent-out-map__search-spinner"></div>

        <!-- Suggestions dropdown -->
        <div v-if="showSuggestions" class="rent-out-map__suggestions">
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="index"
            class="rent-out-map__suggestion-item"
            @click.stop="selectSuggestion(suggestion)"
            @mousedown.stop
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="rent-out-map__suggestion-icon">
              <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 8 16 8 16C8 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10Z" fill="#9CA3AF"/>
            </svg>
            <span class="rent-out-map__suggestion-text">{{ suggestion.address }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Overlay to close suggestions -->
    <div v-if="showSuggestions" class="rent-out-map__overlay" @click="handleClickOutside"></div>

    <div class="rent-out-map__map-area">
      <div ref="mapContainer" class="rent-out-map__map-container"></div>
    </div>

    <!-- Show Filters Button -->
    <div class="rent-out-map__filter-button-container">
      <button type="button" class="rent-out-map__filter-button" @click="openFilters">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 0C16.1875 0 16.5312 0.8125 16.0312 1.28125L10.2812 7.0625V15.25C10.2812 15.875 9.59375 16.2188 9.09375 15.875L6.59375 14.125C6.375 14 6.28125 13.75 6.28125 13.5V7.0625L0.5 1.28125C0 0.8125 0.34375 0 1.03125 0H15.5Z" fill="white"/>
        </svg>
        <span>Показать фильтры</span>
      </button>
    </div>

    <!-- Pull-up Filter Sheet -->
    <div 
      v-if="filterSheetOpen"
      class="rent-out-map__filter-sheet"
      :style="{ height: filterSheetHeight + 'px' }"
    >
      <div 
        class="rent-out-map__filter-handle" 
        @click="toggleFilterSheet"
        @touchstart.stop.prevent="handleFilterTouchStart"
        @touchmove.stop.prevent="handleFilterTouchMove"
        @touchend.stop.prevent="handleFilterTouchEnd"
    >
        <div class="rent-out-map__handle-bar"></div>
      </div>
      
      <div class="rent-out-map__filter-content">
        <!-- Preview mode inside sheet -->
        <div v-if="selectedPreviewLocation" class="rent-out-map__preview">
          <div class="rent-out-map__preview-header">
            <button
              type="button"
              class="rent-out-map__preview-close"
              @click="handleClosePreview"
            >
              ✕
            </button>
          </div>
          
          <!-- Photo Gallery -->
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

          <!-- Address Section -->
          <div class="parking-details__section">
            <h2 class="parking-details__section-title">Адрес парковки</h2>
            <div class="parking-details__address-row">
              <div class="parking-details__address-content">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 8 16 8 16C8 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10Z" fill="#9CA3AF"/>
                </svg>
                <div class="parking-details__address-text">
                  <span>{{ selectedPreviewLocation.address }},</span>
                  <span>Москва</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Rates Section -->
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
            v-if="selectedPreviewLocation"
            type="button"
            class="rent-out-map__preview-open-button"
            @click="emit('select-location', selectedPreviewLocation)"
          >
            Открыть
          </button>
        </div>

        <!-- Filters content (default mode) -->
        <template v-else>
        <!-- Available Now Section -->
        <div class="rent-out-map__filter-section">
          <div class="rent-out-map__filter-row">
            <div class="rent-out-map__filter-row-content">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="rent-out-map__info-icon">
                <circle cx="8" cy="8" r="7" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M8 6V8M8 10H8.01" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="rent-out-map__filter-label">Доступно сейчас</span>
            </div>
            <label class="rent-out-map__toggle">
              <input type="checkbox" v-model="availableNow" />
              <span class="rent-out-map__toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- When do you plan to park? -->
        <div v-if="!availableNow" class="rent-out-map__filter-section">
          <h3 class="rent-out-map__filter-section-title">Когда планируете припарковаться?</h3>
          
          <!-- Для почасовой аренды - одно поле даты и время -->
          <template v-if="hourlyRent && !dailyRent && !monthlyRent">
            <div class="rent-out-map__date-fields">
              <div class="rent-out-map__date-field">
                <label class="rent-out-map__date-label">Дата</label>
                <div class="rent-out-map__date-input-wrapper">
                  <input v-model="fromDate" type="date" class="rent-out-map__date-input" />
                </div>
              </div>
            </div>
            <div class="rent-out-map__time-fields">
              <div class="rent-out-map__time-field">
                <label class="rent-out-map__time-label">С времени</label>
                <input v-model="fromTime" type="time" class="rent-out-map__time-input" />
              </div>
              <div class="rent-out-map__time-field">
                <label class="rent-out-map__time-label">До времени</label>
                <input v-model="toTime" type="time" class="rent-out-map__time-input" />
              </div>
            </div>
          </template>

          <!-- Для помесячной аренды - только даты без времени -->
          <div v-else-if="monthlyRent" class="rent-out-map__date-fields">
            <div class="rent-out-map__date-field">
              <label class="rent-out-map__date-label">С даты</label>
              <div class="rent-out-map__date-input-wrapper">
                <input v-model="fromDate" type="date" class="rent-out-map__date-input" />
              </div>
            </div>
            <div class="rent-out-map__date-field">
              <label class="rent-out-map__date-label">По дату</label>
              <div class="rent-out-map__date-input-wrapper">
                <input v-model="toDate" type="date" class="rent-out-map__date-input" />
              </div>
            </div>
          </div>

          <!-- Для других типов аренды - даты и время -->
          <template v-else>
            <div class="rent-out-map__date-fields">
              <div class="rent-out-map__date-field">
                <label class="rent-out-map__date-label">С даты</label>
                <div class="rent-out-map__date-input-wrapper">
                  <input v-model="fromDate" type="date" class="rent-out-map__date-input" />
                </div>
              </div>
              <div class="rent-out-map__date-field">
                <label class="rent-out-map__date-label">По дату</label>
                <div class="rent-out-map__date-input-wrapper">
                  <input v-model="toDate" type="date" class="rent-out-map__date-input" />
                </div>
              </div>
            </div>

            <div class="rent-out-map__time-fields">
              <div class="rent-out-map__time-field">
                <label class="rent-out-map__time-label">С времени</label>
                <input v-model="fromTime" type="time" class="rent-out-map__time-input" />
              </div>
              <div class="rent-out-map__time-field">
                <label class="rent-out-map__time-label">До времени</label>
                <input v-model="toTime" type="time" class="rent-out-map__time-input" />
              </div>
            </div>
          </template>
        </div>

        <!-- Availability Section -->
        <div class="rent-out-map__filter-section">
          <h3 class="rent-out-map__filter-section-title">Доступность</h3>
          
          <div class="rent-out-map__availability-item">
            <div class="rent-out-map__availability-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M10 6V10L12 12" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Почасовая аренда</span>
            </div>
            <label class="rent-out-map__toggle">
              <input type="checkbox" v-model="hourlyRent" />
              <span class="rent-out-map__toggle-slider"></span>
            </label>
          </div>

          <div class="rent-out-map__availability-item">
            <div class="rent-out-map__availability-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Посуточная аренда</span>
            </div>
            <label class="rent-out-map__toggle">
              <input type="checkbox" v-model="dailyRent" />
              <span class="rent-out-map__toggle-slider"></span>
            </label>
          </div>

          <div class="rent-out-map__availability-item">
            <div class="rent-out-map__availability-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Помесячная аренда</span>
            </div>
            <label class="rent-out-map__toggle">
              <input type="checkbox" v-model="monthlyRent" />
              <span class="rent-out-map__toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Apply Filters Button -->
        <div class="rent-out-map__filter-apply">
          <button type="button" class="rent-out-map__apply-button" @click="toggleFilterSheet">
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
.rent-out-map {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  max-height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
  position: relative;
}

.rent-out-map__header {
  padding: calc(env(safe-area-inset-top) + 16px) 16px 16px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
}

.rent-out-map__back {
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

.rent-out-map__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.rent-out-map__search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.rent-out-map__search-input {
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

.rent-out-map__search-input::placeholder {
  color: #9ca3af;
}

.rent-out-map__search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.rent-out-map__search-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
  opacity: 0.7;
}

.rent-out-map__search-spinner {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.rent-out-map__suggestions {
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

.rent-out-map__suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.rent-out-map__suggestion-item:last-child {
  border-bottom: none;
}

.rent-out-map__suggestion-item:hover {
  background-color: #f9fafb;
}

.rent-out-map__suggestion-item:active {
  background-color: #f3f4f6;
}

.rent-out-map__suggestion-icon {
  flex-shrink: 0;
}

.rent-out-map__suggestion-text {
  flex: 1;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.rent-out-map__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1999;
}

.rent-out-map__map-area {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.rent-out-map__map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.rent-out-map__map-container :deep(.leaflet-container) {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: #e5e7eb;
}

.rent-out-map__map-container :deep(.leaflet-tile-container img) {
  max-width: none !important;
  max-height: none !important;
}

/* Filter Button Container */
.rent-out-map__filter-button-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 24px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #e5e7eb;
}

.rent-out-map__filter-button {
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

.rent-out-map__filter-button:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.rent-out-map__filter-button:active {
  transform: translateY(0);
  background: #1E40AF;
}

.rent-out-map__filter-button svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* Filter Sheet */
.rent-out-map__filter-sheet {
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

.rent-out-map__filter-handle {
  padding: 12px 0;
  display: flex;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.rent-out-map__handle-bar {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
}

.rent-out-map__filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: #ffffff;
}

.rent-out-map__preview {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.rent-out-map__preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rent-out-map__preview-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.rent-out-map__preview-close {
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.rent-out-map__preview-card {
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rent-out-map__preview-address-main {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.rent-out-map__preview-prices {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.rent-out-map__preview-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #4b5563;
}

.rent-out-map__preview-price-value {
  font-weight: 600;
  font-size: 14px;
  color: #2563eb;
}

.rent-out-map__preview-hint {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #6b7280;
}

.rent-out-map__preview-open-button {
  width: 100%;
  margin-top: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: #2563EB;
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.rent-out-map__preview-open-button:hover {
  background: #1D4ED8;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.45);
}

.rent-out-map__preview-open-button:active {
  background: #1E40AF;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.35);
  transform: translateY(1px);
}

.rent-out-map__filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.rent-out-map__filter-section:last-child {
  margin-bottom: 0;
}

.rent-out-map__filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rent-out-map__filter-row-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rent-out-map__info-icon {
  flex-shrink: 0;
}

.rent-out-map__filter-label {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
}

.rent-out-map__filter-section-title {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.rent-out-map__date-fields,
.rent-out-map__time-fields {
  display: grid;
  grid-template-columns: auto auto;
  gap: 16px;
  margin-bottom: 16px;
}

/* Для одного поля даты (почасовая аренда) */
.rent-out-map__date-fields:has(.rent-out-map__date-field:only-child) {
  grid-template-columns: 1fr;
  max-width: 200px;
}

.rent-out-map__time-fields {
  margin-bottom: 0;
}

.rent-out-map__date-field,
.rent-out-map__time-field {
  display: grid;
  gap: 8px;
}

/* Уменьшаем ширину полей даты в фильтре */
.rent-out-map__date-field {
  width: 168px;
  min-width: 168px;
}

.rent-out-map__date-label,
.rent-out-map__time-label {
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #6b7280;
}

.rent-out-map__date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 168px;
}

.rent-out-map__date-input {
  width: 100%;
  max-width: 168px;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
}

/* Стилизация для date input на мобильных устройствах */
.rent-out-map__date-input::-webkit-calendar-picker-indicator {
  opacity: 1;
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-left: 8px;
}

.rent-out-map__date-input-wrapper svg {
  display: none; /* Скрываем SVG, так как date input имеет встроенную иконку */
}

.rent-out-map__time-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
}

.rent-out-map__availability-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.rent-out-map__availability-item:last-child {
  border-bottom: none;
}

.rent-out-map__availability-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.rent-out-map__availability-content svg {
  flex-shrink: 0;
}

.rent-out-map__toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.rent-out-map__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.rent-out-map__toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  border-radius: 24px;
  transition: 0.3s;
}

.rent-out-map__toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.rent-out-map__toggle input:checked + .rent-out-map__toggle-slider {
  background-color: #2563EB;
}

.rent-out-map__toggle input:checked + .rent-out-map__toggle-slider:before {
  transform: translateX(20px);
}

.rent-out-map__filter-apply {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.rent-out-map__apply-button {
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

.rent-out-map__apply-button:hover {
  background: #1D4ED8;
}

.rent-out-map__apply-button:active {
  background: #1E40AF;
}

.rent-out-map__apply-button svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* Preview styles - using parking-details classes */
.rent-out-map__preview .parking-details__gallery {
  margin: 0 -24px;
  position: relative;
  margin-bottom: 0;
}

.rent-out-map__preview .parking-details__main-photo-container {
  width: 100%;
  height: 192px;
  overflow-x: auto;
  display: flex;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 8px;
}

.parking-details__main-photo {
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
  scroll-snap-align: center;
  border-radius: 8px;
  overflow: hidden;
}

.parking-details__photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 16px;
  padding: 8px;
}

.parking-details__photo-overlay {
  position: absolute;
  bottom: 12px;
  right: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5px 6px;
  border-radius: 4px;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
}

.rent-out-map__preview .parking-details__section {
  margin-top: 0;
  padding: 8.5px 0;
  background: white;
  border-radius: 12px;
  padding: 8.5px 18px;
  margin-bottom: 0;
}

.parking-details__section-title {
  margin: 0 0 0px 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  line-height: 1.5;
  color: #1F2937;
}

.parking-details__address-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.parking-details__address-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.parking-details__address-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: Inter, sans-serif;
  font-size: 11.5px;
  line-height: 2.09;
  color: #4B5563;
  flex: 1;
}

.parking-details__rates {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 12px 16px 20px;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parking-details__rates-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
  text-align: center;
}

.parking-details__rates-list {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: flex-start;
}

.parking-details__rate-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
}

.parking-details__rate-price {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.2;
  color: #2563EB;
  text-align: center;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.parking-details__rate-price--green {
  color: #16A34A;
}

.parking-details__rate-price--purple {
  color: #9333EA;
}

.parking-details__rate-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #4B5563;
  text-align: center;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .rent-out-map__header {
    padding: calc(env(safe-area-inset-top) + 32px) 48px 32px;
  }

  .rent-out-map__filter-content {
    padding: 0 48px 32px;
    padding-bottom: calc(32px + env(safe-area-inset-bottom));
  }
}
</style>

