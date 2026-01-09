<script setup lang="ts">
import { onMounted } from 'vue'

defineProps<{
  request: {
    id: string
    address: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    renterName: string
    status: 'awaiting' | 'cancelled' | 'completed' | 'active' | 'confirmed'
  }
}>()

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
  <section class="owner-cancelled">
    <!-- Header -->
    <header class="owner-cancelled__header">
      <button type="button" class="owner-cancelled__back-button" @click="emit('go-home')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L6 8L10 4" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="owner-cancelled__header-title">Запрос на бронирование</h1>
    </header>

    <!-- Content -->
    <div class="owner-cancelled__content">
      <div class="owner-cancelled__status-section">
        <!-- Red circle with X icon -->
        <div class="owner-cancelled__icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.4141 10.4883L20.2734 16.4062C21.0352 17.1094 21.0352 18.2812 20.2734 18.9844L18.9844 20.2734C18.2812 21.0352 17.1094 21.0352 16.4062 20.2734L10.5469 14.4141L4.62891 20.2734C3.92578 21.0352 2.75391 21.0352 2.05078 20.2734L0.761719 18.9844C0 18.2812 0 17.1094 0.761719 16.4062L6.62109 10.4883L0.761719 4.62891C0 3.92578 0 2.75391 0.761719 2.05078L2.05078 0.761719C2.75391 0 3.92578 0 4.62891 0.761719L10.5469 6.62109L16.4062 0.761719C17.1094 0 18.2812 0 18.9844 0.761719L20.2734 2.05078C21.0352 2.75391 21.0352 3.92578 20.2734 4.62891L14.4141 10.4883Z" fill="white"/>
          </svg>
        </div>
        
        <!-- Title -->
        <div class="owner-cancelled__title-section">
          <h2 class="owner-cancelled__subtitle">Бронирование</h2>
          <h1 class="owner-cancelled__title">отклонено!</h1>
        </div>
      </div>

      <!-- What's next section -->
      <div class="owner-cancelled__next-steps">
        <h3 class="owner-cancelled__next-steps-title">Что дальше?</h3>
        
        <div class="owner-cancelled__steps-list">
          <!-- Step 1 -->
          <div class="owner-cancelled__step owner-cancelled__step--first">
            <div class="owner-cancelled__step-number">1</div>
            <div class="owner-cancelled__step-content">
              <h4 class="owner-cancelled__step-title">Арендатор получит уведомление</h4>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="owner-cancelled__step owner-cancelled__step--second">
            <div class="owner-cancelled__step-number">2</div>
            <div class="owner-cancelled__step-content">
              <h4 class="owner-cancelled__step-title">Мы сделаем возврат предоплаты</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Home button -->
      <button type="button" class="owner-cancelled__home-button" @click="emit('go-home')">
        Вернуться на главную
      </button>
    </div>
  </section>
</template>

<style scoped>
.owner-cancelled {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  max-width: 428px;
  margin: 0 auto;
  width: 100%;
}

.owner-cancelled__header {
  display: flex;
  align-items: center;
  gap: 7.19px;
  padding: 12px 18px 13px;
  border-bottom: 1.33px solid #E5E7EB;
  position: relative;
  background-color: #ffffff;
}

.owner-cancelled__back-button {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background-color: #F3F4F6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.owner-cancelled__back-button:hover {
  background-color: #E5E7EB;
}

.owner-cancelled__back-button svg {
  display: block;
}

.owner-cancelled__header-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.4px;
  line-height: 2.09em;
  color: #1F2937;
  margin: 0;
  text-align: center;
  flex: 1;
  padding-right: 37.2px;
}

.owner-cancelled__content {
  flex: 1;
  padding: 18px 17.67px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  background-color: #ffffff;
  padding-bottom: 0;
}

.owner-cancelled__status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 0;
  width: 243px;
  height: 137px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
}

.owner-cancelled__icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #DC2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.owner-cancelled__icon-wrapper svg {
  width: 22px;
  height: 22px;
}

.owner-cancelled__title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -8px;
  width: 243.25px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.owner-cancelled__subtitle {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.7777777777777777em;
  color: #1F2937;
  margin: 0;
  text-align: center;
}

.owner-cancelled__title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 17.1px;
  line-height: 1.8713449874934818em;
  color: #1F2937;
  margin: 0;
  text-align: center;
}

.owner-cancelled__next-steps {
  display: flex;
  flex-direction: column;
  gap: 3.3px;
  width: 100%;
  max-width: 100%;
  margin-top: 50px;
  margin-bottom: 24px;
}

.owner-cancelled__next-steps-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5em;
  color: #1F2937;
  margin: 0;
  text-align: center;
  width: 100%;
}

.owner-cancelled__steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 3.3px;
  align-items: flex-start;
}

.owner-cancelled__step {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  justify-content: flex-start;
}

.owner-cancelled__step--first {
  min-height: 27px;
  gap: 0;
  align-items: center;
}

.owner-cancelled__step--first .owner-cancelled__step-number {
  width: 24px;
  height: 24px;
  margin-top: 3px;
}

.owner-cancelled__step--first .owner-cancelled__step-content {
  padding-left: 18px;
  padding-top: 0;
  text-align: left;
}

.owner-cancelled__step--second {
  min-height: 33px;
  gap: 0;
  align-items: center;
}

.owner-cancelled__step--second .owner-cancelled__step-number {
  width: 24px;
  height: 24px;
  margin-top: 3px;
}

.owner-cancelled__step--second .owner-cancelled__step-content {
  padding-left: 18px;
  padding-top: 0;
  text-align: left;
}

.owner-cancelled__step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #2563EB;
  flex-shrink: 0;
  margin-top: 3px;
  padding-top: 1px;
}

.owner-cancelled__step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  padding-left: 12px;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  width: 100%;
}

.owner-cancelled__step-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 1.4em;
  color: #1F2937;
  margin: 0;
  padding: 0;
  text-align: left;
  width: 100%;
  flex: 1;
}

.owner-cancelled__home-button {
  width: 100%;
  padding: 13px 18px 12px;
  background: transparent;
  border: none;
  border-top: 1.33px solid #E5E7EB;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5em;
  color: #4B5563;
  text-align: center;
  cursor: pointer;
  margin-top: 0;
}

.owner-cancelled__home-button:hover {
  color: #1F2937;
}

@media (max-width: 480px) {
  .owner-cancelled__content {
    padding: 16px;
  }

  .owner-cancelled__header {
    padding: 12px 16px;
  }

  .owner-cancelled__footer {
    padding: 12px 16px;
  }
}
</style>

