<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  userName?: string
}>()

const loadingMessage = computed(() =>
  props.userName ? `Загружаем лучшие места для ${props.userName}` : 'Загружаем для вас лучшие места',
)
</script>

<template>
  <section class="loading-screen">
    <div class="loading-screen__phone-frame">
      <!-- Loading Content -->
      <div class="loading-screen__content">
        <!-- Logo -->
        <div class="loading-screen__logo-container">
          <div class="loading-screen__badge">
            <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg" class="loading-screen__badge-icon">
              <path d="M46.875 0C49.9219 0 52.5 2.57812 52.5 5.625V46.875C52.5 50.0391 49.9219 52.5 46.875 52.5H5.625C2.46094 52.5 0 50.0391 0 46.875V5.625C0 2.57812 2.46094 0 5.625 0H46.875ZM28.125 33.75C34.2188 33.75 39.375 28.7109 39.375 22.5C39.375 16.4062 34.2188 11.25 28.125 11.25H16.875C15.8203 11.25 15 12.1875 15 13.125V39.375C15 40.4297 15.8203 41.25 16.875 41.25H20.625C21.5625 41.25 22.5 40.4297 22.5 39.375V33.75H28.125ZM28.125 18.75C30.1172 18.75 31.875 20.5078 31.875 22.5C31.875 24.6094 30.1172 26.25 28.125 26.25H22.5V18.75H28.125Z" fill="white"/>
            </svg>
          </div>
          <h1 class="loading-screen__title">ParkShare</h1>
        </div>

        <!-- Loading Message -->
        <div class="loading-screen__message">
          <h2 class="loading-screen__message-title">Обрабатываем запрос</h2>
          <p class="loading-screen__message-subtitle">{{ loadingMessage }}</p>
        </div>

        <!-- Animated Dots -->
        <div class="loading-screen__dots">
          <div class="loading-screen__dot" style="animation-delay: 0s;"></div>
          <div class="loading-screen__dot" style="animation-delay: 0.2s;"></div>
          <div class="loading-screen__dot" style="animation-delay: 0.4s;"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loading-screen {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: #f3f4f6;
  position: relative;
  overflow: hidden;
}

.loading-screen__phone-frame {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  box-shadow: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-screen__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
  z-index: 10;
  padding: 2rem;
}

.loading-screen__logo-container {
  animation: logoFloat 3s ease-in-out infinite;
  margin-bottom: 2rem;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.loading-screen__badge {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.loading-screen__badge-icon {
  width: 53px;
  height: 53px;
  display: block;
}

.loading-screen__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.2;
  text-align: center;
  color: #ffffff;
}

.loading-screen__message {
  animation: messageFade 3s ease-in-out infinite;
  margin-bottom: 1.5rem;
}

@keyframes messageFade {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.loading-screen__message-title {
  margin: 0 0 0.5rem;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.2;
  text-align: center;
  color: #ffffff;
}

.loading-screen__message-subtitle {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.loading-screen__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-screen__dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: dotPulse 1.5s ease-in-out infinite;
}

.loading-screen__dot:nth-child(1) {
  animation-delay: 0s;
}

.loading-screen__dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-screen__dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@media (max-width: 480px) {
  .loading-screen {
    padding: 0;
  }

  .loading-screen__phone-frame {
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    border-radius: 0;
  }

  .loading-screen__title {
    font-size: 1.25rem;
  }

  .loading-screen__message-title {
    font-size: 1.125rem;
  }

  .loading-screen__message-subtitle {
    font-size: 0.875rem;
  }

  .loading-screen__badge {
    width: 64px;
    height: 64px;
  }

  .loading-screen__badge-icon {
    width: 42px;
    height: 42px;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .loading-screen__content {
    padding: 3rem;
  }

  .loading-screen__badge {
    width: 100px;
    height: 100px;
  }

  .loading-screen__badge-icon {
    width: 66px;
    height: 66px;
  }

  .loading-screen__title {
    font-size: 2rem;
  }

  .loading-screen__message-title {
    font-size: 1.5rem;
  }

  .loading-screen__message-subtitle {
    font-size: 1.125rem;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .loading-screen__content {
    padding: 4rem;
  }

  .loading-screen__badge {
    width: 120px;
    height: 120px;
  }

  .loading-screen__badge-icon {
    width: 80px;
    height: 80px;
  }

  .loading-screen__title {
    font-size: 2.25rem;
  }

  .loading-screen__message-title {
    font-size: 1.75rem;
  }

  .loading-screen__message-subtitle {
    font-size: 1.25rem;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .loading-screen__phone-frame {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .loading-screen__content {
    padding: 2rem;
  }

  .loading-screen__badge {
    width: 80px;
    height: 80px;
  }

  .loading-screen__badge-icon {
    width: 53px;
    height: 53px;
  }

  .loading-screen__title {
    font-size: 1.5rem;
  }

  .loading-screen__message-title {
    font-size: 1.25rem;
  }

  .loading-screen__message-subtitle {
    font-size: 1rem;
  }
}
</style>

