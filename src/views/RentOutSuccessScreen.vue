<script setup lang="ts">
const emit = defineEmits<{
  (e: 'go-to-ads'): void
}>()
</script>

<template>
  <section class="rent-success">
    <div class="rent-success__content">
      <!-- Success Icon -->
      <div class="rent-success__icon-wrapper">
        <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.3125 22.0898L0.585938 12.3633C0 11.7773 0 10.7812 0.585938 10.1953L2.69531 8.08594C3.28125 7.5 4.21875 7.5 4.80469 8.08594L11.4258 14.6484L25.4883 0.585938C26.0742 0 27.0117 0 27.5977 0.585938L29.707 2.69531C30.293 3.28125 30.293 4.27734 29.707 4.86328L12.4805 22.0898C11.8945 22.6758 10.8984 22.6758 10.3125 22.0898Z" fill="white"/>
        </svg>
      </div>

      <!-- Success Message -->
      <h1 class="rent-success__title">Объявление успешно размещено</h1>
      <p class="rent-success__subtitle">Ваше парковочное место теперь доступно для бронирования другими пользователями</p>

      <!-- Info Block -->
      <div class="rent-success__info-block">
        <h2 class="rent-success__info-title">Что дальше?</h2>
        
        <div class="rent-success__info-items">
          <div class="rent-success__info-item">
            <div class="rent-success__info-icon">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8086 12.1133C14.0547 12.3867 14.0547 12.7969 13.7812 13.043L13.0156 13.8086C12.7695 14.082 12.3594 14.082 12.0859 13.8086L9.37891 11.1016C9.24219 10.9648 9.1875 10.8008 9.1875 10.6367V10.1719C8.20312 10.9375 7 11.375 5.6875 11.375C2.54297 11.375 0 8.83203 0 5.6875C0 2.57031 2.54297 0 5.6875 0C8.80469 0 11.375 2.57031 11.375 5.6875C11.375 7.02734 10.9102 8.23047 10.1719 9.1875H10.6094C10.7734 9.1875 10.9375 9.26953 11.0742 9.37891L13.8086 12.1133ZM5.6875 9.1875C7.60156 9.1875 9.1875 7.62891 9.1875 5.6875C9.1875 3.77344 7.60156 2.1875 5.6875 2.1875C3.74609 2.1875 2.1875 3.77344 2.1875 5.6875C2.1875 7.62891 3.74609 9.1875 5.6875 9.1875Z" fill="white"/>
              </svg>
            </div>
            <span class="rent-success__info-text">Ваше место появится в поиске</span>
          </div>

          <div class="rent-success__info-item">
            <div class="rent-success__info-icon">
              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.15234 14C5.16797 14 4.40234 13.2344 4.40234 12.25H7.875C7.875 13.2344 7.10938 14 6.15234 14ZM12.0312 9.92578C12.1953 10.0898 12.2773 10.3086 12.2773 10.5C12.25 10.9648 11.9219 11.375 11.375 11.375H0.902344C0.355469 11.375 0.0273438 10.9648 0.0273438 10.5C0 10.3086 0.0820312 10.0898 0.246094 9.92578C0.765625 9.35156 1.77734 8.50391 1.77734 5.6875C1.77734 3.58203 3.25391 1.88672 5.27734 1.44922V0.875C5.27734 0.410156 5.66016 0 6.15234 0C6.61719 0 7 0.410156 7 0.875V1.44922C9.02344 1.88672 10.5 3.58203 10.5 5.6875C10.5 8.50391 11.5117 9.35156 12.0312 9.92578Z" fill="white"/>
              </svg>
            </div>
            <span class="rent-success__info-text">Получайте уведомления о новых запросах на бронирование</span>
          </div>

          <div class="rent-success__info-item">
            <div class="rent-success__info-icon">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.53516 7.875H3.99219V8.75H8.42188C8.58594 8.75 8.75 8.91406 8.75 9.07812V10.1719C8.75 10.3633 8.58594 10.5 8.42188 10.5H3.99219V11.9219C3.99219 12.1133 3.85547 12.25 3.66406 12.25H2.07812C1.88672 12.25 1.75 12.1133 1.75 11.9219V10.5H0.328125C0.136719 10.5 0 10.3633 0 10.1719V9.07812C0 8.91406 0.136719 8.75 0.328125 8.75H1.75V7.875H0.328125C0.136719 7.875 0 7.73828 0 7.54688V6.31641C0 6.15234 0.136719 5.98828 0.328125 5.98828H1.75V0.328125C1.75 0.164062 1.88672 0 2.07812 0H6.53516C8.85938 0 10.5 1.58594 10.5 3.9375C10.5 6.26172 8.85938 7.875 6.53516 7.875ZM3.99219 1.88672V5.98828H6.125C7.4375 5.98828 8.20312 5.16797 8.20312 3.9375C8.20312 2.67969 7.4375 1.88672 6.15234 1.88672H3.99219Z" fill="white"/>
              </svg>
            </div>
            <span class="rent-success__info-text">Начинайте зарабатывать</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Button -->
    <footer class="rent-success__footer">
      <button type="button" class="rent-success__button" @click="emit('go-to-ads')">
        Перейти к моим объявлениям
      </button>
    </footer>
  </section>
</template>

<style scoped>
.rent-success {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  padding: calc(env(safe-area-inset-top) + 24px) 24px calc(24px + env(safe-area-inset-bottom));
}

.rent-success__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;
}

.rent-success__icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.rent-success__icon-wrapper svg {
  width: 31px;
  height: 23px;
}

.rent-success__title {
  margin: 0 0 12px 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #ffffff;
  max-width: 300px;
}

.rent-success__subtitle {
  margin: 0 0 40px 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #E2E8F0;
  max-width: 320px;
}

.rent-success__info-block {
  width: 100%;
  max-width: 360px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(196, 181, 253, 0.4) 0%, rgba(99, 102, 241, 0.6) 100%);
  margin-bottom: 24px;
}

.rent-success__info-title {
  margin: 0 0 20px 0;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.4;
  color: #ffffff;
  text-align: center;
}

.rent-success__info-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rent-success__info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.rent-success__info-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(196, 181, 253, 0.5);
  border-radius: 50%;
  margin-top: 0;
}

.rent-success__info-icon svg {
  width: 20px;
  height: 20px;
}

.rent-success__info-text {
  flex: 1;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #ffffff;
}

.rent-success__footer {
  padding-top: 24px;
}

.rent-success__button {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #1E40AF;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.rent-success__button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rent-success__button:hover::before {
  opacity: 1;
}

.rent-success__button:active {
  transform: scale(0.98);
}

@media (min-width: 768px) {
  .rent-success {
    padding: calc(env(safe-area-inset-top) + 32px) 48px calc(32px + env(safe-area-inset-bottom));
  }

  .rent-success__content {
    padding: 60px 0;
  }

  .rent-success__icon-wrapper {
    width: 100px;
    height: 100px;
    margin-bottom: 32px;
  }

  .rent-success__icon-wrapper svg {
    width: 38px;
    height: 28px;
  }

  .rent-success__title {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .rent-success__subtitle {
    font-size: 18px;
    margin-bottom: 48px;
  }

  .rent-success__info-block {
    padding: 32px;
    border-radius: 20px;
  }

  .rent-success__info-title {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .rent-success__info-text {
    font-size: 15px;
  }
}
</style>

