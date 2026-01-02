# Карта зависимостей проекта

## Зависимости компонентов

### App.vue (Центральный компонент)
**Зависит от:**
- Все экраны (`src/views/*`)
- `AppBottomNav` компонент
- `mockAuth` сервис
- `featureToggles` сервис
- `parkings` данные

**Используется:**
- Никем (корневой компонент)

### Компоненты навигации

#### AppBottomNav.vue
**Зависит от:**
- SVG иконки из `src/assets/icons/`
- Глобальные стили

**Используется:**
- `App.vue`

### Экраны аутентификации

#### LoginScreen.vue
**Зависит от:**
- `mockAuth` сервис
- `App.vue` (через emit для навигации)

**Используется:**
- `App.vue`

#### RegistrationScreen.vue
**Зависит от:**
- `mockAuth` сервис
- `App.vue` (через emit)

**Используется:**
- `App.vue`

#### CodeVerificationScreen.vue
**Зависит от:**
- `mockAuth` сервис
- `App.vue` (через emit)

**Используется:**
- `App.vue`

### Экраны карт

#### RentOutMapScreen.vue
**Зависит от:**
- `leaflet` библиотека
- `parkingLotImage` из assets
- Nominatim API (обратное геокодирование)
- `App.vue` (через emit для навигации)

**Используется:**
- `App.vue`

#### MapSelectionScreen.vue
**Зависит от:**
- `leaflet` библиотека
- Nominatim API
- `App.vue` (через emit)

**Используется:**
- `App.vue`

#### FullScreenMapScreen.vue
**Зависит от:**
- `leaflet` библиотека
- `App.vue` (через emit)

**Используется:**
- `App.vue`

### Экраны бронирования

#### BookingDatesScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные о выбранном парковочном месте
- Данные о выбранном автомобиле

**Используется:**
- `App.vue`

#### BookingConfirmationScreen.vue
**Зависит от:**
- `App.vue` (через emit)

**Используется:**
- `App.vue`

#### BookingErrorScreen.vue
**Зависит от:**
- `App.vue` (через emit)

**Используется:**
- `App.vue`

### Экраны парковочных мест

#### ParkingSpotDetailsScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные парковочного места

**Используется:**
- `App.vue`

#### ParkingDetailsScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)

**Используется:**
- `App.vue`

### Экраны сдачи в аренду

#### RentOutScreen.vue
**Зависит от:**
- `App.vue` (через emit)
- Локальное состояние формы

**Используется:**
- `App.vue`

#### RentOutSuccessScreen.vue
**Зависит от:**
- `App.vue` (через emit)

**Используется:**
- `App.vue`

### Экраны управления

#### HomeScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные о пользователе
- Данные о бронированиях
- Данные о запросах владельца

**Используется:**
- `App.vue`

#### PaymentCardsScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные о платежных картах

**Используется:**
- `App.vue`

#### CarSelectionScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные об автомобилях

**Используется:**
- `App.vue`

#### AddCarScreen.vue
**Зависит от:**
- `App.vue` (через emit)

**Используется:**
- `App.vue`

### Экраны чата

#### ChatListScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные о чатах/бронированиях

**Используется:**
- `App.vue`

#### ChatScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные о чате
- Данные о бронировании

**Используется:**
- `App.vue`

### Экраны владельца

#### OwnerRequestConfirmationScreen.vue
**Зависит от:**
- `App.vue` (через props и emit)
- Данные о запросе на бронирование

**Используется:**
- `App.vue`

#### OwnerRequestDeclineScreen.vue
**Зависит от:**
- `App.vue` (через emit)

**Используется:**
- `App.vue`

## Внешние зависимости

### Библиотеки
- **Vue 3** - основной фреймворк
- **TypeScript** - типизация
- **Vite** - сборщик
- **Leaflet** - карты
- **Swiper** - слайдеры
- **Mobiscroll** - календари
- **Firebase** - хостинг

### API
- **Nominatim** (OpenStreetMap) - обратное геокодирование
- **Telegram WebApp API** - интеграция с Telegram

### Сервисы

#### mockAuth.ts
**Зависит от:**
- Локальное хранилище (localStorage)

**Используется:**
- `App.vue`
- Экраны аутентификации
- Другие компоненты через контекст App.vue

#### featureToggles.ts
**Зависит от:**
- Внешний PHP файл (`feature-toggles.php`) или локальные данные

**Используется:**
- `App.vue`

## Потоки данных

### Аутентификация
```
LoginScreen → mockAuth → App.vue (currentUser)
```

### Навигация
```
Любой экран → emit('back') → App.vue → stage.value = 'target'
```

### Данные парковочных мест
```
parkings.ts → App.vue → ParkingSpotDetailsScreen / RentOutMapScreen
```

### Бронирование
```
ParkingSpotDetailsScreen → BookingDatesScreen → App.vue (handleBook) → HomeScreen
```

### Чат
```
HomeScreen → ChatListScreen → ChatScreen
```

## Критические зависимости

### Нельзя удалять без замены:
- `App.vue` - центральный компонент
- `mockAuth.ts` - система аутентификации
- `leaflet` - карты
- `Vue 3` - основной фреймворк

### Можно заменить:
- `Swiper` → нативный CSS scroll-snap (уже частично используется)
- `Mobiscroll` → кастомные компоненты
- `Nominatim` → другой геокодинг сервис

## Рекомендации по модификации

### При добавлении нового экрана:
1. Создайте файл в `src/views/`
2. Добавьте в `Stage` type в `App.vue`
3. Импортируйте в `App.vue`
4. Добавьте условный рендеринг
5. Обработайте навигацию

### При добавлении нового сервиса:
1. Создайте файл в `src/services/`
2. Экспортируйте функции/классы
3. Импортируйте где необходимо
4. Документируйте API

### При добавлении новой зависимости:
1. Проверьте размер бандла
2. Проверьте совместимость с существующими зависимостями
3. Обновите `package.json`
4. Установите через `npm install`
5. Документируйте использование

