import { card, loginAs, unique } from "./helpers";
import { expect, test } from "./fixtures";

test("an admin reports an incident from the list, opens it and assigns an analyst", async ({ page, api }) => {
  const title = unique("admin created");
  await loginAs(page, "admin");
  await page.goto("/incidents");

  await page.getByRole("button", { name: "Report incident" }).click();
  const dialog = page.getByRole("dialog", { name: "Report an incident" });
  await dialog.getByRole("button", { name: "Report incident" }).click();
  await expect(dialog.getByText("Enter a title")).toBeVisible();

  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Type").selectOption("MALWARE");
  await dialog.getByLabel("Severity").selectOption("CRITICAL");
  await dialog.getByLabel("Description").fill("Endpoint protection quarantined an unknown binary.");
  await dialog.getByRole("button", { name: "Report incident" }).click();

  await expect(page).toHaveURL(/\/incidents\/\d+$/);
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await expect(card(page, "Status").getByRole("button", { name: /Reported/ })).toBeDisabled();

  const analystId = await api.userId("analyst");
  await card(page, "Assignment").getByLabel("Assignee").selectOption(String(analystId));
  await expect(page.getByText("Incident assigned")).toBeVisible();
  await expect(card(page, "Details").getByText("Analyst One")).toBeVisible();
  await expect(page.getByRole("heading", { name: title, level: 1 }).locator("xpath=..").getByText("Under investigation")).toBeVisible();

  await expect(card(page, "Timeline").getByText("Incident reported", { exact: true })).toBeVisible();
  await expect(card(page, "Timeline").getByText("Assigned", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete incident" }).click();
  await expect(page).toHaveURL(/\/incidents$/);
  await expect(page.getByText(title)).toHaveCount(0);
});

test("an analyst works an incident: note, evidence, resolve and close", async ({ page, api }) => {
  const title = unique("analyst work");
  const incident = await api.createIncident("user", { title, type: "RANSOMWARE", severity: "HIGH", riskScore: 70 });
  await api.assign("admin", incident.id, "analyst");

  await loginAs(page, "analyst");
  await page.goto(`/incidents/${incident.id}`);
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();

  // Analysts do not see the admin-only controls.
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
  await expect(card(page, "Assignment")).toHaveCount(0);

  const note = `Isolated the host from the network ${Date.now()}`;
  await page.getByLabel("Add a note").fill(note);
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(card(page, /^Notes/).getByText(note)).toBeVisible();
  await page.reload();
  await expect(card(page, /^Notes/).getByText(note)).toBeVisible();

  const contents = "indicator,value\nhash,deadbeef\n";
  await page.locator("input[type=file]").setInputFiles({
    name: "indicators.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(contents),
  });
  const evidence = card(page, /^Evidence/);
  await expect(evidence.getByText("indicators.csv")).toBeVisible();
  await expect(evidence.getByText(/SHA-256 [0-9a-f]{12}\.\.\./)).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    evidence.getByRole("button", { name: "Download indicators.csv" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("indicators.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  expect(Buffer.concat(chunks).toString()).toBe(contents);

  const status = card(page, "Status");
  await status.getByRole("button", { name: "Resolve", exact: true }).click();
  await expect(page.getByText("Status changed to resolved")).toBeVisible();
  await status.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByText("Status changed to closed")).toBeVisible();
  await expect(status.getByRole("button", { name: "Reopen" })).toBeVisible();

  const timeline = card(page, "Timeline");
  await expect(timeline.getByText("Incident reported", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Assigned", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Note added", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Evidence uploaded", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Status changed", { exact: true })).toHaveCount(2);

  await api.remove("admin", incident.id);
});

test("a reporter sees their case and its timeline but no staff controls", async ({ page, api }) => {
  const title = unique("reporter view");
  const incident = await api.createIncident("user", { title });
  await api.addNote("analyst", incident.id, "We are looking at this.");

  await loginAs(page, "user");
  await page.goto(`/portal/cases/${incident.id}`);
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await expect(card(page, "Progress")).toBeVisible();
  await expect(card(page, "Status")).toHaveCount(0);
  await expect(card(page, /^Notes/).getByText("We are looking at this.")).toBeVisible();
  await expect(page.getByLabel("Add a note")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  await api.remove("admin", incident.id);
});
