<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { spotsApi, type MySpot } from '../services/spotsApi'
import parkingLotImage from '../assets/images/parkinglot.jpg'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-spot', spot: MySpot): void
  (e: 'edit-spot', spotId: string): void
  (e: 'add-spot'): void
  (e: 'hide-spot', spotId: string): void
}>()

const spots = ref<MySpot[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'all' | 'active'>('all')
const currentImageIndex = ref<Record<string, number>>({})

const loadMySpots = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('[MySpotsScreen] Loading user spots...')
    const spotsData = await spotsApi.getMySpots()
    spots.value = spotsData
    // Initialize currentImageIndex for all spots
    spots.value.forEach((spot) => {
      currentImageIndex.value[spot.id] = 0
    })
    console.log('[MySpotsScreen] ✓ Spots loaded:', spotsData.length)
  } catch (err: any) {
    console.error('[MySpotsScreen] ✗ Failed to load spots:', err)
    error.value = err?.message || 'Не удалось загрузить список мест'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadMySpots()
})

// Expose loadMySpots so parent can trigger refresh
defineExpose({
  refresh: loadMySpots
})

const handleTabChange = (tab: 'all' | 'active') => {
  activeTab.value = tab
}

const filteredSpots = computed(() => {
  // Сначала отфильтруем только видимые (неархивированные/нескрытые) места
  const visibleSpots = spots.value.filter((spot) => {
    const anySpot = spot as any
    const status = (anySpot.status || '').toString().toUpperCase()
    const archivedFlag =
      anySpot.archived === true ||
      anySpot.isArchived === true ||
      anySpot.isHidden === true

    // Считаем место скрытым/архивированным, если:
    // - есть явный флаг archived / isArchived / isHidden
    // - либо статус ARCHIVED / HIDDEN / INACTIVE / DISABLED
    const archivedByStatus =
      status === 'ARCHIVED' ||
      status === 'HIDDEN' ||
      status === 'INACTIVE' ||
      status === 'DISABLED'

    return !(archivedFlag || archivedByStatus)
  })

  if (activeTab.value === 'active') {
    // Пока нет точного статуса из бэкенда, считаем все видимые места активными.
    return visibleSpots
  }

  // "Все места" — тоже только видимые (неархивированные)
  return visibleSpots
})

const handleEdit = (spot: MySpot) => {
  emit('edit-spot', spot.id)
}

const handleHide = (spotId: string) => {
  console.log('Hide spot:', spotId)
  emit('hide-spot', spotId)
}

const handleAddPlace = () => {
  emit('add-spot')
}

const getStatusColor = () => {
  // Все места считаются доступными для бронирования
  return { bg: '#DCFCE7', border: '#22C55E', text: '#16A34A' }
}

const goToImage = (spotId: string, index: number) => {
  currentImageIndex.value[spotId] = index
}

const getSpotImages = (spot: MySpot): string[] => {
  if (spot.photos && spot.photos.length > 0) {
    return spot.photos
  }
  return [parkingLotImage]
}
</script>

