<script setup lang="ts">
const props = defineProps<{
  onNext: () => void
  onLogin: () => void
}>()
</script>

<template>
  <section class="onboarding-1">
    <div class="onboarding-1__container">
      <div class="onboarding-1__header">
        <!-- Illustration with oval and circle background -->
        <div class="onboarding-1__illustration">
          <!-- Outer oval SVG -->
          <svg class="onboarding-1__oval-bg" width="212" height="144" viewBox="0 0 212 144" fill="none" xmlns="http://www.w3.org/2000/svg">
            <foreignObject x="-4" y="-4" width="220" height="152">
              <div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(2px);clip-path:url(#bgblur_0_271_5889_clip_path);height:100%;width:100%"></div>
            </foreignObject>
            <g data-figma-bg-blur-radius="4">
              <rect y="6" width="212" height="132" rx="66" fill="white" fill-opacity="0.2"/>
              <rect x="34" width="144" height="144" rx="72" fill="white" fill-opacity="0.3"/>
            </g>
            <defs>
              <clipPath id="bgblur_0_271_5889_clip_path" transform="translate(4 4)">
                <rect y="6" width="212" height="132" rx="66"/>
              </clipPath>
            </defs>
          </svg>
          <!-- Inner circle SVG -->
          <!-- <svg class="onboarding-1__circle-bg" width="144" height="144" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="144" height="144" rx="72" fill="white" fill-opacity="0.3"/>
          </svg> -->
          <!-- White rounded square -->
          <div class="onboarding-1__square">
            <!-- Blue car icon -->
            <svg class="onboarding-1__car-icon" width="37" height="27" viewBox="0 0 37 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35.2266 7.875C35.7891 7.875 36.2109 8.4375 36.0703 8.92969L35.6484 10.6172C35.5781 11.0391 35.2266 11.25 34.875 11.25H33.3984C34.3828 12.0938 35.0156 13.2891 35.0156 14.625V18C35.0156 19.1953 34.5234 20.1797 33.8906 20.9531V24.75C33.8906 26.0156 32.8359 27 31.6406 27H29.3906C28.125 27 27.1406 26.0156 27.1406 24.75V22.5H9.14062V24.75C9.14062 26.0156 8.08594 27 6.89062 27H4.64062C3.375 27 2.39062 26.0156 2.39062 24.75V20.9531C1.6875 20.1797 1.26562 19.1953 1.26562 18V14.625C1.26562 13.2891 1.82812 12.0938 2.8125 11.25H1.40625C0.984375 11.25 0.632812 11.0391 0.5625 10.6172L0.140625 8.92969C0 8.4375 0.421875 7.875 0.984375 7.875H5.13281L6.32812 4.99219C7.52344 1.96875 10.4062 0 13.6406 0H22.5703C25.8047 0 28.6875 1.96875 29.8828 4.99219L31.0781 7.875H35.2266ZM10.4766 6.67969L9.14062 10.125H27.1406L25.7344 6.67969C25.1719 5.34375 23.9766 4.5 22.5703 4.5H13.6406C12.2344 4.5 11.0391 5.34375 10.4766 6.67969ZM6.89062 18C8.22656 18 10.2656 18.2109 10.2656 16.875C10.2656 15.5391 8.22656 13.5 6.89062 13.5C5.48438 13.5 4.64062 14.4141 4.64062 15.75C4.64062 17.1562 5.48438 18 6.89062 18ZM29.3906 18C30.7266 18 31.6406 17.1562 31.6406 15.75C31.6406 14.4141 30.7266 13.5 29.3906 13.5C27.9844 13.5 26.0156 15.5391 26.0156 16.875C26.0156 18.2109 27.9844 18 29.3906 18Z" fill="#2563EB"/>
            </svg>
            <!-- Green P badge (top-right) -->
            <div class="onboarding-1__p-badge">
              <svg class="onboarding-1__p-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.625 0C16.6406 0 17.5 0.859375 17.5 1.875V15.625C17.5 16.6797 16.6406 17.5 15.625 17.5H1.875C0.820312 17.5 0 16.6797 0 15.625V1.875C0 0.859375 0.820312 0 1.875 0H15.625ZM9.375 11.25C11.4062 11.25 13.125 9.57031 13.125 7.5C13.125 5.46875 11.4062 3.75 9.375 3.75H5.625C5.27344 3.75 5 4.0625 5 4.375V13.125C5 13.4766 5.27344 13.75 5.625 13.75H6.875C7.1875 13.75 7.5 13.4766 7.5 13.125V11.25H9.375ZM9.375 6.25C10.0391 6.25 10.625 6.83594 10.625 7.5C10.625 8.20312 10.0391 8.75 9.375 8.75H7.5V6.25H9.375Z" fill="white"/>
              </svg>
            </div>
            <!-- Red location pin (bottom-left) -->
            <div class="onboarding-1__pin-container">
              <svg class="onboarding-1__pin-icon" width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.70312 13.7266C0.710938 7.98438 0 7.38281 0 5.25C0 2.35156 2.32422 0 5.25 0C8.14844 0 10.5 2.35156 10.5 5.25C10.5 7.38281 9.76172 7.98438 5.76953 13.7266C5.52344 14.1094 4.94922 14.1094 4.70312 13.7266ZM5.25 7.4375C6.45312 7.4375 7.4375 6.48047 7.4375 5.25C7.4375 4.04688 6.45312 3.0625 5.25 3.0625C4.01953 3.0625 3.0625 4.04688 3.0625 5.25C3.0625 6.48047 4.01953 7.4375 5.25 7.4375Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
        <h1 class="onboarding-1__title">Найдите парковку рядом с вами</h1>
        <p class="onboarding-1__subtitle">Откройте для себя сотни доступных парковочных мест в вашем городе. Бронируйте заранее и экономьте время.</p>
      </div>

      <!-- Features list section -->
      <div class="onboarding-1__features">
        <div class="onboarding-1__feature">
          <div class="onboarding-1__feature-circle">
            <svg class="onboarding-1__feature-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8086 12.1133C14.0547 12.3867 14.0547 12.7969 13.7812 13.043L13.0156 13.8086C12.7695 14.082 12.3594 14.082 12.0859 13.8086L9.37891 11.1016C9.24219 10.9648 9.1875 10.8008 9.1875 10.6367V10.1719C8.20312 10.9375 7 11.375 5.6875 11.375C2.54297 11.375 0 8.83203 0 5.6875C0 2.57031 2.54297 0 5.6875 0C8.80469 0 11.375 2.57031 11.375 5.6875C11.375 7.02734 10.9102 8.23047 10.1719 9.1875H10.6094C10.7734 9.1875 10.9375 9.26953 11.0742 9.37891L13.8086 12.1133ZM5.6875 9.1875C7.60156 9.1875 9.1875 7.62891 9.1875 5.6875C9.1875 3.77344 7.60156 2.1875 5.6875 2.1875C3.74609 2.1875 2.1875 3.77344 2.1875 5.6875C2.1875 7.62891 3.74609 9.1875 5.6875 9.1875Z" fill="#FFFFFF"/>
            </svg>
          </div>
          <span class="onboarding-1__feature-text">Поиск по карте и адресу</span>
        </div>
        <div class="onboarding-1__feature">
          <div class="onboarding-1__feature-circle">
            <svg class="onboarding-1__feature-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.78125 0C10.5273 0 13.5625 3.03516 13.5625 6.78125C13.5625 10.5273 10.5273 13.5625 6.78125 13.5625C3.03516 13.5625 0 10.5273 0 6.78125C0 3.03516 3.03516 0 6.78125 0ZM9.29688 8.55859C9.35156 8.50391 9.40625 8.39453 9.40625 8.28516C9.40625 8.14844 9.32422 8.03906 9.24219 7.95703L7.65625 6.78125V2.84375C7.65625 2.625 7.4375 2.40625 7.21875 2.40625H6.34375C6.09766 2.40625 5.90625 2.625 5.90625 2.84375V7.10938C5.90625 7.46484 6.04297 7.76562 6.31641 7.95703L8.14844 9.32422C8.20312 9.37891 8.3125 9.43359 8.39453 9.43359C8.55859 9.43359 8.66797 9.35156 8.75 9.24219L9.29688 8.55859Z" fill="#FFFFFF"/>
            </svg>
          </div>
          <span class="onboarding-1__feature-text">Бронирование на любое время</span>
        </div>
        <div class="onboarding-1__feature">
          <div class="onboarding-1__feature-circle">
            <svg class="onboarding-1__feature-icon" width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.3047 2.26953C12.7969 2.48828 13.125 2.95312 13.125 3.47266C13.125 9.54297 9.40625 12.9062 7.05469 13.8906C6.72656 14.0273 6.37109 14.0273 6.04297 13.8906C3.11719 12.6602 0 8.91406 0 3.47266C0 2.95312 0.300781 2.48828 0.792969 2.26953L6.04297 0.0820312C6.20703 0.0273438 6.37109 0 6.5625 0C6.72656 0 6.89062 0.0273438 7.05469 0.0820312L12.3047 2.26953ZM6.5625 12.1953C9.10547 10.9102 11.2656 7.90234 11.3477 3.77344L6.5625 1.77734V12.1953Z" fill="#FFFFFF"/>
            </svg>
          </div>
          <span class="onboarding-1__feature-text">Безопасные и проверенные места</span>
        </div>
      </div>

      <div class="onboarding-1__footer">
        <div class="onboarding-1__progress">
          <div class="onboarding-1__progress-dot onboarding-1__progress-dot--active"></div>
          <div class="onboarding-1__progress-dot"></div>
        </div>
        <button type="button" class="onboarding-1__button onboarding-1__button--primary" @click="props.onNext">
          Далее
        </button>
        <button type="button" class="onboarding-1__button onboarding-1__button--secondary" @click="props.onLogin">
          У меня уже есть аккаунт
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.onboarding-1 {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  padding: 0;
}

.onboarding-1__container {
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
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
}

.onboarding-1__header {
  padding: 60px 24px 40px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
}

/* Illustration container */
.onboarding-1__illustration {
  position: relative;
  width: 212px;
  height: 144px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 0;
}

/* Oval and circle background SVGs */
.onboarding-1__oval-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 212px;
  height: 144px;
  z-index: 0;
}

