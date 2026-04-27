"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for offline caching and performance
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production and if service workers are supported
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          console.log("✅ Service Worker registered:", registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "CACHE_CLEARED") {
              console.log("🗑️ Cache cleared");
            }
          });
        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
        }
      });
    }
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Hook to clear service worker cache
 */
export function useClearCache() {
  return async () => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_CACHE",
      });
      
      // Wait for confirmation
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener(
          "message",
          function handler(event) {
            if (event.data && event.data.type === "CACHE_CLEARED") {
              navigator.serviceWorker.removeEventListener("message", handler);
              resolve(true);
            }
          }
        );
      });
    }
  };
}
