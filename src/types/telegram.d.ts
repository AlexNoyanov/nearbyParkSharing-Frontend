declare global {
  interface TelegramWebApp {
    ready: () => void
    expand: () => void
    setBackgroundColor: (color: string) => void
    setHeaderColor: (color: string) => void
    openLink?: (url: string, options?: { try_instant_view?: boolean }) => void
    openTelegramLink?: (url: string) => void
  BackButton: {
      show: () => void
      hide: () => void
      onClick: (handler: () => void) => void
      offClick: (handler: () => void) => void
    }
    themeParams?: Record<string, string>
    initData?: string
    initDataUnsafe?: {
      user?: {
        id?: number
        first_name?: string
        last_name?: string
        username?: string
        language_code?: string
      }
    }
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

export {}

