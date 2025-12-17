<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { FreeMode } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
// @ts-ignore - CSS imports don't have type declarations
import 'swiper/css'
// @ts-ignore - CSS imports don't have type declarations
import 'swiper/css/free-mode'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const swiperRef = ref<SwiperType | null>(null)
const isDragging = ref(false)

// Генерируем массив времени от 00:00 до 23:59 с шагом 15 минут
const timeSlots = computed(() => {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
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

// Обработка клика на время
const handleTimeClick = (time: string) => {
  emit('update:modelValue', time)
  nextTick(() => {
    scrollToTime(time)
  })
}

// Прокрутка к указанному времени
const scrollToTime = (time?: string) => {
  if (!swiperRef.value) return
  
  const targetTime = time || props.modelValue
  const normalized = normalizeTime(targetTime)
  const index = timeSlots.value.findIndex(slot => slot === normalized)
  
  if (index >= 0) {
    swiperRef.value.slideTo(index, 300)
  }
}

// Обработка изменения слайда
const handleSlideChange = (swiper: SwiperType) => {
  const activeIndex = swiper.activeIndex
  const nearestTime = timeSlots.value[activeIndex]
  if (nearestTime && nearestTime !== props.modelValue) {
    emit('update:modelValue', nearestTime)
  }
}

// Обработка начала перетаскивания
const handleTouchStart = () => {
  isDragging.value = true
}

// Обработка окончания перетаскивания
const handleTouchEnd = () => {
  isDragging.value = false
  if (swiperRef.value) {
    const activeIndex = swiperRef.value.activeIndex
    const nearestTime = timeSlots.value[activeIndex]
    if (nearestTime) {
      emit('update:modelValue', nearestTime)
      nextTick(() => {
        swiperRef.value?.slideTo(activeIndex, 300)
      })
    }
  }
}

// Модули Swiper
const modules = [FreeMode]

onMounted(() => {
  // Нормализуем начальное значение
  const normalized = normalizeTime(props.modelValue)
  if (normalized !== props.modelValue) {
    emit('update:modelValue', normalized)
  }
  
  nextTick(() => {
    setTimeout(() => {
      scrollToTime()
    }, 300)
  })
})

watch(() => props.modelValue, () => {
  if (!isDragging.value && swiperRef.value) {
    nextTick(() => {
      scrollToTime()
    })
  }
})
</script>

<template>
  <div class="time-slider">
    <div class="time-slider__header">
      <div class="time-slider__current-time">{{ modelValue }}</div>
    </div>
    <div class="time-slider__wrapper">
      <Swiper
        ref="swiperRef"
        :modules="modules"
        :slides-per-view="'auto'"
        :free-mode="true"
        :centered-slides="true"
        :space-between="0"
        :resistance="true"
        :resistance-ratio="0.85"
        :touch-ratio="1"
        :slide-to-clicked-slide="true"
        class="time-slider__swiper"
        @slide-change="handleSlideChange"
        @touch-start="handleTouchStart"
        @touch-end="handleTouchEnd"
      >
        <SwiperSlide
          v-for="(time, index) in timeSlots"
          :key="index"
          class="time-slider__slide"
          :class="{ 'time-slider__slide--active': time === modelValue }"
          @click="handleTimeClick(time)"
        >
          <div class="time-slider__item">
            <div class="time-slider__marker"></div>
            <div class="time-slider__time-label">{{ time }}</div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div class="time-slider__indicator">
        <div class="time-slider__triangle"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-slider {
  position: relative;
  width: 100%;
  margin-top: 8px;
}

.time-slider__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.time-slider__current-time {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  color: #1E40AF;
  text-align: left;
}

.time-slider__wrapper {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.time-slider__swiper {
  width: 100%;
  height: 100%;
  padding: 40px 0 0;
}

.time-slider__swiper :deep(.swiper-wrapper) {
  align-items: flex-start;
}

.time-slider__swiper :deep(.swiper-slide) {
  width: auto;
  height: auto;
}

.time-slider__slide {
  width: 60px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  cursor: pointer;
}

.time-slider__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: 100%;
}

.time-slider__marker {
  width: 2px;
  height: 12px;
  background-color: #86EFAC;
  margin-bottom: 6px;
  position: relative;
  z-index: 2;
}

.time-slider__slide--active .time-slider__marker {
  height: 16px;
  background-color: #22C55E;
}

.time-slider__time-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #1E40AF;
  white-space: nowrap;
  margin-top: 4px;
}

.time-slider__slide--active .time-slider__time-label {
  font-weight: 700;
}

.time-slider__indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 50px;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-slider__triangle {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 10px solid #22C55E;
  margin-bottom: 2px;
}

/* Горизонтальная линия */
.time-slider__wrapper::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 40px;
  height: 2px;
  background-color: #86EFAC;
  z-index: 1;
  pointer-events: none;
}

/* Стили для Swiper */
.time-slider__swiper :deep(.swiper-wrapper) {
  transition-timing-function: linear;
}

.time-slider__swiper :deep(.swiper-slide) {
  transition: transform 0.3s ease;
}
</style>
