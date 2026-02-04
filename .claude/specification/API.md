# API Документация Parksharing

**Base URL:** `http://localhost:8082/parkshare/api/v1`

**Swagger UI:** `http://localhost:8082/parkshare/swagger-ui.html`

## Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Модуль Authentication

### POST /auth/login
Аутентификация через Telegram Mini App.

**Request:**
```json
{
  "initData": "query_id=...&user=...&hash=..."
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "telegramId": 123456789,
    "firstName": "Иван",
    "lastName": "Иванов",
    "username": "ivan_user",
    "phoneNumber": "+79991234567",
    "email": "ivan@example.com"
  }
}
```

**Errors:**
- `400 Bad Request` - невалидные данные Telegram
- `401 Unauthorized` - невалидная подпись HMAC

---

### POST /auth/request-code
Запрос кода верификации номера телефона (Call Check).

**Request:**
```json
{
  "phoneNumber": "+79991234567"
}
```

**Response (200 OK):**
```json
{
  "checkId": "abc123xyz",
  "message": "Звонок инициирован. Последние 4 цифры номера - ваш код."
}
```

**Errors:**
- `400 Bad Request` - невалидный формат номера
- `429 Too Many Requests` - превышен лимит попыток

---

### POST /auth/verify-code
Проверка кода верификации.

**Request:**
```json
{
  "phoneNumber": "+79991234567",
  "code": "1234"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "message": "Номер телефона подтвержден"
}
```

**Errors:**
- `400 Bad Request` - неверный код
- `410 Gone` - код истек
- `429 Too Many Requests` - превышено количество попыток

---

### GET /auth/me
Получение информации о текущем пользователе.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "telegramId": 123456789,
  "firstName": "Иван",
  "lastName": "Иванов",
  "username": "ivan_user",
  "phoneNumber": "+79991234567",
  "email": "ivan@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## Модуль Parking Spots

