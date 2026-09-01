import { RequestDetails } from './log.server.utils'

export function buildLogMessage(action: string, actor: string, context: RequestDetails) {
  const time = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  })

  return `${actor} ${action} on ${context.device} (${context.browser} · ${context.os}) at ${time}`
}

export function extractErrorMessage(error: unknown): string {
  try {
    if (
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data
    ) {
      return String(error.data.message)
    }
  } catch {
    // fall through to default message
  }

  return 'Unable to process request.'
}

export const getErrorMessage = (error: any) => {
  if (
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof (error as any).data === 'object' &&
    'message' in (error as any).data
  ) {
    return (error as any).data.message
  }

  return undefined
}
