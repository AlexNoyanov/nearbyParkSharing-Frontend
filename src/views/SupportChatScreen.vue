<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { supportChatApi, type SupportTurn } from '../services/supportChatApi'

type ChatLine = {
  id: string
  from: 'user' | 'support'
  text: string
  time: string
  sources?: string[]
  pending?: boolean
}

const emit = defineEmits<{
  (e: 'back'): void
}>()

const suggestions = [
  'Что делать, если место занято?',
  'Как отменить бронь?',
  'Как сдать своё место?',
]

const lines = ref<ChatLine[]>([
  {
    id: 'welcome',
    from: 'support',
    text: 'Здравствуйте. Я отвечаю по базе знаний ParkShare: бронь, оплата, отмена и сдача места.',
    time: clock(),
  },
])
const draft = ref('')
const sending = ref(false)
const modelReady = ref<boolean | null>(null)
const scroller = ref<HTMLElement | null>(null)

const statusText = computed(() => {
  if (modelReady.value === true) return 'На связи · локальная модель'
  if (modelReady.value === false) return 'На связи · база знаний'
  return 'На связи'
})

function clock() {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

async function scrollDown() {
  await nextTick()
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
}

function history(): SupportTurn[] {
  return lines.value
    .filter((line) => line.id !== 'welcome' && !line.pending)
    .map((line) => ({
      role: line.from === 'user' ? 'user' : 'assistant',
      content: line.text,
    }))
}

async function send(text: string) {
  const message = text.trim()
  if (!message || sending.value) return
  sending.value = true
  draft.value = ''
  lines.value.push({ id: `u-${Date.now()}`, from: 'user', text: message, time: clock() })
  const pendingId = `p-${Date.now()}`
  lines.value.push({ id: pendingId, from: 'support', text: 'Смотрю базу знаний…', time: clock(), pending: true })
  await scrollDown()
  try {
    const answer = await supportChatApi.ask(message, history().slice(0, -1))
    const pending = lines.value.find((line) => line.id === pendingId)
    if (pending) {
      pending.text = answer.reply
      pending.sources = answer.sources
      pending.pending = false
      pending.time = clock()
    }
    modelReady.value = answer.mode === 'ollama'
  } catch {
    const pending = lines.value.find((line) => line.id === pendingId)
    if (pending) {
      pending.text = 'Сейчас не получилось ответить. Проверьте, что на этом компьютере запущена поддержка, и спросите ещё раз.'
      pending.pending = false
    }
  } finally {
    sending.value = false
    await scrollDown()
  }
}

function onSubmit(event: Event) {
  event.preventDefault()
  void send(draft.value)
}

onMounted(async () => {
  try {
    const health = await supportChatApi.health()
    modelReady.value = health.mode === 'ollama'
  } catch {
    modelReady.value = false
  }
  await scrollDown()
})
</script>

<template>
  <section class="support-chat">
    <header class="support-chat__header">
      <button type="button" class="support-chat__back" aria-label="Назад" @click="emit('back')">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M11 4 6 9l5 5" />
        </svg>
      </button>
      <div class="support-chat__identity">
        <div class="support-chat__title">ИИ-техподдержка</div>
        <div class="support-chat__status">{{ statusText }}</div>
      </div>
    </header>

    <section ref="scroller" class="support-chat__messages" aria-live="polite">
      <ul class="support-chat__list">
        <li
          v-for="line in lines"
          :key="line.id"
          class="support-chat__message"
          :class="line.from === 'user' ? 'support-chat__message--outgoing' : 'support-chat__message--incoming'"
        >
          <p class="support-chat__text">{{ line.text }}</p>
          <span v-if="line.sources?.length" class="support-chat__sources">По базе: {{ line.sources.join(', ') }}</span>
          <span class="support-chat__meta">{{ line.time }}</span>
        </li>
      </ul>
    </section>

    <footer class="support-chat__composer">
      <div v-if="lines.length < 3" class="support-chat__suggestions">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          class="support-chat__chip"
          :disabled="sending"
          @click="send(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
      <form class="support-chat__form" @submit="onSubmit">
        <label class="support-chat__field">
          <span class="sr-only">Сообщение</span>
          <textarea
            v-model="draft"
            class="support-chat__input"
            rows="1"
            placeholder="Написать в поддержку..."
            :disabled="sending"
            @keydown.enter.exact.prevent="onSubmit"
          />
        </label>
        <button type="submit" class="support-chat__send" :disabled="sending || !draft.trim()" aria-label="Отправить">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0625 0.3125C15.5938 0 16.2812 0.4375 16.1562 1.0625L13.9062 14.5625C13.8438 15.0625 13.3125 15.3438 12.875 15.1562L9 13.5L7 15.9375C6.5625 16.4688 5.6875 16.1875 5.6875 15.4375V12.9062L13.1875 3.75C13.3438 3.5625 13.0938 3.34375 12.9375 3.5L3.96875 11.4062L0.625 10C0.0625 9.78125 0 8.96875 0.5625 8.65625L15.0625 0.3125Z" fill="white"/>
          </svg>
        </button>
      </form>
    </footer>
  </section>
</template>

<style scoped>
.support-chat {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  background: #f8fafc;
  color: #1f2937;
}

.support-chat__header {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 16px;
  padding: calc(env(safe-area-inset-top) + 16px) 20px 16px;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  color: #f8fafc;
}

.support-chat__back {
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
}

.support-chat__back svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.support-chat__title {
  font-size: 16px;
  font-weight: 700;
}

.support-chat__status {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(248, 250, 252, 0.8);
}

.support-chat__messages {
  overflow-y: auto;
  padding: 16px 20px;
}

.support-chat__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.support-chat__message {
  max-width: 82%;
  padding: 14px 16px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14.5px;
  line-height: 1.5;
  word-break: break-word;
}

.support-chat__message--incoming {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(148, 163, 184, 0.3);
  align-self: flex-start;
  border-bottom-left-radius: 6px;
}

.support-chat__message--outgoing {
  background: linear-gradient(135deg, #9333ea, #2563eb);
  color: #f8fafc;
  align-self: flex-end;
  border-bottom-right-radius: 6px;
}

.support-chat__text,
.support-chat__sources {
  margin: 0;
}

.support-chat__sources,
.support-chat__meta {
  font-size: 11.5px;
  opacity: 0.75;
}

.support-chat__composer {
  padding: 12px 20px calc(env(safe-area-inset-bottom) + 12px);
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

.support-chat__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.support-chat__chip {
  border: 1px solid rgba(147, 51, 234, 0.25);
  background: #f5f3ff;
  color: #6d28d9;
  border-radius: 999px;
  padding: 8px 12px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.support-chat__chip:disabled {
  opacity: 0.6;
  cursor: default;
}

.support-chat__form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: flex-end;
}

.support-chat__input {
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

.support-chat__input:focus-visible {
  outline: none;
}

.support-chat__send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: #9333ea;
}

.support-chat__send:disabled {
  background: #9ca3af;
  cursor: default;
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
</style>
