// A watching pair of cyber eyes in falling binary rain, drawn on a 2D canvas.
// The eyes (circuit-board lids, rotating iris rings, golden nodes, data pulses) follow the pointer
// and blink; layered binary rain falls in front of a faint perspective grid floor.
// createScene() builds the static lid artwork once and returns a frame() that draws everything.

export type Pointer = { x: number; y: number; lx: number; ly: number };

type V = [number, number];

const TAU = Math.PI * 2;
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

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

const bez = (a: V, b: V, c: V, t: number): V => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
};

// ---- eye geometry, in "left eye" coordinates with the iris at the origin; the right eye is mirrored ----

function lids(R: number) {
  return {
    outer: [-3.5 * R, -2.3 * R] as V,
    inner: [2.7 * R, 0.8 * R] as V,
    upper: [-0.6 * R, -2.1 * R] as V,
    lower: [-0.2 * R, 1.9 * R] as V,
  };
}

function eyePath(ctx: CanvasRenderingContext2D, R: number) {
  const l = lids(R);
  ctx.beginPath();
  ctx.moveTo(l.outer[0], l.outer[1]);
  ctx.quadraticCurveTo(l.upper[0], l.upper[1], l.inner[0], l.inner[1]);
  ctx.quadraticCurveTo(l.lower[0], l.lower[1], l.outer[0], l.outer[1]);
  ctx.closePath();
}

type Node = { x: number; y: number; p: number; speed: number };

