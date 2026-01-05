<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  selectedAddress?: string
  currentUser?: { phone?: string } | null
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'success'): void
  (e: 'open-map'): void
  (e: 'update-address', address: string): void
}>()

// Address
const address = ref(props.selectedAddress || '')
const showMapSelector = () => {
  emit('open-map')
}

// Watch for changes in selectedAddress prop
watch(() => props.selectedAddress, (newAddress) => {
  if (newAddress) {
    address.value = newAddress
    emit('update-address', newAddress)
  }
}, { immediate: true })

// Watch for local address changes
watch(address, (newAddress) => {
  emit('update-address', newAddress)
})

// Vehicle type restrictions
const vehicleTypes = ref([
  { id: 'car', label: 'Легковой / Кроссовер', subtitle: 'Стандартные легковые машины', icon: 'car', selected: true },
  { id: 'van', label: 'Фургон/Минивэн', subtitle: 'Коммерческие фургоны, минивэны', icon: 'van', selected: false },
  { id: 'truck', label: 'Грузовик', subtitle: 'Малотоннажные грузовики', icon: 'truck', selected: false },
])

const toggleVehicleType = (id: string) => {
  const type = vehicleTypes.value.find(t => t.id === id)
  if (type) {
    type.selected = !type.selected
  }
}

// Photos
const photos = ref<File[]>([])
const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    photos.value = Array.from(input.files)
  }
}

// Availability toggles
const hourlyRent = ref(true)
const dailyRent = ref(true)
const monthlyRent = ref(false)


// Pricing
const pricePerHour = ref('')
const pricePerDay = ref('800')
const pricePerMonth = ref('15000')

// Filter input to only allow numbers
const filterNumbers = (value: string) => {
  return value.replace(/[^\d]/g, '')
}

const handlePriceInput = (field: 'hourly' | 'daily' | 'monthly', value: string) => {
  // Remove Ruble symbol if present
  const cleanedValue = value.replace('₽', '')
  const filtered = filterNumbers(cleanedValue)
  if (field === 'hourly') {
    pricePerHour.value = filtered
  } else if (field === 'daily') {
    pricePerDay.value = filtered
  } else if (field === 'monthly') {
    pricePerMonth.value = filtered
  }
}

// Get display value with Ruble symbol
const getPriceDisplayValue = (value: string) => {
  return value ? value + '₽' : ''
}

const handlePriceKeydown = (event: KeyboardEvent) => {
  // Allow: backspace, delete, tab, escape, enter, and arrow keys
  if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(event.keyCode) !== -1 ||
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (event.keyCode === 65 && event.ctrlKey === true) ||
    (event.keyCode === 67 && event.ctrlKey === true) ||
    (event.keyCode === 86 && event.ctrlKey === true) ||
    (event.keyCode === 88 && event.ctrlKey === true)) {
    // Close keyboard on Enter/Done
    if (event.keyCode === 13) {
      (event.target as HTMLInputElement).blur()
    }
    return
  }
  // Ensure that it is a number and stop the keypress
  if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
    event.preventDefault()
  }
}

const handlePricePaste = (event: ClipboardEvent, field: 'hourly' | 'daily' | 'monthly') => {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const filtered = filterNumbers(pastedText)
  if (field === 'hourly') {
    pricePerHour.value = filtered
  } else if (field === 'daily') {
    pricePerDay.value = filtered
  } else if (field === 'monthly') {
    pricePerMonth.value = filtered
  }
}

// Period of availability
const permanentAvailability = ref(false)
// Используем формат YYYY-MM-DD для date input
const fromDate = ref('2024-12-15')
const toDate = ref('2025-03-15')
const selectedDays = ref(['Пн', 'Вт', 'Ср', 'Чт', 'Пт'])
const fromTime = ref('08:00')
const toTime = ref('22:00')

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const toggleDay = (day: string) => {
  const index = selectedDays.value.indexOf(day)
  if (index > -1) {
    selectedDays.value.splice(index, 1)
  } else {
    selectedDays.value.push(day)
  }
}

// Place features
const features = ref([
  { id: 'covered', label: 'Крытая парковка', icon: 'house', selected: false },
  { id: 'security', label: 'Охрана', icon: 'shield', selected: false },
  { id: 'ev', label: 'Электрозарядка', icon: 'lightning', selected: false },
  { id: 'courtyard', label: 'Парковка во дворе', icon: 'building', selected: false },
  { id: 'private', label: 'Частная территория', icon: 'lock', selected: false },
])

const toggleFeature = (id: string) => {
  const feature = features.value.find(f => f.id === id)
  if (feature) {
    feature.selected = !feature.selected
  }
}

// Description
const description = ref('')

