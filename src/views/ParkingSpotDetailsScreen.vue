<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
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

const props = defineProps<{
  location: Location
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'select-dates'): void
  (e: 'open-full-map'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const galleryContainer = ref<HTMLElement | null>(null)

const photos = [parkingLotImage, parkingLotImage, parkingLotImage]
const currentPhotoIndex = ref(0)
let map: L.Map | null = null

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Create custom marker icon with white location pin inside a circle
const createLocationIcon = () => {
  const svgIcon = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="22" fill="#EF4444"/>
    <g transform="translate(16.5, 14.5)">
      <path d="M4.70312 13.7266C0.710938 7.98438 0 7.38281 0 5.25C0 2.35156 2.32422 0 5.25 0C8.14844 0 10.5 2.35156 10.5 5.25C10.5 7.38281 9.76172 7.98438 5.76953 13.7266C5.52344 14.1094 4.94922 14.1094 4.70312 13.7266ZM5.25 7.4375C6.45312 7.4375 7.4375 6.48047 7.4375 5.25C7.4375 4.04688 6.45312 3.0625 5.25 3.0625C4.01953 3.0625 3.0625 4.04688 3.0625 5.25C3.0625 6.48047 4.01953 7.4375 5.25 7.4375Z" fill="white"/>
    </g>
  </svg>`
  
  // Encode SVG for data URL
  const encodedSvg = encodeURIComponent(svgIcon)
  const iconUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`
  
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  })
}

onMounted(() => {
  setTimeout(() => {
    if (mapContainer.value) {
      // Initialize map centered on location coordinates
      map = L.map(mapContainer.value, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
      }).setView([props.location.lat, props.location.lng], 15)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19,
      }).addTo(map)

      // Add marker at location
      const locationIcon = createLocationIcon()
      L.marker([props.location.lat, props.location.lng], {
        icon: locationIcon,
      }).addTo(map)

      // Invalidate map size to ensure proper rendering
      setTimeout(() => {
        map?.invalidateSize()
      }, 100)
    }
  }, 100)
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const copyAddress = () => {
  navigator.clipboard.writeText(props.location.address)
}

const handleGalleryScroll = () => {
  if (!galleryContainer.value) return
  const container = galleryContainer.value
  const width = container.offsetWidth || 1
  const index = Math.round(container.scrollLeft / width)
  currentPhotoIndex.value = Math.max(0, Math.min(photos.length - 1, index))
}
</script>

