<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'

type PaymentCard = {
  id: string
  name: string
  type: 'visa' | 'mastercard' | 'mir'
  lastFour: string
  isActive: boolean
}

const props = defineProps<{
  cards?: PaymentCard[]
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'add-card', card?: PaymentCard): void
  (e: 'edit-card', card: PaymentCard): void
  (e: 'select-card', cardId: string): void
  (e: 'confirm', card: PaymentCard): void
}>()

const selectedCardId = ref<string | null>(null)
const editingCardId = ref<string | null>(null)
const editingCardName = ref<string>('')

// Используем переданные карты или дефолтные для демо
const cards = ref<PaymentCard[]>(props.cards || [
  {
    id: '1',
    name: 'Новая карта',
    type: 'visa',
    lastFour: '4532',
    isActive: true
  },
  {
    id: '2',
    name: 'Альфа',
    type: 'mastercard',
    lastFour: '8901',
    isActive: false
  },
  {
    id: '3',
    name: 'Альфа',
    type: 'mir',
    lastFour: '8901',
    isActive: false
  }
])

// Инициализируем selectedCardId активной картой
if (cards.value.length > 0) {
  const activeCard = cards.value.find(c => c.isActive)
  if (activeCard) {
    selectedCardId.value = activeCard.id
  }
}

const handleCardClick = (card: PaymentCard) => {
  // Деактивируем все карты и активируем выбранную
  cards.value.forEach(c => c.isActive = false)
  card.isActive = true
  selectedCardId.value = card.id
  emit('select-card', card.id)
}

// Обработчик добавления карты оставлен намеренно пустым (UI-кнопка без действия)

const handleConfirm = () => {
  // Находим выбранную карту по selectedCardId (который синхронизирован с активной картой)
  const selectedCard = cards.value.find(c => c.id === selectedCardId.value)
  if (!selectedCard) {
    // Если карта не найдена по ID, ищем активную карту
    const activeCard = cards.value.find(c => c.isActive === true)
    if (activeCard) {
      emit('confirm', { ...activeCard })
      return
    }
    return
  }
  
  // Передаем полную копию карты со всеми актуальными данными
  emit('confirm', {
    id: selectedCard.id,
    name: selectedCard.name,
    type: selectedCard.type,
    lastFour: selectedCard.lastFour,
    isActive: selectedCard.isActive
  })
}

const canConfirm = computed(() => {
  return selectedCardId.value !== null
})

const handleEditCard = async (card: PaymentCard, event: Event) => {
  event.stopPropagation()
  editingCardId.value = card.id
  editingCardName.value = card.name
  await nextTick()
  // Находим input по классу и фокусируем его
  const input = document.querySelector(`.payment-cards__card-name-input`) as HTMLInputElement
  if (input) {
    input.focus()
    input.select()
  }
}

const handleSaveCardName = (card: PaymentCard) => {
  if (editingCardName.value.trim()) {
    card.name = editingCardName.value.trim()
    emit('edit-card', card)
  }
  editingCardId.value = null
  editingCardName.value = ''
}

const handleCancelEdit = () => {
  editingCardId.value = null
  editingCardName.value = ''
}

const handleNameInputKeydown = (event: KeyboardEvent, card: PaymentCard) => {
  if (event.key === 'Enter') {
    handleSaveCardName(card)
  } else if (event.key === 'Escape') {
    handleCancelEdit()
  }
}

// При открытии экрана всегда прокручиваем контейнер приложения к началу,
// чтобы в видимой области был заголовок payment-cards__header
onMounted(() => {
  const appContent = document.querySelector('.app__content') as HTMLElement | null
  if (appContent) {
    appContent.scrollTop = 0
  }
  // На всякий случай сбрасываем и scroll окна (в Telegram WebApp)
  window.scrollTo(0, 0)
})
</script>

