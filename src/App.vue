<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
import CallVerificationScreen from './views/CallVerificationScreen.vue'
import GeoConfirmationScreen from './views/GeoConfirmationScreen.vue'
import ParkingDetailsScreen from './views/ParkingDetailsScreen.vue'
import PlaceholderScreen from './views/PlaceholderScreen.vue'
import RentOutScreen from './views/RentOutScreen.vue'
import RentOutSuccessScreen from './views/RentOutSuccessScreen.vue'
import RentOutMapScreen from './views/RentOutMapScreen.vue'
import MapSelectionScreen from './views/MapSelectionScreen.vue'
import SearchScreen from './views/SearchScreen.vue'
import ChatScreen from './views/ChatScreen.vue'
import ChatListScreen from './views/ChatListScreen.vue'
import ParkingSpotDetailsScreen from './views/ParkingSpotDetailsScreen.vue'
import BookingDatesScreen from './views/BookingDatesScreen.vue'
import AddCarScreen from './views/AddCarScreen.vue'
import CarSelectionScreen from './views/CarSelectionScreen.vue'
import CarChangedScreen from './views/CarChangedScreen.vue'
import PaymentCardsScreen from './views/PaymentCardsScreen.vue'
import BookingConfirmationScreen from './views/BookingConfirmationScreen.vue'
import FullScreenMapScreen from './views/FullScreenMapScreen.vue'
import type { User } from './services/mockAuth'
import { featureToggles, type FeatureKey } from './services/featureToggles'
import { authApi, getTestZaharikToken, PREVIEW_AS_ZAHARIK_KEY, PREVIEW_ZAHARIK_USER } from './services/authApi'
import { spotsApi } from './services/spotsApi'
import { carsApi } from './services/carsApi'
import { bookingsApi, type CreateBookingRequest } from './services/bookingsApi'
import chatIconSvg from './assets/icons/bottom-nav-chat.svg?raw'
import homeIconSvg from './assets/icons/bottom-nav-home.svg?raw'
import plusIconSvg from './assets/icons/bottom-nav-plus.svg?raw'
import profileIconSvg from './assets/icons/bottom-nav-profile.svg?raw'
import searchIconSvg from './assets/icons/bottom-nav-search.svg?raw'
import OwnerRequestConfirmationScreen from './views/OwnerRequestConfirmationScreen.vue'
import OwnerRequestDeclineScreen from './views/OwnerRequestDeclineScreen.vue'
import OwnerBookingConfirmedScreen from './views/OwnerBookingConfirmedScreen.vue'
import OwnerCompletedBookingScreen from './views/OwnerCompletedBookingScreen.vue'
import OwnerCancelledBookingScreen from './views/OwnerCancelledBookingScreen.vue'
import BookingListScreen from './views/BookingListScreen.vue'
import BookingDetailsScreen from './views/BookingDetailsScreen.vue'
import BookingErrorScreen from './views/BookingErrorScreen.vue'
import ClientCancelledBookingScreen from './views/ClientCancelledBookingScreen.vue'
import MySpotsScreen from './views/MySpotsScreen.vue'
import CancelBookingModal from './components/CancelBookingModal.vue'
import ExtendBookingModal from './components/ExtendBookingModal.vue'
import EarlyBookingScreen from './views/EarlyBookingScreen.vue'
import RentalCompletionScreen from './views/RentalCompletionScreen.vue'
import BookingExtendedScreen from './views/BookingExtendedScreen.vue'
import ProfileScreen from './views/ProfileScreen.vue'
import ChangePhoneScreen from './views/ChangePhoneScreen.vue'
import HelpSupportScreen from './views/HelpSupportScreen.vue'
import UnpublishSpotScreen from './views/UnpublishSpotScreen.vue'
import TermsOfUseScreen from './views/TermsOfUseScreen.vue'
import PrivacyPolicyScreen from './views/PrivacyPolicyScreen.vue'

type Stage =
  | 'onboarding1'
  | 'onboarding2'
  | 'onboarding-final'
  | 'loading'
  | 'login'
  | 'registration'
  | 'code-verification'
  | 'call-verification'
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
  | 'booking-confirmation'
  | 'map-selection'
  | 'full-screen-map'
  | 'profile'
  | 'chat'
  | 'chat-list'
  | 'payment-cards'
  | 'change-phone'
  | 'placeholder'
  | 'owner-request-confirmation'
  | 'owner-request-decline'
  | 'owner-booking-confirmed'
  | 'owner-completed-booking'
  | 'owner-cancelled-booking'
  | 'booking-list'
  | 'booking-details'
  | 'booking-error'
  | 'client-cancelled-booking'
  | 'early-booking'
  | 'rental-completion'
  | 'booking-extended'
  | 'help-support'
  | 'my-spots'
  | 'unpublish-spot'
  | 'terms-of-use'
  | 'privacy-policy'

const stage = ref<Stage>('loading')
const selectedParking = ref<ParkingSpot | null>(null)
const showCancelModal = ref(false)
const showExtendModal = ref(false)
const extendedBookingData = ref<{ date: string; time: string; surcharge: number } | null>(null)
const navSelection = ref<'home' | 'search' | 'rent' | 'profile' | 'chat'>('home')
const userName = ref<string>()
const currentUser = ref<User | null>(null)
const authPhone = ref<string>('')
const authName = ref<string>('')
const isRegistrationFlow = ref<boolean>(false)
const selectedAddress = ref<string>('')
const selectedLatitude = ref<number | null>(null)
const selectedLongitude = ref<number | null>(null)
const selectedLocation = ref<{
  id: string
  address: string
  lat: number
  lng: number
  priceHour: string
  priceDay: string
  priceMonth: string
  photos?: string[]
  description?: string
  covered?: boolean
  hasSecurity?: boolean
  hasEvCharging?: boolean
  openSpace?: boolean
  inYard?: boolean
  privateTerritory?: boolean
  hasCctv?: boolean
} | null>(null)
const fullScreenMapLocation = ref<{ lat: number; lng: number; address?: string } | null>(null)
const userCar = ref<{ id: string; brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean } | null>(null)
const userCars = ref<Array<{ id: string; brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean }>>([])
const selectedCarId = ref<string | null>(null)
const addCarSource = ref<'booking' | 'selection'>('booking')
const previousStage = ref<Stage | null>(null)
const selectedPaymentCard = ref<{ id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean } | null>(null)
const loadingMessage = ref<string>('Обрабатываем запрос')
const loadingSubtitle = ref<string>('')
const bookingsCount = ref<number>(0)
const selectedSpotIdForUnpublish = ref<string | null>(null)
const mySpotsScreenRef = ref<InstanceType<typeof MySpotsScreen> | null>(null)

type Booking = {
  id: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  rentalType: 'hourly' | 'daily' | 'monthly'
  createdAt: Date
  status: 'awaiting' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  parkingSpotId?: string
}

const bookings = ref<Booking[]>([])
const selectedBooking = ref<Booking | null>(null)

type OwnerRequestStatus = 'awaiting' | 'cancelled' | 'completed' | 'active' | 'confirmed'

type OwnerRequest = {
  id: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  renterName: string
  status: OwnerRequestStatus
}

const ownerRequests = ref<OwnerRequest[]>([])
const selectedOwnerRequest = ref<OwnerRequest | null>(null)

// Map API booking status to frontend OwnerRequest status
function mapLeaseStatusToOwner(apiStatus: string): OwnerRequestStatus {
  switch (apiStatus) {
    case 'WAITING_CONFIRMATION': return 'awaiting'
    case 'WAITING_START': return 'confirmed'
    case 'ACTIVE': return 'active'
    case 'FINISHED': return 'completed'
    case 'CANCELED': return 'cancelled'
    default: return 'awaiting'
  }
}

// Map API booking status to frontend Booking status
function mapRentalStatusToBooking(apiStatus: string): Booking['status'] {
  switch (apiStatus) {
    case 'WAITING_CONFIRMATION': return 'awaiting'
    case 'WAITING_START': return 'confirmed'
    case 'ACTIVE': return 'active'
    case 'FINISHED': return 'completed'
    case 'CANCELED': return 'cancelled'
    default: return 'awaiting'
  }
}

// Parse ISO datetime to date and time strings
function parseStartEnd(startAt: string, endAt: string): { startDate: string; startTime: string; endDate: string; endTime: string } {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endDate: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
    endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
  }
}

// Load owner requests (leases) from API — so landlord can see and confirm bookings
const loadOwnerRequests = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return
  try {
    const res = await bookingsApi.getMyLeases(false, { size: 100 })
    const list = res.content || []
    ownerRequests.value = list.map((item: any) => {
      const { startDate, startTime, endDate, endTime } = parseStartEnd(item.startAt, item.endAt)
      const renter = item.renter ?? item.renterName
      const renterName = renter
        ? (typeof renter === 'string' ? renter : (renter.firstName || renter.username || 'Клиент'))
        : 'Клиент'
      return {
        id: item.id,
        address: item.spot?.address ?? '',
        startDate,
        endDate,
        startTime,
        endTime,
        renterName,
        status: mapLeaseStatusToOwner(item.status),
      }
    })
  } catch (e) {
    console.error('[App] loadOwnerRequests failed:', e)
  }
}

// Load my bookings (rentals) from API — so list and WAITING_CONFIRMATION persist after refresh
const loadBookings = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return
  try {
    const res = await bookingsApi.getMyRentals(false, { size: 100 })
    const list = res.content || []
    bookings.value = list.map((item: any) => {
      const { startDate, startTime, endDate, endTime } = parseStartEnd(item.startAt, item.endAt)
      const rentalType = (item.rentType || 'HOURLY').toLowerCase() as 'hourly' | 'daily' | 'monthly'
      return {
        id: item.id,
        address: item.spot?.address ?? '',
        startDate,
        endDate,
        startTime,
        endTime,
        rentalType,
        createdAt: new Date(item.createdAt || 0),
        status: mapRentalStatusToBooking(item.status),
        parkingSpotId: item.spot?.id,
      }
    })
    bookingsCount.value = bookings.value.filter(b => b.status !== 'cancelled').length
  } catch (e) {
    console.error('[App] loadBookings failed:', e)
  }
}

