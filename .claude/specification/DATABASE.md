# Схема базы данных Parksharing

## Общая информация

- **СУБД:** PostgreSQL 16
- **Расширения:** PostGIS (для геолокации)
- **Миграции:** Flyway
- **ORM:** Hibernate + Spring Data JPA

## ER-диаграмма (упрощенная)

```
┌─────────────┐         ┌──────────────┐
│    roles    │◀───────┐│    users     │
└─────────────┘        │└──────────────┘
                       │       │
                       │       │ 1
                       │       ├──────────────┐
                       │       │              │
                       │       │ *            │ *
                       │ ┌─────▼────────┐ ┌──▼───────────┐
                       │ │  sms_codes   │ │     cars     │
                       │ └──────────────┘ └──────────────┘
                       │       │
                       │       │ 1
                       │       │
                       │ ┌─────▼──────────────┐
                       │ │  parking_spots     │
                       │ │  (location: Point) │
                       │ └────────────────────┘
                       │       │
                       │       │ 1
                       │       │
                       │ ┌─────▼─────────┐
                       └─│   bookings    │
                         └───────────────┘
                               │ 1
                               │
                         ┌─────▼───────┐
                         │    chats    │
                         └─────────────┘
                               │ 1
                               │
                         ┌─────▼──────────┐
                         │ chat_messages  │
                         └────────────────┘

┌──────────────────┐
│      files       │
└──────────────────┘

┌──────────────────────────┐
│ telegram_notifications   │
└──────────────────────────┘
```

## Таблицы

### users
Пользователи платформы.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID пользователя | PRIMARY KEY |
| telegram_id | BIGINT | Telegram user ID | UNIQUE |
| phone_number | VARCHAR(20) | Номер телефона | UNIQUE, NOT NULL |
| email | VARCHAR(255) | Email | |
| first_name | VARCHAR(100) | Имя | NOT NULL |
| last_name | VARCHAR(100) | Фамилия | |
| username | VARCHAR(100) | Username | |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | Дата обновления | NOT NULL, DEFAULT NOW() |

**Индексы:**
- `idx_users_telegram_id` на telegram_id
- `idx_users_phone_number` на phone_number

**Связи:**
- many-to-many с `roles` через таблицу `user_roles`

---

### roles
Роли пользователей.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID роли | PRIMARY KEY |
| name | VARCHAR(50) | Название роли | UNIQUE, NOT NULL |

**Значения:**
- `USER` - обычный пользователь
- `ADMIN` - администратор

---

### user_roles
Связь пользователей и ролей (many-to-many).

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| user_id | BIGINT | ID пользователя | FOREIGN KEY → users.id |
| role_id | BIGINT | ID роли | FOREIGN KEY → roles.id |

**Constraints:**
- PRIMARY KEY (user_id, role_id)

---

### sms_codes
Коды верификации номера телефона.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID кода | PRIMARY KEY |
| user_id | BIGINT | ID пользователя | FOREIGN KEY → users.id |
| phone_number | VARCHAR(20) | Номер телефона | NOT NULL |
| code | VARCHAR(10) | Код верификации | |
| check_id | VARCHAR(255) | ID проверки (SMS.ru) | |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |
| expires_at | TIMESTAMP | Дата истечения | NOT NULL |
| is_used | BOOLEAN | Использован ли | DEFAULT FALSE |
| attempts | INTEGER | Количество попыток | DEFAULT 0 |

**Индексы:**
- `idx_sms_codes_phone` на phone_number
- `idx_sms_codes_check_id` на check_id

---

### cars
Автомобили пользователей.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID автомобиля | PRIMARY KEY |
| user_id | BIGINT | ID владельца | FOREIGN KEY → users.id, NOT NULL |
| model | VARCHAR(100) | Модель | NOT NULL |
| license_plate | VARCHAR(20) | Гос. номер | NOT NULL |
| color | VARCHAR(50) | Цвет | |
| year | INTEGER | Год выпуска | |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | Дата обновления | NOT NULL, DEFAULT NOW() |

**Индексы:**
- `idx_cars_user_id` на user_id

---

