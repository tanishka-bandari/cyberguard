import { loginAs, type AccountKey } from "./helpers";
import { expect, test } from "./fixtures";

const VIEWPORTS = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "full hd", width: 1920, height: 1080 },
];

const PAGES: { path: string; as: AccountKey | null; heading: string }[] = [
  { path: "/login", as: null, heading: "Sign in" },
  { path: "/dashboard", as: "admin", heading: "Dashboard" },
  { path: "/incidents", as: "admin", heading: "Incidents" },
  { path: "/portal/report", as: "user", heading: "Report an incident" },
  { path: "/admin/triage", as: "admin", heading: "Triage board" },
  { path: "/admin/command-center", as: "admin", heading: "Command center" },
  { path: "/admin/users", as: "admin", heading: "Users" },
  { path: "/team", as: "admin", heading: "Team" },
];

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const { path, as, heading } of PAGES) {
      test(`${path} has no horizontal page scroll`, async ({ page }) => {
        if (as) await loginAs(page, as);
        await page.goto(path);
        await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
        // Let data-driven content (tables, charts, columns) render before measuring.
        await page.waitForLoadState("networkidle");
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
      });
    }
  });
}

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the drawer opens, navigates and closes", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "Incidents" }).click();

    await expect(page).toHaveURL(/\/incidents$/);
    await expect(drawer).toBeHidden();
    await expect(page.getByRole("heading", { name: "Incidents", level: 1 })).toBeVisible();
  });
});
