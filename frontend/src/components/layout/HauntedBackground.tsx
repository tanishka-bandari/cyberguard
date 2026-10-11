"use client";

import { useEffect, useRef } from "react";
import { createScene, type Pointer } from "@/components/layout/haunted/scene";

// Dark-theme backdrop: a haunted graveyard night drawn on a canvas (see haunted/scene.ts).
// Not drawn in the light theme or while the tab is hidden; one still frame with reduced motion.
export function HauntedBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer: Pointer = { x: -999, y: -999, lx: -999, ly: -999 };
    let scene: ReturnType<typeof createScene>;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();

    const draw = (dt: number) => {
      if (!document.documentElement.classList.contains("dark")) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      pointer.lx += (pointer.x - pointer.lx) * 0.08;
      pointer.ly += (pointer.y - pointer.ly) * 0.08;
      scene.frame(ctx, dt, pointer);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = createScene(w, h, dpr);
      if (still) draw(0);
    };

    const loop = (now: number) => {
      draw(Math.min((now - last) / 1000, 0.05));
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
    // a still frame has to be redrawn when the theme is toggled
    const themeWatcher = new MutationObserver(() => still && draw(0));

    resize();
    start();
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      themeWatcher.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
