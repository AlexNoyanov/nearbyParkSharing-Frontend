<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  currentEndDate?: string
  currentEndTime?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', data: { date: string; time: string }): void
  (e: 'cancel'): void
}>()

// Initialize with current booking end date/time or today
const today = new Date()
const selectedDate = ref(props.currentEndDate || today.toISOString().split('T')[0])
const selectedTime = ref(props.currentEndTime || '12:00')

// Drag handling for bottom sheet
const modalContent = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const translateY = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  if (!modalContent.value) return
  isDragging.value = true
  startY.value = e.touches[0].clientY
  currentY.value = startY.value
  e.preventDefault()
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !modalContent.value) return
  e.preventDefault()
  currentY.value = e.touches[0].clientY
  const deltaY = currentY.value - startY.value
  // Only allow dragging down
  if (deltaY > 0) {
    translateY.value = deltaY
    modalContent.value.style.transform = `translateY(${deltaY}px)`
    modalContent.value.style.transition = 'none'
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value || !modalContent.value) return
  isDragging.value = false
  modalContent.value.style.transition = 'transform 0.3s ease'
  
  // If dragged down more than 100px, close the modal
  if (translateY.value > 100) {
    modalContent.value.style.transform = 'translateY(100%)'
    setTimeout(() => {
      emit('cancel')
    }, 300)
  } else {
    // Snap back to original position
    modalContent.value.style.transform = 'translateY(0)'
  }
  translateY.value = 0
}

const handleMouseDown = (e: MouseEvent) => {
  if (!modalContent.value) return
  isDragging.value = true
  startY.value = e.clientY
  currentY.value = startY.value
  e.preventDefault()
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !modalContent.value) return
  currentY.value = e.clientY
  const deltaY = currentY.value - startY.value
  // Only allow dragging down
  if (deltaY > 0) {
    translateY.value = deltaY
    modalContent.value.style.transform = `translateY(${deltaY}px)`
    modalContent.value.style.transition = 'none'
  }
}

const handleMouseUp = () => {
  if (!isDragging.value || !modalContent.value) return
  isDragging.value = false
  modalContent.value.style.transition = 'transform 0.3s ease'
  
  // If dragged down more than 100px, close the modal
  if (translateY.value > 100) {
    modalContent.value.style.transform = 'translateY(100%)'
    setTimeout(() => {
      emit('cancel')
    }, 300)
  } else {
    // Snap back to original position
    modalContent.value.style.transform = 'translateY(0)'
  }
  translateY.value = 0
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleTouchMove)
})

const surcharge = computed(() => {
  // Calculate surcharge based on extension
  // For now, return fixed value
  return 160
})

const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedDate.value = target.value
}

const handleTimeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedTime.value = target.value
}

const handleConfirm = () => {
  emit('confirm', {
    date: selectedDate.value,
    time: selectedTime.value
  })
}
</script>

