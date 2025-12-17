<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ParkingSpot } from '../data/parkings'
import type { User } from '../services/mockAuth'
import searchIconUrl from '../assets/icons/icon-search.svg?url'

type Booking = {
  id: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  rentalType: 'hourly' | 'daily' | 'monthly'
  createdAt: Date
  status: 'awaiting' | 'confirmed' | 'active' | 'completed'
}

const props = defineProps<{ 
  userName?: string
  currentUser?: User | null
  bookingsCount?: number
  bookings?: Booking[]
}>()

const emit = defineEmits<{
  (e: 'open-search'): void
  (e: 'open-rent-out'): void
  (e: 'open-booking', parking: ParkingSpot): void
  (e: 'open-history'): void
  (e: 'open-chat'): void
}>()

type QuickAction = {
  id: 'search' | 'share'
  title: string
  subtitle: string
  tone: 'indigo' | 'emerald'
}

const quickActions: QuickAction[] = [
  { id: 'search', title: 'Найти парковку', subtitle: 'Арендовать место', tone: 'indigo' },
  { id: 'share', title: 'Сдать место', subtitle: 'Заработать деньги', tone: 'emerald' },
]

type StatCard = {
  id: 'bookings' | 'spaces'
  label: string
  caption: string
  count: number
  tone: 'violet' | 'mint'
}

const stats: StatCard[] = props.currentUser ? [
  { id: 'bookings', label: 'Мои брони', caption: 'Активные аренды', count: props.bookingsCount || 0, tone: 'violet' },
  { id: 'spaces', label: 'Мои места', caption: 'Сдаются сейчас', count: 1, tone: 'mint' },
] : [
  { id: 'bookings', label: 'Мои брони', caption: 'Активные аренды', count: 0, tone: 'violet' },
  { id: 'spaces', label: 'Мои места', caption: 'Сдаются сейчас', count: 0, tone: 'mint' },
]

type ActivityEntry = {
  id: string
  title: string
  period: string
  meta?: string
  statusLabel: string
  statusTone: 'success' | 'neutral'
  statusMeta?: string
  parking: ParkingSpot | null
  booking?: never
  address?: never
}

// Commented out activity items to show empty list message
const recentActivities: ActivityEntry[] = props.currentUser ? [
  // {
  //   id: 'activity-1',
  //   title: 'Ваше место на ул. Мира',
  //   period: 'Сегодня, 8 часов • ₽640',
  //   meta: 'Арендатор: Елена С.',
  //   statusLabel: 'Активно',
  //   statusTone: 'success',
  //   statusMeta: 'до 18:00',
  //   parking: featuredParkings[0] ?? fallbackParking,
  // },
  // {
  //   id: 'activity-2',
  //   title: 'Место у дома на Тверской',
  //   period: 'Вчера, 6 часов • ₽480',
  //   meta: 'Арендатор: Дмитрий В.',
  //   statusLabel: 'Завершено',
  //   statusTone: 'neutral',
  //   parking: featuredParkings[1] ?? fallbackParking,
  // },
  // {
  //   id: 'activity-3',
  //   title: 'Парковка в центре',
  //   period: '2 дня назад, 4 часа • ₽320',
  //   meta: 'Арендатор: Михаил П.',
  //   statusLabel: 'Завершено',
  //   statusTone: 'neutral',
  //   parking: featuredParkings[2] ?? fallbackParking,
  // },
] : []

const activityFilters = ref([
  { id: 'rentals', label: 'Аренда мест', icon: 'car', isActive: false },
  { id: 'sharing', label: 'Сдача мест', icon: 'key', isActive: true },
])

// Automatically switch to "Аренда мест" filter if there are bookings
watch(() => props.bookings, (bookings) => {
  if (bookings && bookings.length > 0) {
    const hasActiveBookings = bookings.some(b => b.status === 'awaiting' || b.status === 'confirmed' || b.status === 'active')
    if (hasActiveBookings) {
      activityFilters.value = activityFilters.value.map(filter => ({
        ...filter,
        isActive: filter.id === 'rentals'
      }))
    }
  }
}, { immediate: true })

const handleFilterClick = (filterId: string) => {
  activityFilters.value = activityFilters.value.map(filter => ({
    ...filter,
    isActive: filter.id === filterId
  }))
}

