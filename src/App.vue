<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppBottomNav from './components/AppBottomNav.vue'
import { featuredParkings, type ParkingSpot } from './data/parkings'
import ActiveBookingScreen from './views/ActiveBookingScreen.vue'
import BookingSummaryScreen from './views/BookingSummaryScreen.vue'
import HomeScreen from './views/HomeScreen.vue'
import LoadingScreen from './views/LoadingScreen.vue'
import OnboardingScreen from './views/OnboardingScreen.vue'
import OnboardingScreen1 from './views/OnboardingScreen1.vue'
import OnboardingScreen2 from './views/OnboardingScreen2.vue'
import LoginScreen from './views/LoginScreen.vue'
import RegistrationScreen from './views/RegistrationScreen.vue'
import CodeVerificationScreen from './views/CodeVerificationScreen.vue'
import GeoConfirmationScreen from './views/GeoConfirmationScreen.vue'
import ParkingDetailsScreen from './views/ParkingDetailsScreen.vue'
import PlaceholderScreen from './views/PlaceholderScreen.vue'
import RentOutScreen from './views/RentOutScreen.vue'
import RentOutSuccessScreen from './views/RentOutSuccessScreen.vue'
import RentOutMapScreen from './views/RentOutMapScreen.vue'
import MapSelectionScreen from './views/MapSelectionScreen.vue'
import SearchScreen from './views/SearchScreen.vue'
import ChatScreen from './views/ChatScreen.vue'
import ParkingSpotDetailsScreen from './views/ParkingSpotDetailsScreen.vue'
import BookingDatesScreen from './views/BookingDatesScreen.vue'
import AddCarScreen from './views/AddCarScreen.vue'
import CarSelectionScreen from './views/CarSelectionScreen.vue'
import CarChangedScreen from './views/CarChangedScreen.vue'
import PaymentCardsScreen from './views/PaymentCardsScreen.vue'
import type { User } from './services/mockAuth'
import { featureToggles, type FeatureKey } from './services/featureToggles'
import chatIconSvg from './assets/icons/bottom-nav-chat.svg?raw'
import homeIconSvg from './assets/icons/bottom-nav-home.svg?raw'
import plusIconSvg from './assets/icons/bottom-nav-plus.svg?raw'
import profileIconSvg from './assets/icons/bottom-nav-profile.svg?raw'
import searchIconSvg from './assets/icons/bottom-nav-search.svg?raw'

type Stage =
  | 'onboarding1'
  | 'onboarding2'
  | 'onboarding-final'
  | 'loading'
  | 'login'
  | 'registration'
  | 'code-verification'
  | 'geo-confirmation'
  | 'home'
  | 'search'
  | 'details'
  | 'summary'
  | 'active'
  | 'rent'
  | 'rent-map'
  | 'rent-success'
  | 'rent-map-details'
  | 'rent-booking-dates'
  | 'rent-add-car'
  | 'car-selection'
  | 'car-changed'
  | 'map-selection'
  | 'profile'
  | 'chat'
  | 'payment-cards'
  | 'placeholder'

const stage = ref<Stage>('onboarding1')
const selectedParking = ref<ParkingSpot | null>(null)
const navSelection = ref<'home' | 'search' | 'rent' | 'profile' | 'chat'>('home')
const userName = ref<string>()
const currentUser = ref<User | null>(null)
const authPhone = ref<string>('')
const authName = ref<string>('')
const isRegistrationFlow = ref<boolean>(false)
const selectedAddress = ref<string>('')
const selectedLocation = ref<{ id: string; address: string; lat: number; lng: number; priceHour: string; priceDay: string; priceMonth: string; availability: 'hourly' | 'daily' | 'monthly' } | null>(null)
const userCar = ref<{ id: string; brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean } | null>(null)
const userCars = ref<Array<{ id: string; brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean }>>([])
const selectedCarId = ref<string | null>(null)
const addCarSource = ref<'booking' | 'selection'>('booking')
const previousStage = ref<Stage | null>(null)
const selectedPaymentCard = ref<{ id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean } | null>(null)

