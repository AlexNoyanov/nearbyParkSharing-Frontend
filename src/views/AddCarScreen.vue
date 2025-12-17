<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'save', car: { brand: string; model: string; number: string; region?: string; color?: string; isForeign: boolean }): void
}>()

const brand = ref('')
const model = ref('')
const numberType = ref<'russian' | 'foreign'>('russian')
const number = ref('')
const region = ref('')
const color = ref('')
const selectedColorSwatch = ref<string | null>(null)
const isForeign = computed(() => numberType.value === 'foreign')

// Проверка корректности российского номера (А000АА - буква + 3 цифры + 2 буквы)
const isRussianNumberValid = computed(() => {
  if (numberType.value !== 'russian') return true
  const numValue = number.value
  if (!numValue) return false
  
  const upperNumber = numValue.toUpperCase()
  
  // Проверяем формат: буква + 3 цифры + 2 буквы
  const pattern = /^[А-ЯA-Z][0-9]{3}[А-ЯA-Z]{2}$/
  if (!pattern.test(upperNumber)) return false
  
  // Проверяем, что все буквы разрешены
  for (let i = 0; i < upperNumber.length; i++) {
    const char = upperNumber[i] || ''
    if (char && /[А-ЯA-Z]/.test(char) && forbiddenLetters.includes(char)) {
      return false
    }
  }
  return true
})

// Проверка, можно ли сохранить автомобиль
const canSave = computed(() => {
  if (!brand.value || !model.value || !number.value) {
    return false
  }
  
  // Для российского номера проверяем валидность и наличие региона (от 1 до 3 цифр)
  if (numberType.value === 'russian') {
    return isRussianNumberValid.value && region.value && region.value.length >= 1 && region.value.length <= 3
  }
  
  return true
})

// Запрещенные буквы для российского номера
const forbiddenLetters = ['Б', 'Г', 'Д', 'Ё', 'Ж', 'И', 'Й', 'Л', 'Ф', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь']

// Проверка, является ли буква разрешенной
const isAllowedLetter = (char: string): boolean => {
  const upperChar = char.toUpperCase()
  // Проверяем, что это буква и она не в списке запрещенных
  return /[А-ЯA-Z]/.test(upperChar) && !forbiddenLetters.includes(upperChar)
}

// Форматирование российского номера (А000АА - буква + 3 цифры + 2 буквы)
const formatRussianNumber = (value: string | undefined): string => {
  const val = value || ''
  // Удаляем все не-буквы и не-цифры, приводим к верхнему регистру
  let cleaned = val.replace(/[^А-ЯA-Z0-9]/gi, '').toUpperCase()
  
  // Ограничиваем до 6 символов
  cleaned = cleaned.slice(0, 6)
  
  // Форматируем строго: буква + 3 цифры + 2 буквы
  let formatted = ''
  let position = 0 // 0 = первая буква, 1-3 = цифры, 4-5 = буквы
  
  for (let i = 0; i < cleaned.length && position < 6; i++) {
    const char = cleaned[i] || ''
    const isDigit = /[0-9]/.test(char)
    const isLetter = isAllowedLetter(char)
    
    if (position === 0 && isLetter) {
      // Первая позиция - только разрешенная буква
      formatted += char
      position = 1
    } else if (position >= 1 && position <= 3 && isDigit) {
      // Позиции 1-3 - только цифры
      formatted += char
      position++
    } else if (position >= 4 && position <= 5 && isLetter) {
      // Позиции 4-5 - только разрешенные буквы
      formatted += char
      position++
    }
  }
  
  return formatted
}

// Обработка ввода номера
const handleNumberInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const inputValue = target.value || ''
  if (numberType.value === 'russian') {
    number.value = formatRussianNumber(inputValue)
  } else {
    number.value = inputValue
  }
}

// Форматирование региона (только цифры, максимум 3)
const formatRegion = (value: string | undefined): string => {
  return (value || '').replace(/[^0-9]/g, '').slice(0, 3)
}

// Обработка ввода региона
const handleRegionInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const inputValue = target.value || ''
  region.value = formatRegion(inputValue)
}

