<script setup lang="ts">
defineProps<{
  items: Array<{
    id: string
    label: string
    icon: string
    activeIcon?: string
    badge?: string
    disabled?: boolean
  }>
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', value: string): void
}>()

const handleSelect = (id: string, disabled?: boolean) => {
  if (disabled) {
    return
  }
  emit('update:modelValue', id)
  emit('select', id)
}
</script>

<template>
  <nav class="nav" aria-label="Основная навигация">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="nav__item"
      :class="{
        'nav__item--active': item.id === modelValue,
        'nav__item--disabled': item.disabled,
      }"
      :aria-current="item.id === modelValue ? 'page' : undefined"
      :aria-disabled="item.disabled ? 'true' : undefined"
      :disabled="item.disabled"
      @click="handleSelect(item.id, item.disabled)"
    >
      <span class="nav__icon" aria-hidden="true">
        <span
          class="nav__icon-svg"
          v-html="item.id === modelValue ? item.activeIcon ?? item.icon : item.icon"
        />
        <span v-if="item.badge" class="nav__badge">{{ item.badge }}</span>
      </span>
      <span class="nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 24px 32px calc(env(safe-area-inset-bottom) + 24px);
  box-shadow: 0 -18px 32px -28px rgba(15, 23, 42, 0.35);
  gap: 16px;
  position: relative;
  z-index: 100;
}

.nav__item {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 11.5px;
  font-weight: 500;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.nav__item--active {
  color: #9333ea;
  font-weight: 600;
}

.nav__item--disabled {
  color: #9ca3af;
  cursor: default;
}

.nav__item:disabled {
  cursor: default;
}

.nav__item:focus-visible {
  outline: 2px solid rgba(147, 51, 234, 0.35);
  outline-offset: 4px;
}

.nav__item:active:not(:disabled) {
  transform: translateY(1px);
}

.nav__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
}

.nav__icon-svg {
  display: inline-flex;
  line-height: 0;
}

.nav__icon-svg :deep(svg) {
  display: block;
}

.nav__icon-svg :deep(path) {
  transition: fill 0.2s ease;
}

.nav__label {
  font-size: 11.2px;
  line-height: 1.4;
}

.nav__badge {
  position: absolute;
  top: -2px;
  right: -10px;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9999px;
  padding: 2px 6px;
  min-width: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 480px) {
  .nav {
    padding: 20px 24px calc(env(safe-area-inset-bottom) + 20px);
    gap: 12px;
  }
}
</style>

