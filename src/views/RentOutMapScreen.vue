<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import parkingLotImage from '../assets/images/parkinglot.jpg'

type Location = {
  id: string
  address: string
  lat: number
  lng: number
  priceHour: string
  priceDay: string
  priceMonth: string
  availability: 'hourly' | 'daily' | 'monthly'
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
const fromDate = ref('2024-12-15')
const toDate = ref('2025-03-15')
const fromTime = ref('08:00')
const toTime = ref('22:00')
const hourlyRent = ref(false)
const dailyRent = ref(true)
const monthlyRent = ref(false)

let map: L.Map | null = null
let markers: L.Marker[] = []
const currentZoom = ref(13)
const zoomThreshold = 15 // Показывать полный значок при зуме >= 15

// Test locations with different availability types
const testLocations: Location[] = [
  { id: '1', address: 'ул. Тверская, 10', lat: 55.7558, lng: 37.6173, priceHour: '200₽/ч', priceDay: '1500₽/день', priceMonth: '35000₽/мес', availability: 'hourly' },
  { id: '2', address: 'Красная площадь, 1', lat: 55.7539, lng: 37.6208, priceHour: '150₽/ч', priceDay: '1200₽/день', priceMonth: '30000₽/мес', availability: 'daily' },
  { id: '3', address: 'ул. Арбат, 20', lat: 55.7520, lng: 37.5925, priceHour: '180₽/ч', priceDay: '1400₽/день', priceMonth: '32000₽/мес', availability: 'hourly' },
  { id: '4', address: 'Ленинградский проспект, 15', lat: 55.7776, lng: 37.5856, priceHour: '120₽/ч', priceDay: '1000₽/день', priceMonth: '28000₽/мес', availability: 'monthly' },
  { id: '5', address: 'ул. Новый Арбат, 25', lat: 55.7525, lng: 37.5920, priceHour: '250₽/ч', priceDay: '1800₽/день', priceMonth: '40000₽/мес', availability: 'daily' },
]

// Computed filtered locations based on availability filter
const filteredLocations = computed(() => {
  if (hourlyRent.value) {
    return testLocations.filter(loc => loc.availability === 'hourly')
  } else if (dailyRent.value) {
    return testLocations.filter(loc => loc.availability === 'daily')
  } else if (monthlyRent.value) {
    return testLocations.filter(loc => loc.availability === 'monthly')
  }
  return testLocations // Show all if none selected
})

// Get price for location based on selected availability
const getLocationPrice = (location: Location): string => {
  if (hourlyRent.value) {
    return location.priceHour
  } else if (dailyRent.value) {
    return location.priceDay
  } else if (monthlyRent.value) {
    return location.priceMonth
  }
  return location.priceHour // Default to hourly
}

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icon for parking locations - full version
const createFullParkingIcon = (price: string) => {
  return L.divIcon({
    className: 'parking-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 60px;
      ">
        <!-- Price tag -->
        <div style="
          background: #2563EB;
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-family: Inter, sans-serif;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          margin-bottom: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${price}
        </div>
        <!-- Green pin with P logo -->
        <div style="
          position: relative;
          width: 48px;
          height: 65px;
        ">
          <!-- Green pin shape -->
          <svg width="48" height="65" viewBox="0 0 48 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0;">
            <path d="M21.5 62.75C3.25 36.5 0 33.75 0 24C0 10.75 10.625 0 24 0C37.25 0 48 10.75 48 24C48 33.75 44.625 36.5 26.375 62.75C25.25 64.5 22.625 64.5 21.5 62.75ZM24 34C29.5 34 34 29.625 34 24C34 18.5 29.5 14 24 14C18.375 14 14 18.5 14 24C14 29.625 18.375 34 24 34Z" fill="#10B981"/>
          </svg>
          <!-- White circle with P inside -->
          <div style="
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 30px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          ">
            <!-- P logo -->
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M-0.000195298 6.14003H0.499805V1.64003H-0.000195298V2.87294e-05H4.3898C5.2498 2.87294e-05 5.90647 0.186695 6.3598 0.560029C6.81314 0.926695 7.03981 1.52336 7.03981 2.35003C7.03981 3.1767 6.81314 3.7767 6.3598 4.15003C5.90647 4.5167 5.2498 4.70003 4.3898 4.70003H3.2998V6.14003H4.2598V7.78003H-0.000195298V6.14003ZM3.6398 3.28003C4.02647 3.28003 4.21981 3.0667 4.21981 2.64003V2.28003C4.21981 2.06003 4.1698 1.90003 4.0698 1.80003C3.97647 1.69336 3.83314 1.64003 3.6398 1.64003H3.2998V3.28003H3.6398Z" fill="#10B981"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [60, 75],
    iconAnchor: [30, 75],
  })
}

// Simplified marker icon - circle with P and price above
const createSimpleParkingIcon = (price: string) => {
  return L.divIcon({
    className: 'parking-marker-simple',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 50px;
      ">
        <!-- Price tag -->
        <div style="
          background: #2563EB;
          color: white;
          padding: 3px 6px;
          border-radius: 6px;
          font-family: Inter, sans-serif;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          margin-bottom: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">
          ${price}
        </div>
        <!-- Green circle with P inside -->
        <div style="
          width: 32px;
          height: 32px;
          background: #10B981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        ">
          <!-- P logo -->
          <svg width="14" height="14" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <path d="M-0.000195298 6.14003H0.499805V1.64003H-0.000195298V2.87294e-05H4.3898C5.2498 2.87294e-05 5.90647 0.186695 6.3598 0.560029C6.81314 0.926695 7.03981 1.52336 7.03981 2.35003C7.03981 3.1767 6.81314 3.7767 6.3598 4.15003C5.90647 4.5167 5.2498 4.70003 4.3898 4.70003H3.2998V6.14003H4.2598V7.78003H-0.000195298V6.14003ZM3.6398 3.28003C4.02647 3.28003 4.21981 3.0667 4.21981 2.64003V2.28003C4.21981 2.06003 4.1698 1.90003 4.0698 1.80003C3.97647 1.69336 3.83314 1.64003 3.6398 1.64003H3.2998V3.28003H3.6398Z" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  })
}

// Get appropriate icon based on zoom level
const getParkingIcon = (price: string) => {
  return currentZoom.value >= zoomThreshold 
    ? createFullParkingIcon(price)
    : createSimpleParkingIcon(price)
}

onMounted(() => {
  setTimeout(() => {
    if (mapContainer.value) {
      // Initialize map centered on Moscow
      map = L.map(mapContainer.value, {
        zoomControl: false,
        attributionControl: false,
      }).setView([55.7558, 37.6173], 13)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19,
      }).addTo(map)

      // Invalidate map size
      setTimeout(() => {
        map?.invalidateSize()
      }, 100)

      // Add markers function
      const addMarkers = () => {
        // Remove existing markers
        markers.forEach(marker => {
          map?.removeLayer(marker)
        })
        markers = []

        // Add filtered location markers
        filteredLocations.value.forEach((location) => {
          const marker = L.marker([location.lat, location.lng], {
            icon: getParkingIcon(getLocationPrice(location)),
          }).addTo(map!)

          marker.on('click', () => {
            // Открываем предпросмотр в шторке вместо перехода на полный экран
            selectedPreviewLocation.value = location
            filterSheetOpen.value = true
            filterSheetHeight.value = 500
          })

          markers.push(marker)
        })
      }

      // Update markers when zoom changes
      const updateMarkersOnZoom = () => {
        if (map) {
          currentZoom.value = map.getZoom()
          filteredLocations.value.forEach((location, index) => {
            if (markers[index]) {
              markers[index].setIcon(getParkingIcon(getLocationPrice(location)))
            }
          })
        }
      }

      // Initial markers
      addMarkers()

      // Watch for zoom changes
      if (map) {
        map.on('zoomend', updateMarkersOnZoom)
        map.on('zoom', updateMarkersOnZoom)
      }

      // Watch for filter changes and update markers
      watch([hourlyRent, dailyRent, monthlyRent], () => {
        if (map) {
          addMarkers()
        }
      })
    }
  }, 100)
})