### POST /spots
Создание парковочного места.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "address": "Москва, ул. Ленина, д. 1",
  "latitude": 55.7522,
  "longitude": 37.6156,
  "description": "Крытая парковка с охраной",
  "vehicleType": "CAR",
  "priceHourly": 150.00,
  "priceDaily": 1000.00,
  "priceMonthly": 20000.00,
  "scheduleType": "ALWAYS",
  "availableDates": [],
  "availableTimeFrom": null,
  "availableTimeTo": null,
  "amenities": {
    "covered": true,
    "security": true,
    "evCharging": false,
    "cctv": true
  },
  "photos": [
    "https://s3.amazonaws.com/bucket/photo1.jpg",
    "https://s3.amazonaws.com/bucket/photo2.jpg"
  ],
  "accessGuide": "Парковка находится во дворе, код от ворот 1234"
}
```

**Enum значения:**
- `vehicleType`: `CAR`, `MOTORCYCLE`, `BICYCLE`
- `scheduleType`: `FIXED_DATES`, `DAILY`, `ALWAYS`

**Response (201 Created):**
```json
{
  "id": 42,
  "ownerId": 1,
  "address": "Москва, ул. Ленина, д. 1",
  "latitude": 55.7522,
  "longitude": 37.6156,
  "description": "Крытая парковка с охраной",
  "vehicleType": "CAR",
  "priceHourly": 150.00,
  "priceDaily": 1000.00,
  "priceMonthly": 20000.00,
  "scheduleType": "ALWAYS",
  "amenities": {
    "covered": true,
    "security": true,
    "evCharging": false,
    "cctv": true
  },
  "photos": [
    "https://s3.amazonaws.com/bucket/photo1.jpg"
  ],
  "isArchived": false,
  "createdAt": "2024-01-20T14:30:00Z"
}
```

**Errors:**
- `400 Bad Request` - невалидные данные
- `401 Unauthorized` - не авторизован

---

### GET /spots/search
Поиск парковочных мест с фильтрами.

**Query Parameters:**

| Параметр | Тип | Описание | Обязательный |
|----------|-----|----------|--------------|
| latitude | double | Широта центра поиска | Да (если radius) |
| longitude | double | Долгота центра поиска | Да (если radius) |
| radius | double | Радиус поиска (метры) | Нет (по умолчанию 5000) |
| minLat | double | Мин. широта (bounding box) | Нет |
| maxLat | double | Макс. широта (bounding box) | Нет |
| minLon | double | Мин. долгота (bounding box) | Нет |
| maxLon | double | Макс. долгота (bounding box) | Нет |
| vehicleType | string | Тип транспорта | Нет |
| rentType | string | Тип аренды | Да |
| startAt | ISO datetime | Начало аренды | Да |
| endAt | ISO datetime | Конец аренды | Да |
| minPrice | decimal | Мин. цена | Нет |
| maxPrice | decimal | Макс. цена | Нет |
| amenities | string[] | Удобства | Нет |
| page | int | Номер страницы (0-based) | Нет (по умолчанию 0) |
| size | int | Размер страницы | Нет (по умолчанию 20) |

**Пример запроса:**
```
GET /spots/search?latitude=55.7522&longitude=37.6156&radius=3000&rentType=HOURLY&startAt=2024-01-25T10:00:00&endAt=2024-01-25T18:00:00&vehicleType=CAR&page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 42,
      "address": "Москва, ул. Ленина, д. 1",
      "latitude": 55.7522,
      "longitude": 37.6156,
      "distance": 234.5,
      "vehicleType": "CAR",
      "price": 150.00,
      "amenities": {
        "covered": true,
        "security": true,
        "evCharging": false,
        "cctv": true
      },
      "photos": [
        "https://s3.amazonaws.com/bucket/photo1.jpg"
      ]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 15,
  "totalPages": 2,
  "last": false
}
```

**Errors:**
- `400 Bad Request` - невалидные параметры

---

### GET /spots/{id}
Получение детальной информации о парковке.

**Response (200 OK):**
```json
{
  "id": 42,
  "owner": {
    "id": 1,
    "firstName": "Иван",
    "username": "ivan_user"
  },
  "address": "Москва, ул. Ленина, д. 1",
  "latitude": 55.7522,
  "longitude": 37.6156,
  "description": "Крытая парковка с охраной",
  "vehicleType": "CAR",
  "priceHourly": 150.00,
  "priceDaily": 1000.00,
  "priceMonthly": 20000.00,
  "scheduleType": "ALWAYS",
  "amenities": {
    "covered": true,
    "security": true,
    "evCharging": false,
    "cctv": true
  },
  "photos": [
    "https://s3.amazonaws.com/bucket/photo1.jpg",
    "https://s3.amazonaws.com/bucket/photo2.jpg"
  ],
  "accessGuide": "Парковка находится во дворе, код от ворот 1234",
  "createdAt": "2024-01-20T14:30:00Z"
}
```

**Errors:**
- `404 Not Found` - парковка не найдена

---

### PATCH /spots/{id}/archive
Архивация парковочного места.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": 42,
  "isArchived": true,
  "message": "Парковка архивирована"
}
```

**Errors:**
- `403 Forbidden` - не владелец парковки
- `404 Not Found` - парковка не найдена

---

## Модуль Bookings

