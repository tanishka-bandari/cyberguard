// `SCREENSHOTS=1 playwright test` does not work in cmd.exe or PowerShell, so npm runs this instead.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
const { status } = spawnSync(process.execPath, [cli, "test", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, SCREENSHOTS: "1" },
});
process.exit(status ?? 1);
