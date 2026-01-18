<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  onBack: () => void
}>()

type ParkingPlace = {
  id: string
  address: string
  subtitle: string
  images: string[]
  status: 'available' | 'rented' | 'unavailable'
  statusLabel: string
}

const activeTab = ref<'all' | 'active'>('all')

// Mock data for parking places
const parkingPlaces = ref<ParkingPlace[]>([
  {
    id: '1',
    address: 'Москва, ул. Тверская, 15 стр. 1',
    subtitle: 'вторая строка',
    images: [
      'https://api.builder.io/api/v1/image/assets/TEMP/9d0638f18153d121334a00261c5504fc61a62b82?width=434',
      'https://api.builder.io/api/v1/image/assets/TEMP/9d0638f18153d121334a00261c5504fc61a62b82?width=434',
      'https://api.builder.io/api/v1/image/assets/TEMP/9d0638f18153d121334a00261c5504fc61a62b82?width=434',
    ],
    status: 'available',
    statusLabel: 'Доступно для бронирования',
  },
])

const currentImageIndex = ref<Record<string, number>>({})

const handleTabChange = (tab: 'all' | 'active') => {
  activeTab.value = tab
}

const handleEdit = (placeId: string) => {
  console.log('Edit place:', placeId)
  // TODO: Implement edit functionality
}

const handleHide = (placeId: string) => {
  console.log('Hide place:', placeId)
  // TODO: Implement hide functionality
}

const handleAddPlace = () => {
  console.log('Add new place')
  // TODO: Implement add place functionality
}