const colorSwatches = [
  { id: 'white', name: 'Белый', value: '#FFFFFF' },
  { id: 'black', name: 'Черный', value: '#000000' },
  { id: 'gray', name: 'Серый', value: '#6B7280' },
  { id: 'red', name: 'Красный', value: '#DC2626' },
  { id: 'blue', name: 'Синий', value: '#2563EB' },
  { id: 'green', name: 'Зеленый', value: '#16A34A' },
  { id: 'yellow', name: 'Желтый', value: '#EAB308' },
  { id: 'purple', name: 'Фиолетовый', value: '#9333EA' }
]

const selectColorSwatch = (colorId: string) => {
  if (selectedColorSwatch.value === colorId) {
    selectedColorSwatch.value = null
    color.value = ''
  } else {
    selectedColorSwatch.value = colorId
    const colorItem = colorSwatches.find(c => c.id === colorId)
    color.value = colorItem?.name || ''
  }
}

const saveCar = () => {
  if (!canSave.value) {
    return
  }
  
  emit('save', {
    brand: brand.value || '',
    model: model.value || '',
    number: number.value || '',
    region: numberType.value === 'russian' && region.value ? region.value : undefined,
    color: color.value || undefined,
    isForeign: isForeign.value,
  })
}
</script>

<template>
  <section class="add-car">
    <header class="add-car__header">
      <button type="button" class="add-car__back" @click="emit('back')" aria-label="Назад">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.75 11.375L8.1875 12C7.875 12.3125 7.40625 12.3125 7.125 12L1.3125 6.125C1 5.8125 1 5.34375 1.3125 5.0625L7.125 -0.8125C7.40625 -1.125 7.90625 -1.125 8.1875 -0.8125L8.75 -0.1875C9.0625 0.125 9.03125 0.59375 8.75 0.90625L4.84375 4.625H13.3438C13.75 4.625 14.0938 4.96875 14.0938 5.375V6.375C14.0938 6.8125 13.75 7.125 13.3438 7.125H4.84375L8.75 10.8438C9.03125 11.1562 9.0625 11.625 8.75 11.375Z" fill="#4B5563"/>
        </svg>
      </button>
      <h1 class="add-car__title">Добавить автомобиль</h1>
      <div class="add-car__header-spacer"></div>
    </header>

    <div class="add-car__content">
      <!-- Info Block -->
      <div class="add-car__info">
        <div class="add-car__info-icon">
          <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M29.3555 6.5625C29.8242 6.5625 30.1758 7.03125 30.0586 7.44141L29.707 8.84766C29.6484 9.19922 29.3555 9.375 29.0625 9.375H27.832C28.6523 10.0781 29.1797 11.0742 29.1797 12.1875V15C29.1797 15.9961 28.7695 16.8164 28.2422 17.4609V20.625C28.2422 21.6797 27.3633 22.5 26.3672 22.5H24.4922C23.4375 22.5 22.6172 21.6797 22.6172 20.625V18.75H7.61719V20.625C7.61719 21.6797 6.73828 22.5 5.74219 22.5H3.86719C2.8125 22.5 1.99219 21.6797 1.99219 20.625V17.4609C1.40625 16.8164 1.05469 15.9961 1.05469 15V12.1875C1.05469 11.0742 1.52344 10.0781 2.34375 9.375H1.17188C0.820312 9.375 0.527344 9.19922 0.46875 8.84766L0.117188 7.44141C0 7.03125 0.351562 6.5625 0.820312 6.5625H4.27734L5.27344 4.16016C6.26953 1.64062 8.67188 0 11.3672 0H18.8086C21.5039 0 23.9062 1.64062 24.9023 4.16016L25.8984 6.5625H29.3555ZM8.73047 5.56641L7.61719 8.4375H22.6172L21.4453 5.56641C20.9766 4.45312 19.9805 3.75 18.8086 3.75H11.3672C10.1953 3.75 9.19922 4.45312 8.73047 5.56641ZM5.74219 15C6.85547 15 8.55469 15.1758 8.55469 14.0625C8.55469 12.9492 6.85547 11.25 5.74219 11.25C4.57031 11.25 3.86719 12.0117 3.86719 13.125C3.86719 14.2969 4.57031 15 5.74219 15ZM24.4922 15C25.6055 15 26.3672 14.2969 26.3672 13.125C26.3672 12.0117 25.6055 11.25 24.4922 11.25C23.3203 11.25 21.6797 12.9492 21.6797 14.0625C21.6797 15.1758 23.3203 15 24.4922 15Z" fill="#2563EB"/>
          </svg>
        </div>
        <p class="add-car__info-text">Добавьте информацию о вашем автомобиле</p>
      </div>

      <!-- Form Fields -->
      <div class="add-car__form">
        <div class="add-car__field">
          <label class="add-car__label">Марка автомобиля</label>
          <input
            v-model="brand"
            type="text"
            class="add-car__input"
            placeholder="Например: Toyota, BMW, Lada"
          />
        </div>

        <div class="add-car__field">
          <label class="add-car__label">Модель автомобиля</label>
          <input
            v-model="model"
            type="text"
            class="add-car__input"
            placeholder="Например: Camry, X5, Granta"
          />
        </div>

        <div class="add-car__field">
          <label class="add-car__label">Номер автомобиля</label>
          <div class="add-car__number-type-selector">
            <button
              type="button"
              class="add-car__number-type"
              :class="{ 'add-car__number-type--active': numberType === 'russian' }"
              @click="() => { numberType = 'russian'; number = ''; region = ''; }"
            >
              Российский номер
            </button>
            <button
              type="button"
              class="add-car__number-type"
              :class="{ 'add-car__number-type--active': numberType === 'foreign' }"
              @click="() => { numberType = 'foreign'; number = ''; region = ''; }"
            >
              <span>Иностранный</span>
              <span>номер</span>
            </button>
          </div>

          <!-- Russian Number -->
          <div v-if="numberType === 'russian'" class="add-car__russian-number">
            <div class="add-car__number-field">
              <label class="add-car__number-label">Номер</label>
              <input
                :value="number"
                @input="handleNumberInput"
                type="text"
                class="add-car__number-input"
                :class="{ 'add-car__number-input--error': number && !isRussianNumberValid }"
                placeholder="А000АА"
                maxlength="6"
              />
              <div v-if="number && !isRussianNumberValid" class="add-car__error-message">
                Номер должен быть в формате: буква, 3 цифры, 2 буквы (например, А000АА)
              </div>
            </div>
            <div class="add-car__number-field">
              <label class="add-car__number-label">Регион</label>
              <input
                :value="region"
                @input="handleRegionInput"
                type="text"
                class="add-car__number-input"
                :class="{ 'add-car__number-input--error': region && (region.length === 0 || region.length > 3) }"
                placeholder="777"
                maxlength="3"
                inputmode="numeric"
                pattern="[0-9]*"
              />
              <div v-if="region && (region.length === 0 || region.length > 3)" class="add-car__error-message">
                Регион должен содержать от 1 до 3 цифр
              </div>
            </div>
          </div>

          <!-- Foreign Number -->
          <div v-else class="add-car__foreign-number">
            <label class="add-car__label">Иностранный номер</label>
            <input
              v-model="number"
              type="text"
              class="add-car__input"
              placeholder="Укажите номер автомобиля"
            />
          </div>
        </div>

        <div class="add-car__field">
          <label class="add-car__label">Цвет автомобиля (необязательно)</label>
          <div class="add-car__color-swatches">
            <button
              v-for="colorItem in colorSwatches"
              :key="colorItem.id"
              type="button"
              class="add-car__color-swatch"
              :class="{ 'add-car__color-swatch--selected': selectedColorSwatch === colorItem.id }"
              :style="{ backgroundColor: colorItem.value }"
              @click="selectColorSwatch(colorItem.id)"
              :aria-label="colorItem.name"
            >
              <svg v-if="selectedColorSwatch === colorItem.id" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <input
            v-model="color"
            type="text"
            class="add-car__input"
            placeholder="Или введите цвет"
            @input="selectedColorSwatch = null"
          />
        </div>
      </div>
    </div>

    <!-- Footer Buttons -->
    <footer class="add-car__footer">
      <button type="button" class="add-car__save-button" :class="{ 'add-car__save-button--disabled': !canSave }" :disabled="!canSave" @click="saveCar">
        Добавить автомобиль
      </button>
      <button type="button" class="add-car__cancel-button" @click="emit('back')">
        Отмена
      </button>
    </footer>
  </section>
