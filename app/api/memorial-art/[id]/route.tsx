/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'
import prisma from 'prisma/client'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const WIDTH = 960
const HEIGHT = 640

// Butterfly assets are pre-cropped to 960x643; displayed at half width
const BUTTERFLY_W = 480
const BUTTERFLY_H = Math.round((643 * BUTTERFLY_W) / 960)
const BUTTERFLY_TOP = Math.round(HEIGHT * 0.09)

// Banner panel position as fractions of the butterfly image
const BANNER_CENTER_Y = BUTTERFLY_TOP + BUTTERFLY_H * 0.8635 - 6
const BANNER_WIDTH = 340
const BANNER_HEIGHT = 44

const NAME_COLOR = 'rgb(92,62,112)'
const MAX_SIZE = 32
const MIN_ONE_LINE = 20
const MIN_TWO_LINE = 14

const PAIRINGS = [
  ['sunset', 'lavender'],
  ['sunset', 'blue'],
  ['sunset', 'green'],
  ['morning', 'peach'],
  ['morning', 'pink'],
  ['morning', 'yellow'],
  ['dusk', 'yellow'],
  ['dusk', 'peach'],
  ['dusk', 'green']
] as const

const ASSET_DIR = join(process.cwd(), 'public/images/memorial')

const fileCache = new Map<string, Promise<Buffer>>()
function asset(name: string) {
  if (!fileCache.has(name)) fileCache.set(name, readFile(join(ASSET_DIR, name)))
  return fileCache.get(name)!
}

async function dataUrl(name: string, mime: string) {
  return `data:${mime};base64,${(await asset(name)).toString('base64')}`
}

// Quicksand Bold advance widths (em), rounded up so estimates err toward fitting
function charWidth(c: string) {
  if ("iljI.,:;!|'".includes(c)) return 0.27
  if (' frt1'.includes(c)) return 0.44
  if ('mwMW'.includes(c)) return 0.94
  if (c >= 'A' && c <= 'Z') return 0.73
  return 0.64
}

function textWidth(text: string, size: number) {
  let em = 0
  for (const c of text) em += charWidth(c)
  return em * size
}

function fitSize(lines: string[]) {
  const widest = Math.max(...lines.map((l) => textWidth(l, 1)))
  return Math.min(MAX_SIZE, Math.floor(BANNER_WIDTH / widest))
}

function splitName(name: string): [string, string] | null {
  const spaces = [...name.matchAll(/ /g)].map((m) => m.index!)
  if (!spaces.length) return null
  const mid = name.length / 2
  const at = spaces.reduce((best, i) => (Math.abs(i - mid) < Math.abs(best - mid) ? i : best))
  return [name.slice(0, at), name.slice(at + 1)]
}

function layoutName(name: string) {
  const oneLine = fitSize([name])
  if (oneLine >= MIN_ONE_LINE) return { lines: [name], size: oneLine }

  const split = splitName(name)
  if (split) {
    const twoLine = Math.min(Math.floor(BANNER_HEIGHT / 2 / 1.05), fitSize(split))
    if (twoLine >= MIN_TWO_LINE) return { lines: split, size: twoLine }
  }

  return { lines: [name], size: Math.max(12, oneLine) }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const memorial = await prisma.memorial.findUnique({
    where: { id },
    select: { dogName: true, butterflySeed: true, status: true }
  })

  if (!memorial || memorial.status === 'HIDDEN') {
    return new NextResponse('Not found', { status: 404 })
  }

  const [scene, color] = PAIRINGS[Math.abs(memorial.butterflySeed) % PAIRINGS.length]
  const [sceneSrc, butterflySrc, font] = await Promise.all([
    dataUrl(`scene-${scene}.png`, 'image/png'),
    dataUrl(`butterfly-${color}.png`, 'image/png'),
    asset('quicksand-bold.ttf')
  ])

  const { lines, size } = layoutName(memorial.dogName.trim())

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
      <img src={sceneSrc} alt="" width={WIDTH} height={HEIGHT} style={{ position: 'absolute', top: 0, left: 0 }} />
      <img
        src={butterflySrc}
        alt=""
        width={BUTTERFLY_W}
        height={BUTTERFLY_H}
        style={{ position: 'absolute', top: BUTTERFLY_TOP, left: (WIDTH - BUTTERFLY_W) / 2 }}
      />
      <div
        style={{
          position: 'absolute',
          left: (WIDTH - BANNER_WIDTH) / 2,
          top: BANNER_CENTER_Y - BANNER_HEIGHT / 2,
          width: BANNER_WIDTH,
          height: BANNER_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Quicksand',
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.05,
          color: NAME_COLOR
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {line}
          </div>
        ))}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Quicksand', data: font, weight: 700, style: 'normal' }],
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' }
    }
  )
}