### parking_spots
Парковочные места.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID парковки | PRIMARY KEY |
| owner_id | BIGINT | ID владельца | FOREIGN KEY → users.id, NOT NULL |
| address | TEXT | Адрес | NOT NULL |
| location | GEOMETRY(Point, 4326) | Координаты (PostGIS) | NOT NULL |
| description | TEXT | Описание | |
| vehicle_type | VARCHAR(50) | Тип транспорта | NOT NULL |
| price_hourly | DECIMAL(10,2) | Цена за час | |
| price_daily | DECIMAL(10,2) | Цена за сутки | |
| price_monthly | DECIMAL(10,2) | Цена за месяц | |
| schedule_type | VARCHAR(50) | Тип расписания | NOT NULL |
| available_dates | DATE[] | Доступные даты | |
| available_time_from | TIME | Время начала (для HOURLY) | |
| available_time_to | TIME | Время окончания (для HOURLY) | |
| amenities | JSONB | Удобства | |
| photos | TEXT[] | Фото (S3 URLs) | |
| access_guide | TEXT | Инструкция по доступу | |
| is_archived | BOOLEAN | Архивирована ли | DEFAULT FALSE |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | Дата обновления | NOT NULL, DEFAULT NOW() |

**Типы:**
- `vehicle_type`: CAR, MOTORCYCLE, BICYCLE
- `schedule_type`: FIXED_DATES, DAILY, ALWAYS

**Amenities (JSONB):**
```json
{
  "covered": true,
  "security": false,
  "ev_charging": true,
  "cctv": true
}
```

**Индексы:**
- `idx_parking_spots_owner_id` на owner_id
- `idx_parking_spots_location` (GIST) на location - для геопространственных запросов
- `idx_parking_spots_vehicle_type` на vehicle_type
- `idx_parking_spots_archived` на is_archived

**Важно:** Индекс GIST на location критичен для производительности геопространственных запросов:
```sql
CREATE INDEX idx_parking_spots_location
ON parking_spots USING GIST (location);
```

---

### bookings
Бронирования парковок.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID бронирования | PRIMARY KEY |
| spot_id | BIGINT | ID парковки | FOREIGN KEY → parking_spots.id, NOT NULL |
| renter_id | BIGINT | ID арендатора | FOREIGN KEY → users.id, NOT NULL |
| car_id | BIGINT | ID автомобиля | FOREIGN KEY → cars.id |
| rent_type | VARCHAR(50) | Тип аренды | NOT NULL |
| status | VARCHAR(50) | Статус | NOT NULL |
| start_at | TIMESTAMP | Начало аренды | NOT NULL |
| end_at | TIMESTAMP | Конец аренды | NOT NULL |
| total_amount | DECIMAL(10,2) | Сумма | NOT NULL |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | Дата обновления | NOT NULL, DEFAULT NOW() |

**Типы:**
- `rent_type`: HOURLY, DAILY, MONTHLY
- `status`: WAITING_CONFIRMATION, WAITING_START, ACTIVE, FINISHED, CANCELED

**Индексы:**
- `idx_bookings_spot_id` на spot_id
- `idx_bookings_renter_id` на renter_id
- `idx_bookings_status` на status
- `idx_bookings_start_at` на start_at
- `idx_bookings_active` на (spot_id, status) WHERE status IN ('WAITING_START', 'ACTIVE')

**Constraint:**
- Проверка, что end_at > start_at

---

### chats
Чаты между пользователями (владельцем и арендатором).

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID чата | PRIMARY KEY |
| booking_id | BIGINT | ID бронирования | FOREIGN KEY → bookings.id, UNIQUE, NOT NULL |
| owner_id | BIGINT | ID владельца | FOREIGN KEY → users.id, NOT NULL |
| renter_id | BIGINT | ID арендатора | FOREIGN KEY → users.id, NOT NULL |
| state | VARCHAR(50) | Состояние чата | NOT NULL |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |

**Типы:**
- `state`: ACTIVE, ARCHIVED, CLOSED

**Индексы:**
- `idx_chats_booking_id` на booking_id
- `idx_chats_owner_id` на owner_id
- `idx_chats_renter_id` на renter_id

**Constraint:**
- UNIQUE на booking_id (один чат на бронирование)

---