<template>
  <div class="extend-modal__overlay" @click="emit('cancel')">
    <div 
      ref="modalContent"
      class="extend-modal__content" 
      @click.stop
    >
      <div 
        ref="dragHandle"
        class="extend-modal__drag-handle"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
      ></div>
      <h2 class="extend-modal__title">Когда планируете завершить?</h2>
      
      <div class="extend-modal__inputs">
        <div class="extend-modal__input-group">
          <label class="extend-modal__label">Дата</label>
          <div class="extend-modal__input-wrapper">
            <input
              type="date"
              class="extend-modal__input"
              :value="selectedDate"
              @change="handleDateChange"
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="extend-modal__input-icon">
              <path d="M6.25 1.875C6.66406 1.875 6.875 2.08594 6.875 2.5V3.125H13.125V2.5C13.125 2.08594 13.3359 1.875 13.75 1.875C14.1641 1.875 14.375 2.08594 14.375 2.5V3.125H16.25C17.4922 3.125 18.4375 4.07031 18.4375 5.3125V16.25C18.4375 17.4922 17.4922 18.4375 16.25 18.4375H3.75C2.50781 18.4375 1.5625 17.4922 1.5625 16.25V5.3125C1.5625 4.07031 2.50781 3.125 3.75 3.125H5.625V2.5C5.625 2.08594 5.83594 1.875 6.25 1.875ZM3.125 7.1875V16.25C3.125 16.6797 3.44531 17 3.75 17H16.25C16.5547 17 16.875 16.6797 16.875 16.25V7.1875H3.125Z" fill="#6B7280"/>
            </svg>
          </div>
        </div>
        
        <div class="extend-modal__input-group">
          <label class="extend-modal__label">Время</label>
          <div class="extend-modal__input-wrapper">
            <input
              type="time"
              class="extend-modal__input"
              :value="selectedTime"
              @change="handleTimeChange"
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="extend-modal__input-icon">
              <path d="M10 1.875C5.42969 1.875 1.875 5.42969 1.875 10C1.875 14.5703 5.42969 18.125 10 18.125C14.5703 18.125 18.125 14.5703 18.125 10C18.125 5.42969 14.5703 1.875 10 1.875ZM10 16.25C6.49219 16.25 3.75 13.5078 3.75 10C3.75 6.49219 6.49219 3.75 10 3.75C13.5078 3.75 16.25 6.49219 16.25 10C16.25 13.5078 13.5078 16.25 10 16.25ZM10.625 6.25C10.625 5.83594 10.4141 5.625 10 5.625C9.58594 5.625 9.375 5.83594 9.375 6.25V10C9.375 10.2422 9.50781 10.4609 9.72656 10.5703L12.8516 12.0703C13.2031 12.2266 13.6328 12.0859 13.7891 11.7344C13.9453 11.3828 13.8047 10.9531 13.4531 10.7969L10.625 9.49219V6.25Z" fill="#6B7280"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="extend-modal__surcharge">
        <span class="extend-modal__surcharge-label">Доплата</span>
        <span class="extend-modal__surcharge-amount">₽{{ surcharge }}</span>
      </div>

      <button
        type="button"
        class="extend-modal__button"
        @click="handleConfirm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.75 8.25V3.75C9.75 3.33594 9.41406 3 9 3C8.58594 3 8.25 3.33594 8.25 3.75V8.25H3.75C3.33594 8.25 3 8.58594 3 9C3 9.41406 3.33594 9.75 3.75 9.75H8.25V14.25C8.25 14.6641 8.58594 15 9 15C9.41406 15 9.75 14.6641 9.75 14.25V9.75H14.25C14.6641 9.75 15 9.41406 15 9C15 8.58594 14.6641 8.25 14.25 8.25H9.75Z" fill="white"/>
        </svg>
        Продлить
      </button>
    </div>
  </div>
</template>

<style scoped>
.extend-modal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.extend-modal__content {
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  padding-top: 12px;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideUp 0.3s ease;
  transition: transform 0.3s ease;
}

.extend-modal__drag-handle {
  width: 40px;
  height: 4px;
  background: #D1D5DB;
  border-radius: 2px;
  margin: 8px auto 12px;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.extend-modal__drag-handle:active {
  cursor: grabbing;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.extend-modal__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
  color: #1F2937;
  text-align: center;
}

.extend-modal__inputs {
  display: flex;
  gap: 12px;
}

.extend-modal__input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extend-modal__label {
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #1F2937;
}

.extend-modal__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.extend-modal__input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
  background: #ffffff;
  appearance: none;
}

.extend-modal__input:focus {
  outline: none;
  border-color: #2563EB;
}

.extend-modal__input-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
}

.extend-modal__surcharge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #DBEAFE;
  border-radius: 12px;
}

.extend-modal__surcharge-label {
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: #6B7280;
}

.extend-modal__surcharge-amount {
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.4;
  color: #2563EB;
}

.extend-modal__button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: #2563EB;
  color: #ffffff;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.extend-modal__button:hover {
  background: #1D4ED8;
}

.extend-modal__button svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>

