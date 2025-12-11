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

const props = defineProps<{
  contactName?: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const defaultContactName = computed(() => props.contactName ?? 'Елена Смирнова')

const conversation = ref<Message[]>([
  {
    id: 'm-01',
    from: 'guest',
    text: 'Здравствуйте! Забронировала ваше место на сегодня. Подскажите, ворота открыты автоматически?',
    time: '09:12',
  },
  {
    id: 'm-02',
    from: 'host',
    text: 'Добрый день! Да, открываются по номеру. Для подстраховки пришлю доступ в домофон.',
    time: '09:14',
    delivered: true,
  },
  {
    id: 'm-03',
    from: 'guest',
    text: 'Отлично, спасибо. Буду в 17:40, если нужно — могу написать заранее.',
    time: '09:16',
  },
  {
    id: 'm-04',
    from: 'host',
    text: 'Ок, жду вас. Я буду на связи, если будут уточнения по заезду.',
    time: '09:17',
    delivered: true,
  },
])

const composerValue = ref('')
const isSubmitting = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const todayLabel = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
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

      <div class="chat__header-actions">
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
      <article class="chat__summary-card">
        <div class="chat__summary-title">Сегодня, 17:40</div>
        <p class="chat__summary-description">Бронь №2418 · Парковка на ул. Мира</p>
      </article>
      <div class="chat__chips">
        <span class="chat__chip">Ворота по номеру</span>
        <span class="chat__chip chat__chip--accent">Домофон 2418#</span>
      </div>
    </section>

    <section ref="messagesContainer" class="chat__messages" aria-live="polite">
      <div class="chat__date-divider">
        <span>Сегодня · {{ todayLabel }}</span>
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
        <button type="button" class="chat__composer-attach" aria-label="Прикрепить файл">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M6.5 8.75v4.375a3.125 3.125 0 0 0 6.25 0V7.5c0-1.035-.84-1.875-1.875-1.875s-1.875.84-1.875 1.875v5a.625.625 0 0 0 1.25 0v-5a.625.625 0 1 1 1.25 0v5.625a1.875 1.875 0 0 1-3.75 0V7.5a3.125 3.125 0 0 1 6.25 0v5.625a4.375 4.375 0 0 1-8.75 0V8.75"
            />
          </svg>
        </button>

        <label class="chat__composer-field">
          <span class="sr-only">Сообщение</span>
          <textarea
            v-model="composerValue"
            class="chat__composer-input"
            placeholder="Напишите сообщение"
            rows="1"
            @keydown.enter.exact.prevent="handleSubmit"
          />
        </label>

        <button
          type="submit"
          class="chat__composer-send"
          :disabled="isSubmitting || !composerValue.trim()"
          aria-label="Отправить сообщение"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m3.125 16.875 14.375-6.25L3.125 4.375l1.875 6.25-1.875 6.25Z" />
            <path d="m5 10.625 1.875 1.25-.625 3.125 3.125-3.125L5 10.625Z" />
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
  min-height: 100vh;
  background: #f8fafc;
  color: #1f2937;
}

.chat__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 20px;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  color: #f8fafc;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 18px 32px -28px rgba(15, 23, 42, 0.5);
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
  font-size: 17px;
  font-weight: 700;
}

.chat__status {
  font-size: 13px;
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
  gap: 16px;
  padding: 20px 24px 12px;
}

.chat__summary-card {
  display: grid;
  gap: 6px;
  padding: 18px 20px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 28px -28px rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.chat__summary-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.chat__summary-description {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}

.chat__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chat__chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 9999px;
  background: #e5e7eb;
  font-size: 12.5px;
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
  gap: 18px;
  padding: 0 24px 24px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat__date-divider {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.chat__date-divider span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(79, 70, 229, 0.08);
  color: #4338ca;
  font-size: 12.5px;
  font-weight: 600;
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
  padding: 16px 24px calc(env(safe-area-inset-bottom) + 20px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

.chat__composer-form {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-end;
  gap: 14px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  padding: 12px 16px;
  box-shadow: 0 18px 28px -26px rgba(15, 23, 42, 0.35);
}

.chat__composer-attach,
.chat__composer-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}

.chat__composer-attach svg,
.chat__composer-send svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chat__composer-send {
  background: linear-gradient(135deg, #9333ea, #2563eb);
  color: #ffffff;
  box-shadow: 0 12px 24px -18px rgba(79, 70, 229, 0.7);
}

.chat__composer-send svg {
  fill: currentColor;
  stroke: none;
}

.chat__composer-send:disabled {
  opacity: 0.5;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.chat__composer-attach:hover,
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
  background: transparent;
  font: inherit;
  line-height: 1.5;
  max-height: 120px;
  color: #1f2937;
}

.chat__composer-input::placeholder {
  color: #94a3b8;
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
    padding: 20px 20px 18px;
    gap: 12px;
  }

  .chat__meta {
    padding: 18px 20px 12px;
  }

  .chat__messages {
    padding: 0 20px 20px;
  }

  .chat__composer {
    padding: 14px 16px calc(env(safe-area-inset-bottom) + 16px);
  }
}
</style>