.onboarding-1__circle-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 144px;
  height: 144px;
  z-index: 0;
}

/* White rounded square */
.onboarding-1__square {
  position: relative;
  width: 72px;
  height: 72px;
  background: #ffffff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Car icon */
.onboarding-1__car-icon {
  width: 37px;
  height: 27px;
  position: relative;
  z-index: 2;
  display: block;
}

/* Green P badge (top-right) */
.onboarding-1__p-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: #22C55E;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  z-index: 3;
}

.onboarding-1__p-icon {
  width: 18px;
  height: 18px;
  display: block;
}

/* Red location pin container (bottom-left) */
.onboarding-1__pin-container {
  position: absolute;
  bottom: -8px;
  left: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* White location pin icon inside red circle */
.onboarding-1__pin-icon {
  width: 11px;
  height: 15px;
}

.onboarding-1__title {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 34px;
  line-height: 1.3;
  text-align: center;
  color: #ffffff;
  margin-bottom: 0;
  max-width: 340px;
  letter-spacing: -0.02em;
  margin-top: 10px;
}

.onboarding-1__subtitle {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  max-width: 300px;
}

/* Features section */
.onboarding-1__features {
  padding: 32px 60px 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.onboarding-1__feature {
  display: flex;
  align-items: center;
  gap: 14px;
}

.onboarding-1__feature-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FFFFFF33;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.onboarding-1__feature-icon {
  width: auto;
  height: 20px;
  display: block;
}

.onboarding-1__feature-text {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #ffffff;
}

.onboarding-1__footer {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: transparent;
  flex-shrink: 0;
}

.onboarding-1__progress {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  padding-top: 16px;
  padding-bottom: 16px;
}

.onboarding-1__progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.onboarding-1__progress-dot--active {
  width: 24px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 3px;
}

.onboarding-1__button {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.onboarding-1__button--primary {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
}

.onboarding-1__button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.onboarding-1__button--primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.onboarding-1__button--secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 0;
  box-shadow: none;
}

.onboarding-1__button--secondary:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile styles (480px and below) - These styles are preserved and not affected by tablet/desktop styles */
@media (max-width: 480px) {
  .onboarding-1__container {
    max-width: 100%;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .onboarding-1 {
    padding: 0;
  }

  .onboarding-1__header {
    padding: 62px 20px 24px;
    gap: 20px;
  }

  .onboarding-1__illustration {
    width: 180px;
    height: 122px;
    margin-top: 16px;
  }

  .onboarding-1__oval-bg {
    width: 250px;
    height: 182px;
  }

  .onboarding-1__circle-bg {
    width: 122px;
    height: 122px;
  }

  .onboarding-1__square {
    width: 72px;
    height: 72px;
    border-radius: 20px;
  }

  .onboarding-1__car-icon {
    width: 50px;
    height: 38px;
  }

  .onboarding-1__p-badge {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  .onboarding-1__p-icon {
    width: 16px;
    height: 16px;
  }

  .onboarding-1__pin-icon {
    width: 12px;
    height: 26px;
  }

  .onboarding-1__title {
    font-size: 32px;
    max-width: 320px;
    margin-top: 10px;
  }

  .onboarding-1__subtitle {
    font-size: 15px;
    max-width: 300px;
  }

  .onboarding-1__features {
    padding: 28px 60px 0;
    gap: 22px;
  }

  .onboarding-1__feature {
    gap: 12px;
  }

  .onboarding-1__feature-text {
    font-size: 13px;
  }

  .onboarding-1__footer {
    padding: 0 20px 20px;
    gap: 10px;
  }

  .onboarding-1__button {
    padding: 14px 20px;
    font-size: 15px;
  }

  .onboarding-1__button--secondary {
    padding: 6px 0;
    font-size: 13px;
  }
}

/* iPhone 13 Pro and smaller */
@media (max-width: 390px) {
  .onboarding-1__title {
    font-size: 16px;
    max-width: 280px;
  }

  .onboarding-1__subtitle {
    font-size: 13px;
    max-width: 280px;
  }

  .onboarding-1__features {
    padding: 10px 60px 0;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) {
  .onboarding-1__container {
    max-width: 100%;
    border-radius: 0;
  }

  .onboarding-1__header {
    padding: 80px 48px 48px;
    gap: 40px;
  }

  .onboarding-1__illustration {
    width: 280px;
    height: 190px;
  }

  .onboarding-1__oval-bg {
    width: 280px;
    height: 190px;
  }

  .onboarding-1__square {
    width: 96px;
    height: 96px;
    border-radius: 28px;
  }

  .onboarding-1__car-icon {
    width: 50px;
    height: 36px;
  }

  .onboarding-1__p-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    top: -10px;
    right: -10px;
  }

  .onboarding-1__p-icon {
    width: 24px;
    height: 24px;
  }

  .onboarding-1__pin-container {
    width: 36px;
    height: 36px;
    bottom: -10px;
    left: -10px;
  }

  .onboarding-1__pin-icon {
    width: 14px;
    height: 19px;
  }

  .onboarding-1__title {
    font-size: 42px;
    max-width: 600px;
  }

  .onboarding-1__subtitle {
    font-size: 20px;
    max-width: 600px;
  }

  .onboarding-1__features {
    padding: 48px 80px 0;
    gap: 28px;
  }

  .onboarding-1__feature {
    gap: 18px;
  }

  .onboarding-1__feature-circle {
    width: 40px;
    height: 40px;
  }

  .onboarding-1__feature-icon {
    height: 24px;
  }

  .onboarding-1__feature-text {
    font-size: 16px;
  }

  .onboarding-1__footer {
    padding: 0 48px 32px;
    gap: 16px;
  }

  .onboarding-1__button {
    padding: 18px 32px;
    font-size: 18px;
    border-radius: 18px;
  }

  .onboarding-1__button--secondary {
    padding: 10px 0;
    font-size: 16px;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .onboarding-1__header {
    padding: 100px 64px 56px;
    gap: 48px;
  }

  .onboarding-1__illustration {
    width: 340px;
    height: 230px;
  }

  .onboarding-1__oval-bg {
    width: 340px;
    height: 230px;
  }

  .onboarding-1__square {
    width: 120px;
    height: 120px;
    border-radius: 32px;
  }

  .onboarding-1__car-icon {
    width: 62px;
    height: 45px;
  }

  .onboarding-1__p-badge {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    top: -12px;
    right: -12px;
  }

  .onboarding-1__p-icon {
    width: 28px;
    height: 28px;
  }

  .onboarding-1__pin-container {
    width: 44px;
    height: 44px;
    bottom: -12px;
    left: -12px;
  }

  .onboarding-1__pin-icon {
    width: 17px;
    height: 23px;
  }

  .onboarding-1__title {
    font-size: 36px;
    max-width: 700px;
  }

  .onboarding-1__subtitle {
    font-size: 18px;
    max-width: 700px;
  }

  .onboarding-1__features {
    padding: 56px 100px 0;
    gap: 32px;
  }

  .onboarding-1__feature {
    gap: 20px;
  }

  .onboarding-1__feature-circle {
    width: 48px;
    height: 48px;
  }

  .onboarding-1__feature-icon {
    height: 28px;
  }

  .onboarding-1__feature-text {
    font-size: 16px;
  }

  .onboarding-1__footer {
    padding: 0 64px 40px;
    gap: 20px;
  }

  .onboarding-1__button {
    padding: 20px 40px;
    font-size: 18px;
    border-radius: 20px;
  }

  .onboarding-1__button--secondary {
    padding: 12px 0;
    font-size: 16px;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .onboarding-1__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .onboarding-1__header {
    padding: 80px 48px 48px;
    gap: 40px;
  }

  .onboarding-1__illustration {
    width: 280px;
    height: 190px;
  }

  .onboarding-1__oval-bg {
    width: 280px;
    height: 190px;
  }

  .onboarding-1__square {
    width: 96px;
    height: 96px;
    border-radius: 28px;
  }

  .onboarding-1__car-icon {
    width: 50px;
    height: 36px;
  }

  .onboarding-1__p-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    top: -10px;
    right: -10px;
  }

  .onboarding-1__p-icon {
    width: 24px;
    height: 24px;
  }

  .onboarding-1__pin-container {
    width: 36px;
    height: 36px;
    bottom: -10px;
    left: -10px;
  }

  .onboarding-1__pin-icon {
    width: 14px;
    height: 19px;
  }

  .onboarding-1__title {
    font-size: 34px;
    max-width: 500px;
  }

  .onboarding-1__subtitle {
    font-size: 16px;
    max-width: 500px;
  }

  .onboarding-1__features {
    padding: 48px 60px 0;
    gap: 28px;
  }

  .onboarding-1__feature-text {
    font-size: 14px;
  }

  .onboarding-1__footer {
    padding: 0 48px 32px;
    gap: 16px;
  }

  .onboarding-1__button {
    padding: 18px 32px;
    font-size: 16px;
    border-radius: 18px;
  }

  .onboarding-1__button--secondary {
    padding: 10px 0;
    font-size: 14px;
  }
}
</style>

