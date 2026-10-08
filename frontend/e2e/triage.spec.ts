import type { Page } from "@playwright/test";
import { card, loginAs, unique } from "./helpers";
import { expect, test } from "./fixtures";

const column = (page: Page, status: string) => page.getByRole("region", { name: new RegExp(`^${status},`) });
const incidentCard = (page: Page, title: string) => page.getByRole("article").filter({ hasText: title });
// Grab the card by its padding: the title link and the buttons inside it are not drag handles.
const GRAB = { x: 6, y: 6 };

// All five open columns must be on screen at once: a drop target outside the viewport cannot be reached.
test.use({ viewport: { width: 1920, height: 1200 } });

test("an admin drags a card onto an analyst and then into another column", async ({ page, api }) => {
  const title = unique("triage drag");
  const incident = await api.createIncident("user", { title, type: "PHISHING", severity: "HIGH" });

  await loginAs(page, "admin");
  await page.goto("/admin/triage");
  await expect(column(page, "Reported").getByRole("article").filter({ hasText: title })).toBeVisible();

  const analyst = card(page, "Staff").getByRole("listitem").filter({ hasText: "Analyst One" });
  await incidentCard(page, title).dragTo(analyst, { sourcePosition: GRAB });

  await expect(column(page, "Under investigation").getByRole("article").filter({ hasText: title })).toBeVisible();
  await expect(incidentCard(page, title).getByText("Analyst One")).toBeVisible();
  await expect(page.getByText(`#${incident.id} assigned to Analyst One`)).toBeVisible();

  await incidentCard(page, title).dragTo(column(page, "Contained"), { sourcePosition: GRAB });
  await expect(column(page, "Contained").getByRole("article").filter({ hasText: title })).toBeVisible();
  await expect(page.getByText(`#${incident.id} moved to Contained`)).toBeVisible();

  await api.remove("admin", incident.id);
});

test("the actions dialog assigns and unassigns without a mouse drag", async ({ page, api }) => {
  const title = unique("triage keyboard");
  const incident = await api.createIncident("user", { title, severity: "MEDIUM" });
  const analyst2 = await api.userId("analyst2");

  await loginAs(page, "admin");
  await page.goto("/admin/triage");

  const trigger = page.getByRole("button", { name: `Actions for incident ${incident.id}` });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: `Incident #${incident.id}` });
  await dialog.getByLabel("Assign to").selectOption(String(analyst2));
  await dialog.getByRole("button", { name: "Assign", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(column(page, "Under investigation").getByRole("article").filter({ hasText: title })).toBeVisible();
  await expect(incidentCard(page, title).getByText("Analyst Two")).toBeVisible();

  await trigger.click();
  await dialog.getByRole("button", { name: "Unassign" }).click();
  await expect(dialog).toBeHidden();
  await expect(column(page, "Reported").getByRole("article").filter({ hasText: title })).toBeVisible();
  await expect(incidentCard(page, title).getByText("Unassigned")).toBeVisible();

  await api.remove("admin", incident.id);
});

test("the triage board is closed to analysts", async ({ page }) => {
  await loginAs(page, "analyst");
  await page.goto("/admin/triage");
  await expect(page).toHaveURL(/\/dashboard$/);
});