<template>
  <section class="parking-details">
    <!-- Header -->
    <header class="parking-details__header">
      <button type="button" class="parking-details__back" @click="emit('back')" aria-label="Назад">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 11.375L8.1875 12C7.875 12.3125 7.40625 12.3125 7.125 12L1.3125 6.125C1 5.8125 1 5.34375 1.3125 5.0625L7.125 -0.8125C7.40625 -1.125 7.90625 -1.125 8.1875 -0.8125L8.75 -0.1875C9.0625 0.125 9.03125 0.59375 8.75 0.90625L4.84375 4.625H13.3438C13.75 4.625 14.0938 4.96875 14.0938 5.375V6.375C14.0938 6.8125 13.75 7.125 13.3438 7.125H4.84375L8.75 10.8438C9.03125 11.1562 9.0625 11.625 8.75 11.375Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="parking-details__title">Детали парковки</h1>
      <div class="parking-details__header-spacer"></div>
    </header>

    <div class="parking-details__content">
      <!-- Gallery -->
      <div class="parking-details__gallery">
        <div
          ref="galleryContainer"
          class="parking-details__main-photo-container"
          @scroll.passive="handleGalleryScroll"
        >
          <div
            v-for="(photo, index) in photos"
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
          <span>{{ currentPhotoIndex + 1 }} / {{ photos.length }}</span>
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
              <span>{{ location.address }},</span>
              <span>Москва</span>
            </div>
          </div>
          <button type="button" class="parking-details__copy-button" @click="copyAddress">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.33333 0H2.33333C1.6 0 1 0.6 1 1.33333V9.33333H2.33333V1.33333H9.33333V0ZM11.6667 2.66667H4.66667C3.93333 2.66667 3.33333 3.26667 3.33333 4V12C3.33333 12.7333 3.93333 13.3333 4.66667 13.3333H11.6667C12.4 13.3333 13 12.7333 13 12V4C13 3.26667 12.4 2.66667 11.6667 2.66667ZM11.6667 12H4.66667V4H11.6667V12Z" fill="#4B5563"/>
            </svg>
            <span>Копировать</span>
          </button>
        </div>
      </div>

      <!-- Rates Section -->
      <div class="parking-details__section parking-details__rates">
        <h3 class="parking-details__rates-title">Тарифы</h3>
        <div class="parking-details__rates-list">
          <div class="parking-details__rate-item">
            <div class="parking-details__rate-price">{{ location.priceHour.replace('₽/ч', '').trim() }} ₽</div>
            <div class="parking-details__rate-label">за час</div>
          </div>
          <div class="parking-details__rate-item">
            <div class="parking-details__rate-price parking-details__rate-price--green">{{ location.priceDay.replace('₽/день', '').trim() }} ₽</div>
            <div class="parking-details__rate-label">за день</div>
          </div>
          <div class="parking-details__rate-item">
            <div class="parking-details__rate-price parking-details__rate-price--purple">{{ location.priceMonth.replace('₽/мес', '').trim() }} ₽</div>
            <div class="parking-details__rate-label">за месяц</div>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div v-if="false" class="parking-details__section parking-details__description-section">
        <h3 class="parking-details__description-title">Описание</h3>
        <p class="parking-details__description">
          Удобное парковочное место рядом с главным входом в ТЦ "Галерея". Место хорошо освещено, есть охрана. Въезд с ул. Тверская, место №15 во втором ряду от входа. Ориентир - красная колонна.
        </p>
      </div>

      <!-- Features Section -->
      <div v-if="false" class="parking-details__section">
        <h3 class="parking-details__section-title">Особенности</h3>
        <div class="parking-details__features">
          <div class="parking-details__feature">
            <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.0625 2.59375C14.625 2.84375 15 3.375 15 3.96875C15 10.9062 10.75 14.75 8.0625 15.875C7.6875 16.0312 7.28125 16.0312 6.90625 15.875C3.5625 14.4688 0 10.1875 0 3.96875C0 3.375 0.34375 2.84375 0.90625 2.59375L6.90625 0.09375C7.09375 0.03125 7.28125 0 7.5 0C7.6875 0 7.875 0.03125 8.0625 0.09375L14.0625 2.59375ZM7.5 13.9375C10.4062 12.4688 12.875 9.03125 12.9688 4.3125L7.5 2.03125V13.9375Z" fill="#16A34A"/>
            </svg>
            <span>Охрана</span>
          </div>
          <div class="parking-details__feature">
            <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.3125 5C9.875 5 10.25 5.65625 9.9375 6.125L4.4375 15.625C4.3125 15.875 4.0625 16 3.78125 16C3.3125 16 2.96875 15.5625 3.0625 15.0938L4.5 9H0.8125C0.34375 9 0 8.625 0.0625 8.15625L1.0625 0.65625C1.09375 0.28125 1.4375 0 1.8125 0H6.3125C6.78125 0 7.15625 0.46875 7.03125 0.96875L5.6875 5H9.3125Z" fill="#CA8A04"/>
            </svg>
            <span>Электрозарядка</span>
          </div>
          <div class="parking-details__feature">
            <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.3125 5C9.875 5 10.25 5.65625 9.9375 6.125L4.4375 15.625C4.3125 15.875 4.0625 16 3.78125 16C3.3125 16 2.96875 15.5625 3.0625 15.0938L4.5 9H0.8125C0.34375 9 0 8.625 0.0625 8.15625L1.0625 0.65625C1.09375 0.28125 1.4375 0 1.8125 0H6.3125C6.78125 0 7.15625 0.46875 7.03125 0.96875L5.6875 5H9.3125Z" fill="#2563EB"/>
            </svg>
            <span>Крытая парковка</span>
          </div>
          <div class="parking-details__feature">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.625 15C13.8125 15 14 15.1875 14 15.375V16H0V15.375C0 15.1875 0.15625 15 0.375 15H1V0.75C1 0.34375 1.3125 0 1.75 0H12.25C12.6562 0 13 0.34375 13 0.75V15H13.625ZM4 2.375V3.625C4 3.84375 4.15625 4 4.375 4H5.625C5.8125 4 6 3.84375 6 3.625V2.375C6 2.1875 5.8125 2 5.625 2H4.375C4.15625 2 4 2.1875 4 2.375ZM4 5.375V6.625C4 6.84375 4.15625 7 4.375 7H5.625C5.8125 7 6 6.84375 6 6.625V5.375C6 5.1875 5.8125 5 5.625 5H4.375C4.15625 5 4 5.1875 4 5.375ZM5.625 10C5.8125 10 6 9.84375 6 9.625V8.375C6 8.1875 5.8125 8 5.625 8H4.375C4.15625 8 4 8.1875 4 8.375V9.625C4 9.84375 4.15625 10 4.375 10H5.625ZM8 15V12.375C8 12.1875 7.8125 12 7.625 12H6.375C6.15625 12 6 12.1875 6 12.375V15H8ZM10 9.625V8.375C10 8.1875 9.8125 8 9.625 8H8.375C8.15625 8 8 8.1875 8 8.375V9.625C8 9.84375 8.15625 10 8.375 10H9.625C9.8125 10 10 9.84375 10 9.625ZM10 6.625V5.375C10 5.1875 9.8125 5 9.625 5H8.375C8.15625 5 8 5.1875 8 5.375V6.625C8 6.84375 8.15625 7 8.375 7H9.625C9.8125 7 10 6.84375 10 6.625ZM10 3.625V2.375C10 2.1875 9.8125 2 9.625 2H8.375C8.15625 2 8 2.1875 8 2.375V3.625C8 3.84375 8.15625 4 8.375 4H9.625C9.8125 4 10 3.84375 10 3.625Z" fill="#9333EA"/>
            </svg>
            <span>Парковка во дворе</span>
          </div>
          <div class="parking-details__feature">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 7C13.3125 7 14 7.6875 14 8.5V14.5C14 15.3438 13.3125 16 12.5 16H1.5C0.65625 16 0 15.3438 0 14.5V8.5C0 7.6875 0.65625 7 1.5 7H2.25V4.75C2.25 2.15625 4.375 0 7 0C9.59375 0 11.75 2.15625 11.75 4.75V7H12.5ZM9.25 7V4.75C9.25 3.53125 8.21875 2.5 7 2.5C5.75 2.5 4.75 3.53125 4.75 4.75V7H9.25Z" fill="#9333EA"/>
            </svg>
            <span>Частная территория</span>
          </div>
          <div class="parking-details__feature">
            <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.9375 12.375C22.2188 12.375 22.5 12.6562 22.5 12.9375V14.0625C22.5 14.3789 22.2188 14.625 21.9375 14.625H20.25C20.25 16.4883 18.7383 18 16.875 18C15.0117 18 13.5 16.4883 13.5 14.625H9C9 16.4883 7.48828 18 5.625 18C3.76172 18 2.25 16.4883 2.25 14.625H1.6875C0.738281 14.625 0 13.8867 0 12.9375V1.6875C0 0.773438 0.738281 0 1.6875 0H12.9375C13.8516 0 14.625 0.773438 14.625 1.6875V3.375H16.1719C16.5938 3.375 17.0508 3.58594 17.3672 3.90234L20.8477 7.38281C21.1641 7.69922 21.375 8.15625 21.375 8.57812V12.375H21.9375ZM5.625 16.3125C6.53906 16.3125 7.3125 15.5742 7.3125 14.625C7.3125 13.7109 6.53906 12.9375 5.625 12.9375C4.67578 12.9375 3.9375 13.7109 3.9375 14.625C3.9375 15.5742 4.67578 16.3125 5.625 16.3125ZM16.875 16.3125C17.7891 16.3125 18.5625 15.5742 18.5625 14.625C18.5625 13.7109 17.7891 12.9375 16.875 12.9375C15.9258 12.9375 15.1875 13.7109 15.1875 14.625C15.1875 15.5742 15.9258 16.3125 16.875 16.3125ZM19.6875 9V8.57812L16.1719 5.0625H14.625V9H19.6875Z" fill="#DC2626"/>
            </svg>
            <span>Грузовик</span>
          </div>
          <div class="parking-details__feature">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.6562 3.5C15.9062 3.5 16.0938 3.75 16.0312 3.96875L15.8438 4.71875C15.8125 4.90625 15.6562 5 15.5 5H14.8438C15.2812 5.375 15.5625 5.90625 15.5625 6.5V8C15.5625 8.53125 15.3438 8.96875 15.0625 9.3125V11C15.0625 11.5625 14.5938 12 14.0625 12H13.0625C12.5 12 12.0625 11.5625 12.0625 11V10H4.0625V11C4.0625 11.5625 3.59375 12 3.0625 12H2.0625C1.5 12 1.0625 11.5625 1.0625 11V9.3125C0.75 8.96875 0.5625 8.53125 0.5625 8V6.5C0.5625 5.90625 0.8125 5.375 1.25 5H0.625C0.4375 5 0.28125 4.90625 0.25 4.71875L0.0625 3.96875C0 3.75 0.1875 3.5 0.4375 3.5H2.28125L2.8125 2.21875C3.34375 0.875 4.625 0 6.0625 0H10.0312C11.4688 0 12.75 0.875 13.2812 2.21875L13.8125 3.5H15.6562ZM4.65625 2.96875L4.0625 4.5H12.0625L11.4375 2.96875C11.1875 2.375 10.6562 2 10.0312 2H6.0625C5.4375 2 4.90625 2.375 4.65625 2.96875ZM3.0625 8C3.65625 8 4.5625 8.09375 4.5625 7.5C4.5625 6.90625 3.65625 6 3.0625 6C2.4375 6 2.0625 6.40625 2.0625 7C2.0625 7.625 2.4375 8 3.0625 8ZM13.0625 8C13.6562 8 14.0625 7.625 14.0625 7C14.0625 6.40625 13.6562 6 13.0625 6C12.4375 6 11.5625 6.90625 11.5625 7.5C11.5625 8.09375 12.4375 8 13.0625 8Z" fill="#9333EA"/>
            </svg>
            <span>Легковой / Кроссовер</span>
          </div>
          <div class="parking-details__feature">
            <svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.0781 6.29297C22.3594 6.60938 22.5 6.99609 22.5 7.38281V11.25C22.5 11.8828 21.9727 12.375 21.375 12.375H20.25C20.25 14.2734 18.7383 15.75 16.875 15.75C14.9766 15.75 13.5 14.2734 13.5 12.375H9C9 14.2734 7.48828 15.75 5.625 15.75C3.72656 15.75 2.25 14.2734 2.25 12.375H1.125C0.492188 12.375 0 11.8828 0 11.25V1.125C0 0.527344 0.492188 0 1.125 0H16.0664C16.5938 0.0351562 17.0508 0.246094 17.3672 0.632812L22.0781 6.29297ZM2.25 5.625H5.625V2.25H2.25V5.625ZM5.625 14.0625C6.53906 14.0625 7.3125 13.3242 7.3125 12.375C7.3125 11.4609 6.53906 10.6875 5.625 10.6875C4.67578 10.6875 3.9375 11.4609 3.9375 12.375C3.9375 13.3242 4.67578 14.0625 5.625 14.0625ZM11.25 5.625V2.25H7.875V5.625H11.25ZM16.875 14.0625C17.7891 14.0625 18.5625 13.3242 18.5625 12.375C18.5625 11.4609 17.7891 10.6875 16.875 10.6875C15.9258 10.6875 15.1875 11.4609 15.1875 12.375C15.1875 13.3242 15.9258 14.0625 16.875 14.0625ZM13.5 5.625H18.6328L15.8203 2.25H13.5V5.625Z" fill="#EA580C"/>
            </svg>
            <span>Минивен/Фургон</span>
          </div>
        </div>
      </div>

      <!-- Location Section -->
      <div v-if="false" class="parking-details__section">
        <h3 class="parking-details__section-title">Местоположение</h3>
        <div class="parking-details__map-container" @click="emit('open-full-map')">
          <div ref="mapContainer" class="parking-details__map"></div>
        </div>
        <button type="button" class="parking-details__route-button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.375 8.75C12.7969 8.75 14 9.95312 14 11.375C14 12.8242 12.7969 14 11.375 14H3.77344C4.12891 13.5625 4.62109 12.9336 5.05859 12.25H11.375C11.8398 12.25 12.25 11.8672 12.25 11.375C12.25 10.9102 11.8398 10.5 11.375 10.5H8.75C7.30078 10.5 6.125 9.32422 6.125 7.875C6.125 6.45312 7.30078 5.25 8.75 5.25H9.98047C9.35156 4.375 8.75 3.33594 8.75 2.625C8.75 1.17578 9.92578 0 11.375 0C12.8242 0 14 1.17578 14 2.625C14 4.07422 11.375 7 11.375 7H8.75C8.25781 7 7.875 7.41016 7.875 7.875C7.875 8.36719 8.25781 8.75 8.75 8.75H11.375ZM11.375 1.75C10.8828 1.75 10.5 2.16016 10.5 2.625C10.5 3.11719 10.8828 3.5 11.375 3.5C11.8398 3.5 12.25 3.11719 12.25 2.625C12.25 2.16016 11.8398 1.75 11.375 1.75ZM2.625 7C4.07422 7 5.25 8.17578 5.25 9.625C5.25 11.0742 2.625 14 2.625 14C2.625 14 0 11.0742 0 9.625C0 8.17578 1.17578 7 2.625 7ZM2.625 10.5C3.08984 10.5 3.5 10.1172 3.5 9.625C3.5 9.16016 3.08984 8.75 2.625 8.75C2.13281 8.75 1.75 9.16016 1.75 9.625C1.75 10.1172 2.13281 10.5 2.625 10.5Z" fill="#374151"/>
          </svg>
          <span>Проложить маршрут</span>
        </button>
      </div>
    </div>

    <!-- Footer Button -->
    <footer class="parking-details__footer">
      <button type="button" class="parking-details__primary-button" @click="emit('select-dates')">
        Выбрать даты бронирования
      </button>
    </footer>
  </section>
