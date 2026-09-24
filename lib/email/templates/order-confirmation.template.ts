import { Order, OrderItem, OrderType, Prisma } from '@prisma/client'
import { COLOR, ORDER_TYPE_EMAIL_CONFIG } from 'lib/constants/order-confirmation-constants'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { escapeHtml } from 'lib/utils/html.utils'

type OrderWithItems = Order & {
  items: OrderItem[]
  adoptionAgreement?: {
    id: string
    dogName: string
    adoptionFee: Prisma.Decimal | number
    healthCertificateFee: Prisma.Decimal | number | null
    additionalDonation: Prisma.Decimal | number | null
  } | null
}

const SITE = 'https://www.littlepawsdr.org'

export function getOrderEmailSubject(order: OrderWithItems): string {
  const freq = order.recurringFrequency === 'YEARLY' ? 'Annual' : 'Monthly'
  const subjects: Record<OrderType, string> = {
    ONE_TIME_DONATION: 'Thank You for Supporting Little Paws!',
    RECURRING_DONATION: `Your ${freq} Gift to Little Paws is Active`,
    ADOPTION_FEE: 'Your Adoption Fee Payment is Received',
    ADOPTION_AGREEMENT: 'Your Adoption Payment is Received',
    PURCHASE: 'Your Little Paws Order is Confirmed',
    ECARD: 'Your Little Paws Ecard is Confirmed',
    AUCTION_PURCHASE: 'Your Auction Payment is Confirmed. Thank You!'
  }
  return subjects[order.type]
}

// Uses <th scope="row"> for the label so screen readers announce
// "Label: Value" correctly instead of reading two unrelated cells.
const row = (label: string, value: string) => `
  <tr>
    <th scope="row" style="padding: 12px 0; border-bottom: 1px solid ${COLOR.border}; color: ${COLOR.body}; font-size: 13px; width: 160px; font-weight: 400; text-align: left;">${label}</th>
    <td style="padding: 12px 0; border-bottom: 1px solid ${COLOR.border}; color: ${COLOR.heading}; font-size: 14px; font-weight: 700; text-align: right; font-family: 'Courier New', monospace;">${value}</td>
  </tr>`

const accentRow = (label: string, value: string) => `
  <tr>
    <th scope="row" style="padding: 16px 0 0 0; color: ${COLOR.heading}; font-size: 14px; font-weight: 700; text-align: left;">${label}</th>
    <td style="padding: 16px 0 0 0; color: ${COLOR.accent}; font-size: 16px; text-align: right; font-family: 'Courier New', monospace; font-weight: 900;">${value}</td>
  </tr>`

const noticeBlock = (heading: string, body: string) => `
  <div style="margin-bottom: 24px; padding: 16px; background: ${COLOR.bgMuted}; border: 1px solid ${COLOR.border}; border-left: 3px solid ${COLOR.accent};">
    <p style="margin: 0; color: ${COLOR.body}; font-size: 13px; line-height: 1.7;">
      <strong style="color: ${COLOR.heading};">${heading}</strong><br>${body}
    </p>
  </div>`

const link = (href: string, label: string) =>
  `<a href="${href}" style="color: ${COLOR.accent}; text-decoration: underline; font-weight: 500;">${label}</a>`

const sectionLabel = (label: string) => `
  <p style="margin: 0 0 12px 0; color: ${COLOR.body}; font-size: 9px; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.2em; text-transform: uppercase;">
    ${label}
  </p>`

