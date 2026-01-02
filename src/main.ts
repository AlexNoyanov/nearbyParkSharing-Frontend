import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { initAnalytics } from "./firebase";

// Add debug logging
console.log("main.ts loaded");

const mountApp = () => {
  const appElement = document.getElementById("app");
  if (!appElement) {
    console.error("App element not found!");
    return;
  }
  
  try {
    const app = createApp(App);
    app.mount("#app");
    console.log("App mounted successfully");
  } catch (error) {
    console.error("Failed to mount app:", error);
  }
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
  // Mount app first to ensure it renders immediately
  mountApp();
  
  // Then initialize services in background
  try {
    initTelegramWebApp();
    await initAnalytics();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    // Continue anyway - app is already mounted
  }
};

// Mount app immediately - don't wait for anything
console.log("Starting bootstrap...");
bootstrap();
