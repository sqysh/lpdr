import { createLog } from 'lib/actions/log/createLog'
import { NextResponse } from 'next/server'
import prisma from 'prisma/client'
import { activateAuctions, AUCTION_START_SELECT } from 'lib/auction/activateAuctions'

async function startDueAuctions() {
  const start = Date.now()

  try {
    const auctions = await prisma.auction.findMany({
      where: { status: 'DRAFT', startDate: { lte: new Date() } },
      select: AUCTION_START_SELECT
    })

    if (auctions.length === 0) {
      await createLog('info', '[CRON] start-auction', {
        cronName: 'start-auction',
        status: 'skipped',
        durationMs: Date.now() - start,
        detail: 'No DRAFT auctions past start date'
      })
      return NextResponse.json({ success: true, activated: 0 })
    }

    // One auction runs at a time. More than one due means a stale draft or a mistyped start
    // date, and picking either would publish something nobody meant to publish.
    if (auctions.length > 1) {
      await createLog('error', '[CRON] start-auction', {
        cronName: 'start-auction',
        status: 'error',
        durationMs: Date.now() - start,
        detail: `${auctions.length} auctions are past their start date, so none were started: ${auctions
          .map((a) => `${a.title} (${a.id})`)
          .join(', ')}`
      })
      return NextResponse.json({ error: 'More than one auction is due to start', auctions: auctions.map((a) => a.id) }, { status: 409 })
    }

    const activated = await activateAuctions(auctions)

    await createLog('info', '[CRON] start-auction', {
      cronName: 'start-auction',
      status: 'success',
      durationMs: Date.now() - start,
      detail: `${activated} auction(s) started: ${auctions.map((a) => a.title).join(', ')}`
    })

    return NextResponse.json({ success: true, activated })
  } catch (error) {
    await createLog('error', '[CRON] start-auction', {
      cronName: 'start-auction',
      status: 'error',
      durationMs: Date.now() - start,
      detail: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json({ error: 'Failed to start auctions' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return startDueAuctions()
}