</template>

<style scoped>
.parking-details {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F8FAFC;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
  z-index: 0;
}

.parking-details__header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 18px;
  background: white;
  border-bottom: 1px solid #E2E8F0;
}

.parking-details__back {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E2E8F0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.parking-details__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.2px;
  line-height: 1.5;
  color: #1F2937;
  flex: 1;
  text-align: center;
}

.parking-details__header-spacer {
  width: 30px;
  flex-shrink: 0;
}

.parking-details__content {
  flex: 1;
  padding: 0 18px;
  overflow-y: auto;
}

.parking-details__gallery {
  margin: 0;
  position: relative;
}

.parking-details__main-photo-container {
  width: 100%;
  height: 192px;
  overflow-x: auto;
  display: flex;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  column-gap: 8px;
}

.parking-details__main-photo {
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
  scroll-snap-align: center;
  border-radius: 16px;
  overflow: hidden;
}

.parking-details__photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
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

.parking-details__section {
  margin-top: 9px;
  padding: 8.5px 0;
  background: white;
  border-radius: 12px;
  padding: 8.5px 18px;
}

.parking-details__section-title {
  margin: 0 0 12px 0;
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

.parking-details__copy-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5.5px 8px;
  background: #E2E8F0;
  border: none;
  border-radius: 8px;
  font-family: Inter, sans-serif;
  font-size: 9.7px;
  color: #4B5563;
  cursor: pointer;
  white-space: nowrap;
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

.parking-details__description-section {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 12px 16px 20px;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parking-details__description-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
  text-align: center;
}

.parking-details__description {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #4B5563;
  text-align: left;
}

.parking-details__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.parking-details__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6.5px 9px;
  border-radius: 12px;
  background: #F3F4F6;
  font-family: Inter, sans-serif;
  font-size: 9.8px;
  font-weight: 400;
  color: #374151;
  white-space: nowrap;
}


