import { COLOR } from 'lib/constants/order-confirmation-constants'
import { escapeHtml } from 'lib/utils/html.utils'
import { formatMoney } from 'lib/utils/currency.utils'

type Props = {
  firstName: string | null
  dogName: string
  total: number
  methodLabel: string
  instruction: string
  link: string
}

export function adoptionAgreementPaymentTemplate({ firstName, dogName, total, methodLabel, instruction, link }: Props) {
  const name = escapeHtml(dogName)
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>How to pay for ${name}'s adoption</title></head>
    <body style="margin: 0; padding: 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td align="center" style="padding: 24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" style="width: 540px; max-width: 100%; background: #ffffff;">
            <tr><td style="padding: 48px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
              <p style="margin: 0 0 32px 0; color: ${COLOR.accent}; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Little Paws Dachshund Rescue</p>

              <h1 style="margin: 0 0 16px 0; color: ${COLOR.heading}; font-size: 24px; line-height: 1.3;">One last step: payment</h1>
              <p style="margin: 0 0 16px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">${greeting}</p>
              <p style="margin: 0 0 28px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
                Thank you for signing the adoption agreement for ${name}. To finish the adoption, please send the amount below by ${escapeHtml(methodLabel)}.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 28px; background: ${COLOR.bgMuted}; border: 1px solid ${COLOR.border}; border-left: 3px solid ${COLOR.accent};">
                <tr><td style="padding: 20px;">
                  <p style="margin: 0 0 4px 0; color: ${COLOR.body}; font-size: 9px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Amount due</p>
                  <p style="margin: 0 0 16px 0; color: ${COLOR.accent}; font-size: 28px; font-weight: 900; font-family: 'Courier New', monospace;">${formatMoney(total)}</p>
                  <p style="margin: 0; color: ${COLOR.heading}; font-size: 15px; font-weight: 700; line-height: 1.6;">${escapeHtml(instruction)}</p>
                </td></tr>
              </table>

              <p style="margin: 0 0 28px 0; color: ${COLOR.body}; font-size: 14px; line-height: 1.7;">
                Please include <strong style="color: ${COLOR.heading};">${name}</strong> in the payment note so we can match it to your adoption. We'll email you as soon as it arrives.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr><td style="background: ${COLOR.accent};">
                  <a href="${link}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">View your agreement</a>
                </td></tr>
              </table>

              <p style="margin: 0; color: ${COLOR.body}; font-size: 13px; line-height: 1.7;">Questions? Just reply to this email.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`
}