onBeforeUnmount(() => {
  if (map) {
    map.off('zoomend')
    map.off('zoom')
    map.remove()
    map = null
  }
  markers = []
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
      <h1 class="rent-out-map__title">Выберите место на карте</h1>
      <div class="rent-out-map__header-spacer"></div>
    </header>

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
            <h3 class="parking-details__rates-title">Тарифы</h3>
            <div class="parking-details__rates-list">
              <div class="parking-details__rate-item">
                <div class="parking-details__rate-price">{{ selectedPreviewLocation.priceHour.replace('₽/ч', '').trim() }} ₽</div>
                <div class="parking-details__rate-label">за час</div>
              </div>
              <div class="parking-details__rate-item">
                <div class="parking-details__rate-price parking-details__rate-price--green">{{ selectedPreviewLocation.priceDay.replace('₽/день', '').trim() }} ₽</div>
                <div class="parking-details__rate-label">за день</div>
              </div>
              <div class="parking-details__rate-item">
                <div class="parking-details__rate-price parking-details__rate-price--purple">{{ selectedPreviewLocation.priceMonth.replace('₽/мес', '').trim() }} ₽</div>
                <div class="parking-details__rate-label">за месяц</div>
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
  padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

.rent-out-map__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  flex: 1;
}

.rent-out-map__header-spacer {
  width: 40px;
  flex-shrink: 0;
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