<template>
  <section class="payment-cards">
    <header class="payment-cards__header">
      <button type="button" class="payment-cards__back" @click="emit('back')" aria-label="Назад">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 11.375L8.1875 12C7.875 12.3125 7.40625 12.3125 7.125 12L1.3125 6.125C1 5.8125 1 5.34375 1.3125 5.0625L7.125 -0.8125C7.40625 -1.125 7.90625 -1.125 8.1875 -0.8125L8.75 -0.1875C9.0625 0.125 9.03125 0.59375 8.75 0.90625L4.84375 4.625H13.3438C13.75 4.625 14.0938 4.96875 14.0938 5.375V6.375C14.0938 6.8125 13.75 7.125 13.3438 7.125H4.84375L8.75 10.8438C9.03125 11.1562 9.0625 11.625 8.75 11.375Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="payment-cards__title">Способы оплаты</h1>
      <div class="payment-cards__header-spacer"></div>
    </header>

    <div class="payment-cards__content">
      <!-- Список карт -->
      <div class="payment-cards__cards-list">
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          class="payment-cards__card"
          :class="{ 'payment-cards__card--active': card.isActive }"
          @click="handleCardClick(card)"
        >
          <!-- Radio button -->
          <div class="payment-cards__radio">
            <div v-if="card.isActive" class="payment-cards__radio-inner"></div>
          </div>

          <!-- Иконка платежной системы -->
          <div class="payment-cards__card-icon">
            <div v-if="card.type === 'visa'" class="payment-cards__icon-visa">
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5234 7.03125C16.5234 7.03125 16.7695 8.33203 16.8398 8.61328H15.6797C15.7852 8.29688 16.2422 7.06641 16.2422 7.06641C16.207 7.10156 16.3477 6.75 16.418 6.53906L16.5234 7.03125ZM20.25 1.6875V14.0625C20.25 15.0117 19.4766 15.75 18.5625 15.75H1.6875C0.738281 15.75 0 15.0117 0 14.0625V1.6875C0 0.773438 0.738281 0 1.6875 0H18.5625C19.4766 0 20.25 0.773438 20.25 1.6875ZM5.34375 10.5469L7.55859 5.0625H6.08203L4.67578 8.78906L4.53516 8.05078L4.04297 5.55469C3.97266 5.20312 3.72656 5.09766 3.41016 5.0625H1.125V5.20312C1.65234 5.34375 2.14453 5.51953 2.60156 5.80078L3.86719 10.5469H5.34375ZM8.64844 10.5469L9.5625 5.0625H8.12109L7.24219 10.5469H8.64844ZM13.5703 8.75391C13.6055 8.12109 13.2188 7.66406 12.4102 7.27734C11.918 7.03125 11.6016 6.85547 11.6016 6.60938C11.6016 6.36328 11.8477 6.11719 12.4102 6.11719C12.8672 6.11719 13.2188 6.22266 13.4648 6.32812L13.6055 6.39844L13.7812 5.20312C13.5 5.09766 13.0781 4.99219 12.5156 4.99219C11.1094 4.99219 10.125 5.73047 10.125 6.78516C10.125 7.55859 10.8281 8.01562 11.3555 8.26172C11.918 8.54297 12.0938 8.71875 12.0938 8.92969C12.0938 9.31641 11.6719 9.49219 11.25 9.49219C10.6875 9.49219 10.4062 9.38672 9.91406 9.17578L9.73828 9.10547L9.5625 10.3359C9.87891 10.4766 10.4766 10.6172 11.1094 10.6172C12.6211 10.6172 13.5703 9.87891 13.5703 8.75391ZM18.5625 10.5469L17.4023 5.0625H16.3125C15.9609 5.0625 15.7148 5.16797 15.5742 5.51953L13.4648 10.5469H14.9766C14.9766 10.5469 15.1875 9.87891 15.2578 9.73828H17.0859C17.1211 9.91406 17.2266 10.5469 17.2266 10.5469H18.5625Z" fill="#2563EB"/>
              </svg>
            </div>
            <div v-else-if="card.type === 'mastercard'" class="payment-cards__icon-mastercard">
              <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.9453 13.2891C16.9453 13.5352 16.8047 13.6758 16.5586 13.6758C16.3125 13.6758 16.1719 13.5 16.1719 13.2891C16.1719 13.043 16.3125 12.8672 16.5586 12.8672C16.8047 12.8672 16.9453 13.043 16.9453 13.2891ZM6.04688 12.8672C6.25781 12.8672 6.39844 13.043 6.43359 13.2891C6.43359 13.5352 6.25781 13.6758 6.04688 13.6758C5.80078 13.6758 5.625 13.5 5.625 13.2891C5.625 13.043 5.80078 12.8672 6.04688 12.8672ZM10.1602 12.8672C10.3359 12.8672 10.4766 12.9727 10.5117 13.1484H9.84375C9.84375 12.9727 9.98438 12.8672 10.1602 12.8672ZM13.957 12.8672C14.2031 12.8672 14.3438 13.043 14.3438 13.2891C14.3438 13.5352 14.2031 13.6758 13.957 13.6758C13.7109 13.6758 13.5703 13.5 13.5703 13.2891C13.5703 13.043 13.7109 12.8672 13.957 12.8672ZM17.6836 13.7812V13.8164C17.6836 13.8516 17.6836 13.8516 17.6836 13.8516C17.6836 13.8867 17.6836 13.8867 17.6484 13.8867C17.6484 13.8867 17.6484 13.9219 17.6133 13.9219C17.6133 13.9219 17.6133 13.9219 17.5781 13.9219C17.5781 13.9219 17.5781 13.9219 17.543 13.9219C17.543 13.9219 17.543 13.8867 17.5078 13.8867C17.5078 13.8867 17.5078 13.8867 17.5078 13.8516C17.4727 13.8516 17.4727 13.8516 17.4727 13.8164C17.4727 13.8164 17.4727 13.7812 17.5078 13.7812V13.7461C17.543 13.7461 17.543 13.7461 17.543 13.7461C17.5781 13.7109 17.5781 13.7109 17.5781 13.7109C17.6133 13.7109 17.6133 13.7109 17.6133 13.7461C17.6484 13.7461 17.6484 13.7461 17.6484 13.7461C17.6836 13.7461 17.6836 13.7812 17.6836 13.7812ZM17.6133 13.8516V13.8164C17.6484 13.8164 17.6484 13.8164 17.6484 13.7812C17.6484 13.7812 17.6484 13.7812 17.6133 13.7812C17.6133 13.7812 17.6133 13.7461 17.5781 13.7461H17.543V13.8867H17.5781V13.8164L17.6133 13.8867H17.6484L17.6133 13.8516ZM20.25 1.6875V14.0625C20.25 15.0117 19.4766 15.75 18.5625 15.75H1.6875C0.738281 15.75 0 15.0117 0 14.0625V1.6875C0 0.773438 0.738281 0 1.6875 0H18.5625C19.4766 0 20.25 0.773438 20.25 1.6875ZM2.25 6.60938C2.25 9.31641 4.42969 11.4961 7.10156 11.4961C8.05078 11.4961 9 11.1797 9.80859 10.6523C7.24219 8.57812 7.24219 4.64062 9.80859 2.56641C9 2.03906 8.05078 1.75781 7.10156 1.75781C4.42969 1.75781 2.25 3.9375 2.25 6.60938ZM10.125 10.4414C12.5859 8.50781 12.5859 4.74609 10.125 2.77734C7.62891 4.74609 7.62891 8.50781 10.125 10.4414ZM5.09766 13.1133C5.09766 12.7969 4.92188 12.6211 4.60547 12.5859C4.42969 12.5859 4.25391 12.6562 4.14844 12.832C4.04297 12.6914 3.90234 12.5859 3.72656 12.5859C3.58594 12.5859 3.44531 12.6562 3.33984 12.7969V12.6211H3.05859V13.9219H3.33984C3.33984 13.2539 3.23438 12.8672 3.65625 12.8672C4.00781 12.8672 3.9375 13.2188 3.9375 13.9219H4.21875C4.21875 13.2891 4.14844 12.8672 4.53516 12.8672C4.88672 12.8672 4.81641 13.2188 4.81641 13.9219H5.09766V13.1133ZM6.67969 12.6211H6.39844V12.7969C6.32812 12.6914 6.1875 12.5859 6.01172 12.5859C5.625 12.5859 5.34375 12.9023 5.34375 13.2891C5.34375 13.6758 5.625 13.957 6.01172 13.957C6.1875 13.957 6.32812 13.8867 6.39844 13.7812V13.9219H6.67969V12.6211ZM8.12109 13.5352C8.12109 13.0078 7.3125 13.2539 7.3125 13.0078C7.3125 12.7969 7.73438 12.832 7.94531 12.9727L8.08594 12.7266C7.73438 12.5156 6.99609 12.5156 6.99609 13.0078C6.99609 13.5352 7.80469 13.3242 7.80469 13.5352C7.80469 13.7812 7.34766 13.7461 7.10156 13.5703L6.96094 13.8164C7.34766 14.0625 8.12109 14.0273 8.12109 13.5352ZM9.35156 13.8516L9.28125 13.6406C9.14062 13.7109 8.85938 13.7812 8.85938 13.4648V12.9023H9.31641V12.6211H8.85938V12.2344H8.54297V12.6211H8.29688V12.9023H8.54297V13.4648C8.54297 14.0977 9.17578 13.9922 9.35156 13.8516ZM9.80859 13.3945H10.793C10.793 12.832 10.5117 12.5859 10.1602 12.5859C9.80859 12.5859 9.52734 12.8672 9.52734 13.2891C9.52734 13.9922 10.3359 14.1328 10.7227 13.7812L10.582 13.5703C10.3008 13.7812 9.91406 13.7812 9.80859 13.3945ZM11.8828 12.6211C11.7422 12.5508 11.4961 12.5859 11.3555 12.7969V12.6211H11.0742V13.9219H11.3555V13.1836C11.3555 12.7969 11.707 12.832 11.8125 12.9023L11.8828 12.6211ZM12.2695 13.2891C12.2695 12.8672 12.6914 12.7617 13.0078 12.9727L13.1484 12.7617C12.7266 12.4453 11.9883 12.6211 11.9883 13.2891C11.9883 13.9922 12.7617 14.1328 13.1484 13.8164L13.0078 13.5703C12.6914 13.8164 12.2695 13.6758 12.2695 13.2891ZM14.625 12.6211H14.3438V12.7969C14.0273 12.4102 13.2891 12.6211 13.2891 13.2891C13.2891 13.957 14.0625 14.1328 14.3438 13.7812V13.9219H14.625V12.6211ZM15.7852 12.6211C15.7148 12.5859 15.3984 12.5508 15.2578 12.7969V12.6211H14.9766V13.9219H15.2578V13.1836C15.2578 12.7969 15.5742 12.832 15.7148 12.9023L15.7852 12.6211ZM17.2266 12.1289H16.9453V12.7969C16.6641 12.4102 15.8906 12.6211 15.8906 13.2891C15.8906 13.957 16.6641 14.1328 16.9453 13.7812V13.9219H17.2266V12.1289ZM17.4727 9.45703V9.63281H17.5078V9.45703H17.5781H17.4023H17.4727ZM17.7188 13.8164V13.7812C17.6836 13.7461 17.6836 13.7461 17.6836 13.7461C17.6836 13.7109 17.6484 13.7109 17.6484 13.7109C17.6133 13.7109 17.6133 13.6758 17.5781 13.6758L17.543 13.7109C17.5078 13.7109 17.5078 13.7109 17.5078 13.7461C17.4727 13.7461 17.4727 13.7461 17.4727 13.7812V13.8164C17.4727 13.8516 17.4727 13.8516 17.4727 13.8867C17.4727 13.8867 17.4727 13.8867 17.5078 13.9219C17.5078 13.9219 17.5078 13.9219 17.543 13.957H17.5781C17.6133 13.957 17.6133 13.957 17.6484 13.957C17.6484 13.9219 17.6836 13.9219 17.6836 13.9219C17.6836 13.8867 17.6836 13.8867 17.7188 13.8867C17.7188 13.8516 17.7188 13.8516 17.7188 13.8164ZM17.8242 9.45703H17.7891L17.7188 9.5625L17.6836 9.45703H17.6133V9.63281H17.6484V9.49219L17.7188 9.59766H17.7539L17.7891 9.49219V9.63281H17.8242V9.45703ZM18 6.60938C18 3.9375 15.7852 1.75781 13.1133 1.75781C12.1641 1.75781 11.2148 2.03906 10.4414 2.56641C12.9727 4.64062 13.0078 8.57812 10.4414 10.6523C11.2148 11.1797 12.1641 11.4609 13.1133 11.4609C15.7852 11.4961 18 9.31641 18 6.60938Z" fill="#DC2626"/>
              </svg>
            </div>
            <div v-else-if="card.type === 'mir'" class="payment-cards__icon-mir">
              <svg width="23" height="8" viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-7.97288e-05 -3.00451e-05H1.93415L3.97705 4.98406H4.06398L6.10688 -3.00451e-05H8.04111V7.41815H6.51981V2.58981H6.45823L4.53849 7.38193H3.50255L1.5828 2.5717H1.52123V7.41815H-7.97288e-05V-3.00451e-05ZM9.33332 -3.00451e-05H10.8981V4.66531H10.9597L14.1653 -3.00451e-05H15.5381V7.41815H13.9697V2.74919H13.9153L10.6916 7.41815H9.33332V-3.00451e-05ZM16.8339 7.41815V-3.00451e-05H19.7606C20.3233 -3.00451e-05 20.8026 0.107427 21.1986 0.322342C21.5946 0.534842 21.8965 0.830652 22.1041 1.20977C22.3142 1.58648 22.4193 2.02113 22.4193 2.51375C22.4193 3.00636 22.313 3.44102 22.1005 3.81773C21.888 4.19443 21.5801 4.48783 21.1769 4.69791C20.776 4.908 20.2907 5.01304 19.7208 5.01304H17.8554V3.75615H19.4672C19.7691 3.75615 20.0178 3.70423 20.2134 3.6004C20.4114 3.49415 20.5587 3.34805 20.6553 3.16211C20.7543 2.97376 20.8038 2.75764 20.8038 2.51375C20.8038 2.26744 20.7543 2.05253 20.6553 1.869C20.5587 1.68307 20.4114 1.53939 20.2134 1.43797C20.0154 1.33413 19.7642 1.28221 19.46 1.28221H18.4023V7.41815H16.8339Z" fill="#10B981"/>
              </svg>
            </div>
          </div>

          <!-- Информация о карте -->
          <div class="payment-cards__card-info">
            <input
              v-if="editingCardId === card.id"
              v-model="editingCardName"
              type="text"
              class="payment-cards__card-name-input"
              @blur="handleSaveCardName(card)"
              @keydown="handleNameInputKeydown($event, card)"
              @click.stop
            />
            <div v-else class="payment-cards__card-name">{{ card.name }}</div>
            <div class="payment-cards__card-number">
              {{ card.type === 'visa' ? 'VISA' : card.type === 'mastercard' ? 'MasterCard' : 'МИР' }} •••• {{ card.lastFour }}
            </div>
          </div>

          <!-- Иконка редактирования -->
          <button
            type="button"
            class="payment-cards__edit-button"
            @click="handleEditCard(card, $event)"
            aria-label="Редактировать карту"
          >
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.9922 2.37891L13.4531 4.83984C13.5625 4.94922 13.5625 5.11328 13.4531 5.22266L7.49219 11.1836L4.94922 11.457C4.62109 11.5117 4.32031 11.2109 4.375 10.8828L4.64844 8.33984L10.6094 2.37891C10.7188 2.26953 10.8828 2.26953 10.9922 2.37891ZM15.4219 1.75C15.832 2.16016 15.832 2.84375 15.4219 3.25391L14.4648 4.21094C14.3555 4.32031 14.1914 4.32031 14.082 4.21094L11.6211 1.75C11.5117 1.64062 11.5117 1.47656 11.6211 1.36719L12.5781 0.410156C12.9883 0 13.6719 0 14.082 0.410156L15.4219 1.75ZM10.5 9.57031C10.5 9.46094 10.5273 9.37891 10.582 9.32422L11.6758 8.23047C11.8945 8.03906 12.25 8.17578 12.25 8.47656V12.7695C12.25 13.5078 11.6484 14.082 10.9375 14.082H1.3125C0.574219 14.082 0 13.5078 0 12.7695V3.14453C0 2.43359 0.574219 1.83203 1.3125 1.83203H9.10547C9.40625 1.83203 9.54297 2.1875 9.35156 2.40625L8.25781 3.5C8.20312 3.55469 8.12109 3.58203 8.01172 3.58203H1.75V12.332H10.5V9.57031Z" fill="#374151"/>
            </svg>
          </button>
        </button>
      </div>

      <!-- Кнопка добавления новой карты (пока без действия по клику) -->
      <button type="button" class="payment-cards__add-card">
        <div class="payment-cards__add-icon">+</div>
        <div class="payment-cards__add-content">
          <div class="payment-cards__add-title">Добавить новую карту</div>
          <div class="payment-cards__add-subtitle">Привяжите банковскую карту для оплаты</div>
          <div class="payment-cards__add-logos">
            <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.3594 7.8125C18.3594 7.8125 18.6328 9.25781 18.7109 9.57031H17.4219C17.5391 9.21875 18.0469 7.85156 18.0469 7.85156C18.0078 7.89062 18.1641 7.5 18.2422 7.26562L18.3594 7.8125ZM22.5 1.875V15.625C22.5 16.6797 21.6406 17.5 20.625 17.5H1.875C0.820312 17.5 0 16.6797 0 15.625V1.875C0 0.859375 0.820312 0 1.875 0H20.625C21.6406 0 22.5 0.859375 22.5 1.875ZM5.9375 11.7188L8.39844 5.625H6.75781L5.19531 9.76562L5.03906 8.94531L4.49219 6.17188C4.41406 5.78125 4.14062 5.66406 3.78906 5.625H1.25V5.78125C1.83594 5.9375 2.38281 6.13281 2.89062 6.44531L4.29688 11.7188H5.9375ZM9.60938 11.7188L10.625 5.625H9.02344L8.04688 11.7188H9.60938ZM15.0781 9.72656C15.1172 9.02344 14.6875 8.51562 13.7891 8.08594C13.2422 7.8125 12.8906 7.61719 12.8906 7.34375C12.8906 7.07031 13.1641 6.79688 13.7891 6.79688C14.2969 6.79688 14.6875 6.91406 14.9609 7.03125L15.1172 7.10938L15.3125 5.78125C15 5.66406 14.5312 5.54688 13.9062 5.54688C12.3438 5.54688 11.25 6.36719 11.25 7.53906C11.25 8.39844 12.0312 8.90625 12.6172 9.17969C13.2422 9.49219 13.4375 9.6875 13.4375 9.92188C13.4375 10.3516 12.9688 10.5469 12.5 10.5469C11.875 10.5469 11.5625 10.4297 11.0156 10.1953L10.8203 10.1172L10.625 11.4844C10.9766 11.6406 11.6406 11.7969 12.3438 11.7969C14.0234 11.7969 15.0781 10.9766 15.0781 9.72656ZM20.625 11.7188L19.3359 5.625H18.125C17.7344 5.625 17.4609 5.74219 17.3047 6.13281L14.9609 11.7188H16.6406C16.6406 11.7188 16.875 10.9766 16.9531 10.8203H18.9844C19.0234 11.0156 19.1406 11.7188 19.1406 11.7188H20.625Z" fill="#9CA3AF"/>
            </svg>
            <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8281 14.7656C18.8281 15.0391 18.6719 15.1953 18.3984 15.1953C18.125 15.1953 17.9688 15 17.9688 14.7656C17.9688 14.4922 18.125 14.2969 18.3984 14.2969C18.6719 14.2969 18.8281 14.4922 18.8281 14.7656ZM6.71875 14.2969C6.95312 14.2969 7.10938 14.4922 7.14844 14.7656C7.14844 15.0391 6.95312 15.1953 6.71875 15.1953C6.44531 15.1953 6.25 15 6.25 14.7656C6.25 14.4922 6.44531 14.2969 6.71875 14.2969ZM11.2891 14.2969C11.4844 14.2969 11.6406 14.4141 11.6797 14.6094H10.9375C10.9375 14.4141 11.0938 14.2969 11.2891 14.2969ZM15.5078 14.2969C15.7812 14.2969 15.9375 14.4922 15.9375 14.7656C15.9375 15.0391 15.7812 15.1953 15.5078 15.1953C15.2344 15.1953 15.0781 15 15.0781 14.7656C15.0781 14.4922 15.2344 14.2969 15.5078 14.2969ZM19.6484 15.3125V15.3516C19.6484 15.3906 19.6484 15.3906 19.6484 15.3906C19.6484 15.4297 19.6484 15.4297 19.6094 15.4297C19.6094 15.4297 19.6094 15.4688 19.5703 15.4688C19.5703 15.4688 19.5703 15.4688 19.5312 15.4688C19.5312 15.4688 19.5312 15.4688 19.4922 15.4688C19.4922 15.4688 19.4922 15.4297 19.4531 15.4297C19.4531 15.4297 19.4531 15.4297 19.4531 15.3906C19.4141 15.3906 19.4141 15.3906 19.4141 15.3516C19.4141 15.3516 19.4141 15.3125 19.4531 15.3125V15.2734C19.4922 15.2734 19.4922 15.2734 19.4922 15.2734C19.5312 15.2344 19.5312 15.2344 19.5312 15.2344C19.5703 15.2344 19.5703 15.2344 19.5703 15.2734C19.6094 15.2734 19.6094 15.2734 19.6094 15.2734C19.6484 15.2734 19.6484 15.3125 19.6484 15.3125ZM19.5703 15.3906V15.3516C19.6094 15.3516 19.6094 15.3516 19.6094 15.3125C19.6094 15.3125 19.6094 15.3125 19.5703 15.3125C19.5703 15.3125 19.5703 15.2734 19.5312 15.2734H19.4922V15.4297H19.5312V15.3516L19.5703 15.4297H19.6094L19.5703 15.3906ZM22.5 1.875V15.625C22.5 16.6797 21.6406 17.5 20.625 17.5H1.875C0.820312 17.5 0 16.6797 0 15.625V1.875C0 0.859375 0.820312 0 1.875 0H20.625C21.6406 0 22.5 0.859375 22.5 1.875ZM2.5 7.34375C2.5 10.3516 4.92188 12.7734 7.89062 12.7734C8.94531 12.7734 10 12.4219 10.8984 11.8359C8.04688 9.53125 8.04688 5.15625 10.8984 2.85156C10 2.26562 8.94531 1.95312 7.89062 1.95312C4.92188 1.95312 2.5 4.375 2.5 7.34375ZM11.25 11.6016C13.9844 9.45312 13.9844 5.27344 11.25 3.08594C8.47656 5.27344 8.47656 9.45312 11.25 11.6016ZM5.66406 14.5703C5.66406 14.2188 5.46875 14.0234 5.11719 13.9844C4.92188 13.9844 4.72656 14.0625 4.60938 14.2578C4.49219 14.1016 4.33594 13.9844 4.14062 13.9844C3.98438 13.9844 3.82812 14.0625 3.71094 14.2188V14.0234H3.39844V15.4688H3.71094C3.71094 14.7266 3.59375 14.2969 4.0625 14.2969C4.45312 14.2969 4.375 14.6875 4.375 15.4688H4.6875C4.6875 14.7656 4.60938 14.2969 5.03906 14.2969C5.42969 14.2969 5.35156 14.6875 5.35156 15.4688H5.66406V14.5703ZM7.42188 14.0234H7.10938V14.2188C7.03125 14.1016 6.875 13.9844 6.67969 13.9844C6.25 13.9844 5.9375 14.3359 5.9375 14.7656C5.9375 15.1953 6.25 15.5078 6.67969 15.5078C6.875 15.5078 7.03125 15.4297 7.10938 15.3125V15.4688H7.42188V14.0234ZM9.02344 15.0391C9.02344 14.4531 8.125 14.7266 8.125 14.4531C8.125 14.2188 8.59375 14.2578 8.82812 14.4141L8.98438 14.1406C8.59375 13.9062 7.77344 13.9062 7.77344 14.4531C7.77344 15.0391 8.67188 14.8047 8.67188 15.0391C8.67188 15.3125 8.16406 15.2734 7.89062 15.0781L7.73438 15.3516C8.16406 15.625 9.02344 15.5859 9.02344 15.0391ZM10.3906 15.3906L10.3125 15.1562C10.1562 15.2344 9.84375 15.3125 9.84375 14.9609V14.3359H10.3516V14.0234H9.84375V13.5938H9.49219V14.0234H9.21875V14.3359H9.49219V14.9609C9.49219 15.6641 10.1953 15.5469 10.3906 15.3906ZM10.8984 14.8828H11.9922C11.9922 14.2578 11.6797 13.9844 11.2891 13.9844C10.8984 13.9844 10.5859 14.2969 10.5859 14.7656C10.5859 15.5469 11.4844 15.7031 11.9141 15.3125L11.7578 15.0781C11.4453 15.3125 11.0156 15.3125 10.8984 14.8828ZM13.2031 14.0234C13.0469 13.9453 12.7734 13.9844 12.6172 14.2188V14.0234H12.3047V15.4688H12.6172V14.6484C12.6172 14.2188 13.0078 14.2578 13.125 14.3359L13.2031 14.0234ZM13.6328 14.7656C13.6328 14.2969 14.1016 14.1797 14.4531 14.4141L14.6094 14.1797C14.1406 13.8281 13.3203 14.0234 13.3203 14.7656C13.3203 15.5469 14.1797 15.7031 14.6094 15.3516L14.4531 15.0781C14.1016 15.3516 13.6328 15.1953 13.6328 14.7656ZM16.25 14.0234H15.9375V14.2188C15.5859 13.7891 14.7656 14.0234 14.7656 14.7656C14.7656 15.5078 15.625 15.7031 15.9375 15.3125V15.4688H16.25V14.0234ZM17.5391 14.0234C17.4609 13.9844 17.1094 13.9453 16.9531 14.2188V14.0234H16.6406V15.4688H16.9531V14.6484C16.9531 14.2188 17.3047 14.2578 17.4609 14.3359L17.5391 14.0234ZM19.1406 13.4766H18.8281V14.2188C18.5156 13.7891 17.6562 14.0234 17.6562 14.7656C17.6562 15.5078 18.5156 15.7031 18.8281 15.3125V15.4688H19.1406V13.4766ZM19.4141 10.5078V10.7031H19.4531V10.5078H19.5312H19.3359H19.4141ZM19.6875 15.3516V15.3125C19.6484 15.2734 19.6484 15.2734 19.6484 15.2734C19.6484 15.2344 19.6094 15.2344 19.6094 15.2344C19.5703 15.2344 19.5703 15.1953 19.5312 15.1953L19.4922 15.2344C19.4531 15.2344 19.4531 15.2344 19.4531 15.2734C19.4141 15.2734 19.4141 15.2734 19.4141 15.3125V15.3516C19.4141 15.3906 19.4141 15.3906 19.4141 15.4297C19.4141 15.4297 19.4141 15.4297 19.4531 15.4688C19.4531 15.4688 19.4531 15.4688 19.4922 15.5078H19.5312C19.5703 15.5078 19.5703 15.5078 19.6094 15.5078C19.6094 15.4688 19.6484 15.4688 19.6484 15.4688C19.6484 15.4297 19.6484 15.4297 19.6875 15.4297C19.6875 15.3906 19.6875 15.3906 19.6875 15.3516ZM19.8047 10.5078H19.7656L19.6875 10.625L19.6484 10.5078H19.5703V10.7031H19.6094V10.5469L19.6875 10.6641H19.7266L19.7656 10.5469V10.7031H19.8047V10.5078ZM20 7.34375C20 4.375 17.5391 1.95312 14.5703 1.95312C13.5156 1.95312 12.4609 2.26562 11.6016 2.85156C14.4141 5.15625 14.4531 9.53125 11.6016 11.8359C12.4609 12.4219 13.5156 12.7344 14.5703 12.7344C17.5391 12.7734 20 10.3516 20 7.34375Z" fill="#9CA3AF"/>
            </svg>
            <svg width="23" height="8" viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-7.97288e-05 -3.00451e-05H1.93415L3.97705 4.98406H4.06398L6.10688 -3.00451e-05H8.04111V7.41815H6.51981V2.58981H6.45823L4.53849 7.38193H3.50255L1.5828 2.5717H1.52123V7.41815H-7.97288e-05V-3.00451e-05ZM9.33332 -3.00451e-05H10.8981V4.66531H10.9597L14.1653 -3.00451e-05H15.5381V7.41815H13.9697V2.74919H13.9153L10.6916 7.41815H9.33332V-3.00451e-05ZM16.8339 7.41815V-3.00451e-05H19.7606C20.3233 -3.00451e-05 20.8026 0.107427 21.1986 0.322342C21.5946 0.534842 21.8965 0.830652 22.1041 1.20977C22.3142 1.58648 22.4193 2.02113 22.4193 2.51375C22.4193 3.00636 22.313 3.44102 22.1005 3.81773C21.888 4.19443 21.5801 4.48783 21.1769 4.69791C20.776 4.908 20.2907 5.01304 19.7208 5.01304H17.8554V3.75615H19.4672C19.7691 3.75615 20.0178 3.70423 20.2134 3.6004C20.4114 3.49415 20.5587 3.34805 20.6553 3.16211C20.7543 2.97376 20.8038 2.75764 20.8038 2.51375C20.8038 2.26744 20.7543 2.05253 20.6553 1.869C20.5587 1.68307 20.4114 1.53939 20.2134 1.43797C20.0154 1.33413 19.7642 1.28221 19.46 1.28221H18.4023V7.41815H16.8339Z" fill="#9CA3AF"/>
            </svg>
          </div>
        </div>
      </button>

      <!-- Информационный блок: Активная карта -->
      <div class="payment-cards__info-box">
        <div class="payment-cards__info-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.75 0C12 0 15.5 3.5 15.5 7.75C15.5 12.0312 12 15.5 7.75 15.5C3.46875 15.5 0 12.0312 0 7.75C0 3.5 3.46875 0 7.75 0ZM7.75 3.4375C7 3.4375 6.4375 4.03125 6.4375 4.75C6.4375 5.5 7 6.0625 7.75 6.0625C8.46875 6.0625 9.0625 5.5 9.0625 4.75C9.0625 4.03125 8.46875 3.4375 7.75 3.4375ZM9.5 11.375V10.625C9.5 10.4375 9.3125 10.25 9.125 10.25H8.75V7.125C8.75 6.9375 8.5625 6.75 8.375 6.75H6.375C6.15625 6.75 6 6.9375 6 7.125V7.875C6 8.09375 6.15625 8.25 6.375 8.25H6.75V10.25H6.375C6.15625 10.25 6 10.4375 6 10.625V11.375C6 11.5938 6.15625 11.75 6.375 11.75H9.125C9.3125 11.75 9.5 11.5938 9.5 11.375Z" fill="#2563EB"/>
          </svg>
        </div>
        <div class="payment-cards__info-content">
          <div class="payment-cards__info-title">Активная карта</div>
          <div class="payment-cards__info-text">
            С активной карты будут автоматически списываться средства за парковку. Вы можете изменить активную карту в любое время.
          </div>
        </div>
      </div>

      <!-- Информационный блок: Безопасность -->
      <div class="payment-cards__info-box">
        <div class="payment-cards__info-icon payment-cards__info-icon--security">
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5625 2.625C15.125 2.875 15.5 3.40625 15.5 4C15.5 10.9375 11.25 14.7812 8.5625 15.9062C8.1875 16.0625 7.78125 16.0625 7.40625 15.9062C4.0625 14.5 0.5 10.2188 0.5 4C0.5 3.40625 0.84375 2.875 1.40625 2.625L7.40625 0.125C7.59375 0.0625 7.78125 0.03125 8 0.03125C8.1875 0.03125 8.375 0.0625 8.5625 0.125L14.5625 2.625ZM8 13.9688C10.9062 12.5 13.375 9.0625 13.4688 4.34375L8 2.0625V13.9688Z" fill="#16A34A"/>
          </svg>
        </div>
        <div class="payment-cards__info-content">
          <div class="payment-cards__info-title payment-cards__info-title--security">Безопасность</div>
          <div class="payment-cards__info-text payment-cards__info-text--security">
            Все данные карт зашифрованы и хранятся в соответствии с международными стандартами PCI DSS
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка подтверждения выбора карты -->
    <footer class="payment-cards__footer">
      <button
        type="button"
        class="payment-cards__confirm-button"
        :class="{ 'payment-cards__confirm-button--disabled': !canConfirm }"
        :disabled="!canConfirm"
        @click="handleConfirm"
      >
        Выбрать карту
      </button>
      <p class="payment-cards__footer-text">Активная карта используется для автоматических платежей</p>
    </footer>
  </section>