function buildDetailRows(order: OrderWithItems): string[] {
  const rows: string[] = []

  const total = Number(order.totalAmount)
  const shipping = Number(order.shipping ?? 0)
  const feesCovered = order.coverFees ? Number(order.feesCovered ?? 0) : 0
  // Orders created before subtotal was recorded have 0 stored, so it is derived from what was
  const subtotal = Number(order.subtotal) > 0 ? Number(order.subtotal) : total - feesCovered - shipping
  const frequency = order.isRecurring ? (order.recurringFrequency === 'YEARLY' ? 'Annual' : 'Monthly') : null

  const adoption = order.type === 'ADOPTION_AGREEMENT' ? order.adoptionAgreement : null

  // What they gave or bought
  if (adoption) {
    rows.push(row('Adopting', escapeHtml(adoption.dogName)))
    rows.push(row('Adoption fee', formatMoney(Number(adoption.adoptionFee))))
    if (Number(adoption.healthCertificateFee ?? 0) > 0)
      rows.push(row('Health certificate', formatMoney(Number(adoption.healthCertificateFee))))
    if (Number(adoption.additionalDonation ?? 0) > 0)
      rows.push(row('Additional donation', formatMoney(Number(adoption.additionalDonation))))
  } else if (order.items.length > 0) {
    for (const item of order.items) {
      const label = escapeHtml(item.itemName ?? 'Item') + ((item.quantity ?? 1) > 1 ? ` &times; ${item.quantity}` : '')
      rows.push(row(label, formatMoney(Number(item.price) * (item.quantity ?? 1))))
    }
  } else {
    rows.push(row(frequency ? `${frequency} gift` : 'Donation', formatMoney(subtotal)))
  }

  // What was added to it
  if (shipping > 0) rows.push(row('Shipping', formatMoney(shipping)))
  if (feesCovered > 0) rows.push(row('Processing fees covered', formatMoney(feesCovered)))

  // What was charged
  rows.push(accentRow(frequency ? 'Charged today' : 'Total', formatMoney(total)))

  // How it repeats
  if (frequency) {
    rows.push(row('Frequency', frequency))
    if (order.nextBillingDate) rows.push(row('Next charge', formatDate(order.nextBillingDate)))
    if (order.recurringFrequency === 'MONTHLY') rows.push(row('Annual total', formatMoney(total * 12)))
  }

  rows.push(row('Date', formatDate(order.createdAt, true)))
  rows.push(row('Confirmation ID', order.id))

  return rows
}

function buildNotices(order: OrderWithItems): string[] {
  const notices: string[] = []

  if (order.isRecurring) {
    notices.push(
      noticeBlock('Need to cancel?', `You can cancel your recurring donation anytime from ${link(`${SITE}/my-pack`, 'My Pack')}.`)
    )
  }

  if (order.autoPaid) {
    notices.push(
      noticeBlock(
        'Paid automatically',
        `This was charged to your saved card because auto-pay is on for your account. You can turn it off any time in ${link(`${SITE}/my-pack`, 'My Pack')}.`
      )
    )
  }

  if (order.type === 'ADOPTION_FEE' || order.type === 'ONE_TIME_DONATION' || order.type === 'RECURRING_DONATION') {
    notices.push(
      noticeBlock(
        'Tax information',
        'Little Paws Dachshund Rescue is a 501(c)(3) nonprofit organization. Your donation is tax-deductible to the extent allowed by law.'
      )
    )
  }

  if (order.type === 'ADOPTION_AGREEMENT' && order.adoptionAgreement) {
    notices.push(
      noticeBlock(
        'Your agreement',
        `You can view or print your signed agreement any time from ${link(`${SITE}/adopt/agreement/${order.adoptionAgreement.id}`, 'this link')}.`
      )
    )

    if (Number(order.adoptionAgreement.additionalDonation ?? 0) > 0) {
      notices.push(
        noticeBlock(
          'Tax information',
          'Little Paws Dachshund Rescue is a 501(c)(3) nonprofit organization. Your additional donation is tax-deductible to the extent allowed by law.'
        )
      )
    }
  }

  return notices
}

