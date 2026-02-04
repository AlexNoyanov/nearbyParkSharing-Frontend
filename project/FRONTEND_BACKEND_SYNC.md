# Frontend-Backend Синхронизация

Документ описывает взаимодействие между Frontend (Vue 3 + TypeScript) и Backend (Spring Boot + Java 25).

**Источник истины:** Swagger API (`/parkshare/v3/api-docs`)

---

## Общая информация

| Компонент | Технологии | URL |
|-----------|------------|-----|
| **Frontend** | Vue 3, TypeScript, Vite | `http://localhost:3000` (dev) |
| **Backend** | Spring Boot 3.5.7, Java 25 | `https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare` |
| **API Base Path** | — | `/api/v1` |
| **Swagger JSON** | — | `/v3/api-docs` |
| **Swagger UI** | — | `/swagger-ui.html` |

---

## Аутентификация

### 1. Login (Telegram Mini App)

```
POST /api/v1/auth/login
```

| Frontend | Backend | Тип | Статус |
|----------|---------|-----|--------|
| `initData` | `initData` | string | ✅ Совпадает |

**Response:**
```json
{
  "status": "OK | NEED_PHONE | ERROR",
  "token": "string (JWT, только при OK)"
}
```

---

### 2. Phone Verification - Init

```
POST /api/v1/auth/call-check/init
```

| Frontend | Backend | Тип | Статус |
|----------|---------|-----|--------|
| `initData` | `initData` | string | ✅ |
| `phoneNumber` | `phoneNumber` | string | ✅ |
| `name` | `name` | string | ✅ |

**Response:**
```json
{
  "prettyPhone": "string",
  "rawPhone": "string"
}
```

---

### 3. Phone Verification - Status

```
POST /api/v1/auth/call-check/status
```

| Frontend | Backend | Тип | Статус |
|----------|---------|-----|--------|
| `phoneNumber` | `phoneNumber` | string | ✅ |

**Response:** То же, что `/auth/login`

---

### 4. Get Current User

```
GET /api/v1/users/me
Authorization: Bearer <JWT>
```

**Response:**
```json
{
  "id": "uuid",
  "telegramId": "int64",
  "phoneNumber": "string",
  "firstName": "string",
  "lastName": "string",
  "username": "string"
}
```

---

## Parking Spots

### Enums

#### VehicleType ✅ СОВПАДАЕТ
| Frontend | Backend |
|----------|---------|
| `CAR` | `CAR` |
| `VAN` | `VAN` |
| `TRUCK` | `TRUCK` |
| — | `SUV` |
| — | `MOTORCYCLE` |

#### ScheduleType ✅ СОВПАДАЕТ
| Frontend | Backend |
|----------|---------|
| `ALWAYS` | `ALWAYS` |
| `SCHEDULED` | `CUSTOM` |

**Примечание:** Frontend использует `SCHEDULED`, backend — `CUSTOM`. Нужен маппинг.

---

### Create/Update Spot

```
POST /api/v1/spots           — создание
PUT  /api/v1/spots/{id}      — обновление
```

| Frontend | Backend | Тип | Статус |
|----------|---------|-----|--------|
| `address` | `address` | string (required, minLength: 1) | ✅ |
| `latitude` | `latitude` | double (required) | ✅ |
| `longitude` | `longitude` | double (required) | ✅ |
| `vehicleType` | `vehicleType` | enum (required) | ✅ |
| `pricePerHour` | `pricePerHour` | number (min: 0) | ✅ |
| `pricePerDay` | `pricePerDay` | number (min: 0) | ✅ |
| `pricePerMonth` | `pricePerMonth` | number (min: 0) | ✅ |
| `scheduleType` | `scheduleType` | enum (required) | ⚠️ SCHEDULED→CUSTOM |
| `availableFrom` | `availableFrom` | string (HH:mm) | ✅ |
| `availableTo` | `availableTo` | string (HH:mm) | ✅ |
| `availableDays` | `availableDays` | array\<int\> | ✅ |
| `covered` | `covered` | boolean | ✅ |
| `hasSecurity` | `hasSecurity` | boolean | ✅ |
| `hasEvCharging` | `hasEvCharging` | boolean | ✅ |
| `openSpace` | `openSpace` | boolean | ✅ |
| `inYard` | `inYard` | boolean | ✅ |
| `privateTerritory` | `privateTerritory` | boolean | ✅ |
| `hasCctv` | `hasCctv` | boolean | ✅ |
| `description` | `description` | string | ✅ |
| `accessGuide` | `accessGuide` | string | ✅ |
| `photos` | `photos` | array\<string\> | ✅ |
| `hourlyEnabled` | `hourlyEnabled` | boolean | ✅ |
| `dailyEnabled` | `dailyEnabled` | boolean | ✅ |
| `monthlyEnabled` | `monthlyEnabled` | boolean | ✅ |
| `availableDateFrom` | `availableDateFrom` | date (YYYY-MM-DD) | ✅ |
| `availableDateTo` | `availableDateTo` | date (YYYY-MM-DD) | ✅ |

**ВЫВОД:** Поля Spots API полностью совпадают! Единственное — маппинг `SCHEDULED` → `CUSTOM`.

