import { readFile } from 'node:fs/promises'
import path from 'node:path'

// The reference artwork isn't approved, so it lives in brand/reference rather than public/ and is only ever served here, on a
// local dev server
const FILES = new Set(['lpdr-logo.png', 'lpdr-logo-horizontal.png'])

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  if (process.env.NODE_ENV === 'production' || !FILES.has(file)) return new Response(null, { status: 404 })

  const image = await readFile(path.join(process.cwd(), 'brand/reference', file))
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } })
}
