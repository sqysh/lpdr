import { createLog } from 'lib/actions/log/createLog'
import { NextResponse } from 'next/server'
import { getErrorMessage } from 'app/utils/_error.utils'
import { rotateBypassCodeCore } from 'lib/actions/admin/adoption-fee/rotateBypassCode'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  try {
    const result = await rotateBypassCodeCore()

    await createLog('info', '[CRON] rotate-bypass-code', {
      cronName: 'rotate-bypass-code',
      status: 'success',
      durationMs: Date.now() - start,
      detail: result.wasFirstRun ? 'Bypass code created (first run)' : 'Bypass code rotated'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    await createLog('error', '[CRON] rotate-bypass-code', {
      cronName: 'rotate-bypass-code',
      status: 'error',
      durationMs: Date.now() - start,
      detail: getErrorMessage(error)
    })
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