</template>

<style scoped>
.add-car {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-y: auto;
}

.add-car__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  background: white;
  border-bottom: 1px solid #E2E8F0;
}

.add-car__back {
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

.add-car__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.4px;
  line-height: 2.09;
  color: #1F2937;
  flex: 1;
  text-align: center;
}

.add-car__header-spacer {
  width: 30px;
  flex-shrink: 0;
}

.add-car__content {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  padding-bottom: 0;
}

.add-car__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9.5px;
  margin-bottom: 19px;
}

.add-car__info-icon {
  width: 60px;
  height: 60px;
  background: #DBEAFE;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-car__info-text {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 2;
  color: #4B5563;
  text-align: center;
}

.add-car__form {
  display: flex;
  flex-direction: column;
  gap: 15.5px;
}

.add-car__field {
  display: flex;
  flex-direction: column;
  gap: 3.5px;
}

.add-car__label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 2;
  color: #374151;
}

.add-car__input {
  width: 100%;
  padding: 12px 17px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: white;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: #000000;
  -webkit-appearance: none;
  appearance: none;
}

.add-car__input::placeholder {
  color: #9CA3AF;
}

.add-car__number-type-selector {
  display: flex;
  gap: 0;
  padding: 3px 4px;
  background: #E2E8F0;
  border-radius: 12px;
}

