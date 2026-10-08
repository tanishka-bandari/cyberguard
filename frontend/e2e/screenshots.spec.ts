import { mkdirSync } from "node:fs";
import path from "node:path";
import { test, type Browser, type Page } from "@playwright/test";
import { Api, loginAs, type AccountKey } from "./helpers";

// Run with SCREENSHOTS=1 (npm run test:e2e:screenshots). Writes the images used in the docs.
const OUT = path.join(__dirname, "..", "..", "docs", "screenshots");
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

type Seed = {
  title: string;
  type: string;
  severity: string;
  riskScore: number;
  reporter: "user" | "user2";
  assignee?: "analyst" | "analyst2" | "admin";
  status?: string;
  note?: string;
};

const SEEDS: Seed[] = [
  { title: "Ransomware note on the finance file server", type: "RANSOMWARE", severity: "CRITICAL", riskScore: 92, reporter: "user", assignee: "analyst", status: "CONTAINED", note: "Server isolated from the network. Backups from Tuesday verified." },
  { title: "Payroll phishing email reported by HR", type: "PHISHING", severity: "HIGH", riskScore: 68, reporter: "user2", assignee: "analyst2", status: "UNDER_INVESTIGATION", note: "Sender domain registered two days ago. Blocking it at the mail gateway." },
  { title: "Customer export found in a public storage bucket", type: "DATA_BREACH", severity: "HIGH", riskScore: 74, reporter: "user", assignee: "analyst", status: "RESOLVED" },
  { title: "Adware installed on the reception laptop", type: "MALWARE", severity: "MEDIUM", riskScore: 38, reporter: "user2" },
  { title: "Repeated failed logins on the VPN gateway", type: "UNAUTHORIZED_ACCESS", severity: "MEDIUM", riskScore: 52, reporter: "user", assignee: "admin", status: "UNDER_INVESTIGATION" },
  { title: "Caller asked a colleague for their badge number", type: "SOCIAL_ENGINEERING", severity: "LOW", riskScore: 18, reporter: "user2" },
  { title: "Public website unreachable during a traffic flood", type: "DDOS", severity: "CRITICAL", riskScore: 88, reporter: "user" },
  { title: "USB drive found in the car park", type: "OTHER", severity: "LOW", riskScore: 12, reporter: "user2", assignee: "analyst2", status: "CLOSED" },
  { title: "Trojan flagged on an engineering workstation", type: "MALWARE", severity: "HIGH", riskScore: 63, reporter: "user", status: "TRIAGED" },
  { title: "Credential harvesting link in the shared mailbox", type: "PHISHING", severity: "MEDIUM", riskScore: 45, reporter: "user2" },
];

const created: number[] = [];
let featured = 0;

test.beforeAll(async ({ playwright }) => {
  const request = await playwright.request.newContext();
  const api = new Api(request);
  // Start from an empty board so the images show only the seeded incidents.
  for (const existing of await api.list("admin")) await api.remove("admin", existing.id);
  for (const seed of SEEDS) {
    const incident = await api.createIncident(seed.reporter, seed);
    created.push(incident.id);
    if (seed.assignee) await api.assign("admin", incident.id, seed.assignee);
    if (seed.note && seed.assignee) await api.addNote(seed.assignee === "admin" ? "admin" : seed.assignee, incident.id, seed.note);
    if (seed.status === "RESOLVED" || seed.status === "CLOSED") await api.setStatus("admin", incident.id, "RESOLVED");
    if (seed.status && seed.status !== "UNDER_INVESTIGATION" && seed.status !== "RESOLVED") await api.setStatus("admin", incident.id, seed.status);
    if (seed.title.startsWith("Ransomware")) {
      featured = incident.id;
      await api.uploadEvidence("user", incident.id, "ransom-note.txt", "Your files have been encrypted.\n");
    }
  }
  await request.dispose();
});

test.afterAll(async ({ playwright }) => {
  const request = await playwright.request.newContext();
  const api = new Api(request);
  for (const id of created) await api.remove("admin", id);
  await request.dispose();
});

async function open(browser: Browser, theme: "light" | "dark", viewport: { width: number; height: number }) {
  const context = await browser.newContext({ viewport, colorScheme: theme });
  await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
  return { context, page: await context.newPage() };
}

async function capture(page: Page, file: string) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800); // chart entrance animation
  // The sidebar is as tall as the viewport, so grow the viewport to the page height first.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: page.viewportSize()!.width, height: Math.min(height, 2600) });
  await page.waitForLoadState("networkidle");
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
}

async function shoot(
  browser: Browser,
  options: { file: string; theme: "light" | "dark"; account?: AccountKey; path: string; viewport?: { width: number; height: number }; prepare?: (page: Page) => Promise<void> },
) {
  const { context, page } = await open(browser, options.theme, options.viewport ?? DESKTOP);
  if (options.account) await loginAs(page, options.account);
  await page.goto(options.path);
  await options.prepare?.(page);
  await capture(page, options.file);
  await context.close();
}

test("login", async ({ browser }) => {
  await shoot(browser, { file: "login-dark.png", theme: "dark", path: "/login" });
  await shoot(browser, { file: "login-light.png", theme: "light", path: "/login" });
});

test("reporter portal", async ({ browser }) => {
  await shoot(browser, { file: "portal-overview.png", theme: "dark", account: "user", path: "/portal" });
  await shoot(browser, {
    file: "report-wizard.png",
    theme: "dark",
    account: "user",
    path: "/portal/report",
    prepare: async (page) => {
      await page.getByRole("radio", { name: /Phishing/ }).check({ force: true });
    },
  });
});

test("staff views", async ({ browser }) => {
  await shoot(browser, { file: "dashboard-dark.png", theme: "dark", account: "analyst", path: "/dashboard" });
  await shoot(browser, { file: "dashboard-light.png", theme: "light", account: "analyst", path: "/dashboard" });
  await shoot(browser, { file: "incident-detail.png", theme: "dark", account: "admin", path: `/incidents/${featured}` });
  await shoot(browser, { file: "team.png", theme: "dark", account: "analyst", path: "/team" });
  await shoot(browser, { file: "dashboard-mobile.png", theme: "dark", account: "analyst", path: "/dashboard", viewport: MOBILE });
});

test("admin views", async ({ browser }) => {
  await shoot(browser, { file: "command-center.png", theme: "dark", account: "admin", path: "/admin/command-center" });
  await shoot(browser, { file: "triage-board.png", theme: "dark", account: "admin", path: "/admin/triage" });
  await shoot(browser, { file: "users.png", theme: "dark", account: "admin", path: "/admin/users" });
});
