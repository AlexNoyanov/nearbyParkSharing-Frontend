<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

type Participant = 'host' | 'guest'

interface Message {
  id: string
  from: Participant
  text: string
  time: string
  delivered?: boolean
}

type BookingData = {
  address?: string
  date?: string
  time?: string
  price?: string
  status?: string
}

const props = defineProps<{
  contactName?: string
  booking?: BookingData
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const defaultContactName = computed(() => props.contactName ?? 'Елена Смирнова')

// Форматируем дату для отображения
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '15 декабря'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long'
    }).format(date)
  } catch {
    return '15 декабря'
  }
}

// Получаем данные о бронировании
const bookingData = computed(() => ({
  address: props.booking?.address || 'ул. Тверская, 15, Москва',
  date: props.booking?.date ? formatDate(props.booking.date) : '15 декабря',
  time: props.booking?.time || '10:00 - 12:00',
  price: props.booking?.price || '₽160',
  status: props.booking?.status || 'Ожидает подтверждения'
}))

// Проверяем, ожидает ли бронирование подтверждения
const isAwaitingConfirmation = computed(() => {
  const status = bookingData.value.status
  return status === 'Ожидает подтверждения' || status === 'awaiting'
})

// Проверяем, подтверждено ли бронирование
const isConfirmed = computed(() => {
  const status = bookingData.value.status
  return status === 'Подтверждено' || status === 'confirmed' || status === 'completed' || status === 'Активное' || status === 'active'
})

// Проверяем, отменено ли бронирование
const isCancelled = computed(() => {
  const status = bookingData.value.status
  return status === 'Отменено' || status === 'cancelled'
})

const conversation = ref<Message[]>([])

const composerValue = ref('')
const isSubmitting = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const currentTime = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date())