.add-car__number-type {
  flex: 1;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9.7px;
  color: #4B5563;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  text-align: center;
}

.add-car__number-type--active {
  background: white;
  color: #2563EB;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
}

.add-car__russian-number {
  display: flex;
  gap: 12px;
  margin-top: 6.5px;
}

.add-car__number-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3.5px;
}

.add-car__number-label {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 1.2;
  color: #4B5563;
}

.add-car__number-input {
  width: 100%;
  padding: 10px 28px 10px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: white;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: #000000;
  text-transform: uppercase;
  transition: border-color 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

.add-car__number-input--error {
  border-color: #DC2626;
}

.add-car__error-message {
  margin-top: 4px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 9px;
  line-height: 1.4;
  color: #DC2626;
}

.add-car__foreign-number {
  margin-top: 6.5px;
}

.add-car__footer {
  padding: 0 18px;
  padding-bottom: calc(18px + env(safe-area-inset-bottom));
  padding-top: 9px;
  background: white;
  border-top: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 60px;
  margin-top: 0;
}

.add-car__save-button {
  width: 100%;
  padding: 16px 0;
  background: #2563EB;
  border: none;
  border-radius: 12px;
  color: white;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 13.4px;
  cursor: pointer;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.add-car__save-button:active:not(:disabled) {
  background: #1D4ED8;
}

.add-car__save-button--disabled,
.add-car__save-button:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.6;
}

.add-car__cancel-button {
  width: 100%;
  padding: 12px 0;
  background: transparent;
  border: none;
  color: #4B5563;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 10px;
  cursor: pointer;
}

.add-car__cancel-button:active {
  opacity: 0.7;
}

.add-car__color-swatches {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.add-car__color-swatch {
  aspect-ratio: 1.5;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  padding: 0;
  min-height: 60px;
}

.add-car__color-swatch:hover {
  border-color: #d1d5db;
  transform: scale(1.05);
}

.add-car__color-swatch--selected {
  border-color: #2563EB;
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.add-car__color-swatch svg {
  position: absolute;
  z-index: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Специальная обработка для белого цвета */
.add-car__color-swatch[style*="#FFFFFF"],
.add-car__color-swatch[style*="#ffffff"] {
  background-color: #ffffff !important;
  border-color: #d1d5db;
}

.add-car__color-swatch[style*="#FFFFFF"]:hover,
.add-car__color-swatch[style*="#ffffff"]:hover {
  border-color: #9ca3af;
}

.add-car__color-swatch[style*="#FFFFFF"].add-car__color-swatch--selected,
.add-car__color-swatch[style*="#ffffff"].add-car__color-swatch--selected {
  border-color: #2563EB;
}
</style>

