# Архитектура проекта Parksharing

## Общая архитектура

Проект построен на основе **многослойной (layered) архитектуры** с элементами **Domain-Driven Design (DDD)**.

### Архитектурная диаграмма

```
┌──────────────────────────────────────────────────────────────┐
│              Telegram Mini App (Frontend)                     │
│              React / Vue / Vanilla JS                         │
└───────────────────────┬──────────────────────────────────────┘
                        │ JWT Token
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              API Gateway Layer                                │
│   Spring MVC Controllers + WebSocket (STOMP/SockJS)          │
│   - JWT Authentication Filter                                │
│   - CORS Configuration                                       │
│   - Request Validation                                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              Controller Layer                                 │
│   REST Controllers:                                          │
│   - AuthController                                           │
│   - SpotController                                           │
│   - BookingController                                        │
│   - ChatController + ChatWebSocketController                 │
│   - CarController                                            │
│   - MediaController                                          │
│                                                              │
│   Responsibilities:                                          │
│   - HTTP request/response handling                          │
│   - Input validation (@Valid)                               │
│   - Response formatting                                     │
│   - Exception translation                                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              Service Layer                                    │
│   Business Logic Services:                                   │
│   - AuthService / UserService                                │
│   - SpotService / SpotSearchService                          │
│   - BookingService                                           │
│   - ChatService                                              │
│   - CarService                                               │
│   - ImageService / FileCleanupScheduler                      │
│   - TelegramSendService                                      │
│                                                              │
│   Responsibilities:                                          │
│   - Business rules enforcement                              │
│   - Transaction management (@Transactional)                 │
│   - Orchestration between repositories                      │
│   - Integration with external services                      │
│   - Security checks (ownership validation)                  │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              Repository Layer                                 │
│   Spring Data JPA Repositories:                              │
│   - UserRepository                                           │
│   - ParkingSpotRepository                                    │
│   - BookingRepository                                        │
│   - ChatRepository / ChatMessageRepository                   │
│   - CarRepository                                            │
│   - FileRepository                                           │
│                                                              │
│   + Specifications (for complex queries)                     │
│   + Custom query methods                                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              Entity Layer (Domain Model)                      │
│   JPA Entities:                                              │
│   - User, Role, SmsCode                                      │
│   - Car                                                      │
│   - ParkingSpot                                              │
│   - Booking                                                  │
│   - Chat, ChatMessage                                        │
│   - FileEntity                                               │
│   - TelegramNotification                                     │
│                                                              │
│   Enums:                                                     │
│   - BookingStatus, RentType                                 │
│   - VehicleType, ScheduleType                               │
│   - ChatState, ChatMessageType                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              Database Layer                                   │
│   PostgreSQL 16 + PostGIS                                    │
│   - Relational data storage                                 │
│   - Geospatial data (Point, GIST indexes)                   │
│   - Full-text search capabilities                           │
│   - Flyway migrations for schema versioning                 │
└──────────────────────────────────────────────────────────────┘
```

## Горизонтальные слои (Cross-Cutting Concerns)

### 1. Security Layer

```
┌──────────────────────────────────────────────────────────────┐
│                     Security Layer                            │
│                                                              │
│  JwtAuthenticationFilter ──▶ JwtTokenProvider                │
│         │                           │                        │
│         ▼                           ▼                        │
│  SecurityFilterChain         Token Validation                │
│         │                                                    │
│         ▼                                                    │
│  SecurityContextHolder (ThreadLocal)                         │
│                                                              │
│  SecurityConfig:                                             │
│  - Public endpoints: /auth/*, /health, /swagger-ui          │
│  - Protected endpoints: /api/v1/**                          │
│  - WebSocket security: JWT in STOMP CONNECT                 │
└──────────────────────────────────────────────────────────────┘
```

**Компоненты:**
- `JwtTokenProvider` - создание и валидация JWT токенов
- `JwtAuthenticationFilter` - фильтр для HTTP запросов
- `SecurityConfig` - конфигурация Spring Security
- `SecurityUtils` - утилиты для получения текущего пользователя
- `TelegramInitDataValidator` - валидация подписей Telegram