// Feature toggle states - will be updated as features are checked
const featureStates = ref<Record<FeatureKey, boolean | null>>({
  'onboarding1': null,
  'onboarding2': null,
  'onboarding-final': null,
  'login': null,
  'registration': null,
  'code-verification': null,
  'home': null,
  'search': null,
  'details': null,
  'summary': null,
  'active': null,
  'rent': null,
  'profile': null,
  'chat': null,
})

const placeholderMessage = ref<{ title: string; description: string } | null>(null)

// Helper to check if a feature is enabled (with caching)
const isFeatureEnabled = async (featureKey: FeatureKey): Promise<boolean> => {
  // Check cache first
  if (featureStates.value[featureKey] !== null) {
    return featureStates.value[featureKey] === true
  }
  
  // Fetch from API
  const enabled = await featureToggles.isEnabled(featureKey)
  featureStates.value[featureKey] = enabled
  return enabled
}

const purpleHex = '#9333EA'
const greyHex = '#9CA3AF'

const recolorSvg = (svg: string, fromColor: string, toColor: string) =>
  svg.replace(new RegExp(fromColor, 'gi'), toColor)

const homeActiveIcon = homeIconSvg
const homeInactiveIcon = recolorSvg(homeIconSvg, purpleHex, greyHex)
const searchInactiveIcon = searchIconSvg
const searchActiveIcon = recolorSvg(searchIconSvg, greyHex, purpleHex)
const rentInactiveIcon = plusIconSvg
const rentActiveIcon = recolorSvg(plusIconSvg, greyHex, purpleHex)
const profileInactiveIcon = profileIconSvg
const profileActiveIcon = recolorSvg(profileIconSvg, greyHex, purpleHex)
const chatInactiveIcon = chatIconSvg
const chatActiveIcon = recolorSvg(chatIconSvg, greyHex, purpleHex)

const bottomNavItems = computed(() => [
  { id: 'home', label: 'Главная', icon: homeInactiveIcon, activeIcon: homeActiveIcon },
  { id: 'search', label: 'Поиск', icon: searchInactiveIcon, activeIcon: searchActiveIcon },
  { id: 'rent', label: 'Сдать', icon: rentInactiveIcon, activeIcon: rentActiveIcon },
  {
    id: 'profile',
    label: 'Профиль',
    icon: profileInactiveIcon,
    activeIcon: profileActiveIcon,
    disabled: true,
  },
  {
    id: 'chat',
    label: 'Чаты',
    icon: chatInactiveIcon,
    activeIcon: chatActiveIcon,
    badge: '3',
  },
])

const isNavVisible = computed(() => 
  stage.value !== 'onboarding1' && 
  stage.value !== 'onboarding2' && 
  stage.value !== 'onboarding-final' && 
  stage.value !== 'loading' &&
  stage.value !== 'login' &&
  stage.value !== 'registration' &&
  stage.value !== 'code-verification' &&
  stage.value !== 'geo-confirmation' &&
  stage.value !== 'map-selection' &&
  stage.value !== 'rent-map' &&
  stage.value !== 'rent-success' &&
  stage.value !== 'car-selection' &&
  stage.value !== 'car-changed' &&
  stage.value !== 'payment-cards' &&
  stage.value !== 'placeholder'
)

const ensureParkingSelected = () => {
  if (!selectedParking.value) {
    selectedParking.value = featuredParkings[0] ?? null
  }
}

const goHome = async () => {
  await checkFeatureAndNavigate('home', 'home')
  if (stage.value === 'home') {
    navSelection.value = 'home'
  }
}