---

### Get My Spots

```
GET /api/v1/spots/my
Authorization: Bearer <JWT>
```

**Response:** Array\<SpotResponse\>

**Frontend файл:** `src/services/spotsApi.ts:86-164` ✅ Реализовано

---

### Get Spot by ID

```
GET /api/v1/spots/{id}
```

**Frontend файл:** `src/services/spotsApi.ts:170-245` ✅ Реализовано

---

### Search Spots

```
GET /api/v1/spots/search
```

**Query Parameters:**

| Параметр | Тип | Обязательный | Для |
|----------|-----|--------------|-----|
| `rentType` | enum | Да | Все |
| `date` | YYYY-MM-DD | Да (HOURLY) | HOURLY |
| `timeFrom` | HH:mm | Да (HOURLY) | HOURLY |
| `timeTo` | HH:mm | Да (HOURLY) | HOURLY |
| `dateFrom` | YYYY-MM-DD | Да (DAILY/MONTHLY) | DAILY/MONTHLY |
| `dateTo` | YYYY-MM-DD | Да (DAILY/MONTHLY) | DAILY/MONTHLY |
| `minLat`, `minLng`, `maxLat`, `maxLng` | double | Нет | Bounding box |
| `centerLat`, `centerLng`, `radiusMeters` | double | Нет | Radius search |

**Response:**
```json
[
  {
    "id": "uuid",
    "address": "string",
    "latitude": "double",
    "longitude": "double",
    "rentType": "HOURLY | DAILY | MONTHLY",
    "price": "number",
    "photos": ["string"]
  }
]
```

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО

---

### Archive Spot

```
POST /api/v1/spots/{id}/archive
Authorization: Bearer <JWT>
```

**Request (optional):**
```json
{
  "cancelBlockingBookings": true,
  "cancelReason": "string"
}
```

**Frontend файл:** `src/services/spotsApi.ts:419-497`

**Статус:** ⚠️ Frontend передаёт `cancelUpcomingBookings` как query param, backend ожидает `cancelBlockingBookings` в body.

---

### Activate Spot (NEW!)

```
POST /api/v1/spots/{id}/activate
Authorization: Bearer <JWT>
```

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО

---

### Archive Preview (NEW!)

```
GET /api/v1/spots/{id}/archive/preview
Authorization: Bearer <JWT>
```

**Response:**
```json
{
  "spotId": "uuid",
  "activeCount": 2,
  "upcomingCount": 5,
  "active": [...],
  "upcoming": [...]
}
```

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО

---

## Cars (Автомобили)

### Create Car

```
POST /api/v1/cars
Authorization: Bearer <JWT>
```

| Поле | Тип | Обязательный |
|------|-----|--------------|
| `licensePlate` | string (pattern: `^[А-Яа-яA-Z0-9\\s]+$`) | Да |
| `brand` | string | Да |
| `model` | string | Нет |
| `color` | string | Нет |

**Response:**
```json
{
  "id": "uuid",
  "licensePlate": "А123ВС777",
  "brand": "Toyota",
  "model": "Camry",
  "color": "Черный"
}
```

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО (нужен `carsApi.ts`)

---

### Get My Cars

```
GET /api/v1/cars
Authorization: Bearer <JWT>
```

---

### Update Car

```
PUT /api/v1/cars/{id}
Authorization: Bearer <JWT>
```

---

### Delete Car

```
DELETE /api/v1/cars/{id}
Authorization: Bearer <JWT>
```

---

## Bookings (Бронирования)

### Статусы

```
WAITING_CONFIRMATION → WAITING_START → ACTIVE → FINISHED
         │                   │            │
         └───────────────────┴────────────┴──────> CANCELED
```

### RentType

| Значение | Описание |
|----------|----------|
| `HOURLY` | Почасовая аренда |
| `DAILY` | Посуточная аренда |
| `MONTHLY` | Помесячная аренда |

---

### Create Booking

```
POST /api/v1/bookings
Authorization: Bearer <JWT>
```

**Request:**
```json
{
  "spotId": "uuid (required)",
  "carId": "uuid (required)",
  "rentType": "HOURLY | DAILY | MONTHLY (required)",
  "date": "YYYY-MM-DD (for HOURLY)",
  "timeFrom": "HH:mm (for HOURLY)",
  "timeTo": "HH:mm (for HOURLY)",
  "dateFrom": "YYYY-MM-DD (for DAILY/MONTHLY)",
  "dateTo": "YYYY-MM-DD (for DAILY/MONTHLY)",
  "clientTotalAmount": "number"
}
```

**Response:**
```json
{
  "id": "uuid",
  "spot": { "id": "uuid", "address": "string", ... },
  "owner": { "id": "uuid", "firstName": "string", ... },
  "renter": { "id": "uuid", "firstName": "string", ... },
  "car": { "id": "uuid", "licensePlate": "string", ... },
  "rentType": "HOURLY",
  "status": "WAITING_CONFIRMATION",
  "startAt": "2024-01-25T10:00:00Z",
  "endAt": "2024-01-25T18:00:00Z",
  "totalAmount": 1200.00,
  "createdAt": "2024-01-20T15:00:00Z"
}
```

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО

---

### Get Booking Details

```
GET /api/v1/bookings/{id}
Authorization: Bearer <JWT>
```

---

### Booking Actions

| Endpoint | Метод | Действие | Кто может |
|----------|-------|----------|-----------|
| `/bookings/{id}/confirm` | POST | Подтвердить | Owner |
| `/bookings/{id}/start` | POST | Начать аренду | Renter |
| `/bookings/{id}/finish` | POST | Завершить | Owner/Renter |
| `/bookings/{id}/cancel` | POST | Отменить | Owner/Renter |

**Cancel Request:**
```json
{
  "reason": "string"
}
```

---

### My Bookings

```
GET /api/v1/bookings/my/renting    — я арендатор
GET /api/v1/bookings/my/leasing    — я владелец
Authorization: Bearer <JWT>
```

**Query Parameters:**
- `activeOnly` (boolean, default: false)
- `page` (int, required)
- `size` (int, required)
- `sort` (array\<string\>)

**Response:** Paginated BookingListItemResponse

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО

---

## Chat

### Get Chat by Booking

```
GET /api/v1/chats/by-booking/{bookingId}
Authorization: Bearer <JWT>
```

**Response:**
```json
{
  "chatId": "uuid",
  "state": "LOCKED | OPEN | CLOSED"
}
```

---

### Get Messages

```
GET /api/v1/chats/{chatId}/messages
Authorization: Bearer <JWT>
```

**Query Parameters:**
- `page`, `size`, `sort`

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "senderUserId": "uuid",
      "type": "USER | SYSTEM",
      "text": "string",
      "createdAt": "2024-01-20T15:30:00Z"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  ...
}
```

**Frontend:** ❌ НЕ РЕАЛИЗОВАНО

---

## Media

### Upload Image

```
POST /api/v1/media/upload
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
```

**Request:** FormData с полем `file`

**Response:**
```json
{
  "url": "https://s3.../photo.jpg"
}
```

**Frontend файл:** `src/services/mediaApi.ts` ✅ Реализовано

---

## Сводка статусов реализации

### ✅ Полностью реализовано

| Модуль | Endpoint | Frontend файл |
|--------|----------|---------------|
| Auth | `/auth/login` | `authApi.ts:79-135` |
| Auth | `/auth/call-check/init` | `authApi.ts:141-601` |
| Auth | `/auth/call-check/status` | `authApi.ts:610-709` |
| Auth | `/users/me` | `authApi.ts:716-795` |
| Spots | `POST /spots` | `spotsApi.ts:251-327` |
| Spots | `PUT /spots/{id}` | `spotsApi.ts:333-410` |
| Spots | `GET /spots/my` | `spotsApi.ts:86-164` |
| Spots | `GET /spots/{id}` | `spotsApi.ts:170-245` |
| Media | `POST /media/upload` | `mediaApi.ts` |

### ⚠️ Частично реализовано

| Модуль | Проблема |
|--------|----------|
| Spots Archive | Параметр `cancelBlockingBookings` передаётся как query, а не в body |
| ScheduleType | Нужен маппинг `SCHEDULED` → `CUSTOM` |

### ❌ Не реализовано

| Модуль | Endpoints |
|--------|-----------|
| Spots | `GET /spots/search`, `POST /spots/{id}/activate`, `GET /spots/{id}/archive/preview` |
| Cars | Все: `GET/POST/PUT/DELETE /cars` |
| Bookings | Все: CRUD + actions |
| Chat | `GET /chats/by-booking/{id}`, `GET /chats/{id}/messages` |

---

## Необходимые изменения

### 1. Маппинг ScheduleType

```typescript
// src/services/adapters/spotAdapter.ts
const SCHEDULE_TYPE_MAP = {
  'ALWAYS': 'ALWAYS',
  'SCHEDULED': 'CUSTOM',  // Frontend → Backend
};

const SCHEDULE_TYPE_MAP_REVERSE = {
  'ALWAYS': 'ALWAYS',
  'CUSTOM': 'SCHEDULED',  // Backend → Frontend
};
```

### 2. Исправить Archive Spot

```typescript
// Текущая реализация (неверно):
const API_URL = `${API_BASE_URL}/api/v1/spots/${id}/archive?cancelUpcomingBookings=true`

// Правильно:
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({
    cancelBlockingBookings: cancelUpcomingBookings,
    cancelReason: reason
  })
});
```

### 3. Создать недостающие сервисы

```
src/services/
├── authApi.ts       ✅
├── spotsApi.ts      ✅ (+ исправить archive)
├── mediaApi.ts      ✅
├── bookingsApi.ts   ❌ СОЗДАТЬ
├── carsApi.ts       ❌ СОЗДАТЬ
└── chatsApi.ts      ❌ СОЗДАТЬ
```

---

## Версии

| Документ | Версия | Дата |
|----------|--------|------|
| Swagger API | 1.0.0 | актуальный |
| Frontend | 0.0.0 | 2026-01-29 |
| Этот документ | 2.0 | 2026-01-29 |