// Computed property to get activities based on active filter
const displayedActivities = computed(() => {
  const activeFilter = activityFilters.value.find(f => f.isActive)
  
  if (activeFilter?.id === 'rentals') {
    // Show bookings when "Аренда мест" filter is active
    return (props.bookings || []).map(booking => ({
      id: booking.id,
      title: 'Запрос на бронирование',
      address: booking.address,
      period: formatBookingPeriod(booking),
      statusLabel: booking.status === 'awaiting' ? 'Ожидает' : '',
      statusMeta: booking.status === 'awaiting' ? 'начала аренды' : '',
      statusTone: 'success' as const,
      booking,
      parking: null as ParkingSpot | null
    })).reverse() // Show newest bookings first
  } else {
    // Show sharing activities (currently empty)
    return recentActivities
  }
})

const formatBookingPeriod = (booking: Booking): string => {
  // Format date and time for display
  const startDate = new Date(`${booking.startDate}T${booking.startTime}`)
  const endDate = new Date(`${booking.endDate}T${booking.endTime}`)
  
  // Format date - use abbreviated month name
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
  
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (booking.startDate === booking.endDate) {
    return `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} — ${timeFormatter.format(endDate)}`
  } else {
    return `${dateFormatter.format(startDate)} — ${dateFormatter.format(endDate)}`
  }
}
</script>

