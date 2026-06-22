// The Gaffer's moods map to the 3D model files in /public/models.
// Mood IS state — each screen swaps in the model that fits the moment.
export type GafferMood =
  | "neutral"
  | "smug"
  | "thinking"
  | "roast"
  | "approving"
  | "disappointed"
  | "base";

export function moodSrc(mood: GafferMood): string {
  const file = mood === "base" ? "base_3d" : mood;
  return `/models/the_gaffer_${file}.glb`;
}

// Base camera framing per mood. Radius is `auto` so model-viewer frames the WHOLE
// model (no clipping); phi sits near the horizon so he's never tilted oddly. The
// hover-follow nudges theta/phi around this base, then eases back.
export const moodBase: Record<GafferMood, { theta: number; phi: number }> = {
  neutral: { theta: 0, phi: 88 },
  smug: { theta: 6, phi: 87 },
  thinking: { theta: -6, phi: 88 },
  roast: { theta: 5, phi: 87 },
  approving: { theta: 0, phi: 87 },
  disappointed: { theta: -3, phi: 89 },
  base: { theta: 0, phi: 88 },
};

export const orbit = (theta: number, phi: number) => `${theta}deg ${phi}deg auto`;