<template>
  <div class="my-places">
    <!-- Header -->
    <header class="my-places__header">
      <button type="button" class="my-places__back-button" @click="emit('back')" aria-label="Назад">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.03125 14.7812C9.34375 15.0938 9.34375 15.5938 9.03125 15.9062C8.71875 16.2188 8.21875 16.2188 7.90625 15.9062L0.90625 8.90625C0.59375 8.59375 0.59375 8.09375 0.90625 7.78125L7.90625 0.78125C8.21875 0.46875 8.71875 0.46875 9.03125 0.78125C9.34375 1.09375 9.34375 1.59375 9.03125 1.90625L2.59375 8.34375L9.03125 14.7812Z" fill="white"/>
        </svg>
      </button>
      <h1 class="my-places__title">Мои места</h1>
    </header>

    <!-- Tabs -->
    <div class="my-places__tabs-container">
      <div class="my-places__tabs">
        <button
          type="button"
          class="my-places__tab"
          :class="{ 'my-places__tab--active': activeTab === 'all' }"
          @click="handleTabChange('all')"
        >
          Все места
        </button>
        <button
          type="button"
          class="my-places__tab"
          :class="{ 'my-places__tab--active': activeTab === 'active' }"
          @click="handleTabChange('active')"
        >
          Активные
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="my-places__content">
      <!-- Loading state -->
      <div v-if="isLoading" class="my-places__empty">
        <div class="my-places__spinner"></div>
        <p class="my-places__empty-text">Загрузка...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="my-places__empty">
        <p class="my-places__empty-text">{{ error }}</p>
        <button type="button" class="my-places__retry" @click="loadMySpots">
          Попробовать снова
        </button>
      </div>

      <!-- Parking places list -->
      <div v-else-if="filteredSpots.length > 0" class="my-places__list">
        <article
          v-for="spot in filteredSpots"
          :key="spot.id"
          class="parking-card"
        >
          <!-- Image carousel -->
          <div class="parking-card__image-container">
            <img
              :src="getSpotImages(spot)[currentImageIndex[spot.id] || 0]"
              :alt="spot.address"
              class="parking-card__image"
            />
            
            <!-- Image counter -->
            <div v-if="getSpotImages(spot).length > 1" class="parking-card__image-counter">
              {{ (currentImageIndex[spot.id] || 0) + 1 }} / {{ getSpotImages(spot).length }}
            </div>
            
            <!-- Carousel dots -->
            <div v-if="getSpotImages(spot).length > 1" class="parking-card__dots">
              <button
                v-for="(_, index) in getSpotImages(spot)"
                :key="index"
                type="button"
                class="parking-card__dot"
                :class="{ 'parking-card__dot--active': currentImageIndex[spot.id] === index }"
                @click="goToImage(spot.id, index)"
                :aria-label="`Изображение ${index + 1}`"
              ></button>
            </div>
          </div>

          <!-- Address -->
          <div class="parking-card__info">
            <h3 class="parking-card__address">
              {{ spot.address }}
            </h3>

            <!-- Status badge -->
            <div
              class="parking-card__status"
              :style="{
                backgroundColor: getStatusColor().bg,
                borderColor: getStatusColor().border,
              }"
            >
              <span
                class="parking-card__status-dot"
                :style="{ backgroundColor: getStatusColor().border }"
              ></span>
              <span
                class="parking-card__status-text"
                :style="{ color: getStatusColor().text }"
              >
                Доступно для бронирования
              </span>
            </div>

            <!-- Action buttons -->
            <div class="parking-card__actions">
              <button
                type="button"
                class="parking-card__button parking-card__button--edit"
                @click="handleEdit(spot)"
              >
                <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.9922 2.37891L13.4531 4.83984C13.5625 4.94922 13.5625 5.11328 13.4531 5.22266L7.49219 11.1836L4.94922 11.457C4.62109 11.5117 4.32031 11.2109 4.375 10.8828L4.64844 8.33984L10.6094 2.37891C10.7188 2.26953 10.8828 2.26953 10.9922 2.37891ZM15.4219 1.75C15.832 2.16016 15.832 2.84375 15.4219 3.25391L14.4648 4.21094C14.3555 4.32031 14.1914 4.32031 14.082 4.21094L11.6211 1.75C11.5117 1.64062 11.5117 1.47656 11.6211 1.36719L12.5781 0.410156C12.9883 0 13.6719 0 14.082 0.410156L15.4219 1.75ZM10.5 9.57031C10.5 9.46094 10.5273 9.37891 10.582 9.32422L11.6758 8.23047C11.8945 8.03906 12.25 8.17578 12.25 8.47656V12.7695C12.25 13.5078 11.6484 14.082 10.9375 14.082H1.3125C0.574219 14.082 0 13.5078 0 12.7695V3.14453C0 2.43359 0.574219 1.83203 1.3125 1.83203H9.10547C9.40625 1.83203 9.54297 2.1875 9.35156 2.40625L8.25781 3.5C8.20312 3.55469 8.12109 3.58203 8.01172 3.58203H1.75V12.332H10.5V9.57031Z" fill="#374151"/>
                </svg>
                <span>Редактировать</span>
              </button>
              <button
                type="button"
                class="parking-card__button parking-card__button--hide"
                @click="handleHide(spot.id)"
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.75 10.9102C8.96875 10.9102 9.21484 10.9102 9.46094 10.8555L10.8555 11.9492C10.1719 12.1133 9.46094 12.2227 8.75 12.2227C5.38672 12.2227 2.43359 10.2812 0.957031 7.38281C0.902344 7.27344 0.875 7.13672 0.875 6.97266C0.875 6.83594 0.902344 6.69922 0.957031 6.58984C1.23047 6.04297 1.58594 5.55078 1.96875 5.05859L4.83984 7.27344C4.97656 9.32422 6.67188 10.9102 8.75 10.9102ZM17.3086 12.5234C17.418 12.6055 17.4727 12.7148 17.4727 12.8516C17.4727 12.9609 17.4453 13.043 17.3906 13.125L16.8711 13.8086C16.7891 13.918 16.6523 13.9727 16.5156 13.9727C16.4062 13.9727 16.3242 13.9453 16.2422 13.8906L0.164062 1.44922C0.0546875 1.36719 0 1.25781 0 1.12109C0 1.01172 0.0273438 0.929688 0.0820312 0.847656L0.628906 0.164062C0.683594 0.0546875 0.820312 0 0.957031 0C1.06641 0 1.14844 0.0273438 1.23047 0.0820312L4.70312 2.76172C5.90625 2.10547 7.27344 1.75 8.75 1.72266C12.0859 1.72266 15.0391 3.69141 16.5156 6.58984C16.5703 6.69922 16.5977 6.83594 16.5977 7C16.5977 7.13672 16.5703 7.27344 16.5156 7.38281C15.9688 8.44922 15.2031 9.40625 14.3008 10.1719L17.3086 12.5234ZM12.3047 8.64062C12.5234 8.12109 12.6875 7.57422 12.6875 6.97266C12.6875 4.8125 10.9102 3.03516 8.75 3.03516C7.79297 3.0625 6.91797 3.39062 6.23438 3.96484L8.25781 5.49609C8.28516 5.41406 8.28516 5.33203 8.3125 5.22266C8.28516 4.94922 8.20312 4.67578 8.03906 4.45703C8.28516 4.40234 8.53125 4.34766 8.77734 4.34766C10.1992 4.34766 11.375 5.52344 11.375 6.94531C11.375 6.97266 11.375 6.97266 11.375 6.97266C11.3477 7.27344 11.3203 7.54688 11.2109 7.79297L12.3047 8.64062Z" fill="#DC2626"/>
                </svg>
                <span>Скрыть</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div v-else class="my-places__empty">
        <p class="my-places__empty-text">У вас пока нет добавленных мест</p>
      </div>
    </div>

    <!-- Add place button -->
    <div class="my-places__footer">
      <button type="button" class="my-places__add-button" @click="handleAddPlace">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.51192 4.29588H11.8799V7.43988H7.51192V11.6639H4.36792V7.43988H-7.80821e-05V4.29588H4.36792V-0.000119209H7.51192V4.29588Z" fill="white"/>
        </svg>
        Добавить место
      </button>
    </div>
  </div>
