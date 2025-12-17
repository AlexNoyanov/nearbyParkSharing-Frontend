<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'

type Car = {
  id: string
  brand: string
  model: string
  number: string
  region?: string
  color?: string
  isForeign: boolean
}

const props = defineProps<{
  cars: Car[]
  selectedCarId?: string | null
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'select-car', car: Car): void
  (e: 'add-car'): void
  (e: 'select-car-id', carId: string): void
}>()

// Нормализуем selectedCarId для сравнения
const normalizedSelectedId = computed(() => {
  return props.selectedCarId ? String(props.selectedCarId) : null
})

const handleCarCardClick = (car: Car) => {
  const carIdStr = String(car.id)
  // Если уже выбран, снимаем выбор, иначе выбираем
  if (normalizedSelectedId.value === carIdStr) {
    emit('select-car-id', '')
  } else {
    emit('select-car-id', carIdStr)
  }
}

const handleSelectButton = () => {
  if (normalizedSelectedId.value) {
    const selectedCar = props.cars.find(c => String(c.id) === normalizedSelectedId.value)
    if (selectedCar) {
      emit('select-car', selectedCar)
    }
  } else if (props.selectedCarId) {
    // Fallback: если normalizedSelectedId не работает, используем props.selectedCarId напрямую
    const selectedCar = props.cars.find(c => String(c.id) === String(props.selectedCarId))
    if (selectedCar) {
      emit('select-car', selectedCar)
    }
  }
}

// Прокручиваем страницу к верху при монтировании компонента
onMounted(async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // Также прокручиваем контейнер контента, если он есть
  const contentElement = document.querySelector('.car-selection__content')
  if (contentElement) {
    contentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
</script>

<template>
  <section class="car-selection">
    <header class="car-selection__header">
      <button type="button" class="car-selection__back" @click="emit('back')" aria-label="Назад">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 11.375L8.1875 12C7.875 12.3125 7.40625 12.3125 7.125 12L1.3125 6.125C1 5.8125 1 5.34375 1.3125 5.0625L7.125 -0.8125C7.40625 -1.125 7.90625 -1.125 8.1875 -0.8125L8.75 -0.1875C9.0625 0.125 9.03125 0.59375 8.75 0.90625L4.84375 4.625H13.3438C13.75 4.625 14.0938 4.96875 14.0938 5.375V6.375C14.0938 6.8125 13.75 7.125 13.3438 7.125H4.84375L8.75 10.8438C9.03125 11.1562 9.0625 11.625 8.75 11.375Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="car-selection__title">Выберите автомобиль</h1>
      <div class="car-selection__header-spacer"></div>
    </header>

    <div class="car-selection__content">
      <div class="car-selection__section">
        <h2 class="car-selection__section-title">Мои автомобили</h2>
        
        <div class="car-selection__cars-list">
          <button
            v-for="car in props.cars"
            :key="car.id"
            type="button"
            class="car-selection__car-card"
            :class="{ 'car-selection__car-card--selected': normalizedSelectedId && normalizedSelectedId === String(car.id) }"
            @click="() => handleCarCardClick(car)"
          >
            <div class="car-selection__car-icon">
              <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5703 4.375C19.8828 4.375 20.1172 4.6875 20.0391 4.96094L19.8047 5.89844C19.7656 6.13281 19.5703 6.25 19.375 6.25H18.5547C19.1016 6.71875 19.4531 7.38281 19.4531 8.125V10C19.4531 10.6641 19.1797 11.2109 18.8281 11.6406V13.75C18.8281 14.4531 18.2422 15 17.5781 15H16.3281C15.625 15 15.0781 14.4531 15.0781 13.75V12.5H5.07812V13.75C5.07812 14.4531 4.49219 15 3.82812 15H2.57812C1.875 15 1.32812 14.4531 1.32812 13.75V11.6406C0.9375 11.2109 0.703125 10.6641 0.703125 10V8.125C0.703125 7.38281 1.01562 6.71875 1.5625 6.25H0.78125C0.546875 6.25 0.351562 6.13281 0.3125 5.89844L0.078125 4.96094C0 4.6875 0.234375 4.375 0.546875 4.375H2.85156L3.51562 2.77344C4.17969 1.09375 5.78125 0 7.57812 0H12.5391C14.3359 0 15.9375 1.09375 16.6016 2.77344L17.2656 4.375H19.5703ZM5.82031 3.71094L5.07812 5.625H15.0781L14.2969 3.71094C13.9844 2.96875 13.3203 2.5 12.5391 2.5H7.57812C6.79688 2.5 6.13281 2.96875 5.82031 3.71094ZM3.82812 10C4.57031 10 5.70312 10.1172 5.70312 9.375C5.70312 8.63281 4.57031 7.5 3.82812 7.5C3.04688 7.5 2.57812 8.00781 2.57812 8.75C2.57812 9.53125 3.04688 10 3.82812 10ZM16.3281 10C17.0703 10 17.5781 9.53125 17.5781 8.75C17.5781 8.00781 17.0703 7.5 16.3281 7.5C15.5469 7.5 14.4531 8.63281 14.4531 9.375C14.4531 10.1172 15.5469 10 16.3281 10Z" fill="#4B5563"/>
              </svg>
            </div>
            <div class="car-selection__car-info">
              <div class="car-selection__car-name">{{ car.brand }} {{ car.model }}</div>
              <div class="car-selection__car-color">{{ car.color || '' }}</div>
              <div class="car-selection__car-number">{{ car.number }}{{ car.region ? car.region : '' }}</div>
            </div>
            <div class="car-selection__radio">
              <div v-if="normalizedSelectedId && normalizedSelectedId === String(car.id)" class="car-selection__radio-inner"></div>
            </div>
          </button>
        </div>

        <button type="button" class="car-selection__add-button" @click="emit('add-car')">
          <div class="car-selection__add-icon">+</div>
          <div class="car-selection__add-info">
            <div class="car-selection__add-title">Добавить автомобиль</div>
            <div class="car-selection__add-subtitle">Укажите марку, модель и номер</div>
          </div>
        </button>
      </div>
    </div>

    <footer class="car-selection__footer">
      <button type="button" class="car-selection__select-button" @click="handleSelectButton" :disabled="!normalizedSelectedId && !props.selectedCarId">
        Выбрать основной авто
      </button>
    </footer>
  </section>
</template>

<style scoped>
.car-selection {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-y: auto;
}

.car-selection__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  background: white;
  border-bottom: 1px solid #E2E8F0;
}

.car-selection__back {
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

.car-selection__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.2;
  color: #1F2937;
  text-align: center;
  flex: 1;
}

.car-selection__header-spacer {
  width: 30px;
  flex-shrink: 0;
}

.car-selection__content {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  padding-bottom: 20px;
}

.car-selection__section {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.car-selection__section-title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.4px;
  line-height: 2.09;
  color: #1F2937;
  text-align: center;
}

.car-selection__cars-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.car-selection__car-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 13px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: 100%;
}