export function orderConfirmationTemplate(order: OrderWithItems): string {
  const copy = ORDER_TYPE_EMAIL_CONFIG[order.type]
  const firstName = escapeHtml(order.customerName.split(' ')[0] ?? '')
  const detailRows = buildDetailRows(order)
  const notices = buildNotices(order)

  const messageBlock = order.donorMessage
    ? `
    <div style="margin-bottom: 36px;">
      ${sectionLabel('Your message')}
      <div style="padding: 16px; background: ${COLOR.bgMuted}; border: 1px solid ${COLOR.border}; border-left: 3px solid ${COLOR.accent};">
        <p style="margin: 0; color: ${COLOR.heading}; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(order.donorMessage)}</p>
      </div>
    </div>`
    : ''

  const shippingBlock =
    order.items.some((i) => i.isPhysical) && order.addressLine1
      ? `
    <div style="margin-bottom: 36px;">
      ${sectionLabel('Ships to')}
      <div style="padding: 16px; background: ${COLOR.bgMuted}; border: 1px solid ${COLOR.border};">
        <p style="margin: 0; color: ${COLOR.heading}; font-size: 14px; line-height: 1.8;">
          ${escapeHtml(order.addressLine1)}${order.addressLine2 ? `, ${escapeHtml(order.addressLine2)}` : ''}<br>
          ${escapeHtml(order.city ?? '')}, ${escapeHtml(order.state ?? '')} ${escapeHtml(order.zipPostalCode ?? '')}
        </p>
      </div>
    </div>`
      : ''

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>${getOrderEmailSubject(order)}</title>
      <!--[if mso]>
      <style type="text/css">
        body, table, td, p, a { font-family: Arial, sans-serif !important; }
      </style>
      <![endif]-->
      <style type="text/css">
        body { margin: 0; padding: 0; width: 100% !important; }
        img { border: 0; outline: none; text-decoration: none; }
        table { border-collapse: collapse; }
        a { color: ${COLOR.accent}; }

        @media only screen and (max-width: 480px) {
          .wrap        { width: 100% !important; }
          .pad         { padding-left: 20px !important; padding-right: 20px !important; }
          .main-heading { font-size: 22px !important; }
          .main-text    { font-size: 14px !important; }
          .row-label    { width: 55% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0;">
      <!-- Preheader: shows in the inbox preview, hidden in the body -->
      <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
        ${copy.body}
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 24px 12px;">

            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" align="center"><tr><td>
            <![endif]-->

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" class="wrap" style="width: 540px; max-width: 540px; background: #ffffff;">
              <tr>
                <td class="pad" style="padding: 48px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

                  <!-- Header label -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 40px;">
                    <tr>
                      <td width="24" style="padding-right: 12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="24">
                          <tr><td height="1" style="height: 1px; line-height: 1px; font-size: 0; background: ${COLOR.accent};">&nbsp;</td></tr>
                        </table>
                      </td>
                      <td style="color: ${COLOR.accent}; font-size: 10px; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.2em; text-transform: uppercase;">
                        Little Paws Dachshund Rescue
                      </td>
                    </tr>
                  </table>

                  <!-- Heading -->
                  <h1 class="main-heading" style="margin: 0 0 12px 0; color: ${COLOR.heading}; font-size: 26px; font-weight: bold; line-height: 1.2;">
                    ${firstName ? copy.heading.replace('!', `, ${firstName}!`) : copy.heading}
                  </h1>

                  <!-- Body -->
                  <p class="main-text" style="margin: 0 0 32px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
                    ${copy.body}
                  </p>

                  <!-- Details -->
                  ${sectionLabel('Order details')}
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; margin-bottom: 32px;">
                    ${detailRows.join('')}
                  </table>

                  ${messageBlock}
                  ${shippingBlock}

                  <!-- Divider -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 32px 0;">
                    <tr><td height="1" style="height: 1px; line-height: 1px; font-size: 0; background: ${COLOR.border};">&nbsp;</td></tr>
                  </table>

                  ${notices.join('')}

                  <!-- Footer -->
                  ${sectionLabel('Questions? We&apos;re here to help.')}
                  <p style="margin: 0 0 24px 0;">
                    <a href="mailto:lpdr@littlepawsdr.org" style="color: ${COLOR.accent}; text-decoration: underline; font-size: 13px;">lpdr@littlepawsdr.org</a>
                  </p>

                  <!-- Legal -->
                  <p style="margin: 0 0 40px 0; font-size: 11px; color: ${COLOR.footer};">
                    <a href="${SITE}/privacy-policy" style="color: ${COLOR.footer}; text-decoration: underline;">Privacy Policy</a>
                    &nbsp;&nbsp;
                    <a href="${SITE}/terms" style="color: ${COLOR.footer}; text-decoration: underline;">Terms of Service</a>
                  </p>

                  <!-- Bottom label -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="24" style="padding-right: 12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="24">
                          <tr><td height="1" style="height: 1px; line-height: 1px; font-size: 0; background: ${COLOR.border};">&nbsp;</td></tr>
                        </table>
                      </td>
                      <td style="color: ${COLOR.footer}; font-size: 10px; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.2em; text-transform: uppercase;">
                        Little Paws Dachshund Rescue
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>

            <!--[if mso]>
            </td></tr></table>
            <![endif]-->

          </td>
        </tr>
      </table>
    </body>
  </html>`
}
