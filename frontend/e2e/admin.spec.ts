import type { Page } from "@playwright/test";
import { loginAs, unique } from "./helpers";
import { expect, test } from "./fixtures";

async function kpi(page: Page, label: string) {
  const text = await page.getByRole("link", { name: new RegExp(`^${label}`) }).innerText();
  return Number(new RegExp(`${label}\\s+(\\d+)`).exec(text)?.[1]);
}

test("command center counts reflect new incidents", async ({ page, api }) => {
  await loginAs(page, "admin");
  await expect(page.getByRole("heading", { name: "Command center", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Open total/ })).toBeVisible();
  const openBefore = await kpi(page, "Open total");
  const unassignedBefore = await kpi(page, "Unassigned open");

  const incident = await api.createIncident("user", { title: unique("kpi"), severity: "LOW" });
  await page.reload();
  await expect(page.getByRole("link", { name: /^Open total/ })).toContainText(String(openBefore + 1));
  await expect(page.getByRole("link", { name: /^Unassigned open/ })).toContainText(String(unassignedBefore + 1));

  await api.assign("admin", incident.id, "analyst");
  await page.reload();
  await expect(page.getByRole("link", { name: /^Unassigned open/ })).toContainText(String(unassignedBefore));
  await expect(page.getByRole("link", { name: /^Open total/ })).toContainText(String(openBefore + 1));

  await api.remove("admin", incident.id);
});

test("an admin promotes a reporter to analyst and back", async ({ page, api }) => {
  await api.setRole("admin", "user2", "USER");
  await loginAs(page, "admin");
  await page.getByRole("link", { name: "Users" }).first().click();
  await expect(page.getByRole("heading", { name: "Users", level: 1 })).toBeVisible();
  await page.getByLabel("Search users").fill("user2@");

  const role = page.getByLabel("Role for Reporter Two");
  await expect(role).toHaveValue("USER");
  await role.selectOption("ANALYST");
  await expect(page.getByText("Reporter Two is now analyst")).toBeVisible();
  await expect(page.getByRole("row", { name: /Reporter Two/ }).locator("span").filter({ hasText: /^Analyst$/ })).toBeVisible();

  await role.selectOption("USER");
  await expect(page.getByText("Reporter Two is now reporter")).toBeVisible();
  await expect(role).toHaveValue("USER");
});

test.afterEach(async ({ api }, info) => {
  // A failed run must not leave the shared reporter account promoted.
  if (info.title.includes("promotes")) await api.setRole("admin", "user2", "USER");
});

test("an admin cannot change their own role", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/admin/users");
  await expect(page.getByLabel("Role for Admin User")).toBeDisabled();
  await expect(page.getByText("You cannot change your own role.")).toBeVisible();
});

test("an admin deletes an incident that has notes", async ({ page, api }) => {
  const title = unique("delete me");
  const incident = await api.createIncident("user", { title });
  await api.addNote("analyst", incident.id, "Note that goes away with the incident.");

  await loginAs(page, "admin");
  await page.goto(`/incidents/${incident.id}`);
  await expect(page.getByText("Note that goes away with the incident.")).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog", { name: "Delete this incident?" }).getByRole("button", { name: "Delete incident" }).click();

  await expect(page).toHaveURL(/\/incidents$/);
  await expect(page.getByText(`Incident #${incident.id} deleted`)).toBeVisible();
  expect((await api.list("admin")).map((i) => i.id)).not.toContain(incident.id);
});
