import { TierKey } from 'types/subscriptions.types'

export const SUBSCRIPTION_TIERS = [
  {
    id: 't1',
    name: 'Tail Wagger',
    price: { MONTHLY: 10, YEARLY: 100 },
    badge: null,
    tier: 'bronze' as const
  },
  {
    id: 't2',
    name: 'Snout Scout',
    price: { MONTHLY: 15, YEARLY: 150 },
    badge: null,
    tier: 'bronze' as const
  },
  {
    id: 't3',
    name: 'Paw Pal',
    price: { MONTHLY: 20, YEARLY: 200 },
    badge: null,
    tier: 'bronze' as const
  },
  {
    id: 't4',
    name: 'Biscuit Buddy',
    price: { MONTHLY: 25, YEARLY: 250 },
    badge: null,
    tier: 'bronze' as const
  },
  {
    id: 't5',
    name: 'Foster Friend',
    price: { MONTHLY: 30, YEARLY: 300 },
    badge: 'HOT',
    tier: 'silver' as const
  },
  {
    id: 't6',
    name: 'Belly Rubber',
    price: { MONTHLY: 40, YEARLY: 400 },
    badge: null,
    tier: 'silver' as const
  },
  {
    id: 't7',
    name: 'Pack Member',
    price: { MONTHLY: 50, YEARLY: 500 },
    badge: null,
    tier: 'silver' as const
  },
  {
    id: 't8',
    name: 'Den Leader',
    price: { MONTHLY: 60, YEARLY: 600 },
    badge: 'POPULAR',
    tier: 'silver' as const
  },
  {
    id: 't9',
    name: 'Alpha Pup',
    price: { MONTHLY: 75, YEARLY: 750 },
    badge: null,
    tier: 'gold' as const
  },
  {
    id: 't10',
    name: 'Wiener Guard',
    price: { MONTHLY: 100, YEARLY: 1000 },
    badge: null,
    tier: 'gold' as const
  },
  {
    id: 't11',
    name: 'Pack Guardian',
    price: { MONTHLY: 125, YEARLY: 1250 },
    badge: 'VALUE',
    tier: 'gold' as const
  },
  {
    id: 't12',
    name: 'Top Dog',
    price: { MONTHLY: 150, YEARLY: 1500 },
    badge: null,
    tier: 'gold' as const
  },
  {
    id: 't13',
    name: 'Rescue Rider',
    price: { MONTHLY: 200, YEARLY: 2000 },
    badge: null,
    tier: 'elite' as const
  },
  {
    id: 't14',
    name: 'Silver Paw',
    price: { MONTHLY: 300, YEARLY: 3000 },
    badge: null,
    tier: 'elite' as const
  },
  {
    id: 't15',
    name: 'Golden Doxie',
    price: { MONTHLY: 400, YEARLY: 4000 },
    badge: 'RARE',
    tier: 'elite' as const
  },
  {
    id: 't16',
    name: 'Pack Champion',
    price: { MONTHLY: 500, YEARLY: 5000 },
    badge: 'ELITE',
    tier: 'elite' as const
  }
] as const

export const T: Record<
  TierKey,
  {
    // card backgrounds (inline style)
    darkIdleBg: string
    darkActiveBg: string
    lightIdleBg: string
    lightActiveBg: string
    darkIdle: string
    darkActive: string
    lightIdle: string
    lightActive: string
    // box-shadow glows (inline style)
    darkGlow: string
    lightGlow: string
    // text colours (Tailwind class)
    darkRank: string
    lightRank: string
    darkPrice: string
    lightPrice: string
    darkPriceActive: string
    lightPriceActive: string
    darkName: string
    lightName: string
    darkNameActive: string
    lightNameActive: string
    // border
    darkBorderIdle: string
    darkBorderActive: string
    lightBorderIdle: string
    lightBorderActive: string
    // corner / edge / badge
    darkCorner: string
    lightCorner: string
    darkEdgeVia: string
    lightEdgeVia: string
    darkBadge: string
    lightBadge: string
    darkShineVia: string
    lightShineVia: string
    // stripe colour (inline)
    darkStripe: string
    lightStripe: string
    label: string
    labelClass: string
  }