const checkFeatureAndNavigate = async (targetStage: Stage, featureKey: FeatureKey) => {
  const enabled = await isFeatureEnabled(featureKey)
  if (enabled) {
    stage.value = targetStage
  } else {
    placeholderMessage.value = featureToggles.getPlaceholderMessage(featureKey)
    stage.value = 'placeholder' as Stage
  }
}

const goToOnboarding2 = async () => {
  await checkFeatureAndNavigate('onboarding2', 'onboarding2')
}

const goToLoading = () => {
  stage.value = 'loading'
  window.setTimeout(async () => {
    await checkFeatureAndNavigate('onboarding-final', 'onboarding-final')
  }, 1600)
}

const goToLogin = async () => {
  await checkFeatureAndNavigate('login', 'login')
  if (stage.value === 'login') {
    authPhone.value = ''
    isRegistrationFlow.value = false
  }
}

const goToHomeAsGuest = async () => {
  currentUser.value = null
  userName.value = undefined
  await checkFeatureAndNavigate('home', 'home')
  if (stage.value === 'home') {
    navSelection.value = 'home'
  }
}

const goToRegistration = async () => {
  await checkFeatureAndNavigate('registration', 'registration')
  if (stage.value === 'registration') {
    authPhone.value = ''
    authName.value = ''
    isRegistrationFlow.value = true
  }
}

const goToCodeVerification = async (arg1: string, arg2?: string) => {
  await checkFeatureAndNavigate('code-verification', 'code-verification')
  if (stage.value === 'code-verification') {
    // If called from RegistrationScreen: (name, phone)
    // If called from LoginScreen: (phone) only
    if (arg2) {
      // Registration flow: arg1 is name, arg2 is phone
      authName.value = arg1
      authPhone.value = arg2
    } else {
      // Login flow: arg1 is phone
      authPhone.value = arg1
      authName.value = ''
    }
  }
}

const handleAuthSuccess = (user: User) => {
  currentUser.value = user
  userName.value = user.name
  // If it's a registration flow, show geo confirmation screen first
  if (isRegistrationFlow.value) {
    stage.value = 'geo-confirmation'
  } else {
    // For login, go directly to home
    stage.value = 'loading'
    window.setTimeout(() => {
      goHome()
    }, 1600)
  }
}

const goToGeoConfirmationContinue = async () => {
  stage.value = 'loading'
  window.setTimeout(() => {
    goHome()
  }, 1600)
}


const handleNavSelect = async (value: string) => {
  if (value === 'home' || value === 'search') {
    const featureKey = value as FeatureKey
    await checkFeatureAndNavigate(value as Stage, featureKey)
    if (stage.value === value) {
      navSelection.value = value
      if (value === 'search') {
        ensureParkingSelected()
      }
    }
    return
  }

  if (value === 'rent' || value === 'profile' || value === 'chat') {
    const featureKey = value as FeatureKey
    await checkFeatureAndNavigate(value as Stage, featureKey)
    if (stage.value === value) {
      navSelection.value = value as typeof navSelection.value
    }
  }
}

const handleReserve = async (parking: ParkingSpot) => {
  selectedParking.value = parking
  await checkFeatureAndNavigate('details', 'details')
}

const goToSummary = async () => {
  await checkFeatureAndNavigate('summary', 'summary')
}

const backToDetails = () => {
  stage.value = 'details'
}

const extendBooking = () => {
  // Placeholder for future implementation
}

const openSearchFromHome = async () => {
  // "Найти парковку" теперь открывает экран сдачи места
  await checkFeatureAndNavigate('rent-map', 'rent')
  if (stage.value === 'rent-map') {
    navSelection.value = 'rent'
  }
}

const openRentFromHome = async () => {
  await checkFeatureAndNavigate('rent-map', 'rent')
  if (stage.value === 'rent-map') {
    navSelection.value = 'rent'
  }
}

const openHistoryFromHome = async () => {
  await checkFeatureAndNavigate('profile', 'profile')
  if (stage.value === 'profile') {
    navSelection.value = 'profile'
  }
}