</template>

<style scoped>
.payment-cards {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: calc(env(safe-area-inset-top) + 24px);
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.payment-cards__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px 24px;
}

.payment-cards__back {
  /* margin-top: 20px; */
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E2E8F0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.payment-cards__title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
}

.payment-cards__header-spacer {
  width: 44px;
  flex-shrink: 0;
}

.payment-cards__content {
  flex: 1;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.payment-cards__cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-cards__card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.2s;
}

.payment-cards__card:hover {
  opacity: 0.9;
}

.payment-cards__card--active {
  border: 2px solid #2563eb;
}

.payment-cards__radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-cards__card--active .payment-cards__radio {
  border-color: #2563eb;
  background-color: #2563eb;
}

.payment-cards__radio-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ffffff;
}

.payment-cards__card-icon {
  width: 48px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-cards__icon-visa {
  /* background-color: #2563eb; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.payment-cards__icon-mastercard {
  /* background-color: #ea580c; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.payment-cards__icon-mir {
  /* background-color: #10b981; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.payment-cards__card-icon svg {
  width: 100%;
  height: auto;
}

.payment-cards__card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-cards__card-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.payment-cards__card-number {
  font-size: 14px;
  color: #6b7280;
}

.payment-cards__edit-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.payment-cards__edit-button:hover {
  opacity: 0.7;
}

.payment-cards__add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.payment-cards__add-card:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

.payment-cards__add-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 300;
  color: #374151;
}

.payment-cards__add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.payment-cards__add-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.payment-cards__add-subtitle {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.payment-cards__add-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.payment-cards__add-logos svg {
  height: 18px;
  width: auto;
}

.payment-cards__info-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #f3f4f6;
  border-radius: 12px;
}

.payment-cards__info-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.payment-cards__info-icon--security {
  align-items: center;
  padding-top: 0;
}

.payment-cards__info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-cards__info-title {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
}

.payment-cards__info-title--security {
  color: #111827;
}

.payment-cards__info-text {
  font-size: 14px;
  line-height: 1.5;
  color: #2563eb;
}

.payment-cards__info-text--security {
  color: #111827;
}

.payment-cards__footer {
  padding: 16px 24px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.payment-cards__confirm-button {
  width: 100%;
  padding: 16px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.payment-cards__confirm-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.payment-cards__confirm-button--disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.payment-cards__footer-text {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

/* Адаптивные стили для планшетов и десктопов */
@media (min-width: 768px) {
  .payment-cards {
    max-width: 100%;
    padding-left: calc(env(safe-area-inset-left) + 24px);
    padding-right: calc(env(safe-area-inset-right) + 24px);
  }

  .payment-cards__content {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .payment-cards__content {
    max-width: 700px;
  }
}

@media (min-width: 1440px) {
  .payment-cards {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .payment-cards__content {
    max-width: 100%;
  }
}
</style>

<style scoped>
.payment-cards {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: calc(env(safe-area-inset-top) + 24px);
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.payment-cards__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px 24px;
}

.payment-cards__back {
  /* margin-top: 20px; */
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E2E8F0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.payment-cards__title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
}

.payment-cards__header-spacer {
  width: 44px;
  flex-shrink: 0;
}

.payment-cards__content {
  flex: 1;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.payment-cards__cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-cards__card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.2s;
}

.payment-cards__card:hover {
  opacity: 0.9;
}

.payment-cards__card--active {
  border: 2px solid #2563eb;
}

.payment-cards__radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-cards__card--active .payment-cards__radio {
  border-color: #2563eb;
  background-color: #2563eb;
}

.payment-cards__radio-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ffffff;
}

.payment-cards__card-icon {
  width: 48px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-cards__icon-visa {
  /* background-color: #2563eb; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.payment-cards__icon-mastercard {
  /* background-color: #ea580c; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.payment-cards__icon-mir {
  /* background-color: #10b981; */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.payment-cards__card-icon svg {
  width: 100%;
  height: auto;
}

.payment-cards__card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-cards__card-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.payment-cards__card-name-input {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  background: transparent;
  border: 2px solid #2563eb;
  border-radius: 4px;
  padding: 2px 6px;
  width: 100%;
  font-family: Inter, sans-serif;
  outline: none;
}

.payment-cards__card-name-input:focus {
  border-color: #2563eb;
  background-color: #f9fafb;
}

.payment-cards__card-number {
  font-size: 14px;
  color: #6b7280;
}

.payment-cards__edit-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.payment-cards__edit-button:hover {
  opacity: 0.7;
}

.payment-cards__add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.payment-cards__add-card:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

.payment-cards__add-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 300;
  color: #374151;
}

.payment-cards__add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.payment-cards__add-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.payment-cards__add-subtitle {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.payment-cards__add-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.payment-cards__add-logos svg {
  height: 18px;
  width: auto;
}

.payment-cards__info-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #f3f4f6;
  border-radius: 12px;
}

.payment-cards__info-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.payment-cards__info-icon--security {
  align-items: center;
  padding-top: 0;
}

.payment-cards__info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-cards__info-title {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
}

.payment-cards__info-title--security {
  color: #111827;
}

.payment-cards__info-text {
  font-size: 14px;
  line-height: 1.5;
  color: #2563eb;
}

.payment-cards__info-text--security {
  color: #111827;
}

.payment-cards__footer {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.payment-cards__add-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background-color: #3B60F4;
  border: none;
  border-radius: 9999px;
  color: white;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.payment-cards__add-button:hover {
  background-color: #2B4FE4;
  box-shadow: 0px 6px 8px -4px rgba(0, 0, 0, 0.15);
}

.payment-cards__add-button:active {
  background-color: #1B3ED4;
  transform: translateY(1px);
}

.payment-cards__add-button svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.payment-cards__footer-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
}

/* Адаптивные стили для планшетов и десктопов */
@media (min-width: 768px) {
  .payment-cards {
    max-width: 100%;
    padding-left: calc(env(safe-area-inset-left) + 24px);
    padding-right: calc(env(safe-area-inset-right) + 24px);
  }

  .payment-cards__content {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .payment-cards__content {
    max-width: 700px;
  }
}

@media (min-width: 1440px) {
  .payment-cards {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .payment-cards__content {
    max-width: 100%;
  }
}
</style>

