import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward every /api request to the Spring Boot backend.
    // This avoids CORS errors during development.
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});