.car-selection__car-card--selected {
  border-color: #0075FF;
}

.car-selection__car-icon {
  width: 36px;
  height: 36px;
  background: #E2E8F0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.car-selection__car-icon svg {
  width: 21px;
  height: 15px;
}

.car-selection__car-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
  text-align: left;
}

.car-selection__car-name {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  line-height: 2.24;
  color: #1F2937;
  margin-bottom: 0;
}

.car-selection__car-color {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.7px;
  line-height: 2.06;
  color: #4B5563;
  margin-bottom: 0;
}

.car-selection__car-number {
  padding: 5.5px 9px 2.5px;
  background: #E2E8F0;
  border-radius: 8px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  line-height: 2.24;
  color: #1F2937;
  white-space: nowrap;
  margin-top: 0;
  display: inline-block;
}

.car-selection__radio {
  width: 18px;
  height: 18px;
  border: 2px solid #0075FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
}

.car-selection__car-card:not(.car-selection__car-card--selected) .car-selection__radio {
  border-color: #E2E8F0;
}

.car-selection__radio-inner {
  width: 9px;
  height: 9px;
  background: #0075FF;
  border-radius: 50%;
}

.car-selection__add-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11.5px 17px 12px;
  border: 1px dashed #D1D5DB;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.car-selection__add-button:hover {
  border-color: #9CA3AF;
}

.car-selection__add-icon {
  width: 36px;
  height: 36px;
  background: #E2E8F0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Font Awesome 5 Free, sans-serif;
  font-weight: 900;
  font-size: 20px;
  color: #4B5563;
  flex-shrink: 0;
}

.car-selection__add-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
  text-align: left;
}

.car-selection__add-title {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 11.9px;
  line-height: 2.02;
  color: #1F2937;
}

.car-selection__add-subtitle {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.7px;
  line-height: 2.06;
  color: #4B5563;
}

.car-selection__footer {
  padding: 13px 18px;
  padding-bottom: calc(13px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.car-selection__select-button {
  width: 100%;
  padding: 8px 0 9px;
  background: #2563EB;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.2px;
  line-height: 2.12;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}


.car-selection__select-button:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.car-selection__select-button:not(:disabled):active {
  background: #1D4ED8;
}
</style>

