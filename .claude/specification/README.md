# Parksharing - Платформа для шеринга парковочных мест

## Описание проекта

**Parksharing** — это бэкенд-сервис платформы для аренды парковочных мест в стиле Airbnb. Проект позволяет владельцам парковочных мест сдавать их в аренду, а арендаторам - находить и бронировать парковки рядом с нужным местом.

**Статус:** MVP (Minimum Viable Product)

## Основные возможности

### Для владельцев парковок
- Регистрация и аутентификация через Telegram Mini App
- Верификация номера телефона (Call Check от SMS.ru)
- Создание объявлений о сдаче парковки с:
  - Геолокацией (PostGIS)
  - Фотографиями (хранение в S3/MinIO)
  - Гибкими ценами (почасово, посуточно, помесячно)
  - Расписанием доступности
- Управление бронированиями (подтверждение, отклонение)
- Встроенный чат с арендаторами
- Push-уведомления в Telegram
- Архивация неактуальных парковок

### Для арендаторов
- Поиск парковок на карте с фильтрами:
  - Радиус поиска
  - Тип аренды (HOURLY/DAILY/MONTHLY)
  - Время доступности
  - Удобства (навес, охрана, зарядка для электромобилей, видеонаблюдение)
- Просмотр детальной информации о парковке
- Бронирование парковки
- Управление своими автомобилями
- Чат с владельцем парковки (real-time через WebSocket)
- История бронирований

## Технологический стек

### Backend
- **Язык:** Java 25
- **Фреймворк:** Spring Boot 3.5.7
- **Сборка:** Apache Maven 3.9
- **ORM:** Hibernate + Spring Data JPA
- **Безопасность:** Spring Security + JWT (JJWT 0.12.5)
- **WebSocket:** Spring WebSocket + STOMP + SockJS

### База данных
- **СУБД:** PostgreSQL 16
- **Геолокация:** PostGIS (расширение для работы с геоданными)
- **Миграции:** Flyway 11.4.0

### Внешние сервисы
- **Хранилище файлов:** AWS S3 / MinIO (локальное S3-совместимое хранилище)
- **SMS верификация:** SMS.ru API (OpenFeign клиент)
- **Уведомления:** Telegram Bot API

### Тестирование
- JUnit 5
- Spring Boot Test
- Testcontainers (PostgreSQL)
- WireMock (мокирование SMS.ru)

### Документация
- Swagger/OpenAPI 3.0 (springdoc-openapi 2.8.13)

### Контейнеризация
- Docker + Docker Compose
- Multi-stage builds (Maven + Eclipse Temurin JRE 25)

## Структура проекта

```
src/main/java/com/parksharing/
├── auth/              # Модуль аутентификации и пользователей
├── booking/           # Модуль бронирований
├── spot/              # Модуль парковочных мест
├── chat/              # Модуль чата
├── car/               # Модуль автомобилей пользователя
├── media/             # Модуль работы с файлами
├── config/            # Конфигурация Spring
├── security/          # JWT и Spring Security
├── exception/         # Обработка ошибок
└── service/           # Базовые сервисы
```

## Быстрый старт

### Требования
- Java 25 (JDK)
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL 16 (или через Docker Compose)

### Локальный запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd park-share
```

2. Запустите зависимости (PostgreSQL + MinIO):
```bash
docker-compose up -d
```

3. Настройте переменные окружения в `application.yaml` или через environment variables:
```yaml
TELEGRAM_BOT_TOKEN=<ваш_токен>
SMS_RU_API_ID=<ваш_api_id>
JWT_SECRET=<ваш_секретный_ключ>
```

4. Соберите и запустите приложение:
```bash
mvn clean install
mvn spring-boot:run
```

5. Приложение будет доступно по адресу:
- API: `http://localhost:8082/parkshare/api/v1`
- Swagger UI: `http://localhost:8082/parkshare/swagger-ui.html`
- WebSocket: `ws://localhost:8082/parkshare/ws`

### Запуск через Docker

```bash
docker build -t parksharing .
docker-compose up
```

## API Endpoints

### Аутентификация
- `POST /api/v1/auth/login` - Вход через Telegram Mini App
- `POST /api/v1/auth/request-code` - Запрос кода верификации
- `POST /api/v1/auth/verify-code` - Проверка кода
- `GET /api/v1/auth/me` - Получение информации о текущем пользователе

### Парковки
- `POST /api/v1/spots` - Создание парковки
- `GET /api/v1/spots/search` - Поиск парковок
- `GET /api/v1/spots/{id}` - Детали парковки
- `PATCH /api/v1/spots/{id}/archive` - Архивация парковки

### Бронирования
- `POST /api/v1/bookings` - Создание бронирования
- `GET /api/v1/bookings/my-renting` - Мои аренды
- `GET /api/v1/bookings/my-leasing` - Мои сдачи
- `POST /api/v1/bookings/{id}/confirm` - Подтверждение бронирования
- `POST /api/v1/bookings/{id}/start` - Начало аренды
- `POST /api/v1/bookings/{id}/finish` - Завершение аренды
- `POST /api/v1/bookings/{id}/cancel` - Отмена бронирования

### Чат
- `GET /api/v1/chats` - Список чатов
- `GET /api/v1/chats/{id}/messages` - Сообщения чата
- `POST /api/v1/chats/{id}/messages` - Отправка сообщения (также через WebSocket)

### WebSocket (STOMP)
- Endpoint: `/ws`
- Подписка на чат: `/user/queue/chat.{chatId}`
- Отправка сообщения: `/app/chat.{chatId}`

### Автомобили
- `POST /api/v1/cars` - Добавление автомобиля
- `GET /api/v1/cars` - Список автомобилей
- `PUT /api/v1/cars/{id}` - Обновление автомобиля
- `DELETE /api/v1/cars/{id}` - Удаление автомобиля

### Медиа
- `POST /api/v1/media/upload` - Загрузка фотографии

## База данных

### Основные таблицы
- `users` - Пользователи
- `roles` - Роли пользователей
- `sms_codes` - Коды верификации
- `cars` - Автомобили пользователей
- `parking_spots` - Парковочные места
- `bookings` - Бронирования
- `chats` - Чаты между пользователями
- `chat_messages` - Сообщения в чатах
- `files` - Метаданные загруженных файлов
- `telegram_notifications` - История уведомлений

## Статусы бронирования

```
WAITING_CONFIRMATION → Ожидание подтверждения владельцем
         ↓
   WAITING_START → Подтверждено, ожидание начала
         ↓
      ACTIVE → Активная аренда
         ↓
     FINISHED → Завершено

    CANCELED → Отменено (на любом этапе)
```

## Безопасность

- JWT токены для аутентификации (Stateless)
- Валидация подписей Telegram InitData
- CORS конфигурация
- Spring Security с method-level authorization
- Проверка владельца ресурсов

## Документация

Подробная документация доступна в папке `claude docs/`:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Архитектура проекта
- [API.md](./API.md) - Детальное описание API
- [DATABASE.md](./DATABASE.md) - Схема базы данных
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Инструкции по развертыванию
- [CONFIGURATION.md](./CONFIGURATION.md) - Конфигурация проекта

## Версии

**Текущая версия:** 0.0.1-SNAPSHOT

## Лицензия

[Укажите вашу лицензию]

## Контакты

[Укажите контактную информацию]