.parking-details__feature svg {
  flex-shrink: 0;
  width: auto;
  height: auto;
}

.parking-details__map-container {
  margin-bottom: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.parking-details__map-container:hover {
  opacity: 0.9;
}

.parking-details__map-container:active {
  opacity: 0.8;
}

.parking-details__map {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  isolation: isolate;
  z-index: 0;
}

/* Leaflet map container styles */
.parking-details__map :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  z-index: 0;
  position: relative;
}

.parking-details__map :deep(.leaflet-pane) {
  z-index: 0;
}

.parking-details__map :deep(.leaflet-map-pane) {
  z-index: 0;
}

.parking-details__map :deep(.leaflet-tile-pane) {
  z-index: 0;
}

.parking-details__map :deep(.leaflet-overlay-pane) {
  z-index: 1;
}

.parking-details__map :deep(.leaflet-tile-container img) {
  border-radius: 0;
}

.parking-details__map :deep(.leaflet-control-attribution) {
  display: none;
}

.parking-details__route-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #E2E8F0;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-size: 9.8px;
  color: #374151;
  cursor: pointer;
}

.parking-details__footer {
  padding: 13px 18px;
  padding-bottom: calc(13px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #E2E8F0;
  box-shadow: 0 -4px 6px -4px rgba(0, 0, 0, 0.1);
}

.parking-details__primary-button {
  width: 100%;
  padding: 16px 0;
  background: #2563EB;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.parking-details__primary-button:active {
  background: #1D4ED8;
}
</style>

