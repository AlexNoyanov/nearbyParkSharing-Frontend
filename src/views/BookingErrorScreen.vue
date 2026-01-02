<script setup lang="ts">
import { onMounted, nextTick } from 'vue'

const emit = defineEmits<{
  (e: 'ok'): void
}>()

onMounted(async () => {
  await nextTick()
  // Scroll to top when component is mounted
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
  // Also scroll window to top
  window.scrollTo(0, 0)
})
</script>

<template>
  <section class="booking-error">
    <div class="booking-error__content">
      <!-- Error Icon -->
      <div class="booking-error__icon-wrapper">
        <div class="booking-error__icon-inner">
          <svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.8516 31.5703C42.1172 33.8203 40.5 36.5625 37.8984 36.5625H4.21875C1.61719 36.5625 0 33.75 1.26562 31.5703L18.1406 2.25C19.4062 0 22.7109 0.0703125 23.9766 2.25L40.8516 31.5703ZM21.0938 25.4531C19.2656 25.4531 17.8594 26.9297 17.8594 28.6875C17.8594 30.5156 19.2656 31.9219 21.0938 31.9219C22.8516 31.9219 24.3281 30.5156 24.3281 28.6875C24.3281 26.9297 22.8516 25.4531 21.0938 25.4531ZM18 13.8516L18.4922 23.4141C18.5625 23.9062 18.9141 24.1875 19.3359 24.1875H22.7812C23.2031 24.1875 23.5547 23.9062 23.625 23.4141L24.1172 13.8516C24.1875 13.3594 23.7656 12.9375 23.2734 12.9375H18.8438C18.3516 12.9375 17.9297 13.3594 18 13.8516Z" fill="#DC2626"/>
          </svg>
        </div>
      </div>

      <!-- Error Message -->
      <h1 class="booking-error__title">На эти даты место<br>уже не доступно</h1>
    </div>

    <!-- Button -->
    <footer class="booking-error__footer">
      <button type="button" class="booking-error__button" @click="emit('ok')">
        Ок
      </button>
    </footer>
  </section>
</template>

<style scoped>
.booking-error {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  padding: calc(env(safe-area-inset-top) + 40px) 24px 0;
  box-sizing: border-box;
  position: relative;
  justify-content: center;
  overflow: hidden;
  gap: 60px;
}

.booking-error__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  padding: 0;
}

.booking-error__icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  padding: 8px;
  box-sizing: border-box;
}

.booking-error__icon-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.booking-error__icon-wrapper svg {
  width: 43px;
  height: 37px;
}

.booking-error__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #ffffff;
  max-width: 300px;
}

.booking-error__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 0;
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
  margin-top: 0;
  flex-shrink: 0;
  flex: 0 0 auto;
}

.booking-error__button {
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
  color: #DC2626;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-error__button:hover {
  background: #FEE2E2;
}

.booking-error__button:active {
  transform: scale(0.98);
}

@media (min-width: 768px) {
  .booking-error {
    padding: calc(env(safe-area-inset-top) + 32px) 48px calc(32px + env(safe-area-inset-bottom));
  }

  .booking-error__content {
    padding: 60px 0 80px;
  }

  .booking-error__icon-wrapper {
    width: 100px;
    height: 100px;
    margin-bottom: 32px;
  }

  .booking-error__icon-wrapper svg {
    width: 60px;
    height: 60px;
  }

  .booking-error__title {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .booking-error__footer {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
