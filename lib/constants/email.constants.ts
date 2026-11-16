const DOMAIN = 'littlepawsdr.org'
const ORG = 'Little Paws Dachshund Rescue'
/** Temporary: Cathy countersigns while Isabelle gets up to speed, so the "ready to countersign" notice goes to her instead of the agreement's creator. Set back to null to restore per-creator routing. */
export const COUNTERSIGN_NOTIFY_OVERRIDE: string | null = `cathyn@${DOMAIN}`

/** Inboxes people write to or that we notify */
export const INBOX = {
  general: `lpdr@${DOMAIN}`,
  applications: `applications@${DOMAIN}`,
  chips: `chips@${DOMAIN}`,
  treasurer: `treasurer@${DOMAIN}`,
  auctions: `auction@${DOMAIN}`
} as const

const from = (address: string) => `${ORG} <${address}>`

/** From addresses on outgoing email, all real inboxes so replies reach someone */
export const SENDER = {
  general: from(INBOX.general),
  adoptions: from(INBOX.applications),
  treasurer: from(INBOX.treasurer),
  auctions: from(INBOX.auctions),
  /** Alerts to our own inboxes. Gmail hides mail sent from an inbox to itself, so these can't share an address */
  notifications: from(`notifications@${DOMAIN}`)
} as const

export const mailto = (address: string, subject?: string) => `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