const scrollToBottom = async () => {
  await nextTick()
  const el = messagesContainer.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const handleBack = () => {
  emit('back')
}

const sendMessage = async () => {
  const text = composerValue.value.trim()
  if (!text) {
    return
  }

  isSubmitting.value = true
  composerValue.value = ''

  conversation.value.push({
    id: `m-${conversation.value.length + 1}`,
    from: 'host',
    text,
    time: new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
    delivered: false,
  })

  await scrollToBottom()

  window.setTimeout(() => {
    const lastIndex = conversation.value.length - 1
    if (lastIndex >= 0) {
      const last = conversation.value[lastIndex]
      if (last) {
        last.delivered = true
      }
    }
    isSubmitting.value = false
  }, 900)
}

const handleSubmit = (event: Event) => {
  event.preventDefault()
  if (!isSubmitting.value) {
    void sendMessage()
  }
}

const handleTelegramBack = () => {
  handleBack()
}

onMounted(async () => {
  await scrollToBottom()

  const telegram = window.Telegram?.WebApp
  if (telegram) {
    telegram.expand()
    telegram.BackButton.show()
    telegram.BackButton.onClick(handleTelegramBack)
  }
})

onBeforeUnmount(() => {
  const telegram = window.Telegram?.WebApp
  if (telegram) {
    telegram.BackButton.offClick(handleTelegramBack)
    telegram.BackButton.hide()
  }
})
</script>

<template>
  <section class="chat">
    <header class="chat__header">
      <button type="button" class="chat__back" @click="handleBack" aria-label="Назад">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M12.5 4.167 7.143 9.523a.625.625 0 0 0 0 .884l5.357 5.357" />
        </svg>
      </button>

      <div class="chat__identity">
        <div class="chat__title">{{ defaultContactName }}</div>
        <div class="chat__status">На связи · Сдаёт место на ул. Мира</div>
      </div>

      <div class="chat__header-actions" v-if="false">
        <button type="button" class="chat__action" aria-label="Позвонить">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M5.958 3.292 4.542 4.708c-.658.657-.45 1.798.16 2.787a21.89 21.89 0 0 0 3.803 4.35 21.89 21.89 0 0 0 4.35 3.804c.99.61 2.13.818 2.788.16l1.416-1.416c.41-.41.464-1.037.094-1.505l-1.461-1.82c-.376-.468-1.046-.57-1.544-.23l-1.11.74c-.36.24-.83.236-1.203-.011A15.53 15.53 0 0 1 8.433 8.38c-.247-.374-.251-.844-.011-1.203l.74-1.11c.34-.499.238-1.168-.23-1.544L7.112 3.198c-.469-.37-1.095-.316-1.505.094Z"
            />
          </svg>
        </button>
        <button type="button" class="chat__action" aria-label="Дополнительные действия">
          <svg viewBox="0 0 4 18" aria-hidden="true">
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="9" r="2" />
            <circle cx="2" cy="16" r="2" />
          </svg>
        </button>
      </div>
    </header>

    <section class="chat__meta">
      <article v-if="!isAwaitingConfirmation" class="chat__summary-card">
        <div class="chat__summary-title">Сегодня, 17:40</div>
        <p class="chat__summary-description">Бронь №2418 · Парковка на ул. Мира</p>
      </article>
      <article v-else class="chat__awaiting-message">
        <p class="chat__awaiting-text">Запрос на бронирование отправлен.</p>
        <p class="chat__awaiting-text">Продолжить общение в чате возможно</p>
        <p class="chat__awaiting-text">после подтверждения бронирования</p>
      </article>
    </section>

    <section ref="messagesContainer" class="chat__messages" aria-live="polite">
      <div class="chat__date-divider">
        <span>Сегодня, {{ currentTime }}</span>
      </div>

      <!-- Booking info message -->
      <div class="chat__booking-message">
        <div class="chat__booking-header">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="chat__booking-icon">
            <path d="M0.375 6H13.625C13.8125 6 14 6.1875 14 6.375V14.5C14 15.3438 13.3125 16 12.5 16H1.5C0.65625 16 0 15.3438 0 14.5V6.375C0 6.1875 0.15625 6 0.375 6ZM14 4.625C14 4.84375 13.8125 5 13.625 5H0.375C0.15625 5 0 4.84375 0 4.625V3.5C0 2.6875 0.65625 2 1.5 2H3V0.375C3 0.1875 3.15625 0 3.375 0H4.625C4.8125 0 5 0.1875 5 0.375V2H9V0.375C9 0.1875 9.15625 0 9.375 0H10.625C10.8125 0 11 0.1875 11 0.375V2H12.5C13.3125 2 14 2.6875 14 3.5V4.625Z" fill="white"/>
          </svg>
          <span class="chat__booking-title">Запрос на бронирование</span>
        </div>
        <div class="chat__booking-content">
          <div class="chat__booking-row">
            <span class="chat__booking-label">Место:</span>
            <span class="chat__booking-value">{{ bookingData.address }}</span>
          </div>
          <div class="chat__booking-row">
            <span class="chat__booking-label">Дата:</span>
            <span class="chat__booking-value">{{ bookingData.date }}</span>
          </div>
          <div class="chat__booking-row">
            <span class="chat__booking-label">Время:</span>
            <span class="chat__booking-value">{{ bookingData.time }}</span>
          </div>
          <div class="chat__booking-row">
            <span class="chat__booking-label">Стоимость:</span>
            <span class="chat__booking-value chat__booking-value--price">{{ bookingData.price }}</span>
          </div>
        </div>
        <div class="chat__booking-footer">
          <div class="chat__booking-status-indicator"></div>
          <span class="chat__booking-status">{{ bookingData.status }}</span>
        </div>
      </div>

      <!-- Confirmation banner -->
      <div v-if="isConfirmed" class="chat__confirmation-banner">
        <div class="chat__confirmation-icon">
          <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3125 22.0898L0.585938 12.3633C0 11.7773 0 10.7812 0.585938 10.1953L2.69531 8.08594C3.28125 7.5 4.21875 7.5 4.80469 8.08594L11.4258 14.6484L25.4883 0.585938C26.0742 0 27.0117 0 27.5977 0.585938L29.707 2.69531C30.293 3.28125 30.293 4.27734 29.707 4.86328L12.4805 22.0898C11.8945 22.6758 10.8984 22.6758 10.3125 22.0898Z" fill="white"/>
          </svg>
        </div>
        <span class="chat__confirmation-text">Бронирование подтверждено</span>
      </div>

      <!-- Cancellation banner -->
      <div v-if="isCancelled" class="chat__cancellation-banner">
        <div class="chat__cancellation-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="chat__cancellation-text">Бронирование отменено</span>
      </div>

      <!-- Cancellation payment message -->
      <div v-if="isCancelled" class="chat__cancellation-message">
        <div class="chat__cancellation-message-header">
          <div class="chat__cancellation-message-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.625 7.03125H0.375C0.15625 7.03125 0 6.84375 0 6.65625V0.375C0 0.1875 0.15625 0 0.375 0H1.875C2.0625 0 2.25 0.1875 2.25 0.375V2.84375C3.65625 1.25 5.75 0.25 8.0625 0.28125C12.3438 0.3125 15.75 3.75 15.75 8.03125C15.75 12.3125 12.2812 15.75 8 15.75C6 15.75 4.15625 15 2.78125 13.75C2.625 13.625 2.625 13.375 2.78125 13.2188L3.84375 12.1562C3.96875 12 4.1875 12 4.34375 12.125C5.3125 13 6.59375 13.5 8 13.5C11.0312 13.5 13.5 11.0625 13.5 8C13.5 4.96875 11.0312 2.5 8 2.5C6.15625 2.5 4.5625 3.40625 3.5625 4.78125H6.625C6.8125 4.78125 7 4.9375 7 5.15625V6.65625C7 6.84375 6.8125 7.03125 6.625 7.03125Z" fill="#4B5563"/>
            </svg>
          </div>
          <span class="chat__cancellation-message-title">Возврат средств</span>
        </div>
        <div class="chat__cancellation-message-content">
          <div class="chat__cancellation-message-row">
            <span class="chat__cancellation-message-label">Оплаченная сумма:</span>
            <span class="chat__cancellation-message-value">{{ bookingData.price }}</span>
          </div>
          <div class="chat__cancellation-message-row">
            <span class="chat__cancellation-message-label">Комиссия за отмену:</span>
            <span class="chat__cancellation-message-value chat__cancellation-message-value--fee">₽0</span>
          </div>
          <div class="chat__cancellation-message-row">
            <span class="chat__cancellation-message-label chat__cancellation-message-label--bold">К возврату:</span>
            <span class="chat__cancellation-message-value chat__cancellation-message-value--refund">{{ bookingData.price }}</span>
          </div>
        </div>
        <div class="chat__cancellation-message-separator"></div>
        <div class="chat__cancellation-message-info">
          Средства поступят на вашу карту в течение 3-5 рабочих дней
        </div>
      </div>

      <ul class="chat__message-list">
        <li
          v-for="message in conversation"
          :key="message.id"
          class="chat__message"
          :class="[
            message.from === 'host' ? 'chat__message--outgoing' : 'chat__message--incoming',
          ]"
        >
          <p class="chat__message-text">{{ message.text }}</p>
          <span class="chat__message-meta">
            {{ message.time }}
            <svg
              v-if="message.from === 'host'"
              class="chat__message-status"
              viewBox="0 0 14 10"
              aria-hidden="true"
            >
              <path
                v-if="message.delivered"
                d="M1.667 5.333 4.5 8.167 12.333.833"
              />
              <path v-else d="M1.667 4.417 4.5 7.25 8.917 2.833" />
            </svg>
          </span>
        </li>
      </ul>
    </section>

    <footer class="chat__composer">
      <form class="chat__composer-form" @submit="handleSubmit">
        <label class="chat__composer-field">
          <span class="sr-only">Сообщение</span>
          <textarea
            v-model="composerValue"
            class="chat__composer-input"
            placeholder="Написать сообщение..."
            rows="1"
            :disabled="isAwaitingConfirmation"
            @keydown.enter.exact.prevent="handleSubmit"
          />
        </label>

        <button
          type="submit"
          class="chat__composer-send"
          :disabled="isAwaitingConfirmation"
          aria-label="Отправить сообщение"
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0625 0.3125C15.5938 0 16.2812 0.4375 16.1562 1.0625L13.9062 14.5625C13.8438 15.0625 13.3125 15.3438 12.875 15.1562L9 13.5L7 15.9375C6.5625 16.4688 5.6875 16.1875 5.6875 15.4375V12.9062L13.1875 3.75C13.3438 3.5625 13.0938 3.34375 12.9375 3.5L3.96875 11.4062L0.625 10C0.0625 9.78125 0 8.96875 0.5625 8.65625L15.0625 0.3125Z" fill="white"/>
          </svg>
        </button>
      </form>
    </footer>
  </section>
