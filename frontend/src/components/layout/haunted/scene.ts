// A haunted cyber-security night scene drawn on a 2D canvas: a skull rising over a graveyard of
// dead servers, binary rain, a network where nodes get infected, glitching terminal messages,
// intrusion alerts and a lantern that follows the pointer.
// createScene() builds the static skyline once and returns a frame() that draws everything.

export type Pointer = { x: number; y: number; lx: number; ly: number };

const TAU = Math.PI * 2;
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

// A soft, flattened blob: used for fog banks and smoke.
function blob(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, rgb: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, height / width);
  glow(ctx, 0, 0, width / 2, rgb, alpha);
  ctx.restore();
}

// Text with a red/cyan split when it glitches.
function glitchText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, rgb: string, alpha: number, glitch: boolean) {
  if (glitch) {
    ctx.fillStyle = `rgba(255,40,80,${alpha * 0.7})`;
    ctx.fillText(text, x - 2, y);
    ctx.fillStyle = `rgba(40,220,255,${alpha * 0.7})`;
    ctx.fillText(text, x + 2, y);
  }
  ctx.fillStyle = `rgba(${rgb},${alpha})`;
  ctx.fillText(text, x, y);
}

// ---- static skyline: server towers, antenna masts, tombstones ----

type Led = { x: number; y: number; p: number; speed: number; rgb: string };
type Mast = { x: number; y: number };

const EPITAPHS = ["404", "0DAY", "WEP", "FTP", "RIP", "ROOT", "FLASH", "SSL2"];

function buildSkyline(w: number, h: number, dpr: number, horizon: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const c = canvas.getContext("2d")!;
  c.scale(dpr, dpr);
  const rnd = seeded(13);
  const ground = (x: number) => horizon + Math.sin(x * 0.006) * 14 + Math.sin(x * 0.017 + 1) * 6;
  const ink = "#020407";
  c.fillStyle = ink;
  c.strokeStyle = ink;
  c.lineCap = "round";

  // dead server towers with broken tops
  const leds: Led[] = [];
  for (let x = -10; x < w; ) {
    const tw = 40 + rnd() * 50;
    const th = h * (0.06 + rnd() * 0.2);
    const top = ground(x) - th;
    c.beginPath();
    c.moveTo(x, ground(x) + 10);
    c.lineTo(x, top);
    c.lineTo(x + tw * (0.3 + rnd() * 0.3), top - rnd() * 10);
    c.lineTo(x + tw, top + rnd() * 14);
    c.lineTo(x + tw, ground(x) + 10);
    c.closePath();
    c.fill();
    const count = Math.floor((tw * th) / 1500);
    for (let i = 0; i < count; i++) {
      leds.push({
        x: x + 4 + rnd() * (tw - 10),
        y: top + 18 + rnd() * Math.max(4, th - 32),
        p: rnd() * TAU,
        speed: 2 + rnd() * 6,
        rgb: rnd() < 0.55 ? "80,255,150" : rnd() < 0.6 ? "255,70,60" : "255,190,80",
      });
    }
    x += tw + rnd() * 30 + (rnd() < 0.3 ? 60 + rnd() * 120 : 0);
  }

  c.beginPath(); // the hill in front of the towers
  c.moveTo(0, h);
  for (let x = 0; x <= w + 20; x += 20) c.lineTo(x, ground(x));
  c.lineTo(w, h);
  c.closePath();
  c.fill();

  // antenna masts
  const masts: Mast[] = [];
  for (const f of [0.06, 0.45, 0.72, 0.95]) {
    const x = w * f;
    const top = ground(x) - h * (0.2 + rnd() * 0.12);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, ground(x) + 6);
    c.lineTo(x, top);
    c.stroke();
    c.lineWidth = 1.5;
    for (let i = 1; i <= 3; i++) {
      const y = top + i * ((ground(x) - top) / 5);
      const half = 14 - i * 2.5 + 6;
      c.beginPath();
      c.moveTo(x - half, y);
      c.lineTo(x + half, y);
      c.stroke();
    }
    masts.push({ x, y: top });
  }

  // tombstones with their epitaphs
  c.font = "bold 9px monospace";
  c.textAlign = "center";
  for (let i = 0; i < 16; i++) {
    const x = rnd() * w;
    const y = ground(x) + 6 + rnd() * 26;
    const wd = 26 + rnd() * 10;
    const ht = 32 + rnd() * 18;
    c.save();
    c.translate(x, y);
    c.rotate((rnd() - 0.5) * 0.25);
    c.fillStyle = ink;
    c.beginPath();
    c.moveTo(-wd / 2, 0);
    c.lineTo(-wd / 2, -ht + wd / 2);
    c.arc(0, -ht + wd / 2, wd / 2, Math.PI, 0);
    c.lineTo(wd / 2, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(120,255,200,0.3)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(120,255,200,0.45)";
    c.fillText(EPITAPHS[Math.floor(rnd() * EPITAPHS.length)], 0, -ht * 0.45);
    c.restore();
  }
  return { canvas, leds, masts };
}

