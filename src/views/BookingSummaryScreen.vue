<script setup lang="ts">
import type { ParkingSpot } from '../data/parkings'

const props = defineProps<{
  parking: ParkingSpot
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'confirm'): void
}>()

const priceNumeric = Number(props.parking.pricePerHour.replace(/\D/g, ''))
const serviceFee = Math.round(priceNumeric * 0.1)
const total = priceNumeric * 2 + serviceFee
</script>

<template>
  <section class="summary">
    <header class="summary__header">
      <button type="button" class="summary__back" @click="emit('back')" aria-label="Назад">←</button>
      <h1 class="summary__title">Подтверждение бронирования</h1>
    </header>

    <article class="summary__card">
      <h2 class="summary__card-title">{{ parking.name }}</h2>
      <p class="summary__card-subtitle">{{ parking.address }}</p>
      <div class="summary__info">
        <span>Сегодня · 13:00 — 15:00</span>
        <span>Место № {{ parking.availableSpots }}</span>
      </div>
    </article>

    <section class="summary__section">
      <h3 class="summary__section-title">Способ оплаты</h3>
      <div class="summary__payment">
        <div class="summary__payment-avatar" aria-hidden="true">💳</div>
        <div>
          <p class="summary__payment-title">Mastercard *9281</p>
          <p class="summary__payment-subtitle">Оплата при завершении парковки</p>
        </div>
        <button type="button" class="summary__payment-action">Изменить</button>
      </div>
    </section>

    <section class="summary__section">
      <h3 class="summary__section-title">Итого</h3>
      <div class="summary__price-row">
        <span>2 часа парковки</span>
        <span>{{ (priceNumeric * 2).toLocaleString('ru-RU') }} ₽</span>
      </div>
      <div class="summary__price-row">
        <span>Сервисный сбор</span>
        <span>{{ serviceFee.toLocaleString('ru-RU') }} ₽</span>
      </div>
      <div class="summary__divider" role="separator" />
      <div class="summary__price-row summary__price-row--total">
        <span>К оплате</span>
        <span>{{ total.toLocaleString('ru-RU') }} ₽</span>
      </div>
    </section>

    <footer class="summary__footer">
      <button type="button" class="summary__primary" @click="emit('confirm')">Подтвердить бронь</button>
      <p class="summary__hint">
        Нажимая кнопку, вы соглашаетесь с условиями сервиса и правилами въезда на парковку.
      </p>
    </footer>
  </section>
</template>

<style scoped>
.summary {
  display: grid;
  gap: 24px;
  padding: 24px;
  background-color: #f8fafc;
}

.summary__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary__back {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  font-size: 20px;
  cursor: pointer;
}

.summary__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.summary__card {
  padding: 24px;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 24px -18px rgba(15, 23, 42, 0.4);
  display: grid;
  gap: 12px;
}

.summary__card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.summary__card-subtitle {
  margin: 0;
  color: #64748b;
}

.summary__info {
  display: flex;
  justify-content: space-between;
  color: #475569;
  font-size: 14px;
}

.summary__section {
  display: grid;
  gap: 12px;
}

.summary__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.summary__payment {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.summary__payment-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9333ea, #2563eb);
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 20px;
}

.summary__payment-title {
  margin: 0;
  font-weight: 600;
  color: #111827;
}

.summary__payment-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.summary__payment-action {
  border: none;
  background: transparent;
  color: #4338ca;
  font-weight: 600;
  cursor: pointer;
}

.summary__price-row {
  display: flex;
  justify-content: space-between;
  color: #475569;
  font-size: 15px;
}

.summary__price-row--total {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.summary__divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0), rgba(148, 163, 184, 0.6), rgba(148, 163, 184, 0));
}

.summary__footer {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.summary__primary {
  padding: 18px 0;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #16a34a, #22d3ee);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.summary__hint {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 480px) {
  .summary {
    padding: 16px;
  }

  .summary__info {
    flex-direction: column;
    gap: 4px;
  }

  .summary__payment {
    grid-template-columns: auto 1fr;
  }
}
</style>

