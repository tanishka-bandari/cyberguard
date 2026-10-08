import { Api, card, loginAs, unique } from "./helpers";
import { expect, test } from "./fixtures";

test.describe("dashboard", () => {
  const critical = unique("dash critical");
  const low = unique("dash low");
  const ids: number[] = [];

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    const api = new Api(request);
    ids.push((await api.createIncident("user", { title: critical, severity: "CRITICAL", type: "RANSOMWARE", riskScore: 95 })).id);
    ids.push((await api.createIncident("user", { title: low, severity: "LOW", type: "OTHER", riskScore: 10 })).id);
    await request.dispose();
  });

  test.afterAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    const api = new Api(request);
    for (const id of ids) await api.remove("admin", id);
    await request.dispose();
  });

  test("the severity filter changes the URL and the table", async ({ page }) => {
    await loginAs(page, "analyst");
    const table = card(page, "Incidents");
    await expect(table.getByText(critical)).toBeVisible();
    await expect(table.getByText(low)).toBeVisible();

    await page.getByRole("group", { name: "Severity" }).getByRole("button", { name: "Critical" }).click();
    await expect(page).toHaveURL(/severity=CRITICAL/);
    await expect(table.getByText(critical)).toBeVisible();
    await expect(table.getByText(low)).toHaveCount(0);
    await expect(table.getByText(/\d+ matching/)).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).not.toHaveURL(/severity=/);
    await expect(table.getByText(low)).toBeVisible();
  });

  test("clicking a chart bar filters the dashboard", async ({ page }) => {
    await loginAs(page, "analyst");
    const bars = card(page, "Incidents by type").locator(".recharts-bar-rectangle");
    await expect(bars.first()).toBeVisible();
    await bars.first().click();
    await expect(page).toHaveURL(/type=[A-Z_]+/);
    await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
    await expect(card(page, "Incidents").getByText(/\d+ matching/)).toBeVisible();
  });

  test("a KPI card opens the matching filtered view", async ({ page }) => {
    await loginAs(page, "analyst");
    await page.getByRole("link", { name: /^Critical open/ }).click();
    await expect(page).toHaveURL(/severity=CRITICAL/);
    await expect(card(page, "Incidents").getByText(critical)).toBeVisible();
  });

  test("the theme choice survives a reload", async ({ page }) => {
    await loginAs(page, "analyst");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
    await expect(html).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
    await expect(html).not.toHaveClass(/dark/);
  });
});
