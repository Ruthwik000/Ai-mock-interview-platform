"use client";

import Vapi from "@vapi-ai/web";

// Create a dummy Vapi instance
const createDummyVapi = () => {
  return {
    on: (_event: string, _callback: Function) => {},
    off: (_event: string, _callback: Function) => {},
    start: async () => {
      throw new Error("Vapi is not available");
    },
    stop: () => {},
  };
};

// Initialize Vapi
let vapiInstance;

try {
  // Override the global console.error to filter out Vapi WebSocket errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    // Check if this is a Vapi WebSocket error
    if (args.length > 0) {
      const errorString = String(args[0]);
      if (
        errorString.includes("Vapi error") ||
        errorString.includes("Meeting ended") ||
        errorString.includes("WebSocket")
      ) {
        // Log to a custom debug function instead
        console.debug("Suppressed Vapi error:", ...args);
        return;
      }
    }
    // Call the original console.error for all other errors
    originalConsoleError.apply(console, args);
  };

  // Add global error handler for WebSocket errors
  if (typeof window !== "undefined") {
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
      if (message && String(message).includes("Meeting ended")) {
        console.debug("Suppressed unhandled Vapi error:", message);
        return true; // Prevents the error from being reported to the console
      }
      // Call the original onerror handler
      if (originalOnError) {
        return originalOnError.apply(window, [
          message,
          source,
          lineno,
          colno,
          error,
        ]);
      }
      return false;
    };
  }

  const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

  if (token) {
    vapiInstance = new Vapi(token);

    // Add custom error handler that suppresses console errors
    vapiInstance.on("error", (error) => {
      console.debug("Vapi error (suppressed):", error);
    });
  } else {
    console.debug("NEXT_PUBLIC_VAPI_WEB_TOKEN is not defined");
    vapiInstance = createDummyVapi();
  }
} catch (error) {
  console.debug("Error initializing Vapi (suppressed):", error);
  vapiInstance = createDummyVapi();
}

export const vapi = vapiInstance;
