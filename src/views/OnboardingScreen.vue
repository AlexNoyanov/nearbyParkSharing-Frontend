<script setup lang="ts">
const props = defineProps<{
  onNext: () => void
  onPreview: () => void
}>()
</script>

<template>
  <section class="onboarding">
    <div class="onboarding__container">
      <div class="onboarding__header">
        <div class="onboarding__badge">
          <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg" class="onboarding__badge-icon">
            <path d="M46.875 0C49.9219 0 52.5 2.57812 52.5 5.625V46.875C52.5 50.0391 49.9219 52.5 46.875 52.5H5.625C2.46094 52.5 0 50.0391 0 46.875V5.625C0 2.57812 2.46094 0 5.625 0H46.875ZM28.125 33.75C34.2188 33.75 39.375 28.7109 39.375 22.5C39.375 16.4062 34.2188 11.25 28.125 11.25H16.875C15.8203 11.25 15 12.1875 15 13.125V39.375C15 40.4297 15.8203 41.25 16.875 41.25H20.625C21.5625 41.25 22.5 40.4297 22.5 39.375V33.75H28.125ZM28.125 18.75C30.1172 18.75 31.875 20.5078 31.875 22.5C31.875 24.6094 30.1172 26.25 28.125 26.25H22.5V18.75H28.125Z" fill="white"/>
          </svg>
        </div>
        <h1 class="onboarding__title">ParkShare</h1>
        <p class="onboarding__subtitle">Найди парковку или сдай свое место</p>
        
        <div class="onboarding__features">
          <div class="onboarding__feature">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="onboarding__feature-icon">
              <path d="M19.7266 17.3047C20.0781 17.6953 20.0781 18.2812 19.6875 18.6328L18.5938 19.7266C18.2422 20.1172 17.6562 20.1172 17.2656 19.7266L13.3984 15.8594C13.2031 15.6641 13.125 15.4297 13.125 15.1953V14.5312C11.7188 15.625 10 16.25 8.125 16.25C3.63281 16.25 0 12.6172 0 8.125C0 3.67188 3.63281 0 8.125 0C12.5781 0 16.25 3.67188 16.25 8.125C16.25 10.0391 15.5859 11.7578 14.5312 13.125H15.1562C15.3906 13.125 15.625 13.2422 15.8203 13.3984L19.7266 17.3047ZM8.125 13.125C10.8594 13.125 13.125 10.8984 13.125 8.125C13.125 5.39062 10.8594 3.125 8.125 3.125C5.35156 3.125 3.125 5.39062 3.125 8.125C3.125 10.8984 5.35156 13.125 8.125 13.125Z" fill="#E9D5FF"/>
            </svg>
            <span class="onboarding__feature-text">Быстрый поиск парковки</span>
          </div>
          <div class="onboarding__feature">
            <svg width="25" height="18" viewBox="0 0 25 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="onboarding__feature-icon">
              <path d="M24.2578 0.898438C24.6875 1.09375 25 1.5625 25 2.03125V14.4531C25 15.1562 24.375 15.6641 23.7109 15.6641C23.5938 15.6641 23.4375 15.6641 23.3203 15.625C22.1094 15.2344 20.8984 15.0781 19.6875 15.0781C14.8828 15.0781 10.0781 17.5 5.27344 17.5C3.75 17.5 2.22656 17.2656 0.703125 16.6406C0.273438 16.4453 0 15.9766 0 15.5078V3.08594C0 2.38281 0.585938 1.83594 1.25 1.83594C1.36719 1.83594 1.52344 1.875 1.64062 1.91406C2.85156 2.30469 4.0625 2.46094 5.27344 2.46094C10.0781 2.46094 14.8828 0 19.6875 0C21.2109 0 22.7344 0.273438 24.2578 0.898438ZM1.875 3.94531V6.28906C3.08594 6.28906 4.0625 5.42969 4.29688 4.29688C3.47656 4.21875 2.65625 4.14062 1.875 3.94531ZM1.875 15.0781C2.65625 15.3516 3.47656 15.5469 4.33594 15.5859C4.29688 14.2578 3.20312 13.2031 1.875 13.2031V15.0781ZM12.5 12.5C14.2188 12.5 15.625 10.8594 15.625 8.75C15.625 6.67969 14.2188 5 12.5 5C10.7422 5 9.375 6.67969 9.375 8.75C9.375 10.8594 10.7422 12.5 12.5 12.5ZM23.125 13.5938V11.3672C22.0703 11.4844 21.2109 12.2656 20.9766 13.2812C21.7188 13.3203 22.4219 13.4375 23.125 13.5938ZM23.125 4.375V2.46094C22.4219 2.22656 21.6797 2.07031 20.9375 1.99219C20.9766 3.20312 21.9141 4.21875 23.125 4.375Z" fill="#E9D5FF"/>
            </svg>
            <span class="onboarding__feature-text">Заработай на своем месте</span>
          </div>
        </div>
      </div>

      <footer class="onboarding__footer">
        <button type="button" class="onboarding__action onboarding__action--primary" @click="props.onNext">
          Зарегистрироваться
        </button>
        <button type="button" class="onboarding__action onboarding__action--secondary" @click="props.onPreview">
          Просто посмотреть
        </button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 0;
}

