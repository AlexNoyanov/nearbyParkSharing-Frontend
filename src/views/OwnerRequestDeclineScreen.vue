<script setup lang="ts">
import { onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'decline-booking'): void
  (e: 'go-back'): void
}>()

onMounted(() => {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
})

const handleDecline = () => {
  // Эмитим событие отмены, которое обновит статус и перейдет в чат
  emit('decline-booking')
}
</script>

<template>
  <section class="owner-decline">
    <div class="owner-decline__content">
      <!-- Decline Icon -->
      <div class="owner-decline__icon-wrapper">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4141 10.4883L20.2734 16.4062C21.0352 17.1094 21.0352 18.2812 20.2734 18.9844L18.9844 20.2734C18.2812 21.0352 17.1094 21.0352 16.4062 20.2734L10.5469 14.4141L4.62891 20.2734C3.92578 21.0352 2.75391 21.0352 2.05078 20.2734L0.761719 18.9844C0 18.2812 0 17.1094 0.761719 16.4062L6.62109 10.4883L0.761719 4.62891C0 3.92578 0 2.75391 0.761719 2.05078L2.05078 0.761719C2.75391 0 3.92578 0 4.62891 0.761719L10.5469 6.62109L16.4062 0.761719C17.1094 0 18.2812 0 18.9844 0.761719L20.2734 2.05078C21.0352 2.75391 21.0352 3.92578 20.2734 4.62891L14.4141 10.4883Z" fill="white"/>
        </svg>
      </div>

      <!-- Decline Message -->
      <h1 class="owner-decline__title">Бронирование<br>будет отклонено</h1>
    </div>

    <!-- Buttons -->
    <footer class="owner-decline__footer">
      <button type="button" class="owner-decline__button owner-decline__button--decline" @click="handleDecline">
        Отклонить бронирование
      </button>
      <button type="button" class="owner-decline__button owner-decline__button--back" @click="emit('go-back')">
        Вернуться и согласовать запрос
      </button>
    </footer>
  </section>
</template>

<style scoped>
.owner-decline {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  padding: calc(env(safe-area-inset-top) + 20px) 24px calc(40px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  position: relative;
  justify-content: flex-start;
  overflow: hidden;
  gap: 120px;
}

.owner-decline__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  flex: 0 0 auto;
  padding: 60px 0 0;
  margin-bottom: 0;
}

.owner-decline__icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366F1 0%, #6366F1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.owner-decline__icon-wrapper svg {
  width: 22px;
  height: 22px;
}

.owner-decline__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #ffffff;
  max-width: 300px;
}

.owner-decline__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  flex-shrink: 0;
  flex: 0 0 auto;
}

.owner-decline__button {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #6366F1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.owner-decline__button:hover {
  background: #F3F4F6;
}

.owner-decline__button:active {
  transform: scale(0.98);
}

@media (min-width: 768px) {
  .owner-decline {
    padding: calc(env(safe-area-inset-top) + 32px) 48px calc(32px + env(safe-area-inset-bottom));
  }

  .owner-decline__content {
    padding: 60px 0 80px;
  }

  .owner-decline__icon-wrapper {
    width: 100px;
    height: 100px;
    margin-bottom: 32px;
  }

  .owner-decline__icon-wrapper svg {
    width: 28px;
    height: 28px;
  }

  .owner-decline__title {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .owner-decline__footer {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
