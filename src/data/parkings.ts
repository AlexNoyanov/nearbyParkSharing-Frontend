export interface ParkingFeature {
  id: string
  label: string
  icon: string
}

export interface ParkingSpot {
  id: string
  name: string
  address: string
  distance: string
  pricePerHour: string
  rating: number
  reviews: number
  availableSpots: number
  features: ParkingFeature[]
  description: string
}

export const featuredParkings: ParkingSpot[] = [
  {
    id: 'skyline',
    name: 'Skyline Parking',
    address: 'ул. Льва Толстого, 18',
    distance: '350 м',
    pricePerHour: '350 ₽/час',
    rating: 4.8,
    reviews: 126,
    availableSpots: 12,
    description:
      'Охраняемая парковка рядом с деловым центром. Есть круглосуточная охрана и бесплатная мойка по записи.',
    features: [
      { id: 'security', label: 'Охрана 24/7', icon: '🛡️' },
      { id: 'charger', label: 'Зарядка EV', icon: '⚡' },
      { id: 'covered', label: 'Под крышей', icon: '🏢' },
    ],
  },
  {
    id: 'river',
    name: 'River Quay',
    address: 'Набережная реки, 42',
    distance: '620 м',
    pricePerHour: '290 ₽/час',
    rating: 4.6,
    reviews: 89,
    availableSpots: 7,
    description:
      'Парковка у набережной с множеством кафе и прогулочных зон. Удобный выезд на КАД и внутренний двор.',
    features: [
      { id: 'camera', label: 'Камеры', icon: '🎥' },
      { id: 'lighting', label: 'Подсветка', icon: '💡' },
      { id: 'subscription', label: 'Абонемент', icon: '🗓️' },
    ],
  },
  {
    id: 'arena',
    name: 'Arena Hub',
    address: 'пр. Победы, 8',
    distance: '1.2 км',
    pricePerHour: '240 ₽/час',
    rating: 4.4,
    reviews: 63,
    availableSpots: 15,
    description:
      'Большая парковка возле спортивного комплекса. Доступны семейные места и приоритет для владельцев абонементов.',
    features: [
      { id: 'wide', label: 'Широкие места', icon: '🚗' },
      { id: 'family', label: 'Семейные места', icon: '👨‍👩‍👧' },
      { id: 'lighting', label: 'Яркое освещение', icon: '🔦' },
    ],
  },
]

export const subscriptionPlans = [
  {
    id: 'daily',
    title: 'Дневной',
    description: '08:00 — 20:00',
    price: '1 990 ₽/мес.',
  },
  {
    id: 'night',
    title: 'Ночной',
    description: '20:00 — 08:00',
    price: '1 590 ₽/мес.',
  },
  {
    id: 'full',
    title: 'Круглосуточно',
    description: 'Доступ 24/7',
    price: '2 990 ₽/мес.',
  },
]

export interface BookingStep {
  id: string
  label: string
  time: string
  isCompleted: boolean
}

export const bookingTimeline: BookingStep[] = [
  { id: 'request', label: 'Заявка отправлена', time: '12:40', isCompleted: true },
  { id: 'confirmed', label: 'Бронь подтверждена', time: '12:42', isCompleted: true },
  { id: 'arriving', label: 'Прибытие на место', time: '12:55', isCompleted: false },
  { id: 'parking', label: 'Паркуйтесь', time: '13:00', isCompleted: false },
]

