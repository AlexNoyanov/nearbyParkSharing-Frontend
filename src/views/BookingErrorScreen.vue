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
      <h1 class="booking-error__title">На эти даты место<br>не доступно</h1>
    </div>

    <!-- What's Next Card -->
    <div class="booking-error__whats-next">
      <h2 class="booking-error__whats-next-title">Что дальше?</h2>
      
      <div class="booking-error__whats-next-item">
        <div class="booking-error__whats-next-icon">
          <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.15234 14C5.16797 14 4.40234 13.2344 4.40234 12.25H7.875C7.875 13.2344 7.10938 14 6.15234 14ZM12.0312 9.92578C12.1953 10.0898 12.2773 10.3086 12.2773 10.5C12.25 10.9648 11.9219 11.375 11.375 11.375H0.902344C0.355469 11.375 0.0273438 10.9648 0.0273438 10.5C0 10.3086 0.0820312 10.0898 0.246094 9.92578C0.765625 9.35156 1.77734 8.50391 1.77734 5.6875C1.77734 3.58203 3.25391 1.88672 5.27734 1.44922V0.875C5.27734 0.410156 5.66016 0 6.15234 0C6.61719 0 7 0.410156 7 0.875V1.44922C9.02344 1.88672 10.5 3.58203 10.5 5.6875C10.5 8.50391 11.5117 9.35156 12.0312 9.92578Z" fill="white"/>
          </svg>
        </div>
        <div class="booking-error__whats-next-text">
          <p class="booking-error__whats-next-line">Необходимо освободить</p>
          <p class="booking-error__whats-next-line">место для предстоящей брони</p>
        </div>
      </div>

      <div class="booking-error__whats-next-item">
        <div class="booking-error__whats-next-icon">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8086 12.1133C14.0547 12.3867 14.0547 12.7969 13.7812 13.043L13.0156 13.8086C12.7695 14.082 12.3594 14.082 12.0859 13.8086L9.37891 11.1016C9.24219 10.9648 9.1875 10.8008 9.1875 10.6367V10.1719C8.20312 10.9375 7 11.375 5.6875 11.375C2.54297 11.375 0 8.83203 0 5.6875C0 2.57031 2.54297 0 5.6875 0C8.80469 0 11.375 2.57031 11.375 5.6875C11.375 7.02734 10.9102 8.23047 10.1719 9.1875H10.6094C10.7734 9.1875 10.9375 9.26953 11.0742 9.37891L13.8086 12.1133ZM5.6875 9.1875C7.60156 9.1875 9.1875 7.62891 9.1875 5.6875C9.1875 3.77344 7.60156 2.1875 5.6875 2.1875C3.74609 2.1875 2.1875 3.77344 2.1875 5.6875C2.1875 7.62891 3.74609 9.1875 5.6875 9.1875Z" fill="white"/>
          </svg>
        </div>
        <div class="booking-error__whats-next-text">
          <p class="booking-error__whats-next-line">Проверьте места рядом для</p>
          <p class="booking-error__whats-next-line">смены места парковки</p>
        </div>
      </div>
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

.booking-error__whats-next {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border-radius: 16px;
  padding: 13.5px 18px 15.51px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  margin: 0 auto;
  max-width: 380px;
  width: calc(100% - 23.25px);
}

.booking-error__whats-next-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.4;
  color: #ffffff;
  text-align: left;
  width: 100%;
}

.booking-error__whats-next-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.booking-error__whats-next-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.booking-error__whats-next-icon svg {
  width: 15px;
  height: 15px;
}

.booking-error__whats-next-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.booking-error__whats-next-line {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #ffffff;
}

.booking-error__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
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
