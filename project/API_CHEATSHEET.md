# API Cheatsheet

**Base URL:** `https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/api/v1`

**Swagger:** `/v3/api-docs` | `/swagger-ui.html`

---

## Auth

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/auth/login` | Login через Telegram initData | - |
| POST | `/auth/call-check/init` | Начать верификацию телефона | - |
| POST | `/auth/call-check/status` | Проверить статус верификации | - |
| GET | `/users/me` | Текущий пользователь | JWT |

---

## Spots

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/spots` | Создать парковку | JWT |
| GET | `/spots/search` | Поиск парковок | - |
| GET | `/spots/{id}` | Детали парковки | - |
| GET | `/spots/my` | Мои парковки | JWT |
| PUT | `/spots/{id}` | Обновить парковку | JWT |
| POST | `/spots/{id}/archive` | Архивировать | JWT |
| POST | `/spots/{id}/activate` | Активировать из архива | JWT |
| GET | `/spots/{id}/archive/preview` | Превью влияния архивации | JWT |

### Search Query Params

**Для HOURLY:**
```
?rentType=HOURLY&date=2024-01-25&timeFrom=10:00&timeTo=18:00
```

**Для DAILY/MONTHLY:**
```
?rentType=DAILY&dateFrom=2024-01-25&dateTo=2024-01-30
```

**Geo (optional):**
```
&centerLat=55.75&centerLng=37.61&radiusMeters=5000
```
или
```
&minLat=55.70&maxLat=55.80&minLng=37.50&maxLng=37.70
```

---

## Bookings

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/bookings` | Создать бронирование | JWT |
| GET | `/bookings/{id}` | Детали бронирования | JWT |
| GET | `/bookings/my/renting` | Мои аренды (я рентер) | JWT |
| GET | `/bookings/my/leasing` | Мои сдачи (я владелец) | JWT |
| POST | `/bookings/{id}/confirm` | Подтвердить (owner) | JWT |
| POST | `/bookings/{id}/start` | Начать аренду (renter) | JWT |
| POST | `/bookings/{id}/finish` | Завершить | JWT |
| POST | `/bookings/{id}/cancel` | Отменить | JWT |

### Create Booking Body

**HOURLY:**
```json
{
  "spotId": "uuid",
  "carId": "uuid",
  "rentType": "HOURLY",
  "date": "2024-01-25",
  "timeFrom": "10:00",
  "timeTo": "18:00",
  "clientTotalAmount": 1200
}
```

**DAILY/MONTHLY:**
```json
{
  "spotId": "uuid",
  "carId": "uuid",
  "rentType": "DAILY",
  "dateFrom": "2024-01-25",
  "dateTo": "2024-01-30",
  "clientTotalAmount": 5000
}
```

---

## Cars

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/cars` | Добавить авто | JWT |
| GET | `/cars` | Список авто | JWT |
| PUT | `/cars/{id}` | Обновить | JWT |
| DELETE | `/cars/{id}` | Удалить | JWT |

### Car Body
```json
{
  "licensePlate": "А123ВС777",
  "brand": "Toyota",
  "model": "Camry",
  "color": "Черный"
}
```

---

## Chats

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/chats/by-booking/{bookingId}` | Чат по бронированию | JWT |
| GET | `/chats/{chatId}/messages` | Сообщения чата | JWT |

---

## Media

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/media/upload` | Загрузить фото (multipart) | JWT |

---

## Enums

### VehicleType
`CAR` | `SUV` | `VAN` | `TRUCK` | `MOTORCYCLE`

### ScheduleType
`ALWAYS` | `CUSTOM`

### RentType
`HOURLY` | `DAILY` | `MONTHLY`

### BookingStatus
```
WAITING_CONFIRMATION → WAITING_START → ACTIVE → FINISHED
                                              ↘ CANCELED
```

### ChatState
`LOCKED` | `OPEN` | `CLOSED`

### ChatMessageType
`USER` | `SYSTEM`

---

## Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept: application/json
```

---

## Pagination

```
?page=0&size=20&sort=createdAt,desc
```

**Response:**
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false,
  "empty": false
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (slot occupied, active booking) |

---

## Frontend → Backend Mapping

| Frontend | Backend | Примечание |
|----------|---------|------------|
| `SCHEDULED` | `CUSTOM` | ScheduleType |
| `cancelUpcomingBookings` | `cancelBlockingBookings` | Archive request |
