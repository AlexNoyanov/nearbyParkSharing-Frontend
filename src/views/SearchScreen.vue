<script setup lang="ts">
import type { ParkingSpot } from '../data/parkings'
import { featuredParkings } from '../data/parkings'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-details', parking: ParkingSpot): void
}>()

const filters = [
  'До 500 м',
  'Охраняемая',
  'Зарядка EV',
  'Круглосуточно',
  'Абонемент',
]
</script>

<template>
  <section class="search">
    <header class="search__header">
      <button type="button" class="search__back" @click="emit('back')" aria-label="Назад">←</button>
      <div class="search__inputs">
        <div class="search__input">
          <label class="search__label">Локация</label>
          <input class="search__field" type="text" value="Рядом со мной" readonly />
        </div>
        <div class="search__input">
          <label class="search__label">Время</label>
          <input class="search__field" type="text" value="Сейчас · 2 часа" readonly />
        </div>
      </div>
    </header>

    <div class="search__filters">
      <button v-for="filter in filters" :key="filter" type="button" class="search__chip">
        {{ filter }}
      </button>
      <button type="button" class="search__chip search__chip--ghost">Больше фильтров</button>
    </div>

    <div class="search__map">
      <div class="search__map-placeholder">
        <span class="search__map-label">Карта скоро будет доступна</span>
      </div>
    </div>

    <section class="search__results">
      <h2 class="search__results-title">Найдено {{ featuredParkings.length }} парковок</h2>
      <article
        v-for="parking in featuredParkings"
        :key="parking.id"
        class="search__card"
        @click="emit('open-details', parking)"
      >
        <header class="search__card-header">
          <div>
            <h3 class="search__card-title">{{ parking.name }}</h3>
            <p class="search__card-address">{{ parking.address }} · {{ parking.distance }}</p>
          </div>
          <div class="search__card-price">
            {{ parking.pricePerHour }}
          </div>
        </header>
        <p class="search__card-description">{{ parking.description }}</p>
        <footer class="search__card-footer">
          <span class="search__card-rating">⭐ {{ parking.rating.toFixed(1) }} ({{ parking.reviews }})</span>
          <span class="search__card-spots">{{ parking.availableSpots }} свободно</span>
        </footer>
      </article>
    </section>
  </section>
</template>

<style scoped>
.search {
  display: grid;
  gap: 28px;
  padding-top: calc(env(safe-area-inset-top) + 24px);
  padding-left: calc(env(safe-area-inset-left) + 24px);
  padding-right: calc(env(safe-area-inset-right) + 24px);
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background-color: #f1f5f9;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.search__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.search__back {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  font-size: 20px;
  cursor: pointer;
}

.search__inputs {
  display: flex;
  gap: 16px;
  flex: 1;
}

.search__input {
  flex: 1;
  display: grid;
  gap: 6px;
}

.search__label {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  color: #64748b;
}

.search__field {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  font-size: 16px;
  color: #0f172a;
}

.search__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.search__chip {
  border-radius: 9999px;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  cursor: pointer;
}

.search__chip--ghost {
  background: transparent;
  border: 1px dashed #cbd5f5;
  color: #4338ca;
}

.search__map {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.search__map-placeholder {
  display: grid;
  place-items: center;
  padding: 64px 0;
  color: #94a3b8;
  font-size: 15px;
}

.search__results {
  display: grid;
  gap: 20px;
}

.search__results-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.search__card {
  padding: 20px 24px;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  display: grid;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.search__card:hover {
  transform: translateY(-2px);
}

.search__card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.search__card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.search__card-address {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

.search__card-price {
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
  font-weight: 600;
  height: fit-content;
}

.search__card-description {
  margin: 0;
  font-size: 14px;
  color: #475569;
}

.search__card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #475569;
}

.search__card-spots {
  color: #16a34a;
  font-weight: 600;
}

@media (max-width: 480px) {
  .search {
    padding-top: calc(env(safe-area-inset-top) + 16px);
    padding-left: calc(env(safe-area-inset-left) + 16px);
    padding-right: calc(env(safe-area-inset-right) + 16px);
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    gap: 20px;
  }

  .search__header {
    flex-wrap: wrap;
  }

  .search__back {
    flex-shrink: 0;
  }

  .search__inputs {
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  .search__input {
    min-width: 0;
  }

  .search__field {
    font-size: 14px;
    padding: 12px 14px;
  }

  .search__card {
    padding: 18px 20px;
  }
}

/* iPhone 13-14 Pro specific adjustments */
@media (max-width: 428px) and (min-height: 844px) {
  .search {
    gap: 24px;
  }

  .search__header {
    gap: 12px;
  }

  .search__back {
    width: 40px;
    height: 40px;
  }
}
</style>