.onboarding__container {
  width: 100%;
  max-width: 281px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.onboarding__header {
  padding: 60px 24px 40px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  flex: 1;
  justify-content: flex-start;
}

.onboarding__badge {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 32px;
}

.onboarding__badge-icon {
  width: 53px;
  height: 53px;
  display: block;
}

.onboarding__title {
  margin: 0 0 16px 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  text-align: center;
  color: #ffffff;
}

.onboarding__subtitle {
  margin: 0 0 48px 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
}

.onboarding__features {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 240px;
  align-items: flex-start;
  margin-top: 0;
}

.onboarding__feature {
  display: flex;
  align-items: center;
  gap: 16px;
}

.onboarding__feature-icon {
  width: 21px;
  height: 21px;
  display: block;
  flex-shrink: 0;
}

.onboarding__feature:last-child .onboarding__feature-icon {
  width: 25px;
  height: 18px;
}

.onboarding__feature-text {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #ffffff;
}

.onboarding__footer {
  padding: 18px 18px 16.5px;
  display: flex;
  flex-direction: column;
  gap: 9.5px;
  background: #ffffff;
  flex-shrink: 0;
  margin-bottom: 120px;
}

.onboarding__action {
  width: 100%;
  height: 51px;
  padding: 0;
  border: none;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.2px;
  line-height: 2.12;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding__action--primary {
  background: linear-gradient(90deg, rgba(37, 99, 235, 1) 0%, rgba(147, 51, 234, 1) 100%);
  color: #ffffff;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.onboarding__action--secondary {
  background: #F3F4F6;
  color: #374151;
  font-weight: 700;
  font-size: 13.2px;
  line-height: 2.12;
}

.onboarding__action:active {
  transform: translateY(1px);
}

@media (max-width: 480px) {
  .onboarding__container {
    max-width: 100%;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .onboarding {
    padding: 0;
  }
}

/* iPhone 13 Pro and smaller */
@media (max-width: 390px) {
  .onboarding__title {
    font-size: 16px;
  }

  .onboarding__subtitle {
    font-size: 12px;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .onboarding__container {
    max-width: 100%;
    border-radius: 0;
  }

  .onboarding__header {
    padding: 80px 48px 48px;
    gap: 0;
  }

  .onboarding__badge {
    width: 120px;
    height: 120px;
    margin-bottom: 40px;
  }

  .onboarding__badge-icon {
    width: 80px;
    height: 80px;
  }

  .onboarding__title {
    font-size: 42px;
    max-width: 600px;
    margin-bottom: 20px;
  }

  .onboarding__subtitle {
    font-size: 20px;
    max-width: 600px;
    margin-bottom: 56px;
  }

  .onboarding__features {
    max-width: 500px;
    gap: 28px;
    align-items: center;
  }

  .onboarding__feature {
    gap: 20px;
  }

  .onboarding__feature-icon {
    width: 28px;
    height: 28px;
  }

  .onboarding__feature:last-child .onboarding__feature-icon {
    width: 32px;
    height: 24px;
  }

  .onboarding__feature-text {
    font-size: 16px;
  }

  .onboarding__footer {
    padding: 32px 48px;
    gap: 16px;
    margin-bottom: 0;
  }

  .onboarding__action {
    height: 56px;
    font-size: 18px;
    border-radius: 16px;
  }

  .onboarding__action--secondary {
    font-size: 16px;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .onboarding__header {
    padding: 100px 64px 56px;
    gap: 0;
  }

  .onboarding__badge {
    width: 140px;
    height: 140px;
    margin-bottom: 48px;
  }

  .onboarding__badge-icon {
    width: 96px;
    height: 96px;
  }

  .onboarding__title {
    font-size: 36px;
    max-width: 700px;
    margin-bottom: 24px;
  }

  .onboarding__subtitle {
    font-size: 18px;
    max-width: 700px;
    margin-bottom: 64px;
  }

  .onboarding__features {
    max-width: 600px;
    gap: 32px;
    align-items: center;
  }

  .onboarding__feature {
    gap: 24px;
  }

  .onboarding__feature-icon {
    width: 32px;
    height: 32px;
  }

  .onboarding__feature:last-child .onboarding__feature-icon {
    width: 36px;
    height: 28px;
  }

  .onboarding__feature-text {
    font-size: 18px;
  }

  .onboarding__footer {
    padding: 40px 64px;
    gap: 20px;
    margin-bottom: 0;
  }

  .onboarding__action {
    height: 60px;
    font-size: 20px;
    border-radius: 18px;
  }

  .onboarding__action--secondary {
    font-size: 18px;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .onboarding__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .onboarding__header {
    padding: 60px 48px 40px;
    gap: 0;
  }

  .onboarding__badge {
    width: 96px;
    height: 96px;
    margin-bottom: 32px;
  }

  .onboarding__badge-icon {
    width: 53px;
    height: 53px;
  }

  .onboarding__title {
    font-size: 28px;
    max-width: 500px;
    margin-bottom: 16px;
  }

  .onboarding__subtitle {
    font-size: 14px;
    max-width: 500px;
    margin-bottom: 48px;
  }

  .onboarding__features {
    max-width: 240px;
    gap: 24px;
    align-items: center;
  }

  .onboarding__feature {
    gap: 16px;
  }

  .onboarding__feature-icon {
    width: 21px;
    height: 21px;
  }

  .onboarding__feature:last-child .onboarding__feature-icon {
    width: 25px;
    height: 18px;
  }

  .onboarding__feature-text {
    font-size: 14px;
  }

  .onboarding__footer {
    padding: 18px 24px;
    gap: 9.5px;
    margin-bottom: 0;
  }

  .onboarding__action {
    height: 51px;
    font-size: 13.2px;
    border-radius: 12px;
  }

  .onboarding__action--secondary {
    font-size: 13.2px;
  }
}
</style>

