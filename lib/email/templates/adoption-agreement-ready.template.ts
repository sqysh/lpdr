import { COLOR } from 'lib/constants/order-confirmation-constants'
import { escapeHtml } from 'lib/utils/html.utils'

type Props = {
  firstName: string | null
  dogName: string
  link: string
  paysByCard: boolean
}

export function adoptionAgreementReadyTemplate({ firstName, dogName, link, paysByCard }: Props): string {
  const name = escapeHtml(dogName)
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,'
  const paymentNote = paysByCard
    ? 'You can sign and pay the adoption fee in one visit.'
    : "Once you've signed, we'll send you instructions for paying the adoption fee."

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your adoption agreement for ${name}</title></head>
    <body style="margin: 0; padding: 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 24px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" style="width: 540px; max-width: 100%; background: #ffffff;">
              <tr>
                <td style="padding: 48px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                  <p style="margin: 0 0 32px 0; color: ${COLOR.accent}; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
                    Little Paws Dachshund Rescue
                  </p>

                  <h1 style="margin: 0 0 16px 0; color: ${COLOR.heading}; font-size: 24px; line-height: 1.3;">
                    Your adoption agreement for ${name} is ready
                  </h1>

                  <p style="margin: 0 0 16px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">${greeting}</p>
                  <p style="margin: 0 0 16px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
                    We're so glad ${name} is going home with you. Please review the agreement, including ${name}'s medical details, and sign it when you're ready. ${paymentNote}
                  </p>
                  <p style="margin: 0 0 32px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
                    You'll be asked to sign in with this email address.
                  </p>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                    <tr>
                      <td style="background: ${COLOR.accent};">
                        <a href="${link}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
                          Review and sign
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 8px 0; color: ${COLOR.body}; font-size: 13px; line-height: 1.7;">
                    If something in the agreement looks wrong, reply to this email before signing and we'll correct it.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`
}