<template>
  <section class="home">
    <div class="home__greeting">
      <div class="home__greeting-content">
        <h1 class="home__greeting-title">{{ props.currentUser ? 'Привет, ' + (props.currentUser.name || props.userName || 'Пользователь') : 'Привет!' }}</h1>
        <p class="home__greeting-subtitle">Что планируете сегодня?</p>
      </div>
      <div class="home__greeting-icon">
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 10C5.97656 10 3.75 7.77344 3.75 5C3.75 2.26562 5.97656 0 8.75 0C11.4844 0 13.75 2.26562 13.75 5C13.75 7.77344 11.4844 10 8.75 10ZM12.2266 11.25C15.1172 11.25 17.5 13.6328 17.5 16.5234V18.125C17.5 19.1797 16.6406 20 15.625 20H1.875C0.820312 20 0 19.1797 0 18.125V16.5234C0 13.6328 2.34375 11.25 5.23438 11.25H5.89844C6.75781 11.6797 7.73438 11.875 8.75 11.875C9.76562 11.875 10.7031 11.6797 11.5625 11.25H12.2266Z" fill="#9333EA"/>
        </svg>
      </div>
    </div>
    <div class="home__actions">
      <button
        v-for="action in quickActions"
        :key="action.id"
        type="button"
        class="home__action-card"
        :class="`home__action-card--${action.tone}`"
        @click="action.id === 'search' ? emit('open-search') : emit('open-rent-out')"
      >
        <div class="home__action-icon">
          <img v-if="action.id === 'search'" :src="searchIconUrl" alt="" />
          <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7.51192 4.29588H11.8799V7.43988H7.51192V11.6639H4.36792V7.43988H-7.80821e-05V4.29588H4.36792V-0.000119209H7.51192V4.29588Z" fill="white"/>
          </svg>
        </div>
        <div class="home__action-copy">
          <h2 class="home__action-title" v-if="action.id === 'share'" v-html="'Сдать<br>место'"></h2>
          <h2 class="home__action-title" v-else>{{ action.title }}</h2>
          <p class="home__action-subtitle">{{ action.subtitle }}</p>
        </div>
      </button>
    </div>

    <div class="home__stats">
      <article
        v-for="stat in stats"
        :key="stat.id"
        class="home__stat-card"
        :class="`home__stat-card--${stat.tone}`"
      >
        <div class="home__stat-header">
          <div class="home__stat-icon">
            <svg
              v-if="stat.id === 'bookings'"
              width="14"
              height="16"
              viewBox="0 0 14 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              class="home__stat-icon-figure"
            >
              <path d="M0.375 6H13.625C13.8125 6 14 6.1875 14 6.375V14.5C14 15.3438 13.3125 16 12.5 16H1.5C0.65625 16 0 15.3438 0 14.5V6.375C0 6.1875 0.15625 6 0.375 6ZM14 4.625C14 4.84375 13.8125 5 13.625 5H0.375C0.15625 5 0 4.84375 0 4.625V3.5C0 2.6875 0.65625 2 1.5 2H3V0.375C3 0.1875 3.15625 0 3.375 0H4.625C4.8125 0 5 0.1875 5 0.375V2H9V0.375C9 0.1875 9.15625 0 9.375 0H10.625C10.8125 0 11 0.1875 11 0.375V2H12.5C13.3125 2 14 2.6875 14 3.5V4.625Z" fill="white"/>
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              class="home__stat-icon-figure"
            >
              <path d="M16 5.53125C16 8.5625 13.5312 11 10.5 11C10.125 11 9.78125 10.9688 9.46875 10.9062L8.71875 11.75C8.5625 11.9062 8.375 12 8.15625 12H7V13.25C7 13.6875 6.65625 14 6.25 14H5V15.25C5 15.6875 4.65625 16 4.25 16H0.75C0.3125 16 0 15.6875 0 15.25V12.8125C0 12.625 0.0625 12.4375 0.21875 12.2812L5.25 7.25C5.09375 6.6875 5 6.125 5 5.5C5 2.46875 7.4375 0.03125 10.4688 0C13.5312 0 16 2.46875 16 5.53125ZM10.5 4C10.5 4.84375 11.1562 5.5 12 5.5C12.8125 5.5 13.5 4.84375 13.5 4C13.5 3.1875 12.8125 2.5 12 2.5C11.1562 2.5 10.5 3.1875 10.5 4Z" fill="white"/>
            </svg>
          </div>
          <span class="home__stat-count">{{ stat.count }}</span>
        </div>

        <div class="home__stat-copy">
          <h3 class="home__stat-title">{{ stat.label }}</h3>
          <p class="home__stat-caption">{{ stat.caption }}</p>
        </div>
      </article>
    </div>

    <section class="home__section">
      <header class="home__section-header">
        <h2 class="home__section-title">Недавняя активность</h2>
        <button v-if="props.currentUser" type="button" class="home__section-action" @click="emit('open-history')">Все</button>
      </header>

      <div class="home__activity-card">
        <div class="home__activity-filters" role="group" aria-label="Фильтр активности">
          <button
            v-for="filter in activityFilters"
            :key="filter.id"
            type="button"
            class="home__activity-filter"
            :class="{ 'home__activity-filter--active': filter.isActive }"
            :aria-pressed="filter.isActive"
            @click="handleFilterClick(filter.id)"
          >
            <span class="home__activity-filter-icon">
              <svg
                v-if="filter.icon === 'car'"
                width="15"
                height="11"
                viewBox="0 0 15 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M13.6992 3.0625C13.918 3.0625 14.082 3.28125 14.0273 3.47266L13.8633 4.12891C13.8359 4.29297 13.6992 4.375 13.5625 4.375H12.9883C13.3711 4.70312 13.6172 5.16797 13.6172 5.6875V7C13.6172 7.46484 13.4258 7.84766 13.1797 8.14844V9.625C13.1797 10.1172 12.7695 10.5 12.3047 10.5H11.4297C10.9375 10.5 10.5547 10.1172 10.5547 9.625V8.75H3.55469V9.625C3.55469 10.1172 3.14453 10.5 2.67969 10.5H1.80469C1.3125 10.5 0.929688 10.1172 0.929688 9.625V8.14844C0.65625 7.84766 0.492188 7.46484 0.492188 7V5.6875C0.492188 5.16797 0.710938 4.70312 1.09375 4.375H0.546875C0.382812 4.375 0.246094 4.29297 0.21875 4.12891L0.0546875 3.47266C0 3.28125 0.164062 3.0625 0.382812 3.0625H1.99609L2.46094 1.94141C2.92578 0.765625 4.04688 0 5.30469 0H8.77734C10.0352 0 11.1562 0.765625 11.6211 1.94141L12.0859 3.0625H13.6992ZM4.07422 2.59766L3.55469 3.9375H10.5547L10.0078 2.59766C9.78906 2.07812 9.32422 1.75 8.77734 1.75H5.30469C4.75781 1.75 4.29297 2.07812 4.07422 2.59766ZM2.67969 7C3.19922 7 3.99219 7.08203 3.99219 6.5625C3.99219 6.04297 3.19922 5.25 2.67969 5.25C2.13281 5.25 1.80469 5.60547 1.80469 6.125C1.80469 6.67188 2.13281 7 2.67969 7ZM11.4297 7C11.9492 7 12.3047 6.67188 12.3047 6.125C12.3047 5.60547 11.9492 5.25 11.4297 5.25C10.8828 5.25 10.1172 6.04297 10.1172 6.5625C10.1172 7.08203 10.8828 7 11.4297 7Z" fill="currentColor"/>
              </svg>
              <svg
                v-else
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M14 4.83984C14 7.49219 11.8398 9.625 9.1875 9.625C8.85938 9.625 8.55859 9.59766 8.28516 9.54297L7.62891 10.2812C7.49219 10.418 7.32812 10.5 7.13672 10.5H6.125V11.5938C6.125 11.9766 5.82422 12.25 5.46875 12.25H4.375V13.3438C4.375 13.7266 4.07422 14 3.71875 14H0.65625C0.273438 14 0 13.7266 0 13.3438V11.2109C0 11.0469 0.0546875 10.8828 0.191406 10.7461L4.59375 6.34375C4.45703 5.85156 4.375 5.35938 4.375 4.8125C4.375 2.16016 6.50781 0.0273438 9.16016 0C11.8398 0 14 2.16016 14 4.83984ZM9.1875 3.5C9.1875 4.23828 9.76172 4.8125 10.5 4.8125C11.2109 4.8125 11.8125 4.23828 11.8125 3.5C11.8125 2.78906 11.2109 2.1875 10.5 2.1875C9.76172 2.1875 9.1875 2.78906 9.1875 3.5Z" fill="currentColor"/>
              </svg>
            </span>
            <span>{{ filter.label }}</span>
          </button>
        </div>

        <div v-if="displayedActivities.length === 0" class="home__activity-empty">
          <div class="home__activity-empty-icon">
            <svg width="46" height="37" viewBox="0 0 46 37" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.64062 17.0156C4.64062 15.75 4.85156 14.4844 5.20312 13.2891L28.125 30.9375C26.3672 31.4297 24.5391 31.6406 22.6406 31.6406C19.8984 31.6406 17.3672 31.1484 15.0469 30.3047C13.3594 31.7109 9.84375 33.8906 5.20312 33.8906C4.92188 33.8906 4.78125 33.8203 4.64062 33.6094C4.57031 33.3984 4.64062 33.1172 4.78125 32.9766C4.78125 32.9062 7.73438 29.7422 8.64844 26.2266C6.11719 23.6953 4.64062 20.5312 4.64062 17.0156ZM44.6484 32.4141C45.1406 32.7656 45.2812 33.4688 44.8594 33.9609L43.5234 35.7188C43.1016 36.2109 42.3984 36.2812 41.9062 35.9297L0.5625 3.9375C0.0703125 3.58594 0 2.88281 0.351562 2.39062L1.75781 0.632812C2.10938 0.140625 2.8125 0 3.30469 0.421875L10.6875 6.11719C13.8516 3.86719 18 2.39062 22.6406 2.39062C32.5547 2.39062 40.6406 9 40.6406 17.0156C40.6406 20.5312 39.0938 23.6953 36.6328 26.1562L44.6484 32.4141Z" fill="#D1D5DB"/>
            </svg>
          </div>
          <p class="home__activity-empty-text">Пока у вас не было бронирований</p>
        </div>

        <ul v-else class="home__activity-list">
          <li v-for="entry in displayedActivities" :key="entry.id">
            <button
              type="button"
              class="home__activity-item"
              :class="{ 'home__activity-item--booking': entry.booking }"
              :disabled="entry.booking ? false : !entry.parking"
              @click="entry.booking ? emit('open-chat') : (entry.parking && emit('open-booking', entry.parking))"
            >
              <span class="home__activity-icon" :class="{ 'home__activity-icon--booking': entry.booking }" aria-hidden="true">
                <svg v-if="entry.booking" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 5.53125C16 8.5625 13.5312 11 10.5 11C10.125 11 9.78125 10.9688 9.46875 10.9062L8.71875 11.75C8.5625 11.9062 8.375 12 8.15625 12H7V13.25C7 13.6875 6.65625 14 6.25 14H5V15.25C5 15.6875 4.65625 16 4.25 16H0.75C0.3125 16 0 15.6875 0 15.25V12.8125C0 12.625 0.0625 12.4375 0.21875 12.2812L5.25 7.25C5.09375 6.6875 5 6.125 5 5.5C5 2.46875 7.4375 0.03125 10.4688 0C13.5312 0 16 2.46875 16 5.53125ZM10.5 4C10.5 4.84375 11.1562 5.5 12 5.5C12.8125 5.5 13.5 4.84375 13.5 4C13.5 3.1875 12.8125 2.5 12 2.5C11.1562 2.5 10.5 3.1875 10.5 4Z" fill="#16A34A"/>
                </svg>
                <svg v-else viewBox="0 0 24 24">
                  <circle cx="10" cy="10" r="5" stroke="currentColor" stroke-width="1.6" />
                  <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                  <path
                    d="M13.6 13.6 20 20v2h-2v-1.5l-1.5 1.5-2-2 1.5-1.5-2-2"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>

              <div class="home__activity-content">
                <h3 class="home__activity-title">{{ entry.title }}</h3>
                <p v-if="'address' in entry && entry.address" class="home__activity-address">{{ entry.address }}</p>
                <p v-if="entry.period" class="home__activity-period">{{ entry.period }}</p>
                <p v-if="'meta' in entry && entry.meta" class="home__activity-meta">{{ entry.meta }}</p>
              </div>

              <div v-if="entry.statusLabel" class="home__activity-status">
                <span
                  class="home__activity-status-label"
                  :class="{
                    'home__activity-status-label--success': entry.statusTone === 'success',
                    'home__activity-status-label--neutral': entry.statusTone === 'neutral',
                  }"
                >
                  {{ entry.statusLabel }}
                </span>
                <span v-if="entry.statusMeta" class="home__activity-status-meta">
                  {{ entry.statusMeta }}
                </span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>

