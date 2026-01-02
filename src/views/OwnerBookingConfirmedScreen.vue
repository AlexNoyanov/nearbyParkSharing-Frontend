<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  request: {
    id: string
    address: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    renterName: string
    status: 'awaiting' | 'cancelled' | 'completed' | 'active'
  }
}>()

const emit = defineEmits<{
  (e: 'ok'): void
  (e: 'go-home'): void
  (e: 'open-chat'): void
}>()

const expandedSections = ref<Record<string, boolean>>({
  earlyStart: false,
  earlyEnd: false,
  dailyMonthlyEnd: false,
  monthlyPayment: false,
})

const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const formatDate = (dateStr: string, timeStr: string) => {
  const date = new Date(`${dateStr}T${timeStr}`)
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  if (props.request.startDate === props.request.endDate) {
    const endTime = timeFormatter.format(new Date(`${props.request.endDate}T${props.request.endTime}`))
    return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}-${endTime}`
  } else {
    const endDate = new Date(`${props.request.endDate}T${props.request.endTime}`)
    return `${dateFormatter.format(date)} — ${dateFormatter.format(endDate)}`
  }
}

const ownerProfit = '₽144'

onMounted(() => {
  // Прокручиваем страницу вверх при открытии
  const contentElement = document.querySelector('.app__content')
  if (contentElement) {
    contentElement.scrollTo(0, 0)
  }
  window.scrollTo(0, 0)
})
</script>

<template>
  <section class="owner-booking-confirmed">
    <header class="owner-booking-confirmed__header">
      <button type="button" class="owner-booking-confirmed__back" @click="emit('go-home')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z"
            fill="#4B5563"
          />
        </svg>
      </button>
      <h1 class="owner-booking-confirmed__title">Запрос на бронирование</h1>
    </header>

    <div class="owner-booking-confirmed__content">
      <!-- Success banner -->
      <div class="owner-booking-confirmed__banner">
        <div class="owner-booking-confirmed__banner-icon">
          <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3125 22.0898L0.585938 12.3633C0 11.7773 0 10.7812 0.585938 10.1953L2.69531 8.08594C3.28125 7.5 4.21875 7.5 4.80469 8.08594L11.4258 14.6484L25.4883 0.585938C26.0742 0 27.0117 0 27.5977 0.585938L29.707 2.69531C30.293 3.28125 30.293 4.27734 29.707 4.86328L12.4805 22.0898C11.8945 22.6758 10.8984 22.6758 10.3125 22.0898Z" fill="#16A34A"/>
          </svg>
        </div>
        <div class="owner-booking-confirmed__banner-text">
          <h2 class="owner-booking-confirmed__banner-title">Бронирование</h2>
          <h2 class="owner-booking-confirmed__banner-title">подтверждено!</h2>
        </div>
      </div>

      <!-- Booking details card -->
      <article class="owner-booking-confirmed__card">
        <h3 class="owner-booking-confirmed__card-title">Детали бронирования</h3>
        
        <div class="owner-booking-confirmed__detail-row">
          <span class="owner-booking-confirmed__detail-label">Арендатор</span>
          <span class="owner-booking-confirmed__detail-value">{{ props.request.renterName }}</span>
        </div>

        <div class="owner-booking-confirmed__detail-row">
          <span class="owner-booking-confirmed__detail-label">Автомобиль</span>
          <div class="owner-booking-confirmed__detail-value-group">
            <span class="owner-booking-confirmed__detail-value">Toyota Camry</span>
            <span class="owner-booking-confirmed__detail-value">(А123БВ777)</span>
          </div>
        </div>

        <div class="owner-booking-confirmed__detail-row">
          <span class="owner-booking-confirmed__detail-label">Дата и время</span>
          <span class="owner-booking-confirmed__detail-value">{{ formatDate(props.request.startDate, props.request.startTime) }}</span>
        </div>

        <div class="owner-booking-confirmed__detail-row">
          <span class="owner-booking-confirmed__detail-label">Оплата</span>
          <span class="owner-booking-confirmed__detail-value owner-booking-confirmed__detail-value--success">Успешно</span>
        </div>

        <div class="owner-booking-confirmed__detail-row">
          <span class="owner-booking-confirmed__detail-label">Ваша прибыль</span>
          <span class="owner-booking-confirmed__detail-value owner-booking-confirmed__detail-value--profit">{{ ownerProfit }}</span>
        </div>
      </article>

      <!-- What's next section -->
      <section class="owner-booking-confirmed__next-section">
        <h3 class="owner-booking-confirmed__section-title">Что дальше?</h3>
        
        <div class="owner-booking-confirmed__step">
          <div class="owner-booking-confirmed__step-number">1</div>
          <div class="owner-booking-confirmed__step-content">
            <h4 class="owner-booking-confirmed__step-title">Арендатор получит уведомление</h4>
            <p class="owner-booking-confirmed__step-text">Он увидит подтверждение и детали бронирования</p>
          </div>
        </div>

        <div class="owner-booking-confirmed__step">
          <div class="owner-booking-confirmed__step-number">2</div>
          <div class="owner-booking-confirmed__step-content">
            <h4 class="owner-booking-confirmed__step-title">Освободите парковочное место</h4>
            <p class="owner-booking-confirmed__step-text">Убедитесь, что место свободно к времени заезда</p>
          </div>
        </div>

        <div class="owner-booking-confirmed__step">
          <div class="owner-booking-confirmed__step-number">3</div>
          <div class="owner-booking-confirmed__step-content">
            <h4 class="owner-booking-confirmed__step-title">Следите за прибытием</h4>
            <p class="owner-booking-confirmed__step-text">Согласуйте детали заезда в чате</p>
          </div>
        </div>

        <div class="owner-booking-confirmed__step">
          <div class="owner-booking-confirmed__step-number">4</div>
          <div class="owner-booking-confirmed__step-content">
            <h4 class="owner-booking-confirmed__step-title">Получите оплату</h4>
            <p class="owner-booking-confirmed__step-text">Мы возместим средства на вашу карту после завершения аренды</p>
          </div>
        </div>
      </section>

      <!-- Expandable sections -->
      <article class="owner-booking-confirmed__expandable">
        <button
          type="button"
          class="owner-booking-confirmed__expandable-header"
          @click="toggleSection('earlyStart')"
        >
          <h4 class="owner-booking-confirmed__expandable-title">
            Ранее начало бронирования в почасовом тарифе
          </h4>
          <svg
            class="owner-booking-confirmed__expandable-icon"
            :class="{ 'owner-booking-confirmed__expandable-icon--expanded': expandedSections.earlyStart }"
            width="19"
            height="8"
            viewBox="0 0 19 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L9.5 7L18 1" stroke="#D9D9D9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div
          v-if="expandedSections.earlyStart"
          class="owner-booking-confirmed__expandable-content"
        >
          <p class="owner-booking-confirmed__expandable-text">
            Если арендатор начал аренду в приложении более чем за 15 минут до времени, указанного в брони, произойдёт автоматический перерасчёт на полный час. Разница будет зачислена на ваш счёт. Убедитесь, что в статусе бронирования отображается «Активно» в это более раннее время.
          </p>
        </div>
      </article>

      <article class="owner-booking-confirmed__expandable">
        <button
          type="button"
          class="owner-booking-confirmed__expandable-header"
          @click="toggleSection('earlyEnd')"
        >
          <h4 class="owner-booking-confirmed__expandable-title">
            Досрочное завершение аренды
          </h4>
          <svg
            class="owner-booking-confirmed__expandable-icon"
            :class="{ 'owner-booking-confirmed__expandable-icon--expanded': expandedSections.earlyEnd }"
            width="19"
            height="8"
            viewBox="0 0 19 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L9.5 7L18 1" stroke="#D9D9D9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div
          v-if="expandedSections.earlyEnd"
          class="owner-booking-confirmed__expandable-content"
        >
          <p class="owner-booking-confirmed__expandable-text">
            Если арендатор освободил место раньше запланированного срока, перерасчёт производится только по вашему согласию. Сообщите арендатору, что для инициации перерасчёта ему необходимо написать в службу поддержки. После этого мы согласуем с вами сумму и произведём возврат.
          </p>
        </div>
      </article>

      <article class="owner-booking-confirmed__expandable">
        <button
          type="button"
          class="owner-booking-confirmed__expandable-header"
          @click="toggleSection('dailyMonthlyEnd')"
        >
          <h4 class="owner-booking-confirmed__expandable-title">
            Досрочное завершение бронирования в дневном и месячном тарифе
          </h4>
          <svg
            class="owner-booking-confirmed__expandable-icon"
            :class="{ 'owner-booking-confirmed__expandable-icon--expanded': expandedSections.dailyMonthlyEnd }"
            width="19"
            height="8"
            viewBox="0 0 19 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L9.5 7L18 1" stroke="#D9D9D9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div
          v-if="expandedSections.dailyMonthlyEnd"
          class="owner-booking-confirmed__expandable-content"
        >
          <p class="owner-booking-confirmed__expandable-text">
            Плата взимается за полные сутки или месяц, даже при досрочном выезде.
          </p>
        </div>
      </article>

      <article class="owner-booking-confirmed__expandable">
        <button
          type="button"
          class="owner-booking-confirmed__expandable-header"
          @click="toggleSection('monthlyPayment')"
        >
          <h4 class="owner-booking-confirmed__expandable-title">
            Оплата помесячной аренды
          </h4>
          <svg
            class="owner-booking-confirmed__expandable-icon"
            :class="{ 'owner-booking-confirmed__expandable-icon--expanded': expandedSections.monthlyPayment }"
            width="19"
            height="8"
            viewBox="0 0 19 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L9.5 7L18 1" stroke="#D9D9D9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div
          v-if="expandedSections.monthlyPayment"
          class="owner-booking-confirmed__expandable-content"
        >
          <p class="owner-booking-confirmed__expandable-text">
            Оплата за место взимается помесячно и всегда авансом. Каждый месяц мы автоматически списываем плату за следующий месяц и переводим ее на ваш счет. Если попытки оплаты будут неуспешны, то сообщим вам в чате.
          </p>
        </div>
      </article>

      <!-- Contact renter section -->
      <section class="owner-booking-confirmed__contact">
        <h4 class="owner-booking-confirmed__contact-title">Связь с арендатором</h4>
        <button type="button" class="owner-booking-confirmed__chat-button" @click="emit('open-chat')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0C3.13438 0 0 2.57813 0 5.75C0 7.84375 1.15625 9.65625 3 10.8438V14L6.34375 11.6562C6.5625 11.6875 6.78125 11.7188 7 11.7188C10.8656 11.7188 14 9.14063 14 5.96875C14 2.79688 10.8656 0 7 0Z" fill="white"/>
          </svg>
          <span>Чат</span>
        </button>
      </section>
    </div>

    <footer class="owner-booking-confirmed__footer">
      <button type="button" class="owner-booking-confirmed__button-ok" @click="emit('ok')">
        Ок
      </button>
      <button type="button" class="owner-booking-confirmed__button-home" @click="emit('go-home')">
        Вернуться на главную
      </button>
    </footer>
  </section>
</template>

<style scoped>
.owner-booking-confirmed {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: auto;
}

.owner-booking-confirmed__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px 13px;
  border-bottom: 1px solid #e5e7eb;
}

.owner-booking-confirmed__back {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.owner-booking-confirmed__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
  text-align: center;
  flex: 1;
}

.owner-booking-confirmed__content {
  flex: 1;
  padding: 18px 17.67px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.owner-booking-confirmed__banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.owner-booking-confirmed__banner-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.owner-booking-confirmed__banner-icon svg {
  width: 31px;
  height: 23px;
  display: block;
}

.owner-booking-confirmed__banner-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -8px;
}

.owner-booking-confirmed__banner-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.09;
  color: #1f2937;
  text-align: center;
}

.owner-booking-confirmed__card {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 8.5px 13px 10px;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.owner-booking-confirmed__card-title {
  margin: 0 0 8px 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 2.09;
  color: #1f2937;
  text-align: center;
}

.owner-booking-confirmed__detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.owner-booking-confirmed__detail-label {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 2.06;
  color: #4b5563;
  text-align: left;
  justify-self: start;
}

.owner-booking-confirmed__detail-value {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 2.24;
  color: #1f2937;
  text-align: center;
  justify-self: center;
}

.owner-booking-confirmed__detail-value-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -6px;
  justify-self: center;
}

.owner-booking-confirmed__detail-value--success {
  color: #16a34a;
  text-align: right;
  justify-self: end;
}

.owner-booking-confirmed__detail-value--profit {
  color: #16a34a;
  text-align: right;
  justify-self: end;
}

.owner-booking-confirmed__next-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.owner-booking-confirmed__section-title {
  margin: 0 0 12px 0;
  font-family: Inter, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 2.09;
  color: #1f2937;
  text-align: center;
}

.owner-booking-confirmed__step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.owner-booking-confirmed__step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dbeafe;
  color: #2563eb;
  font-family: Inter, sans-serif;
  font-size: 11.8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.owner-booking-confirmed__step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: -5.5px;
}

.owner-booking-confirmed__step-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 2.24;
  color: #1f2937;
}

.owner-booking-confirmed__step-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 11.7px;
  font-weight: 400;
  line-height: 2.06;
  color: #4b5563;
}

.owner-booking-confirmed__expandable {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  background-color: #ffffff;
  overflow: hidden;
}

.owner-booking-confirmed__expandable-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.owner-booking-confirmed__expandable-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 2.02;
  color: #1f2937;
  flex: 1;
}

.owner-booking-confirmed__expandable-icon {
  width: 19px;
  height: 8px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.owner-booking-confirmed__expandable-icon--expanded {
  transform: rotate(180deg);
}

.owner-booking-confirmed__expandable-content {
  padding: 0 13px 13px;
}

.owner-booking-confirmed__expandable-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 11.7px;
  font-weight: 400;
  line-height: 2.06;
  color: #4b5563;
}

.owner-booking-confirmed__contact {
  background-color: #f3f4f6;
  border-radius: 12px;
  padding: 9px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.owner-booking-confirmed__contact-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 13.4px;
  font-weight: 700;
  line-height: 2.09;
  color: #1f2937;
  text-align: center;
}

.owner-booking-confirmed__chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
  background: linear-gradient(90deg, #9333ea 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-size: 11.5px;
  font-weight: 400;
  cursor: pointer;
  width: 105.13px;
  height: 36px;
  margin: 0 auto;
}

.owner-booking-confirmed__chat-button svg {
  width: 14px;
  height: 14px;
}

.owner-booking-confirmed__footer {
  margin-top: auto;
  padding: 13px 18px 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.owner-booking-confirmed__button-ok {
  width: 100%;
  padding: 8px 0 9px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(37, 99, 235, 1) 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-size: 13.2px;
  font-weight: 700;
  line-height: 2.12;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.owner-booking-confirmed__button-home {
  width: 100%;
  padding: 3.5px 0;
  background: transparent;
  border: none;
  color: #4b5563;
  font-family: Inter, sans-serif;
  font-size: 9.7px;
  font-weight: 400;
  line-height: 2.06;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .owner-booking-confirmed__content {
    padding: 16px;
  }
}
</style>

