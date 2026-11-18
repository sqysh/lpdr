import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type Box = { x: number; y: number; w: number; h: number }

export type BrandMaster = {
  // everything inside the master <svg>, to inline once on a page and reference with <use>
  defs: string
  viewBox: Box
  logo: Box
  character: Box
  figure: Box
  ground: Box
  butterfly: Box
  wordmark: Box
  groundAnchors: { left: number; right: number }
}

// Kept outside public/ on purpose: the artwork isn't approved yet, so it is only ever read on the server
const MASTER = path.join(process.cwd(), 'brand/lpdr-master.svg')

function attr(svg: string, id: string, name: string) {
  const match = svg.match(new RegExp(`id="${id}"[^>]*\\s${name}="([^"]+)"`))
  if (!match) throw new Error(`brand/lpdr-master.svg: #${id} has no ${name}`)
  return match[1]
}

function box(svg: string, id: string): Box {
  const [x, y, w, h] = attr(svg, id, 'data-bbox').split(' ').map(Number)
  return { x, y, w, h }
}

// The file never changes while a production server runs, so read it once there. In development it is re-read, so a regenerated master shows up.
let cached: Promise<BrandMaster> | undefined

export function loadBrandMaster(): Promise<BrandMaster> {
  if (process.env.NODE_ENV === 'production') return (cached ??= readBrandMaster())
  return readBrandMaster()
}

async function readBrandMaster(): Promise<BrandMaster> {
  const svg = await readFile(MASTER, 'utf8')
  const open = svg.indexOf('>', svg.indexOf('<svg')) + 1
  const [, , w, h] = svg
    .match(/viewBox="([^"]+)"/)![1]
    .split(' ')
    .map(Number)

  return {
    defs: svg.slice(open, svg.lastIndexOf('</svg>')),
    viewBox: { x: 0, y: 0, w, h },
    logo: box(svg, 'lpdr-logo'),
    character: box(svg, 'lpdr-character'),
    figure: box(svg, 'lpdr-figure'),
    ground: box(svg, 'lpdr-ground'),
    butterfly: box(svg, 'lpdr-butterfly'),
    wordmark: box(svg, 'lpdr-wordmark'),
    groundAnchors: {
      left: Number(attr(svg, 'lpdr-ground-left', 'data-anchor-x')),
      right: Number(attr(svg, 'lpdr-ground-right', 'data-anchor-x'))
    }
  }
}