const getStatusColor = (status: ParkingPlace['status']) => {
  switch (status) {
    case 'available':
      return { bg: '#DCFCE7', border: '#22C55E', text: '#16A34A' }
    case 'rented':
      return { bg: '#FEF3C7', border: '#FDE047', text: '#CA8A04' }
    case 'unavailable':
      return { bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626' }
    default:
      return { bg: '#F3F4F6', border: '#E5E7EB', text: '#6B7280' }
  }
}

// Initialize currentImageIndex for all places
parkingPlaces.value.forEach((place) => {
  currentImageIndex.value[place.id] = 0
})

const goToImage = (placeId: string, index: number) => {
  currentImageIndex.value[placeId] = index
}
</script>

<template>
  <div class="my-places">
    <!-- Header -->
    <header class="my-places__header">
      <button type="button" class="my-places__back-button" @click="props.onBack" aria-label="Назад">
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
      <!-- Parking places list -->
      <div v-if="parkingPlaces.length > 0" class="my-places__list">
        <article
          v-for="place in parkingPlaces"
          :key="place.id"
          class="parking-card"
        >
          <!-- Image carousel -->
          <div class="parking-card__image-container">
            <img
              :src="place.images[currentImageIndex[place.id] || 0]"
              :alt="place.address"
              class="parking-card__image"
            />
            
            <!-- Image counter -->
            <div class="parking-card__image-counter">
              {{ (currentImageIndex[place.id] || 0) + 1 }} / {{ place.images.length }}
            </div>
            
            <!-- Carousel dots -->
            <div class="parking-card__dots">
              <button
                v-for="(image, index) in place.images"
                :key="index"
                type="button"
                class="parking-card__dot"
                :class="{ 'parking-card__dot--active': currentImageIndex[place.id] === index }"
                @click="goToImage(place.id, index)"
                :aria-label="`Изображение ${index + 1}`"
              ></button>
            </div>
          </div>

          <!-- Address -->
          <div class="parking-card__info">
            <h3 class="parking-card__address">
              {{ place.address }}
              <span class="parking-card__subtitle">{{ place.subtitle }}</span>
            </h3>

            <!-- Status badge -->
            <div
              class="parking-card__status"
              :style="{
                backgroundColor: getStatusColor(place.status).bg,
                borderColor: getStatusColor(place.status).border,
              }"
            >
              <span
                class="parking-card__status-dot"
                :style="{ backgroundColor: getStatusColor(place.status).border }"
              ></span>
              <span
                class="parking-card__status-text"
                :style="{ color: getStatusColor(place.status).text }"
              >
                {{ place.statusLabel }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="parking-card__actions">
              <button
                type="button"
                class="parking-card__button parking-card__button--edit"
                @click="handleEdit(place.id)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 11.0833V13.4167C0 13.6417 0.191667 13.8333 0.416667 13.8333H2.75C2.85 13.8333 2.95 13.7917 3.01667 13.7167L11.3417 5.39999L8.43333 2.49166L0.116667 10.8167C0.0416667 10.8917 0 10.9833 0 11.0833ZM13.5083 3.23332C13.5783 3.16331 13.6337 3.08034 13.6715 2.98916C13.7092 2.89799 13.7284 2.80038 13.7284 2.70182C13.7284 2.60327 13.7092 2.50566 13.6715 2.41448C13.6337 2.32331 13.5783 2.24034 13.5083 2.17032L11.6583 0.320324C11.5883 0.250314 11.5053 0.194901 11.4142 0.157133C11.323 0.119366 11.2254 0.100098 11.1268 0.100098C11.0283 0.100098 10.9307 0.119366 10.8395 0.157133C10.7483 0.194901 10.6654 0.250314 10.5953 0.320324L9.10833 1.80832L12.0167 4.71666L13.5083 3.23332Z" fill="#374151"/>
                </svg>
                Редактировать
              </button>
              <button
                type="button"
                class="parking-card__button parking-card__button--hide"
                @click="handleHide(place.id)"
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.8672 0C12.1133 0 12.332 0.109375 12.4961 0.273438L13.9727 1.75V7.05469C13.918 6.97266 13.8359 6.91797 13.7812 6.83594L9.78906 3.60938L10.5 2.95312C10.6914 2.78906 10.6914 2.51562 10.5273 2.35156C10.3633 2.16016 10.0898 2.16016 9.89844 2.32422L7.73828 4.32031C7.71094 4.32031 7.71094 4.32031 7.71094 4.32031C7.24609 4.73047 6.53516 4.62109 6.17969 4.23828C5.79688 3.82812 5.79688 3.14453 6.23438 2.70703L8.94141 0.246094C9.10547 0.0820312 9.29688 0 9.51562 0H11.8672ZM14.875 1.77734H17.5V8.77734H15.75C15.2578 8.77734 14.875 8.36719 14.875 7.90234V1.77734ZM16.1875 7.90234C16.4062 7.90234 16.625 7.68359 16.625 7.46484C16.625 7.21875 16.4062 7.02734 16.1875 7.02734C15.9414 7.02734 15.75 7.21875 15.75 7.46484C15.75 7.68359 15.9414 7.90234 16.1875 7.90234ZM0 8.75V1.77734H2.625V7.875C2.625 8.36719 2.21484 8.75 1.75 8.75H0ZM1.3125 7.02734C1.06641 7.02734 0.875 7.21875 0.875 7.46484C0.875 7.68359 1.06641 7.90234 1.3125 7.90234C1.53125 7.90234 1.75 7.68359 1.75 7.46484C1.75 7.21875 1.53125 7.02734 1.3125 7.02734ZM13.207 7.51953C13.5898 7.82031 13.6445 8.36719 13.3438 8.75L13.0977 9.07812C12.7695 9.46094 12.2227 9.51562 11.8672 9.21484L11.7031 9.07812L10.8555 10.1445C10.5 10.582 9.84375 10.6367 9.40625 10.2812L8.94141 9.87109H8.91406C8.3125 10.6094 7.21875 10.7461 6.45312 10.1172L3.99219 7.875H3.5V1.75L4.97656 0.273438C5.14062 0.109375 5.35938 0 5.60547 0H7.90234L5.66016 2.05078C4.86719 2.78906 4.8125 4.04688 5.52344 4.83984C6.26172 5.63281 7.49219 5.71484 8.3125 4.97656L8.33984 4.94922C8.44922 5.14062 8.66797 5.30469 8.88672 5.33203V5.35938H8.91406C9.35156 5.35938 9.76172 5.16797 10.0625 4.83984L13.207 7.51953ZM12.25 13.0469C12.7148 13.3203 13.2344 13.4844 13.7812 13.4844C15.6406 13.4844 17.1719 12.0078 17.1719 10.0938V9.625H15.7773V10.0938C15.7773 11.2148 14.875 12.0898 13.7812 12.0898C13.4258 12.0898 13.0977 11.9805 12.8242 11.7891L12.25 13.0469ZM10.4453 13.4844C9.32422 13.4844 8.3125 12.9648 7.65625 12.1992L6.61719 13.2383C7.54688 14.3047 8.91406 14.9336 10.4453 14.9336C11.4844 14.9336 12.4688 14.6055 13.2617 14.0586L12.6055 12.7734C11.9766 13.1836 11.2383 13.4844 10.4453 13.4844ZM0.328125 14.9336H1.72266V13.4844H0.328125V14.9336ZM3.5 14.9336H4.89453V13.4844H3.5V14.9336Z" fill="#DC2626"/>
                </svg>
                Скрыть
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
  max-width: 428px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.parking-card__subtitle {
  font-weight: 400;
  color: #1F2937;
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
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.my-places__empty-text {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
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
    gap: 6px;
  }

  .parking-card__button svg {
    width: 12px;
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
  }

  .parking-card__button svg {
    width: 16px;
    height: 16px;
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
  }

  .parking-card__button svg {
    width: 18px;
    height: 18px;
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