// The static artwork around the eye: feather-like lid strokes, circuit traces and the lid outline.
function buildEyeLayer(R: number, dpr: number) {
  const ox = 5.6 * R;
  const oy = 3.5 * R;
  const width = ox + 3.8 * R;
  const height = oy + 3.4 * R;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  const c = canvas.getContext("2d")!;
  c.scale(dpr, dpr);
  c.translate(ox, oy);
  c.lineCap = "round";
  const rnd = seeded(21);
  const l = lids(R);

  // dark green mass of the upper lid
  const top: V[] = [];
  const shifted: V[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const p = bez(l.outer, l.upper, l.inner, t);
    top.push(p);
    shifted.push([p[0] - 0.3 * R * (1 - t), p[1] - 0.8 * R * (1 - t * 0.55)]);
  }
  c.beginPath();
  top.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  for (let i = shifted.length - 1; i >= 0; i--) c.lineTo(shifted[i][0], shifted[i][1]);
  c.closePath();
  c.fillStyle = "rgba(10,70,18,0.4)";
  c.fill();

  // feather strokes sweeping up and back from the upper lid
  for (let i = 0; i < 90; i++) {
    const t = rnd() * 0.92;
    const p = bez(l.outer, l.upper, l.inner, t);
    const a = -Math.PI * 0.74 + (rnd() - 0.5) * 0.95;
    const len = R * (0.8 + rnd() * 2.6) * (1.2 - t * 0.55);
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const bend = (rnd() - 0.5) * 0.9 * len;
    const mid: V = [p[0] + dx * len * 0.5 - dy * bend * 0.5, p[1] + dy * len * 0.5 + dx * bend * 0.5];
    const end: V = [p[0] + dx * len, p[1] + dy * len];
    c.strokeStyle = `rgba(${Math.floor(30 + rnd() * 70)},${Math.floor(190 + rnd() * 65)},${Math.floor(30 + rnd() * 60)},${0.2 + rnd() * 0.6})`;
    c.lineWidth = 0.5 + rnd() * 1.4;
    c.beginPath();
    c.moveTo(p[0], p[1]);
    c.quadraticCurveTo(mid[0], mid[1], end[0], end[1]);
    c.stroke();
    if (rnd() < 0.5) {
      const b = bez(p, mid, end, 0.6);
      const ba = a + (rnd() < 0.5 ? -0.6 : 0.6);
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(b[0], b[1]);
      c.lineTo(b[0] + Math.cos(ba) * len * 0.35, b[1] + Math.sin(ba) * len * 0.35);
      c.stroke();
    }
  }

  // circuit traces running out from the lower lid
  const traces: V[][] = [];
  const nodes: Node[] = [];
  for (let i = 0; i < 32; i++) {
    const s = bez(l.inner, l.lower, l.outer, 0.3 + rnd() * 0.7);
    let x = s[0] - R * 0.1;
    let y = s[1] + R * 0.05 + rnd() * R * 0.15;
    const pts: V[] = [[x, y]];
    const turn = rnd() < 0.5 ? -1 : 1;
    const run1 = R * (0.3 + rnd() * 1.1);
    const run2 = R * (0.2 + rnd() * 0.7);
    const run3 = R * (0.3 + rnd() * 1.4);
    x = Math.max(x - run1, -5.4 * R);
    pts.push([x, y]);
    x = Math.max(x - run2, -5.4 * R);
    y += turn * run2;
    pts.push([x, y]);
    x = Math.max(x - run3, -5.4 * R);
    pts.push([x, y]);
    c.strokeStyle = "rgba(70,255,80,0.5)";
    c.lineWidth = 1;
    c.beginPath();
    pts.forEach((p, j) => (j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.stroke();
    const end = pts[pts.length - 1];
    c.beginPath();
    c.arc(end[0], end[1], 2.5 + rnd() * 1.5, 0, TAU);
    c.stroke();
    traces.push(pts);
    if (i < 16) nodes.push({ x: pts[1][0], y: pts[1][1], p: rnd() * TAU, speed: 1.5 + rnd() * 3 });
  }
  for (let i = 0; i < 12; i++) {
    const p = bez(l.inner, l.lower, l.outer, 0.15 + (i / 11) * 0.8);
    nodes.push({ x: p[0], y: p[1] + R * 0.06, p: rnd() * TAU, speed: 1.5 + rnd() * 3 });
  }

  // lid outline
  c.shadowBlur = 12;
  c.shadowColor = "rgba(80,255,80,0.9)";
  c.strokeStyle = "rgba(120,255,110,0.9)";
  c.lineWidth = 2;
  eyePath(c, R);
  c.stroke();
  c.shadowBlur = 0;
  c.save();
  c.scale(0.94, 0.94);
  c.strokeStyle = "rgba(90,255,90,0.45)";
  c.lineWidth = 1;
  eyePath(c, R);
  c.stroke();
  c.restore();

  return { canvas, ox, oy, width, height, nodes, traces };
}

function drawIris(ctx: CanvasRenderingContext2D, R: number, t: number, pupil: number) {
  const body = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  body.addColorStop(0, "rgba(2,16,3,1)");
  body.addColorStop(0.36, "rgba(3,22,4,1)");
  body.addColorStop(0.46, "rgba(110,255,80,0.95)");
  body.addColorStop(0.7, "rgba(40,210,45,0.85)");
  body.addColorStop(1, "rgba(6,70,16,0.95)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();

  ctx.lineCap = "butt";
  ctx.strokeStyle = "rgba(190,255,170,0.9)";
  ctx.lineWidth = R * 0.07;
  ctx.setLineDash([R * 0.5, R * 0.12, R * 0.2, R * 0.12]);
  ctx.lineDashOffset = -t * R * 0.8;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.62, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = "rgba(120,255,110,0.8)";
  ctx.lineWidth = R * 0.04;
  ctx.setLineDash([R * 0.08, R * 0.07]);
  ctx.lineDashOffset = t * R * 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.82, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(150,255,130,0.7)";
  ctx.lineWidth = R * 0.03;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.96, 0, TAU);
  ctx.stroke();

  const sweep = t * 1.6; // radar sweep
  ctx.fillStyle = "rgba(200,255,190,0.16)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, R * 0.95, sweep, sweep + 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(0, 0, R * pupil, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(140,255,120,0.8)";
  ctx.lineWidth = R * 0.03;
  ctx.stroke();

  glow(ctx, R * 0.3, -R * 0.3, R * 0.35, "220,255,210", 0.7);
  ctx.fillStyle = "rgba(240,255,235,0.95)";
  ctx.beginPath();
  ctx.ellipse(R * 0.3, -R * 0.3, R * 0.1, R * 0.07, -0.6, 0, TAU);
  ctx.fill();
}

// ---- binary rain ----

type Column = { x: number; y: number; speed: number; seed: number };
type RainLayer = { cols: Column[]; size: number; step: number; trail: number; styles: string[]; head: string; headGlow: boolean };

function makeRain(count: number, size: number, step: number, trail: number, speeds: [number, number], alpha: [number, number], headGlow: boolean, w: number, h: number, edges: boolean): RainLayer {
  const cols = Array.from({ length: count }, (_, i) => ({
    x: edges ? (Math.random() < 0.8 ? (Math.random() < 0.5 ? rand(0, w * 0.14) : rand(w * 0.86, w)) : rand(0, w)) : (i + Math.random() * 0.6) * (w / count),
    y: rand(-h, h),
    speed: rand(speeds[0], speeds[1]),
    seed: Math.floor(rand(0, 1e6)),
  }));
  const styles = Array.from({ length: trail }, (_, i) => `rgba(60,235,60,${alpha[1] * (1 - i / trail)})`);
  return { cols, size, step, trail, styles, head: `rgba(180,255,170,${alpha[0]})`, headGlow };
}

function drawRain(ctx: CanvasRenderingContext2D, layer: RainLayer, t: number, dt: number, h: number) {
  ctx.font = `${layer.size}px monospace`;
  for (const col of layer.cols) {
    col.y += col.speed * dt;
    if (col.y - layer.trail * layer.step > h) col.y = -rand(0, h * 0.5);
    if (layer.headGlow) glow(ctx, col.x, col.y, layer.step * 1.3, "80,255,80", 0.3);
    for (let i = 0; i < layer.trail; i++) {
      const y = col.y - i * layer.step;
      if (y < -layer.step || y > h + layer.step) continue;
      const row = Math.floor(y / layer.step);
      const tick = Math.floor(t * 1.2 + (row % 5) * 0.2);
      const bit = (Math.imul(col.seed + row * 374761393 + tick * 668265263, 2246822519) >>> 16) & 1;
      ctx.fillStyle = i === 0 ? layer.head : layer.styles[i];
      ctx.fillText(bit ? "1" : "0", col.x, y);
    }
  }
}

export function createScene(w: number, h: number, dpr: number) {
  const small = w < 640;
  const R = clamp(Math.min(w * (small ? 0.075 : 0.05), h * 0.12), 26, 110);
  const layer = buildEyeLayer(R, dpr);
  const eyes = ([-1, 1] as const).map((side) => ({
    side,
    cx: w * (side === -1 ? 0.3 : 0.7),
    cy: h * 0.34,
    ix: 0,
    iy: 0,
    pupil: 0.38,
    pulses: layer.traces.slice(0, 12).map((poly) => {
      let len = 0;
      for (let i = 1; i < poly.length; i++) len += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
      return { poly, len, pos: rand(0, 1), speed: rand(0.15, 0.5) };
    }),
  }));

  const rain = [
    makeRain(Math.floor(w / (small ? 34 : 26)), 11, 14, 10, [35, 80], [0.3, 0.16], false, w, h, false),
    makeRain(Math.floor(w / (small ? 80 : 60)), 16, 20, 13, [60, 130], [0.55, 0.3], false, w, h, false),
    makeRain(small ? 4 : 8, 28, 36, 14, [90, 180], [1, 0.65], true, w, h, true),
  ];

  let blinkWait = rand(2, 4);
  let blinkAge = 99;
  let t = 0;

  function drawFloor() {
    return (ctx: CanvasRenderingContext2D) => {
      const hy = h * 0.9;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(60,255,80,0.1)";
      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + i * w * 0.012, hy);
        ctx.lineTo(w / 2 + i * w * 0.07, h);
        ctx.stroke();
      }
      const offset = (t * 0.25) % 1;
      for (let k = 0; k < 8; k++) {
        const p = (k + offset) / 8;
        const y = hy + (h - hy) * p * p;
        ctx.strokeStyle = `rgba(60,255,80,${0.03 + 0.12 * p})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };
  }
  const floor = drawFloor();

  function frame(ctx: CanvasRenderingContext2D, dt: number, pointer: Pointer) {
    t += dt;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#010401";
    ctx.fillRect(0, 0, w, h);
    glow(ctx, w / 2, h * 1.05, w * 0.6, "40,200,60", 0.07);
    floor(ctx);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const r of rain) drawRain(ctx, r, t, dt, h);

    blinkWait -= dt;
    blinkAge += dt;
    if (blinkWait <= 0) {
      blinkAge = 0;
      blinkWait = rand(3, 7);
    }
    const open = 1 - 0.94 * (blinkAge < 0.22 ? Math.sin((Math.PI * blinkAge) / 0.22) : 0);
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.7);

    for (const e of eyes) {
      let tx = Math.sin(t * 0.5 + e.cx) * 0.3 * R;
      let ty = Math.cos(t * 0.4) * 0.15 * R;
      let pupilTarget = 0.38;
      if (pointer.x !== -999) {
        const dx = pointer.x - e.cx;
        const dy = pointer.y - e.cy;
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(1, d / (w * 0.35));
        tx = (dx / d) * m * 0.5 * R * -e.side;
        ty = (dy / d) * m * 0.3 * R;
        if (d < 240) pupilTarget = 0.27;
      }
      e.ix += (tx - e.ix) * 0.08;
      e.iy += (ty - e.iy) * 0.08;
      e.pupil += (pupilTarget - e.pupil) * 0.1;

      ctx.save();
      ctx.translate(e.cx, e.cy);
      if (e.side === 1) ctx.scale(-1, 1);
      ctx.drawImage(layer.canvas, -layer.ox, -layer.oy, layer.width, layer.height);

      ctx.save(); // eyeball and iris, clipped to the lids
      eyePath(ctx, R);
      ctx.fillStyle = "#010a02";
      ctx.fill();
      ctx.clip();
      ctx.translate(e.ix, e.iy);
      ctx.scale(1, open);
      drawIris(ctx, R, t, e.pupil);
      ctx.restore();

      ctx.globalCompositeOperation = "lighter";
      glow(ctx, e.ix, e.iy, R * 2.8, "60,255,70", 0.32 * pulse * open + 0.05);
      for (const n of layer.nodes) {
        const f = 0.35 + 0.65 * Math.abs(Math.sin(t * n.speed + n.p));
        glow(ctx, n.x, n.y, R * 0.16, "255,185,50", 0.85 * f);
        ctx.fillStyle = `rgba(255,235,170,${f})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, TAU);
        ctx.fill();
      }
      for (const p of e.pulses) {
        p.pos += p.speed * dt;
        if (p.pos > 1) {
          p.pos = 0;
          p.speed = rand(0.15, 0.5);
        }
        let left = p.pos * p.len;
        for (let i = 1; i < p.poly.length; i++) {
          const seg = Math.hypot(p.poly[i][0] - p.poly[i - 1][0], p.poly[i][1] - p.poly[i - 1][1]);
          if (left <= seg) {
            const k = seg ? left / seg : 0;
            const x = p.poly[i - 1][0] + (p.poly[i][0] - p.poly[i - 1][0]) * k;
            const y = p.poly[i - 1][1] + (p.poly[i][1] - p.poly[i - 1][1]) * k;
            glow(ctx, x, y, R * 0.14, "150,255,150", 0.9);
            break;
          }
          left -= seg;
        }
      }
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    }

    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  return { frame };
}
