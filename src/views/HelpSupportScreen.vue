<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

type FAQCategory = 'all' | 'parking' | 'payment' | 'account'

type FAQItem = {
  id: string
  question: string
  answer: string
  category: 'parking' | 'payment'
}

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'contact-support'): void
}>()

const selectedCategory = ref<FAQCategory>('all')
const expandedItems = ref<Set<string>>(new Set(['1', '2'])) // First two items expanded by default

// FAQ data
const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Что делать, если место занято?',
    answer: 'Отмените бронирование и проверьте наличие других мест рядом. Мы свяжемся с арендатором и уточним актуальность объявления',
    category: 'parking'
  },
  {
    id: '2',
    question: 'Что делать, если я не могу связаться с арендатором для въезда?',
    answer: 'Отмените бронирование и проверьте наличие других мест рядом. Мы свяжемся с арендатором и уточним актуальность объявления',
    category: 'parking'
  },
  {
    id: '3',
    question: 'Ранее начало бронирования в почасовом тарифе',
    answer: 'Вы можете начать бронирование раньше запланированного времени. Стоимость будет рассчитана с момента фактического начала использования парковочного места.',
    category: 'parking'
  },
  {
    id: '4',
    question: 'Досрочное завершение аренды',
    answer: 'При досрочном завершении аренды возврат средств производится пропорционально неиспользованному времени. Обратитесь в службу поддержки для уточнения деталей.',
    category: 'parking'
  },
  {
    id: '5',
    question: 'Досрочное завершение бронирования в дневном и месячном тарифе',
    answer: 'При досрочном завершении бронирования возврат средств рассчитывается согласно тарифу и условиям отмены. Детали можно уточнить в службе поддержки.',
    category: 'parking'
  },
  {
    id: '6',
    question: 'Оплата помесячной аренды',
    answer: 'Оплата помесячной аренды производится автоматически в начале каждого месяца. Вы можете изменить способ оплаты в настройках профиля.',
    category: 'payment'
  }
]

const filteredItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return faqItems
  }
  return faqItems.filter(item => item.category === selectedCategory.value)
})

const toggleItem = (id: string) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const isExpanded = (id: string) => {
  return expandedItems.value.has(id)
}

const handleContactSupport = () => {
  emit('contact-support')
  // Open email client
  window.location.href = 'mailto:support@parkshare.ru'
}