</template>

<style scoped>
.chat {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
  background: #f8fafc;
  color: #1f2937;
}

.chat__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 20px 20px 16px;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  color: #f8fafc;
  box-shadow: 0 18px 32px -28px rgba(15, 23, 42, 0.5);
  flex-shrink: 0;
}

.chat__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.18);
  color: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.chat__back svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chat__back:hover {
  transform: translateX(-2px);
  border-color: rgba(255, 255, 255, 0.55);
}

.chat__identity {
  display: grid;
  gap: 6px;
}

.chat__title {
  font-size: 16px;
  font-weight: 700;
}

.chat__status {
  font-size: 12px;
  color: rgba(248, 250, 252, 0.8);
}

.chat__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.chat__action {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(15, 23, 42, 0.12);
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.chat__action svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chat__action:nth-child(2) svg {
  stroke: none;
  fill: currentColor;
}

.chat__action:hover {
  transform: scale(1.03);
  border-color: rgba(255, 255, 255, 0.6);
}

.chat__meta {
  display: grid;
  gap: 12px;
  padding: 16px 20px 10px;
  flex-shrink: 0;
}

.chat__summary-card {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 16px 28px -28px rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.chat__summary-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.chat__summary-description {
  margin: 0;
  font-size: 12px;
  color: #4b5563;
}

.chat__awaiting-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 0 16px 28px -28px rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.1);
  text-align: center;
}

