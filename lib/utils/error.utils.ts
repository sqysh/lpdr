export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

// A refusal the user caused and can fix, as opposed to something breaking. Logged as a warning, not an error
export class UserFacingError extends Error {}
