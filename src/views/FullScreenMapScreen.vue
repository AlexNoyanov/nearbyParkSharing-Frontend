<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { loadYandexMaps } from '../services/yandexMaps'

type Location = {
  lat: number
  lng: number
  address?: string
}

const props = defineProps<{
  location: Location
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

onMounted(async () => {
  try {
    await loadYandexMaps()

    if (!mapContainer.value || !window.ymaps) return

    // Create Yandex Map
    map = new window.ymaps.Map(mapContainer.value, {
      center: [props.location.lat, props.location.lng],
      zoom: 15,
      controls: ['zoomControl'],
    })

    // Create custom red marker with white location pin
    marker = new window.ymaps.Placemark(
      [props.location.lat, props.location.lng],
      {},
      {
        iconLayout: 'default#imageWithContent',
        iconImageHref: '',
        iconImageSize: [44, 44],
        iconImageOffset: [-22, -44],
        iconContentLayout: window.ymaps.templateLayoutFactory.createClass(
          `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="22" fill="#EF4444"/>
            <g transform="translate(16.5, 14.5)">
              <path d="M4.70312 13.7266C0.710938 7.98438 0 7.38281 0 5.25C0 2.35156 2.32422 0 5.25 0C8.14844 0 10.5 2.35156 10.5 5.25C10.5 7.38281 9.76172 7.98438 5.76953 13.7266C5.52344 14.1094 4.94922 14.1094 4.70312 13.7266ZM5.25 7.4375C6.45312 7.4375 7.4375 6.48047 7.4375 5.25C7.4375 4.04688 6.45312 3.0625 5.25 3.0625C4.01953 3.0625 3.0625 4.04688 3.0625 5.25C3.0625 6.48047 4.01953 7.4375 5.25 7.4375Z" fill="white"/>
            </g>
          </svg>`
        ),
      }
    )

    map.geoObjects.add(marker)
  } catch (error) {
    console.error('Failed to load Yandex Maps:', error)
  }
})

onBeforeUnmount(() => {
  if (map) {
    if (marker) {
      map.geoObjects.remove(marker)
    }
    map.destroy()
    map = null
  }
  marker = null
})
</script>

<template>
  <section class="full-screen-map">
    <button type="button" class="full-screen-map__close" @click="emit('close')" aria-label="Закрыть">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div ref="mapContainer" class="full-screen-map__container"></div>
  </section>
</template>

<style scoped>
.full-screen-map {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  background: #ffffff;
}

.full-screen-map__container {
  width: 100%;
  height: 100%;
  position: relative;
}

.full-screen-map__close {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 16px);
  right: 16px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: background-color 0.2s ease;
}

.full-screen-map__close:hover {
  background: rgba(0, 0, 0, 0.8);
}

.full-screen-map__close:active {
  background: rgba(0, 0, 0, 0.9);
}

.full-screen-map__close svg {
  width: 24px;
  height: 24px;
}

.full-screen-map__container :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.full-screen-map__container :deep(.leaflet-control-attribution) {
  display: none;
}
</style>

