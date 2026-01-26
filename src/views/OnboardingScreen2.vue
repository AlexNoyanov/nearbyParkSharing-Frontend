<script setup lang="ts">
const props = defineProps<{
  onNext: () => void
  onLogin: () => void
}>()
</script>

<template>
  <section class="onboarding-2">
    <div class="onboarding-2__container">
      <div class="onboarding-2__header">
        <!-- Illustration with oval and circle background -->
        <div class="onboarding-2__illustration">
          <!-- Outer oval SVG -->
          <svg class="onboarding-2__oval-bg" width="212" height="144" viewBox="0 0 212 144" fill="none" xmlns="http://www.w3.org/2000/svg">
            <foreignObject x="-4" y="-4" width="220" height="152">
              <div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(2px);clip-path:url(#bgblur_0_271_5889_clip_path_2);height:100%;width:100%"></div>
            </foreignObject>
            <g data-figma-bg-blur-radius="4">
              <rect y="6" width="212" height="132" rx="66" fill="white" fill-opacity="0.2"/>
              <rect x="34" width="144" height="144" rx="72" fill="white" fill-opacity="0.3"/>
            </g>
            <defs>
              <clipPath id="bgblur_0_271_5889_clip_path_2" transform="translate(4 4)">
                <rect y="6" width="212" height="132" rx="66"/>
              </clipPath>
            </defs>
          </svg>
          <!-- White rounded square -->
          <div class="onboarding-2__square">
            <!-- Money/coins icon (center) -->
            <svg class="onboarding-2__center-icon" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 28.5469C2.88281 30.5859 8.15625 31.5 13.5 31.5C18.7734 31.5 24.0469 30.5859 27 28.5469V31.5C27 34.0312 20.9531 36 13.5 36C6.04688 36 0 34.0312 0 31.5V28.5469ZM22.5 9C15.0469 9 9 7.03125 9 4.5C9 2.03906 15.0469 0 22.5 0C29.9531 0 36 2.03906 36 4.5C36 7.03125 29.9531 9 22.5 9ZM0 21.1641C2.88281 23.5547 8.15625 24.75 13.5 24.75C18.7734 24.75 24.0469 23.5547 27 21.1641V24.75C27 27.2812 20.9531 29.25 13.5 29.25C6.04688 29.25 0 27.2812 0 24.75V21.1641ZM29.25 21.9375V17.4375C31.9219 16.9453 34.3125 16.1719 36 15.0469V18C36 19.6875 33.2578 21.1641 29.25 21.9375ZM13.5 11.25C20.9531 11.25 27 13.7812 27 16.875C27 20.0391 20.9531 22.5 13.5 22.5C6.04688 22.5 0 20.0391 0 16.875C0 13.7812 6.04688 11.25 13.5 11.25ZM28.8984 15.2578C28.2656 13.5703 26.7188 12.2344 24.6797 11.25C29.1797 10.9688 33.4688 10.0547 36 8.29688V11.25C36 13.0078 33.1172 14.4844 28.8984 15.2578Z" fill="#EAB308"/>
            </svg>
            <!-- Share badge (top-right) -->
            <div class="onboarding-2__share-badge">
              <svg class="onboarding-2__share-icon" width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.75 12.5C15.8203 12.5 17.5 14.1797 17.5 16.25C17.5 18.3594 15.8203 20 13.75 20C11.6406 20 10 18.3594 10 16.25V16.2891C10 15.9766 10 15.7031 10.0781 15.4688L6.05469 12.9688C5.42969 13.4766 4.60938 13.75 3.75 13.75C1.64062 13.75 0 12.1094 0 10C0 7.92969 1.64062 6.25 3.75 6.25C4.60938 6.25 5.42969 6.5625 6.05469 7.07031L10.0781 4.57031C10 4.33594 10 4.0625 10 3.75C10 1.67969 11.6406 0 13.75 0C15.8203 0 17.5 1.67969 17.5 3.75C17.5 5.85938 15.8203 7.5 13.75 7.5C12.8516 7.5 12.0312 7.22656 11.4062 6.71875L7.38281 9.21875C7.46094 9.45312 7.46094 9.72656 7.46094 10C7.46094 10.3125 7.46094 10.5859 7.38281 10.8203L11.4062 13.3203C12.0312 12.8125 12.8516 12.5 13.75 12.5Z" fill="white"/>
              </svg>
            </div>
            <!-- Plus/add badge (bottom-left) -->
            <div class="onboarding-2__plus-badge">
              <svg class="onboarding-2__plus-icon" width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.38212 2.50591H6.93012V4.33991H4.38212V6.80391H2.54812V4.33991H0.000117213V2.50591H2.54812V-8.98838e-05H4.38212V2.50591Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
        <h1 class="onboarding-2__title">Сдавайте свою парковку в аренду</h1>
        <p class="onboarding-2__subtitle">Зарабатывайте на своем парковочном месте, когда не пользуетесь им. Это просто и безопасно.</p>
      </div>

      <!-- Features list section -->
      <div class="onboarding-2__features">
        <div class="onboarding-2__feature">
          <div class="onboarding-2__feature-circle">
            <svg class="onboarding-2__feature-icon" width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.53516 7.875H3.99219V8.75H8.42188C8.58594 8.75 8.75 8.91406 8.75 9.07812V10.1719C8.75 10.3633 8.58594 10.5 8.42188 10.5H3.99219V11.9219C3.99219 12.1133 3.85547 12.25 3.66406 12.25H2.07812C1.88672 12.25 1.75 12.1133 1.75 11.9219V10.5H0.328125C0.136719 10.5 0 10.3633 0 10.1719V9.07812C0 8.91406 0.136719 8.75 0.328125 8.75H1.75V7.875H0.328125C0.136719 7.875 0 7.73828 0 7.54688V6.31641C0 6.15234 0.136719 5.98828 0.328125 5.98828H1.75V0.328125C1.75 0.164062 1.88672 0 2.07812 0H6.53516C8.85938 0 10.5 1.58594 10.5 3.9375C10.5 6.26172 8.85938 7.875 6.53516 7.875ZM3.99219 1.88672V5.98828H6.125C7.4375 5.98828 8.20312 5.16797 8.20312 3.9375C8.20312 2.67969 7.4375 1.88672 6.15234 1.88672H3.99219Z" fill="white"/>
            </svg>
          </div>
          <span class="onboarding-2__feature-text">Дополнительный доход каждый день</span>
        </div>
        <div class="onboarding-2__feature">
          <div class="onboarding-2__feature-circle">
            <svg class="onboarding-2__feature-icon" width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.4375 0C8.14844 0 8.75 0.601562 8.75 1.3125V12.6875C8.75 13.4258 8.14844 14 7.4375 14H1.3125C0.574219 14 0 13.4258 0 12.6875V1.3125C0 0.601562 0.574219 0 1.3125 0H7.4375ZM4.375 13.125C4.83984 13.125 5.25 12.7422 5.25 12.25C5.25 11.7852 4.83984 11.375 4.375 11.375C3.88281 11.375 3.5 11.7852 3.5 12.25C3.5 12.7422 3.88281 13.125 4.375 13.125ZM7.4375 10.1719V1.64062C7.4375 1.47656 7.27344 1.3125 7.10938 1.3125H1.64062C1.44922 1.3125 1.3125 1.47656 1.3125 1.64062V10.1719C1.3125 10.3633 1.44922 10.5 1.64062 10.5H7.10938C7.27344 10.5 7.4375 10.3633 7.4375 10.1719Z" fill="white"/>
            </svg>
          </div>
          <span class="onboarding-2__feature-text">Управление через приложение</span>
        </div>
        <div class="onboarding-2__feature">
          <div class="onboarding-2__feature-circle">
            <svg class="onboarding-2__feature-icon" width="12" height="11" viewBox="0 0 18 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.8672 0C12.1133 0 12.332 0.109375 12.4961 0.273438L13.9727 1.75V7.05469C13.918 6.97266 13.8359 6.91797 13.7812 6.83594L9.78906 3.60938L10.5 2.95312C10.6914 2.78906 10.6914 2.51562 10.5273 2.35156C10.3633 2.16016 10.0898 2.16016 9.89844 2.32422L7.73828 4.32031C7.71094 4.32031 7.71094 4.32031 7.71094 4.32031C7.24609 4.73047 6.53516 4.62109 6.17969 4.23828C5.79688 3.82812 5.79688 3.14453 6.23438 2.70703L8.94141 0.246094C9.10547 0.0820312 9.29688 0 9.51562 0H11.8672ZM14.875 1.77734H17.5V8.77734H15.75C15.2578 8.77734 14.875 8.36719 14.875 7.90234V1.77734ZM16.1875 7.90234C16.4062 7.90234 16.625 7.68359 16.625 7.46484C16.625 7.21875 16.4062 7.02734 16.1875 7.02734C15.9414 7.02734 15.75 7.21875 15.75 7.46484C15.75 7.68359 15.9414 7.90234 16.1875 7.90234ZM0 8.75V1.77734H2.625V7.875C2.625 8.36719 2.21484 8.75 1.75 8.75H0ZM1.3125 7.02734C1.06641 7.02734 0.875 7.21875 0.875 7.46484C0.875 7.68359 1.06641 7.90234 1.3125 7.90234C1.53125 7.90234 1.75 7.68359 1.75 7.46484C1.75 7.21875 1.53125 7.02734 1.3125 7.02734ZM13.207 7.51953C13.5898 7.82031 13.6445 8.36719 13.3438 8.75L13.0977 9.07812C12.7695 9.46094 12.2227 9.51562 11.8672 9.21484L11.7031 9.07812L10.8555 10.1445C10.5 10.582 9.84375 10.6367 9.40625 10.2812L8.94141 9.87109H8.91406C8.3125 10.6094 7.21875 10.7461 6.45312 10.1172L3.99219 7.875H3.5V1.75L4.97656 0.273438C5.14062 0.109375 5.35938 0 5.60547 0H7.90234L5.66016 2.05078C4.86719 2.78906 4.8125 4.04688 5.52344 4.83984C6.26172 5.63281 7.49219 5.71484 8.3125 4.94922L9.13281 4.21094L13.207 7.51953Z" fill="white"/>
            </svg>
          </div>
          <span class="onboarding-2__feature-text">Проверенные арендаторы</span>
        </div>
      </div>

      <div class="onboarding-2__footer">
        <div class="onboarding-2__progress">
          <div class="onboarding-2__progress-dot"></div>
          <div class="onboarding-2__progress-dot onboarding-2__progress-dot--active"></div>
        </div>
        <button type="button" class="onboarding-2__button onboarding-2__button--primary" @click="props.onNext">
          Начать использовать
        </button>
        <button type="button" class="onboarding-2__button onboarding-2__button--secondary" @click="props.onLogin">
          У меня уже есть аккаунт
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.onboarding-2 {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  padding: 0;
}

.onboarding-2__container {
  width: 100%;
  max-width: 281px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  border-radius: 40px;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
}

.onboarding-2__header {
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
.onboarding-2__illustration {
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
.onboarding-2__oval-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 212px;
  height: 144px;
  z-index: 0;
}

/* White rounded square */
.onboarding-2__square {
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

/* Center money/coins icon */
.onboarding-2__center-icon {
  width: 36px;
  height: 36px;
  position: relative;
  z-index: 2;
  display: block;
}

/* Share badge (top-right) */
.onboarding-2__share-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  background: #3B82F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  z-index: 3;
}

.onboarding-2__share-icon {
  width: 18px;
  height: 20px;
  display: block;
}

/* Plus/add badge (bottom-left) */
.onboarding-2__plus-badge {
  position: absolute;
  bottom: -8px;
  left: -8px;
  width: 36px;
  height: 36px;
  background: #22C55E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.onboarding-2__plus-icon {
  width: 14px;
  height: 14px;
  display: block;
}

.onboarding-2__title {
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

.onboarding-2__subtitle {
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
.onboarding-2__features {
  padding: 32px 60px 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.onboarding-2__feature {
  display: flex;
  align-items: center;
  gap: 14px;
}

.onboarding-2__feature-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FFFFFF33;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.onboarding-2__feature-icon {
  width: auto;
  height: 20px;
  display: block;
}

.onboarding-2__feature-text {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #ffffff;
}

.onboarding-2__footer {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: transparent;
  flex-shrink: 0;
}

.onboarding-2__progress {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  padding-top: 16px;
  padding-bottom: 16px;
}

.onboarding-2__progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.onboarding-2__progress-dot--active {
  width: 24px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 3px;
}

.onboarding-2__button {
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

.onboarding-2__button--primary {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
}

.onboarding-2__button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.onboarding-2__button--primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.onboarding-2__button--secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 0;
  box-shadow: none;
}

.onboarding-2__button--secondary:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 480px) {
  .onboarding-2__container {
    max-width: 100%;
    border-radius: 0;
    min-height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
  }

  .onboarding-2 {
    padding: 0;
  }

  .onboarding-2__header {
    padding: 62px 20px 24px;
    gap: 20px;
  }

  .onboarding-2__illustration {
    width: 180px;
    height: 122px;
    margin-top: 16px;
  }

  .onboarding-2__oval-bg {
    width: 250px;
    height: 182px;
  }

  .onboarding-2__square {
    width: 72px;
    height: 72px;
    border-radius: 20px;
  }

  .onboarding-2__center-icon {
    width: 32px;
    height: 32px;
  }

  .onboarding-2__share-badge {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }

  .onboarding-2__share-icon {
    width: 16px;
    height: 18px;
  }

  .onboarding-2__plus-badge {
    width: 32px;
    height: 32px;
  }

  .onboarding-2__plus-icon {
    width: 14px;
    height: 14px;
  }

  .onboarding-2__title {
    font-size: 32px;
    max-width: 320px;
    margin-top: 10px;
  }

  .onboarding-2__subtitle {
    font-size: 15px;
    max-width: 300px;
  }

  .onboarding-2__features {
    padding: 28px 60px 0;
    gap: 22px;
  }

  .onboarding-2__feature {
    gap: 12px;
  }

  .onboarding-2__feature-text {
    font-size: 13px;
  }

  .onboarding-2__footer {
    padding: 0 20px 20px;
    gap: 10px;
  }

  .onboarding-2__button {
    padding: 14px 20px;
    font-size: 15px;
  }

  .onboarding-2__button--secondary {
    padding: 6px 0;
    font-size: 13px;
  }
}

/* iPhone 13 Pro and smaller */
@media (max-width: 390px) {
  .onboarding-2__title {
    font-size: 16px;
    max-width: 280px;
  }

  .onboarding-2__subtitle {
    font-size: 13px;
    max-width: 280px;
  }

  .onboarding-2__features {
    padding: 10px 60px 0;
  }
}

/* Tablet styles (768px and up) - Only applies to tablets and larger, mobile screens remain unchanged */
@media (min-width: 768px) and (max-width: 1023px) {
  .onboarding-2__container {
    max-width: 768px;
    margin: 0 auto;
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .onboarding-2__header {
    padding: 60px 40px 32px;
    gap: 28px;
    flex: 0 0 auto;
  }

  .onboarding-2__illustration {
    width: 280px;
    height: 190px;
  }

  .onboarding-2__oval-bg {
    width: 280px;
    height: 190px;
  }

  .onboarding-2__square {
    width: 96px;
    height: 96px;
    border-radius: 28px;
  }

  .onboarding-2__center-icon {
    width: 50px;
    height: 50px;
  }

  .onboarding-2__share-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    top: -10px;
    right: -10px;
  }

  .onboarding-2__plus-badge {
    width: 36px;
    height: 36px;
    bottom: -10px;
    left: -10px;
  }

  .onboarding-2__title {
    font-size: 36px;
    max-width: 550px;
    margin-top: 8px;
  }

  .onboarding-2__subtitle {
    font-size: 17px;
    max-width: 550px;
  }

  .onboarding-2__features {
    padding: 32px 60px 0;
    gap: 24px;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }

  .onboarding-2__feature {
    gap: 18px;
  }

  .onboarding-2__feature-circle {
    width: 40px;
    height: 40px;
  }

  .onboarding-2__feature-icon {
    height: 24px;
  }

  .onboarding-2__feature-text {
    font-size: 16px;
  }

  .onboarding-2__footer {
    padding: 0 40px 24px;
    gap: 12px;
    flex: 0 0 auto;
    margin-top: auto;
  }

  .onboarding-2__progress {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .onboarding-2__button {
    padding: 16px 28px;
    font-size: 17px;
    border-radius: 17px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .onboarding-2__button--secondary {
    padding: 8px 0;
    font-size: 15px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

/* Small desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .onboarding-2__header {
    padding: 100px 64px 56px;
    gap: 48px;
  }

  .onboarding-2__illustration {
    width: 340px;
    height: 230px;
  }

  .onboarding-2__oval-bg {
    width: 340px;
    height: 230px;
  }

  .onboarding-2__square {
    width: 120px;
    height: 120px;
    border-radius: 32px;
  }

  .onboarding-2__money-icon {
    width: 62px;
    height: 62px;
  }

  .onboarding-2__share-badge {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    top: -12px;
    right: -12px;
  }

  .onboarding-2__plus-badge {
    width: 44px;
    height: 44px;
    bottom: -12px;
    left: -12px;
  }

  .onboarding-2__title {
    font-size: 36px;
    max-width: 700px;
  }

  .onboarding-2__subtitle {
    font-size: 18px;
    max-width: 700px;
  }

  .onboarding-2__features {
    padding: 56px 100px 0;
    gap: 32px;
  }

  .onboarding-2__feature {
    gap: 20px;
  }

  .onboarding-2__feature-circle {
    width: 48px;
    height: 48px;
  }

  .onboarding-2__feature-icon {
    height: 28px;
  }

  .onboarding-2__feature-text {
    font-size: 16px;
  }

  .onboarding-2__footer {
    padding: 0 64px 40px;
    gap: 20px;
  }

  .onboarding-2__button {
    padding: 20px 40px;
    font-size: 18px;
    border-radius: 20px;
  }

  .onboarding-2__button--secondary {
    padding: 12px 0;
    font-size: 16px;
  }
}

/* Large desktop styles (1440px and up) - Keep content contained like mobile */
@media (min-width: 1440px) {
  .onboarding-2__container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 40px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .onboarding-2__header {
    padding: 80px 48px 48px;
    gap: 40px;
  }

  .onboarding-2__illustration {
    width: 280px;
    height: 190px;
  }

  .onboarding-2__oval-bg {
    width: 280px;
    height: 190px;
  }

  .onboarding-2__square {
    width: 96px;
    height: 96px;
    border-radius: 28px;
  }

  .onboarding-2__money-icon {
    width: 50px;
    height: 50px;
  }

  .onboarding-2__share-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    top: -10px;
    right: -10px;
  }

  .onboarding-2__plus-badge {
    width: 36px;
    height: 36px;
    bottom: -10px;
    left: -10px;
  }

  .onboarding-2__title {
    font-size: 34px;
    max-width: 500px;
  }

  .onboarding-2__subtitle {
    font-size: 16px;
    max-width: 500px;
  }

  .onboarding-2__features {
    padding: 48px 60px 0;
    gap: 28px;
  }

  .onboarding-2__feature-text {
    font-size: 14px;
  }

  .onboarding-2__footer {
    padding: 0 48px 32px;
    gap: 16px;
  }

  .onboarding-2__button {
    padding: 18px 32px;
    font-size: 16px;
    border-radius: 18px;
  }

  .onboarding-2__button--secondary {
    padding: 10px 0;
    font-size: 14px;
  }
}
</style>
