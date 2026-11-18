// Measurements of brand/lpdr-master.svg, in the master's own source pixels. <LPDRLogoDefs /> checks them against the file in
// development, so a regenerated master that moves anything fails loudly instead of silently misaligning a composition.

export type Box = { x: number; y: number; w: number; h: number }

export const LOGO_GEOMETRY = {
  viewBox: { x: 0, y: 0, w: 1447, h: 1087 },
  logo: { x: 115, y: 61, w: 1226, h: 965 },
  character: { x: 231, y: 61, w: 987, h: 679 },
  figure: { x: 285, y: 108, w: 824, h: 632 },
  ground: { x: 231, y: 668, w: 987, h: 58 },
  butterfly: { x: 820, y: 61, w: 187, h: 208 },
  wordmark: { x: 115, y: 746, w: 1226, h: 280 },
  groundAnchors: { left: 455, right: 990 }
} as const

// The horizontal reference (brand/reference/lpdr-logo-horizontal.png), measured in its own pixels. Only its layout is used:
// the character and the type always come from the master.
export const HORIZONTAL = { characterLeft: 63, characterTop: 49, characterHeight: 601, wordmarkWidth: 1359, wordmarkMiddle: 396 }

// The horizontal reference draws the ground line shorter than the stacked logo. Pulling each tapered end in to 63% of its length
// matches it, and the same proportion lets the character sit in a square.
export const SHORT_GROUND = 0.63

// Space between the character and the wordmark, as a fraction of the character's height
export const HORIZONTAL_GAP = 0.1