// Feature toggle states - will be updated as features are checked
const featureStates = ref<Record<FeatureKey, boolean | null>>({
  'onboarding1': null,
  'onboarding2': null,
  'onboarding-final': null,
  'login': null,
  'registration': null,
  'code-verification': null,
  'call-verification': null,
  'home': null,
  'search': null,
  'details': null,
  'summary': null,
  'active': null,
  'rent': null,
  'profile': null,
  'chat': null,
  'booking-details': null,
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

// Badge на «Чаты» показываем только при наличии чатов и только если есть непрочитанные (пока нет API непрочитанных — не показываем)
const chatUnreadCount = ref(0)
const bottomNavItems = computed(() => {
  const hasChats = (bookingsCount.value > 0 || ownerRequests.value.length > 0)
  const badge = hasChats && chatUnreadCount.value > 0 ? String(chatUnreadCount.value) : undefined
  return [
    { id: 'home', label: 'Главная', icon: homeInactiveIcon, activeIcon: homeActiveIcon },
    { id: 'search', label: 'Поиск', icon: searchInactiveIcon, activeIcon: searchActiveIcon },
    { id: 'rent', label: 'Сдать', icon: rentInactiveIcon, activeIcon: rentActiveIcon },
    {
      id: 'profile',
      label: 'Профиль',
      icon: profileInactiveIcon,
      activeIcon: profileActiveIcon,
    },
    {
      id: 'chat',
      label: 'Чаты',
      icon: chatInactiveIcon,
      activeIcon: chatActiveIcon,
      badge,
    },
  ]
})

const isNavVisible = computed(() => 
  stage.value !== 'onboarding1' && 
  stage.value !== 'onboarding2' && 
  stage.value !== 'onboarding-final' && 
  stage.value !== 'loading' &&
  stage.value !== 'login' &&
  stage.value !== 'registration' &&
  stage.value !== 'code-verification' &&
  stage.value !== 'call-verification' &&
  stage.value !== 'geo-confirmation' &&
  stage.value !== 'map-selection' &&
  stage.value !== 'rent-map' &&
  stage.value !== 'rent' &&
  stage.value !== 'search' &&
  stage.value !== 'owner-cancelled-booking' &&
  stage.value !== 'rent-success' &&
  stage.value !== 'car-selection' &&
  stage.value !== 'car-changed' &&
  stage.value !== 'booking-confirmation' &&
  stage.value !== 'full-screen-map' &&
  stage.value !== 'payment-cards' &&
  stage.value !== 'placeholder' &&
  stage.value !== 'chat' &&
  stage.value !== 'owner-request-confirmation' &&
  stage.value !== 'owner-request-decline' &&
  stage.value !== 'owner-booking-confirmed' &&
  stage.value !== 'owner-completed-booking' &&
      stage.value !== 'booking-list' &&
      stage.value !== 'booking-details' &&
      stage.value !== 'booking-error' &&
      stage.value !== 'client-cancelled-booking' &&
      stage.value !== 'early-booking' &&
      stage.value !== 'rental-completion' &&
      stage.value !== 'booking-extended' &&
      stage.value !== 'my-spots' &&
      stage.value !== 'unpublish-spot' &&
      stage.value !== 'terms-of-use' &&
      stage.value !== 'privacy-policy'
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

const goToOnboardingFinal = async () => {
  await checkFeatureAndNavigate('onboarding-final', 'onboarding-final')
}

// Shared auth logic: same as "Начать использовать" button. Returns true if user has token, false otherwise.
const runStartupAuth = async (): Promise<boolean> => {
  const getInitData = (): string => {
    if (window.Telegram?.WebApp?.initData) {
      const initData = window.Telegram.WebApp.initData
      if (initData && initData.trim().length > 0) return initData
    }
    if (import.meta.env.DEV) {
      console.warn('[App] DEV MODE: Using fallback initData for local testing')
      return 'auth_date=1768317980&query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A111222333%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22Alexander%22%2C%22language_code%22%3A%22en%22%7D&hash=77794dcb2dd54b35f40010f1dcede46444340c01530bfd17849802cd6295c527'
    }
    return ''
  }

  const initData = getInitData()
  if (!initData || initData.trim().length === 0) {
    console.log('[App] runStartupAuth: no initData')
    return false
  }

  try {
    const loginResponse = await authApi.login(initData)
    if (loginResponse.status === 'OK') {
      if (loginResponse.token) {
        localStorage.setItem('auth_token', loginResponse.token)
      }
      if (loginResponse.user) {
        currentUser.value = {
          id: loginResponse.user.id,
          name: loginResponse.user.name,
          phone: loginResponse.user.phone,
        }
        userName.value = loginResponse.user.name
      } else if (loginResponse.token) {
        try {
          const userData = await authApi.getCurrentUser()
          currentUser.value = {
            id: userData.id,
            name: userData.firstName || userData.username || 'User',
            phone: userData.phoneNumber,
          }
          userName.value = userData.firstName || userData.username || 'User'
        } catch (_e) {
          /* ignore */
        }
      }
      return true
    }
    return false
  } catch (_error) {
    return false
  }
}

const handleOnboarding2Start = async () => {
  const hasToken = await runStartupAuth()
  if (hasToken) {
    await goHome()
    return
  }
  await goToOnboardingFinal()
}

const goToLogin = async () => {
  await checkFeatureAndNavigate('login', 'login')
  if (stage.value === 'login') {
    authPhone.value = ''
    isRegistrationFlow.value = false
  }
}

const goToHomeAsGuest = async () => {
  // «Просто посмотреть» — переключаемся на тестовую учётную запись zaharik для тестирования
  localStorage.setItem(PREVIEW_AS_ZAHARIK_KEY, '1')
  // Токен zaharik: из .env (VITE_TEST_ZAHARIK_TOKEN) или константы TEST_ZAHARIK_TOKEN, иначе запасной для тестового бэкенда
  const testZaharikToken = getTestZaharikToken() || 'zaharik'
  localStorage.setItem('auth_token', testZaharikToken)
  currentUser.value = {
    id: PREVIEW_ZAHARIK_USER.id,
    name: PREVIEW_ZAHARIK_USER.username,
    phone: PREVIEW_ZAHARIK_USER.phoneNumber,
  }
  userName.value = PREVIEW_ZAHARIK_USER.username
  // Тестовые заявки владельца (как у +79990001122)
  ownerRequests.value = [
    { id: 'owner-req-1', address: 'Москва, Тверская, 15', startDate: '2025-12-15', endDate: '2025-12-15', startTime: '10:00', endTime: '14:00', renterName: 'Михаил', status: 'awaiting' },
    { id: 'owner-req-2', address: 'Москва, Тверская, 15', startDate: '2025-12-15', endDate: '2025-12-15', startTime: '16:00', endTime: '20:00', renterName: 'Елена', status: 'cancelled' },
    { id: 'owner-req-3', address: 'Москва, Тверская, 15', startDate: '2025-12-14', endDate: '2025-12-14', startTime: '09:00', endTime: '12:00', renterName: 'Дмитрий', status: 'completed' },
    { id: 'owner-req-4', address: 'Москва, Тверская, 15', startDate: '2025-12-16', endDate: '2025-12-16', startTime: '14:00', endTime: '18:00', renterName: 'Алексей', status: 'active' },
    { id: 'owner-req-5', address: 'Москва, Тверская, 15', startDate: '2025-12-17', endDate: '2025-12-17', startTime: '10:00', endTime: '18:00', renterName: 'Иван', status: 'confirmed' },
  ]
  bookings.value = []
  bookingsCount.value = 0
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

const goToCallVerification = async (arg1: string, arg2?: string) => {
  console.log('[App] goToCallVerification called with:', { arg1, arg2, hasArg2: !!arg2 })
  
  // Set registration flow flag
  isRegistrationFlow.value = !!arg2
  
  // Set phone and name BEFORE navigation to ensure props are available
  if (arg2) {
    // Registration flow: arg1 is name, arg2 is phone
    console.log('[App] Registration flow - setting name:', arg1, 'phone:', arg2)
    authName.value = arg1
    authPhone.value = arg2
  } else {
    // Login flow: arg1 is phone
    console.log('[App] Login flow - setting phone:', arg1)
    authPhone.value = arg1
    authName.value = ''
  }
  
  console.log('[App] Values set - authPhone:', authPhone.value, 'authName:', authName.value)
  
  await checkFeatureAndNavigate('call-verification', 'call-verification')
  
  // Verify values are still set after navigation
  if (stage.value === 'call-verification') {
    console.log('[App] After navigation - authPhone:', authPhone.value, 'authName:', authName.value)
  }
}

const handleAuthSuccess = async (user: User) => {
  localStorage.removeItem(PREVIEW_AS_ZAHARIK_KEY)
  currentUser.value = user
  userName.value = user.name
  await loadBookings()
  await loadOwnerRequests()

  // After successful call verification, always go to home
  // (both for registration and login flows)
  // Geo confirmation will be shown later if needed
  console.log('[App] ===== AUTH SUCCESS - NAVIGATING TO HOME =====')
  console.log('[App] User authenticated:', user)
  console.log('[App] isRegistrationFlow:', isRegistrationFlow.value)
  console.log('[App] → Going to home screen')
  
  stage.value = 'loading'
  window.setTimeout(async () => {
    await goHome()
  }, 1600)
}

const goToGeoConfirmationContinue = async () => {
  stage.value = 'loading'
  window.setTimeout(() => {
    goHome()
  }, 1600)
}


// Load user data and cars for profile
const loadProfileData = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    console.log('[App] No auth token, skipping profile data load')
    return
  }

  try {
    // Load current user data
    console.log('[App] Loading user data for profile...')
    const userData = await authApi.getCurrentUser()
    
    // Update currentUser with latest data
    if (userData) {
      currentUser.value = {
        id: userData.id,
        name: userData.firstName || userData.username || currentUser.value?.name || 'Пользователь',
        phone: userData.phoneNumber || currentUser.value?.phone || '',
      }
      userName.value = currentUser.value.name
      console.log('[App] ✓ User data loaded for profile:', currentUser.value.name)
    }

    // Load user cars
    console.log('[App] Loading cars for profile...')
    const cars = await carsApi.getMyCars()
    console.log('[App] Cars loaded:', cars.length)
    
    if (cars && cars.length > 0) {
      // Map API cars to frontend format
      userCars.value = cars.map(car => {
        // Парсим licensePlate: для российских номеров формат А000АА777 (номер + регион)
        let number = car.licensePlate
        let region: string | undefined = undefined
        
        // Проверяем, является ли номер российским (формат: буква + 3 цифры + 2 буквы + 1-3 цифры региона)
        const russianPlatePattern = /^([А-ЯA-Z][0-9]{3}[А-ЯA-Z]{2})([0-9]{1,3})$/
        const match = car.licensePlate.match(russianPlatePattern)
        if (match) {
          number = match[1] ?? number // А000АА
          region = match[2] ?? '' // 777
        }
        
        return {
          id: car.id,
          brand: car.brand,
          model: car.model || '',
          number: number,
          region: region ?? '',
          color: car.color,
          isForeign: !match, // Если не соответствует российскому формату, считаем иностранным
        }
      })
      
      // Set primary car (first one or previously selected)
      if (userCar.value && userCars.value.find(c => c.id === userCar.value?.id)) {
        // Keep current selection if it still exists
        userCar.value = userCars.value.find(c => c.id === userCar.value?.id) ?? null
      } else if (userCars.value.length > 0) {
        // Use first car as primary
        userCar.value = userCars.value[0] ?? null
      }
      
      console.log('[App] ✓ Cars loaded and set:', userCars.value.length, 'cars, primary:', userCar.value?.brand)
    } else {
      // No cars found
      userCars.value = []
      userCar.value = null
      console.log('[App] No cars found')
    }
  } catch (error: any) {
    console.error('[App] Failed to load profile data:', error)
    // Don't show error to user, just log it
    if (error?.message?.includes('401') || error?.message?.includes('Authentication failed')) {
      console.warn('[App] User is not authorized (401), token may be invalid')
    }
  }
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

  if (value === 'rent' || value === 'profile') {
    const featureKey = value as FeatureKey
    await checkFeatureAndNavigate(value as Stage, featureKey)
    if (stage.value === value) {
      navSelection.value = value as typeof navSelection.value
      // Note: loadProfileData is called in watch(stage) when stage === 'profile'
    }
  }

  if (value === 'chat') {
    const featureKey = value as FeatureKey
    await checkFeatureAndNavigate('chat-list' as Stage, featureKey)
    if (stage.value === 'chat-list') {
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
  // "Найти парковку" открывает экран поиска парковок
  console.log('[App] openSearchFromHome called')
  
  // Очищаем кеш для 'search' чтобы получить актуальное значение
  featureStates.value['search'] = null
  featureToggles.clearCache()
  
  console.log('[App] Checking search feature toggle...')
  const enabled = await isFeatureEnabled('search')
  console.log('[App] Search feature enabled:', enabled)
  console.log('[App] Feature state after check:', featureStates.value['search'])
  
  if (enabled) {
    stage.value = 'search'
    navSelection.value = 'search'
    console.log('[App] ✓ Navigated to search screen')
  } else {
    placeholderMessage.value = featureToggles.getPlaceholderMessage('search')
    stage.value = 'placeholder' as Stage
    console.warn('[App] ✗ Search feature is disabled, showing placeholder')
  }
}

const openRentFromHome = async () => {
  editingSpotId.value = null // Clear editing state
  selectedAddress.value = ''
  selectedLatitude.value = null
  selectedLongitude.value = null
  await checkFeatureAndNavigate('rent', 'rent')
  if (stage.value === 'rent') {
    navSelection.value = 'rent'
  }
}

const editingSpotId = ref<string | null>(null)

const handleEditSpot = async (spotId: string) => {
  editingSpotId.value = spotId
  // Load spot data to get coordinates
  try {
    const spot = await spotsApi.getSpotById(spotId)
    selectedAddress.value = spot.address || ''
    selectedLatitude.value = spot.latitude
    selectedLongitude.value = spot.longitude
  } catch (error) {
    console.error('[App] Failed to load spot for editing:', error)
  }
  await checkFeatureAndNavigate('rent', 'rent')
  if (stage.value === 'rent') {
    navSelection.value = 'rent'
  }
}

const handleGoToMySpots = async () => {
  stage.value = 'my-spots'
  navSelection.value = 'rent' // Keep rent tab active since we're coming from rent flow
}

const handleUnpublishSpot = async (spotId: string) => {
  console.log('[App] Opening unpublish screen for spot:', spotId)
  
  // Check if there are active/upcoming bookings before showing preview
  try {
    const preview = await spotsApi.getArchivePreview(spotId)
    const hasBookings = (preview.activeCount > 0) || (preview.upcomingCount > 0)
    
    if (!hasBookings) {
      // No bookings, archive directly without showing preview
      console.log('[App] No bookings found, archiving directly')
      await spotsApi.archiveSpot(spotId, false)
      
      // Show loading screen
      loadingMessage.value = 'Снятие с публикации'
      loadingSubtitle.value = ''
      stage.value = 'loading'
      
      // After 1.5 seconds, navigate to my-spots and refresh
      setTimeout(async () => {
        stage.value = 'my-spots'
        navSelection.value = 'rent'
        await nextTick()
        // Add a small delay to ensure backend has updated the data
        await new Promise(resolve => setTimeout(resolve, 300))
        if (mySpotsScreenRef.value && typeof (mySpotsScreenRef.value as any).refresh === 'function') {
          console.log('[App] Refreshing spots list after archiving spot:', spotId)
          await (mySpotsScreenRef.value as any).refresh()
        }
      }, 1500)
      return
    }
    
    // Has bookings, show preview screen
    selectedSpotIdForUnpublish.value = spotId
    stage.value = 'unpublish-spot'
  } catch (err: any) {
    console.error('[App] Failed to check preview, showing screen anyway:', err)
    // On error, show preview screen anyway
    selectedSpotIdForUnpublish.value = spotId
    stage.value = 'unpublish-spot'
  }
}

const handleActivateSpot = async (spotId: string) => {
  console.log('[App] Activating spot:', spotId)
  
  // Show loading screen
  loadingMessage.value = 'Публикация места'
  loadingSubtitle.value = ''
  stage.value = 'loading'
  
  try {
    await spotsApi.activateSpot(spotId)
    console.log('[App] ✓ Spot activated successfully')
    
    // After 1.5 seconds, navigate to my-spots and refresh
    setTimeout(async () => {
      stage.value = 'my-spots'
      navSelection.value = 'rent'
      await nextTick()
      // Add a small delay to ensure backend has updated the data
      await new Promise(resolve => setTimeout(resolve, 300))
      if (mySpotsScreenRef.value && typeof (mySpotsScreenRef.value as any).refresh === 'function') {
        console.log('[App] Refreshing spots list after activating spot:', spotId)
        await (mySpotsScreenRef.value as any).refresh()
      }
    }, 1500)
  } catch (error: any) {
    console.error('[App] ✗ Failed to activate spot:', error)
    
    // Show error message
    loadingMessage.value = 'Ошибка'
    loadingSubtitle.value = error?.message || 'Не удалось опубликовать место'
    
    // After 2 seconds, go back to my-spots
    setTimeout(async () => {
      stage.value = 'my-spots'
      navSelection.value = 'rent'
      await nextTick()
      if (mySpotsScreenRef.value && typeof (mySpotsScreenRef.value as any).refresh === 'function') {
        (mySpotsScreenRef.value as any).refresh()
      }
    }, 2000)
  }
}

const handleUnpublishSpotConfirm = async (cancelUpcomingBookings: boolean) => {
  if (!selectedSpotIdForUnpublish.value) return

  console.log('[App] Unpublishing spot:', selectedSpotIdForUnpublish.value, 'cancel bookings:', cancelUpcomingBookings)

  // Show loading screen
  loadingMessage.value = 'Снятие с публикации'
  loadingSubtitle.value = ''
  stage.value = 'loading'

  try {
    // Call archive API
    await spotsApi.archiveSpot(selectedSpotIdForUnpublish.value, cancelUpcomingBookings)

    console.log('[App] ✓ Spot unpublished successfully')

    // Clear the selected spot ID immediately
    const archivedSpotId = selectedSpotIdForUnpublish.value
    selectedSpotIdForUnpublish.value = null

    // After 1.5 seconds, navigate to my-spots and refresh the list
    setTimeout(async () => {
      stage.value = 'my-spots'
      navSelection.value = 'rent'
      // Wait for component to mount, then refresh the spots list
      await nextTick()
      // Add a small delay to ensure backend has updated the data
      await new Promise(resolve => setTimeout(resolve, 300))
      if (mySpotsScreenRef.value && typeof (mySpotsScreenRef.value as any).refresh === 'function') {
        console.log('[App] Refreshing spots list after archiving spot:', archivedSpotId)
        await (mySpotsScreenRef.value as any).refresh()
      }
    }, 1500)
  } catch (error: any) {
    console.error('[App] ✗ Failed to unpublish spot:', error)

    // Show error message
    loadingMessage.value = 'Ошибка'
    loadingSubtitle.value = error?.message || 'Не удалось снять место с публикации'

    // After 2 seconds, go back to my-spots
    setTimeout(async () => {
      selectedSpotIdForUnpublish.value = null
      stage.value = 'my-spots'
      navSelection.value = 'rent'
      // Wait for component to mount, then refresh the spots list
      await nextTick()
      if (mySpotsScreenRef.value && typeof (mySpotsScreenRef.value as any).refresh === 'function') {
        (mySpotsScreenRef.value as any).refresh()
      }
    }, 2000)
  }
}

const openHistoryFromHome = async () => {
  // Если есть бронирования, открываем список бронирований
  if (bookings.value.length > 0) {
    stage.value = 'booking-list'
  } else {
    await checkFeatureAndNavigate('profile', 'profile')
    if (stage.value === 'profile') {
      navSelection.value = 'profile'
    }
  }
}


const handleOpenChat = async () => {
  await checkFeatureAndNavigate('chat-list', 'chat')
  if (stage.value === 'chat-list') {
    navSelection.value = 'chat'
  }
}

const handleOpenOwnerRequestFromHome = (request: OwnerRequest) => {
  if (request.status === 'awaiting') {
    // Экран подтверждения аренды владельцем
    selectedOwnerRequest.value = request
    stage.value = 'owner-request-confirmation'
    return
  }

  if (request.status === 'confirmed') {
    // Для подтверждённых заявок (ожидает начала аренды) открываем финальный экран с подтверждением
    selectedOwnerRequest.value = request
    stage.value = 'owner-booking-confirmed'
    return
  }

  if (request.status === 'active') {
    // Для активных заявок открываем экран подтверждённого бронирования
    selectedOwnerRequest.value = request
    stage.value = 'owner-booking-confirmed'
    return
  }

  if (request.status === 'completed') {
    // Для завершенных заявок открываем экран с информацией о парковочном месте
    selectedOwnerRequest.value = request
    stage.value = 'owner-completed-booking'
    return
  }

  // Для отмененных заявок открываем экран с отмененным бронированием
  selectedOwnerRequest.value = request
  stage.value = 'owner-cancelled-booking'
}

const handleOpenChatFromList = (booking: Booking) => {
  // Сохраняем текущий экран перед открытием чата
  // Это позволит вернуться на правильный экран при нажатии "Назад" из чата
  previousStageBeforeChat.value = stage.value
  
  // Определяем имя контакта на основе статуса бронирования
  // Если статус awaiting - пользователь арендует, контакт - владелец места
  // Иначе - пользователь сдает, контакт - арендатор
  if (booking.status === 'awaiting') {
    selectedChatName.value = 'Михаил' // Владелец места
  } else {
    selectedChatName.value = 'Елена' // Арендатор
  }
  
  // Форматируем дату и время
  const formatBookingDate = (b: Booking): string => {
    const startDate = new Date(`${b.startDate}T${b.startTime}`)
    const endDate = new Date(`${b.endDate}T${b.endTime}`)
    
    const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
    
    const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    if (b.startDate === b.endDate) {
      return `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} — ${timeFormatter.format(endDate)}`
    } else {
      return `${dateFormatter.format(startDate)} — ${dateFormatter.format(endDate)}`
    }
  }
  
  // Конвертируем статус в русский текст
  const getStatusText = (status: Booking['status']): string => {
    switch (status) {
      case 'awaiting':
        return 'Ожидает подтверждения'
      case 'confirmed':
        return 'Подтверждено'
      case 'active':
        return 'Активное'
      case 'completed':
        return 'Завершено'
      default:
        return 'Ожидает подтверждения'
    }
  }
  
  selectedChatBooking.value = {
    address: booking.address,
    date: booking.startDate,
    time: formatBookingDate(booking),
    price: '₽1 600', // TODO: Calculate actual price
    status: getStatusText(booking.status)
  }
  selectedChatBookingId.value = booking.id
  
  stage.value = 'chat'
}

const selectedChatName = ref<string | undefined>(undefined)
const selectedChatBooking = ref<{ address?: string; date?: string; time?: string; price?: string; status?: string } | undefined>(undefined)
const selectedChatBookingId = ref<string | undefined>(undefined) // Booking ID для получения chatId
const previousStageBeforeChat = ref<Stage | null>(null) // Сохраняем экран, с которого открыли чат

const handleOwnerRequestConfirm = async () => {
  if (!selectedOwnerRequest.value) return
  try {
    await bookingsApi.confirmBooking(selectedOwnerRequest.value.id)
    ownerRequests.value = ownerRequests.value.map((req) =>
      req.id === selectedOwnerRequest.value?.id ? { ...req, status: 'confirmed' } : req,
    )
    stage.value = 'owner-booking-confirmed'
  } catch (e) {
    console.error('[App] confirm booking failed:', e)
  }
}

const handleOwnerBookingConfirmedOk = () => {
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleOwnerBookingConfirmedGoHome = () => {
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleOwnerBookingConfirmedChat = () => {
  if (!selectedOwnerRequest.value) return
  
  // Сохраняем текущий экран перед открытием чата
  previousStageBeforeChat.value = stage.value
  
  selectedChatName.value = selectedOwnerRequest.value.renterName
  selectedChatBooking.value = {
    address: selectedOwnerRequest.value.address,
    date: selectedOwnerRequest.value.startDate,
    time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
    price: '₽160',
    status: 'Подтверждено',
  }
  selectedChatBookingId.value = selectedOwnerRequest.value.id // OwnerRequest.id is the bookingId
  stage.value = 'chat'
}

const handleOwnerCompletedBookingGoHome = () => {
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleOwnerCancelledBookingGoHome = () => {
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleOwnerCompletedBookingChat = () => {
  if (!selectedOwnerRequest.value) return
  
  // Сохраняем текущий экран перед открытием чата
  previousStageBeforeChat.value = stage.value
  
  selectedChatName.value = selectedOwnerRequest.value.renterName
  selectedChatBooking.value = {
    address: selectedOwnerRequest.value.address,
    date: selectedOwnerRequest.value.startDate,
    time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
    price: '₽160',
    status: 'Завершено',
  }
  selectedChatBookingId.value = selectedOwnerRequest.value.id // OwnerRequest.id is the bookingId
  stage.value = 'chat'
}

const handleChatBack = () => {
  // Очищаем данные чата перед возвратом
  selectedChatName.value = undefined
  selectedChatBooking.value = undefined
  selectedChatBookingId.value = undefined
  
  // Если открыто из страницы "Мои брони", возвращаемся на неё
  // Иначе возвращаемся на страницу "Мои чаты"
  if (previousStageBeforeChat.value === 'booking-list') {
    stage.value = 'booking-list'
    navSelection.value = 'home'
  } else {
    // Возвращаемся на страницу "Мои чаты"
    stage.value = 'chat-list'
    navSelection.value = 'chat'
  }
  
  // Очищаем сохраненный экран
  previousStageBeforeChat.value = null
}

const handleChatListBack = () => {
  // Для арендатора возвращаемся на список бронирований, для арендодателя - на главную
  const isOwner = ownerRequests.value && ownerRequests.value.length > 0
  if (!isOwner && bookings.value.length > 0) {
    stage.value = 'booking-list'
    navSelection.value = 'home'
  } else {
    goHome()
  }
}

const handleOwnerRequestDecline = async () => {
  if (!selectedOwnerRequest.value) return
  try {
    await bookingsApi.cancelBooking(selectedOwnerRequest.value.id)
    ownerRequests.value = ownerRequests.value.map((req) =>
      req.id === selectedOwnerRequest.value?.id ? { ...req, status: 'cancelled' } : req,
    )
    selectedChatName.value = selectedOwnerRequest.value.renterName
    selectedChatBooking.value = {
      address: selectedOwnerRequest.value.address,
      date: selectedOwnerRequest.value.startDate,
      time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
      price: '₽160',
      status: 'Отменено',
    }
    stage.value = 'owner-cancelled-booking'
  } catch (e) {
    console.error('[App] cancel booking failed:', e)
  }
}

const handleOpenDetails = async (parking: ParkingSpot) => {
  selectedParking.value = parking
  await checkFeatureAndNavigate('details', 'details')
}

const handleOpenBookingFromList = async (booking: Booking) => {
  // Открываем экран деталей бронирования
  selectedBooking.value = booking
  stage.value = 'booking-details'
}

const handleOpenBookingDetails = async (booking: Booking) => {
  console.log('[App] handleOpenBookingDetails called with booking:', booking)
  if (!booking) {
    console.error('[App] handleOpenBookingDetails: booking is null or undefined')
    return
  }
  selectedBooking.value = booking
  const enabled = await isFeatureEnabled('booking-details')
  console.log('[App] Feature booking-details enabled:', enabled)
  if (enabled) {
    stage.value = 'booking-details'
    console.log('[App] Navigated to booking-details stage, current stage:', stage.value)
  } else {
    placeholderMessage.value = featureToggles.getPlaceholderMessage('booking-details')
    stage.value = 'placeholder'
    console.log('[App] Feature disabled, showing placeholder')
  }
}

const handleStartParking = () => {
  if (!selectedBooking.value) return
  // Переходим на экран раннего бронирования
  stage.value = 'early-booking'
  console.log('[App] Opening early booking screen for booking:', selectedBooking.value.id)
}

const handleEarlyBookingBack = () => {
  stage.value = 'booking-details'
}

const handleEarlyBookingPayAndStart = () => {
  if (!selectedBooking.value) return
  
  // Показываем экран загрузки с текстом "Оплата успешно"
  loadingMessage.value = 'Оплата успешно'
  loadingSubtitle.value = ''
  stage.value = 'loading'
  
  // Через 2 секунды возвращаемся на экран деталей бронирования
  setTimeout(() => {
    if (!selectedBooking.value) return
    // Обновляем статус бронирования на 'active'
    const updatedBooking = { ...selectedBooking.value, status: 'active' as const }
    bookings.value = bookings.value.map((b) =>
      b.id === selectedBooking.value?.id ? updatedBooking : b,
    )
    selectedBooking.value = updatedBooking
    
    // Обновляем статус в selectedChatBooking, если чат открыт или будет открыт
    if (selectedChatBooking.value) {
      selectedChatBooking.value = {
        ...selectedChatBooking.value,
        status: 'Активное'
      }
    }
    
    // Переходим на экран деталей бронирования
    stage.value = 'booking-details'
    console.log('[App] Paid and started parking for booking:', selectedBooking.value.id)
  }, 2000)
}

const handleEarlyBookingWaitForScheduled = () => {
  // Возвращаемся на экран деталей бронирования
  stage.value = 'booking-details'
  console.log('[App] User will wait for scheduled time')
}

const handleCancelBooking = () => {
  if (!selectedBooking.value) return
  // Показываем попап подтверждения
  showCancelModal.value = true
}

const handleCancelBookingConfirm = () => {
  if (!selectedBooking.value) return
  // Обновляем статус бронирования на 'cancelled'
  bookings.value = bookings.value.map((b) =>
    b.id === selectedBooking.value?.id ? { ...b, status: 'cancelled' } : b,
  )
  bookingsCount.value = bookings.value.filter(b => b.status !== 'cancelled').length
  // Закрываем попап
  showCancelModal.value = false
  // Переходим на экран отмененного бронирования
  stage.value = 'client-cancelled-booking'
  console.log('[App] Cancelled booking:', selectedBooking.value.id)
}

const handleCancelBookingCancel = () => {
  showCancelModal.value = false
}

const handleClientCancelledBookingGoHome = () => {
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleBookingDetailsBack = () => {
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleBookingDetailsChat = () => {
  if (!selectedBooking.value) return
  handleOpenChatFromList(selectedBooking.value)
}

const handleFinishParking = () => {
  if (!selectedBooking.value) return
  // Переходим на экран завершения аренды
  stage.value = 'rental-completion'
  console.log('[App] Opening rental completion screen for booking:', selectedBooking.value.id)
}

const handleRentalCompletionBack = () => {
  // Возвращаемся на экран деталей бронирования
  stage.value = 'booking-details'
}

const handleRentalCompletionConfirm = () => {
  if (!selectedBooking.value) return
  // Обновляем статус бронирования на 'completed'
  const updatedBooking = { ...selectedBooking.value, status: 'completed' as const }
  bookings.value = bookings.value.map((b) =>
    b.id === selectedBooking.value?.id ? updatedBooking : b,
  )
  bookingsCount.value = bookings.value.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length
  selectedBooking.value = updatedBooking
  // Переходим на главную страницу
  stage.value = 'home'
  navSelection.value = 'home'
  console.log('[App] Completed rental for booking:', selectedBooking.value.id)
}

const handleExtendParking = () => {
  if (!selectedBooking.value) return
  showExtendModal.value = true
  console.log('[App] Opening extend parking modal for booking:', selectedBooking.value.id)
}

const handleExtendBookingConfirm = (data: { date: string; time: string }) => {
  if (!selectedBooking.value) return
  // Закрываем модальное окно продления
  showExtendModal.value = false
  // Обновляем время окончания бронирования
  const updatedBooking = { 
    ...selectedBooking.value, 
    endDate: data.date,
    endTime: data.time
  }
  bookings.value = bookings.value.map((b) =>
    b.id === selectedBooking.value?.id ? updatedBooking : b,
  )
  selectedBooking.value = updatedBooking
  // Сохраняем данные о продлении для экрана успешного продления
  extendedBookingData.value = {
    date: data.date,
    time: data.time,
    surcharge: 160 // TODO: Calculate actual surcharge
  }
  // Показываем экран успешного продления
  stage.value = 'booking-extended'
  console.log('[App] Booking extended successfully to:', data.date, data.time)
}

const handleBookingExtendedSendMessage = () => {
  if (!selectedBooking.value) return
  // Переходим в чат с владельцем места
  handleOpenChatFromList(selectedBooking.value)
  // Очищаем данные о продлении
  extendedBookingData.value = null
}

const handleBookingExtendedClose = () => {
  // Возвращаемся на экран деталей бронирования
  extendedBookingData.value = null
  stage.value = 'booking-details'
}

const handleExtendBookingCancel = () => {
  showExtendModal.value = false
}

const handleBookingErrorOk = () => {
  // Возвращаемся на экран деталей бронирования
  stage.value = 'booking-details'
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
  // Всегда открываем экран выбора автомобиля (со списком)
  selectedCarId.value = userCar.value?.id || null
  stage.value = 'car-selection'
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

const handleChangePhone = () => {
  previousStage.value = stage.value
  stage.value = 'change-phone'
}

const handleProfileEditName = () => {
  previousStage.value = stage.value
  stage.value = 'help-support'
}

const handleProfileSettings = () => {
  previousStage.value = stage.value
  stage.value = 'help-support'
}

const handleHelpSupport = () => {
  previousStage.value = stage.value
  stage.value = 'help-support'
}

const handleHelpSupportBack = () => {
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
    previousStage.value = null
  } else {
    stage.value = 'profile'
  }
}

/** Hash для публичной ссылки на правила: #terms или #/terms */
const TERMS_HASH = '#terms'

function isTermsHash(): boolean {
  const h = typeof window !== 'undefined' ? window.location.hash : ''
  return h === '#terms' || h === '#/terms' || h === '#terms-of-use' || h.replace(/^#\/?/, '') === 'terms'
}

/** Hash для публичной ссылки на политику конфиденциальности: #privacy */
const PRIVACY_HASH = '#privacy'

function isPrivacyHash(): boolean {
  const h = typeof window !== 'undefined' ? window.location.hash : ''
  return h === '#privacy' || h === '#/privacy' || h === '#privacy-policy' || h.replace(/^#\/?/, '') === 'privacy'
}

const handleOpenTermsOfUse = () => {
  previousStage.value = 'rent-booking-dates'
  stage.value = 'terms-of-use'
  if (typeof window !== 'undefined') window.location.hash = TERMS_HASH
}

const handleTermsOfUseBack = () => {
  if (typeof window !== 'undefined' && window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
    previousStage.value = null
  } else {
    stage.value = currentUser.value ? 'home' : 'onboarding1'
  }
}

const handleOpenPrivacyPolicy = () => {
  previousStage.value = 'rent-booking-dates'
  stage.value = 'privacy-policy'
  if (typeof window !== 'undefined') window.location.hash = PRIVACY_HASH
}

const handlePrivacyPolicyBack = () => {
  if (typeof window !== 'undefined' && window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
    previousStage.value = null
  } else {
    stage.value = currentUser.value ? 'home' : 'onboarding1'
  }
}

const handleChangePhoneBack = () => {
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
  } else {
    stage.value = 'profile'
  }
  previousStage.value = null
}

const handleChangePhoneSubmit = (phone: string) => {
  // Update user phone number
  if (currentUser.value) {
    currentUser.value = {
      ...currentUser.value,
      phone: phone
    }
  }
  
  // Navigate to call verification for phone change
  authPhone.value = phone
  authName.value = currentUser.value?.name || ''
  isRegistrationFlow.value = false
  stage.value = 'call-verification'
}

const handleAddCarFromSelection = () => {
  selectedCarId.value = null
  addCarSource.value = 'selection'
  stage.value = 'rent-add-car'
}

const handleAddCarBack = () => {
  // Сначала проверяем, был ли сохранен предыдущий экран
  const prevStage = previousStage.value
  if (prevStage) {
    // Если есть сохраненный экран, возвращаемся на него
    stage.value = prevStage
    previousStage.value = null
    return
  }
  
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
  // Сохраняем предыдущий экран перед переходом на экран подтверждения
  const prevStage = previousStage.value || 'rent-booking-dates'
  previousStage.value = prevStage
  stage.value = 'car-changed'
}

const handleCarChangedConfirm = () => {
  // Если был сохранен предыдущий экран, возвращаемся туда, иначе на экран бронирования
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
    previousStage.value = null
  } else {
    stage.value = 'rent-booking-dates'
  }
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
  // Создаем полную копию карты со всеми данными
  selectedPaymentCard.value = {
    id: card.id,
    name: card.name,
    type: card.type,
    lastFour: card.lastFour,
    isActive: card.isActive
  }
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
  } else {
    stage.value = 'rent-booking-dates'
  }
  previousStage.value = null
}

const handleDeletePaymentCard = (card: { id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean }) => {
  // Если удаляемая карта была выбрана, сбрасываем выбор
  if (selectedPaymentCard.value && selectedPaymentCard.value.id === card.id) {
    selectedPaymentCard.value = null
  }
}

const handleAddPaymentCard = (card?: { id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean }) => {
  // Если передана выбранная карта, используем её данные
  if (card) {
    selectedPaymentCard.value = {
      id: card.id,
      name: card.name,
      type: card.type,
      lastFour: card.lastFour,
      isActive: card.isActive
    }
  } else {
    // Иначе создаем новую карту по умолчанию
    const newCard: { id: string; name: string; type: 'visa' | 'mastercard' | 'mir'; lastFour: string; isActive: boolean } = {
      id: Date.now().toString(),
      name: 'Новая карта',
      type: 'visa',
      lastFour: '4532',
      isActive: true
    }
    selectedPaymentCard.value = newCard
  }
  
  // Возвращаемся на экран бронирования
  const prevStage = previousStage.value
  if (prevStage) {
    stage.value = prevStage
  } else {
    stage.value = 'rent-booking-dates'
  }
  previousStage.value = null
}

const handleBook = async (bookingData: {
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  rentalType: 'hourly' | 'daily' | 'monthly'
}) => {
  if (!selectedLocation.value || !userCar.value || !selectedPaymentCard.value) {
    return
  }

  // Валидация дат: не прошедшая дата и год в разумных пределах (баги 8–9)
  const now = new Date()
  const currentYear = now.getFullYear()
  const maxYear = currentYear + 2
  const start = new Date(bookingData.startDate + 'T' + (bookingData.startTime || '00:00'))
  const end = new Date(bookingData.endDate + 'T' + (bookingData.endTime || '23:59'))
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()
  if (start < now) {
    loadingMessage.value = 'Ошибка'
    loadingSubtitle.value = 'Дата начала не может быть в прошлом'
    stage.value = 'loading'
    setTimeout(() => { stage.value = 'rent-booking-dates' }, 2000)
    return
  }
  if (startYear < currentYear || startYear > maxYear || endYear < currentYear || endYear > maxYear) {
    loadingMessage.value = 'Ошибка'
    loadingSubtitle.value = `Укажите год с ${currentYear} по ${maxYear}`
    stage.value = 'loading'
    setTimeout(() => { stage.value = 'rent-booking-dates' }, 2000)
    return
  }

  // Показываем экран загрузки с текстом "Направляем запрос на оплату"
  loadingMessage.value = 'Направляем запрос'
  loadingSubtitle.value = 'на оплату'
  stage.value = 'loading'

  try {
    // Преобразуем тип аренды в формат API (UPPERCASE)
    const rentType = bookingData.rentalType.toUpperCase() as 'HOURLY' | 'DAILY' | 'MONTHLY'

    // Формируем запрос на создание бронирования
    const createBookingRequest: CreateBookingRequest = {
      spotId: selectedLocation.value.id,
      carId: userCar.value.id,
      rentType: rentType,
    }

    // Для почасовой аренды - конвертируем местное время в UTC и отправляем date, timeFrom, timeTo в UTC
    // (бэкенд интерпретирует время как UTC и сохраняет в БД; иначе местное 17:00 попадало бы как 17:00Z)
    if (rentType === 'HOURLY') {
      const startLocal = new Date(bookingData.startDate + 'T' + (bookingData.startTime || '00:00'))
      const endLocal = new Date(bookingData.endDate + 'T' + (bookingData.endTime || '23:59'))
      createBookingRequest.date = startLocal.toISOString().slice(0, 10)
      createBookingRequest.timeFrom = startLocal.toISOString().slice(11, 16)
      createBookingRequest.timeTo = endLocal.toISOString().slice(11, 16)
    }
    // Для посуточной/помесячной аренды - используем dateFrom, dateTo
    else {
      createBookingRequest.dateFrom = bookingData.startDate
      createBookingRequest.dateTo = bookingData.endDate
    }

    console.log('[App] Creating booking with request:', createBookingRequest)

    // Вызываем API для создания бронирования
    const createdBooking = await bookingsApi.createBooking(createBookingRequest)

    console.log('[App] Booking created successfully:', createdBooking)

    // Через 1 секунду меняем текст на "Оплата успешна"
    setTimeout(() => {
      loadingMessage.value = 'Оплата успешна'
      loadingSubtitle.value = ''
    }, 1000)

    // Через 2 секунды переходим на главный экран
    setTimeout(() => {
      // Добавляем созданное бронирование в список
      const newBooking: Booking = {
        id: createdBooking.id,
        address: bookingData.address,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        rentalType: bookingData.rentalType,
        createdAt: new Date(createdBooking.createdAt),
        status: createdBooking.status === 'WAITING_CONFIRMATION' ? 'awaiting' : 'confirmed',
        parkingSpotId: createdBooking.spot.id
      }
      bookings.value.push(newBooking)
      bookingsCount.value = bookings.value.length
      stage.value = 'home'
      navSelection.value = 'home'
    }, 2000)
  } catch (error: any) {
    console.error('[App] Failed to create booking:', error)

    // Показываем сообщение об ошибке
    loadingMessage.value = 'Ошибка'
    loadingSubtitle.value = error?.message || 'Не удалось создать бронирование'

    // Через 2 секунды возвращаемся на экран бронирования
    setTimeout(() => {
      stage.value = 'rent-booking-dates'
    }, 2000)
  }
}

const handleBookingConfirmation = () => {
  // Переходим на главный экран
  stage.value = 'home'
  navSelection.value = 'home'
}

const handleOpenFullScreenMap = () => {
  if (selectedLocation.value) {
    fullScreenMapLocation.value = {
      lat: selectedLocation.value.lat,
      lng: selectedLocation.value.lng,
      address: selectedLocation.value.address
    }
    stage.value = 'full-screen-map'
  }
}

const handleCloseFullScreenMap = () => {
  stage.value = 'rent-map-details'
  fullScreenMapLocation.value = null
}

// Handle selecting dates for booking
const handleSelectDates = async (location: { id: string; address: string; lat: number; lng: number; priceHour: string; priceDay: string; priceMonth: string } | null) => {
  try {
    // Используем location из параметра события (из prop компонента)
    if (!location) {
      console.error('[App] Location is null from event')
      // Fallback: попробуем использовать selectedLocation.value
      if (!selectedLocation.value) {
        console.error('[App] selectedLocation.value is also null')
        return
      }
      location = selectedLocation.value
    }
    
    // Обновляем selectedLocation на случай, если он был очищен
    selectedLocation.value = location
    
    // Загружаем машины перед переходом на экран бронирования, если они еще не загружены
    if ((!userCars.value || userCars.value.length === 0) && currentUser.value) {
      try {
        console.log('[App] Loading cars before booking screen...')
        const cars = await carsApi.getMyCars()
        if (cars && Array.isArray(cars) && cars.length > 0) {
          userCars.value = cars.map(car => {
            // Парсим licensePlate: для российских номеров формат А000АА777 (номер + регион)
            const licensePlate = car.licensePlate || ''
            let number = licensePlate
            let region: string | undefined = undefined
            
            if (licensePlate) {
              const russianPlatePattern = /^([А-ЯA-Z][0-9]{3}[А-ЯA-Z]{2})([0-9]{1,3})$/
              const match = licensePlate.match(russianPlatePattern)
              if (match) {
                number = match[1] ?? number
                region = match[2] ?? ''
              }
            }
            
            return {
              id: car.id || '',
              brand: car.brand || '',
              model: car.model || '',
              number: number,
              region: region ?? '',
              color: car.color,
              isForeign: !(licensePlate && licensePlate.match(/^([А-ЯA-Z][0-9]{3}[А-ЯA-Z]{2})([0-9]{1,3})$/)),
            }
          })
          if (userCars.value && userCars.value.length > 0) {
            userCar.value = userCars.value[0] ?? null
          }
        } else {
          // Если машин нет, убеждаемся что userCars - это массив
          if (!userCars.value) {
            userCars.value = []
          }
        }
      } catch (error) {
        console.error('[App] Failed to load cars:', error)
        // В случае ошибки убеждаемся что userCars - это массив
        if (!userCars.value) {
          userCars.value = []
        }
      }
    }
    stage.value = 'rent-booking-dates'
  } catch (error) {
    console.error('[App] Error in select-dates handler:', error)
  }
}

// Handle selecting a location from the map - fetch full details
const handleSelectMapLocation = async (location: { id: string; address: string; lat: number; lng: number; price: string; rentType: string }) => {
  try {
    console.log('[App] Fetching full spot details for:', location.id)
    // Сохраняем текущий экран для правильного возврата назад
    if (stage.value === 'search') {
      previousStage.value = 'search'
    }
    const fullSpot = await spotsApi.getSpotById(location.id)
    console.log('[App] Full spot details:', fullSpot)

    selectedLocation.value = {
      id: fullSpot.id,
      address: fullSpot.address,
      lat: fullSpot.latitude,
      lng: fullSpot.longitude,
      priceHour: fullSpot.pricePerHour != null ? `${fullSpot.pricePerHour}₽/ч` : '—',
      priceDay: fullSpot.pricePerDay != null ? `${fullSpot.pricePerDay}₽/день` : '—',
      priceMonth: fullSpot.pricePerMonth != null ? `${fullSpot.pricePerMonth}₽/мес` : '—',
      photos: fullSpot.photos,
      description: fullSpot.description,
      covered: fullSpot.covered,
      hasSecurity: fullSpot.hasSecurity,
      hasEvCharging: fullSpot.hasEvCharging,
      openSpace: fullSpot.openSpace,
      inYard: fullSpot.inYard,
      privateTerritory: fullSpot.privateTerritory,
      hasCctv: fullSpot.hasCctv,
    }
    console.log('[App] Setting stage to rent-map-details, selectedLocation:', selectedLocation.value)
    stage.value = 'rent-map-details'
    console.log('[App] Stage set to:', stage.value, 'selectedLocation:', selectedLocation.value)
  } catch (error) {
    console.error('[App] Failed to fetch spot details:', error)
    // Сохраняем текущий экран для правильного возврата назад
    if (stage.value === 'search') {
      previousStage.value = 'search'
    }
    // Fallback: use the basic info we have (no photos/description/features)
    selectedLocation.value = {
      id: location.id,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      priceHour: location.rentType === 'HOURLY' ? location.price : '—',
      priceDay: location.rentType === 'DAILY' ? location.price : '—',
      priceMonth: location.rentType === 'MONTHLY' ? location.price : '—',
    }
    stage.value = 'rent-map-details'
  }
}

const handleLogout = () => {
  // Clear user data
  currentUser.value = null
  userName.value = undefined
  userCar.value = null
  userCars.value = []
  selectedPaymentCard.value = null
  bookings.value = []
  bookingsCount.value = 0
  ownerRequests.value = []
  
  // Clear auth token and режим «Просто посмотреть»
  localStorage.removeItem('auth_token')
  localStorage.removeItem(PREVIEW_AS_ZAHARIK_KEY)

  // Navigate to login
  stage.value = 'login'
  navSelection.value = 'home'
}

const handleSaveCar = async (car: { brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean }) => {
  try {
    // Формируем licensePlate: для российских номеров добавляем регион
    let licensePlate = car.number
    if (!car.isForeign && car.region) {
      // Для российских номеров формат: А000АА777 (номер + регион)
      licensePlate = `${car.number}${car.region}`
    }

    // Вызываем API для создания машины
    console.log('[App] Creating car via API:', { licensePlate, brand: car.brand, model: car.model, color: car.color })
    const createdCar = await carsApi.createCar({
      licensePlate: licensePlate,
      brand: car.brand,
      model: car.model,
      color: car.color,
    })

    console.log('[App] Car created successfully:', createdCar)

    // Преобразуем ответ API в формат фронтенда
    // Парсим licensePlate обратно на номер и регион
    let number = createdCar.licensePlate
    let region: string | undefined = car.region
    
    const russianPlatePattern = /^([А-ЯA-Z][0-9]{3}[А-ЯA-Z]{2})([0-9]{1,3})$/
    const match = createdCar.licensePlate.match(russianPlatePattern)
    if (match) {
      number = match[1] ?? number
      region = match[2] ?? ''
    }
    
    const carWithId = {
      id: createdCar.id, // Используем UUID из API
      brand: createdCar.brand,
      model: createdCar.model || '',
      number: number,
      region: region ?? '',
      color: createdCar.color,
      isForeign: !match,
    }

    // Добавляем машину в список
    if (!userCars.value) {
      userCars.value = []
    }
    userCars.value.push(carWithId)
    userCar.value = carWithId
    selectedCarId.value = carWithId.id

    // Сначала проверяем, был ли сохранен предыдущий экран (например, из профиля)
    const prevStage = previousStage.value
    if (prevStage) {
      // Если есть сохраненный экран, возвращаемся на него
      stage.value = prevStage
      previousStage.value = null
      return
    }

    // Если пришли с экрана выбора, возвращаемся туда, иначе проверяем количество
    if (addCarSource.value === 'selection') {
      stage.value = 'car-selection'
    } else if (userCars.value.length === 1) {
      // Если это первый автомобиль и пришли с бронирования, возвращаемся к бронированию
      stage.value = 'rent-booking-dates'
    } else {
      // Если не первый и пришли с бронирования, идем к выбору
      stage.value = 'car-selection'
    }
  } catch (error) {
    console.error('[App] Failed to create car:', error)
    // Показываем ошибку пользователю (можно добавить toast/alert)
    alert(error instanceof Error ? error.message : 'Не удалось сохранить автомобиль')
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
  
  // Load profile data when profile stage is opened
  if (newStage === 'profile') {
    await loadProfileData()
  }

  // Refresh bookings and owner requests when entering home (so WAITING_CONFIRMATION persist after refresh)
  if (newStage === 'home') {
    await loadBookings()
    await loadOwnerRequests()
  }
  
  // Load cars when booking dates screen is opened (if not already loaded)
  if (newStage === 'rent-booking-dates') {
    // Если машины еще не загружены, загружаем их
    if ((!userCars.value || userCars.value.length === 0) && currentUser.value) {
      try {
        console.log('[App] Loading cars for booking screen...')
        const cars = await carsApi.getMyCars()
        console.log('[App] Cars loaded for booking:', cars.length)
        
        if (cars && cars.length > 0) {
          // Map API cars to frontend format
          userCars.value = cars.map(car => {
            // Парсим licensePlate: для российских номеров формат А000АА777 (номер + регион)
            // Для иностранных номеров - просто номер
            let number = car.licensePlate
            let region: string | undefined = undefined
            
            // Проверяем, является ли номер российским (формат: буква + 3 цифры + 2 буквы + 1-3 цифры региона)
            const russianPlatePattern = /^([А-ЯA-Z][0-9]{3}[А-ЯA-Z]{2})([0-9]{1,3})$/
            const match = car.licensePlate.match(russianPlatePattern)
            if (match) {
              number = match[1] ?? number // А000АА
              region = match[2] ?? '' // 777
            }
            
            return {
              id: car.id,
              brand: car.brand,
              model: car.model || '',
              number: number,
              region: region ?? '',
              color: car.color,
              isForeign: !match, // Если не соответствует российскому формату, считаем иностранным
            }
          })
          
          // Set primary car (first one or previously selected)
          if (userCar.value && userCars.value.find(c => c.id === userCar.value?.id)) {
            // Keep current selection if it still exists
            userCar.value = userCars.value.find(c => c.id === userCar.value?.id) ?? null
          } else if (userCars.value.length > 0) {
            // Use first car as primary
            userCar.value = userCars.value[0] ?? null
          }
          
          console.log('[App] ✓ Cars loaded for booking:', userCars.value.length, 'cars')
        }
      } catch (error) {
        console.error('[App] Failed to load cars for booking:', error)
        // Don't block user, just log error
      }
    }
  }
}, { immediate: true })

// Watch for stage changes to refresh my-spots list when returning to it
watch(stage, async (newStage) => {
  if (newStage === 'my-spots') {
    // Wait for component to mount, then refresh the spots list
    await nextTick()
    if (mySpotsScreenRef.value && typeof (mySpotsScreenRef.value as any).refresh === 'function') {
      (mySpotsScreenRef.value as any).refresh()
    }
  }
})

onMounted(async () => {
  // Публичная ссылка на правила: при открытии по #terms сразу показываем «Публичная оферта»
  if (isTermsHash()) {
    const hasToken = await runStartupAuth()
    stage.value = 'terms-of-use'
    previousStage.value = null
    if (hasToken && currentUser.value) {
      await loadBookings()
      await loadOwnerRequests()
    }
    return
  }

  // Публичная ссылка на политику конфиденциальности: при открытии по #privacy
  if (isPrivacyHash()) {
    const hasToken = await runStartupAuth()
    stage.value = 'privacy-policy'
    previousStage.value = null
    if (hasToken && currentUser.value) {
      await loadBookings()
      await loadOwnerRequests()
    }
    return
  }

  // Same action as "Начать использовать" button: run authentication first
  loadingMessage.value = 'Проверка входа...'
  loadingSubtitle.value = ''

  const hasToken = await runStartupAuth()

  if (hasToken && currentUser.value) {
    await loadBookings()
    await loadOwnerRequests()
    const onboarding1Enabled = await isFeatureEnabled('onboarding1')
    if (onboarding1Enabled) {
      stage.value = 'home'
      navSelection.value = 'home'
    } else {
      placeholderMessage.value = featureToggles.getPlaceholderMessage('onboarding1')
      stage.value = 'placeholder'
    }
    return
  }

  // No token: run onboarding scenario (onboarding1 → onboarding2 → …)
  stage.value = 'onboarding1'
  try {
    const onboarding1Enabled = await isFeatureEnabled('onboarding1')
    if (!onboarding1Enabled) {
      placeholderMessage.value = featureToggles.getPlaceholderMessage('onboarding1')
      stage.value = 'placeholder'
    }
  } catch (error) {
    console.error('Error checking feature toggle:', error)
  }
})

// При изменении hash вручную (например вставка ссылки) — открывать правила или политику
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    if (isTermsHash() && stage.value !== 'terms-of-use') {
      previousStage.value = stage.value || null
      stage.value = 'terms-of-use'
    } else if (isPrivacyHash() && stage.value !== 'privacy-policy') {
      previousStage.value = stage.value || null
      stage.value = 'privacy-policy'
    }
  })
}
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
      :on-next="handleOnboarding2Start"
      :on-login="goToLogin"
    />

    <LoadingScreen 
      v-else-if="stage === 'loading'" 
      :user-name="userName"
      :message="loadingMessage"
      :subtitle="loadingSubtitle"
    />

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
      :on-call-verification="(phone: string) => goToCallVerification(phone)"
      :on-auth-success="handleAuthSuccess"
    />

    <RegistrationScreen
      v-else-if="stage === 'registration'"
      :on-back="() => stage = 'onboarding-final'"
      :on-register="goToCodeVerification"
      :on-call-verification="goToCallVerification"
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

    <CallVerificationScreen
      v-else-if="stage === 'call-verification'"
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
      @go-to-ads="handleGoToMySpots"
    />

    <template v-else>
      <main class="app__content">
        <HomeScreen
          v-if="stage === 'home'"
          :user-name="userName"
          :current-user="currentUser"
          :bookings-count="bookingsCount"
          :bookings="bookings"
          :owner-requests="ownerRequests"
          @open-search="openSearchFromHome"
          @open-rent-out="openRentFromHome"
          @open-booking="handleReserve"
          @open-history="openHistoryFromHome"
          @open-chat="handleOpenChat"
          @open-owner-request="handleOpenOwnerRequestFromHome"
          @open-booking-details="handleOpenBookingDetails"
          @open-my-spots="() => stage = 'my-spots'"
        />

        <SearchScreen
          v-else-if="stage === 'search'"
          @back="goHome"
          @open-details="handleOpenDetails"
          @select-location="handleSelectMapLocation"
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

        <OwnerRequestConfirmationScreen
          v-else-if="stage === 'owner-request-confirmation' && selectedOwnerRequest"
          :request="selectedOwnerRequest"
          @back="() => { stage = 'home'; navSelection = 'home' }"
          @confirm="handleOwnerRequestConfirm"
          @decline="() => { stage = 'owner-request-decline' }"
        />

        <OwnerRequestDeclineScreen
          v-else-if="stage === 'owner-request-decline'"
          @decline-booking="handleOwnerRequestDecline"
          @go-back="() => { stage = 'owner-request-confirmation' }"
        />

        <OwnerBookingConfirmedScreen
          v-else-if="stage === 'owner-booking-confirmed' && selectedOwnerRequest"
          :request="selectedOwnerRequest"
          @ok="handleOwnerBookingConfirmedOk"
          @go-home="handleOwnerBookingConfirmedGoHome"
          @open-chat="handleOwnerBookingConfirmedChat"
        />

        <OwnerCompletedBookingScreen
          v-else-if="stage === 'owner-completed-booking' && selectedOwnerRequest"
          :request="selectedOwnerRequest"
          @go-home="handleOwnerCompletedBookingGoHome"
          @open-chat="handleOwnerCompletedBookingChat"
        />

        <OwnerCancelledBookingScreen
          v-else-if="stage === 'owner-cancelled-booking' && selectedOwnerRequest"
          :request="selectedOwnerRequest"
          @go-home="handleOwnerCancelledBookingGoHome"
        />

        <RentOutMapScreen
          v-else-if="stage === 'rent-map'"
          @back="goHome"
          @select-location="handleSelectMapLocation"
        />
        
        <ParkingSpotDetailsScreen
          v-else-if="stage === 'rent-map-details' && selectedLocation"
          :location="selectedLocation"
          @back="() => { 
            // Если пришли с экрана поиска, возвращаемся туда, иначе на rent-map
            if (previousStage === 'search') {
              stage = 'search'
              previousStage = null
            } else {
              stage = 'rent-map'
            }
          }"
          @select-dates="handleSelectDates"
          @open-full-map="handleOpenFullScreenMap"
        />
        
        <BookingDatesScreen
          v-else-if="stage === 'rent-booking-dates' && selectedLocation"
          :location="selectedLocation"
          :user-car="userCar"
          :payment-card="selectedPaymentCard"
          @back="() => stage = 'rent-map-details'"
          @book="(bookingData) => handleBook(bookingData)"
          @add-car="handleAddCar"
          @change-car="handleChangeCar"
          @change-payment-card="handleChangePaymentCard"
          @open-terms="handleOpenTermsOfUse"
          @open-privacy="handleOpenPrivacyPolicy"
        />

        <TermsOfUseScreen
          v-else-if="stage === 'terms-of-use'"
          @back="handleTermsOfUseBack"
        />

        <PrivacyPolicyScreen
          v-else-if="stage === 'privacy-policy'"
          @back="handlePrivacyPolicyBack"
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
          @add-card="handleAddPaymentCard"
          @edit-card="() => {}"
          @select-card="() => {}"
          @confirm="handlePaymentCardConfirm"
          @delete-card="handleDeletePaymentCard"
        />

        <FullScreenMapScreen
          v-else-if="stage === 'full-screen-map' && fullScreenMapLocation"
          :location="fullScreenMapLocation"
          @close="handleCloseFullScreenMap"
        />

        <BookingConfirmationScreen
          v-else-if="stage === 'booking-confirmation'"
          @confirm="handleBookingConfirmation"
        />

        <template v-else-if="stage === 'rent' || stage === 'map-selection'">
          <div class="app__rent-flow">
          <RentOutScreen
            v-show="stage === 'rent'"
            :selected-address="selectedAddress"
            :selected-latitude="selectedLatitude || undefined"
            :selected-longitude="selectedLongitude || undefined"
            :current-user="currentUser"
            :spot-id="editingSpotId || undefined"
            @back="goHome"
            @success="() => { editingSpotId = null; stage = 'rent-success' }"
            @open-map="() => stage = 'map-selection'"
            @update-address="(addr) => { selectedAddress = addr }"
          />
          <div v-show="stage === 'map-selection'" class="app__rent-flow-map">
          <MapSelectionScreen
            @back="() => stage = 'rent'"
            @select-address="(addr, lat, lng) => { 
              selectedAddress = addr; 
              selectedLatitude = lat || null; 
              selectedLongitude = lng || null; 
              stage = 'rent'; 
            }"
          />
          </div>
          </div>
        </template>

        <ProfileScreen
          v-else-if="stage === 'profile'"
          :current-user="currentUser"
          :user-car="userCar"
          :payment-card="selectedPaymentCard"
          @back="goHome"
          @edit-name="handleProfileEditName"
          @edit-phone="handleChangePhone"
          @edit-car="handleChangeCar"
          @edit-payment="handleChangePaymentCard"
          @help-support="handleHelpSupport"
          @login-another="goToLogin"
          @logout="handleLogout"
          @settings="handleProfileSettings"
        />


        <ChangePhoneScreen
          v-else-if="stage === 'change-phone'"
          :current-phone="currentUser?.phone"
          :on-back="handleChangePhoneBack"
          :on-change-phone="handleChangePhoneSubmit"
        />

        <HelpSupportScreen
          v-else-if="stage === 'help-support'"
          @back="handleHelpSupportBack"
          @contact-support="handleHelpSupportBack"
        />

        <ChatListScreen
          v-else-if="stage === 'chat-list' && featureStates['chat'] !== false"
          :bookings="bookings"
          :owner-requests="ownerRequests"
          @back="handleChatListBack"
          @open-chat="handleOpenChatFromList"
        />

        <BookingListScreen
          v-else-if="stage === 'booking-list'"
          :bookings="bookings"
          @back="goHome"
          @open-booking="handleOpenBookingFromList"
          @open-chat="handleOpenChatFromList"
        />

        <MySpotsScreen
          v-else-if="stage === 'my-spots'"
          ref="mySpotsScreenRef"
          @back="goHome"
          @open-spot="(spot) => { console.log('Spot clicked:', spot); /* TODO: Navigate to spot details */ }"
          @edit-spot="handleEditSpot"
          @add-spot="openRentFromHome"
          @hide-spot="handleUnpublishSpot"
          @activate-spot="handleActivateSpot"
        />

        <UnpublishSpotScreen
          v-else-if="stage === 'unpublish-spot' && selectedSpotIdForUnpublish"
          :spot-id="selectedSpotIdForUnpublish"
          @back="goHome"
          @cancel="goHome"
          @confirm="handleUnpublishSpotConfirm"
        />

        <BookingDetailsScreen
          v-else-if="stage === 'booking-details' && selectedBooking"
          :booking="selectedBooking"
          :user-car="userCar"
          @back="handleBookingDetailsBack"
          @open-chat="handleBookingDetailsChat"
          @start-parking="handleStartParking"
          @cancel-booking="handleCancelBooking"
          @finish-parking="handleFinishParking"
          @extend-parking="handleExtendParking"
        />

        <ClientCancelledBookingScreen
          v-else-if="stage === 'client-cancelled-booking'"
          @go-home="handleClientCancelledBookingGoHome"
        />

        <EarlyBookingScreen
          v-else-if="stage === 'early-booking' && selectedBooking"
          :booking="selectedBooking"
          @back="handleEarlyBookingBack"
          @pay-and-start="handleEarlyBookingPayAndStart"
          @wait-for-scheduled="handleEarlyBookingWaitForScheduled"
        />

        <BookingErrorScreen
          v-else-if="stage === 'booking-error'"
          @ok="handleBookingErrorOk"
        />

        <RentalCompletionScreen
          v-else-if="stage === 'rental-completion' && selectedBooking"
          :booking="selectedBooking"
          @back="handleRentalCompletionBack"
          @complete="handleRentalCompletionConfirm"
        />

        <BookingExtendedScreen
          v-else-if="stage === 'booking-extended' && selectedBooking && extendedBookingData"
          :booking="selectedBooking"
          :extended-end-date="extendedBookingData.date"
          :extended-end-time="extendedBookingData.time"
          :surcharge="extendedBookingData.surcharge"
          @send-message="handleBookingExtendedSendMessage"
          @close="handleBookingExtendedClose"
        />

        <!-- Cancel Booking Modal -->
        <CancelBookingModal
          v-if="showCancelModal"
          @confirm="handleCancelBookingConfirm"
          @cancel="handleCancelBookingCancel"
        />

        <!-- Extend Booking Modal -->
        <ExtendBookingModal
          v-if="showExtendModal && selectedBooking"
          :current-end-date="selectedBooking.endDate"
          :current-end-time="selectedBooking.endTime"
          @confirm="handleExtendBookingConfirm"
          @cancel="handleExtendBookingCancel"
        />

        <PlaceholderScreen
          v-else-if="stage === 'chat-list'"
          title="Чаты запускаем позже"
          description="Команда работает над единым центром общения с арендаторами и службой поддержки."
        />

        <ChatScreen
          v-else-if="stage === 'chat' && featureStates['chat'] !== false"
          :contact-name="selectedChatName"
          :booking="selectedChatBooking"
          :booking-id="selectedChatBookingId"
          @back="handleChatBack"
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
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.app__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(116px + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-width: 0;
  box-sizing: border-box;
}

.app__content:has(.chat),
.app__content:has(.search-screen),
.app__content:has(.rent-out) {
  padding-bottom: 0;
}

.app__rent-flow {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app__rent-flow-map {
  position: absolute;
  inset: 0;
  z-index: 10;
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
