import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Staging runs on a copy of the real database, so a test there must never email a real adopter.
// When EMAIL_ALLOWLIST is set (staging only), email goes to listed addresses and nobody else.
const allowlist = (process.env.EMAIL_ALLOWLIST ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

type SendOptions = Parameters<typeof resend.emails.send>[0]
type SendResult = Awaited<ReturnType<typeof resend.emails.send>>

const asList = (value: string | string[] | undefined) => (value == null ? [] : Array.isArray(value) ? value : [value])

// Accepts both "name@x.org" and "Name <name@x.org>"
const addressOf = (value: string) => (value.match(/<([^>]+)>/)?.[1] ?? value).trim().toLowerCase()

const isAllowed = (value: string) => allowlist.includes(addressOf(value))

function restrict(email: SendOptions): SendOptions | null {
  const to = asList(email.to).filter(isAllowed)
  if (to.length === 0) return null

  const cc = asList(email.cc).filter(isAllowed)
  const bcc = asList(email.bcc).filter(isAllowed)

  return {
    ...email,
    to,
    cc: cc.length ? cc : undefined,
    bcc: bcc.length ? bcc : undefined,
    subject: `[STAGING] ${email.subject}`
  }
}

if (allowlist.length > 0) {
  const send = resend.emails.send.bind(resend.emails)

  resend.emails.send = (async (email: SendOptions, options?: Parameters<typeof send>[1]) => {
    const safe = restrict(email)

    if (!safe) {
      console.info('[staging] email skipped, no allowed recipients', { to: email.to, subject: email.subject })
      // Callers treat a missing id as a failure, so a skipped send reports as sent
      return { data: { id: 'skipped-on-staging' }, error: null } as SendResult
    }

    return send(safe, options)
  }) as typeof resend.emails.send
}
