<script setup lang="ts">
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="cancel-modal__overlay" @click="emit('cancel')">
    <div class="cancel-modal__content" @click.stop>
      <h2 class="cancel-modal__title">Отменить бронирование?</h2>
      <p class="cancel-modal__description">
        Вы уверены, что хотите отменить бронирование? После отмены вы получите уведомление и возврат предоплаты.
      </p>
      <div class="cancel-modal__actions">
        <button
          type="button"
          class="cancel-modal__button cancel-modal__button--secondary"
          @click="emit('cancel')"
        >
          Нет, оставить
        </button>
        <button
          type="button"
          class="cancel-modal__button cancel-modal__button--primary"
          @click="emit('confirm')"
        >
          Да, отменить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cancel-modal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.cancel-modal__content {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cancel-modal__title {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
  color: #1F2937;
  text-align: center;
}

.cancel-modal__description {
  margin: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
  text-align: center;
}

.cancel-modal__actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cancel-modal__button {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-modal__button--secondary {
  background: #F3F4F6;
  color: #1F2937;
}

.cancel-modal__button--secondary:hover {
  background: #E5E7EB;
}

.cancel-modal__button--primary {
  background: #EF4444;
  color: #ffffff;
}

.cancel-modal__button--primary:hover {
  background: #DC2626;
}
</style>

