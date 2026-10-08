// Starts the Spring Boot e2e backend. Playwright runs this instead of mvnw directly: on Windows the
// wrapper script leaves the JVM orphaned, and an orphan holding Playwright's pipes makes the run hang
// after the last test. Here the child gets no pipes and is stopped explicitly on exit.
import { execFileSync, spawn } from "node:child_process";
import { join, resolve } from "node:path";

const isWindows = process.platform === "win32";
const port = process.env.SERVER_PORT ?? "8081";
const backend = resolve("..", "backend");
const args = ["spring-boot:run", "-Dspring-boot.run.profiles=e2e"];
const child = spawn(isWindows ? `"${join(backend, "mvnw.cmd")}"` : "./mvnw", args, {
  cwd: backend,
  stdio: "ignore",
  shell: isWindows,
  detached: !isWindows,
});

const system32 = join(process.env.SystemRoot ?? "C:/Windows", "System32");

function stopBackend() {
  try {
    if (isWindows) {
      execFileSync(join(system32, "taskkill.exe"), ["/T", "/F", "/PID", String(child.pid)], { stdio: "ignore" });
      // The JVM can outlive the wrapper chain, so also stop whatever still listens on the port.
      const script = `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`;
      execFileSync(join(system32, "WindowsPowerShell/v1.0/powershell.exe"), ["-NoProfile", "-Command", script], {
        stdio: "ignore",
      });
    } else {
      process.kill(-child.pid);
    }
  } catch {
    // Already gone.
  }
}

process.on("exit", stopBackend);
for (const signal of ["SIGINT", "SIGTERM", "SIGBREAK"]) process.on(signal, () => process.exit(0));
child.on("exit", (code) => process.exit(code ?? 1));
setInterval(() => {}, 1 << 30);
