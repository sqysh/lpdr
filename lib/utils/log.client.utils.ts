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
