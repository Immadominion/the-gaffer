"use client";

import { useEffect, useRef, useState } from "react";
import { moodBase, moodSrc, orbit, type GafferMood } from "@/lib/gaffer";

// <model-viewer> is a custom element. Type it locally and render via a cast so
// we don't depend on fragile global JSX augmentation across React versions.
type ModelViewerProps = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  poster?: string;
  alt?: string;
  "camera-orbit"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "interaction-prompt"?: "auto" | "none";
  "interpolation-decay"?: number;
  exposure?: string;
  "shadow-intensity"?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual" | "interaction";
};
const ModelViewer = "model-viewer" as unknown as React.FC<ModelViewerProps>;

type Props = {
  mood?: GafferMood;
  className?: string;
  style?: React.CSSProperties;
  /** how far (deg) he turns to follow the cursor */
  follow?: number;
  /** gentle vertical bob (default true) */
  float?: boolean;
  dropShadow?: string;
  poster?: string;
  alt?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * The Gaffer in 3D. The whole model is framed (auto radius — never clipped). You
 * can't spin him around; instead he smoothly turns to face the cursor while it's
 * over him, then eases back. No drag, no flipping, no halo behind him.
 */
export default function Gaffer3D({
  mood = "neutral",
  className,
  style,
  follow = 22,
  float = true,
  dropShadow = "drop-shadow(0 24px 36px rgba(16,35,26,.28))",
  poster = "/img/gaffer.png",
  alt = "The Gaffer",
}: Props) {
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const base = moodBase[mood];

  // only mount the model once it scrolls near the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || ready) return;
    let alive = true;
    import("@google/model-viewer").then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [inView, ready]);

  const setOrbit = (theta: number, phi: number) => {
    const mv = ref.current?.querySelector("model-viewer") as
      | (HTMLElement & { cameraOrbit?: string })
      | null;
    if (mv) mv.cameraOrbit = orbit(theta, phi);
  };

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1 (left) .. 1 (right)
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    setOrbit(base.theta - nx * follow, clamp(base.phi - ny * 5, 82, 94));
  };
  const onLeave = () => setOrbit(base.theta, base.phi);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`${float ? "gaffer-float " : ""}${className ?? ""}`}
      style={{ position: "relative", ...style }}
    >
      {ready ? (
        <ModelViewer
          src={moodSrc(mood)}
          poster={poster}
          alt={alt}
          camera-orbit={orbit(base.theta, base.phi)}
          min-camera-orbit="auto 80deg auto"
          max-camera-orbit="auto 94deg auto"
          interaction-prompt="none"
          interpolation-decay={120}
          exposure="1.05"
          shadow-intensity="0"
          loading="eager"
          reveal="auto"
          style={
            {
              width: "100%",
              height: "100%",
              filter: dropShadow,
              "--progress-bar-color": "transparent",
            } as React.CSSProperties
          }
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom", filter: dropShadow }}
        />
      )}
    </div>
  );
}
