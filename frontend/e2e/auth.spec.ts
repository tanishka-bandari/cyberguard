import { ACCOUNTS, loginAs, PASSWORD, signInAs, signOut, unique } from "./helpers";
import { expect, test } from "./fixtures";

test.describe("sign in", () => {
  for (const account of ["user", "analyst", "admin"] as const) {
    test(`${account} lands on ${ACCOUNTS[account].home}`, async ({ page }) => {
      await loginAs(page, account);
      await expect(page.getByRole("main")).toBeVisible();
    });
  }

  test("a wrong password shows an error and stays on the login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ACCOUNTS.user.email);
    await page.getByLabel("Password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Invalid email or password.");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("empty fields are validated before any request", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Enter your password.")).toBeVisible();
  });
});

test.describe("registration", () => {
  test("a new reporter registers and lands on the portal", async ({ page }) => {
    const email = `e2e-${Date.now()}@cyberguard.test`;
    await page.goto("/register");
    await page.getByLabel("Full name").fill("New Reporter");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("mismatching passwords are rejected", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Someone");
    await page.getByLabel("Email").fill(`${unique("mismatch").replaceAll(" ", "-")}@cyberguard.test`);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill("different-password");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });

  test("an email that is already registered shows the server message", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Duplicate");
    await page.getByLabel("Email").fill(ACCOUNTS.user.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("form").getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("session", () => {
  test("signing out clears the session", async ({ page }) => {
    await loginAs(page, "user");
    await signOut(page);
    expect(await page.evaluate(() => localStorage.getItem("cyberguard.session"))).toBeNull();
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login\?next=%2Fportal$/);
  });

  test("a deep link while signed out goes to login and back after signing in", async ({ page }) => {
    await page.goto("/incidents?q=phish");
    await expect(page).toHaveURL(/\/login\?next=%2Fincidents%3Fq%3Dphish$/);
    await page.getByLabel("Email").fill(ACCOUNTS.analyst.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/incidents\?q=phish$/);
    await expect(page.getByRole("heading", { name: "Incidents", level: 1 })).toBeVisible();
  });

  test("an open redirect in next is ignored", async ({ page }) => {
    await signInAs(page, "user", "//evil.example.com");
    await expect(page).toHaveURL(/\/portal$/);
  });

  test("a reporter opening an admin page is sent back to the portal", async ({ page }) => {
    await loginAs(page, "user");
    await page.goto("/admin/triage");
    await expect(page).toHaveURL(/\/portal$/);
  });

  test("an analyst opening the users page is sent to the dashboard", async ({ page }) => {
    await loginAs(page, "analyst");
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("a token with a forged signature sends the user back to login", async ({ page }) => {
    await loginAs(page, "admin");
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem("cyberguard.session")!);
      session.token = `${session.token.slice(0, -4)}AAAA`;
      localStorage.setItem("cyberguard.session", JSON.stringify(session));
    });
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/login/);
    expect(await page.evaluate(() => localStorage.getItem("cyberguard.session"))).toBeNull();
  });

  test("a garbage token is treated as signed out", async ({ page }) => {
    await loginAs(page, "user");
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem("cyberguard.session")!);
      session.token = "not-a-jwt";
      localStorage.setItem("cyberguard.session", JSON.stringify(session));
    });
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login\?next=%2Fportal$/);
  });
});