</template>

<style scoped>
.my-places {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* Header */
.my-places__header {
  display: flex;
  align-items: center;
  gap: 52px;
  padding: calc(env(safe-area-inset-top) + 18px) 18px 16px;
  background: linear-gradient(90deg, #9333EA 0%, #2563EB 100%);
  position: relative;
}

.my-places__back-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.my-places__back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.my-places__back-button svg {
  display: block;
  width: 10px;
  height: 16px;
}

.my-places__title {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 28px;
  color: #ffffff;
  text-align: center;
}

/* Tabs */
.my-places__tabs-container {
  padding: 12px 32px 13px 32px;
  border-bottom: 1px solid #E5E7EB;
  background: #ffffff;
}

.my-places__tabs {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3px 4px;
  border-radius: 12px;
  background: #F3F4F6;
  width: 100%;
  max-width: 209px;
  margin: 0 auto;
}

.my-places__tab {
  flex: 1;
  display: flex;
  padding: 4px 16px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.my-places__tab--active {
  background: #ffffff;
  color: #2563EB;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Content */
.my-places__content {
  flex: 1;
  padding: 12px 18px;
  overflow-y: auto;
}

.my-places__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
}

/* Parking card */
.parking-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 13px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.parking-card__image-container {
  position: relative;
  width: 100%;
  height: 152px;
  border-radius: 4px;
  overflow: hidden;
}

.parking-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.parking-card__image-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  color: #ffffff;
  text-align: center;
}

.parking-card__dots {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.parking-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.parking-card__dot--active {
  background: #ffffff;
}

.parking-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.parking-card__address {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 26px;
  color: #1F2937;
  display: flex;
  flex-direction: column;
}

.parking-card__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 7px 6px;
  border-radius: 8px;
  border: 1px solid;
  align-self: flex-start;
}

.parking-card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.parking-card__status-text {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 8px;
  line-height: 16px;
}

.parking-card__actions {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  padding-top: 3px;
}

.parking-card__button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.parking-card__button svg {
  flex-shrink: 0;
}

.parking-card__button--edit svg {
  width: 16px;
  height: 15px;
}

.parking-card__button--hide svg {
  width: 18px;
  height: 14px;
}

.parking-card__button--edit {
  background: #F3F4F6;
  color: #374151;
}

.parking-card__button--edit:hover {
  background: #E5E7EB;
}

.parking-card__button--hide {
  background: #EFF6FF;
  color: #DC2626;
}

.parking-card__button--hide:hover {
  background: #DBEAFE;
}

/* Empty state */
.my-places__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.my-places__empty-text {
  margin: 0 0 16px 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
}

.my-places__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(147, 51, 234, 0.2);
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.my-places__retry {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.my-places__retry:hover {
  opacity: 0.9;
}

/* Footer */
.my-places__footer {
  padding: 13px 18px 12px;
  border-top: 1px solid #E5E7EB;
  background: #ffffff;
}

.my-places__add-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 6px;
  border-radius: 12px;
  border: none;
  background: #2563EB;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 24px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.my-places__add-button:hover {
  background: #1D4ED8;
}

.my-places__add-button svg {
  width: 10px;
  height: 16px;
  flex-shrink: 0;
}

/* Extra small devices (320px - 480px) */
@media (max-width: 480px) {
  .my-places {
    max-width: 100%;
  }

  .my-places__header {
    padding: calc(env(safe-area-inset-top) + 16px) 16px 14px;
    gap: 40px;
  }

  .my-places__title {
    font-size: 14px;
    line-height: 24px;
  }

  .my-places__tabs-container {
    padding: 10px 16px 11px;
  }

  .my-places__tabs {
    max-width: 180px;
    padding: 3px 4px;
  }

  .my-places__tab {
    font-size: 9px;
    padding: 3px 12px;
    line-height: 18px;
  }

  .my-places__content {
    padding: 10px 16px;
    gap: 10px;
  }

  .my-places__list {
    gap: 10px;
  }

  .parking-card {
    padding: 10px;
    gap: 10px;
  }

  .parking-card__image-container {
    height: 120px;
    border-radius: 3px;
  }

  .parking-card__image-counter {
    bottom: 8px;
    right: 8px;
    padding: 1px 5px;
    font-size: 8px;
  }

  .parking-card__dots {
    bottom: 8px;
    left: 8px;
    gap: 3px;
  }

  .parking-card__dot {
    width: 4px;
    height: 4px;
  }

  .parking-card__address {
    font-size: 11px;
    line-height: 22px;
  }

  .parking-card__status {
    padding: 1px 5px 4px;
    border-radius: 6px;
    gap: 6px;
  }

  .parking-card__status-dot {
    width: 5px;
    height: 5px;
  }

  .parking-card__status-text {
    font-size: 7px;
    line-height: 14px;
  }

  .parking-card__actions {
    gap: 6px;
  }

  .parking-card__button {
    padding: 10px 12px;
    font-size: 9px;
    line-height: 18px;
    gap: 4px;
  }

  .parking-card__button--edit svg {
    width: 14px;
    height: 13px;
  }

  .parking-card__button--hide svg {
    width: 16px;
    height: 12px;
  }

  .my-places__footer {
    padding: 10px 16px;
  }

  .my-places__add-button {
    font-size: 10px;
    padding: 6px 5px;
    gap: 6px;
  }

  .my-places__add-button svg {
    width: 8px;
    height: 14px;
  }

  .my-places__empty {
    padding: 40px 16px;
  }

  .my-places__empty-text {
    font-size: 13px;
  }
}

/* Small devices (480px - 600px) */
@media (min-width: 480px) and (max-width: 599px) {
  .my-places {
    max-width: 100%;
  }

  .my-places__header {
    padding: calc(env(safe-area-inset-top) + 18px) 18px 15px;
  }

  .my-places__tabs-container {
    padding: 12px 22px 13px;
  }

  .my-places__content {
    padding: 12px 18px;
  }

  .parking-card {
    padding: 12px;
  }

  .parking-card__image-container {
    height: 140px;
  }

  .parking-card__address {
    font-size: 12px;
    line-height: 24px;
  }

  .parking-card__button {
    padding: 11px 14px;
    font-size: 9px;
    gap: 4px;
  }

  .parking-card__button--edit svg {
    width: 14px;
    height: 13px;
  }

  .parking-card__button--hide svg {
    width: 16px;
    height: 12px;
  }

  .my-places__footer {
    padding: 12px 18px;
  }
}

/* Medium tablets (600px - 768px) */
@media (min-width: 600px) and (max-width: 767px) {
  .my-places {
    max-width: 100%;
    margin: 0 auto;
  }

  .my-places__header {
    padding: calc(env(safe-area-inset-top) + 20px) 28px 18px;
  }

  .my-places__title {
    font-size: 16px;
  }

  .my-places__tabs-container {
    padding: 14px 32px 14px;
  }

  .my-places__tabs {
    max-width: 220px;
    padding: 4px 5px;
  }

  .my-places__tab {
    font-size: 11px;
    padding: 4px 16px;
  }

  .my-places__content {
    padding: 16px 28px;
  }

  .my-places__list {
    gap: 14px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .parking-card {
    padding: 16px;
    gap: 12px;
  }

  .parking-card__image-container {
    height: 180px;
  }

  .parking-card__address {
    font-size: 13px;
    line-height: 24px;
  }

  .parking-card__status-text {
    font-size: 9px;
  }

  .parking-card__button {
    padding: 12px 16px;
    font-size: 11px;
    gap: 4px;
  }

  .parking-card__button--edit svg {
    width: 15px;
    height: 14px;
  }

  .parking-card__button--hide svg {
    width: 17px;
    height: 13px;
  }

  .my-places__footer {
    padding: 16px 28px;
  }

  .my-places__add-button {
    font-size: 12px;
    padding: 9px 8px;
  }

  .my-places__empty {
    padding: 80px 28px;
  }
}

/* Tablets and larger (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .my-places {
    max-width: 100%;
    margin: 0 auto;
  }

  .my-places__header {
    padding: calc(env(safe-area-inset-top) + 24px) 36px 20px;
    gap: 64px;
  }

  .my-places__title {
    font-size: 18px;
    line-height: 28px;
  }

  .my-places__tabs-container {
    padding: 16px 40px 16px;
  }

  .my-places__tabs {
    max-width: 280px;
    padding: 5px 6px;
  }

  .my-places__tab {
    font-size: 12px;
    padding: 6px 22px;
    line-height: 20px;
  }

  .my-places__content {
    padding: 20px 36px;
  }

  .my-places__list {
    gap: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  .parking-card {
    padding: 18px;
    gap: 14px;
  }

  .parking-card__image-container {
    height: 200px;
    border-radius: 8px;
  }

  .parking-card__address {
    font-size: 14px;
    line-height: 26px;
  }

  .parking-card__status {
    padding: 3px 8px 7px;
  }

  .parking-card__status-text {
    font-size: 10px;
    line-height: 16px;
  }

  .parking-card__button {
    padding: 14px 18px;
    font-size: 12px;
    line-height: 20px;
    gap: 5px;
  }

  .parking-card__button--edit svg {
    width: 16px;
    height: 15px;
  }

  .parking-card__button--hide svg {
    width: 18px;
    height: 14px;
  }

  .my-places__footer {
    padding: 20px 36px;
  }

  .my-places__add-button {
    font-size: 13px;
    padding: 10px 8px;
  }

  .my-places__empty {
    padding: 100px 36px;
  }

  .my-places__empty-text {
    font-size: 15px;
  }
}

/* Small desktop (1024px - 1440px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .my-places {
    max-width: 1200px;
    margin: 0 auto;
  }

  .my-places__header {
    padding: calc(env(safe-area-inset-top) + 28px) 48px 24px;
    gap: 80px;
  }

  .my-places__title {
    font-size: 20px;
    line-height: 28px;
  }

  .my-places__back-button {
    width: 36px;
    height: 36px;
  }

  .my-places__back-button svg {
    width: 12px;
    height: 18px;
  }

  .my-places__tabs-container {
    padding: 18px 48px 18px;
  }

  .my-places__tabs {
    max-width: 320px;
    padding: 6px 8px;
  }

  .my-places__tab {
    font-size: 13px;
    padding: 8px 28px;
  }

  .my-places__content {
    padding: 24px 48px;
  }

  .my-places__list {
    gap: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }

  .parking-card {
    padding: 20px;
    gap: 16px;
    border-radius: 14px;
  }

  .parking-card__image-container {
    height: 240px;
    border-radius: 10px;
  }

  .parking-card__address {
    font-size: 15px;
    line-height: 28px;
  }

  .parking-card__status {
    padding: 4px 10px 8px;
    border-radius: 10px;
  }

  .parking-card__status-dot {
    width: 7px;
    height: 7px;
  }

  .parking-card__status-text {
    font-size: 11px;
    line-height: 18px;
  }

  .parking-card__button {
    padding: 16px 20px;
    font-size: 13px;
    border-radius: 10px;
    gap: 6px;
  }

  .parking-card__button--edit svg {
    width: 16px;
    height: 15px;
  }

  .parking-card__button--hide svg {
    width: 18px;
    height: 14px;
  }

  .my-places__footer {
    padding: 24px 48px;
  }

  .my-places__add-button {
    font-size: 14px;
    padding: 12px 10px;
    border-radius: 14px;
  }

  .my-places__add-button svg {
    width: 12px;
    height: 18px;
  }

  .my-places__empty {
    padding: 120px 48px;
  }

  .my-places__empty-text {
    font-size: 16px;
  }
}

/* Large desktop (1440px+) */
@media (min-width: 1440px) {
  .my-places {
    max-width: 1400px;
    margin: 0 auto;
  }

  .my-places__header {
    padding: calc(env(safe-area-inset-top) + 32px) 64px 28px;
    gap: 100px;
  }

  .my-places__title {
    font-size: 22px;
    line-height: 32px;
  }

  .my-places__back-button {
    width: 40px;
    height: 40px;
  }

  .my-places__back-button svg {
    width: 14px;
    height: 20px;
  }

  .my-places__tabs-container {
    padding: 20px 64px 20px;
  }

  .my-places__tabs {
    max-width: 360px;
    padding: 7px 10px;
  }

  .my-places__tab {
    font-size: 14px;
    padding: 10px 32px;
    line-height: 22px;
  }

  .my-places__content {
    padding: 28px 64px;
  }

  .my-places__list {
    gap: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  }

  .parking-card {
    padding: 24px;
    gap: 18px;
    border-radius: 16px;
  }

  .parking-card__image-container {
    height: 280px;
    border-radius: 12px;
  }

  .parking-card__address {
    font-size: 16px;
    line-height: 30px;
  }

  .parking-card__status {
    padding: 5px 12px 10px;
    border-radius: 12px;
    gap: 10px;
  }

  .parking-card__status-text {
    font-size: 12px;
    line-height: 20px;
  }

  .parking-card__button {
    padding: 18px 24px;
    font-size: 14px;
    border-radius: 12px;
    line-height: 22px;
    gap: 6px;
  }

  .parking-card__button--edit svg {
    width: 16px;
    height: 15px;
  }

  .parking-card__button--hide svg {
    width: 18px;
    height: 14px;
  }

  .my-places__footer {
    padding: 28px 64px;
  }

  .my-places__add-button {
    font-size: 15px;
    padding: 14px 12px;
    border-radius: 16px;
    gap: 9px;
  }

  .my-places__add-button svg {
    width: 14px;
    height: 20px;
  }

  .my-places__empty {
    padding: 140px 64px;
  }

  .my-places__empty-text {
    font-size: 17px;
  }
}
</style>
