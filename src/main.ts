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
  
  // Initialize test mode (enabled by default)
  const { testMode } = await import('./services/testMode')
  if (testMode.isEnabled()) {
    console.log('[App] Test mode is ENABLED - using mock authentication')
  } else {
    console.log('[App] Test mode is DISABLED - using real API')
  }
  
  mountApp();
};

bootstrap();
