<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { spotsApi, type MySpot } from '../services/spotsApi'
import parkingLotImage from '../assets/images/parkinglot.jpg'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-spot', spot: MySpot): void
}>()

const spots = ref<MySpot[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadMySpots = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('[MySpotsScreen] Loading user spots...')
    const spotsData = await spotsApi.getMySpots()
    spots.value = spotsData
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

const formatPrice = (spot: MySpot): string => {
  const prices: string[] = []
  
  if (spot.hourlyEnabled && spot.pricePerHour) {
    prices.push(`${spot.pricePerHour}₽/час`)
  }
  if (spot.dailyEnabled && spot.pricePerDay) {
    prices.push(`${spot.pricePerDay}₽/сутки`)
  }
  if (spot.monthlyEnabled && spot.pricePerMonth) {
    prices.push(`${spot.pricePerMonth}₽/мес`)
  }
  
  return prices.join(', ') || 'Цена не указана'
}

const formatVehicleType = (type: string): string => {
  switch (type) {
    case 'CAR':
      return 'Легковой'
    case 'VAN':
      return 'Фургон'
    case 'TRUCK':
      return 'Грузовик'
    default:
      return type
  }
}

const handleSpotClick = (spot: MySpot) => {
  emit('open-spot', spot)
}
</script>

<template>
  <section class="my-spots">
    <header class="my-spots__header">
      <button type="button" class="my-spots__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <h1 class="my-spots__title">Мои места</h1>
      <div class="my-spots__header-spacer"></div>
    </header>

    <div class="my-spots__content">
      <!-- Loading state -->
      <div v-if="isLoading" class="my-spots__empty">
        <div class="my-spots__spinner"></div>
        <p class="my-spots__empty-text">Загрузка...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="my-spots__empty">
        <div class="my-spots__empty-icon">
          <svg width="46" height="37" viewBox="0 0 46 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.64062 17.0156C4.64062 15.75 4.85156 14.4844 5.20312 13.2891L28.125 30.9375C26.3672 31.4297 24.5391 31.6406 22.6406 31.6406C19.8984 31.6406 17.3672 31.1484 15.0469 30.3047C13.3594 31.7109 9.84375 33.8906 5.20312 33.8906C4.92188 33.8906 4.78125 33.8203 4.64062 33.6094C4.57031 33.3984 4.64062 33.1172 4.78125 32.9766C4.78125 32.9062 7.73438 29.7422 8.64844 26.2266C6.11719 23.6953 4.64062 20.5312 4.64062 17.0156ZM44.6484 32.4141C45.1406 32.7656 45.2812 33.4688 44.8594 33.9609L43.5234 35.7188C43.1016 36.2109 42.3984 36.2812 41.9062 35.9297L0.5625 3.9375C0.0703125 3.58594 0 2.88281 0.351562 2.39062L1.75781 0.632812C2.10938 0.140625 2.8125 0 3.30469 0.421875L10.6875 6.11719C13.8516 3.86719 18 2.39062 22.6406 2.39062C32.5547 2.39062 40.6406 9 40.6406 17.0156C40.6406 20.5312 39.0938 23.6953 36.6328 26.1562L44.6484 32.4141Z" fill="#D1D5DB"/>
          </svg>
        </div>
        <p class="my-spots__empty-text">{{ error }}</p>
        <button type="button" class="my-spots__retry" @click="loadMySpots">
          Попробовать снова
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="spots.length === 0" class="my-spots__empty">
        <div class="my-spots__empty-icon">
          <svg width="46" height="37" viewBox="0 0 46 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.64062 17.0156C4.64062 15.75 4.85156 14.4844 5.20312 13.2891L28.125 30.9375C26.3672 31.4297 24.5391 31.6406 22.6406 31.6406C19.8984 31.6406 17.3672 31.1484 15.0469 30.3047C13.3594 31.7109 9.84375 33.8906 5.20312 33.8906C4.92188 33.8906 4.78125 33.8203 4.64062 33.6094C4.57031 33.3984 4.64062 33.1172 4.78125 32.9766C4.78125 32.9062 7.73438 29.7422 8.64844 26.2266C6.11719 23.6953 4.64062 20.5312 4.64062 17.0156ZM44.6484 32.4141C45.1406 32.7656 45.2812 33.4688 44.8594 33.9609L43.5234 35.7188C43.1016 36.2109 42.3984 36.2812 41.9062 35.9297L0.5625 3.9375C0.0703125 3.58594 0 2.88281 0.351562 2.39062L1.75781 0.632812C2.10938 0.140625 2.8125 0 3.30469 0.421875L10.6875 6.11719C13.8516 3.86719 18 2.39062 22.6406 2.39062C32.5547 2.39062 40.6406 9 40.6406 17.0156C40.6406 20.5312 39.0938 23.6953 36.6328 26.1562L44.6484 32.4141Z" fill="#D1D5DB"/>
          </svg>
        </div>
        <p class="my-spots__empty-text">У вас пока нет опубликованных мест</p>
      </div>

      <!-- Spots list -->
      <ul v-else class="my-spots__list">
        <li v-for="spot in spots" :key="spot.id">
          <button
            type="button"
            class="my-spots__item"
            @click="handleSpotClick(spot)"
          >
            <div class="my-spots__item-image">
              <img
                v-if="spot.photos && spot.photos.length > 0"
                :src="spot.photos[0]"
                :alt="spot.address"
                class="my-spots__image"
              />
              <img
                v-else
                :src="parkingLotImage"
                alt="Парковочное место"
                class="my-spots__image"
              />
            </div>
            
            <div class="my-spots__item-content">
              <h3 class="my-spots__item-title">{{ spot.address }}</h3>
              <p class="my-spots__item-price">{{ formatPrice(spot) }}</p>
              <p class="my-spots__item-type">{{ formatVehicleType(spot.vehicleType) }}</p>
              <div v-if="spot.description" class="my-spots__item-description">
                {{ spot.description.substring(0, 100) }}{{ spot.description.length > 100 ? '...' : '' }}
              </div>
            </div>

            <div class="my-spots__item-arrow">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L1 13" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.my-spots {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

.my-spots__header {
  padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.my-spots__back {
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

.my-spots__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.my-spots__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  flex: 1;
}

.my-spots__header-spacer {
  width: 40px;
  flex-shrink: 0;
}

.my-spots__content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.my-spots__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  min-height: 400px;
}

.my-spots__empty-icon {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-spots__empty-icon svg {
  width: 46px;
  height: 37px;
  display: block;
}

.my-spots__spinner {
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

.my-spots__empty-text {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #6B7280;
}

.my-spots__retry {
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

.my-spots__retry:hover {
  opacity: 0.9;
}

.my-spots__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
}

.my-spots__item {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background-color: #ffffff;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font: inherit;
  color: inherit;
}

.my-spots__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.my-spots__item-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #F3F4F6;
}

.my-spots__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.my-spots__item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.my-spots__item-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.4;
  color: #1f2937;
  word-wrap: break-word;
}

.my-spots__item-price {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #9333ea;
}

.my-spots__item-type {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #6b7280;
}

.my-spots__item-description {
  margin: 4px 0 0 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
  word-wrap: break-word;
}

.my-spots__item-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .my-spots__header {
    padding: calc(env(safe-area-inset-top) + 32px) 48px 32px;
  }

  .my-spots__content {
    padding: 40px 48px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .my-spots__content {
    max-width: 700px;
    padding: 48px 64px;
  }
}
</style>
