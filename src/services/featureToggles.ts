// Feature toggle service
// Checks feature availability from noyanov.com/Apps/ParkShare/config.php

import { testMode } from './testMode'

export type FeatureKey =
  | 'onboarding1'
  | 'onboarding2'
  | 'onboarding-final'
  | 'login'
  | 'registration'
  | 'code-verification'
  | 'call-verification'
  | 'home'
  | 'search'
  | 'details'
  | 'summary'
  | 'active'
  | 'rent'
  | 'profile'
  | 'chat'
  | 'booking-details'

export interface FeatureToggleResponse {
  enabled: boolean
  message?: string
}

// Cache for feature toggles to avoid repeated requests
const featureToggleCache: Map<FeatureKey, { enabled: boolean; timestamp: number }> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Default feature states (if API fails, these are used)
const defaultFeatureStates: Record<FeatureKey, boolean> = {
  'onboarding1': true,
  'onboarding2': true,
  'onboarding-final': true,
  'login': true,
  'registration': true,
  'code-verification': true,
  'call-verification': true,
  'home': true,
  'search': true,
  'details': true,
  'summary': true,
  'active': true,
  'rent': true,  // Enabled - доступно через "Найти парковку"
  'profile': true,
  'chat': true,
  'booking-details': true,
}

// Placeholder messages for disabled features
const placeholderMessages: Record<FeatureKey, { title: string; description: string }> = {
  'onboarding1': {
    title: 'Онбординг временно недоступен',
    description: 'Мы обновляем процесс знакомства с приложением. Пожалуйста, попробуйте позже.',
  },
  'onboarding2': {
    title: 'Онбординг временно недоступен',
    description: 'Мы обновляем процесс знакомства с приложением. Пожалуйста, попробуйте позже.',
  },
  'onboarding-final': {
    title: 'Регистрация временно недоступна',
    description: 'Мы обновляем процесс регистрации. Пожалуйста, попробуйте позже.',
  },
  'login': {
    title: 'Вход временно недоступен',
    description: 'Мы обновляем систему входа. Пожалуйста, попробуйте позже.',
  },
  'registration': {
    title: 'Регистрация временно недоступна',
    description: 'Мы обновляем процесс регистрации. Пожалуйста, попробуйте позже.',
  },
  'code-verification': {
    title: 'Подтверждение кода временно недоступно',
    description: 'Мы обновляем систему подтверждения. Пожалуйста, попробуйте позже.',
  },
  'call-verification': {
    title: 'Подтверждение через звонок временно недоступно',
    description: 'Мы обновляем систему подтверждения. Пожалуйста, попробуйте позже.',
  },
  'home': {
    title: 'Главная страница временно недоступна',
    description: 'Мы обновляем главную страницу. Пожалуйста, попробуйте позже.',
  },
  'search': {
    title: 'Поиск временно недоступен',
    description: 'Мы обновляем систему поиска парковок. Пожалуйста, попробуйте позже.',
  },
  'details': {
    title: 'Детали парковки временно недоступны',
    description: 'Мы обновляем страницу деталей. Пожалуйста, попробуйте позже.',
  },
  'summary': {
    title: 'Подтверждение бронирования временно недоступно',
    description: 'Мы обновляем процесс бронирования. Пожалуйста, попробуйте позже.',
  },
  'active': {
    title: 'Активные бронирования временно недоступны',
    description: 'Мы обновляем страницу активных бронирований. Пожалуйста, попробуйте позже.',
  },
  'rent': {
    title: 'Раздел арендатора скоро появится',
    description: 'Мы финализируем процесс подачи заявки для владельцев парковочных мест.',
  },
  'profile': {
    title: 'Профиль в разработке',
    description: 'Здесь будут храниться ваши брони, история поездок и персональные настройки.',
  },
  'chat': {
    title: 'Чаты запускаем позже',
    description: 'Команда работает над единым центром общения с арендаторами и службой поддержки.',
  },
  'booking-details': {
    title: 'Детали бронирования временно недоступны',
    description: 'Мы обновляем страницу деталей бронирования. Пожалуйста, попробуйте позже.',
  },
}

export const featureToggles = {
  /**
   * Check if a feature is enabled
   * @param featureKey - The feature key to check
   * @returns Promise<boolean> - True if feature is enabled, false otherwise
   */
  async isEnabled(featureKey: FeatureKey): Promise<boolean> {
    // In test mode, skip network requests and use default states
    if (testMode.isEnabled()) {
      const defaultEnabled = defaultFeatureStates[featureKey]
      // Cache the default state
      featureToggleCache.set(featureKey, {
        enabled: defaultEnabled,
        timestamp: Date.now(),
      })
      return defaultEnabled
    }

    // Check cache first
    const cached = featureToggleCache.get(featureKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.enabled
    }

    try {
      const response = await fetch(`https://noyanov.com/Apps/ParkShare/config.php?feature=${featureKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(3000), // 3 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: FeatureToggleResponse = await response.json()
      const enabled = data.enabled ?? defaultFeatureStates[featureKey]

      // Cache the result
      featureToggleCache.set(featureKey, {
        enabled,
        timestamp: Date.now(),
      })

      return enabled
    } catch (error) {
      console.warn(`[Feature Toggle] Failed to fetch toggle for ${featureKey}:`, error)
      
      // Use default state on error
      const defaultEnabled = defaultFeatureStates[featureKey]
      
      // Cache the default state (with shorter cache)
      featureToggleCache.set(featureKey, {
        enabled: defaultEnabled,
        timestamp: Date.now(),
      })

      return defaultEnabled
    }
  },

  /**
   * Get placeholder message for a disabled feature
   */
  getPlaceholderMessage(featureKey: FeatureKey): { title: string; description: string } {
    return placeholderMessages[featureKey] || {
      title: 'Функция временно недоступна',
      description: 'Мы обновляем эту функцию. Пожалуйста, попробуйте позже.',
    }
  },

  /**
   * Clear the feature toggle cache
   */
  clearCache(): void {
    featureToggleCache.clear()
  },

  /**
   * Preload feature toggles for multiple features
   */
  async preload(featureKeys: FeatureKey[]): Promise<void> {
    await Promise.all(featureKeys.map((key) => this.isEnabled(key)))
  },
}

