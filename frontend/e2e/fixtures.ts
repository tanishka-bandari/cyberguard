import { test as base, expect } from "@playwright/test";
import { Api } from "./helpers";

// Every test gets an `api` helper and fails if the page logs an uncaught error or a console error.
// Failed network requests are logged by Chromium as "Failed to load resource"; specs that
// expect a 401/403/404 are not affected by that.
export const test = base.extend<{ api: Api }>({
  api: async ({ request }, provide) => {
    await provide(new Api(request));
  },
  page: async ({ page }, provide) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      if (message.text().startsWith("Failed to load resource")) return;
      problems.push(`console.error: ${message.text()}`);
    });
    await provide(page);
    expect(problems, "browser console problems").toEqual([]);
  },
});

export { expect };
