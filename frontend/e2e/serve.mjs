// Builds the app and serves it in this one process. Playwright starts this through a shell;
// with `npm run build && npx next start` the shell leaves orphaned children on Windows and the test run never exits.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const port = process.env.E2E_FRONTEND_PORT ?? "3100";
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");

execFileSync(process.execPath, [nextBin, "build"], { stdio: "inherit" });
process.argv = [process.execPath, nextBin, "start", "-p", port];
await import(pathToFileURL(nextBin).href);