### POST /bookings
Создание бронирования.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "spotId": 42,
  "carId": 5,
  "rentType": "DAILY",
  "startAt": "2024-01-25T10:00:00",
  "endAt": "2024-01-26T10:00:00"
}
```

**Enum значения:**
- `rentType`: `HOURLY`, `DAILY`, `MONTHLY`

**Response (201 Created):**
```json
{
  "id": 100,
  "spotId": 42,
  "spot": {
    "address": "Москва, ул. Ленина, д. 1",
    "photos": ["https://..."]
  },
  "renterId": 2,
  "carId": 5,
  "car": {
    "model": "Toyota Camry",
    "licensePlate": "А123ВС777"
  },
  "rentType": "DAILY",
  "status": "WAITING_CONFIRMATION",
  "startAt": "2024-01-25T10:00:00",
  "endAt": "2024-01-26T10:00:00",
  "totalAmount": 1000.00,
  "createdAt": "2024-01-20T15:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - невалидные данные или парковка занята
- `404 Not Found` - парковка или автомобиль не найдены
- `409 Conflict` - парковка уже забронирована на это время

---

### GET /bookings/my-renting
Список моих аренд (я арендатор).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (int) - номер страницы (по умолчанию 0)
- `size` (int) - размер страницы (по умолчанию 20)
- `status` (string) - фильтр по статусу (необязательно)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 100,
      "spot": {
        "id": 42,
        "address": "Москва, ул. Ленина, д. 1"
      },
      "status": "WAITING_CONFIRMATION",
      "startAt": "2024-01-25T10:00:00",
      "endAt": "2024-01-26T10:00:00",
      "totalAmount": 1000.00
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

### GET /bookings/my-leasing
Список моих сдач (я владелец).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** Аналогично `/bookings/my-renting`

---

### POST /bookings/{id}/confirm
Подтверждение бронирования (только владелец парковки).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": 100,
  "status": "WAITING_START",
  "message": "Бронирование подтверждено"
}
```

**Errors:**
- `403 Forbidden` - не владелец парковки
- `409 Conflict` - неверный статус для подтверждения

---

### POST /bookings/{id}/start
Начало аренды (владелец или арендатор).

**Response (200 OK):**
```json
{
  "id": 100,
  "status": "ACTIVE",
  "message": "Аренда начата"
}
```

---

### POST /bookings/{id}/finish
Завершение аренды (владелец или арендатор).

**Response (200 OK):**
```json
{
  "id": 100,
  "status": "FINISHED",
  "message": "Аренда завершена"
}
```

---

### POST /bookings/{id}/cancel
Отмена бронирования (владелец или арендатор).

**Request (optional):**
```json
{
  "reason": "Передумал"
}
```

**Response (200 OK):**
```json
{
  "id": 100,
  "status": "CANCELED",
  "message": "Бронирование отменено"
}
```

---

## Модуль Chat

### GET /chats
Список чатов текущего пользователя.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "bookingId": 100,
    "companionName": "Иван Иванов",
    "lastMessage": {
      "text": "Когда можно приехать?",
      "createdAt": "2024-01-20T16:00:00Z"
    },
    "unreadCount": 2,
    "state": "ACTIVE"
  }
]
```

---

### GET /chats/{id}/messages
Получение сообщений чата.

**Query Parameters:**
- `page` (int) - номер страницы
- `size` (int) - размер страницы

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 501,
      "chatId": 1,
      "senderId": 2,
      "senderName": "Петр Петров",
      "type": "TEXT",
      "text": "Добрый день!",
      "createdAt": "2024-01-20T15:30:00Z"
    },
    {
      "id": 502,
      "chatId": 1,
      "senderId": 1,
      "senderName": "Иван Иванов",
      "type": "TEXT",
      "text": "Здравствуйте!",
      "createdAt": "2024-01-20T15:31:00Z"
    }
  ],
  "totalElements": 15
}
```

---

### POST /chats/{id}/messages
Отправка сообщения (также можно через WebSocket).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "text": "Когда можно приехать?"
}
```

**Response (201 Created):**
```json
{
  "id": 503,
  "chatId": 1,
  "senderId": 2,
  "senderName": "Петр Петров",
  "type": "TEXT",
  "text": "Когда можно приехать?",
  "createdAt": "2024-01-20T16:00:00Z"
}
```

---

## WebSocket (STOMP)

### Connection

**Endpoint:** `ws://localhost:8082/parkshare/ws`

**Протокол:** STOMP over SockJS

**Аутентификация:** JWT токен в заголовке CONNECT:
```
CONNECT
Authorization: Bearer <JWT_TOKEN>
...
```

### Подписка на чат