// Submit
const isSubmitting = ref(false)
const canSubmit = computed(() => {
  const hasAddress = address.value.trim() !== ''
  
  // Проверяем, что для каждого активного типа аренды заполнена стоимость
  const hourlyPriceValid = !hourlyRent.value || pricePerHour.value.trim() !== ''
  const dailyPriceValid = !dailyRent.value || pricePerDay.value.trim() !== ''
  const monthlyPriceValid = !monthlyRent.value || pricePerMonth.value.trim() !== ''
  
  // Проверяем, что хотя бы один тип аренды выбран
  const hasRentType = hourlyRent.value || dailyRent.value || monthlyRent.value
  
  return hasAddress && hasRentType && hourlyPriceValid && dailyPriceValid && monthlyPriceValid
})

const showError = ref(false)

const handleSubmit = () => {
  if (!canSubmit.value) return
  isSubmitting.value = true
  // TODO: Implement submission logic
  setTimeout(() => {
    isSubmitting.value = false
    // Check if test user (79991234567) - show error screen
    if (props.currentUser?.phone === '+79991234567' || props.currentUser?.phone === '79991234567') {
      showError.value = true
    } else {
      emit('success')
    }
  }, 2000)
}

const handleRetry = () => {
  showError.value = false
}
</script>

<template>
  <!-- Error Screen -->
  <section v-if="showError" class="rent-out-error">
    <div class="rent-out-error__container">
      <div class="rent-out-error__icon-wrapper">
        <svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" class="rent-out-error__icon">
          <path d="M40.8516 31.5703C42.1172 33.8203 40.5 36.5625 37.8984 36.5625H4.21875C1.61719 36.5625 0 33.75 1.26562 31.5703L18.1406 2.25C19.4062 0 22.7109 0.0703125 23.9766 2.25L40.8516 31.5703ZM21.0938 25.4531C19.2656 25.4531 17.8594 26.9297 17.8594 28.6875C17.8594 30.5156 19.2656 31.9219 21.0938 31.9219C22.8516 31.9219 24.3281 30.5156 24.3281 28.6875C24.3281 26.9297 22.8516 25.4531 21.0938 25.4531ZM18 13.8516L18.4922 23.4141C18.5625 23.9062 18.9141 24.1875 19.3359 24.1875H22.7812C23.2031 24.1875 23.5547 23.9062 23.625 23.4141L24.1172 13.8516C24.1875 13.3594 23.7656 12.9375 23.2734 12.9375H18.8438C18.3516 12.9375 17.9297 13.3594 18 13.8516Z" fill="#DC2626"/>
        </svg>
      </div>
      <h1 class="rent-out-error__title">Ошибка</h1>
      <p class="rent-out-error__message">Не удалось опубликовать место. Попробуйте еще раз.</p>
    </div>
    <div class="rent-out-error__footer">
      <button type="button" class="rent-out-error__retry" @click="handleRetry">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.332 0C17.543 0 17.7539 0.210938 17.7539 0.421875V7.48828C17.7539 7.69922 17.543 7.91016 17.332 7.91016H10.3008C10.0547 7.91016 9.87891 7.69922 9.87891 7.48828V5.80078H9.84375C9.84375 5.58984 10.0547 5.37891 10.2656 5.37891C10.3008 5.37891 10.3008 5.37891 10.3008 5.37891L13.8867 5.55469C12.7617 3.90234 10.8633 2.8125 8.75391 2.8125C5.30859 2.8125 2.56641 5.58984 2.56641 9C2.56641 12.4453 5.30859 15.1875 8.75391 15.1875C10.3008 15.1875 11.7422 14.625 12.832 13.6758C12.9023 13.6055 13.0078 13.5703 13.1133 13.5703C13.2188 13.5703 13.3242 13.6055 13.3945 13.6758L14.5898 14.8711C14.6602 14.9414 14.7305 15.0469 14.7305 15.1875C14.7305 15.293 14.6602 15.3984 14.5898 15.5039C13.043 16.875 11.0039 17.7188 8.75391 17.7188C3.9375 17.7188 0.0351562 13.8516 0.0351562 9.03516C0 4.21875 3.9375 0.28125 8.75391 0.28125C11.3906 0.28125 13.7812 1.47656 15.3633 3.375L15.2227 0.457031C15.2227 0.457031 15.2227 0.457031 15.2227 0.421875C15.2227 0.210938 15.4336 0 15.6445 0H17.332Z" fill="#DC2626"/>
        </svg>
        <span>Попробовать снова</span>
      </button>
    </div>
  </section>

  <!-- Main Form -->
  <section v-else class="rent-out">
    <header class="rent-out__header">
      <button type="button" class="rent-out__back" @click="emit('back')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z" fill="white"/>
        </svg>
      </button>
      <h1 class="rent-out__title">Сдать парковочное место</h1>
      <div class="rent-out__header-spacer"></div>
    </header>

    <div class="rent-out__content">
      <!-- Address Section -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Адрес парковки</h2>
        <button type="button" class="rent-out__map-selector" @click="showMapSelector">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.625 7C15.8125 7 16 7.1875 16 7.375V8.625C16 8.84375 15.8125 9 15.625 9H14.6562C14.2188 11.9375 11.9062 14.25 9 14.6875V15.625C9 15.8438 8.8125 16 8.625 16H7.375C7.15625 16 7 15.8438 7 15.625V14.6875C4.0625 14.25 1.75 11.9375 1.3125 9H0.375C0.15625 9 0 8.84375 0 8.625V7.375C0 7.1875 0.15625 7 0.375 7H1.3125C1.75 4.09375 4.0625 1.78125 7 1.34375V0.375C7 0.1875 7.15625 0 7.375 0H8.625C8.8125 0 9 0.1875 9 0.375V1.34375C11.9062 1.78125 14.2188 4.09375 14.6562 7H15.625ZM9 12.6562C10.8125 12.2812 12.25 10.8438 12.625 9H11.375C11.1562 9 11 8.84375 11 8.625V7.375C11 7.1875 11.1562 7 11.375 7H12.625C12.25 5.1875 10.8125 3.75 9 3.375V4.625C9 4.84375 8.8125 5 8.625 5H7.375C7.15625 5 7 4.84375 7 4.625V3.375C5.15625 3.75 3.71875 5.1875 3.34375 7H4.625C4.8125 7 5 7.1875 5 7.375V8.625C5 8.84375 4.8125 9 4.625 9H3.34375C3.71875 10.8438 5.15625 12.2812 7 12.6562V11.375C7 11.1875 7.15625 11 7.375 11H8.625C8.8125 11 9 11.1875 9 11.375V12.6562ZM9 8C9 8.5625 8.53125 9 8 9C7.4375 9 7 8.5625 7 8C7 7.46875 7.4375 7 8 7C8.53125 7 9 7.46875 9 8Z" fill="#1D4ED8"/>
          </svg>
          <span>Выбрать адрес на карте</span>
        </button>
        <input
          v-model="address"
          type="text"
          class="rent-out__input"
          placeholder="Введите адрес..."
        />
      </section>

      <!-- Vehicle Type Restrictions -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Ограничения по типу автомобиля</h2>
        <div class="rent-out__vehicle-types">
          <button
            v-for="type in vehicleTypes"
            :key="type.id"
            type="button"
            class="rent-out__vehicle-type"
            :class="{ 'rent-out__vehicle-type--selected': type.selected }"
            @click="toggleVehicleType(type.id)"
          >
            <div class="rent-out__vehicle-checkbox" :class="{ 'rent-out__vehicle-checkbox--checked': type.selected }">
              <svg v-if="type.selected" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="rent-out__vehicle-icon" :class="`rent-out__vehicle-icon--${type.icon}`">
              <svg v-if="type.icon === 'car'" width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6133 3.9375C17.8945 3.9375 18.1055 4.21875 18.0352 4.46484L17.8242 5.30859C17.7891 5.51953 17.6133 5.625 17.4375 5.625H16.6992C17.1914 6.04688 17.5078 6.64453 17.5078 7.3125V9C17.5078 9.59766 17.2617 10.0898 16.9453 10.4766V12.375C16.9453 13.0078 16.418 13.5 15.8203 13.5H14.6953C14.0625 13.5 13.5703 13.0078 13.5703 12.375V11.25H4.57031V12.375C4.57031 13.0078 4.04297 13.5 3.44531 13.5H2.32031C1.6875 13.5 1.19531 13.0078 1.19531 12.375V10.4766C0.84375 10.0898 0.632812 9.59766 0.632812 9V7.3125C0.632812 6.64453 0.914062 6.04688 1.40625 5.625H0.703125C0.492188 5.625 0.316406 5.51953 0.28125 5.30859L0.0703125 4.46484C0 4.21875 0.210938 3.9375 0.492188 3.9375H2.56641L3.16406 2.49609C3.76172 0.984375 5.20312 0 6.82031 0H11.2852C12.9023 0 14.3438 0.984375 14.9414 2.49609L15.5391 3.9375H17.6133ZM5.23828 3.33984L4.57031 5.0625H13.5703L12.8672 3.33984C12.5859 2.67188 11.9883 2.25 11.2852 2.25H6.82031C6.11719 2.25 5.51953 2.67188 5.23828 3.33984ZM3.44531 9C4.11328 9 5.13281 9.10547 5.13281 8.4375C5.13281 7.76953 4.11328 6.75 3.44531 6.75C2.74219 6.75 2.32031 7.20703 2.32031 7.875C2.32031 8.57812 2.74219 9 3.44531 9ZM14.6953 9C15.3633 9 15.8203 8.57812 15.8203 7.875C15.8203 7.20703 15.3633 6.75 14.6953 6.75C13.9922 6.75 13.0078 7.76953 13.0078 8.4375C13.0078 9.10547 13.9922 9 14.6953 9Z" fill="#2563EB"/>
              </svg>
              <svg v-else-if="type.icon === 'van'" width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.0781 6.29297C22.3594 6.60938 22.5 6.99609 22.5 7.38281V11.25C22.5 11.8828 21.9727 12.375 21.375 12.375H20.25C20.25 14.2734 18.7383 15.75 16.875 15.75C14.9766 15.75 13.5 14.2734 13.5 12.375H9C9 14.2734 7.48828 15.75 5.625 15.75C3.72656 15.75 2.25 14.2734 2.25 12.375H1.125C0.492188 12.375 0 11.8828 0 11.25V1.125C0 0.527344 0.492188 0 1.125 0H16.0664C16.5938 0.0351562 17.0508 0.246094 17.3672 0.632812L22.0781 6.29297ZM2.25 5.625H5.625V2.25H2.25V5.625ZM5.625 14.0625C6.53906 14.0625 7.3125 13.3242 7.3125 12.375C7.3125 11.4609 6.53906 10.6875 5.625 10.6875C4.67578 10.6875 3.9375 11.4609 3.9375 12.375C3.9375 13.3242 4.67578 14.0625 5.625 14.0625ZM11.25 5.625V2.25H7.875V5.625H11.25ZM16.875 14.0625C17.7891 14.0625 18.5625 13.3242 18.5625 12.375C18.5625 11.4609 17.7891 10.6875 16.875 10.6875C15.9258 10.6875 15.1875 11.4609 15.1875 12.375C15.1875 13.3242 15.9258 14.0625 16.875 14.0625ZM13.5 5.625H18.6328L15.8203 2.25H13.5V5.625Z" fill="#EA580C"/>
              </svg>
              <svg v-else-if="type.icon === 'truck'" width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.9375 12.375C22.2188 12.375 22.5 12.6562 22.5 12.9375V14.0625C22.5 14.3789 22.2188 14.625 21.9375 14.625H20.25C20.25 16.4883 18.7383 18 16.875 18C15.0117 18 13.5 16.4883 13.5 14.625H9C9 16.4883 7.48828 18 5.625 18C3.76172 18 2.25 16.4883 2.25 14.625H1.6875C0.738281 14.625 0 13.8867 0 12.9375V1.6875C0 0.773438 0.738281 0 1.6875 0H12.9375C13.8516 0 14.625 0.773438 14.625 1.6875V3.375H16.1719C16.5938 3.375 17.0508 3.58594 17.3672 3.90234L20.8477 7.38281C21.1641 7.69922 21.375 8.15625 21.375 8.57812V12.375H21.9375ZM5.625 16.3125C6.53906 16.3125 7.3125 15.5742 7.3125 14.625C7.3125 13.7109 6.53906 12.9375 5.625 12.9375C4.67578 12.9375 3.9375 13.7109 3.9375 14.625C3.9375 15.5742 4.67578 16.3125 5.625 16.3125ZM16.875 16.3125C17.7891 16.3125 18.5625 15.5742 18.5625 14.625C18.5625 13.7109 17.7891 12.9375 16.875 12.9375C15.9258 12.9375 15.1875 13.7109 15.1875 14.625C15.1875 15.5742 15.9258 16.3125 16.875 16.3125ZM19.6875 9V8.57812L16.1719 5.0625H14.625V9H19.6875Z" fill="#DC2626"/>
              </svg>
            </div>
            <div class="rent-out__vehicle-content">
              <div class="rent-out__vehicle-label">{{ type.label }}</div>
              <div class="rent-out__vehicle-subtitle">{{ type.subtitle }}</div>
            </div>
          </button>
        </div>
      </section>

      <!-- Photos Section -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Фотографии места</h2>
        <div class="rent-out__photos">
          <label class="rent-out__photo-upload">
            <input type="file" accept="image/*" multiple @change="handlePhotoUpload" style="display: none;" />
            <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 5.25V18.75C24 20.0156 22.9688 21 21.75 21H2.25C0.984375 21 0 20.0156 0 18.75V5.25C0 4.03125 0.984375 3 2.25 3H6.375L6.9375 1.5C7.26562 0.609375 8.10938 0 9.04688 0H14.9062C15.8438 0 16.6875 0.609375 17.0156 1.5L17.625 3H21.75C22.9688 3 24 4.03125 24 5.25ZM17.625 12C17.625 8.90625 15.0938 6.375 12 6.375C8.85938 6.375 6.375 8.90625 6.375 12C6.375 15.1406 8.85938 17.625 12 17.625C15.0938 17.625 17.625 15.1406 17.625 12ZM16.125 12C16.125 14.2969 14.25 16.125 12 16.125C9.70312 16.125 7.875 14.2969 7.875 12C7.875 9.75 9.70312 7.875 12 7.875C14.25 7.875 16.125 9.75 16.125 12Z" fill="#9CA3AF"/>
            </svg>
            <span>Добавить фото</span>
          </label>
          <div class="rent-out__photo-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="rent-out__photo-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </section>

      <!-- Availability Section -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Доступность</h2>
        <div class="rent-out__availability">
          <div class="rent-out__availability-item">
            <div class="rent-out__availability-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M10 6V10L12 12" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Почасовая аренда</span>
            </div>
            <label class="rent-out__toggle">
              <input type="checkbox" v-model="hourlyRent" />
              <span class="rent-out__toggle-slider"></span>
            </label>
          </div>
          <div class="rent-out__availability-item">
            <div class="rent-out__availability-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Посуточная аренда</span>
            </div>
            <label class="rent-out__toggle">
              <input type="checkbox" v-model="dailyRent" />
              <span class="rent-out__toggle-slider"></span>
            </label>
          </div>
          <div class="rent-out__availability-item">
            <div class="rent-out__availability-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
                <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Помесячная аренда</span>
            </div>
            <label class="rent-out__toggle">
              <input type="checkbox" v-model="monthlyRent" />
              <span class="rent-out__toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Стоимость аренды</h2>
        <div class="rent-out__pricing">
          <div class="rent-out__price-field" v-if="hourlyRent">
            <label class="rent-out__price-label">За час</label>
            <input
              :value="getPriceDisplayValue(pricePerHour)"
              @input="handlePriceInput('hourly', ($event.target as HTMLInputElement).value)"
              @keydown="handlePriceKeydown"
              @paste="handlePricePaste($event, 'hourly')"
              @blur="(e) => (e.target as HTMLInputElement).blur()"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              enterkeyhint="done"
              class="rent-out__price-input"
              :class="{ 'rent-out__price-input--active': hourlyRent }"
              placeholder="₽"
            />
          </div>
          <div class="rent-out__price-field" v-if="dailyRent">
            <label class="rent-out__price-label">За сутки</label>
            <input
              :value="getPriceDisplayValue(pricePerDay)"
              @input="handlePriceInput('daily', ($event.target as HTMLInputElement).value)"
              @keydown="handlePriceKeydown"
              @paste="handlePricePaste($event, 'daily')"
              @blur="(e) => (e.target as HTMLInputElement).blur()"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              enterkeyhint="done"
              class="rent-out__price-input"
              :class="{ 'rent-out__price-input--active': dailyRent && !hourlyRent }"
              placeholder="₽"
            />
          </div>
          <div class="rent-out__price-field" v-if="monthlyRent">
            <label class="rent-out__price-label">За месяц</label>
            <input
              :value="getPriceDisplayValue(pricePerMonth)"
              @input="handlePriceInput('monthly', ($event.target as HTMLInputElement).value)"
              @keydown="handlePriceKeydown"
              @paste="handlePricePaste($event, 'monthly')"
              @blur="(e) => (e.target as HTMLInputElement).blur()"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              enterkeyhint="done"
              class="rent-out__price-input"
              :class="{ 'rent-out__price-input--active': monthlyRent && !dailyRent && !hourlyRent }"
              placeholder="₽"
            />
          </div>
        </div>
      </section>

      <!-- Period of Availability -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Период доступности</h2>
        <div class="rent-out__availability-item">
          <div class="rent-out__availability-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="#2563EB" stroke-width="1.5"/>
              <path d="M3 8H17M7 3V5M13 3V5" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>Постоянная доступность</span>
          </div>
          <label class="rent-out__toggle">
            <input type="checkbox" v-model="permanentAvailability" />
            <span class="rent-out__toggle-slider"></span>
          </label>
        </div>

        <!-- Правило 1: Показываем полный календарь когда один из тогглов активен и постоянная доступность НЕ активна -->
        <div v-if="(hourlyRent || dailyRent || monthlyRent) && !permanentAvailability" class="rent-out__period-details">
          <h3 class="rent-out__subsection-title">Календарный период доступности</h3>
          
          <!-- Для почасовой аренды - одно поле даты, дни недели и время -->
          <template v-if="hourlyRent && !dailyRent && !monthlyRent">
            <div class="rent-out__date-fields">
              <div class="rent-out__date-field">
                <label class="rent-out__date-label">Дата</label>
                <div class="rent-out__date-input-wrapper">
                  <input v-model="fromDate" type="date" class="rent-out__date-input" />
                </div>
              </div>
            </div>
            
            <div class="rent-out__weekdays-section">
              <h3 class="rent-out__subsection-title">Дни недели</h3>
              <div class="rent-out__weekdays">
                <button
                  v-for="day in weekDays"
                  :key="day"
                  type="button"
                  class="rent-out__weekday"
                  :class="{ 'rent-out__weekday--selected': selectedDays.includes(day) }"
                  @click="toggleDay(day)"
                >
                  {{ day }}
                </button>
              </div>
            </div>
            
            <div class="rent-out__time-section">
              <h3 class="rent-out__subsection-title">Время доступности</h3>
              <div class="rent-out__time-fields">
                <div class="rent-out__time-field">
                  <label class="rent-out__time-label">С времени</label>
                  <input v-model="fromTime" type="time" class="rent-out__time-input" />
                </div>
                <div class="rent-out__time-field">
                  <label class="rent-out__time-label">До времени</label>
                  <input v-model="toTime" type="time" class="rent-out__time-input" />
                </div>
              </div>
            </div>
          </template>

          <!-- Для помесячной аренды - только даты без времени -->
          <template v-else-if="monthlyRent">
            <div class="rent-out__date-fields">
              <div class="rent-out__date-field">
                <label class="rent-out__date-label">С даты</label>
                <div class="rent-out__date-input-wrapper">
                  <input v-model="fromDate" type="date" class="rent-out__date-input" />
                </div>
              </div>
              <div class="rent-out__date-field">
                <label class="rent-out__date-label">По дату</label>
                <div class="rent-out__date-input-wrapper">
                  <input v-model="toDate" type="date" class="rent-out__date-input" />
                </div>
              </div>
            </div>
          </template>

          <!-- Для других типов аренды - даты и время -->
          <template v-else>
            <div class="rent-out__date-fields">
              <div class="rent-out__date-field">
                <label class="rent-out__date-label">С даты</label>
                <div class="rent-out__date-input-wrapper">
                  <input v-model="fromDate" type="date" class="rent-out__date-input" />
                </div>
              </div>
              <div class="rent-out__date-field">
                <label class="rent-out__date-label">По дату</label>
                <div class="rent-out__date-input-wrapper">
                  <input v-model="toDate" type="date" class="rent-out__date-input" />
                </div>
              </div>
            </div>

            <div v-if="hourlyRent || dailyRent">
              <h3 class="rent-out__subsection-title">Дни недели</h3>
              <div class="rent-out__weekdays">
                <button
                  v-for="day in weekDays"
                  :key="day"
                  type="button"
                  class="rent-out__weekday"
                  :class="{ 'rent-out__weekday--selected': selectedDays.includes(day) }"
                  @click="toggleDay(day)"
                >
                  {{ day }}
                </button>
              </div>

              <div v-if="hourlyRent || (dailyRent && !monthlyRent)" class="rent-out__time-section">
                <h3 class="rent-out__subsection-title">Время доступности</h3>
                <div class="rent-out__time-fields">
                  <div class="rent-out__time-field">
                    <label class="rent-out__time-label">С времени</label>
                    <input v-model="fromTime" type="time" class="rent-out__time-input" />
                  </div>
                  <div class="rent-out__time-field">
                    <label class="rent-out__time-label">До времени</label>
                    <input v-model="toTime" type="time" class="rent-out__time-input" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Правило 2: Показываем тултип когда постоянная доступность активна -->
        <div v-if="permanentAvailability" class="rent-out__info-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="rent-out__info-icon">
            <path d="M7.75 0C12 0 15.5 3.5 15.5 7.75C15.5 12.0312 12 15.5 7.75 15.5C3.46875 15.5 0 12.0312 0 7.75C0 3.5 3.46875 0 7.75 0ZM7.75 3.4375C7 3.4375 6.4375 4.03125 6.4375 4.75C6.4375 5.5 7 6.0625 7.75 6.0625C8.46875 6.0625 9.0625 5.5 9.0625 4.75C9.0625 4.03125 8.46875 3.4375 7.75 3.4375ZM9.5 11.375V10.625C9.5 10.4375 9.3125 10.25 9.125 10.25H8.75V7.125C8.75 6.9375 8.5625 6.75 8.375 6.75H6.375C6.15625 6.75 6 6.9375 6 7.125V7.875C6 8.09375 6.15625 8.25 6.375 8.25H6.75V10.25H6.375C6.15625 10.25 6 10.4375 6 10.625V11.375C6 11.5938 6.15625 11.75 6.375 11.75H9.125C9.3125 11.75 9.5 11.5938 9.5 11.375Z" fill="#16A34A"/>
          </svg>
          <div class="rent-out__info-text">
            <div>Место будет доступно в промежутках</div>
            <div>между бронированиями</div>
          </div>
        </div>
      </section>

      <!-- Place Features -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Особенности места</h2>
        <div class="rent-out__features">
          <button
            v-for="feature in features"
            :key="feature.id"
            type="button"
            class="rent-out__feature"
            :class="{ 'rent-out__feature--selected': feature.selected }"
            @click="toggleFeature(feature.id)"
          >
            <div class="rent-out__feature-checkbox" :class="{ 'rent-out__feature-checkbox--checked': feature.selected }">
              <svg v-if="feature.selected" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="rent-out__feature-icon" :class="`rent-out__feature-icon--${feature.icon}`">
              <svg v-if="feature.icon === 'house'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10L10 3L17 10M5 10V16C5 16.5523 5.44772 17 6 17H8V14C8 13.4477 8.44772 13 9 13H11C11.5523 13 12 13.4477 12 14V17H14C14.5523 17 15 16.5523 15 16V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="feature.icon === 'shield'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L3 5V9C3 13.5 6 17.5 10 18C14 17.5 17 13.5 17 9V5L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="feature.icon === 'lightning'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 2L4 12H10L9 18L16 8H10L11 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="feature.icon === 'building'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 18H17M4 18V9C4 8.44772 4.44772 8 5 8H7C7.55228 8 8 8.44772 8 9V18M8 18H12M12 18V11C12 10.4477 12.4477 10 13 10H15C15.5523 10 16 10.4477 16 11V18M3 6L10 2L17 6M3 6V18M17 6V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="feature.icon === 'lock'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="9" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 9V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="rent-out__feature-label">{{ feature.label }}</span>
          </button>
        </div>
      </section>

      <!-- Description Section -->
      <section class="rent-out__section">
        <h2 class="rent-out__section-title">Описание места и условия въезда/выезда</h2>
        <textarea
          v-model="description"
          class="rent-out__textarea"
          placeholder="Укажите условия въезда и выезда: время работы, способ получения доступа, особые требования."
          rows="6"
        ></textarea>
        <div class="rent-out__info-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="#2563EB" stroke-width="1.5"/>
            <path d="M8 6V8M8 10H8.01" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Обязательно укажите условия въезда и выезда с парковки</span>
        </div>
      </section>
    </div>

    <footer class="rent-out__footer">
      <button
        type="button"
        class="rent-out__button"
        :disabled="isSubmitting || !canSubmit"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Отправка...' : 'Опубликовать объявление' }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.rent-out {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