// ---- animated pieces ----

function drawSkull(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number) {
  glow(ctx, x, y, r * 6, "120,255,180", 0.2 + Math.sin(t * 0.5) * 0.05);
  ctx.save();
  ctx.translate(x, y);
  const bone = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 0, 0, 0, r * 1.2);
  bone.addColorStop(0, "#eef7de");
  bone.addColorStop(1, "#9db88c");
  ctx.fillStyle = bone;
  ctx.beginPath();
  ctx.arc(0, -r * 0.15, r * 0.9, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-r * 0.5, r * 0.45, r, r * 0.6, r * 0.15);
  ctx.fill();

  ctx.fillStyle = "#04080a";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * r * 0.36, -r * 0.05, r * 0.23, r * 0.27, 0, 0, TAU);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0, r * 0.18);
  ctx.lineTo(-r * 0.1, r * 0.42);
  ctx.lineTo(r * 0.1, r * 0.42);
  ctx.fill();
  ctx.strokeStyle = "rgba(4,8,10,0.7)";
  ctx.lineWidth = Math.max(1, r * 0.04);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.18, r * 0.62);
    ctx.lineTo(i * r * 0.18, r * 1.02);
    ctx.stroke();
  }
  const ember = 0.6 + 0.4 * Math.abs(Math.sin(t * 2.3) * Math.sin(t * 0.7));
  for (const side of [-1, 1]) {
    glow(ctx, side * r * 0.36, -r * 0.05, r * 0.4, "255,60,50", 0.55 * ember);
    glow(ctx, side * r * 0.36, -r * 0.05, r * 0.09, "255,200,180", ember);
  }
  ctx.restore();
}

const SNIPPETS = ["ACCESS DENIED", "0xDEADBEEF", "root@ghost:~#", "SQL INJECTION", "RANSOMWARE", "PHISHING", "ZERO-DAY", "BREACH DETECTED", "CVE-2026-0000", "PASSWORD: ********", "SYSTEM HAUNTED", "trojan.exe", "DDoS", "rm -rf /"];
const RAIN = "0101010101ABCDEF{}<>/;";
const RAIN_STEP = 16;
const RAIN_TRAIL = 9;
const RAIN_STYLES = Array.from({ length: RAIN_TRAIL }, (_, i) => `rgba(63,212,156,${0.3 * (1 - i / RAIN_TRAIL)})`);