.chat__awaiting-text {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  line-height: 1.5;
  text-align: center;
}

.chat__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chat__chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  background: #e5e7eb;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.chat__chip--accent {
  background: rgba(147, 51, 234, 0.12);
  color: #6d28d9;
}

.chat__messages {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 20px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  min-height: 0;
  flex: 1 1 auto;
}

.chat__date-divider {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.chat__date-divider span {
  display: inline-block;
  color: #9CA3AF;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.9;
  text-align: center;
}

.chat__booking-message {
  display: flex;
  flex-direction: column;
  gap: 6.5px;
  padding: 12px 15px 15px;
  margin: 16px auto;
  max-width: 271.5px;
  background: #9333EA;
  border-radius: 24px 8px 24px 24px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  align-self: flex-end;
}

.chat__booking-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 3px;
}

.chat__booking-icon {
  width: 14px;
  height: 16px;
  flex-shrink: 0;
}

.chat__booking-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 11.9px;
  line-height: 2.02;
  color: #ffffff;
}

.chat__booking-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 3px;
}

.chat__booking-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 72px;
}

.chat__booking-row:first-child .chat__booking-value {
  text-align: right;
  white-space: normal;
  word-break: break-word;
}

.chat__booking-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.8px;
  line-height: 2.04;
  color: #FEFCE8;
}

.chat__booking-value {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.8px;
  line-height: 2.04;
  color: #ffffff;
  text-align: right;
}

.chat__booking-value--price {
  font-weight: 700;
  font-size: 7.9px;
  line-height: 2.53;
}

.chat__booking-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10.5px;
  border-top: 1.33px solid rgba(168, 85, 247, 0.3);
}

.chat__booking-status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #FACC15;
  flex-shrink: 0;
}

.chat__booking-status {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.8px;
  line-height: 2.04;
  color: #ffffff;
}

.chat__confirmation-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 16px auto;
  max-width: 271.5px;
  background: #E0EBF7;
  border: 1px solid #80C080;
  border-radius: 9999px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1);
  align-self: center;
  white-space: nowrap;
}

.chat__confirmation-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #33CC33;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat__confirmation-icon svg {
  width: 16px;
  height: 12px;
  display: block;
}

.chat__confirmation-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #338066;
  white-space: nowrap;
}