### 2. Exception Handling Layer

```
GlobalExceptionHandler (@ControllerAdvice)
    │
    ├─▶ NotFoundException → 404
    ├─▶ ConflictException → 409
    ├─▶ BadRequestException → 400
    ├─▶ UnauthorizedException → 401
    ├─▶ ForbiddenException → 403
    ├─▶ InvalidTelegramDataException → 400
    └─▶ Generic Exception → 500
```

### 3. Configuration Layer

**Основные конфигурационные классы:**
- `SecurityConfig` - Spring Security
- `WebSocketConfig` - STOMP endpoints, JWT interceptor
- `CorsConfig` - CORS policy
- `S3Config` - AWS S3/MinIO клиент
- `SwaggerConfig` - OpenAPI документация
- `JpaAuditingConfig` - автоматические timestamps

## Модульная архитектура

### Модуль Authentication & User Management

```
auth/
├── controller/
│   └── AuthController
│       ├── POST /auth/login (Telegram InitData)
│       ├── POST /auth/request-code (SMS)
│       ├── POST /auth/verify-code
│       └── GET /auth/me
│
├── service/
│   ├── AuthService
│   │   ├── authenticateWithTelegram()
│   │   ├── requestSmsCode()
│   │   └── verifySmsCode()
│   │
│   ├── UserService
│   │   ├── updateProfile()
│   │   └── getUserById()
│   │
│   ├── SmsCodeService
│   │   ├── createCode()
│   │   └── validateCode()
│   │
│   └── TelegramInitDataValidator
│       └── validate() - проверка HMAC подписи
│
├── client/
│   └── SmsRuClient (OpenFeign)
│       ├── callCheck()
│       └── getCallStatus()
│
└── entity/
    ├── User (many-to-many with Role)
    ├── Role
    └── SmsCode
```

### Модуль Parking Spots

```
spot/
├── controller/
│   └── SpotController
│       ├── POST /spots
│       ├── GET /spots/search
│       ├── GET /spots/{id}
│       └── PATCH /spots/{id}/archive
│
├── service/
│   ├── SpotService
│   │   ├── createSpot()
│   │   ├── getSpotById()
│   │   ├── getMySpots()
│   │   └── archiveSpot()
│   │
│   └── SpotSearchService
│       ├── searchSpots() - основной поиск
│       ├── buildSpecification() - динамические фильтры
│       └── checkAvailability() - проверка занятости
│
├── repository/
│   ├── ParkingSpotRepository
│   └── ParkingSpotSpecifications
│       ├── byRadius() - поиск в радиусе (PostGIS)
│       ├── byBoundingBox()
│       ├── byVehicleType()
│       ├── byPriceRange()
│       └── byAmenities()
│
└── entity/
    └── ParkingSpot
        ├── location: Point (PostGIS)
        ├── scheduleType: ScheduleType
        ├── availableDates: List<LocalDate>
        ├── photos: List<String> (S3 URLs)
        └── amenities: Map<String, Object>
```

**Геолокационные запросы (PostGIS):**
```java
// Поиск в радиусе 5 км
@Query("SELECT p FROM ParkingSpot p WHERE " +
       "distance(p.location, :point) <= :radius")
List<ParkingSpot> findByRadius(Point point, double radius);

// Поиск в bounding box
@Query("SELECT p FROM ParkingSpot p WHERE " +
       "ST_Within(p.location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))")
List<ParkingSpot> findInBoundingBox(...);
```

### Модуль Bookings