### chat_messages
Сообщения в чатах.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID сообщения | PRIMARY KEY |
| chat_id | BIGINT | ID чата | FOREIGN KEY → chats.id, NOT NULL |
| sender_user_id | BIGINT | ID отправителя | FOREIGN KEY → users.id, NOT NULL |
| type | VARCHAR(50) | Тип сообщения | NOT NULL |
| text | TEXT | Текст сообщения | |
| created_at | TIMESTAMP | Дата отправки | NOT NULL, DEFAULT NOW() |

**Типы:**
- `type`: TEXT, SYSTEM, IMAGE, etc.

**Индексы:**
- `idx_chat_messages_chat_id` на chat_id
- `idx_chat_messages_created_at` на created_at

**Constraint:**
- CHECK (text IS NOT NULL OR type != 'TEXT')

---

### files
Метаданные загруженных файлов.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID файла | PRIMARY KEY |
| filename | VARCHAR(255) | Имя файла | NOT NULL |
| s3_url | TEXT | URL в S3 | NOT NULL |
| user_id | BIGINT | ID пользователя | FOREIGN KEY → users.id |
| created_at | TIMESTAMP | Дата загрузки | NOT NULL, DEFAULT NOW() |

**Индексы:**
- `idx_files_user_id` на user_id
- `idx_files_created_at` на created_at

**Примечание:** Используется для очистки неиспользуемых файлов через `FileCleanupScheduler`.

---

### telegram_notifications
История уведомлений в Telegram.

| Колонка | Тип | Описание | Constraints |
|---------|-----|----------|-------------|
| id | BIGSERIAL | ID уведомления | PRIMARY KEY |
| booking_id | BIGINT | ID бронирования | FOREIGN KEY → bookings.id |
| user_id | BIGINT | ID получателя | FOREIGN KEY → users.id, NOT NULL |
| notification_type | VARCHAR(100) | Тип уведомления | NOT NULL |
| status | VARCHAR(50) | Статус отправки | NOT NULL |
| created_at | TIMESTAMP | Дата создания | NOT NULL, DEFAULT NOW() |

**Типы уведомлений:**
- `NEW_BOOKING` - новое бронирование для владельца
- `BOOKING_CONFIRMED` - подтверждение для арендатора
- `BOOKING_CANCELED` - отмена бронирования
- `BOOKING_STARTED` - начало аренды
- `BOOKING_FINISHED` - завершение аренды

**Статусы:**
- `SENT` - успешно отправлено
- `FAILED` - ошибка отправки
- `PENDING` - в очереди

**Индексы:**
- `idx_telegram_notifications_user_id` на user_id
- `idx_telegram_notifications_booking_id` на booking_id

---

## Геопространственные запросы (PostGIS)

### Поиск парковок в радиусе

```sql
SELECT *
FROM parking_spots
WHERE ST_DWithin(
    location::geography,
    ST_MakePoint(:longitude, :latitude)::geography,
    :radiusInMeters
)
AND is_archived = false;
```

**Пример:** Найти парковки в радиусе 5 км от точки (37.6156, 55.7522):
```sql
SELECT id, address, ST_Distance(
    location::geography,
    ST_MakePoint(37.6156, 55.7522)::geography
) AS distance_meters
FROM parking_spots
WHERE ST_DWithin(
    location::geography,
    ST_MakePoint(37.6156, 55.7522)::geography,
    5000
)
ORDER BY distance_meters;
```

### Поиск в ограничивающем прямоугольнике (Bounding Box)

```sql
SELECT *
FROM parking_spots
WHERE ST_Within(
    location,
    ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
)
AND is_archived = false;
```

### Вычисление расстояния между точками

```sql
SELECT
    id,
    address,
    ST_Distance(
        location::geography,
        ST_MakePoint(:userLon, :userLat)::geography
    ) / 1000 AS distance_km
FROM parking_spots
ORDER BY distance_km;
```

---

## Миграции Flyway

Миграции находятся в `src/main/resources/db/migration/`:

