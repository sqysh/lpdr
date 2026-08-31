import { TierKey } from 'types/_subscriptions.types'

export const TIERS = [
  { id: 't1', name: 'Tail Wagger', price: { MONTHLY: 10, YEARLY: 100 }, badge: null, tier: 'bronze' as const },
  { id: 't2', name: 'Snout Scout', price: { MONTHLY: 15, YEARLY: 150 }, badge: null, tier: 'bronze' as const },
  { id: 't3', name: 'Paw Pal', price: { MONTHLY: 20, YEARLY: 200 }, badge: null, tier: 'bronze' as const },
  { id: 't4', name: 'Biscuit Buddy', price: { MONTHLY: 25, YEARLY: 250 }, badge: null, tier: 'bronze' as const },
  { id: 't5', name: 'Foster Friend', price: { MONTHLY: 30, YEARLY: 300 }, badge: 'HOT', tier: 'silver' as const },
  { id: 't6', name: 'Belly Rubber', price: { MONTHLY: 40, YEARLY: 400 }, badge: null, tier: 'silver' as const },
  { id: 't7', name: 'Pack Member', price: { MONTHLY: 50, YEARLY: 500 }, badge: null, tier: 'silver' as const },
  { id: 't8', name: 'Den Leader', price: { MONTHLY: 60, YEARLY: 600 }, badge: 'POPULAR', tier: 'silver' as const },
  { id: 't9', name: 'Alpha Pup', price: { MONTHLY: 75, YEARLY: 750 }, badge: null, tier: 'gold' as const },
  { id: 't10', name: 'Wiener Guard', price: { MONTHLY: 100, YEARLY: 1000 }, badge: null, tier: 'gold' as const },
  { id: 't11', name: 'Pack Guardian', price: { MONTHLY: 125, YEARLY: 1250 }, badge: 'VALUE', tier: 'gold' as const },
  { id: 't12', name: 'Top Dog', price: { MONTHLY: 150, YEARLY: 1500 }, badge: null, tier: 'gold' as const },
  { id: 't13', name: 'Rescue Rider', price: { MONTHLY: 200, YEARLY: 2000 }, badge: null, tier: 'elite' as const },
  { id: 't14', name: 'Silver Paw', price: { MONTHLY: 300, YEARLY: 3000 }, badge: null, tier: 'elite' as const },
  { id: 't15', name: 'Golden Doxie', price: { MONTHLY: 400, YEARLY: 4000 }, badge: 'RARE', tier: 'elite' as const },
  { id: 't16', name: 'Pack Champion', price: { MONTHLY: 500, YEARLY: 5000 }, badge: 'ELITE', tier: 'elite' as const }
]

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
    darkIdleBg: 'rgba(0,0,0,.88)',
    darkActiveBg: 'rgba(60,20,0,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(200,90,20,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(50,20,5,.80) 0%,rgba(28,10,2,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(60,26,6,.90) 0%,rgba(35,14,3,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(255,228,195,.70) 0%,rgba(255,210,170,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(255,232,205,.85) 0%,rgba(255,218,182,.70) 100%)',
    darkGlow:
      '0 0 30px 7px rgba(224,123,48,.55),0 0 90px 20px rgba(224,123,48,.22),inset 0 1px 0 rgba(255,200,100,.14)',
    lightGlow: '0 0 28px 6px rgba(200,90,20,.32),0 0 70px 14px rgba(200,90,20,.13),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(180,80,20,.5)]',
    lightRank: 'text-[rgba(160,70,10,.45)]',
    darkPrice: 'text-[#e07b30]',
    lightPrice: 'text-[#b85010]',
    darkPriceActive: 'text-[#ff9040]',
    lightPriceActive: 'text-[#c05818]',
    darkName: 'text-[#b06030]',
    lightName: 'text-[#904010]',
    darkNameActive: 'text-[#ffa050]',
    lightNameActive: 'text-[#a04810]',
    darkBorderIdle: 'border-[rgba(180,80,20,.32)]',
    darkBorderActive: 'border-[rgba(224,123,48,.72)]',
    lightBorderIdle: 'border-[rgba(200,100,30,.22)]',
    lightBorderActive: 'border-[rgba(200,90,20,.62)]',
    darkCorner: 'border-[rgba(224,123,48,.35)]',
    lightCorner: 'border-[rgba(180,80,20,.28)]',
    darkEdgeVia: 'via-[#e07b30]',
    lightEdgeVia: 'via-[rgba(200,90,20,.6)]',
    darkBadge: 'bg-[#e07b30] text-black',
    lightBadge: 'bg-[rgba(190,80,15,.9)] text-white',
    darkShineVia: 'via-[rgba(255,180,80,.22)]',
    lightShineVia: 'via-[rgba(255,255,255,.55)]',
    darkStripe: 'rgba(180,80,20,.055)',
    lightStripe: 'rgba(180,80,20,.045)',
    label: 'Bronze',
    labelClass: 'text-[#e07b30]'
  },
  silver: {
    darkIdleBg: 'rgba(8,26,46,.82)',
    darkActiveBg: 'rgba(10,34,56,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(8,120,160,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(8,26,46,.80) 0%,rgba(4,16,32,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(10,34,56,.90) 0%,rgba(6,20,40,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(198,238,255,.70) 0%,rgba(178,224,250,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(208,244,255,.85) 0%,rgba(188,232,255,.70) 100%)',
    darkGlow: '0 0 30px 7px rgba(8,145,178,.60),0 0 90px 20px rgba(8,145,178,.24),inset 0 1px 0 rgba(100,220,255,.16)',
    lightGlow: '0 0 28px 6px rgba(8,130,165,.35),0 0 70px 14px rgba(8,130,165,.14),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(8,100,140,.55)]',
    lightRank: 'text-[rgba(8,100,140,.42)]',
    darkPrice: 'text-[#0891b2]',
    lightPrice: 'text-[#0070a0]',
    darkPriceActive: 'text-[#30c0e0]',
    lightPriceActive: 'text-[#0080b8]',
    darkName: 'text-[#0a7090]',
    lightName: 'text-[#005880]',
    darkNameActive: 'text-[#60d0f0]',
    lightNameActive: 'text-[#006898]',
    darkBorderIdle: 'border-[rgba(8,100,140,.32)]',
    darkBorderActive: 'border-[rgba(8,145,178,.72)]',
    lightBorderIdle: 'border-[rgba(8,120,160,.20)]',
    lightBorderActive: 'border-[rgba(8,120,160,.58)]',
    darkCorner: 'border-[rgba(8,145,178,.35)]',
    lightCorner: 'border-[rgba(8,120,160,.26)]',
    darkEdgeVia: 'via-[#0891b2]',
    lightEdgeVia: 'via-[rgba(8,120,160,.55)]',
    darkBadge: 'bg-[#0891b2] text-white',
    lightBadge: 'bg-[rgba(7,100,138,.9)] text-white',
    darkShineVia: 'via-[rgba(100,220,255,.22)]',
    lightShineVia: 'via-[rgba(255,255,255,.58)]',
    darkStripe: 'rgba(8,100,140,.055)',
    lightStripe: 'rgba(8,100,140,.04)',
    label: 'Silver',
    labelClass: 'text-[#0891b2]'
  },
  gold: {
    darkIdleBg: 'rgba(18,8,42,.82)',
    darkActiveBg: 'rgba(24,10,52,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(110,55,210,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(18,8,42,.80) 0%,rgba(10,4,28,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(24,10,52,.90) 0%,rgba(14,6,36,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(228,212,255,.70) 0%,rgba(212,192,255,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(236,222,255,.85) 0%,rgba(222,204,255,.70) 100%)',
    darkGlow:
      '0 0 30px 7px rgba(139,92,246,.60),0 0 90px 20px rgba(139,92,246,.24),inset 0 1px 0 rgba(200,170,255,.14)',
    lightGlow:
      '0 0 28px 6px rgba(120,60,220,.32),0 0 70px 14px rgba(120,60,220,.13),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(100,40,180,.50)]',
    lightRank: 'text-[rgba(100,40,180,.38)]',
    darkPrice: 'text-[#a78bfa]',
    lightPrice: 'text-[#6030b0]',
    darkPriceActive: 'text-[#c8b0ff]',
    lightPriceActive: 'text-[#7040c8]',
    darkName: 'text-[#7040c0]',
    lightName: 'text-[#5028a0]',
    darkNameActive: 'text-[#d0b0ff]',
    lightNameActive: 'text-[#6030b8]',
    darkBorderIdle: 'border-[rgba(100,40,180,.32)]',
    darkBorderActive: 'border-[rgba(139,92,246,.72)]',
    lightBorderIdle: 'border-[rgba(120,60,220,.20)]',
    lightBorderActive: 'border-[rgba(120,60,220,.56)]',
    darkCorner: 'border-[rgba(139,92,246,.35)]',
    lightCorner: 'border-[rgba(100,50,200,.26)]',
    darkEdgeVia: 'via-[#8b5cf6]',
    lightEdgeVia: 'via-[rgba(120,60,220,.55)]',
    darkBadge: 'bg-[#8b5cf6] text-white',
    lightBadge: 'bg-[rgba(110,55,210,.9)] text-white',
    darkShineVia: 'via-[rgba(200,170,255,.22)]',
    lightShineVia: 'via-[rgba(255,255,255,.58)]',
    darkStripe: 'rgba(100,40,180,.055)',
    lightStripe: 'rgba(100,40,180,.04)',
    label: 'Gold',
    labelClass: 'text-[#a78bfa]'
  },
  elite: {
    darkIdleBg: 'rgba(38,22,0,.82)',
    darkActiveBg: 'rgba(48,28,0,.92)',
    lightIdleBg: 'rgba(255,252,250,.82)',
    lightActiveBg: 'rgba(180,120,0,.15)',
    darkIdle: 'linear-gradient(135deg,rgba(38,22,0,.80) 0%,rgba(22,12,0,.90) 100%)',
    darkActive: 'linear-gradient(135deg,rgba(48,28,0,.90) 0%,rgba(28,16,0,.95) 100%)',
    lightIdle: 'linear-gradient(135deg,rgba(255,244,195,.70) 0%,rgba(255,232,165,.55) 100%)',
    lightActive: 'linear-gradient(135deg,rgba(255,248,210,.85) 0%,rgba(255,238,180,.70) 100%)',
    darkGlow: '0 0 30px 7px rgba(245,158,11,.65),0 0 90px 22px rgba(245,158,11,.28),inset 0 1px 0 rgba(255,228,80,.16)',
    lightGlow: '0 0 28px 6px rgba(190,130,0,.36),0 0 70px 14px rgba(190,130,0,.14),inset 0 1px 0 rgba(255,255,255,.95)',
    darkRank: 'text-[rgba(160,100,0,.55)]',
    lightRank: 'text-[rgba(150,90,0,.45)]',
    darkPrice: 'text-[#f59e0b]',
    lightPrice: 'text-[#9a6800]',
    darkPriceActive: 'text-[#ffc040]',
    lightPriceActive: 'text-[#aa7800]',
    darkName: 'text-[#b07800]',
    lightName: 'text-[#7a5000]',
    darkNameActive: 'text-[#ffd060]',
    lightNameActive: 'text-[#8a6000]',
    darkBorderIdle: 'border-[rgba(160,100,0,.32)]',
    darkBorderActive: 'border-[rgba(245,158,11,.75)]',
    lightBorderIdle: 'border-[rgba(180,120,0,.24)]',
    lightBorderActive: 'border-[rgba(190,130,0,.62)]',
    darkCorner: 'border-[rgba(245,158,11,.38)]',
    lightCorner: 'border-[rgba(170,110,0,.30)]',
    darkEdgeVia: 'via-[#f59e0b]',
    lightEdgeVia: 'via-[rgba(190,130,0,.6)]',
    darkBadge: 'bg-[#f59e0b] text-black',
    lightBadge: 'bg-[rgba(170,110,0,.9)] text-white',
    darkShineVia: 'via-[rgba(255,228,80,.22)]',
    lightShineVia: 'via-[rgba(255,255,255,.58)]',
    darkStripe: 'rgba(160,100,0,.055)',
    lightStripe: 'rgba(160,100,0,.04)',
    label: 'Elite',
    labelClass: 'text-[#f59e0b]'
  }
}
