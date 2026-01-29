// Polyfill for Node.js 'global' variable (required by sockjs-client)
if (typeof global === 'undefined') {
  (window as any).global = window;
}

import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { initAnalytics } from "./firebase";

const mountApp = () => {
  const app = createApp(App);
  app.mount("#app");
};

const initTelegramWebApp = () => {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) {
    return;
  }

  webApp.ready();

  try {
    webApp.expand();
  } catch (error) {
    console.warn("Unable to expand Telegram WebApp", error);
  }

  try {
    webApp.setBackgroundColor("#F8FAFC");
    webApp.setHeaderColor("#FFFFFF");
  } catch (error) {
    console.warn("Unable to set Telegram WebApp colors", error);
  }
};

const bootstrap = async () => {
  initTelegramWebApp();
  await initAnalytics();
  
  // Initialize test mode (disabled by default - uses real API)
  const { testMode } = await import('./services/testMode')
  
  // Force disable test mode for registration to use real API
  // Remove this line if you want to allow test mode to be enabled
  testMode.disable()
  
  if (testMode.isEnabled()) {
    console.log('[App] Test mode is ENABLED - using mock authentication')
  } else {
    console.log('[App] Test mode is DISABLED - using real API')
  }
  
  mountApp();
};

bootstrap();