// Scroll to top when component is mounted
onMounted(async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const contentElement = document.querySelector('.help-support__content')
  if (contentElement) {
    contentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
</script>

<template>
  <section class="help-support">
    <header class="help-support__header">
      <button type="button" class="help-support__back" @click="emit('back')" aria-label="Назад">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 11.375L8.1875 12C7.875 12.3125 7.40625 12.3125 7.125 12L1.3125 6.125C1 5.8125 1 5.34375 1.3125 5.0625L7.125 -0.8125C7.40625 -1.125 7.90625 -1.125 8.1875 -0.8125L8.75 -0.1875C9.0625 0.125 9.03125 0.59375 8.75 0.90625L4.84375 4.625H13.3438C13.75 4.625 14.0938 4.96875 14.0938 5.375V6.375C14.0938 6.8125 13.75 7.125 13.3438 7.125H4.84375L8.75 10.8438C9.03125 11.1562 9.0625 11.625 8.75 11.375Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="help-support__title" aria-label="Часто задаваемые вопросы">
        <span class="help-support__title-line help-support__title-line--top">Часто задаваемые</span>
        <span class="help-support__title-line help-support__title-line--bottom">вопросы</span>
      </h1>
      <div class="help-support__header-spacer"></div>
    </header>

    <div class="help-support__content">
      <!-- Category Filters -->
      <div class="help-support__filters">
        <button
          type="button"
          class="help-support__filter"
          :class="{ 'help-support__filter--active': selectedCategory === 'all' }"
          @click="selectedCategory = 'all'"
        >
          Все
        </button>
        <button
          type="button"
          class="help-support__filter"
          :class="{ 'help-support__filter--active': selectedCategory === 'parking' }"
          @click="selectedCategory = 'parking'"
        >
          Парковка
        </button>
        <button
          type="button"
          class="help-support__filter"
          :class="{ 'help-support__filter--active': selectedCategory === 'payment' }"
          @click="selectedCategory = 'payment'"
        >
          Оплата
        </button>
        <button
          type="button"
          class="help-support__filter"
          :class="{ 'help-support__filter--active': selectedCategory === 'account' }"
          @click="selectedCategory = 'account'"
        >
          Аккаунт
        </button>
      </div>

      <!-- Popular Questions Section -->
      <div class="help-support__section">
        <h2 class="help-support__section-title">Популярные вопросы</h2>
        
        <div class="help-support__faq-list">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="help-support__faq-item"
            :class="{ 'help-support__faq-item--expanded': isExpanded(item.id) }"
          >
            <button
              type="button"
              class="help-support__faq-question"
              @click="toggleItem(item.id)"
            >
              <span class="help-support__faq-question-text">{{ item.question }}</span>
              <svg
                class="help-support__faq-chevron"
                :class="{ 'help-support__faq-chevron--expanded': isExpanded(item.id) }"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div
              v-if="isExpanded(item.id)"
              class="help-support__faq-answer"
            >
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Support Contact Section -->
      <div class="help-support__support-section">
        <div class="help-support__support-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 9.75V15C9 15.8438 8.29688 16.5 7.5 16.5H6.75C5.0625 16.5 3.75 15.1875 3.75 13.5V11.25C3.75 9.60938 5.0625 8.25 6.75 8.25H7.5C8.29688 8.25 9 8.95312 9 9.75ZM17.25 16.5H16.5C15.6562 16.5 15 15.8438 15 15V9.75C15 8.95312 15.6562 8.25 16.5 8.25H17.25C18.8906 8.25 20.25 9.60938 20.25 11.25V13.5C20.25 15.1875 18.8906 16.5 17.25 16.5ZM12 0C18.6562 0 23.7656 5.57812 24 12V19.7812C24 22.125 22.0781 24 19.7344 24H11.25C9.98438 24 9 23.0156 9 21.75C9 20.5312 9.98438 19.5 11.25 19.5H12.75C13.9688 19.5 15 20.5312 15 21.75H19.7344C20.8594 21.75 21.75 20.9062 21.75 19.7812C21.75 19.7812 21.7031 12.1406 21.7031 12H21.75C21.75 6.65625 17.3438 2.25 12 2.25C6.60938 2.25 2.25 6.65625 2.25 12V12.75C2.25 13.1719 1.875 13.5 1.5 13.5H0.75C0.328125 13.5 0 13.1719 0 12.75V12C0.1875 5.57812 5.29688 0 12 0Z" fill="#2563EB"/>
          </svg>
        </div>
        <p class="help-support__support-title">Не нашли ответ?</p>
        <p class="help-support__support-subtitle">Напишите в службу поддержки</p>
        
        <button
          type="button"
          class="help-support__contact-button"
          @click="handleContactSupport"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.6875 3.96875C15.8125 3.875 16 3.96875 16 4.125V10.5C16 11.3438 15.3125 12 14.5 12H1.5C0.65625 12 0 11.3438 0 10.5V4.125C0 3.96875 0.15625 3.875 0.28125 3.96875C1 4.53125 1.90625 5.21875 5.09375 7.53125C5.75 8 6.875 9.03125 8 9.03125C9.09375 9.03125 10.25 8 10.875 7.53125C14.0625 5.21875 14.9688 4.53125 15.6875 3.96875ZM8 8C7.25 8.03125 6.21875 7.09375 5.6875 6.71875C1.53125 3.71875 1.21875 3.4375 0.28125 2.6875C0.09375 2.5625 0 2.34375 0 2.09375V1.5C0 0.6875 0.65625 0 1.5 0H14.5C15.3125 0 16 0.6875 16 1.5V2.09375C16 2.34375 15.875 2.5625 15.6875 2.6875C14.75 3.4375 14.4375 3.71875 10.2812 6.71875C9.75 7.09375 8.71875 8.03125 8 8Z" fill="#374151"/>
          </svg>
          <span>support@parkshare.ru</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.help-support {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-y: auto;
}

.help-support__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 18px;
  background: #FFFFFF;
  border-bottom: 1.33333px solid #E5E7EB;
}

.help-support__back {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: #F3F4F6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.help-support__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.15;
  color: #1F2937;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.help-support__header-spacer {
  width: 30px;
  flex-shrink: 0;
}

.help-support__title-line {
  display: block;
}

.help-support__title-line--top {
  font-size: 13.1px;
  line-height: 2.14;
}

.help-support__title-line--bottom {
  font-size: 13.6px;
  line-height: 2.06;
  margin-top: -10px;
}

.help-support__content {
  flex: 1;
  padding: 0 18px 18px;
  background: #FFFFFF;
  border: none;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  overflow: hidden;
}

.help-support__filters {
  display: flex;
  gap: 8px;
  padding: 12px 18px 11px;
  margin: 0 -18px 8px;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.help-support__filters::-webkit-scrollbar {
  display: none;
}

.help-support__filter {
  padding: 3.5px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 9999px;
  background: transparent;
  color: #4B5563;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10.2px;
  line-height: 1.96;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.help-support__filter--active {
  background: #2563EB;
  color: #FFFFFF;
  border-color: #2563EB;
}

.help-support__section {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 8px 0 18px;
}

.help-support__section-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  line-height: 2.07;
  color: #1F2937;
  text-align: center;
}

.help-support__faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.help-support__faq-item {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #FFFFFF;
  overflow: hidden;
  transition: all 0.2s ease;
}

.help-support__faq-item--expanded {
  border-color: #D1D5DB;
}

.help-support__faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
  gap: 16px;
}

.help-support__faq-question-text {
  flex: 1;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 2.03;
  color: #1F2937;
  text-align: center;
}

.help-support__faq-chevron {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.help-support__faq-chevron--expanded {
  transform: rotate(180deg);
}

.help-support__faq-answer {
  padding: 8px 12px 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 2.27;
  color: #4B5563;
  border-top: 1px solid #E5E7EB;
  margin-top: 0;
  text-align: center;
}

.help-support__support-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 18px;
  background: #F9FAFB;
  border-radius: 0;
  margin: 6px -18px 0;
}

.help-support__support-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #DBEAFE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-support__support-icon svg {
  width: 24px;
  height: 24px;
}

.help-support__support-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.1px;
  line-height: 2.14;
  color: #1F2937;
  text-align: center;
}

.help-support__support-subtitle {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 11.1px;
  line-height: 2.16;
  color: #4B5563;
  text-align: center;
}

.help-support__contact-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: #F3F4F6;
  cursor: pointer;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 11.6px;
  line-height: 2.07;
  color: #374151;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.help-support__contact-button:hover {
  background: #E5E7EB;
}

.help-support__contact-button svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Tablet styles */
@media (min-width: 768px) {
  .help-support__content {
    max-width: 768px;
    margin: 0 auto;
  }

  .help-support__header {
    padding: 16px 32px;
  }

  .help-support__title {
    font-size: 18px;
  }

  .help-support__section-title {
    font-size: 18px;
  }

  .help-support__faq-question-text,
  .help-support__faq-answer {
    font-size: 14px;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .help-support__content {
    max-width: 900px;
  }
}
</style>