<style scoped>
.home {
  display: grid;
  gap: 40px;
  padding-top: 0;
  padding-left: calc(env(safe-area-inset-left) + 24px);
  padding-right: calc(env(safe-area-inset-right) + 24px);
  padding-bottom: 48px;
  background-color: #f8fafc;
  max-width: 428px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  min-width: 0;
}

.home__greeting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: calc(env(safe-area-inset-top) + 60px) calc(env(safe-area-inset-right) + 24px) 24px calc(env(safe-area-inset-left) + 24px);
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  border-radius: 0;
  margin-top: 0;
  margin-left: calc(env(safe-area-inset-left) * -1 - 24px);
  margin-right: calc(env(safe-area-inset-right) * -1 - 24px);
}

.home__greeting-content {
  flex: 1;
}

.home__greeting-title {
  margin: 0 0 8px 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  color: #ffffff;
}

.home__greeting-subtitle {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
}

.home__greeting-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home__greeting-icon svg {
  width: 18px;
  height: 20px;
  display: block;
}

.home__actions {
  display: flex;
  flex-direction: row;
  gap: 24px;
  /* margin-top: 30px; */
}

.home__stats {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: stretch;
}

.home__action-card {
  border-radius: 24px;
  border: 1px solid transparent;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background-color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease;
  text-align: center;
  font: inherit;
  flex: 1;
  min-width: 0;
}