.chat__cancellation-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 16px auto;
  max-width: 271.5px;
  background: #FCE7F3;
  border: 1px solid #F9A8D4;
  border-radius: 9999px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1);
  align-self: center;
  white-space: nowrap;
}

.chat__cancellation-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #FEE2E2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat__cancellation-icon svg {
  width: 16px;
  height: 16px;
  display: block;
}

.chat__cancellation-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #DC2626;
  white-space: nowrap;
}

.chat__cancellation-message {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  margin: 16px auto;
  max-width: 271.5px;
  background: #ffffff;
  border-radius: 20px;
  border: 2px solid #E5E7EB;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  align-self: flex-end;
}

.chat__cancellation-message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.chat__cancellation-message-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat__cancellation-message-icon svg {
  width: 16px;
  height: 16px;
  display: block;
}

.chat__cancellation-message-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
}

.chat__cancellation-message-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.chat__cancellation-message-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.chat__cancellation-message-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #4B5563;
}

.chat__cancellation-message-label--bold {
  font-weight: 700;
}

.chat__cancellation-message-value {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #1F2937;
  text-align: right;
}

.chat__cancellation-message-value--fee {
  color: #EF4444;
}

.chat__cancellation-message-value--refund {
  font-weight: 700;
  color: #16A34A;
}

.chat__cancellation-message-separator {
  width: 100%;
  height: 1px;
  background: #E5E7EB;
  margin-bottom: 16px;
}

.chat__cancellation-message-info {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.5;
  color: #9CA3AF;
}

.chat__message-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chat__message {
  max-width: 82%;
  padding: 14px 16px;
  border-radius: 18px;
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14.5px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 10px 24px -24px rgba(15, 23, 42, 0.6);
}

.chat__message--incoming {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(148, 163, 184, 0.3);
  align-self: flex-start;
  border-bottom-left-radius: 6px;
}

.chat__message--outgoing {
  background: linear-gradient(135deg, #9333ea, #2563eb);
  color: #f8fafc;
  align-self: flex-end;
  border-bottom-right-radius: 6px;
}

.chat__message-text {
  margin: 0;
}

.chat__message-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: inherit;
  opacity: 0.8;
}

.chat__message-status {
  width: 14px;
  height: 10px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chat__composer {
  padding: 12px 20px calc(env(safe-area-inset-bottom) + 12px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  flex-shrink: 0;
}

.chat__composer-form {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-end;
  gap: 12px;
}

.chat__composer-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  background: #9333ea;
  flex-shrink: 0;
}

.chat__composer-send svg {
  width: 17px;
  height: 17px;
}

.chat__composer-send:disabled {
  background: #9CA3AF;
  opacity: 1;
  cursor: default;
  transform: none;
}

.chat__composer-send:not(:disabled):hover {
  transform: translateY(-1px);
}

.chat__composer-field {
  display: grid;
  align-items: center;
}

.chat__composer-input {
  width: 100%;
  border: none;
  resize: none;
  background: #e5e7eb;
  font: inherit;
  line-height: 1.5;
  max-height: 120px;
  color: #1f2937;
  border-radius: 20px;
  padding: 12px 16px;
}

.chat__composer-input::placeholder {
  color: #9ca3af;
}

.chat__composer-input:focus-visible {
  outline: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 480px) {
  .chat__header {
    padding: 16px 16px 14px;
    gap: 10px;
  }

  .chat__back,
  .chat__action {
    width: 36px;
    height: 36px;
  }

  .chat__meta {
    padding: 12px 16px 8px;
    gap: 10px;
  }

  .chat__summary-card {
    padding: 12px 14px;
  }

  .chat__awaiting-message {
    padding: 12px 14px;
  }

  .chat__messages {
    padding: 0 16px 12px;
    gap: 12px;
  }

  .chat__composer {
    padding: 10px 16px calc(env(safe-area-inset-bottom) + 10px);
  }

  .chat__composer-input {
    padding: 10px 14px;
    font-size: 15px;
  }

  .chat__composer-send {
    width: 36px;
    height: 36px;
  }

  .chat__composer-send svg {
    width: 15px;
    height: 15px;
  }
}
</style>

