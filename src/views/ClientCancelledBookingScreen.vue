<script setup lang="ts">
import { onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'go-home'): void
}>()

onMounted(() => {
  window.scrollTo(0, 0)
  const contentElement = document.querySelector('.app__content')
  if (contentElement) {
    contentElement.scrollTo(0, 0)
  }
})
</script>

<template>
  <section class="client-cancelled">
    <div class="client-cancelled__container">
      <!-- Content -->
      <div class="client-cancelled__content">
        <!-- Large icon with X -->
        <div class="client-cancelled__icon-wrapper">
          <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.4141 10.4883L20.2734 16.4062C21.0352 17.1094 21.0352 18.2812 20.2734 18.9844L18.9844 20.2734C18.2812 21.0352 17.1094 21.0352 16.4062 20.2734L10.5469 14.4141L4.62891 20.2734C3.92578 21.0352 2.75391 21.0352 2.05078 20.2734L0.761719 18.9844C0 18.2812 0 17.1094 0.761719 16.4062L6.62109 10.4883L0.761719 4.62891C0 3.92578 0 2.75391 0.761719 2.05078L2.05078 0.761719C2.75391 0 3.92578 0 4.62891 0.761719L10.5469 6.62109L16.4062 0.761719C17.1094 0 18.2812 0 18.9844 0.761719L20.2734 2.05078C21.0352 2.75391 21.0352 3.92578 20.2734 4.62891L14.4141 10.4883Z" fill="white"/>
          </svg>
        </div>
        
        <!-- Title -->
        <div class="client-cancelled__title-section">
          <h1 class="client-cancelled__title">Бронирование</h1>
          <h2 class="client-cancelled__subtitle">отклонено</h2>
        </div>

        <!-- What's next card -->
        <div class="client-cancelled__next-steps-card">
          <h3 class="client-cancelled__next-steps-title">Что дальше?</h3>
          
          <div class="client-cancelled__steps-list">
            <!-- Step 1 -->
            <div class="client-cancelled__step">
              <div class="client-cancelled__step-icon">
                <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.15234 14C5.16797 14 4.40234 13.2344 4.40234 12.25H7.875C7.875 13.2344 7.10938 14 6.15234 14ZM12.0312 9.92578C12.1953 10.0898 12.2773 10.3086 12.2773 10.5C12.25 10.9648 11.9219 11.375 11.375 11.375H0.902344C0.355469 11.375 0.0273438 10.9648 0.0273438 10.5C0 10.3086 0.0820312 10.0898 0.246094 9.92578C0.765625 9.35156 1.77734 8.50391 1.77734 5.6875C1.77734 3.58203 3.25391 1.88672 5.27734 1.44922V0.875C5.27734 0.410156 5.66016 0 6.15234 0C6.61719 0 7 0.410156 7 0.875V1.44922C9.02344 1.88672 10.5 3.58203 10.5 5.6875C10.5 8.50391 11.5117 9.35156 12.0312 9.92578Z" fill="white"/>
                </svg>
              </div>
              <p class="client-cancelled__step-text">Арендатор получит сообщение об отмене</p>
            </div>

            <!-- Step 2 -->
            <div class="client-cancelled__step">
              <div class="client-cancelled__step-icon">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8086 12.1133C14.0547 12.3867 14.0547 12.7969 13.7812 13.043L13.0156 13.8086C12.7695 14.082 12.3594 14.082 12.0859 13.8086L9.37891 11.1016C9.24219 10.9648 9.1875 10.8008 9.1875 10.6367V10.1719C8.20312 10.9375 7 11.375 5.6875 11.375C2.54297 11.375 0 8.83203 0 5.6875C0 2.57031 2.54297 0 5.6875 0C8.80469 0 11.375 2.57031 11.375 5.6875C11.375 7.02734 10.9102 8.23047 10.1719 9.1875H10.6094C10.7734 9.1875 10.9375 9.26953 11.0742 9.37891L13.8086 12.1133ZM5.6875 9.1875C7.60156 9.1875 9.1875 7.62891 9.1875 5.6875C9.1875 3.77344 7.60156 2.1875 5.6875 2.1875C3.74609 2.1875 2.1875 3.77344 2.1875 5.6875C2.1875 7.62891 3.74609 9.1875 5.6875 9.1875Z" fill="white"/>
                </svg>
              </div>
              <p class="client-cancelled__step-text">Мы вернем предоплату на карту в течение 3-х дней</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Ok button -->
      <div class="client-cancelled__footer">
        <button type="button" class="client-cancelled__ok-button" @click="emit('go-home')">
          Ок
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.client-cancelled {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  padding: 0;
}

.client-cancelled__container {
  width: 100%;
  max-width: 428px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
}

.client-cancelled__content {
  flex: 1;
  padding: 60px 24px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  position: relative;
  justify-content: flex-start;
}

.client-cancelled__icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.client-cancelled__icon-wrapper svg {
  width: 66px;
  height: 66px;
  display: block;
  flex-shrink: 0;
}

.client-cancelled__title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.client-cancelled__title {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.client-cancelled__subtitle {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.client-cancelled__next-steps-card {
  width: 100%;
  max-width: 380px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.client-cancelled__next-steps-title {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
  color: #ffffff;
  margin: 0;
  text-align: center;
}

.client-cancelled__steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.client-cancelled__step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.client-cancelled__step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-cancelled__step-icon svg {
  width: auto;
  height: auto;
  display: block;
}

.client-cancelled__step:first-child .client-cancelled__step-icon svg {
  width: 13px;
  height: 14px;
}

.client-cancelled__step:last-child .client-cancelled__step-icon svg {
  width: 15px;
  height: 15px;
}

.client-cancelled__step-text {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #ffffff;
  margin: 0;
  flex: 1;
  padding-top: 4px;
}

.client-cancelled__footer {
  padding: 24px;
  background: transparent;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.client-cancelled__ok-button {
  width: 100%;
  max-width: 380px;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  background: #ffffff;
  color: #EF4444;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.client-cancelled__ok-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.client-cancelled__ok-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
  .client-cancelled__container {
    max-width: 100%;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .client-cancelled {
    padding: 0;
  }

  .client-cancelled__content {
    padding: 40px 20px 20px;
  }

  .client-cancelled__icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .client-cancelled__icon-wrapper svg {
    width: 20px;
    height: 20px;
  }

  .client-cancelled__title,
  .client-cancelled__subtitle {
    font-size: 28px;
  }

  .client-cancelled__next-steps-card {
    padding: 20px;
    max-width: 100%;
  }

  .client-cancelled__footer {
    padding: 20px;
  }

  .client-cancelled__ok-button {
    max-width: 100%;
  }
}
</style>
