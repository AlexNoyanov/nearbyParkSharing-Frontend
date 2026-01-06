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
import ClientCancelledBookingScreen from './views/ClientCancelledBookingScreen.vue'
import CancelBookingModal from './components/CancelBookingModal.vue'

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
  | 'booking-confirmation'
  | 'map-selection'
  | 'full-screen-map'
  | 'profile'
  | 'chat'
  | 'chat-list'
  | 'payment-cards'
  | 'placeholder'
  | 'owner-request-confirmation'
  | 'owner-request-decline'
  | 'owner-booking-confirmed'
  | 'owner-completed-booking'
  | 'owner-cancelled-booking'
  | 'booking-list'
  | 'booking-details'
  | 'client-cancelled-booking'

const stage = ref<Stage>('onboarding1')
const selectedParking = ref<ParkingSpot | null>(null)
const showCancelModal = ref(false)
const navSelection = ref<'home' | 'search' | 'rent' | 'profile' | 'chat'>('home')
const userName = ref<string>()
const currentUser = ref<User | null>(null)
const authPhone = ref<string>('')
const authName = ref<string>('')
const isRegistrationFlow = ref<boolean>(false)
const selectedAddress = ref<string>('')
const selectedLocation = ref<{ id: string; address: string; lat: number; lng: number; priceHour: string; priceDay: string; priceMonth: string; availability: 'hourly' | 'daily' | 'monthly' } | null>(null)
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
      stage.value !== 'client-cancelled-booking'
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
  ownerRequests.value = []
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

   // Инициализируем заявки на бронирование для владельца места
  if (user.phone === '+79990001122') {
    ownerRequests.value = [
      {
        id: 'owner-req-1',
        address: 'Москва, Тверская, 15',
        startDate: '2025-12-15',
        endDate: '2025-12-15',
        startTime: '10:00',
        endTime: '14:00',
        renterName: 'Михаил',
        status: 'awaiting',
      },
      {
        id: 'owner-req-2',
        address: 'Москва, Тверская, 15',
        startDate: '2025-12-15',
        endDate: '2025-12-15',
        startTime: '16:00',
        endTime: '20:00',
        renterName: 'Елена',
        status: 'cancelled',
      },
      {
        id: 'owner-req-3',
        address: 'Москва, Тверская, 15',
        startDate: '2025-12-14',
        endDate: '2025-12-14',
        startTime: '09:00',
        endTime: '12:00',
        renterName: 'Дмитрий',
        status: 'completed',
      },
      {
        id: 'owner-req-4',
        address: 'Москва, Тверская, 15',
        startDate: '2025-12-16',
        endDate: '2025-12-16',
        startTime: '14:00',
        endTime: '18:00',
        renterName: 'Алексей',
        status: 'active',
      },
      {
        id: 'owner-req-5',
        address: 'Москва, Тверская, 15',
        startDate: '2025-12-17',
        endDate: '2025-12-17',
        startTime: '10:00',
        endTime: '18:00',
        renterName: 'Иван',
        status: 'confirmed',
      },
    ]
    bookings.value = []
    bookingsCount.value = 0
  } else if (user.phone === '+79990001133') {
    // Новый клиент с подтвержденным бронированием
    ownerRequests.value = []
    bookings.value = [
      {
        id: 'booking-1',
        address: 'ул. Льва Толстого, 18',
        startDate: '2025-12-20',
        endDate: '2025-12-20',
        startTime: '10:00',
        endTime: '14:00',
        rentalType: 'hourly',
        createdAt: new Date('2025-12-19'),
        status: 'confirmed',
        parkingSpotId: 'skyline',
      },
    ]
    bookingsCount.value = 1
  } else {
    ownerRequests.value = []
    bookings.value = []
    bookingsCount.value = 0
  }

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

  if (value === 'rent' || value === 'profile') {
    const featureKey = value as FeatureKey
    await checkFeatureAndNavigate(value as Stage, featureKey)
    if (stage.value === value) {
      navSelection.value = value as typeof navSelection.value
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
  // "Найти парковку" теперь открывает экран сдачи места
  await checkFeatureAndNavigate('rent-map', 'rent')
  if (stage.value === 'rent-map') {
    navSelection.value = 'rent'
  }
}

const openRentFromHome = async () => {
  await checkFeatureAndNavigate('rent', 'rent')
  if (stage.value === 'rent') {
    navSelection.value = 'rent'
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
        return 'Активно'
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
  
  stage.value = 'chat'
}

const selectedChatName = ref<string | undefined>(undefined)
const selectedChatBooking = ref<{ address?: string; date?: string; time?: string; price?: string; status?: string } | undefined>(undefined)

const handleOwnerRequestConfirm = () => {
  if (!selectedOwnerRequest.value) return

  // Устанавливаем статус 'confirmed' (Ожидает начала аренды) вместо 'active'
  ownerRequests.value = ownerRequests.value.map((req) =>
    req.id === selectedOwnerRequest.value?.id ? { ...req, status: 'confirmed' } : req,
  )

  // Navigate to booking confirmed screen
  stage.value = 'owner-booking-confirmed'
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
  
  selectedChatName.value = selectedOwnerRequest.value.renterName
  selectedChatBooking.value = {
    address: selectedOwnerRequest.value.address,
    date: selectedOwnerRequest.value.startDate,
    time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
    price: '₽160',
    status: 'Подтверждено',
  }
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
  
  selectedChatName.value = selectedOwnerRequest.value.renterName
  selectedChatBooking.value = {
    address: selectedOwnerRequest.value.address,
    date: selectedOwnerRequest.value.startDate,
    time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
    price: '₽160',
    status: 'Завершено',
  }
  stage.value = 'chat'
}

const handleOwnerRequestDecline = () => {
  if (!selectedOwnerRequest.value) return

  // 1. Обновляем статус заявки на 'cancelled'
  ownerRequests.value = ownerRequests.value.map((req) =>
    req.id === selectedOwnerRequest.value?.id ? { ...req, status: 'cancelled' } : req,
  )

  // 2. Настраиваем данные для чата с информацией об отмене (для отправки сообщения)
  selectedChatName.value = selectedOwnerRequest.value.renterName
  selectedChatBooking.value = {
    address: selectedOwnerRequest.value.address,
    date: selectedOwnerRequest.value.startDate,
    time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
    price: '₽160',
    status: 'Отменено',
  }
  
  // 3. Показываем экран с отмененным бронированием (сообщение в чат будет отправлено автоматически)
  stage.value = 'owner-cancelled-booking'
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
  // Обновляем статус бронирования на 'active'
  bookings.value = bookings.value.map((b) =>
    b.id === selectedBooking.value?.id ? { ...b, status: 'active' } : b,
  )
  selectedBooking.value = { ...selectedBooking.value, status: 'active' }
  // Можно добавить переход на экран активного бронирования
  console.log('[App] Starting parking for booking:', selectedBooking.value.id)
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
  
  // Показываем экран загрузки с текстом "Направляем запрос на оплату"
  loadingMessage.value = 'Направляем запрос'
  loadingSubtitle.value = 'на оплату'
  stage.value = 'loading'
  
  // Через 2 секунды меняем текст на "Оплата успешна"
  setTimeout(() => {
    loadingMessage.value = 'Оплата успешна'
    loadingSubtitle.value = ''
  }, 2000)
  
  // Через 3 секунды переходим на главный экран, создаем бронирование и увеличиваем счетчик
  setTimeout(() => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      address: bookingData.address,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      rentalType: bookingData.rentalType,
      createdAt: new Date(),
      status: 'awaiting'
    }
    bookings.value.push(newBooking)
    bookingsCount.value = bookings.value.length
    stage.value = 'home'
    navSelection.value = 'home'
  }, 3000)
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
  // Set userName immediately (synchronous)
  userName.value = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name
  
  // Check feature toggle asynchronously after component has rendered
  try {
  const onboarding1Enabled = await isFeatureEnabled('onboarding1')
  if (!onboarding1Enabled) {
    placeholderMessage.value = featureToggles.getPlaceholderMessage('onboarding1')
    stage.value = 'placeholder'
    }
  } catch (error) {
    console.error('Error checking feature toggle:', error)
    // Keep default stage 'onboarding1' if check fails
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
          @select-location="(location) => { selectedLocation = location; stage = 'rent-map-details'; }"
        />
        
        <ParkingSpotDetailsScreen
          v-else-if="stage === 'rent-map-details' && selectedLocation"
          :location="selectedLocation"
          @back="() => stage = 'rent-map'"
          @select-dates="() => { if (selectedLocation) { stage = 'rent-booking-dates'; } }"
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

        <RentOutScreen
          v-else-if="stage === 'rent'"
          :selected-address="selectedAddress"
          :current-user="currentUser"
          @back="goHome"
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

        <ChatListScreen
          v-else-if="stage === 'chat-list' && featureStates['chat'] !== false"
          :bookings="bookings"
          @back="goHome"
          @open-chat="handleOpenChatFromList"
        />

        <BookingListScreen
          v-else-if="stage === 'booking-list'"
          :bookings="bookings"
          @back="goHome"
          @open-booking="handleOpenBookingFromList"
          @open-chat="handleOpenChatFromList"
        />

        <BookingDetailsScreen
          v-else-if="stage === 'booking-details' && selectedBooking"
          :booking="selectedBooking"
          :user-car="userCar"
          @back="handleBookingDetailsBack"
          @open-chat="handleBookingDetailsChat"
          @start-parking="handleStartParking"
          @cancel-booking="handleCancelBooking"
        />

        <ClientCancelledBookingScreen
          v-else-if="stage === 'client-cancelled-booking'"
          @go-home="handleClientCancelledBookingGoHome"
        />

        <!-- Cancel Booking Modal -->
        <CancelBookingModal
          v-if="showCancelModal"
          @confirm="handleCancelBookingConfirm"
          @cancel="handleCancelBookingCancel"
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
          @back="() => { stage = 'chat-list'; selectedChatName = undefined; selectedChatBooking = undefined; }"
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

.app__content:has(.chat) {
  padding-bottom: 0;
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
