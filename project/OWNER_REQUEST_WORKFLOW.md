# Логика работы с заявками на бронирование (Owner Requests)

## Обзор
Документ описывает полную логику работы приложения для владельцев парковочных мест при обработке заявок на бронирование от арендаторов.

## Типы статусов заявок

### OwnerRequestStatus
```typescript
type OwnerRequestStatus = 
  | 'awaiting'      // Ожидает подтверждения владельцем
  | 'confirmed'     // Подтверждено, ожидает начала аренды
  | 'active'        // Аренда активна (в процессе)
  | 'completed'     // Аренда завершена
  | 'cancelled'     // Заявка отменена
```

## Структура данных OwnerRequest

```typescript
type OwnerRequest = {
  id: string
  address: string
  startDate: string      // Формат: 'YYYY-MM-DD'
  endDate: string        // Формат: 'YYYY-MM-DD'
  startTime: string      // Формат: 'HH:mm'
  endTime: string        // Формат: 'HH:mm'
  renterName: string     // Имя арендатора
  status: OwnerRequestStatus
}
```

## Жизненный цикл заявки

### 1. Статус: 'awaiting' (Ожидает подтверждения)

**Отображение:**
- На главном экране в разделе "Сдача мест" (фильтр "Сдача мест")
- Статус: "Ожидает подтверждения" (красный цвет `#EF4444`)
- Мета-информация: "ждет вашего решения"

**Действия при клике:**
- Открывается экран `OwnerRequestConfirmationScreen`
- Показываются детали бронирования:
  - Адрес парковочного места
  - Дата и время начала/окончания
  - Стоимость аренды
  - Прибыль владельца (после комиссии 10%)
  - Информация об автомобиле арендатора

**Доступные действия:**
1. **Подтвердить** → Переход к статусу 'confirmed'
2. **Отклонить** → Переход к экрану отмены, затем к статусу 'cancelled'

---

### 2. Статус: 'confirmed' (Ожидает начала аренды)

**Отображение:**
- На главном экране в разделе "Сдача мест"
- Статус: "Ожидает начала аренды" (зеленый цвет `#22C55E`)
- Мета-информация: "ожидает начала аренды"

**Действия при клике:**
- Открывается экран `OwnerBookingConfirmedScreen` (финальный экран с подтверждением)
- Показывается информация о подтвержденном бронировании
- Доступны действия:
  - Вернуться на главную
  - Открыть чат с арендатором

**Переход к этому статусу:**
- Происходит после подтверждения заявки со статусом 'awaiting'
- Функция: `handleOwnerRequestConfirm()`
- Обновление: `status: 'confirmed'`
- Навигация: `stage = 'owner-booking-confirmed'`

---

### 3. Статус: 'active' (Аренда активна)

**Отображение:**
- На главном экране в разделе "Сдача мест"
- Статус: "Активное" (зеленый цвет `#22C55E`)
- Мета-информация: "аренда активна"

**Действия при клике:**
- Открывается экран `OwnerBookingConfirmedScreen`
- Показывается информация об активной аренде

**Примечание:**
- Этот статус используется для заявок, которые уже начались
- В будущем может быть отдельный экран для активных аренд

---

### 4. Статус: 'completed' (Завершено)

**Отображение:**
- На главном экране в разделе "Сдача мест"
- Статус: "Завершено" (серый цвет `#4B5563`)
- Мета-информация: "бронь завершена"

**Действия при клике:**
- Открывается экран `OwnerCompletedBookingScreen`
- Показывается информация о завершенной аренде
- Доступны действия:
  - Вернуться на главную
  - Открыть чат с арендатором (статус в чате: "Завершено")

---

### 5. Статус: 'cancelled' (Отменено)

**Отображение:**
- На главном экране в разделе "Сдача мест"
- Статус: "Отменено" (красный цвет `#EF4444`)
- Мета-информация: "клиент отменил запрос"

**Действия при клике:**
- Открывается чат с арендатором
- Статус в чате: "Отменено"
- Показывается история переписки об отмене

**Процесс отмены:**
1. Владелец нажимает "Отклонить" на экране подтверждения
2. Открывается экран `OwnerRequestDeclineScreen` (экран подтверждения отмены)
3. Владелец нажимает "Отклонить бронирование"
4. Статус обновляется на 'cancelled'
5. Настраиваются данные для чата (имя арендатора, детали бронирования, статус "Отменено")
6. Происходит переход в чат

---

## Функции обработки

### handleOwnerRequestConfirm()
**Назначение:** Подтверждение заявки на бронирование

**Логика:**
1. Проверка наличия `selectedOwnerRequest`
2. Обновление статуса заявки на `'confirmed'`
3. Переход на экран `owner-booking-confirmed`

