import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const PASSWORD = "Passw0rd!e2e";
export const API_URL = "http://localhost:8081/api";

// Accounts created by the backend's e2e profile (DemoDataSeeder).
export const ACCOUNTS = {
  admin: { email: "admin@cyberguard.test", name: "Admin User", home: "/admin/command-center" },
  analyst: { email: "analyst@cyberguard.test", name: "Analyst One", home: "/dashboard" },
  analyst2: { email: "analyst2@cyberguard.test", name: "Analyst Two", home: "/dashboard" },
  user: { email: "user@cyberguard.test", name: "Reporter One", home: "/portal" },
  user2: { email: "user2@cyberguard.test", name: "Reporter Two", home: "/portal" },
} as const;

export type AccountKey = keyof typeof ACCOUNTS;

export const unique = (prefix: string) => `E2E ${prefix} ${Date.now()}`;

export async function signInAs(page: Page, account: AccountKey, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByLabel("Email").fill(ACCOUNTS[account].email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

// Signs in through the form and waits for the account's home page.
export async function loginAs(page: Page, account: AccountKey) {
  await signInAs(page, account);
  await expect(page).toHaveURL(new RegExp(`${ACCOUNTS[account].home}$`));
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export interface SeedIncident {
  title: string;
  description?: string;
  type?: string;
  severity?: string;
  riskScore?: number;
}

interface ApiIncident {
  id: number;
  title: string;
  status: string;
}

// Direct backend calls for test setup. They skip the UI so a spec only drives the screen it is about.
export class Api {
  private tokens = new Map<AccountKey, { token: string; id: number }>();

  constructor(private readonly request: APIRequestContext) {}

  private async session(account: AccountKey) {
    const cached = this.tokens.get(account);
    if (cached) return cached;
    const res = await this.request.post(`${API_URL}/auth/login`, {
      data: { email: ACCOUNTS[account].email, password: PASSWORD },
    });
    expect(res.ok(), `login ${account}`).toBeTruthy();
    const body = (await res.json()) as { token: string; id: number };
    const session = { token: body.token, id: body.id };
    this.tokens.set(account, session);
    return session;
  }

  private async headers(account: AccountKey) {
    return { Authorization: `Bearer ${(await this.session(account)).token}` };
  }

  userId = async (account: AccountKey) => (await this.session(account)).id;

  async createIncident(account: AccountKey, incident: SeedIncident): Promise<ApiIncident> {
    const res = await this.request.post(`${API_URL}/incidents`, {
      headers: await this.headers(account),
      form: {
        title: incident.title,
        description: incident.description ?? "Created by the end-to-end suite.",
        type: incident.type ?? "OTHER",
        severity: incident.severity ?? "MEDIUM",
        riskScore: String(incident.riskScore ?? 40),
      },
    });
    expect(res.ok(), `create incident ${incident.title}`).toBeTruthy();
    return (await res.json()) as ApiIncident;
  }

  async setStatus(account: AccountKey, id: number, status: string) {
    const res = await this.request.put(`${API_URL}/incidents/${id}/status`, {
      headers: await this.headers(account),
      form: { status },
    });
    expect(res.ok(), `status ${status}`).toBeTruthy();
  }

  async assign(account: AccountKey, id: number, assignee: AccountKey) {
    const res = await this.request.put(`${API_URL}/incidents/${id}/assign`, {
      headers: await this.headers(account),
      form: { userId: String(await this.userId(assignee)) },
    });
    expect(res.ok(), `assign to ${assignee}`).toBeTruthy();
  }

  async addNote(account: AccountKey, id: number, content: string) {
    const res = await this.request.post(`${API_URL}/incidents/${id}/notes`, {
      headers: await this.headers(account),
      form: { content },
    });
    expect(res.ok(), "add note").toBeTruthy();
  }

  async uploadEvidence(account: AccountKey, id: number, name: string, contents: string) {
    const res = await this.request.post(`${API_URL}/incidents/${id}/evidence`, {
      headers: await this.headers(account),
      multipart: { file: { name, mimeType: "text/plain", buffer: Buffer.from(contents) } },
    });
    expect(res.ok(), "upload evidence").toBeTruthy();
  }

  async setRole(account: AccountKey, target: AccountKey, role: string) {
    const res = await this.request.put(`${API_URL}/users/${await this.userId(target)}/role`, {
      headers: await this.headers(account),
      params: { role },
    });
    expect(res.ok(), `role ${role}`).toBeTruthy();
  }

  async remove(account: AccountKey, id: number) {
    await this.request.delete(`${API_URL}/incidents/${id}`, { headers: await this.headers(account) });
  }

  async list(account: AccountKey): Promise<ApiIncident[]> {
    const res = await this.request.get(`${API_URL}/incidents`, { headers: await this.headers(account) });
    expect(res.ok()).toBeTruthy();
    return (await res.json()) as ApiIncident[];
  }
}

// A Card is a <section> whose <h2> is its title; sections without a name have no role of their own.
export function card(page: Page, title: string | RegExp) {
  return page.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: title }) });
}
