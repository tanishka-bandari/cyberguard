"use client";

import { useEffect, useRef } from "react";

// Dark-theme backdrop drawn on a canvas: drifting fog, floating ghosts that shy away from the
// cursor, rising wisps, blinking eyes in the dark, a faint lantern at the pointer and a vignette.
// Skipped in the light theme and while the tab is hidden; a single still frame with reduced motion.

type Ghost = { x: number; y: number; scale: number; speed: number; phase: number; alpha: number; ox: number; oy: number };
type Wisp = { x: number; y: number; r: number; speed: number; phase: number };
type Eyes = { x: number; y: number; gap: number; age: number; life: number };

const FOG = [
  { rgb: "63,212,156", x: 0.2, y: 0.3, r: 0.5, speed: 0.07 },
  { rgb: "110,80,210", x: 0.75, y: 0.25, r: 0.45, speed: 0.05 },
  { rgb: "30,130,170", x: 0.5, y: 0.8, r: 0.55, speed: 0.06 },
  { rgb: "63,212,156", x: 0.9, y: 0.75, r: 0.4, speed: 0.08 },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeGhost(w: number, h: number): Ghost {
  return {
    x: rand(0, w),
    y: rand(h * 0.15, h * 0.85),
    scale: rand(0.9, 1.7),
    speed: rand(6, 16) * (Math.random() < 0.5 ? -1 : 1),
    phase: rand(0, Math.PI * 2),
    alpha: rand(0.12, 0.22),
    ox: 0,
    oy: 0,
  };
}

function drawGhost(ctx: CanvasRenderingContext2D, g: Ghost, t: number) {
  const sway = Math.sin(t * 2 + g.phase) * 4;
  const pulse = 0.65 + 0.35 * Math.sin(t * 0.6 + g.phase);
  ctx.save();
  ctx.translate(g.x + g.ox, g.y + g.oy + Math.sin(t * 0.8 + g.phase) * 14);
  ctx.scale(g.scale * (g.speed < 0 ? -1 : 1), g.scale);
  ctx.globalAlpha = g.alpha * pulse;

  ctx.beginPath();
  ctx.arc(0, 0, 30, Math.PI, 0);
  ctx.lineTo(30, 50);
  const xs = [30, 10, -10, -30];
  for (let i = 0; i < 3; i++) {
    ctx.quadraticCurveTo((xs[i] + xs[i + 1]) / 2 + sway, i % 2 === 0 ? 64 : 38, xs[i + 1], 50);
  }
  ctx.closePath();
  const body = ctx.createLinearGradient(0, -30, 0, 60);
  body.addColorStop(0, "rgba(205,255,235,1)");
  body.addColorStop(1, "rgba(205,255,235,0.08)");
  ctx.fillStyle = body;
  ctx.fill();

  ctx.fillStyle = "rgba(8,14,16,0.9)";
  ctx.beginPath();
  ctx.ellipse(-10, -6, 4.5, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -6, 4.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 14, 5, 8 + Math.sin(t * 1.5 + g.phase) * 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEyes(ctx: CanvasRenderingContext2D, e: Eyes) {
  const fade = Math.sin((Math.PI * e.age) / e.life);
  const blink = Math.abs(Math.sin(e.age * 1.3)) < 0.08 ? 0.1 : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, fade) * 0.85;
  for (const dx of [-e.gap, e.gap]) {
    const glow = ctx.createRadialGradient(e.x + dx, e.y, 0, e.x + dx, e.y, 16);
    glow.addColorStop(0, "rgba(255,70,70,0.55)");
    glow.addColorStop(1, "rgba(255,70,70,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(e.x + dx - 16, e.y - 16, 32, 32);
    ctx.fillStyle = "rgba(255,110,90,1)";
    ctx.beginPath();
    ctx.ellipse(e.x + dx, e.y, 3.2, 2 * blink + 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function HauntedBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -999, y: -999, lx: -999, ly: -999 };
    let w = 0;
    let h = 0;
    let ghosts: Ghost[] = [];
    let wisps: Wisp[] = [];
    let eyes: Eyes[] = [];
    let nextEyes = 2;
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 640;
      ghosts = Array.from({ length: small ? 3 : 6 }, () => makeGhost(w, h));
      wisps = Array.from({ length: small ? 18 : 40 }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(1, 2.6),
        speed: rand(8, 26),
        phase: rand(0, Math.PI * 2),
      }));
      if (still) frame(0);
    };

    const frame = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, w, h);
      if (!document.documentElement.classList.contains("dark")) return;

      for (const f of FOG) {
        const cx = (f.x + Math.sin(t * f.speed) * 0.08) * w;
        const cy = (f.y + Math.cos(t * f.speed * 1.3) * 0.08) * h;
        const r = f.r * Math.max(w, h);
        const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        fog.addColorStop(0, `rgba(${f.rgb},0.11)`);
        fog.addColorStop(1, `rgba(${f.rgb},0)`);
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, w, h);
      }

      pointer.lx += (pointer.x - pointer.lx) * 0.08;
      pointer.ly += (pointer.y - pointer.ly) * 0.08;
      const lantern = ctx.createRadialGradient(pointer.lx, pointer.ly, 0, pointer.lx, pointer.ly, 240);
      lantern.addColorStop(0, "rgba(63,212,156,0.10)");
      lantern.addColorStop(1, "rgba(63,212,156,0)");
      ctx.fillStyle = lantern;
      ctx.fillRect(0, 0, w, h);

      for (const s of wisps) {
        s.y -= s.speed * dt;
        if (s.y < -10) {
          s.y = h + 10;
          s.x = rand(0, w);
        }
        const flicker = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.9 + s.phase));
        const x = s.x + Math.sin(t * 0.6 + s.phase) * 18;
        ctx.fillStyle = `rgba(150,255,215,${0.12 * flicker})`;
        ctx.beginPath();
        ctx.arc(x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(210,255,235,${0.6 * flicker})`;
        ctx.beginPath();
        ctx.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const g of ghosts) {
        g.x += g.speed * dt;
        if (g.x > w + 80) g.x = -80;
        if (g.x < -80) g.x = w + 80;
        const dx = g.x - pointer.x;
        const dy = g.y - pointer.y;
        const d = Math.hypot(dx, dy);
        const push = d < 200 ? (1 - d / 200) * 90 : 0;
        g.ox += ((d > 0 ? (dx / d) * push : 0) - g.ox) * 0.05;
        g.oy += ((d > 0 ? (dy / d) * push : 0) - g.oy) * 0.05;
        drawGhost(ctx, g, t);
      }

      nextEyes -= dt;
      if (nextEyes <= 0 && eyes.length < 2) {
        eyes.push({ x: rand(w * 0.05, w * 0.95), y: rand(h * 0.1, h * 0.9), gap: rand(8, 14), age: 0, life: rand(4, 7) });
        nextEyes = rand(3, 7);
      }
      for (const e of eyes) {
        e.age += dt;
        drawEyes(ctx, e);
      }
      eyes = eyes.filter((e) => e.age < e.life);

      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = (now: number) => {
      frame(Math.min((now - last) / 1000, 0.05));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (still || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onPointer = (e: PointerEvent) => {
      if (pointer.x === -999) {
        pointer.lx = e.clientX;
        pointer.ly = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