**Destination:**
```
/user/queue/chat.{chatId}
```

**Пример (JavaScript):**
```javascript
const socket = new SockJS('http://localhost:8082/parkshare/ws');
const stompClient = Stomp.over(socket);

stompClient.connect(
  { Authorization: `Bearer ${token}` },
  (frame) => {
    console.log('Connected:', frame);

    // Подписка на чат с ID 1
    stompClient.subscribe('/user/queue/chat.1', (message) => {
      const msg = JSON.parse(message.body);
      console.log('New message:', msg);
    });
  }
);
```

### Отправка сообщения

**Destination:**
```
/app/chat.{chatId}
```

**Payload:**
```json
{
  "text": "Привет!"
}
```

**Пример (JavaScript):**
```javascript
stompClient.send('/app/chat.1', {}, JSON.stringify({
  text: 'Привет!'
}));
```

### Получение сообщения

Сообщения приходят на `/user/queue/chat.{chatId}` в формате:
```json
{
  "id": 504,
  "chatId": 1,
  "senderId": 1,
  "senderName": "Иван Иванов",
  "type": "TEXT",
  "text": "Привет!",
  "createdAt": "2024-01-20T16:05:00Z"
}
```

---

## Модуль Cars

### POST /cars
Добавление автомобиля.

**Request:**
```json
{
  "model": "Toyota Camry",
  "licensePlate": "А123ВС777",
  "color": "Черный",
  "year": 2020
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "userId": 2,
  "model": "Toyota Camry",
  "licensePlate": "А123ВС777",
  "color": "Черный",
  "year": 2020,
  "createdAt": "2024-01-20T17:00:00Z"
}
```

---

### GET /cars
Список автомобилей пользователя.

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "model": "Toyota Camry",
    "licensePlate": "А123ВС777",
    "color": "Черный",
    "year": 2020
  }
]
```

---

### PUT /cars/{id}
Обновление автомобиля.

**Request:**
```json
{
  "model": "Toyota Camry V6",
  "licensePlate": "А123ВС777",
  "color": "Черный",
  "year": 2021
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "model": "Toyota Camry V6",
  "year": 2021
}
```

---

### DELETE /cars/{id}
Удаление автомобиля.

**Response (204 No Content)**

---

## Модуль Media

### POST /media/upload
Загрузка фотографии.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Request:**
```
Form data:
  file: [binary image data]
```

**Response (200 OK):**
```json
{
  "url": "https://parksharing-photos.s3.amazonaws.com/user_2/photo_1705762800000.jpg",
  "filename": "photo_1705762800000.jpg"
}
```

**Ограничения:**
- Максимальный размер: 10 MB
- Форматы: JPEG, PNG, WebP
- Минимальное разрешение: 640x480

**Errors:**
- `400 Bad Request` - невалидный формат или размер
- `413 Payload Too Large` - файл слишком большой

---

## Коды ошибок

| Код | Описание | Пример |
|-----|----------|--------|
| 400 | Bad Request | Невалидные данные запроса |
| 401 | Unauthorized | Отсутствует или невалидный JWT токен |
| 403 | Forbidden | Нет прав доступа к ресурсу |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт (например, парковка занята) |
| 413 | Payload Too Large | Слишком большой файл |
| 429 | Too Many Requests | Превышен лимит запросов |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

**Формат ошибки:**
```json
{
  "status": 404,
  "message": "Parking spot not found",
  "timestamp": "2024-01-20T18:00:00Z"
}
```

---

## Rate Limiting

- **SMS коды:** Максимум 3 запроса в час на номер
- **Загрузка файлов:** Максимум 10 файлов в минуту
- **API запросы:** Рекомендуется не более 100 запросов в минуту

---

## Pagination

Все эндпоинты с пагинацией используют query parameters:
- `page` (int) - номер страницы (0-based)
- `size` (int) - размер страницы
- `sort` (string) - поле сортировки (например, `createdAt,desc`)

**Формат ответа:**
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "last": false
}
```