**Код:**
```typescript
const handleOwnerRequestConfirm = () => {
  if (!selectedOwnerRequest.value) return

  ownerRequests.value = ownerRequests.value.map((req) =>
    req.id === selectedOwnerRequest.value?.id 
      ? { ...req, status: 'confirmed' } 
      : req,
  )

  stage.value = 'owner-booking-confirmed'
}
```

---

### handleOwnerRequestDecline()
**Назначение:** Отклонение заявки на бронирование

**Логика:**
1. Проверка наличия `selectedOwnerRequest`
2. Обновление статуса заявки на `'cancelled'`
3. Настройка данных для чата:
   - Имя арендатора (`selectedChatName`)
   - Детали бронирования (`selectedChatBooking`)
   - Статус: "Отменено"
4. Переход в чат

**Важно:** Экран отмены (`OwnerRequestDeclineScreen`) уже был показан перед вызовом этой функции.

**Код:**
```typescript
const handleOwnerRequestDecline = () => {
  if (!selectedOwnerRequest.value) return

  // 1. Обновляем статус заявки на 'cancelled'
  ownerRequests.value = ownerRequests.value.map((req) =>
    req.id === selectedOwnerRequest.value?.id 
      ? { ...req, status: 'cancelled' } 
      : req,
  )

  // 2. Настраиваем данные для чата с информацией об отмене
  selectedChatName.value = selectedOwnerRequest.value.renterName
  selectedChatBooking.value = {
    address: selectedOwnerRequest.value.address,
    date: selectedOwnerRequest.value.startDate,
    time: `${selectedOwnerRequest.value.startTime} — ${selectedOwnerRequest.value.endTime}`,
    price: '₽160',
    status: 'Отменено',
  }
  
  // 3. Переходим в чат (экран отмены уже был показан перед этим)
  stage.value = 'chat'
}
```

---

### handleOpenOwnerRequestFromHome()
**Назначение:** Обработка клика по карточке заявки на главном экране

**Логика в зависимости от статуса:**

1. **'awaiting'** → Открыть экран подтверждения (`owner-request-confirmation`)
2. **'confirmed'** → Открыть финальный экран с подтверждением (`owner-booking-confirmed`)
3. **'active'** → Открыть экран подтверждённого бронирования (`owner-booking-confirmed`)
4. **'completed'** → Открыть экран завершённого бронирования (`owner-completed-booking`)
5. **'cancelled'** → Открыть чат с историей отмены

**Код:**
```typescript
const handleOpenOwnerRequestFromHome = (request: OwnerRequest) => {
  if (request.status === 'awaiting') {
    selectedOwnerRequest.value = request
    stage.value = 'owner-request-confirmation'
    return
  }

  if (request.status === 'confirmed') {
    selectedOwnerRequest.value = request
    stage.value = 'owner-booking-confirmed'
    return
  }

  if (request.status === 'active') {
    selectedOwnerRequest.value = request
    stage.value = 'owner-booking-confirmed'
    return
  }

  if (request.status === 'completed') {
    selectedOwnerRequest.value = request
    stage.value = 'owner-completed-booking'
    return
  }

  // Для отмененных заявок открываем чат с историей
  selectedChatName.value = request.renterName
  selectedChatBooking.value = {
    address: request.address,
    date: request.startDate,
    time: `${request.startTime} — ${request.endTime}`,
    price: '₽1 600',
    status: 'Отменено',
  }
  stage.value = 'chat'
}
```

---

## Экраны (Views)

### OwnerRequestConfirmationScreen
**Назначение:** Экран подтверждения заявки на бронирование

**Показывается для:** Заявки со статусом 'awaiting'

**Действия:**
- `@confirm` → `handleOwnerRequestConfirm()` → статус 'confirmed'
- `@decline` → переход на `OwnerRequestDeclineScreen`
- `@back` → возврат на главный экран

---

### OwnerRequestDeclineScreen
**Назначение:** Экран подтверждения отмены бронирования

**Показывается для:** После нажатия "Отклонить" на экране подтверждения

**Действия:**
- `@decline-booking` → `handleOwnerRequestDecline()` → статус 'cancelled' + переход в чат
- `@go-back` → возврат на `OwnerRequestConfirmationScreen`

**Особенности:**
- Автоматическая прокрутка вверх при открытии (`onMounted`)

---

### OwnerBookingConfirmedScreen
**Назначение:** Финальный экран с подтверждением бронирования

**Показывается для:** 
- Заявки со статусом 'confirmed' (после подтверждения)
- Заявки со статусом 'active' (активная аренда)

**Действия:**
- `@ok` → возврат на главный экран
- `@go-home` → возврат на главный экран
- `@open-chat` → открыть чат с арендатором (статус: "Подтверждено")

**Особенности:**
- Показывает детали подтверждённого бронирования
- Инструкции "Что дальше?"
- Информация о прибыли владельца

---

