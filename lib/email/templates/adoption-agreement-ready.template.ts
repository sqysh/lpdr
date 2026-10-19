import { COLOR } from 'lib/constants/order-confirmation-constants'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import { escapeHtml } from 'lib/utils/html.utils'

type Props = {
  firstName: string | null
  dogName: string
  link: string
}

const TEXT = `margin: 0 0 16px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;`
const LIST = `margin: 0 0 24px 0; padding-left: 20px; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;`
const SUBHEAD = `margin: 0 0 8px 0; color: ${COLOR.heading}; font-size: 15px; font-weight: 700;`

// Read from the same list the signing page uses, so the email and the site can't name different accounts
const offlinePayments = Object.values(OFFLINE_PAYMENT_INSTRUCTIONS)
  .map(({ label, instruction }) => {
    const note = label === 'PayPal' ? ' (please choose "Send to a friend" if you can, to avoid fees)' : ''
    return `<li>${escapeHtml(instruction)}${note}</li>`
  })
  .join('')

export function adoptionAgreementReadyTemplate({ firstName, dogName, link }: Props): string {
  const name = escapeHtml(dogName)
  const greeting = firstName ? `Dear ${escapeHtml(firstName)},` : 'Hello,'

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

                  <p style="${TEXT}">${greeting}</p>
                  <p style="${TEXT}">Thank you for adopting from Little Paws Dachshund Rescue! Your adoption agreement is ready to review and sign online.</p>
                  <p style="margin: 0 0 24px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">You'll be asked to sign in with this email address.</p>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                    <tr>
                      <td style="background: ${COLOR.accent};">
                        <a href="${link}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">
                          Review and sign
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="${SUBHEAD}">What to do</p>
                  <ul style="${LIST}">
                    <li>Read through the entire agreement and sign where indicated.</li>
                    <li>Everything is done online, so there's nothing to print or scan.</li>
                  </ul>

                  <p style="${SUBHEAD}">Adoption fee</p>
                  <p style="margin: 0 0 8px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">You'll choose how to pay when you sign. You can pay by card on the spot, or use one of these:</p>
                  <ul style="${LIST}">${offlinePayments}</ul>
                  <p style="margin: 0 0 24px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">Your receipt serves as confirmation of your payment.</p>

                  <p style="${SUBHEAD}">Microchip reminder</p>
                  <p style="margin: 0 0 24px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">Please remember to transfer the microchip registration to your name within thirty (30) days, as outlined in term 4 of the agreement.</p>

                  <p style="${SUBHEAD}">Welcome home!</p>
                  <p style="${TEXT}">We are thrilled ${name} has found a forever family. Once we receive both your signed agreement and payment, we'll sign on our end and send you the finalized agreement to complete the process.</p>
                  <p style="margin: 0 0 32px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">And of course, we love pupdates! Feel free to share photos of ${name} settling into their new home anytime.</p>

                  <p style="margin: 0 0 32px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
                    Isabell Ventouris<br />
                    Little Paws Dachshund Rescue
                  </p>

                  <p style="margin: 0; color: ${COLOR.body}; font-size: 13px; line-height: 1.7;">
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
