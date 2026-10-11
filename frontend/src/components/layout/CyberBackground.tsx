// Decorative dark-theme backdrop: faint grid, soft glow and slowly drifting binary digits.
// Pure CSS (see globals.css), hidden in the light theme and when the user prefers reduced motion.
const BINARY = "01001011010010100101100101011010010110100101011010010110100101".repeat(200);

export function CyberBackground() {
  return (
    <div aria-hidden className="cyber-bg pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden dark:block">
      <div className="cyber-bg-grid absolute inset-0" />
      <div className="cyber-bg-glow absolute inset-0" />
      <p className="cyber-bg-digits absolute -inset-x-[5%] -inset-y-[10%] break-all font-mono text-[11px] leading-[17px] tracking-[6px]">
        {BINARY}
      </p>
    </div>
  );
}