> = {
  bronze: {
    darkIdleBg: 'rgba(28,14,4,.88)',
    darkActiveBg: 'rgba(58,28,8,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(160,100,40,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(50,24,8,.80) 0%,rgba(28,12,3,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(62,30,10,.90) 0%,rgba(36,16,5,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(250,226,198,.70) 0%,rgba(240,208,172,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(252,232,208,.85) 0%,rgba(244,216,184,.70) 100%)',
    darkGlow: '0 0 30px 7px rgba(205,127,50,.55),0 0 90px 20px rgba(205,127,50,.22),inset 0 1px 0 rgba(240,190,130,.14)',
    lightGlow: '0 0 28px 6px rgba(150,95,35,.32),0 0 70px 14px rgba(150,95,35,.13),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(160,95,40,.5)]',
    lightRank: 'text-[rgba(140,85,35,.45)]',
    darkPrice: 'text-[#cd7f32]',
    lightPrice: 'text-[#8b5a2b]',
    darkPriceActive: 'text-[#e89a52]',
    lightPriceActive: 'text-[#a06a30]',
    darkName: 'text-[#a06a3a]',
    lightName: 'text-[#734a22]',
    darkNameActive: 'text-[#f0ad6a]',
    lightNameActive: 'text-[#8b5a2b]',
    darkBorderIdle: 'border-[rgba(160,95,40,.32)]',
    darkBorderActive: 'border-[rgba(205,127,50,.72)]',
    lightBorderIdle: 'border-[rgba(160,100,40,.22)]',
    lightBorderActive: 'border-[rgba(150,95,35,.62)]',
    darkCorner: 'border-[rgba(205,127,50,.35)]',
    lightCorner: 'border-[rgba(140,85,35,.28)]',
    darkEdgeVia: 'via-[#cd7f32]',
    lightEdgeVia: 'via-[rgba(150,95,35,.6)]',
    darkBadge: 'bg-[#cd7f32] text-black',
    lightBadge: 'bg-[rgba(140,85,35,.9)] text-white',
    darkShineVia: 'via-[rgba(240,190,130,.22)]',
    lightShineVia: 'via-[rgba(255,255,255,.55)]',
    darkStripe: 'rgba(160,95,40,.055)',
    lightStripe: 'rgba(160,95,40,.045)',
    label: 'Bronze',
    labelClass: 'text-[#cd7f32]'
  },

  silver: {
    darkIdleBg: 'rgba(18,21,25,.86)',
    darkActiveBg: 'rgba(30,35,42,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(100,116,139,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(32,38,45,.80) 0%,rgba(16,19,23,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(44,52,62,.90) 0%,rgba(22,26,32,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(232,236,240,.70) 0%,rgba(214,220,228,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(242,245,248,.85) 0%,rgba(226,232,238,.70) 100%)',
    darkGlow: '0 0 30px 7px rgba(192,200,210,.55),0 0 90px 20px rgba(192,200,210,.20),inset 0 1px 0 rgba(255,255,255,.16)',
    lightGlow: '0 0 28px 6px rgba(100,116,139,.30),0 0 70px 14px rgba(100,116,139,.12),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(140,150,165,.55)]',
    lightRank: 'text-[rgba(100,116,139,.45)]',
    darkPrice: 'text-[#c0c8d2]',
    lightPrice: 'text-[#64748b]',
    darkPriceActive: 'text-[#eef2f6]',
    lightPriceActive: 'text-[#475569]',
    darkName: 'text-[#94a3b3]',
    lightName: 'text-[#52606f]',
    darkNameActive: 'text-[#ffffff]',
    lightNameActive: 'text-[#3d4753]',
    darkBorderIdle: 'border-[rgba(140,150,165,.30)]',
    darkBorderActive: 'border-[rgba(206,214,224,.70)]',
    lightBorderIdle: 'border-[rgba(100,116,139,.20)]',
    lightBorderActive: 'border-[rgba(100,116,139,.58)]',
    darkCorner: 'border-[rgba(206,214,224,.35)]',
    lightCorner: 'border-[rgba(100,116,139,.26)]',
    darkEdgeVia: 'via-[#c0c8d2]',
    lightEdgeVia: 'via-[rgba(100,116,139,.55)]',
    darkBadge: 'bg-[#c0c8d2] text-black',
    lightBadge: 'bg-[rgba(82,96,111,.9)] text-white',
    darkShineVia: 'via-[rgba(255,255,255,.24)]',
    lightShineVia: 'via-[rgba(255,255,255,.58)]',
    darkStripe: 'rgba(160,172,188,.05)',
    lightStripe: 'rgba(100,116,139,.04)',
    label: 'Silver',
    labelClass: 'text-[#c0c8d2]'
  },

  gold: {
    darkIdleBg: 'rgba(30,24,4,.86)',
    darkActiveBg: 'rgba(46,36,6,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(180,140,20,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(44,34,6,.80) 0%,rgba(24,18,3,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(58,46,8,.90) 0%,rgba(32,24,4,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(253,240,190,.70) 0%,rgba(248,228,158,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(255,246,208,.85) 0%,rgba(252,236,178,.70) 100%)',
    darkGlow: '0 0 30px 7px rgba(212,175,55,.60),0 0 90px 20px rgba(212,175,55,.24),inset 0 1px 0 rgba(255,225,130,.16)',
    lightGlow: '0 0 28px 6px rgba(160,125,20,.34),0 0 70px 14px rgba(160,125,20,.13),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(150,120,35,.55)]',
    lightRank: 'text-[rgba(140,110,25,.45)]',
    darkPrice: 'text-[#d4af37]',
    lightPrice: 'text-[#8a6d1f]',
    darkPriceActive: 'text-[#ffd75e]',
    lightPriceActive: 'text-[#a8851f]',
    darkName: 'text-[#a88a2c]',
    lightName: 'text-[#6f5718]',
    darkNameActive: 'text-[#ffe27a]',
    lightNameActive: 'text-[#8a6d1f]',
    darkBorderIdle: 'border-[rgba(150,120,35,.32)]',
    darkBorderActive: 'border-[rgba(212,175,55,.74)]',
    lightBorderIdle: 'border-[rgba(180,140,20,.22)]',
    lightBorderActive: 'border-[rgba(160,125,20,.60)]',
    darkCorner: 'border-[rgba(212,175,55,.36)]',
    lightCorner: 'border-[rgba(150,115,20,.28)]',
    darkEdgeVia: 'via-[#d4af37]',
    lightEdgeVia: 'via-[rgba(160,125,20,.58)]',
    darkBadge: 'bg-[#d4af37] text-black',
    lightBadge: 'bg-[rgba(150,115,20,.9)] text-white',
    darkShineVia: 'via-[rgba(255,225,130,.24)]',
    lightShineVia: 'via-[rgba(255,255,255,.58)]',
    darkStripe: 'rgba(150,120,35,.055)',
    lightStripe: 'rgba(150,120,35,.04)',
    label: 'Gold',
    labelClass: 'text-[#d4af37]'
  },

  elite: {
    darkIdleBg: 'rgba(8,20,26,.86)',
    darkActiveBg: 'rgba(12,32,42,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(30,130,160,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(12,30,38,.80) 0%,rgba(6,16,22,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(16,42,54,.90) 0%,rgba(8,22,30,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(214,242,250,.70) 0%,rgba(192,232,244,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(228,248,253,.85) 0%,rgba(204,238,248,.70) 100%)',
    darkGlow: '0 0 32px 8px rgba(185,242,255,.62),0 0 96px 24px rgba(185,242,255,.26),inset 0 1px 0 rgba(255,255,255,.20)',
    lightGlow: '0 0 28px 6px rgba(30,130,160,.34),0 0 70px 14px rgba(30,130,160,.14),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(120,180,200,.55)]',
    lightRank: 'text-[rgba(40,120,145,.45)]',
    darkPrice: 'text-[#b9f2ff]',
    lightPrice: 'text-[#1e7f9c]',
    darkPriceActive: 'text-[#e8fdff]',
    lightPriceActive: 'text-[#2695b5]',
    darkName: 'text-[#7fc9dd]',
    lightName: 'text-[#186a83]',
    darkNameActive: 'text-[#ffffff]',
    lightNameActive: 'text-[#1e7f9c]',
    darkBorderIdle: 'border-[rgba(120,180,200,.32)]',
    darkBorderActive: 'border-[rgba(185,242,255,.78)]',
    lightBorderIdle: 'border-[rgba(30,130,160,.22)]',
    lightBorderActive: 'border-[rgba(30,130,160,.62)]',
    darkCorner: 'border-[rgba(185,242,255,.40)]',
    lightCorner: 'border-[rgba(30,130,160,.30)]',
    darkEdgeVia: 'via-[#b9f2ff]',
    lightEdgeVia: 'via-[rgba(30,130,160,.6)]',
    darkBadge: 'bg-[#b9f2ff] text-black',
    lightBadge: 'bg-[rgba(24,106,131,.9)] text-white',
    darkShineVia: 'via-[rgba(255,255,255,.28)]',
    lightShineVia: 'via-[rgba(255,255,255,.60)]',
    darkStripe: 'rgba(120,180,200,.055)',
    lightStripe: 'rgba(30,130,160,.04)',
    label: 'Elite',
    labelClass: 'text-[#b9f2ff]'
  }
}
