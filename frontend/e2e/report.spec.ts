import { card, loginAs, unique } from "./helpers";
import { expect, test } from "./fixtures";

test("a reporter files a high phishing incident with evidence", async ({ page }) => {
  const title = unique("phishing wizard");
  await loginAs(page, "user");

  await page.getByRole("link", { name: "Report an incident" }).first().click();
  await expect(page).toHaveURL(/\/portal\/report$/);

  // Next is refused until a type is chosen.
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Choose what kind of incident this is.")).toBeVisible();

  await page.getByRole("radio", { name: /Phishing/ }).check({ force: true });
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("radio", { name: /High/ }).check({ force: true });
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByLabel("Short title").fill(title);
  await page.getByLabel("What did you see?").fill("A fake sign-in email asked for my password.");
  await page.getByLabel("Evidence files").setInputFiles({
    name: "suspicious-email.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("From: it-support@examp1e.test\nSubject: Reset your password now\n"),
  });
  await expect(page.getByText("suspicious-email.txt")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText("suspicious-email.txt")).toBeVisible();
  await page.getByRole("button", { name: "Send report" }).click();

  await expect(page.getByRole("heading", { name: /Case #\d+ is open/ })).toBeVisible();
  await page.getByRole("link", { name: "Track this case" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  const evidence = card(page, /^Evidence/);
  await expect(evidence.getByText("suspicious-email.txt", { exact: true })).toBeVisible();
  await expect(evidence.getByText(/SHA-256 [0-9a-f]{12}/)).toBeVisible();

  await page.getByRole("link", { name: "My cases" }).first().click();
  const caseCard = page.getByRole("article").filter({ hasText: title });
  await expect(caseCard).toBeVisible();
  await expect(caseCard.getByText("High", { exact: true })).toBeVisible();
  await expect(caseCard.getByText("Reported", { exact: true })).toBeVisible();
});

test("the wizard asks for a title and description", async ({ page }) => {
  await loginAs(page, "user");
  await page.goto("/portal/report");
  await page.getByRole("radio", { name: /Malware/ }).check({ force: true });
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: /Low/ }).check({ force: true });
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Give the report a short title.")).toBeVisible();
  await expect(page.getByText("Describe what you saw.")).toBeVisible();
});

test("another reporter cannot see or open the case", async ({ page, api }) => {
  const title = unique("private case");
  const incident = await api.createIncident("user", { title, type: "MALWARE", severity: "HIGH" });

  await loginAs(page, "user2");
  await page.goto("/portal/cases");
  await expect(page.getByRole("heading", { name: "My cases", level: 1 })).toBeVisible();
  await expect(page.getByText("You have not reported anything yet")).toBeVisible();
  await expect(page.getByText(title)).toHaveCount(0);

  await page.goto(`/portal/cases/${incident.id}`);
  await expect(page.getByText("Incident not found")).toBeVisible();
  await expect(page.getByText(title)).toHaveCount(0);

  await api.remove("admin", incident.id);
});
