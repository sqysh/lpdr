export function formatLastRan(date: Date | null): string {
  if (!date) return 'Never'
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatNextRun(isoString: string): string {
  const date = new Date(isoString)
  const diffMs = date.getTime() - Date.now()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `in ${diffMins} min`
  if (diffHrs < 24) return `in ${diffHrs} hr${diffHrs !== 1 ? 's' : ''}`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
