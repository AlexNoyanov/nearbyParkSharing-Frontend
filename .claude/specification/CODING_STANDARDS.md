# Java 25 Coding Standards - Senior Level

Руководство по написанию кода на уровне senior Java разработчика с использованием всех современных возможностей Java 25.

---

## Содержание

1. [Modern Java Features](#modern-java-features)
2. [Code Organization](#code-organization)
3. [Best Practices](#best-practices)
4. [Design Patterns](#design-patterns)
5. [Testing](#testing)
6. [Performance](#performance)
7. [Security](#security)
8. [Examples](#examples)

---

## Modern Java Features

### 1. Records (Java 16+)

**✅ DO:** Используйте records для immutable DTOs

```java
// DTO с validation
public record SpotSearchRequest(
    @NotNull Double latitude,
    @NotNull Double longitude,
    @Min(100) @Max(50000) Integer radius,
    @NotNull RentType rentType,
    @NotNull LocalDateTime startAt,
    @NotNull LocalDateTime endAt,
    VehicleType vehicleType,
    BigDecimal minPrice,
    BigDecimal maxPrice
) {
    // Compact constructor для дополнительной валидации
    public SpotSearchRequest {
        if (endAt.isBefore(startAt)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        radius = Objects.requireNonNullElse(radius, 5000);
    }

    // Вычисляемые методы
    public Duration duration() {
        return Duration.between(startAt, endAt);
    }
}

// Response DTO
public record SpotResponse(
    Long id,
    String address,
    Point location,
    VehicleType vehicleType,
    BigDecimal priceHourly,
    boolean isArchived
) {
    // Фабричный метод для создания из Entity
    public static SpotResponse from(ParkingSpot spot) {
        return new SpotResponse(
            spot.getId(),
            spot.getAddress(),
            spot.getLocation(),
            spot.getVehicleType(),
            spot.getPriceHourly(),
            spot.isArchived()
        );
    }
}
```

**❌ DON'T:** Не используйте классы с boilerplate кодом для простых DTOs

```java
// Плохо - слишком много кода для простого DTO
public class SpotResponse {
    private Long id;
    private String address;
    // ... getters, setters, equals, hashCode, toString
}
```

---

### 2. Sealed Classes (Java 17+)

**✅ DO:** Используйте sealed classes для ограничения иерархии

```java
// Sealed интерфейс для результатов операций
public sealed interface BookingResult
    permits BookingResult.Success, BookingResult.Failure, BookingResult.Conflict {

    record Success(Booking booking) implements BookingResult {}
    record Failure(String reason) implements BookingResult {}
    record Conflict(String message, Booking existingBooking) implements BookingResult {}
}

// Использование с pattern matching
public BookingResponse handleBookingResult(BookingResult result) {
    return switch (result) {
        case BookingResult.Success(var booking) ->
            BookingResponse.success(booking);
        case BookingResult.Failure(var reason) ->
            BookingResponse.error(reason);
        case BookingResult.Conflict(var msg, var existing) ->
            BookingResponse.conflict(msg, existing);
    };
}

// Sealed hierarchy для payment strategies
public sealed interface PaymentStrategy
    permits HourlyPayment, DailyPayment, MonthlyPayment {

    BigDecimal calculateAmount(ParkingSpot spot, Duration duration);
}

record HourlyPayment() implements PaymentStrategy {
    @Override
    public BigDecimal calculateAmount(ParkingSpot spot, Duration duration) {
        long hours = duration.toHours();
        return spot.getPriceHourly().multiply(BigDecimal.valueOf(hours));
    }
}

record DailyPayment() implements PaymentStrategy {
    @Override
    public BigDecimal calculateAmount(ParkingSpot spot, Duration duration) {
        long days = duration.toDays() + (duration.toHoursPart() > 0 ? 1 : 0);
        return spot.getPriceDaily().multiply(BigDecimal.valueOf(days));
    }
}

record MonthlyPayment() implements PaymentStrategy {
    @Override
    public BigDecimal calculateAmount(ParkingSpot spot, Duration duration) {
        long months = duration.toDays() / 30 + (duration.toDays() % 30 > 0 ? 1 : 0);
        return spot.getPriceMonthly().multiply(BigDecimal.valueOf(months));
    }
}
```

---

### 3. Pattern Matching (Java 21+)

**✅ DO:** Используйте pattern matching for switch

```java
// Pattern matching с guards
public String formatBookingStatus(Booking booking) {
    return switch (booking.getStatus()) {
        case WAITING_CONFIRMATION ->
            "Ожидает подтверждения владельца";
        case WAITING_START when booking.getStartAt().isAfter(LocalDateTime.now()) ->
            "Подтверждено, начало через " + formatDuration(booking.getStartAt());
        case WAITING_START ->
            "Готово к началу";
        case ACTIVE when booking.getEndAt().isBefore(LocalDateTime.now().plusHours(1)) ->
            "Активно, заканчивается через час";
        case ACTIVE ->
            "Активно";
        case FINISHED ->
            "Завершено";
        case CANCELED ->
            "Отменено";
    };
}

// Pattern matching for instanceof
public BigDecimal calculatePrice(Object priceInfo) {
    return switch (priceInfo) {
        case BigDecimal price -> price;
        case Integer price -> BigDecimal.valueOf(price);
        case String price when price.matches("\\d+") -> new BigDecimal(price);
        case null -> BigDecimal.ZERO;
        default -> throw new IllegalArgumentException("Invalid price: " + priceInfo);
    };
}

// Record patterns (Java 21+)
public void processBooking(BookingEvent event) {
    switch (event) {
        case BookingCreated(var booking, var timestamp) ->
            notifyOwner(booking, timestamp);
        case BookingConfirmed(var booking, var confirmedBy, var timestamp) ->
            notifyRenter(booking, confirmedBy, timestamp);
        case BookingCanceled(var booking, var reason, var timestamp) ->
            handleCancellation(booking, reason, timestamp);
    }
}
```

---

### 4. Virtual Threads (Java 21+)

**✅ DO:** Используйте Virtual Threads для I/O операций

```java
@Configuration
public class AsyncConfig {

    // Virtual Thread Executor для асинхронных операций
    @Bean(name = "virtualThreadExecutor")
    public Executor virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}

@Service
public class NotificationService {

    @Async("virtualThreadExecutor")
    public CompletableFuture<Void> sendTelegramNotification(Long userId, String message) {
        return CompletableFuture.runAsync(() -> {
            try {
                telegramClient.sendMessage(userId, message);
            } catch (Exception e) {
                log.error("Failed to send telegram notification", e);
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    // Parallel processing с virtual threads
    public void notifyAllUsers(List<User> users, String message) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            users.forEach(user ->
                executor.submit(() -> sendNotification(user, message))
            );
        }
    }
}

// Blocking I/O в virtual threads - теперь это нормально!
@Service
public class SpotSearchService {

    public List<SpotResponse> searchParallel(List<SearchCriteria> criteriaList) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = criteriaList.stream()
                .map(criteria -> CompletableFuture.supplyAsync(
                    () -> searchSpots(criteria),
                    executor
                ))
                .toList();

            return futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .distinct()
                .toList();
        }
    }
}
```

---

### 5. Sequenced Collections (Java 21+)

**✅ DO:** Используйте новые методы для работы с последовательностями

```java
@Service
public class ChatService {

    // Работа с первым и последним элементом
    public ChatMessage getLastMessage(Chat chat) {
        var messages = chat.getMessages(); // SequencedCollection
        return messages.isEmpty() ? null : messages.getLast();
    }

    public ChatMessage getFirstMessage(Chat chat) {
        var messages = chat.getMessages();
        return messages.isEmpty() ? null : messages.getFirst();
    }

    // Reversed view
    public List<ChatMessage> getMessagesReversed(Chat chat) {
        return chat.getMessages().reversed();
    }

    // Добавление в начало/конец
    public void addSystemMessage(Chat chat, String text) {
        var message = ChatMessage.system(text);
        chat.getMessages().addFirst(message); // Добавить в начало
    }

    public void appendMessage(Chat chat, ChatMessage message) {
        chat.getMessages().addLast(message); // Добавить в конец
    }
}
```

---

### 6. Text Blocks (Java 15+)

**✅ DO:** Используйте text blocks для SQL, JSON, HTML

```java
@Repository
public class ParkingSpotRepositoryCustom {

    private static final String SEARCH_QUERY = """
        SELECT p.*,
               ST_Distance(
                   p.location::geography,
                   ST_MakePoint(:longitude, :latitude)::geography
               ) as distance
        FROM parking_spots p
        WHERE ST_DWithin(
                  p.location::geography,
                  ST_MakePoint(:longitude, :latitude)::geography,
                  :radius
              )
          AND p.is_archived = false
          AND NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.spot_id = p.id
                AND b.status IN ('WAITING_START', 'ACTIVE')
                AND b.start_at <= :endAt
                AND b.end_at >= :startAt
          )
        ORDER BY distance
        LIMIT :limit
        """;

    @Query(value = SEARCH_QUERY, nativeQuery = true)
    List<ParkingSpot> searchAvailable(
        @Param("latitude") double latitude,
        @Param("longitude") double longitude,
        @Param("radius") double radius,
        @Param("startAt") LocalDateTime startAt,
        @Param("endAt") LocalDateTime endAt,
        @Param("limit") int limit
    );
}

// JSON templates
public class TelegramMessageBuilder {

    public String buildBookingNotification(Booking booking) {
        return """
            {
              "chat_id": %d,
              "text": "🚗 Новое бронирование!\\n\\n\
                      Адрес: %s\\n\
                      Время: %s - %s\\n\
                      Сумма: %.2f ₽",
              "parse_mode": "HTML",
              "reply_markup": {
                "inline_keyboard": [[
                  {"text": "✅ Подтвердить", "callback_data": "confirm_%d"},
                  {"text": "❌ Отклонить", "callback_data": "reject_%d"}
                ]]
              }
            }
            """.formatted(
                booking.getSpot().getOwner().getTelegramId(),
                booking.getSpot().getAddress(),
                booking.getStartAt(),
                booking.getEndAt(),
                booking.getTotalAmount(),
                booking.getId(),
                booking.getId()
            );
    }
}
```

---

### 7. Stream API Advanced

**✅ DO:** Используйте современные Stream API методы

```java
@Service
public class BookingAnalyticsService {

    // Stream.toList() вместо collect(Collectors.toList())
    public List<BookingResponse> getActiveBookings(Long userId) {
        return bookingRepository.findByRenterId(userId).stream()
            .filter(b -> b.getStatus() == BookingStatus.ACTIVE)
            .map(BookingResponse::from)
            .toList(); // Java 16+
    }

    // Stream.mapMulti для сложных трансформаций
    public List<NotificationEvent> generateNotifications(List<Booking> bookings) {
        return bookings.stream()
            .<NotificationEvent>mapMulti((booking, consumer) -> {
                // Генерация множественных событий из одного booking
                if (booking.isStartingSoon()) {
                    consumer.accept(new StartingSoonNotification(booking));
                }
                if (booking.isEndingSoon()) {
                    consumer.accept(new EndingSoonNotification(booking));
                }
                if (booking.isOverdue()) {
                    consumer.accept(new OverdueNotification(booking));
                }
            })
            .toList();
    }

    // Collectors.teeing для параллельной агрегации
    public BookingStats calculateStats(List<Booking> bookings) {
        return bookings.stream()
            .collect(Collectors.teeing(
                Collectors.summingDouble(b -> b.getTotalAmount().doubleValue()),
                Collectors.counting(),
                (totalRevenue, count) -> new BookingStats(totalRevenue, count)
            ));
    }

    // Stream.gather (Java 22+) для custom операций
    public List<BookingGroup> groupByWeek(List<Booking> bookings) {
        return bookings.stream()
            .sorted(Comparator.comparing(Booking::getStartAt))
            .gather(Gatherers.windowSliding(7))
            .map(BookingGroup::new)
            .toList();
    }

    // Filtering collectors
    public Map<BookingStatus, List<Booking>> getBookingsByStatus(Long spotId) {
        return bookingRepository.findBySpotId(spotId).stream()
            .collect(Collectors.groupingBy(
                Booking::getStatus,
                Collectors.filtering(
                    b -> !b.isCanceled(),
                    Collectors.toList()
                )
            ));
    }
}
```

---

## Code Organization

### 1. Package Structure (Domain-Driven)

```
com.parksharing/
├── domain/
│   ├── model/              # Domain entities
│   │   ├── Booking.java
│   │   ├── ParkingSpot.java
│   │   └── User.java
│   ├── repository/         # Repository interfaces
│   ├── service/            # Domain services
│   └── event/              # Domain events
│
├── application/
│   ├── usecase/            # Use cases (application services)
│   │   ├── CreateBookingUseCase.java
│   │   ├── SearchSpotsUseCase.java
│   │   └── ConfirmBookingUseCase.java
│   ├── dto/                # Application DTOs
│   └── mapper/             # DTO mappers
│
├── infrastructure/
│   ├── persistence/        # JPA implementations
│   │   ├── entity/         # JPA entities
│   │   └── repository/     # JPA repositories
│   ├── messaging/          # WebSocket, Kafka, etc.
│   ├── external/           # External service clients
│   │   ├── telegram/
│   │   └── sms/
│   └── config/             # Infrastructure config
│
└── presentation/
    ├── rest/               # REST controllers
    ├── websocket/          # WebSocket handlers
    └── dto/                # API DTOs
```

### 2. Use Case Pattern

**✅ DO:** Используйте Use Case классы для бизнес-логики

```java
// Use Case как отдельный компонент
@Service
@RequiredArgsConstructor
public class CreateBookingUseCase {

    private final BookingRepository bookingRepository;
    private final ParkingSpotRepository spotRepository;
    private final NotificationService notificationService;
    private final BookingValidator validator;

    @Transactional
    public BookingResult execute(CreateBookingCommand command) {
        // 1. Валидация
        var validation = validator.validate(command);
        if (validation.hasErrors()) {
            return BookingResult.failure(validation.getErrors());
        }

        // 2. Загрузка данных
        var spot = spotRepository.findById(command.spotId())
            .orElseThrow(() -> new NotFoundException("Spot not found"));

        // 3. Проверка доступности
        var existingBooking = bookingRepository
            .findConflicting(spot.getId(), command.startAt(), command.endAt());

        if (existingBooking.isPresent()) {
            return BookingResult.conflict("Spot is already booked", existingBooking.get());
        }

        // 4. Создание бронирования
        var booking = Booking.create(
            spot,
            command.renterId(),
            command.carId(),
            command.rentType(),
            command.startAt(),
            command.endAt()
        );

        booking = bookingRepository.save(booking);

        // 5. Побочные эффекты
        notificationService.notifyOwner(booking);

        return BookingResult.success(booking);
    }
}

// Command object
public record CreateBookingCommand(
    Long spotId,
    Long renterId,
    Long carId,
    RentType rentType,
    LocalDateTime startAt,
    LocalDateTime endAt
) {}
```

---

### 3. Specification Pattern для сложных запросов

**✅ DO:** Используйте JPA Specifications

```java
// Specification builder
public class ParkingSpotSpecifications {

    public static Specification<ParkingSpot> withinRadius(
        Point center,
        double radiusMeters
    ) {
        return (root, query, cb) -> {
            var distance = cb.function(
                "ST_Distance",
                Double.class,
                cb.function("geography", Geometry.class, root.get("location")),
                cb.function("geography", Geometry.class, cb.literal(center))
            );
            return cb.lessThanOrEqualTo(distance, radiusMeters);
        };
    }

    public static Specification<ParkingSpot> isNotArchived() {
        return (root, query, cb) -> cb.isFalse(root.get("isArchived"));
    }

    public static Specification<ParkingSpot> hasVehicleType(VehicleType type) {
        return (root, query, cb) ->
            type == null ? cb.conjunction() : cb.equal(root.get("vehicleType"), type);
    }

    public static Specification<ParkingSpot> hasAmenity(String amenity) {
        return (root, query, cb) -> {
            var jsonbExtract = cb.function(
                "jsonb_extract_path_text",
                String.class,
                root.get("amenities"),
                cb.literal(amenity)
            );
            return cb.equal(jsonbExtract, "true");
        };
    }

    public static Specification<ParkingSpot> availableBetween(
        LocalDateTime start,
        LocalDateTime end
    ) {
        return (root, query, cb) -> {
            var subquery = query.subquery(Long.class);
            var booking = subquery.from(Booking.class);

            subquery.select(cb.literal(1L))
                .where(
                    cb.equal(booking.get("spot"), root),
                    booking.get("status").in(
                        BookingStatus.WAITING_START,
                        BookingStatus.ACTIVE
                    ),
                    cb.lessThanOrEqualTo(booking.get("startAt"), end),
                    cb.greaterThanOrEqualTo(booking.get("endAt"), start)
                );

            return cb.not(cb.exists(subquery));
        };
    }

    // Composite specification
    public static Specification<ParkingSpot> searchCriteria(SpotSearchRequest request) {
        return Specification
            .where(withinRadius(createPoint(request), request.radius()))
            .and(isNotArchived())
            .and(hasVehicleType(request.vehicleType()))
            .and(availableBetween(request.startAt(), request.endAt()))
            .and(hasPriceRange(request.minPrice(), request.maxPrice()));
    }
}

// Использование
@Service
@RequiredArgsConstructor
public class SpotSearchService {

    private final ParkingSpotRepository repository;

    public Page<ParkingSpot> search(SpotSearchRequest request, Pageable pageable) {
        var spec = ParkingSpotSpecifications.searchCriteria(request);
        return repository.findAll(spec, pageable);
    }
}
```

---

## Best Practices

### 1. Null Safety

**✅ DO:** Используйте Optional и null-safety аннотации

```java
// Spring's null-safety annotations
@NonNullApi
@NonNullFields
package com.parksharing.booking.service;

import org.springframework.lang.NonNullApi;
import org.springframework.lang.NonNullFields;

// В коде
@Service
public class BookingService {

    // Optional для методов, которые могут не найти результат
    public Optional<Booking> findById(Long id) {
        return bookingRepository.findById(id);
    }

    // @Nullable для параметров, которые могут быть null
    public List<Booking> findByStatus(@Nullable BookingStatus status) {
        return status == null
            ? bookingRepository.findAll()
            : bookingRepository.findByStatus(status);
    }

    // Objects.requireNonNull для валидации
    public Booking create(CreateBookingRequest request) {
        Objects.requireNonNull(request, "Request cannot be null");
        Objects.requireNonNull(request.spotId(), "Spot ID cannot be null");
        // ...
    }

    // Optional.orElseThrow вместо get()
    public Booking getBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }

    // Stream filtering с Optional
    public List<User> getActiveUserEmails() {
        return userRepository.findAll().stream()
            .map(User::getEmail)
            .flatMap(Optional::stream) // Java 9+
            .filter(email -> !email.isBlank())
            .toList();
    }
}
```

### 2. Immutability

**✅ DO:** Предпочитайте immutable объекты

```java
// Immutable value objects
public record Money(BigDecimal amount, Currency currency) {

    public Money {
        Objects.requireNonNull(amount, "Amount cannot be null");
        Objects.requireNonNull(currency, "Currency cannot be null");
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
    }

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Cannot add different currencies");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money multiply(BigDecimal multiplier) {
        return new Money(this.amount.multiply(multiplier), this.currency);
    }
}

// Immutable collections
public class Booking {

    private final List<BookingEvent> events;

    public Booking(List<BookingEvent> events) {
        this.events = List.copyOf(events); // Immutable copy
    }

    public List<BookingEvent> getEvents() {
        return events; // Already immutable
    }

    public Booking addEvent(BookingEvent event) {
        var newEvents = new ArrayList<>(events);
        newEvents.add(event);
        return new Booking(List.copyOf(newEvents));
    }
}
```

### 3. Builder Pattern (для сложных объектов)

**✅ DO:** Используйте Lombok @Builder или record pattern

```java
// С Lombok
@Builder
@Getter
public class ParkingSpot {
    private final Long id;
    private final User owner;
    private final String address;
    private final Point location;
    private final VehicleType vehicleType;

    @Builder.Default
    private final boolean isArchived = false;

    @Singular
    private final List<String> photos;

    @Singular("amenity")
    private final Map<String, Object> amenities;
}

// Использование
var spot = ParkingSpot.builder()
    .owner(user)
    .address("Москва, ул. Ленина, 1")
    .location(point)
    .vehicleType(VehicleType.CAR)
    .photo("photo1.jpg")
    .photo("photo2.jpg")
    .amenity("covered", true)
    .amenity("security", true)
    .build();

// Альтернатива: Record с static builder
public record CreateSpotRequest(
    String address,
    Double latitude,
    Double longitude,
    VehicleType vehicleType,
    BigDecimal priceHourly,
    List<String> photos,
    Map<String, Object> amenities
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String address;
        private Double latitude;
        private Double longitude;
        private VehicleType vehicleType = VehicleType.CAR;
        private BigDecimal priceHourly = BigDecimal.ZERO;
        private List<String> photos = new ArrayList<>();
        private Map<String, Object> amenities = new HashMap<>();

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder location(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            return this;
        }

        public Builder addPhoto(String photo) {
            this.photos.add(photo);
            return this;
        }

        public CreateSpotRequest build() {
            return new CreateSpotRequest(
                address, latitude, longitude, vehicleType,
                priceHourly, List.copyOf(photos), Map.copyOf(amenities)
            );
        }
    }
}
```

### 4. Exception Handling

**✅ DO:** Используйте typed exceptions и sealed hierarchies

```java
// Sealed exception hierarchy
public sealed class BookingException extends RuntimeException
    permits BookingNotFoundException,
            BookingConflictException,
            InvalidBookingStateException {

    protected BookingException(String message) {
        super(message);
    }

    protected BookingException(String message, Throwable cause) {
        super(message, cause);
    }
}

public final class BookingNotFoundException extends BookingException {
    public BookingNotFoundException(Long bookingId) {
        super("Booking not found: " + bookingId);
    }
}

public final class BookingConflictException extends BookingException {
    private final Booking conflictingBooking;

    public BookingConflictException(String message, Booking conflictingBooking) {
        super(message);
        this.conflictingBooking = conflictingBooking;
    }

    public Booking getConflictingBooking() {
        return conflictingBooking;
    }
}

public final class InvalidBookingStateException extends BookingException {
    private final BookingStatus currentStatus;
    private final BookingStatus expectedStatus;

    public InvalidBookingStateException(
        BookingStatus current,
        BookingStatus expected
    ) {
        super("Invalid state transition from " + current + " to " + expected);
        this.currentStatus = current;
        this.expectedStatus = expected;
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBookingException(BookingException ex) {
        var response = switch (ex) {
            case BookingNotFoundException e ->
                new ErrorResponse(404, e.getMessage(), LocalDateTime.now());
            case BookingConflictException e ->
                new ErrorResponse(409, e.getMessage(), LocalDateTime.now())
                    .withExtra("conflictingBookingId", e.getConflictingBooking().getId());
            case InvalidBookingStateException e ->
                new ErrorResponse(400, e.getMessage(), LocalDateTime.now());
        };

        return ResponseEntity
            .status(response.status())
            .body(response);
    }
}
```

---

### 5. Logging

**✅ DO:** Используйте structured logging

```java
@Slf4j
@Service
public class BookingService {

    // Structured logging с MDC
    public Booking createBooking(CreateBookingRequest request) {
        try (var ignored = MDC.putCloseable("operation", "createBooking")) {
            MDC.put("userId", String.valueOf(request.renterId()));
            MDC.put("spotId", String.valueOf(request.spotId()));

            log.info("Creating booking: rentType={}, startAt={}, endAt={}",
                request.rentType(), request.startAt(), request.endAt());

            var booking = performCreate(request);

            log.info("Booking created successfully: bookingId={}, totalAmount={}",
                booking.getId(), booking.getTotalAmount());

            return booking;
        } catch (Exception e) {
            log.error("Failed to create booking: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Debug logging с lazy evaluation
    public List<ParkingSpot> searchSpots(SpotSearchRequest request) {
        log.debug("Searching spots with criteria: {}", () -> request.toString());

        var spots = spotRepository.search(request);

        if (log.isDebugEnabled()) {
            log.debug("Found {} spots: {}",
                spots.size(),
                spots.stream().map(ParkingSpot::getId).toList()
            );
        }

        return spots;
    }
}
```

---

## Design Patterns (Modern Java)

### 1. Strategy Pattern с Records

```java
public interface PriceCalculator {
    BigDecimal calculate(ParkingSpot spot, Duration duration);
}

// Factory с records
public class PriceCalculatorFactory {

    public static PriceCalculator create(RentType rentType) {
        return switch (rentType) {
            case HOURLY -> new HourlyPriceCalculator();
            case DAILY -> new DailyPriceCalculator();
            case MONTHLY -> new MonthlyPriceCalculator();
        };
    }
}

record HourlyPriceCalculator() implements PriceCalculator {
    @Override
    public BigDecimal calculate(ParkingSpot spot, Duration duration) {
        long hours = Math.max(1, duration.toHours());
        return spot.getPriceHourly().multiply(BigDecimal.valueOf(hours));
    }
}
```

### 2. Visitor Pattern с Pattern Matching

```java
public sealed interface BookingVisitor<T> {
    T visit(ActiveBooking booking);
    T visit(WaitingBooking booking);
    T visit(FinishedBooking booking);
}

// Visitor implementation
record PriceCalculationVisitor() implements BookingVisitor<BigDecimal> {

    @Override
    public BigDecimal visit(ActiveBooking booking) {
        return booking.calculateCurrentPrice();
    }

    @Override
    public BigDecimal visit(WaitingBooking booking) {
        return booking.getQuotedPrice();
    }

    @Override
    public BigDecimal visit(FinishedBooking booking) {
        return booking.getFinalPrice();
    }
}

// Usage
public BigDecimal getPrice(Booking booking) {
    return switch (booking) {
        case ActiveBooking b -> b.accept(new PriceCalculationVisitor());
        case WaitingBooking b -> b.accept(new PriceCalculationVisitor());
        case FinishedBooking b -> b.accept(new PriceCalculationVisitor());
    };
}
```

---

## Testing

### 1. Modern Test Structure

**✅ DO:** Используйте современные testing practices

```java
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
class BookingServiceTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @MockBean
    private NotificationService notificationService;

    @Nested
    @DisplayName("Creating bookings")
    class CreateBooking {

        @Test
        @DisplayName("should create booking when spot is available")
        void shouldCreateBookingWhenAvailable() {
            // Given
            var request = new CreateBookingRequest(
                spotId,
                userId,
                carId,
                RentType.HOURLY,
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(1).plusHours(2)
            );

            // When
            var result = bookingService.createBooking(request);

            // Then
            assertThat(result)
                .isNotNull()
                .extracting(Booking::getStatus)
                .isEqualTo(BookingStatus.WAITING_CONFIRMATION);

            verify(notificationService).notifyOwner(any(Booking.class));
        }

        @ParameterizedTest
        @EnumSource(value = RentType.class)
        @DisplayName("should support all rent types")
        void shouldSupportAllRentTypes(RentType rentType) {
            // Test with all rent types
        }
    }

    @Nested
    @DisplayName("Confirming bookings")
    class ConfirmBooking {

        @Test
        @DisplayName("should transition to WAITING_START when confirmed")
        void shouldTransitionToWaitingStart() {
            // Given
            var booking = createTestBooking(BookingStatus.WAITING_CONFIRMATION);

            // When
            var confirmed = bookingService.confirmBooking(booking.getId());

            // Then
            assertThat(confirmed.getStatus())
                .isEqualTo(BookingStatus.WAITING_START);
        }

        @Test
        @DisplayName("should throw when booking is not in correct state")
        void shouldThrowWhenInvalidState() {
            // Given
            var booking = createTestBooking(BookingStatus.FINISHED);

            // When/Then
            assertThatThrownBy(() -> bookingService.confirmBooking(booking.getId()))
                .isInstanceOf(InvalidBookingStateException.class)
                .hasMessageContaining("Invalid state transition");
        }
    }
}
```

### 2. Test Data Builders

```java
// Test data builder
public class BookingTestBuilder {

    private Long id = 1L;
    private ParkingSpot spot = ParkingSpotTestBuilder.aSpot().build();
    private User renter = UserTestBuilder.aUser().build();
    private BookingStatus status = BookingStatus.WAITING_CONFIRMATION;
    private LocalDateTime startAt = LocalDateTime.now().plusDays(1);
    private LocalDateTime endAt = LocalDateTime.now().plusDays(2);

    public static BookingTestBuilder aBooking() {
        return new BookingTestBuilder();
    }

    public BookingTestBuilder withId(Long id) {
        this.id = id;
        return this;
    }

    public BookingTestBuilder withStatus(BookingStatus status) {
        this.status = status;
        return this;
    }

    public BookingTestBuilder thatIsActive() {
        this.status = BookingStatus.ACTIVE;
        this.startAt = LocalDateTime.now().minusHours(1);
        this.endAt = LocalDateTime.now().plusHours(1);
        return this;
    }

    public Booking build() {
        var booking = new Booking();
        booking.setId(id);
        booking.setSpot(spot);
        booking.setRenter(renter);
        booking.setStatus(status);
        booking.setStartAt(startAt);
        booking.setEndAt(endAt);
        return booking;
    }
}

// Usage in tests
@Test
void testActiveBooking() {
    var booking = aBooking()
        .thatIsActive()
        .withId(123L)
        .build();

    assertThat(booking.isActive()).isTrue();
}
```

---

## Performance

### 1. N+1 Query Prevention

```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Fetch join для предотвращения N+1
    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.spot s
        JOIN FETCH b.renter r
        LEFT JOIN FETCH b.car c
        WHERE b.id = :id
        """)
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    // Entity graph
    @EntityGraph(attributePaths = {"spot", "renter", "car"})
    List<Booking> findByRenterId(Long renterId);

    // Batch fetch
    @QueryHints(@QueryHint(name = "org.hibernate.fetchSize", value = "50"))
    @Query("SELECT b FROM Booking b WHERE b.status = :status")
    List<Booking> findByStatus(@Param("status") BookingStatus status);
}
```

### 2. Caching

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            "spots",
            "users",
            "spotSearch"
        );
    }
}

@Service
public class SpotService {

    @Cacheable(value = "spots", key = "#id")
    public Optional<ParkingSpot> findById(Long id) {
        return spotRepository.findById(id);
    }

    @CacheEvict(value = "spots", key = "#spot.id")
    public ParkingSpot update(ParkingSpot spot) {
        return spotRepository.save(spot);
    }

    @Cacheable(value = "spotSearch", key = "#request.hashCode()")
    public List<ParkingSpot> search(SpotSearchRequest request) {
        return spotRepository.search(request);
    }
}
```

---

## Security Best Practices

```java
// SQL Injection prevention
@Query(value = """
    SELECT * FROM parking_spots
    WHERE address ILIKE %:search%
    """, nativeQuery = true)
List<ParkingSpot> search(@Param("search") String search); // Параметризованный запрос

// XSS prevention
@Service
public class MessageService {

    public ChatMessage createMessage(String text) {
        // Sanitize input
        var sanitized = HtmlUtils.htmlEscape(text);
        return new ChatMessage(sanitized);
    }
}

// Authorization checks
@Service
public class BookingService {

    @PreAuthorize("hasRole('USER')")
    public Booking createBooking(CreateBookingRequest request) {
        // ...
    }

    public Booking confirmBooking(Long bookingId) {
        var booking = getBookingOrThrow(bookingId);
        var currentUser = SecurityUtils.getCurrentUser();

        // Check ownership
        if (!booking.getSpot().getOwner().equals(currentUser)) {
            throw new ForbiddenException("Only spot owner can confirm booking");
        }

        booking.confirm();
        return bookingRepository.save(booking);
    }
}

// Secret management
@Configuration
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    @Secret // Custom annotation для маскирования в логах
    private String jwtSecret;

    @Secret
    private String s3SecretKey;

    // getters/setters
}
```

---

## Code Style Checklist

- [ ] Используйте records для immutable DTOs
- [ ] Применяйте sealed classes для ограниченных иерархий
- [ ] Используйте pattern matching вместо instanceof chains
- [ ] Применяйте Virtual Threads для I/O операций
- [ ] Используйте text blocks для SQL/JSON/HTML
- [ ] Предпочитайте stream.toList() вместо collect(Collectors.toList())
- [ ] Используйте Optional для nullable возвращаемых значений
- [ ] Применяйте @NonNull аннотации
- [ ] Используйте Lombok для уменьшения boilerplate
- [ ] Пишите unit тесты с modern JUnit 5
- [ ] Используйте Testcontainers для integration tests
- [ ] Применяйте immutable collections где возможно
- [ ] Используйте structured logging с SLF4J
- [ ] Применяйте specification pattern для сложных запросов
- [ ] Используйте fetch joins для предотвращения N+1
- [ ] Применяйте @Transactional правильно
- [ ] Валидируйте входные данные с Bean Validation
- [ ] Используйте sealed exceptions для typed error handling
- [ ] Применяйте dependency injection через constructor
- [ ] Следуйте SOLID principles
