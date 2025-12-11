<script setup lang="ts">
const props = defineProps<{
  onContinue: () => void
}>()
</script>

<template>
  <section class="geo-confirmation">
    <div class="geo-confirmation__container">
      <!-- Top Section with Gradient Background -->
      <div class="geo-confirmation__top">
        <div class="geo-confirmation__icon-wrapper">
          <div class="geo-confirmation__icon-circle">
            <svg class="geo-confirmation__icon" width="27" height="37" viewBox="0 0 27 37" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.0938 35.2969C1.82812 20.5312 0 18.9844 0 13.5C0 6.04688 5.97656 0 13.5 0C20.9531 0 27 6.04688 27 13.5C27 18.9844 25.1016 20.5312 14.8359 35.2969C14.2031 36.2812 12.7266 36.2812 12.0938 35.2969ZM13.5 19.125C16.5938 19.125 19.125 16.6641 19.125 13.5C19.125 10.4062 16.5938 7.875 13.5 7.875C10.3359 7.875 7.875 10.4062 7.875 13.5C7.875 16.6641 10.3359 19.125 13.5 19.125Z" fill="white"/>
            </svg>
          </div>
        </div>
        <h1 class="geo-confirmation__title">Найдем парковку рядом</h1>
        <p class="geo-confirmation__description">Разрешите доступ к геолокации</p>
      </div>

      <!-- Bottom Section with White Background and Buttons -->
      <div class="geo-confirmation__bottom">
        <button
          type="button"
          class="geo-confirmation__button geo-confirmation__button--primary"
          @click="props.onContinue"
        >
          Разрешить доступ к геолокации
        </button>
        <button
          type="button"
          class="geo-confirmation__button geo-confirmation__button--secondary"
          @click="props.onContinue"
        >
          Пропустить
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.geo-confirmation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
}

.geo-confirmation__container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  position: relative;
}

/* Top Section - 60-65% of screen with vertical gradient */
.geo-confirmation__top {
  flex: 0 0 65%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #2563EB 0%, #9333EA 100%);
  padding: 60px 24px 40px;
  text-align: center;
  position: relative;
}

.geo-confirmation__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.geo-confirmation__icon-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.geo-confirmation__icon {
  width: 32px;
  height: 44px;
  display: block;
}

.geo-confirmation__title {
  margin: 0 0 16px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 34px;
  line-height: 1.3;
  text-align: center;
  color: #ffffff;
  max-width: 320px;
}

.geo-confirmation__description {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  max-width: 320px;
}

/* Bottom Section - 35-40% white background */
.geo-confirmation__bottom {
  flex: 0 0 35%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;
  background: #ffffff;
  gap: 12px;
}

.geo-confirmation__button {
  width: 100%;
  height: 51px;
  padding: 0;
  border: none;
  border-radius: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.geo-confirmation__button--primary {
  background: linear-gradient(90deg, #2563EB 0%, #9333EA 100%);
  color: #ffffff;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 0;
}

.geo-confirmation__button--secondary {
  background: #F3F4F6;
  color: #374151;
  border: none;
}

.geo-confirmation__button:active {
  transform: translateY(1px);
}

.geo-confirmation__button--primary:active {
  box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
  .geo-confirmation__container {
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }

  .geo-confirmation__top {
    flex: 0 0 62%;
    padding: 50px 20px 30px;
  }

  .geo-confirmation__icon-circle {
    width: 100px;
    height: 100px;
  }

  .geo-confirmation__icon {
    width: 28px;
    height: 38px;
  }

  .geo-confirmation__title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .geo-confirmation__description {
    font-size: 15px;
  }

  .geo-confirmation__bottom {
    flex: 0 0 38%;
    padding: 20px;
  }

  .geo-confirmation__button {
    height: 48px;
    font-size: 15px;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .geo-confirmation__top {
    padding: 80px 48px 40px;
  }

  .geo-confirmation__icon-circle {
    width: 140px;
    height: 140px;
  }

  .geo-confirmation__icon {
    width: 40px;
    height: 54px;
  }

  .geo-confirmation__title {
    font-size: 32px;
    max-width: 600px;
  }

  .geo-confirmation__description {
    font-size: 18px;
    max-width: 600px;
  }

  .geo-confirmation__bottom {
    padding: 40px 48px;
  }

  .geo-confirmation__button {
    height: 56px;
    font-size: 18px;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .geo-confirmation__top {
    padding: 100px 64px 48px;
  }

  .geo-confirmation__icon-circle {
    width: 160px;
    height: 160px;
  }

  .geo-confirmation__icon {
    width: 46px;
    height: 62px;
  }

  .geo-confirmation__title {
    font-size: 36px;
    max-width: 700px;
  }

  .geo-confirmation__description {
    font-size: 20px;
    max-width: 700px;
  }

  .geo-confirmation__bottom {
    padding: 48px 64px;
  }

  .geo-confirmation__button {
    height: 60px;
    font-size: 20px;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .geo-confirmation__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .geo-confirmation__top {
    padding: 60px 48px 32px;
  }

  .geo-confirmation__icon-circle {
    width: 120px;
    height: 120px;
  }

  .geo-confirmation__icon {
    width: 34px;
    height: 46px;
  }

  .geo-confirmation__title {
    font-size: 24px;
    max-width: 500px;
  }

  .geo-confirmation__description {
    font-size: 16px;
    max-width: 500px;
  }

  .geo-confirmation__bottom {
    padding: 24px 48px;
  }

  .geo-confirmation__button {
    height: 51px;
    font-size: 16px;
  }
}
</style>