export function createScene(w: number, h: number, dpr: number) {
  const small = w < 640;
  const horizon = h * 0.86;
  const { canvas: skyline, leds, masts } = buildSkyline(w, h, dpr, horizon);

  const stars = Array.from({ length: small ? 40 : 90 }, () => ({ x: rand(0, w), y: rand(0, horizon * 0.7), r: rand(0.4, 1.3), p: rand(0, TAU) }));
  const skull = { x: w * (small ? 0.72 : 0.8), y: h * 0.26, r: clamp(Math.min(w, h) * 0.085, 26, 80) };
  const smoke = Array.from({ length: 3 }, () => ({ x: rand(0, w), y: skull.y + rand(-skull.r, skull.r), w: rand(240, 440), speed: rand(8, 18) }));
  const rain = Array.from({ length: Math.floor(w / (small ? 34 : 26)) }, (_, i) => ({
    x: i * (small ? 34 : 26) + rand(0, 8),
    y: rand(-h, h),
    speed: rand(60, 170),
    off: Math.floor(rand(0, RAIN.length)),
  }));
  const nodes = Array.from({ length: small ? 12 : 24 }, () => ({
    x: rand(0, w),
    y: rand(0, horizon * 0.9),
    vx: rand(-14, 14),
    vy: rand(-10, 10),
    sick: Math.random() < 0.2 ? rand(0, 8) : 0,
    flip: rand(6, 14),
  }));
  const messages = Array.from({ length: small ? 3 : 6 }, () => ({ text: pick(SNIPPETS), x: rand(0, w * 0.8), y: rand(h * 0.1, h * 0.8), age: rand(0, 6), life: rand(6, 10), phase: rand(0, TAU) }));
  const groundFog = Array.from({ length: small ? 6 : 12 }, () => ({
    x: rand(0, w),
    y: rand(horizon - 30, h * 0.97),
    w: rand(300, 560),
    h: rand(70, 130),
    speed: rand(10, 30) * (Math.random() < 0.5 ? -1 : 1),
    a: rand(0.1, 0.18),
  }));
  let eyes: { x: number; y: number; gap: number; age: number; life: number; rgb: string }[] = [];
  let nextEyes = 1.5;
  const alert = { age: 99, wait: rand(6, 10) };
  let skyGradient: CanvasGradient | undefined;
  let t = 0;

  function frame(ctx: CanvasRenderingContext2D, dt: number, pointer: Pointer) {
    t += dt;

    if (!skyGradient) {
      skyGradient = ctx.createLinearGradient(0, 0, 0, horizon);
      skyGradient.addColorStop(0, "#04060d");
      skyGradient.addColorStop(0.6, "#09151c");
      skyGradient.addColorStop(1, "#1a4034");
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      ctx.fillStyle = `rgba(220,255,240,${0.25 + 0.5 * Math.abs(Math.sin(t * 0.8 + s.p))})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    drawSkull(ctx, skull.x, skull.y, skull.r, t);
    for (const c of smoke) {
      c.x += c.speed * dt;
      if (c.x > w + c.w) c.x = -c.w;
      blob(ctx, c.x, c.y, c.w, c.w * 0.3, "3,6,10", 0.7);
    }

    // binary rain
    ctx.font = `${RAIN_STEP - 2}px monospace`;
    for (const col of rain) {
      col.y += col.speed * dt;
      if (col.y - RAIN_TRAIL * RAIN_STEP > h) col.y = rand(-200, 0);
      for (let i = 0; i < RAIN_TRAIL; i++) {
        const y = col.y - i * RAIN_STEP;
        if (y < 0 || y > h) continue;
        const index = col.off + Math.floor(y / RAIN_STEP) + (i === 0 ? Math.floor(t * 10) : 0);
        ctx.fillStyle = i === 0 ? "rgba(210,255,230,0.65)" : RAIN_STYLES[i];
        ctx.fillText(RAIN[index % RAIN.length], col.x, y);
      }
    }

    // intrusion alert: schedule, then everything the alert touches reads its level
    alert.wait -= dt;
    alert.age += dt;
    if (alert.wait <= 0) {
      alert.wait = rand(12, 20);
      alert.age = 0;
    }
    const alertLevel = alert.age < 3.2 ? Math.sin((Math.PI * alert.age) / 3.2) : 0;
    const pulse = alertLevel * (0.5 + 0.5 * Math.sin(alert.age * 4.2));

    // network graph: nodes drift, link up, and some are infected (red)
    ctx.lineWidth = 1;
    for (const n of nodes) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > horizon * 0.9) n.vy *= -1;
      n.flip -= dt;
      if (n.flip <= 0) {
        n.flip = rand(6, 14);
        n.sick = n.sick > 0 ? 0 : Math.random() < 0.3 ? 1 : 0;
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const aSick = a.sick > 0 || alertLevel > 0.2;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 170) continue;
        const bad = aSick || b.sick > 0;
        ctx.strokeStyle = `rgba(${bad ? "255,70,70" : "63,212,156"},${(1 - d / 170) * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (pd < 200) {
        ctx.strokeStyle = `rgba(200,255,160,${(1 - pd / 200) * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
      const beat = aSick ? 0.6 + 0.4 * Math.sin(t * 6 + i) : 1;
      glow(ctx, a.x, a.y, 12, aSick ? "255,70,70" : "63,212,156", 0.45 * beat);
      ctx.fillStyle = aSick ? "rgba(255,150,140,0.95)" : "rgba(190,255,225,0.9)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, 2.2, 0, TAU);
      ctx.fill();
    }

    // drifting terminal messages
    ctx.font = "13px monospace";
    ctx.textAlign = "left";
    for (const m of messages) {
      m.age += dt;
      m.y -= 6 * dt;
      if (m.age > m.life) {
        m.text = pick(SNIPPETS);
        m.x = rand(0, w * 0.8);
        m.y = rand(h * 0.2, h * 0.85);
        m.age = 0;
        m.life = rand(6, 10);
      }
      const a = Math.sin((Math.PI * m.age) / m.life) * 0.55;
      glitchText(ctx, m.text, m.x, m.y, "120,255,190", a, Math.sin(t * 3 + m.phase * 5) > 0.9);
    }

    // sweeping scan line
    const scanY = (t * 90) % (h + 240) - 120;
    const scan = ctx.createLinearGradient(0, scanY - 60, 0, scanY);
    scan.addColorStop(0, "rgba(63,212,156,0)");
    scan.addColorStop(1, "rgba(63,212,156,0.07)");
    ctx.fillStyle = scan;
    ctx.fillRect(0, scanY - 60, w, 60);

    ctx.drawImage(skyline, 0, 0, w, h);

    for (const led of leds) {
      if (Math.sin(t * led.speed + led.p) < -0.2) continue;
      ctx.fillStyle = `rgba(${led.rgb},0.85)`;
      ctx.fillRect(led.x, led.y, 2.5, 2.5);
    }
    masts.forEach((m, i) => {
      const on = Math.sin(t * 2.4 + i * 1.7) > 0.5;
      glow(ctx, m.x, m.y, on ? 22 : 8, "255,50,50", on ? 0.8 : 0.2);
    });

    // eyes in the dark
    nextEyes -= dt;
    if (nextEyes <= 0 && eyes.length < 4) {
      eyes.push({ x: rand(w * 0.04, w * 0.96), y: rand(h * 0.1, h * 0.92), gap: rand(9, 16), age: 0, life: rand(4, 7), rgb: Math.random() < 0.7 ? "255,70,60" : "190,255,80" });
      nextEyes = rand(2, 5);
    }
    for (const e of eyes) {
      e.age += dt;
      const a = Math.max(0, Math.sin((Math.PI * e.age) / e.life));
      const open = Math.abs(Math.sin(e.age * 1.3)) < 0.08 ? 0.1 : 1;
      for (const dx of [-e.gap, e.gap]) {
        glow(ctx, e.x + dx, e.y, 22, e.rgb, 0.6 * a);
        ctx.fillStyle = `rgba(${e.rgb},${a})`;
        ctx.beginPath();
        ctx.ellipse(e.x + dx, e.y, 4, 2.4 * open + 0.3, 0, 0, TAU);
        ctx.fill();
      }
    }
    eyes = eyes.filter((e) => e.age < e.life);

    for (const f of groundFog) {
      f.x += f.speed * dt;
      if (f.x > w + f.w) f.x = -f.w;
      if (f.x < -f.w) f.x = w + f.w;
      blob(ctx, f.x, f.y, f.w, f.h, "170,255,225", f.a);
    }

    // red alert wash and banner
    if (alertLevel > 0.01) {
      const edge = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
      edge.addColorStop(0, "rgba(255,30,50,0)");
      edge.addColorStop(1, `rgba(255,30,50,${0.28 * pulse})`);
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `bold ${small ? 16 : 24}px monospace`;
      ctx.textAlign = "center";
      glitchText(ctx, "⚠ INTRUSION DETECTED", w / 2, h * 0.13, "255,90,100", alertLevel * 0.8, Math.sin(t * 17) > 0.7);
      ctx.textAlign = "left";
    }

    // lantern at the pointer
    const flicker = 0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 5.3);
    glow(ctx, pointer.lx, pointer.ly, 260 * flicker, "200,255,160", 0.13);

    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  return { frame };
}
