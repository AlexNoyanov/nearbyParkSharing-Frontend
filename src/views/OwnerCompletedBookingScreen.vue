<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
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
  (e: 'open-chat'): void
}>()

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
  <section class="owner-completed-booking">
    <header class="owner-completed-booking__header">
      <button type="button" class="owner-completed-booking__back" @click="emit('go-home')" aria-label="Назад">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.125 12.8125L7.4375 13.5C7.125 13.7812 6.65625 13.7812 6.375 13.5L0.3125 7.40625C0 7.125 0 6.65625 0.3125 6.375L6.375 0.28125C6.65625 0 7.15625 0 7.4375 0.28125L8.125 0.96875C8.4375 1.28125 8.40625 1.75 8.125 2.0625L4.34375 5.625H13.3438C13.75 5.625 14.0938 5.96875 14.0938 6.375V7.375C14.0938 7.8125 13.75 8.125 13.3438 8.125H4.34375L8.125 11.7188C8.40625 12.0312 8.4375 12.5 8.125 12.8125Z"
            fill="#4B5563"
          />
        </svg>
      </button>
      <h1 class="owner-completed-booking__title">Запрос на бронирование</h1>
    </header>

    <div class="owner-completed-booking__content">
      <!-- Success banner -->
      <div class="owner-completed-booking__banner">
        <div class="owner-completed-booking__banner-icon">
          <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3125 22.0898L0.585938 12.3633C0 11.7773 0 10.7812 0.585938 10.1953L2.69531 8.08594C3.28125 7.5 4.21875 7.5 4.80469 8.08594L11.4258 14.6484L25.4883 0.585938C26.0742 0 27.0117 0 27.5977 0.585938L29.707 2.69531C30.293 3.28125 30.293 4.27734 29.707 4.86328L12.4805 22.0898C11.8945 22.6758 10.8984 22.6758 10.3125 22.0898Z" fill="white"/>
          </svg>
        </div>
        <div class="owner-completed-booking__banner-text">
          <h2 class="owner-completed-booking__banner-title">Бронирование</h2>
          <h2 class="owner-completed-booking__banner-title">завершено!</h2>
        </div>
      </div>

      <!-- Booking details card -->
      <article class="owner-completed-booking__card">
        <h3 class="owner-completed-booking__card-title">Детали бронирования</h3>
        
        <div class="owner-completed-booking__detail-row">
          <span class="owner-completed-booking__detail-label">Арендатор</span>
          <span class="owner-completed-booking__detail-value">{{ props.request.renterName }}</span>
        </div>

        <div class="owner-completed-booking__detail-row">
          <span class="owner-completed-booking__detail-label">Автомобиль</span>
          <div class="owner-completed-booking__detail-value-group">
            <span class="owner-completed-booking__detail-value">Toyota Camry</span>
            <span class="owner-completed-booking__detail-value">(А123БВ777)</span>
          </div>
        </div>

        <div class="owner-completed-booking__detail-row">
          <span class="owner-completed-booking__detail-label">Дата и время</span>
          <span class="owner-completed-booking__detail-value">{{ formatDate(props.request.startDate, props.request.startTime) }}</span>
        </div>

        <div class="owner-completed-booking__detail-row">
          <span class="owner-completed-booking__detail-label">Оплата</span>
          <span class="owner-completed-booking__detail-value owner-completed-booking__detail-value--success">Успешно</span>
        </div>

        <div class="owner-completed-booking__detail-row">
          <span class="owner-completed-booking__detail-label">Ваша прибыль</span>
          <span class="owner-completed-booking__detail-value owner-completed-booking__detail-value--profit">{{ ownerProfit }}</span>
        </div>
      </article>
    </div>

    <footer class="owner-completed-booking__footer">
      <button type="button" class="owner-completed-booking__button-home" @click="emit('go-home')">
        Вернуться на главную
      </button>
    </footer>
  </section>
</template>

<style scoped>
.owner-completed-booking {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: auto;
}

.owner-completed-booking__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px 13px;
  border-bottom: 1px solid #e5e7eb;
}

.owner-completed-booking__back {
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

.owner-completed-booking__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
  text-align: center;
  flex: 1;
}

.owner-completed-booking__content {
  flex: 1;
  padding: 18px 17.67px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.owner-completed-booking__banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.owner-completed-booking__banner-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.owner-completed-booking__banner-icon svg {
  width: 31px;
  height: 23px;
  display: block;
}

.owner-completed-booking__banner-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -8px;
}

.owner-completed-booking__banner-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
  color: #1f2937;
  text-align: center;
}

.owner-completed-booking__card {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 8.5px 13px 10px;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.owner-completed-booking__card-title {
  margin: 0 0 8px 0;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 2.09;
  color: #1f2937;
  text-align: center;
}

.owner-completed-booking__detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.owner-completed-booking__detail-label {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 2.06;
  color: #4b5563;
  text-align: left;
  justify-self: start;
}

.owner-completed-booking__detail-value {
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 2.24;
  color: #1f2937;
  text-align: center;
  justify-self: center;
}

.owner-completed-booking__detail-value-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -6px;
  justify-self: center;
}

.owner-completed-booking__detail-value--success {
  color: #16a34a;
  text-align: right;
  justify-self: end;
}

.owner-completed-booking__detail-value--profit {
  color: #16a34a;
  text-align: right;
  justify-self: end;
}

.owner-completed-booking__footer {
  margin-top: auto;
  padding: 13px 18px 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.owner-completed-booking__button-ok {
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

.owner-completed-booking__button-home {
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
  .owner-completed-booking__content {
    padding: 16px;
  }
}
</style>

