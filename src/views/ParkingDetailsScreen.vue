<script setup lang="ts">
import type { ParkingSpot } from '../data/parkings'
import { subscriptionPlans } from '../data/parkings'

defineProps<{
  parking: ParkingSpot
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'reserve'): void
}>()
</script>

<template>
  <section class="details">
    <header class="details__header">
      <button type="button" class="details__back" @click="emit('back')" aria-label="Назад">←</button>
      <div>
        <h1 class="details__title">{{ parking.name }}</h1>
        <p class="details__subtitle">{{ parking.address }} · {{ parking.distance }}</p>
      </div>
      <span class="details__badge">⭐ {{ parking.rating.toFixed(1) }}</span>
    </header>

    <div class="details__gallery">
      <div class="details__photo" aria-label="Визуализация парковки">
        <span class="details__photo-text">Фото локации появится позже</span>
      </div>
      <div class="details__preview-grid">
        <div class="details__preview">Зона выезда</div>
        <div class="details__preview">Паркоматы</div>
        <div class="details__preview">Навигация</div>
        <div class="details__preview">Карта этажей</div>
      </div>
    </div>

    <section class="details__section">
      <h2 class="details__section-title">Описание</h2>
      <p class="details__description">{{ parking.description }}</p>
    </section>

    <section class="details__section">
      <h2 class="details__section-title">Услуги</h2>
      <ul class="details__features">
        <li v-for="feature in parking.features" :key="feature.id" class="details__feature">
          <span class="details__feature-icon" aria-hidden="true">{{ feature.icon }}</span>
          <span>{{ feature.label }}</span>
        </li>
      </ul>
    </section>

    <section class="details__section">
      <h2 class="details__section-title">Абонементы</h2>
      <div class="details__plans">
        <article v-for="plan in subscriptionPlans" :key="plan.id" class="details__plan-card">
          <h3 class="details__plan-title">{{ plan.title }}</h3>
          <p class="details__plan-desc">{{ plan.description }}</p>
          <p class="details__plan-price">{{ plan.price }}</p>
        </article>
      </div>
    </section>

    <footer class="details__footer">
      <div class="details__price">
        <span class="details__price-label">Итого за 2 часа</span>
        <strong class="details__price-value">{{ parking.pricePerHour.replace('/час', '') }}</strong>
      </div>
      <button type="button" class="details__primary" @click="emit('reserve')">Забронировать</button>
    </footer>
  </section>
</template>

<style scoped>
.details {
  display: grid;
  gap: 28px;
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100%;
}

.details__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
}

.details__back {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  font-size: 20px;
  cursor: pointer;
}

.details__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.details__subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.details__badge {
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  font-weight: 600;
}

.details__gallery {
  display: grid;
  gap: 16px;
}

.details__photo {
  border-radius: 24px;
  border: 1px dashed #cbd5f5;
  background: linear-gradient(120deg, rgba(79, 70, 229, 0.12), rgba(147, 51, 234, 0.12));
  display: grid;
  place-items: center;
  padding: 80px 0;
  color: #6366f1;
  font-weight: 500;
}

.details__photo-text {
  max-width: 240px;
  text-align: center;
}

.details__preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.details__preview {
  border-radius: 18px;
  background-color: #ffffff;
  border: 1px solid #e0e7ff;
  padding: 20px;
  text-align: center;
  color: #4f46e5;
  font-size: 14px;
  font-weight: 600;
}

.details__section {
  display: grid;
  gap: 16px;
}

.details__section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.details__description {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
}

.details__features {
  display: grid;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.details__feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 14px;
  background-color: #ffffff;
  border: 1px solid #e0e7ff;
  color: #4338ca;
  font-weight: 500;
}

.details__feature-icon {
  font-size: 20px;
}

.details__plans {
  display: grid;
  gap: 12px;
}

.details__plan-card {
  border-radius: 16px;
  padding: 18px 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.details__plan-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.details__plan-desc {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
}

.details__plan-price {
  margin: 14px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #16a34a;
}

.details__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px -20px rgba(30, 64, 175, 0.6);
}

.details__price-label {
  font-size: 13px;
  color: #64748b;
}

.details__price-value {
  font-size: 22px;
  color: #111827;
}

.details__primary {
  flex: 1;
  padding: 16px 0;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #9333ea, #2563eb);
  cursor: pointer;
}

@media (max-width: 480px) {
  .details {
    padding: 16px;
  }

  .details__header {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }

  .details__badge {
    justify-self: flex-start;
  }

  .details__preview-grid {
    grid-template-columns: 1fr;
  }

  .details__footer {
    flex-direction: column;
  }

  .details__primary {
    width: 100%;
  }
}
</style>