```
booking/
├── controller/
│   └── BookingController
│       ├── POST /bookings
│       ├── GET /bookings/my-renting
│       ├── GET /bookings/my-leasing
│       ├── POST /bookings/{id}/confirm
│       ├── POST /bookings/{id}/start
│       ├── POST /bookings/{id}/finish
│       └── POST /bookings/{id}/cancel
│
├── service/
│   ├── BookingService
│   │   ├── createBooking() → WAITING_CONFIRMATION
│   │   ├── confirmBooking() → WAITING_START
│   │   ├── startBooking() → ACTIVE
│   │   ├── finishBooking() → FINISHED
│   │   └── cancelBooking() → CANCELED
│   │
│   ├── TelegramSendService
│   │   ├── notifyOwnerNewBooking()
│   │   ├── notifyRenterBookingConfirmed()
│   │   └── notifyRenterBookingCanceled()
│   │
│   └── TelegramNotificationCrudService
│       └── saveNotification() - история
│
└── entity/
    ├── Booking
    │   ├── status: BookingStatus
    │   ├── rentType: RentType (HOURLY/DAILY/MONTHLY)
    │   ├── startAt, endAt: LocalDateTime
    │   └── totalAmount: BigDecimal
    │
    └── TelegramNotification
```

**State Machine для бронирований:**
```
       create()           confirm()           start()           finish()
NULL ────────▶ WAITING_CONFIRMATION ────────▶ WAITING_START ────────▶ ACTIVE ────────▶ FINISHED
                     │                             │                    │
                     │ cancel()                    │ cancel()           │ cancel()
                     └─────────────────────────────┴────────────────────┴──────▶ CANCELED
```

### Модуль Chat (Real-time)

```
chat/
├── controller/
│   ├── ChatController (REST)
│   │   ├── GET /chats
│   │   ├── GET /chats/{id}/messages
│   │   └── POST /chats/{id}/messages
│   │
│   └── ChatWebSocketController (STOMP)
│       └── @MessageMapping("/chat.{chatId}")
│           └── sendMessage() → /user/queue/chat.{chatId}
│
├── service/
│   └── ChatService
│       ├── createChat() - при создании бронирования
│       ├── sendMessage()
│       └── getMessages()
│
└── entity/
    ├── Chat
    │   ├── booking: Booking
    │   ├── owner: User
    │   ├── renter: User
    │   └── state: ChatState
    │
    └── ChatMessage
        ├── chat: Chat
        ├── senderUser: User
        ├── type: ChatMessageType
        └── text: String
```

**WebSocket архитектура:**
```
Client                          Server
  │                               │
  │ CONNECT (JWT in header)       │
  ├──────────────────────────────▶│ JwtChannelInterceptor
  │                               │   ↓ validate token
  │ CONNECTED                     │   ↓ set user principal
  │◀────────────────────────────────│
  │                               │
  │ SUBSCRIBE /user/queue/chat.1  │
  ├──────────────────────────────▶│
  │                               │
  │ SEND /app/chat.1 {msg}        │
  ├──────────────────────────────▶│ ChatWebSocketController
  │                               │   ↓ process message
  │                               │   ↓ save to DB
  │                               │   ↓ broadcast
  │ MESSAGE (broadcast to chat)   │
  │◀────────────────────────────────│ /user/queue/chat.1
```

### Модуль Media

```
media/
├── controller/
│   └── MediaController
│       └── POST /media/upload
│
├── service/
│   ├── ImageService
│   │   ├── uploadImage() → S3
│   │   ├── deleteImage()
│   │   └── validateImage()
│   │
│   └── FileCleanupScheduler
│       └── @Scheduled cleanup unused files
│
└── entity/
    └── FileEntity
        ├── filename
        ├── s3Url
        ├── userId
        └── createdAt
```

**S3 Integration:**
```
Client → MediaController → ImageService → AWS S3 SDK → MinIO
                                │
                                └─▶ FileRepository → PostgreSQL (metadata)
```

## Интеграции с внешними системами

### 1. Telegram Bot API

```java
TelegramSendService
    │
    ├─▶ POST https://api.telegram.org/bot{token}/sendMessage
    │   Payload: { chat_id, text, parse_mode }
    │
    └─▶ TelegramNotificationCrudService
        └─▶ Save notification history to DB
```

### 2. SMS.ru API (OpenFeign)

```java
@FeignClient(name = "sms-ru", url = "${sms.ru.base-url}")
interface SmsRuClient {
    @PostMapping("/sms/send")
    SmsRuResponse sendSms(...);

    @GetMapping("/call/check")
    SmsRuCallCheckResponse callCheck(...);

    @PostMapping("/call/status")
    SmsRuStatusResponse getStatus(...);
}
```