const handleOpenDetails = async (parking: ParkingSpot) => {
  selectedParking.value = parking
  await checkFeatureAndNavigate('details', 'details')
}

const backToSearch = async () => {
  await checkFeatureAndNavigate('search', 'search')
  if (stage.value === 'search') {
    navSelection.value = 'search'
  }
}

const handleConfirm = async () => {
  await checkFeatureAndNavigate('active', 'active')
}

const handleAddCar = () => {
  // Сохраняем текущий экран перед переходом
  previousStage.value = stage.value
  // Если автомобилей нет, открываем экран создания
  if (!userCars.value || userCars.value.length === 0) {
    selectedCarId.value = null
    addCarSource.value = 'booking'
    stage.value = 'rent-add-car'
  } else {
    // Если автомобили есть, но основной не выбран, открываем экран выбора
    selectedCarId.value = userCar.value?.id || null
    stage.value = 'car-selection'
  }
}

const handleChangeCar = () => {
  // Сохраняем текущий экран перед переходом
  previousStage.value = stage.value
  // Если автомобилей нет, открываем экран создания
  if (!userCars.value || userCars.value.length === 0) {
    selectedCarId.value = null
    addCarSource.value = 'booking'
    stage.value = 'rent-add-car'
  } else {
    selectedCarId.value = userCar.value?.id || null
    stage.value = 'car-selection'
  }
}

const handleSelectCarId = (carId: string) => {
  // Если передан пустой ID, снимаем выбор
  if (carId === '' || !carId) {
    selectedCarId.value = null
  } else {
    selectedCarId.value = carId
  }
}

const handleChangePaymentCard = () => {
  previousStage.value = stage.value
  stage.value = 'payment-cards'
}

const handleAddCarFromSelection = () => {
  selectedCarId.value = null
  addCarSource.value = 'selection'
  stage.value = 'rent-add-car'
}

const handleAddCarBack = () => {
  // Определяем, откуда пришли по источнику
  const source = addCarSource.value
  const cars = userCars.value
  if (source === 'selection') {
    stage.value = 'car-selection'
  } else if (cars && cars.length > 0) {
    stage.value = 'car-selection'
  } else {
    stage.value = 'rent-booking-dates'
  }
}

const handleCarSelectionBack = () => {
  const currentUserCar = userCar.value
  if (currentUserCar) {
    selectedCarId.value = currentUserCar.id
  } else {
    selectedCarId.value = null
  }
  // Возвращаемся на предыдущий экран или на экран бронирования по умолчанию
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
  } else {
    stage.value = 'rent-booking-dates'
  }
  previousStage.value = null
}

const handleSelectCar = (car: { id: string; brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean }) => {
  userCar.value = car
  stage.value = 'car-changed'
  previousStage.value = null
}

const handleCarChangedConfirm = () => {
  stage.value = 'rent-booking-dates'
}

const handlePaymentCardsBack = () => {
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
  } else {
    stage.value = 'profile'
  }
  previousStage.value = null
}

const handlePaymentCardConfirm = (card: { id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean }) => {
  selectedPaymentCard.value = card
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
  } else {
    stage.value = 'rent-booking-dates'
  }
  previousStage.value = null
}

const handleSaveCar = (car: { brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean }) => {
  const carWithId = { ...car, id: Date.now().toString() }
  if (!userCars.value) {
    userCars.value = []
  }
  userCars.value.push(carWithId)
  userCar.value = carWithId
  selectedCarId.value = carWithId.id
  // Если пришли с экрана выбора, возвращаемся туда, иначе проверяем количество
  if (addCarSource.value === 'selection') {
    // Сохраняем предыдущий экран перед возвратом на экран выбора
    if (!previousStage.value) {
      previousStage.value = 'rent-booking-dates'
    }
    stage.value = 'car-selection'
  } else if (userCars.value.length === 1) {
    // Если это первый автомобиль и пришли с бронирования, возвращаемся к бронированию
    stage.value = 'rent-booking-dates'
  } else {
    // Если не первый и пришли с бронирования, идем к выбору
    stage.value = 'car-selection'
  }
}