### OwnerCompletedBookingScreen
**Назначение:** Экран завершённого бронирования

**Показывается для:** Заявки со статусом 'completed'

**Действия:**
- `@go-home` → возврат на главный экран
- `@open-chat` → открыть чат с арендатором (статус: "Завершено")

---

## Интеграция с чатом

### Настройка данных чата при отмене
При отмене заявки автоматически настраиваются данные для чата:
- `selectedChatName` = имя арендатора
- `selectedChatBooking.status` = "Отменено"
- Переход в чат с историей отмены

### Настройка данных чата при подтверждении
При открытии чата из экрана подтверждения:
- `selectedChatName` = имя арендатора
- `selectedChatBooking.status` = "Подтверждено"

### Настройка данных чата при завершении
При открытии чата из экрана завершённого бронирования:
- `selectedChatName` = имя арендатора
- `selectedChatBooking.status` = "Завершено"

---

## Отображение на главном экране

### HomeScreen - раздел "Сдача мест"

**Фильтр:** "Сдача мест" (sharing)

**Отображение заявок:**
- Все заявки из `ownerRequests` отображаются в списке активности
- Каждая заявка показывает:
  - Заголовок: "Заявка на ваше место"
  - Адрес парковочного места
  - Период аренды (дата и время)
  - Мета-информация: имя клиента
  - Статус с соответствующим цветом

**Функция отображения статуса:**
```typescript
const getStatusLabel = (status: string, type: 'ownerRequest'): string => {
  switch (status) {
    case 'awaiting': return 'Ожидает подтверждения'
    case 'cancelled': return 'Отменено'
    case 'confirmed': return 'Ожидает начала аренды'
    case 'active': return 'Активное'
    case 'completed': return 'Завершено'
    default: return 'Ожидает подтверждения'
  }
}
```

**Цвета статусов:**
- `'awaiting'`, `'cancelled'` → красный (`#EF4444`)
- `'confirmed'`, `'active'` → зеленый (`#22C55E`)
- `'completed'` → серый (`#4B5563`)

---

## Важные правила

### 1. Порядок действий при отмене
**КРИТИЧЕСКИ ВАЖНО:** При отмене бронирования происходит **2 действия**:
1. **Сначала** показывается экран отмены (`OwnerRequestDeclineScreen`)
2. **Затем** обновляется статус и происходит переход в чат

Это реализовано через:
- Нажатие "Отклонить" на `OwnerRequestConfirmationScreen` → переход на `owner-request-decline`
- Нажатие "Отклонить бронирование" на `OwnerRequestDeclineScreen` → вызов `handleOwnerRequestDecline()` → переход в чат

### 2. Статус после подтверждения
**КРИТИЧЕСКИ ВАЖНО:** После подтверждения бронирования статус устанавливается в `'confirmed'` (Ожидает начала аренды), **НЕ** в `'active'`.

Статус `'active'` используется только для заявок, которые уже начались (аренда в процессе).

### 3. Открытие экрана при клике на карточку
**КРИТИЧЕСКИ ВАЖНО:** При клике на карточку со статусом `'confirmed'` открывается финальный экран с подтверждением (`OwnerBookingConfirmedScreen`), а не экран подтверждения заявки.

### 4. Инициализация данных
Заявки на бронирование инициализируются только для пользователя с телефоном `+79990001122` (владелец парковки).

---

## Тестовые данные

Для тестирования используются следующие заявки (для пользователя `+79990001122`):

1. **owner-req-1**: статус `'awaiting'` - для тестирования подтверждения
2. **owner-req-2**: статус `'cancelled'` - для тестирования отменённых заявок
3. **owner-req-3**: статус `'completed'` - для тестирования завершённых заявок
4. **owner-req-4**: статус `'active'` - для тестирования активных аренд
5. **owner-req-5**: статус `'confirmed'` - для тестирования подтверждённых заявок

---

## Связанные компоненты

- `App.vue` - основная логика обработки заявок
- `HomeScreen.vue` - отображение заявок на главном экране
- `OwnerRequestConfirmationScreen.vue` - экран подтверждения
- `OwnerRequestDeclineScreen.vue` - экран отмены
- `OwnerBookingConfirmedScreen.vue` - финальный экран подтверждения
- `OwnerCompletedBookingScreen.vue` - экран завершённого бронирования
- `ChatScreen.vue` - чат с арендатором

---

## Примечания для разработчиков

1. **Не изменяйте статусы без обновления логики отображения** - каждый статус имеет свою логику обработки
2. **Всегда проверяйте наличие `selectedOwnerRequest`** перед обновлением
3. **Следуйте порядку действий** при отмене (сначала экран, потом обновление статуса)
4. **Используйте правильные цвета** для статусов согласно дизайн-системе
5. **Тестируйте все переходы** между статусами и экранами