.home__action-card:focus-visible,
.home__activity-item:focus-visible,
.home__section-action:focus-visible,
.home__activity-filter:focus-visible {
  outline: 2px solid rgba(79, 70, 229, 0.4);
  outline-offset: 3px;
}

.home__action-card:hover {
  transform: translateY(-2px);
}

.home__action-card--indigo {
  background-color: #eff6ff;
  border-color: #dbeafe;
}

.home__action-card--emerald {
  background-color: #f0fdf4;
  border-color: #dcfce7;
}

.home__action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #ffffff;
}

.home__action-card--indigo .home__action-icon {
  background: #3b82f6;
}

.home__action-card--emerald .home__action-icon {
  background: #22c55e;
}

.home__action-icon img {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

.home__action-icon svg {
  width: 24px;
  height: 24px;
}

.home__action-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.home__action-title {
  margin: 0;
  font-size: 16.8px;
  font-weight: 700;
  color: #1f2937;
}

.home__action-subtitle {
  margin: 0;
  font-size: 13.2px;
  color: #4b5563;
  font-weight: 500;
  margin-top: 14px;
}


.home__stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid transparent;
  background-color: #ffffff;
  flex: 1;
  min-width: 0;
  text-align: center;
}

.home__stat-card--violet {
  background-color: #faf5ff;
  border-color: #f3e8ff;
}

.home__stat-card--mint {
  background-color: #f0fdf4;
  border-color: #dcfce7;
}

.home__stat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 0;
  width: 100%;
}

.home__stat-count {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.home__stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #ffffff;
  flex-shrink: 0;
}

.home__stat-card--violet .home__stat-icon {
  background: #a855f7;
}

.home__stat-card--mint .home__stat-icon {
  background: #22c55e;
}

.home__stat-icon-figure {
  display: block;
}

.home__stat-icon-figure[width="14"] {
  width: 14px;
  height: 16px;
}

