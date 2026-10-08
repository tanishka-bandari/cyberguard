import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Ports are fixed so the suite never collides with a dev backend on 8080 or a dev server on 3000.
const BACKEND_PORT = 8081;
const FRONTEND_PORT = 3100;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// The backend needs JDK 21; a newer default JDK will not build it.
const WINDOWS_JDK = "C:/Program Files/Java/jdk-21.0.11";
const javaHome = process.env.E2E_JAVA_HOME ?? (existsSync(WINDOWS_JDK) ? WINDOWS_JDK : process.env.JAVA_HOME);

export default defineConfig({
  testDir: "./e2e",
  testIgnore: process.env.SCREENSHOTS ? [] : ["**/screenshots.spec.ts"],
  testMatch: process.env.SCREENSHOTS ? ["**/screenshots.spec.ts"] : ["**/*.spec.ts"],
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // GET /api/auth/login answers 405, so readiness is the open port rather than a URL.
      command: "node e2e/serve-backend.mjs",
      port: BACKEND_PORT,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...(javaHome ? { JAVA_HOME: javaHome } : {}),
        SERVER_PORT: String(BACKEND_PORT),
        CORS_ALLOWED_ORIGINS: FRONTEND_URL,
      },
    },
    {
      // The /api rewrite is fixed at build time, so the build gets BACKEND_URL too.
      command: "node e2e/serve.mjs",
      port: FRONTEND_PORT,
      timeout: 360_000,
      reuseExistingServer: !process.env.CI,
      env: { BACKEND_URL, E2E_FRONTEND_PORT: String(FRONTEND_PORT) },
    },
  ],
});
