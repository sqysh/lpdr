const DOMAIN = 'littlepawsdr.org'
const ORG = 'Little Paws Dachshund Rescue'

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
  auctions: from(INBOX.auctions)
} as const

export const mailto = (address: string, subject?: string) => `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