.home__stat-icon-figure[width="16"] {
  width: 16px;
  height: 16px;
}

.home__stat-count {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  background: #f3e8ff;
  color: #6b21a8;
}

.home__stat-card--mint .home__stat-count {
  background: #dcfce7;
  color: #166534;
}

.home__stat-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
}

.home__stat-title {
  margin: 0;
  font-size: 15.6px;
  font-weight: 700;
  color: #1f2937;
}

.home__stat-caption {
  margin: 0;
  font-size: 13.4px;
  color: #4b5563;
  font-weight: 500;
}

.home__section {
  display: grid;
  gap: 20px;
}

.home__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home__section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.home__section-action {
  background: transparent;
  border: none;
  color: #9333ea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 9999px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.home__section-action:hover {
  background-color: rgba(147, 51, 234, 0.08);
  color: #7c3aed;
}

.home__activity-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 16px;
  min-width: 0;
  overflow: hidden;
}

.home__activity-filters {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  background-color: #F3F4F6;
  border-radius: 16px;
  padding: 8px;
}

.home__activity-filter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background-color: transparent;
  color: #4b5563;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  flex: 1;
  min-width: 0;
}

.home__activity-filter:hover:not(.home__activity-filter--active) {
  background-color: rgba(255, 255, 255, 0.5);
}

.home__activity-filter--active {
  background-color: #ffffff;
  color: #9333ea;
}

.home__activity-filter-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.home__activity-filter svg {
  display: block;
}

.home__activity-filter svg[width="14"] {
  width: 14px;
  height: 14px;
}

.home__activity-filter svg[width="15"] {
  width: 15px;
  height: 11px;
}

.home__activity-filter--active svg {
  color: #9333ea;
}

.home__activity-filter:not(.home__activity-filter--active) svg {
  color: #4B5563;
}

.home__activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
}

.home__activity-item {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background-color: #ffffff;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease;
  font: inherit;
  color: inherit;
  min-width: 0;
  overflow: hidden;
}

.home__activity-item--booking {
 /* border-color: #374151; */
  border-width: 1px;
}

.home__activity-item:hover:not(:disabled) {
  transform: translateY(-2px);
}

.home__activity-item:disabled {
  cursor: default;
  opacity: 0.65;
  transform: none;
}

.home__activity-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-color: #dcfce7;
  display: grid;
  place-items: center;
  color: #16a34a;
  flex-shrink: 0;
}

.home__activity-icon--booking {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #dcfce7;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.home__activity-icon--booking svg {
  width: 16px;
  height: 16px;
}

.home__activity-icon svg {
  width: 26px;
  height: 26px;
}