.rent-out__header {
  padding: calc(env(safe-area-inset-top) + 24px) 24px 24px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.rent-out__back {
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

.rent-out__back svg {
  width: 15px;
  height: 14px;
  display: block;
}

.rent-out__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  flex: 1;
}

.rent-out__header-spacer {
  width: 40px;
  flex-shrink: 0;
}

.rent-out__content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.rent-out__section {
  margin-bottom: 32px;
}

.rent-out__section:last-child {
  margin-bottom: 0;
}

.rent-out__section-title {
  margin: 0 0 12px 0;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.rent-out__map-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background-color: #F9FAFB;
  color: #2563EB;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 12px;
  width: 100%;
  transition: opacity 0.2s ease;
}

.rent-out__map-selector:hover {
  opacity: 0.9;
}

.rent-out__map-selector svg {
  flex-shrink: 0;
}

.rent-out__map-selector span {
  color: #2563EB;
}

.rent-out__input {
  width: 100%;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: #1f2937;
  transition: border-color 0.2s ease;
}

.rent-out__input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.rent-out__vehicle-types {
  display: grid;
  gap: 12px;
}

.rent-out__vehicle-type {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #F9FAFB;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.rent-out__vehicle-type:hover {
  border-color: #d1d5db;
}

.rent-out__vehicle-type--selected {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.rent-out__vehicle-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.rent-out__vehicle-checkbox--checked {
  background-color: #2563EB;
  border-color: #2563EB;
}

.rent-out__vehicle-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rent-out__vehicle-icon svg {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.rent-out__vehicle-icon--car {
  background-color: #DBEAFE;
  color: #2563EB;
}

.rent-out__vehicle-icon--van {
  background-color: #FED7AA;
  color: #EA580C;
}

.rent-out__vehicle-icon--truck {
  background-color: #FEE2E2;
  color: #DC2626;
}

.rent-out__vehicle-content {
  flex: 1;
  display: grid;
  gap: 4px;
}

.rent-out__vehicle-label {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.rent-out__vehicle-subtitle {
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #6b7280;
}

.rent-out__photos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.rent-out__photo-upload,
.rent-out__photo-placeholder {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #F9FAFB;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.rent-out__photo-upload:hover {
  border-color: #9333ea;
}

.rent-out__photo-upload svg {
  color: #6b7280;
}

.rent-out__photo-upload span {
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #6b7280;
}

.rent-out__photo-placeholder svg {
  color: #6b7280;
}

.rent-out__availability {
  display: grid;
  gap: 16px;
}

.rent-out__availability-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #F9FAFB;
}

.rent-out__availability-content {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.rent-out__availability-content svg {
  flex-shrink: 0;
}

.rent-out__toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.rent-out__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.rent-out__toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  border-radius: 24px;
  transition: 0.3s;
}

.rent-out__toggle-slider:before {
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

.rent-out__toggle input:checked + .rent-out__toggle-slider {
  background-color: #2563EB;
}

.rent-out__toggle input:checked + .rent-out__toggle-slider:before {
  transform: translateX(20px);
}

.rent-out__pricing {
  display: grid;
  gap: 16px;
}

.rent-out__price-field {
  display: grid;
  gap: 8px;
}

.rent-out__price-label {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.rent-out__price-input {
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: #1f2937;
  transition: border-color 0.2s ease;
}

.rent-out__price-input--active {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.rent-out__price-input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.rent-out__info-box {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #F0FDF4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rent-out__info-icon {
  flex-shrink: 0;
}

.rent-out__info-text {
  flex: 1;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #166534;
}

.rent-out__period-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: grid;
  gap: 20px;
}

.rent-out__subsection-title {
  margin: 0 0 12px 0;
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.rent-out__date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Для одного поля даты (почасовая аренда) */
.rent-out__date-fields:has(.rent-out__date-field:only-child) {
  grid-template-columns: 1fr;
}

.rent-out__date-field {
  display: grid;
  gap: 8px;
}

.rent-out__date-label {
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #6b7280;
}

.rent-out__date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.rent-out__date-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
}

.rent-out__date-input-wrapper svg {
  position: absolute;
  right: 12px;
  pointer-events: none;
}

.rent-out__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.rent-out__weekday {
  aspect-ratio: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-out__weekday:hover {
  border-color: #9333ea;
}

.rent-out__weekday--selected {
  background-color: #2563EB;
  border-color: #2563EB;
  color: #ffffff;
}

.rent-out__time-section {
  margin-top: 20px;
}

.rent-out__time-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.rent-out__time-fields--with-margin {
  margin-top: 20px;
}

.rent-out__time-field {
  display: grid;
  gap: 8px;
}

.rent-out__time-label {
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #6b7280;
}

.rent-out__time-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1f2937;
}

.rent-out__features {
  display: grid;
  gap: 12px;
}

.rent-out__feature {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #F9FAFB;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.rent-out__feature:hover {
  border-color: #d1d5db;
}

.rent-out__feature--selected {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.rent-out__feature-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.rent-out__feature-checkbox--checked {
  background-color: #2563EB;
  border-color: #2563EB;
}

.rent-out__feature-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rent-out__feature-icon--house {
  background-color: #DBEAFE;
  color: #2563EB;
}

.rent-out__feature-icon--shield {
  background-color: #DCFCE7;
  color: #16A34A;
}

.rent-out__feature-icon--lightning {
  background-color: #FEF3C7;
  color: #D97706;
}

.rent-out__feature-icon--building {
  background-color: #DBEAFE;
  color: #2563EB;
}

.rent-out__feature-icon--lock {
  background-color: #F3E8FF;
  color: #9333EA;
}

.rent-out__feature-label {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.rent-out__textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #F9FAFB;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: #1f2937;
  resize: vertical;
  min-height: 140px;
  transition: border-color 0.2s ease;
}

.rent-out__textarea:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.rent-out__info-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background-color: #EFF6FF;
  border-radius: 8px;
}

.rent-out__info-message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.rent-out__info-message span {
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1E40AF;
  line-height: 1.5;
}

.rent-out__footer {
  padding: 24px;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.rent-out__button {
  width: 100%;
  padding: 20px 0;
  border: none;
  border-radius: 12px;
  background: #D1D5DB;
  color: #6B7280;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-out__button:not(:disabled) {
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
}

.rent-out__button:disabled {
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .rent-out__header {
    padding: calc(env(safe-area-inset-top) + 32px) 48px 32px;
  }

  .rent-out__content {
    padding: 40px 48px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .rent-out__footer {
    padding: 32px 48px;
    padding-bottom: calc(32px + env(safe-area-inset-bottom));
  }

  .rent-out__title {
    font-size: 20px;
  }
}

@media (min-width: 1024px) {
  .rent-out__content {
    max-width: 700px;
    padding: 48px 64px;
  }

  .rent-out__footer {
    padding: 40px 64px;
    padding-bottom: calc(40px + env(safe-area-inset-bottom));
  }
}

@media (min-width: 1440px) {
  .rent-out__content {
    max-width: 600px;
  }
}

/* Error Screen Styles */
.rent-out-error {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
}

.rent-out-error__container {
  flex: 1;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 24px;
}

.rent-out-error__icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border: 8px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rent-out-error__icon {
  width: 43px;
  height: 37px;
}

.rent-out-error__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  color: #ffffff;
}

.rent-out-error__message {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  opacity: 0.9;
}

.rent-out-error__retry {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background-color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #DC2626;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-out-error__retry:hover {
  background-color: #FEE2E2;
}

.rent-out-error__retry:active {
  background-color: #FECACA;
}

.rent-out-error__retry svg {
  width: 18px;
  height: 18px;
}

.rent-out-error__footer {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}
</style>
