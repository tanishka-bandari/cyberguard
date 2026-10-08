import { card, loginAs, unique } from "./helpers";
import { expect, test } from "./fixtures";

test("a reporter sees staff progress on their case", async ({ page, api }) => {
  test.setTimeout(120_000);
  const title = unique("portal updates");
  const incident = await api.createIncident("user", { title, severity: "HIGH" });

  await loginAs(page, "user");
  await page.goto("/portal/cases");
  const caseCard = page.getByRole("article").filter({ hasText: title });
  const currentStep = caseCard.locator('[aria-current="step"]');
  await expect(currentStep).toContainText("Reported");
  await expect(caseCard.getByText("Waiting for assignment")).toBeVisible();

  await api.assign("admin", incident.id, "analyst");
  // No reload: the list polls every 20 seconds.
  const polled = { timeout: 40_000 };
  await expect(currentStep).toContainText("Under investigation", polled);
  await expect(caseCard.getByText("handled by Analyst One")).toBeVisible();

  await api.setStatus("analyst", incident.id, "RESOLVED");
  await expect(currentStep).toContainText("Resolved", polled);

  await page.getByRole("link", { name: "Overview" }).first().click();
  await expect(page.getByRole("heading", { name: "Overview", level: 1 })).toBeVisible();
  await expect(card(page, "Latest updates")).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: title })).toHaveCount(0);

  await api.remove("admin", incident.id);
});

test("the overview lists an open case with its status", async ({ page, api }) => {
  const title = unique("portal overview");
  const incident = await api.createIncident("user", { title });
  await loginAs(page, "user");
  const caseCard = page.getByRole("article").filter({ hasText: title });
  await expect(caseCard).toBeVisible();
  await expect(caseCard.locator('[aria-current="step"]')).toContainText("Reported");
  await api.remove("admin", incident.id);
});
