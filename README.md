# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Готовые UI-библиотеки со слайдерами времени

Для реализации выбора времени с помощью интерактивных слайдеров можно воспользоваться готовыми компонентами из популярных UI-библиотек:

### 1. **Vue Time Picker Libraries**

#### **vue-time-picker**
- **GitHub**: https://github.com/phoenixwong/vue-time-picker
- **Описание**: Легковесный компонент выбора времени для Vue.js
- **Особенности**: 
  - Поддержка 12/24-часового формата
  - Настраиваемый дизайн
  - Поддержка Vue 3
- **Установка**: `npm install vue-time-picker`

#### **@vuepic/vue-datepicker**
- **GitHub**: https://github.com/Vuepic/vue-datepicker
- **Описание**: Компонент выбора даты и времени для Vue 3
- **Особенности**:
  - Поддержка выбора времени
  - Календарь и временные слайдеры
  - TypeScript поддержка
- **Установка**: `npm install @vuepic/vue-datepicker`

### 2. **Material Design Libraries**

#### **Vuetify Time Picker**
- **Документация**: https://vuetifyjs.com/en/components/time-pickers/
- **Описание**: Компонент выбора времени из библиотеки Vuetify
- **Особенности**:
  - Material Design стиль
  - Интерактивные слайдеры для часов и минут
  - Поддержка Vue 3
- **Установка**: `npm install vuetify`

#### **Quasar Time Picker**
- **Документация**: https://quasar.dev/vue-components/time
- **Описание**: Компонент выбора времени из Quasar Framework
- **Особенности**:
  - Множество вариантов отображения
  - Поддержка мобильных устройств
  - Готовые темы
- **Установка**: `npm install quasar`

### 3. **Element Plus Time Picker**
- **Документация**: https://element-plus.org/en-US/component/time-picker.html
- **Описание**: Компонент выбора времени из Element Plus
- **Особенности**:
  - Простой и понятный API
  - Поддержка диапазонов времени
  - TypeScript поддержка
- **Установка**: `npm install element-plus`

### 4. **Ant Design Vue Time Picker**
- **Документация**: https://antdv.com/components/time-picker
- **Описание**: Компонент выбора времени из Ant Design Vue
- **Особенности**:
  - Богатый функционал
  - Поддержка форматов времени
  - Интеграция с другими компонентами
- **Установка**: `npm install ant-design-vue`

### 5. **Нативные решения**

#### **Native HTML5 Time Input**
- **Описание**: Встроенный `<input type="time">` элемент
- **Особенности**:
  - Нативная поддержка браузерами
  - Минимальная настройка
  - Ограниченная кастомизация

### Рекомендации

Для данного проекта используется **компонент TimeSlider на основе Swiper.js**, который:
- Реализует горизонтальный слайдер с прокруткой времени
- Отображает выбранное время крупным текстом сверху
- Поддерживает шаг в 15 минут (00:00 - 23:45)
- Оптимизирован для мобильных устройств с отличной поддержкой touch-событий
- Использует библиотеку Swiper.js для надежной работы прокрутки

**Используемая библиотека:**
- **Swiper.js** (https://swiperjs.com/)
  - Установка: `npm install swiper`
  - Версия: последняя стабильная
  - Особенности: отличная поддержка touch-событий, плавная прокрутка, центрирование слайдов

Компонент находится в `src/components/TimeSlider.vue` и использует Swiper для обеспечения корректной работы прокрутки за пределы экрана.