| Файл | Описание |
|------|----------|
| V1__init_auth_schema.sql | Создание users, roles, user_roles, sms_codes |
| V2__add_cars.sql | Таблица cars |
| V3__add_parking_spots.sql | Таблица parking_spots с PostGIS |
| V4__add_bookings.sql | Таблица bookings |
| V5__add_chats.sql | Таблицы chats и chat_messages |
| V6__add_files.sql | Таблица files |
| V7__add_telegram_notifications.sql | Таблица telegram_notifications |
| V8__add_indexes.sql | Дополнительные индексы |
| V9__add_constraints.sql | Дополнительные constraints |
| V10__update_booking_statuses.sql | Обновление enum для статусов |
| V11__latest_changes.sql | Последние изменения |

**Важно:** Миграции выполняются автоматически при запуске приложения через Flyway.

---

## Типичные запросы

### 1. Найти все активные бронирования парковки

```sql
SELECT b.*, u.first_name, u.phone_number, c.model, c.license_plate
FROM bookings b
JOIN users u ON b.renter_id = u.id
LEFT JOIN cars c ON b.car_id = c.id
WHERE b.spot_id = :spotId
  AND b.status IN ('WAITING_START', 'ACTIVE')
ORDER BY b.start_at;
```

### 2. Получить чаты пользователя

```sql
SELECT c.*,
       CASE
         WHEN c.owner_id = :userId THEN r.first_name
         ELSE o.first_name
       END AS companion_name
FROM chats c
JOIN users o ON c.owner_id = o.id
JOIN users r ON c.renter_id = r.id
WHERE c.owner_id = :userId OR c.renter_id = :userId
ORDER BY c.created_at DESC;
```

### 3. Найти парковки с доступностью в определенные даты

```sql
SELECT *
FROM parking_spots
WHERE is_archived = false
  AND (
    schedule_type = 'ALWAYS'
    OR (schedule_type = 'FIXED_DATES' AND :targetDate = ANY(available_dates))
  )
  AND NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.spot_id = parking_spots.id
      AND bookings.status IN ('WAITING_START', 'ACTIVE')
      AND bookings.start_at <= :endDate
      AND bookings.end_at >= :startDate
  );
```

### 4. Статистика по парковкам владельца

```sql
SELECT
    ps.id,
    ps.address,
    COUNT(b.id) AS total_bookings,
    SUM(CASE WHEN b.status = 'FINISHED' THEN b.total_amount ELSE 0 END) AS total_revenue
FROM parking_spots ps
LEFT JOIN bookings b ON ps.id = b.spot_id
WHERE ps.owner_id = :ownerId
GROUP BY ps.id, ps.address;
```

---

## Производительность и оптимизация

### Индексы

1. **GIST индексы** на геолокации (критично для производительности):
   ```sql
   CREATE INDEX idx_parking_spots_location ON parking_spots USING GIST (location);
   ```

2. **B-tree индексы** на внешних ключах и часто используемых колонках:
   - user_id, spot_id, renter_id в bookings
   - owner_id в parking_spots
   - chat_id в chat_messages

3. **Частичные индексы** для активных бронирований:
   ```sql
   CREATE INDEX idx_bookings_active
   ON bookings (spot_id, status)
   WHERE status IN ('WAITING_START', 'ACTIVE');
   ```

### Рекомендации

1. **Используйте fetch joins** в Hibernate для предотвращения N+1 проблем:
   ```java
   @Query("SELECT b FROM Booking b JOIN FETCH b.spot JOIN FETCH b.renter WHERE b.id = :id")
   Optional<Booking> findByIdWithDetails(@Param("id") Long id);
   ```

2. **Ограничивайте результаты** при поиске парковок (Pageable).

3. **Используйте connection pooling** (HikariCP включен по умолчанию в Spring Boot).

4. **Мониторьте медленные запросы** через pg_stat_statements.

---

## Бэкапы и восстановление

### Создание бэкапа

```bash
pg_dump -h localhost -U parksharing -d parksharing -F c -b -v -f parksharing_backup.dump
```

### Восстановление

```bash
pg_restore -h localhost -U parksharing -d parksharing -v parksharing_backup.dump
```

**Важно:** Убедитесь, что расширение PostGIS установлено перед восстановлением:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Docker Compose настройка

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: parksharing
      POSTGRES_USER: parksharing
      POSTGRES_PASSWORD: parksharing
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

Расширение PostGIS включается автоматически при первом запуске через образ `postgis/postgis`.
