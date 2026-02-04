// Test mode toggle service
// Stores test mode state in localStorage

const TEST_MODE_KEY = 'parkshare_test_mode'

export const testMode = {
  /**
   * Check if test mode is enabled
   */
  isEnabled(): boolean {
    const stored = localStorage.getItem(TEST_MODE_KEY)
    // In dev mode, enable test mode by default
    if (stored === null) {
      return import.meta.env.DEV
    }
    return stored === 'true'
  },

  /**
   * Enable test mode
   */
  enable(): void {
    localStorage.setItem(TEST_MODE_KEY, 'true')
    console.log('[TestMode] Test mode enabled')
  },

  /**
   * Disable test mode
   */
  disable(): void {
    localStorage.setItem(TEST_MODE_KEY, 'false')
    console.log('[TestMode] Test mode disabled')
  },

  /**
   * Toggle test mode
   */
  toggle(): boolean {
    if (this.isEnabled()) {
      this.disable()
      return false
    } else {
      this.enable()
      return true
    }
  },
}

