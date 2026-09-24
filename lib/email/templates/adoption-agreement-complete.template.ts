import { COLOR } from 'lib/constants/order-confirmation-constants'
import { escapeHtml } from 'lib/utils/html.utils'

const NEXT_STEPS = [
  ['Transfer the microchip within 30 days', 'Email chips@littlepawsdr.org and the rescue will transfer it to you at no cost.'],
  ['See a vet within 30 days', 'Get settled into a vaccination and health plan with your own veterinarian.'],
  ['Two-week trial period', "If things aren't working out, email applications@littlepawsdr.org within 14 days of adoption."]
]

export function adoptionAgreementCompleteTemplate({
  firstName,
  dogName,
  link
}: {
  firstName: string | null
  dogName: string
  link: string
}) {
  const name = escapeHtml(dogName)
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,'

  const steps = NEXT_STEPS.map(
    ([title, body]) => `
      <tr><td style="padding: 12px 0; border-bottom: 1px solid ${COLOR.border};">
        <p style="margin: 0; color: ${COLOR.heading}; font-size: 14px; font-weight: 700;">${title}</p>
        <p style="margin: 4px 0 0 0; color: ${COLOR.body}; font-size: 13px; line-height: 1.6;">${body}</p>
      </td></tr>`
  ).join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your adoption of ${name} is complete</title></head>
    <body style="margin: 0; padding: 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td align="center" style="padding: 24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" style="width: 540px; max-width: 100%; background: #ffffff;">
            <tr><td style="padding: 48px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
              <p style="margin: 0 0 32px 0; color: ${COLOR.accent}; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Little Paws Dachshund Rescue</p>

              <h1 style="margin: 0 0 16px 0; color: ${COLOR.heading}; font-size: 24px; line-height: 1.3;">Welcome home, ${name}</h1>
              <p style="margin: 0 0 16px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">${greeting}</p>
              <p style="margin: 0 0 32px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
                Your adoption agreement has been signed by Little Paws and is now complete. You can view, print or save it any time from the link below.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 36px;">
                <tr><td style="background: ${COLOR.accent};">
                  <a href="${link}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">View your agreement</a>
                </td></tr>
              </table>

              <p style="margin: 0 0 8px 0; color: ${COLOR.body}; font-size: 9px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Your first steps</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">${steps}</table>

              <p style="margin: 0; color: ${COLOR.body}; font-size: 13px; line-height: 1.7;">Thank you for giving ${name} a home.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`
}