.home__activity-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.home__activity-address {
  margin: 0;
  font-size: 13.2px;
  color: #4b5563;
  font-weight: 400;
  line-height: 1.4;
  min-width: 0;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.home__activity-title {
  margin: 0;
  font-size: 15.4px;
  font-weight: 600;
  color: #1f2937;
  min-width: 0;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.home__activity-period {
  margin: 0;
  font-size: 13.2px;
  color: #4b5563;
  font-weight: 500;
  min-width: 0;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.home__activity-meta {
  margin: 0;
  font-size: 12.2px;
  color: #6b7280;
  min-width: 0;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.home__activity-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.home__activity-status-label {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  background-color: #e5e7eb;
  color: #4b5563;
}

.home__activity-item--booking .home__activity-status-label {
  background-color: transparent;
  color: #16a34a;
  padding: 0;
  border-radius: 0;
  font-size: 13.2px;
  font-weight: 600;
}

.home__activity-status-label--success {
  background-color: #dcfce7;
  color: #166534;
}

.home__activity-status-label--neutral {
  background-color: #e5e7eb;
  color: #4b5563;
}

.home__activity-status-meta {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.home__activity-item--booking .home__activity-status-meta {
  color: #22C55E;
  font-weight: 600;
  font-size: 13.2px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  min-width: 0;
}

.home__activity-item--booking .home__activity-status {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
  max-width: 100px;
  flex-shrink: 1;
}

.home__activity-item--booking .home__activity-status-label {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  text-align: right;
  color: #22C55E;
  background-color: transparent;
  padding: 0;
  overflow-wrap: break-word;
  min-width: 0;
}

.home__activity-item--booking .home__activity-status-meta {
  color: #22C55E;
  font-weight: 600;
}

.home__activity-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.home__activity-empty-icon {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home__activity-empty-icon svg {
  width: 46px;
  height: 37px;
  display: block;
}

.home__activity-empty-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #6B7280;
}

@media (max-width: 480px) {
  .home {
    padding-top: 0;
    padding-left: calc(env(safe-area-inset-left) + 20px);
    padding-right: calc(env(safe-area-inset-right) + 20px);
    padding-bottom: 40px;
    gap: 32px;
    max-width: 100%;
  }

  .home__greeting {
    margin-left: calc(env(safe-area-inset-left) * -1 - 20px);
    margin-right: calc(env(safe-area-inset-right) * -1 - 20px);
    padding: calc(env(safe-area-inset-top) + 60px) calc(env(safe-area-inset-right) + 20px) 24px calc(env(safe-area-inset-left) + 20px);
  }

  .home__actions {
    gap: 16px;
  }
  
  .home__stats {
    gap: 16px;
  }

  .home__activity-filters {
    gap: 6px;
    padding: 6px;
  }

  .home__activity-filter {
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
  }

  .home__activity-filter-icon {
    width: 18px;
    height: 18px;
  }

  .home__activity-filter svg {
    width: 16px;
    height: 16px;
  }

  .home__activity-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .home__activity-item--booking {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 16px;
  }

  .home__activity-item--booking .home__activity-content {
    flex: 1;
    min-width: 0;
    gap: 4px;
    overflow: hidden;
  }

  .home__activity-item--booking .home__activity-title {
    font-size: 14px;
    line-height: 1.3;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .home__activity-item--booking .home__activity-address {
    font-size: 12px;
    line-height: 1.4;
  }

  .home__activity-item--booking .home__activity-period {
    font-size: 11px;
  }

  .home__activity-status {
    align-items: flex-start;
  }

  .home__activity-item--booking .home__activity-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 1;
    text-align: right;
    gap: 0;
    min-width: 0;
    max-width: 90px;
  }

  .home__activity-item--booking .home__activity-status-label {
    font-size: 11px;
    line-height: 1.3;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    color: #22C55E;
    background-color: transparent;
    padding: 0;
    min-width: 0;
  }

  .home__activity-item--booking .home__activity-status-meta {
    font-size: 11px;
    line-height: 1.3;
    color: #22C55E;
    font-weight: 600;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    min-width: 0;
  }

  .home__activity-item--booking .home__activity-icon--booking {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
}

/* iPhone 13-14 Pro specific adjustments */
@media (max-width: 428px) and (min-height: 844px) {
  .home {
    gap: 32px;
  }

  .home__action-card,
  .home__stat-card {
    padding: 20px;
  }

  .home__action-icon,
  .home__stat-icon {
    width: 56px;
    height: 56px;
  }
}

/* Tablet styles (768px and up) */
@media (min-width: 768px) {
  .home {
    max-width: 100%;
    padding-left: calc(env(safe-area-inset-left) + 48px);
    padding-right: calc(env(safe-area-inset-right) + 48px);
    padding-bottom: 64px;
    gap: 48px;
  }

  .home__greeting {
    padding: calc(env(safe-area-inset-top) + 80px) calc(env(safe-area-inset-right) + 32px) 32px calc(env(safe-area-inset-left) + 32px);
    margin-left: calc(env(safe-area-inset-left) * -1 - 32px);
    margin-right: calc(env(safe-area-inset-right) * -1 - 32px);
  }

  .home__greeting-title {
    font-size: 32px;
  }

  .home__greeting-subtitle {
    font-size: 18px;
  }

  .home__greeting-icon {
    width: 80px;
    height: 80px;
  }

  .home__actions {
    gap: 32px;
  }

  .home__stats {
    gap: 32px;
  }

  .home__action-card {
    padding: 40px;
    gap: 28px;
  }

  .home__action-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
  }

  .home__action-icon img,
  .home__action-icon svg {
    width: 32px;
    height: 32px;
  }

  .home__action-title {
    font-size: 20px;
  }

  .home__action-subtitle {
    font-size: 15px;
  }

  .home__stat-card {
    padding: 32px;
    gap: 20px;
  }

  .home__stat-icon {
    width: 64px;
    height: 64px;
  }

  .home__stat-title {
    font-size: 18px;
  }

  .home__stat-caption {
    font-size: 15px;
  }

  .home__section-title {
    font-size: 20px;
  }

  .home__activity-card {
    padding: 24px;
  }

  .home__activity-filters {
    padding: 10px;
    gap: 10px;
  }

  .home__activity-filter {
    padding: 14px 28px;
    font-size: 15px;
  }
}

/* Small desktop styles (1024px and up, like MacBook Air 13") */
@media (min-width: 1024px) {
  .home {
    max-width: 1200px;
    padding-left: calc(env(safe-area-inset-left) + 48px);
    padding-right: calc(env(safe-area-inset-right) + 48px);
    padding-bottom: 80px;
    gap: 56px;
  }

  .home__greeting {
    padding: calc(env(safe-area-inset-top) + 100px) calc(env(safe-area-inset-right) + 48px) 40px calc(env(safe-area-inset-left) + 48px);
    margin-left: calc(env(safe-area-inset-left) * -1 - 48px);
    margin-right: calc(env(safe-area-inset-right) * -1 - 48px);
  }

  .home__greeting-title {
    font-size: 36px;
  }

  .home__greeting-subtitle {
    font-size: 20px;
  }

  .home__greeting-icon {
    width: 96px;
    height: 96px;
  }

  .home__greeting-icon svg {
    width: 24px;
    height: 24px;
  }

  .home__actions {
    gap: 40px;
  }

  .home__stats {
    gap: 40px;
  }

  .home__action-card {
    padding: 48px;
    gap: 32px;
    border-radius: 28px;
  }

  .home__action-icon {
    width: 96px;
    height: 96px;
    border-radius: 24px;
  }

  .home__action-icon img,
  .home__action-icon svg {
    width: 40px;
    height: 40px;
  }

  .home__action-title {
    font-size: 24px;
  }

  .home__action-subtitle {
    font-size: 16px;
    margin-top: 16px;
  }

  .home__stat-card {
    padding: 40px;
    gap: 24px;
    border-radius: 20px;
  }

  .home__stat-icon {
    width: 80px;
    height: 80px;
  }

  .home__stat-icon-figure[width="14"] {
    width: 18px;
    height: 20px;
  }

  .home__stat-icon-figure[width="16"] {
    width: 20px;
    height: 20px;
  }

  .home__stat-count {
    padding: 6px 16px;
    font-size: 14px;
  }

  .home__stat-title {
    font-size: 20px;
  }

  .home__stat-caption {
    font-size: 16px;
  }

  .home__section-title {
    font-size: 24px;
  }

  .home__section-action {
    font-size: 16px;
    padding: 8px 16px;
  }

  .home__activity-card {
    padding: 32px;
    border-radius: 20px;
  }

  .home__activity-filters {
    padding: 12px;
    gap: 12px;
    border-radius: 20px;
  }

  .home__activity-filter {
    padding: 16px 32px;
    font-size: 16px;
    gap: 10px;
    border-radius: 14px;
  }

  .home__activity-filter-icon {
    width: 24px;
    height: 24px;
  }

  .home__activity-filter svg[width="14"] {
    width: 18px;
    height: 18px;
  }

  .home__activity-filter svg[width="15"] {
    width: 19px;
    height: 14px;
  }

  .home__activity-item {
    padding: 32px;
    border-radius: 20px;
    gap: 24px;
  }

  .home__activity-icon {
    width: 72px;
    height: 72px;
    border-radius: 20px;
  }

  .home__activity-icon svg {
    width: 32px;
    height: 32px;
  }

  .home__activity-title {
    font-size: 18px;
  }

  .home__activity-period {
    font-size: 15px;
  }

  .home__activity-meta {
    font-size: 14px;
  }

  .home__activity-status-label {
    padding: 6px 16px;
    font-size: 14px;
  }

  .home__activity-status-meta {
    font-size: 13px;
  }

  .home__activity-empty {
    padding: 80px 32px;
  }

  .home__activity-empty-icon svg {
    width: 64px;
    height: 52px;
  }

  .home__activity-empty-text {
    font-size: 18px;
  }
}

/* Large desktop styles (1440px and up) */
@media (min-width: 1440px) {
  .home {
    max-width: 1400px;
    padding-left: calc(env(safe-area-inset-left) + 64px);
    padding-right: calc(env(safe-area-inset-right) + 64px);
  }

  .home__greeting {
    padding: calc(env(safe-area-inset-top) + 120px) calc(env(safe-area-inset-right) + 64px) 48px calc(env(safe-area-inset-left) + 64px);
    margin-left: calc(env(safe-area-inset-left) * -1 - 64px);
    margin-right: calc(env(safe-area-inset-right) * -1 - 64px);
  }
}
</style>