### 3. AWS S3 / MinIO

```java
S3Client s3Client = S3Client.builder()
    .endpointOverride(URI.create(s3Endpoint))
    .region(Region.of(s3Region))
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create(accessKey, secretKey)))
    .build();

// Upload
PutObjectRequest putRequest = PutObjectRequest.builder()
    .bucket(bucketName)
    .key(filename)
    .contentType("image/jpeg")
    .build();

s3Client.putObject(putRequest, RequestBody.fromFile(file));
```

## Паттерны проектирования

### 1. Repository Pattern
Spring Data JPA репозитории абстрагируют доступ к данным.

### 2. Service Layer Pattern
Сервисы инкапсулируют бизнес-логику и транзакции.

### 3. DTO Pattern
Разделение сущностей БД и объектов API:
- `Request` - входящие данные от клиента
- `Response` - исходящие данные клиенту
- `Entity` - сущности JPA

### 4. Specification Pattern
Динамические запросы через JPA Criteria API (ParkingSpotSpecifications).

### 5. State Pattern
State machine для статусов бронирования.

### 6. Strategy Pattern
Разные стратегии поиска парковок (радиус, bounding box, фильтры).

### 7. Template Method Pattern
`CrudService` как базовый интерфейс для CRUD операций.

## Масштабирование и производительность

### Оптимизации базы данных
- **GIST индексы** на геолокации для быстрого поиска
- **B-tree индексы** на внешних ключах
- **Частичные индексы** на активных бронированиях
- **Fetch joins** для избежания N+1 проблем

### Кэширование (потенциально)
- Spring Cache для списков парковок
- Redis для сессий (если нужно)

### Асинхронность
- Отправка Telegram уведомлений через `@Async`
- Cleanup файлов через `@Scheduled`

## Безопасность

### Аутентификация
1. **Telegram Mini Apps:**
   - Валидация HMAC-SHA256 подписи InitData
   - Проверка свежести (auth_date < 24 часа)

2. **JWT токены:**
   - HS256 алгоритм
   - Срок жизни: 30 дней
   - Claims: userId, username, roles

### Авторизация
- Spring Security method-level: `@PreAuthorize`
- Проверка владельца ресурсов в сервисах
- CORS для разрешенных origins

### Валидация
- `@Valid` на контроллерах
- Jakarta Validation аннотации (@NotNull, @Size, etc.)
- Кастомная валидация в сервисах

## Обработка ошибок

```
Exception → GlobalExceptionHandler → ErrorResponse
                                         │
                                         ├─▶ status: HTTP код
                                         ├─▶ message: описание
                                         └─▶ timestamp
```

**Стандартные исключения:**
- `NotFoundException` (404) - ресурс не найден
- `ConflictException` (409) - конфликт (уже забронировано)
- `BadRequestException` (400) - невалидные данные
- `UnauthorizedException` (401) - не авторизован
- `ForbiddenException` (403) - нет прав доступа

## Тестирование

### Integration Tests
```
AbstractIntegrationTest
    │
    ├─▶ @Testcontainers (PostgreSQL)
    ├─▶ @SpringBootTest
    └─▶ WireMock для SMS.ru
```

### Test Coverage
- AuthControllerTest
- BookingServiceTest
- SpotSearchServiceTest
- ChatWebSocketTest
- ImageServiceTest
- и другие

## Миграции базы данных

Flyway миграции в `src/main/resources/db/migration/`:
- `V1__init_auth_schema.sql` - пользователи, роли
- `V2__add_cars.sql` - автомобили
- `V3__add_parking_spots.sql` - парковки
- `V4__add_bookings.sql` - бронирования
- `V5__add_chats.sql` - чаты
- ...
- `V11__latest_changes.sql` - последние изменения

## Мониторинг и логирование

### Endpoints для мониторинга
- `/health` - health check
- `/actuator/*` - Spring Boot Actuator (если включен)

### Логирование
- SLF4J + Logback
- Логи ошибок с stack trace
- Логи запросов к внешним API
