<script setup lang="ts">
const emit = defineEmits<{
  (e: 'confirm'): void
}>()
</script>

<template>
  <section class="booking-confirmation">
    <div class="booking-confirmation__content">
      <div class="booking-confirmation__icon-wrapper">
        <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.3125 22.0898L0.585938 12.3633C0 11.7773 0 10.7812 0.585938 10.1953L2.69531 8.08594C3.28125 7.5 4.21875 7.5 4.80469 8.08594L11.4258 14.6484L25.4883 0.585938C26.0742 0 27.0117 0 27.5977 0.585938L29.707 2.69531C30.293 3.28125 30.293 4.27734 29.707 4.86328L12.4805 22.0898C11.8945 22.6758 10.8984 22.6758 10.3125 22.0898Z" fill="white"/>
        </svg>
      </div>
      <h2 class="booking-confirmation__title">
        Запрос отправлен!
      </h2>
      <p class="booking-confirmation__subtitle">
        Ожидайте ответа от владельца в чате
      </p>
    </div>
    <footer class="booking-confirmation__footer">
      <button type="button" class="booking-confirmation__button" @click="emit('confirm')">
        Ок
      </button>
    </footer>
  </section>
</template>

<style scoped>
.booking-confirmation {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(115deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  padding: 10px 1.33px 200px;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.booking-confirmation__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 215.97px;
}

.booking-confirmation__icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-confirmation__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  color: #FFFFFF;
  text-align: center;
}

.booking-confirmation__subtitle {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #FFFFFF;
  text-align: center;
  opacity: 0.9;
}

.booking-confirmation__footer {
  width: 231.25px;
  padding: 0;
}

.booking-confirmation__button {
  width: 100%;
  padding: 8px 0 9px;
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  color: #4F46E5;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.4px;
  line-height: 2.09;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.booking-confirmation__button:active {
  opacity: 0.9;
}
</style>

