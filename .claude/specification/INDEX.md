# Документация Parksharing

Добро пожаловать в документацию проекта **Parksharing** - платформы для шеринга парковочных мест.

## Быстрая навигация

### Для начинающих
- **[Быстрый старт](./GETTING_STARTED.md)** - Запуск проекта за 10 минут
- **[README](./README.md)** - Общая информация о проекте

### Разработка
- **[Архитектура](./ARCHITECTURE.md)** - Детальное описание архитектуры системы
- **[API Документация](./API.md)** - Все REST и WebSocket endpoints
- **[База данных](./DATABASE.md)** - Схема БД, миграции, PostGIS запросы
- **[Конфигурация](./CONFIGURATION.md)** - Все настройки и параметры
- **[Стандарты кода](./CODING_STANDARDS.md)** - Java 25 best practices, modern features, senior level
- **[Claude Code Rules](../.claude/CLAUDE.md)** - Правила для AI-агента: Java 25, var, senior-style

### DevOps
- **[Развертывание](./DEPLOYMENT.md)** - Production deployment, Docker, CI/CD

### Дополнительные ресурсы
- **[Swagger UI](http://localhost:8082/parkshare/swagger-ui.html)** - Интерактивная документация API (после запуска)
- **[Существующая документация](../docs/)** - Дополнительные материалы

---

## Содержание по темам

### 1. Начало работы

#### 1.1 Установка и запуск
- [Требования](./GETTING_STARTED.md#предварительные-требования)
- [Клонирование репозитория](./GETTING_STARTED.md#шаг-1-клонирование-репозитория)
- [Запуск зависимостей](./GETTING_STARTED.md#шаг-2-запуск-зависимостей)
- [Настройка переменных окружения](./GETTING_STARTED.md#шаг-3-настройка-переменных-окружения)
- [Сборка и запуск](./GETTING_STARTED.md#шаг-4-сборка-проекта)

#### 1.2 Первые шаги
- [Тестирование API](./GETTING_STARTED.md#шаг-7-тестирование-api)
- [Работа с базой данных](./GETTING_STARTED.md#шаг-8-работа-с-базой-данных)
- [Troubleshooting](./GETTING_STARTED.md#troubleshooting)

---

### 2. Архитектура

#### 2.1 Общая архитектура
- [Многослойная архитектура](./ARCHITECTURE.md#общая-архитектура)
- [Модульная структура](./ARCHITECTURE.md#модульная-архитектура)
- [Cross-cutting concerns](./ARCHITECTURE.md#горизонтальные-слои-cross-cutting-concerns)

#### 2.2 Модули системы
- [Authentication & User Management](./ARCHITECTURE.md#модуль-authentication--user-management)
- [Parking Spots](./ARCHITECTURE.md#модуль-parking-spots)
- [Bookings](./ARCHITECTURE.md#модуль-bookings)
- [Chat (Real-time)](./ARCHITECTURE.md#модуль-chat-real-time)
- [Media](./ARCHITECTURE.md#модуль-media)

#### 2.3 Интеграции
- [Telegram Bot API](./ARCHITECTURE.md#1-telegram-bot-api)
- [SMS.ru API](./ARCHITECTURE.md#2-smsru-api-openfeign)
- [AWS S3 / MinIO](./ARCHITECTURE.md#3-aws-s3--minio)

#### 2.4 Паттерны и best practices
- [Паттерны проектирования](./ARCHITECTURE.md#паттерны-проектирования)
- [Масштабирование](./ARCHITECTURE.md#масштабирование-и-производительность)
- [Безопасность](./ARCHITECTURE.md#безопасность)

---

### 2.5. Стандарты кодирования

#### 2.5.1 Modern Java Features
- [Records (Java 16+)](./CODING_STANDARDS.md#1-records-java-16)
- [Sealed Classes (Java 17+)](./CODING_STANDARDS.md#2-sealed-classes-java-17)
- [Pattern Matching (Java 21+)](./CODING_STANDARDS.md#3-pattern-matching-java-21)
- [Virtual Threads (Java 21+)](./CODING_STANDARDS.md#4-virtual-threads-java-21)
- [Sequenced Collections (Java 21+)](./CODING_STANDARDS.md#5-sequenced-collections-java-21)
- [Text Blocks (Java 15+)](./CODING_STANDARDS.md#6-text-blocks-java-15)
- [Stream API Advanced](./CODING_STANDARDS.md#7-stream-api-advanced)

#### 2.5.2 Best Practices
- [Code Organization](./CODING_STANDARDS.md#code-organization)
- [Null Safety](./CODING_STANDARDS.md#1-null-safety)
- [Immutability](./CODING_STANDARDS.md#2-immutability)
- [Builder Pattern](./CODING_STANDARDS.md#3-builder-pattern-для-сложных-объектов)
- [Exception Handling](./CODING_STANDARDS.md#4-exception-handling)
- [Logging](./CODING_STANDARDS.md#5-logging)

#### 2.5.3 Design Patterns
- [Use Case Pattern](./CODING_STANDARDS.md#2-use-case-pattern)
- [Specification Pattern](./CODING_STANDARDS.md#3-specification-pattern-для-сложных-запросов)
- [Modern Design Patterns](./CODING_STANDARDS.md#design-patterns-modern-java)

#### 2.5.4 Testing & Performance
- [Modern Test Structure](./CODING_STANDARDS.md#testing)
- [N+1 Query Prevention](./CODING_STANDARDS.md#1-n1-query-prevention)
- [Caching](./CODING_STANDARDS.md#2-caching)
- [Security Best Practices](./CODING_STANDARDS.md#security-best-practices)

---

### 3. API

#### 3.1 REST API
- [Аутентификация](./API.md#модуль-authentication)
  - POST /auth/login
  - POST /auth/request-code
  - POST /auth/verify-code
  - GET /auth/me

- [Парковки](./API.md#модуль-parking-spots)
  - POST /spots
  - GET /spots/search
  - GET /spots/{id}
  - PATCH /spots/{id}/archive

- [Бронирования](./API.md#модуль-bookings)
  - POST /bookings
  - GET /bookings/my-renting
  - GET /bookings/my-leasing
  - POST /bookings/{id}/confirm
  - POST /bookings/{id}/start
  - POST /bookings/{id}/finish
  - POST /bookings/{id}/cancel

- [Чат](./API.md#модуль-chat)
  - GET /chats
  - GET /chats/{id}/messages
  - POST /chats/{id}/messages

- [Автомобили](./API.md#модуль-cars)
  - POST /cars
  - GET /cars
  - PUT /cars/{id}
  - DELETE /cars/{id}

- [Медиа](./API.md#модуль-media)
  - POST /media/upload

#### 3.2 WebSocket API
- [Connection](./API.md#connection)
- [Подписка на чат](./API.md#подписка-на-чат)
- [Отправка сообщения](./API.md#отправка-сообщения)

#### 3.3 Общие аспекты
- [Коды ошибок](./API.md#коды-ошибок)
- [Rate Limiting](./API.md#rate-limiting)
- [Pagination](./API.md#pagination)

---

### 4. База данных

#### 4.1 Схема
- [ER-диаграмма](./DATABASE.md#er-диаграмма-упрощенная)
- [Таблицы](./DATABASE.md#таблицы)
  - users, roles, user_roles
  - sms_codes
  - cars
  - parking_spots
  - bookings
  - chats, chat_messages
  - files
  - telegram_notifications

#### 4.2 PostGIS
- [Геопространственные запросы](./DATABASE.md#геопространственные-запросы-postgis)
- [Поиск в радиусе](./DATABASE.md#поиск-парковок-в-радиусе)
- [Bounding box](./DATABASE.md#поиск-в-ограничивающем-прямоугольнике-bounding-box)

#### 4.3 Миграции
- [Flyway миграции](./DATABASE.md#миграции-flyway)
- [Типичные запросы](./DATABASE.md#типичные-запросы)
- [Производительность](./DATABASE.md#производительность-и-оптимизация)

---

### 5. Конфигурация

#### 5.1 Основные настройки
- [Server](./CONFIGURATION.md#server-configuration)
- [Database](./CONFIGURATION.md#database-configuration)
- [JPA & Hibernate](./CONFIGURATION.md#jpa--hibernate-configuration)
- [Flyway](./CONFIGURATION.md#flyway-configuration)

#### 5.2 Интеграции
- [JWT](./CONFIGURATION.md#jwt-configuration)
- [S3 / MinIO](./CONFIGURATION.md#s3--minio-configuration)
- [Telegram](./CONFIGURATION.md#telegram-configuration)
- [SMS.ru](./CONFIGURATION.md#smsru-configuration)
- [CORS](./CONFIGURATION.md#cors-configuration)

#### 5.3 Advanced
- [WebSocket](./CONFIGURATION.md#websocket-configuration)
- [Logging](./CONFIGURATION.md#logging-configuration)
- [Actuator](./CONFIGURATION.md#actuator-configuration)
- [Security](./CONFIGURATION.md#spring-security-configuration)

#### 5.4 Environment Variables
- [Полный список переменных](./CONFIGURATION.md#environment-variables---полный-список)
- [Docker Compose](./CONFIGURATION.md#docker-compose-configuration)

---

### 6. Развертывание

#### 6.1 Локальная разработка
- [Docker Compose](./DEPLOYMENT.md#локальная-разработка)
- [Запуск через Docker](./DEPLOYMENT.md#запуск-через-docker)

#### 6.2 Production
- [Подготовка](./DEPLOYMENT.md#подготовка)
- [Развертывание на VPS](./DEPLOYMENT.md#развертывание-на-vps-ubuntu-2204)
- [Systemd service](./DEPLOYMENT.md#4-создание-systemd-service)
- [Nginx reverse proxy](./DEPLOYMENT.md#5-настройка-nginx-как-reverse-proxy)
- [SSL сертификаты](./DEPLOYMENT.md#6-получение-ssl-сертификата-lets-encrypt)

#### 6.3 Облачные платформы
- [AWS](./DEPLOYMENT.md#aws)
- [Google Cloud Platform](./DEPLOYMENT.md#google-cloud-platform)
- [DigitalOcean](./DEPLOYMENT.md#digitalocean)

#### 6.4 Эксплуатация
- [Мониторинг](./DEPLOYMENT.md#мониторинг-и-логирование)
- [Резервное копирование](./DEPLOYMENT.md#резервное-копирование)
- [Безопасность](./DEPLOYMENT.md#безопасность)
- [Масштабирование](./DEPLOYMENT.md#масштабирование)
- [Troubleshooting](./DEPLOYMENT.md#troubleshooting)

---

## Существующие документы

В папке `docs/` также доступны:
- [API Overview](../docs/api.md)
- [Booking Flow](../docs/booking-flow.md)
- [Chat System](../docs/chat.md)
- [Error Handling](../docs/errors.md)
- [Spot Search](../docs/spot-search.md)

Release Notes:
- [Authentication Release Notes](../RELEASE_NOTES_AUTH.md)

---

## Технологический стек

### Backend
- **Java 25** - язык программирования
- **Spring Boot 3.5.7** - фреймворк
- **Maven 3.9** - система сборки
- **PostgreSQL 16** - СУБД
- **PostGIS** - геопространственное расширение
- **Flyway** - миграции БД
- **Hibernate** - ORM
- **JWT** - аутентификация

### Infrastructure
- **Docker** - контейнеризация
- **MinIO** - S3-совместимое хранилище
- **Nginx** - reverse proxy
- **Systemd** - управление сервисами

### Integrations
- **Telegram Bot API** - уведомления
- **SMS.ru** - верификация номеров
- **AWS S3** - хранилище файлов

### Testing
- **JUnit 5** - unit тесты
- **Testcontainers** - integration тесты
- **WireMock** - мокирование HTTP

---

## Контакты

### Разработка
- **GitHub:** [ссылка на репозиторий]
- **Issues:** [ссылка на issues]
- **Pull Requests:** [ссылка на PR]

### Поддержка
- **Email:** support@parksharing.com
- **Telegram:** @parksharing_dev

---

## Changelog

### v0.0.1-SNAPSHOT (Current)
- MVP версия с базовым функционалом
- Аутентификация через Telegram
- CRUD парковок и бронирований
- Real-time чат через WebSocket
- Поиск парковок с геолокацией (PostGIS)
- Интеграции: Telegram, SMS.ru, S3

---

## Лицензия

[Укажите вашу лицензию]

---

**Последнее обновление:** 2026-01-26

**Версия документации:** 1.0
