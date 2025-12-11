<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="placeholder">
    <div class="placeholder__icon" aria-hidden="true">🚧</div>
    <h1 class="placeholder__title">{{ props.title }}</h1>
    <p class="placeholder__description">
      {{ props.description }}
    </p>
  </section>
</template>

<style scoped>
.placeholder {
  min-height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 48px 24px;
  background-color: #f8fafc;
  color: #0f172a;
  gap: 16px;
}

.placeholder__icon {
  font-size: 48px;
}

.placeholder__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.placeholder__description {
  margin: 0;
  max-width: 320px;
  color: #64748b;
  line-height: 1.6;
}
</style>

