<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { VueScrollPicker } from 'vue-scroll-picker'
import 'vue-scroll-picker/style.css'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Генерируем массив опций времени от 00:00 до 23:59 с шагом 15 минут
const timeOptions = computed(() => {
  const options: Array<{ name: string; value: string }> = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push({ name: timeString, value: timeString })
    }
  }
  return options
})

// Нормализуем время к ближайшему слоту
const normalizeTime = (time: string): string => {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const normalizedMinutes = Math.round(minutes / 15) * 15
  const finalMinutes = normalizedMinutes >= 60 ? 0 : normalizedMinutes
  const finalHours = normalizedMinutes >= 60 ? (hours + 1) % 24 : hours
  return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
}

// Текущее выбранное значение
const selectedValue = ref(props.modelValue)

// Обработка изменения значения
const handleChange = (value: any) => {
  if (value && typeof value === 'string') {
    selectedValue.value = value
    emit('update:modelValue', value)
  } else if (value && typeof value === 'object' && value.value) {
    // Handle object with value property
    const stringValue = String(value.value)
    selectedValue.value = stringValue
    emit('update:modelValue', stringValue)
  }
}

onMounted(() => {
  // Нормализуем начальное значение
  const normalized = normalizeTime(props.modelValue)
  if (normalized !== props.modelValue) {
    emit('update:modelValue', normalized)
    selectedValue.value = normalized
  } else {
    selectedValue.value = props.modelValue
  }
})

watch(() => props.modelValue, (newValue) => {
  const normalized = normalizeTime(newValue)
  if (normalized !== selectedValue.value) {
    selectedValue.value = normalized
  }
})
</script>

<template>
  <div class="time-picker-scroll">
    <div class="time-picker-scroll__header">
      <div class="time-picker-scroll__current-time">{{ modelValue }}</div>
    </div>
    <div class="time-picker-scroll__wrapper">
      <VueScrollPicker
        :options="timeOptions"
        v-model="selectedValue"
        @update:model-value="handleChange"
        class="time-picker-scroll__picker"
      />
    </div>
  </div>
</template>

<style scoped>
.time-picker-scroll {
  position: relative;
  width: 100%;
  margin-top: 8px;
}

.time-picker-scroll__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.time-picker-scroll__current-time {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  color: #1E40AF;
  text-align: left;
}

.time-picker-scroll__wrapper {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.time-picker-scroll__picker {
  width: 100%;
}

/* Стилизация vue-scroll-picker */
.time-picker-scroll__picker :deep(.scroll-picker) {
  width: 100%;
}

.time-picker-scroll__picker :deep(.scroll-picker-item) {
  font-family: Inter, sans-serif;
  font-size: 14px;
  color: #1E40AF;
}

.time-picker-scroll__picker :deep(.scroll-picker-item-selected) {
  font-weight: 700;
  color: #1E40AF;
  font-size: 16px;
}
</style>