// Watch for stage changes and check feature toggles if needed
watch(stage, async (newStage) => {
  // Check feature toggle for stages that need it
  const featureKeyMap: Record<string, FeatureKey> = {
    'chat': 'chat',
    'rent': 'rent',
    'profile': 'profile',
  }
  
  const featureKey = featureKeyMap[newStage]
  if (featureKey && featureStates.value[featureKey] === null) {
    // Feature state not checked yet, check it now
    const enabled = await featureToggles.isEnabled(featureKey)
    featureStates.value[featureKey] = enabled
    
    // If disabled, show placeholder
    if (!enabled) {
      placeholderMessage.value = featureToggles.getPlaceholderMessage(featureKey)
      stage.value = 'placeholder'
    }
  }
}, { immediate: true })

onMounted(async () => {
  userName.value = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name
  
  // Check feature toggle for initial onboarding screen
  const onboarding1Enabled = await isFeatureEnabled('onboarding1')
  if (!onboarding1Enabled) {
    placeholderMessage.value = featureToggles.getPlaceholderMessage('onboarding1')
    stage.value = 'placeholder'
  }
})
</script>

<template>
  <div class="app">
    <PlaceholderScreen
      v-if="stage === 'placeholder' && placeholderMessage"
      :title="placeholderMessage.title"
      :description="placeholderMessage.description"
    />

    <OnboardingScreen1
      v-else-if="stage === 'onboarding1'"
      :on-next="goToOnboarding2"
      :on-login="goToLogin"
    />

    <OnboardingScreen2
      v-else-if="stage === 'onboarding2'"
      :on-next="goToLoading"
      :on-login="goToLogin"
    />

    <LoadingScreen v-else-if="stage === 'loading'" :user-name="userName" />

    <OnboardingScreen
      v-else-if="stage === 'onboarding-final'"
      :on-next="goToRegistration"
      :on-preview="goToHomeAsGuest"
    />

    <LoginScreen
      v-else-if="stage === 'login'"
      :on-back="() => stage = 'onboarding-final'"
      :on-login="goToCodeVerification"
      :on-register="goToRegistration"
    />

    <RegistrationScreen
      v-else-if="stage === 'registration'"
      :on-back="() => stage = 'onboarding-final'"
      :on-register="goToCodeVerification"
      :on-login="goToLogin"
    />

    <CodeVerificationScreen
      v-else-if="stage === 'code-verification'"
      :phone="authPhone"
      :name="authName"
      :is-registration="isRegistrationFlow"
      :on-back="isRegistrationFlow ? () => stage = 'registration' : () => stage = 'login'"
      :on-success="handleAuthSuccess"
    />

    <GeoConfirmationScreen
      v-else-if="stage === 'geo-confirmation'"
      :on-continue="goToGeoConfirmationContinue"
    />

    <RentOutSuccessScreen
      v-else-if="stage === 'rent-success'"
      @go-to-ads="() => { navSelection = 'profile'; stage = 'profile' }"
    />

    <template v-else>
      <main class="app__content">
        <HomeScreen
          v-if="stage === 'home'"
          :user-name="userName"
          :current-user="currentUser"
          @open-search="openSearchFromHome"
          @open-rent-out="openRentFromHome"
          @open-booking="handleReserve"
          @open-history="openHistoryFromHome"
        />

        <SearchScreen
          v-else-if="stage === 'search'"
          @back="goHome"
          @open-details="handleOpenDetails"
        />

        <ParkingDetailsScreen
          v-else-if="stage === 'details' && selectedParking"
          :parking="selectedParking"
          @back="backToSearch"
          @reserve="goToSummary"
        />

        <BookingSummaryScreen
          v-else-if="stage === 'summary' && selectedParking"
          :parking="selectedParking"
          @back="backToDetails"
          @confirm="handleConfirm"
        />

        <ActiveBookingScreen
          v-else-if="stage === 'active' && selectedParking"
          :parking="selectedParking"
          @finish="goHome"
          @extend="extendBooking"
        />

        <RentOutMapScreen
          v-else-if="stage === 'rent-map'"
          @back="goHome"
          @select-location="(location) => { selectedLocation = location; stage = 'rent-map-details'; }"
        />
        
        <ParkingSpotDetailsScreen
          v-else-if="stage === 'rent-map-details' && selectedLocation"
          :location="selectedLocation"
          @back="() => stage = 'rent-map'"
          @select-dates="() => { if (selectedLocation) { stage = 'rent-booking-dates'; } }"
        />
        
        <BookingDatesScreen
          v-else-if="stage === 'rent-booking-dates' && selectedLocation"
          :location="selectedLocation"
          :user-car="userCar"
          :payment-card="selectedPaymentCard"
          @back="() => stage = 'rent-map-details'"
          @book="() => { if (selectedLocation) { selectedAddress = selectedLocation.address; stage = 'rent'; } }"
          @add-car="handleAddCar"
          @change-car="handleChangeCar"
          @change-payment-card="handleChangePaymentCard"
        />
        
        <AddCarScreen
          v-else-if="stage === 'rent-add-car'"
          @back="handleAddCarBack"
          @save="handleSaveCar"
        />

        <CarSelectionScreen
          v-else-if="stage === 'car-selection'"
          :cars="userCars"
          :selected-car-id="selectedCarId"
          @back="handleCarSelectionBack"
          @select-car-id="handleSelectCarId"
          @select-car="handleSelectCar"
          @add-car="handleAddCarFromSelection"
        />

        <CarChangedScreen
          v-else-if="stage === 'car-changed'"
          @confirm="handleCarChangedConfirm"
        />

        <PaymentCardsScreen
          v-else-if="stage === 'payment-cards'"
          @back="handlePaymentCardsBack"
          @add-card="() => {}"
          @edit-card="() => {}"
          @select-card="() => {}"
          @confirm="handlePaymentCardConfirm"
        />

        <RentOutScreen
          v-else-if="stage === 'rent'"
          :selected-address="selectedAddress"
          :current-user="currentUser"
          @back="() => stage = 'rent-map'"
          @success="() => stage = 'rent-success'"
          @open-map="() => stage = 'map-selection'"
          @update-address="(addr) => { selectedAddress = addr }"
        />

        <MapSelectionScreen
          v-else-if="stage === 'map-selection'"
          @back="() => stage = 'rent'"
          @select-address="(addr) => { selectedAddress = addr; stage = 'rent'; }"
        />

        <PlaceholderScreen
          v-else-if="stage === 'profile'"
          title="Профиль в разработке"
          description="Здесь будут храниться ваши брони, история поездок и персональные настройки."
        />

        <ChatScreen
          v-else-if="stage === 'chat' && featureStates['chat'] !== false"
          @back="goHome"
        />

        <PlaceholderScreen
          v-else-if="stage === 'chat'"
          title="Чаты запускаем позже"
          description="Команда работает над единым центром общения с арендаторами и службой поддержки."
        />
      </main>

      <AppBottomNav
        v-if="isNavVisible"
        v-model="navSelection"
        class="app__nav"
        :items="bottomNavItems"
        @select="handleNavSelect"
      />
    </template>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

.app__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(116px + env(safe-area-inset-bottom));
  width: 100%;
  overflow-x: hidden;
}

.app__nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

@media (max-width: 480px) {
  .app__content {
    padding-bottom: calc(132px + env(safe-area-inset-bottom));
  }
}
</style>
