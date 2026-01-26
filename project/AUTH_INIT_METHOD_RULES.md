# Правила работы метода initCallCheck для получения номера для регистрации

## ⚠️ КРИТИЧЕСКИ ВАЖНО - НЕ ИЗМЕНЯТЬ БЕЗ ЯВНОГО ЗАПРОСА

Этот документ описывает **фиксированную логику** метода `initCallCheck` в файле `src/services/authApi.ts`. 
Данная логика **НЕ ДОЛЖНА** изменяться Cursor AI без явного запроса пользователя.

## Текущая рабочая логика метода initCallCheck

### Файл: `src/services/authApi.ts`
### Метод: `async initCallCheck(initData: string, phoneNumber: string, name?: string): Promise<CallCheckInitResponse>`

### 1. API Endpoint (ЖЕСТКО ЗАКОДИРОВАН)

```typescript
const API_URL = 'https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/api/v1/auth/call-check/init'
```

**КРИТИЧЕСКИ ВАЖНО:**
- URL **ВСЕГДА** жестко закодирован - НЕ использовать переменные окружения
- URL **НЕ ДОЛЖЕН** меняться в зависимости от режима (DEV/PROD)
- URL **НЕ ДОЛЖЕН** использовать прокси или условную логику
- Это **РЕАЛЬНЫЙ API сервер** - использовать во ВСЕХ окружениях

### 2. Обработка initData

```typescript
let finalInitData = initData && initData.trim() ? initData.trim() : ''

// ТОЛЬКО в DEV режиме для локального тестирования
if (!finalInitData && import.meta.env.DEV) {
  console.warn('[AuthAPI] DEV MODE: Using fallback initData for local testing')
  finalInitData = DEV_FALLBACK_INIT_DATA
}
```

**КРИТИЧЕСКИ ВАЖНО:**
- Использовать реальный `initData` из Telegram Mini App
- Fallback использовать **ТОЛЬКО** если `import.meta.env.DEV === true` И `initData` пустой
- В production **НИКОГДА** не использовать fallback

### 3. Обработка phoneNumber

```typescript
let finalPhoneNumber = (phoneNumber && phoneNumber.trim()) ? phoneNumber.trim() : ''

// Удалить все нецифровые символы
finalPhoneNumber = finalPhoneNumber.replace(/\D/g, '')

// Для российских номеров: если 10 цифр без префикса 7, добавить 7
if (finalPhoneNumber.length === 10 && !finalPhoneNumber.startsWith('7')) {
  finalPhoneNumber = '7' + finalPhoneNumber
}

// Убрать + если присутствует
if (finalPhoneNumber.startsWith('+')) {
  finalPhoneNumber = finalPhoneNumber.substring(1)
}
```

**КРИТИЧЕСКИ ВАЖНО:**
- Удалять все нецифровые символы
- Автоматически добавлять префикс `7` для 10-значных российских номеров
- Убрать `+` если присутствует
- Итоговый формат: только цифры (например: `79991234567`)

### 4. Обработка name

```typescript
const finalName = (name && name.trim()) ? name.trim() : ''
```

**КРИТИЧЕСКИ ВАЖНО:**
- Обязательное поле для сервера
- Простая трим-обработка

### 5. Валидация

```typescript
// Проверка initData
if (!finalInitData || finalInitData.trim().length === 0) {
  throw new Error('initData is empty. The app must be opened through Telegram Mini App to get authentication data.')
}

// Проверка phoneNumber
if (!finalPhoneNumber || finalPhoneNumber.length < 10) {
  throw new Error('phoneNumber is empty or invalid. It must come from the user registration phone field.')
}

// Проверка name
if (!finalName) {
  throw new Error('name is empty. It must come from the user registration name field.')
}
```

### 6. Формирование Request Body (СОГЛАСНО SWAGGER)

**КРИТИЧЕСКИ ВАЖНО:** Формат запроса должен строго соответствовать Swagger документации:
https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/swagger-ui/index.html#/Авторизация/initCall

Схема `PhoneRequest` содержит **ТОЛЬКО** три поля:
- `initData` (string, обязательное)
- `phoneNumber` (string, обязательное)
- `name` (string, обязательное)

```typescript
const requestBody: { initData: string; phoneNumber: string; name: string } = {
  initData: finalInitData,
  phoneNumber: finalPhoneNumber,
  name: finalName
}
```

**ЗАПРЕЩЕНО:**
- ❌ Добавлять поле `auth_date` в body (оно уже есть в `initData`)
- ❌ Добавлять любые другие поля
- ❌ Изменять названия полей
- ❌ Изменять типы полей

### 7. Fetch Options

```typescript
const fetchOptions: RequestInit = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(requestBody),
  mode: 'cors',
  credentials: 'omit',
}
```

**КРИТИЧЕСКИ ВАЖНО:**
- `mode: 'cors'` - обязательно для кросс-доменных запросов
- `credentials: 'omit'` - не отправлять cookies для избежания CORS preflight
- `Content-Type: 'application/json'` - обязательно

### 8. Обработка ответа

API возвращает:
```json
{
  "prettyPhone": "+7 (800) 555-35-35",
  "rawPhone": "78005553535"
}
```

Или старый формат:
```json
{
  "callToNumber": "79001112233"
}
```

Метод должен обработать оба формата и преобразовать к единому виду:
```typescript
{
  prettyPhone: string,
  rawPhone: string,
  callToNumber: string
}
```

## Правила для Cursor AI

### ✅ РАЗРЕШЕНО:
- Добавление дополнительного логирования (console.log)
- Улучшение сообщений об ошибках
- Оптимизация существующего кода без изменения логики
- Исправление явных багов

### ❌ ЗАПРЕЩЕНО (только с явным запросом пользователя):
- Изменение URL API endpoint
- Изменение формата request body (добавление/удаление полей)
- Изменение логики обработки `initData`
- Изменение логики обработки `phoneNumber`
- Изменение логики обработки `name`
- Использование переменных окружения для URL
- Использование прокси или условной логики для выбора API
- Изменение headers запроса
- Изменение fetch options (mode, credentials)
- Удаление или изменение валидации

### Перед любым изменением:
1. **ОБЯЗАТЕЛЬНО** спросить у пользователя разрешение
2. Объяснить **ПОЧЕМУ** нужно изменить
3. Показать **ЧТО ИМЕННО** будет изменено
4. Убедиться, что изменение не сломает существующую рабочую логику

## История изменений

### 2025-01-18: Установка финальной версии
- Жестко закодирован URL API
- Удалено поле `auth_date` из body (согласно Swagger документации)
- Установлена обработка `phoneNumber` с автоматическим добавлением префикса `7`
- Формат запроса соответствует схеме `PhoneRequest` из Swagger

## Swagger документация

API Endpoint: `/api/v1/auth/call-check/init`
Swagger UI: https://test-app-iuwehfvnlw23275vb.koalanearby.com/parkshare/swagger-ui/index.html#/Авторизация/initCall

Схема запроса: `PhoneRequest`
- `initData*` (string, обязательное, ≥ 1 characters)
- `phoneNumber*` (string, обязательное, ≥ 1 characters)
- `name*` (string, обязательное, ≥ 1 characters)

Схема ответа: `CallCheckResponse`
- `prettyPhone` (string) - форматированный номер для отображения
- `rawPhone` (string) - номер только цифры для использования в tel: ссылке

## Примечания

Этот метод является критически важным для регистрации пользователей через Telegram Mini App.
Любые изменения могут сломать процесс регистрации. Будьте осторожны!
