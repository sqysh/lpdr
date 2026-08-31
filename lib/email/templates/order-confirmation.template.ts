import { Order, OrderItem, OrderType } from '@prisma/client'

type OrderWithItems = Order & { items: OrderItem[] }

// ─── Copy per order type ──────────────────────────────────────────────────────

const ORDER_COPY: Record<OrderType, { heading: string; body: string }> = {
  ONE_TIME_DONATION: {
    heading: 'Thank you for your donation!',
    body: 'Your one-time donation has been received. Every dollar goes directly toward the dogs in our care.'
  },
  RECURRING_DONATION: {
    heading: 'Your recurring gift is active!',
    body: "Your recurring donation has been set up successfully. Your ongoing support means the world to the dogs in our care — you'll be charged automatically until you choose to cancel."
  },
  ADOPTION_FEE: {
    heading: 'Your adoption fee is received!',
    body: "We've received your adoption fee payment. Our team will be in touch shortly with next steps."
  },
  PURCHASE: {
    heading: 'Your order is confirmed!',
    body: "Thank you for your purchase. You're helping support Little Paws with every order."
  },
  ECARD: {
    heading: 'Your ecard is on its way!',
    body: 'Thank you for your ecard purchase. Your recipient will receive it at the scheduled time.'
  },
  AUCTION_PURCHASE: {
    heading: 'Your auction payment is confirmed!',
    body: 'Thank you for your purchase. Your payment has been received and your item will be on its way soon.'
  }
}

// ─── Subject lines ────────────────────────────────────────────────────────────

export function getOrderEmailSubject(order: OrderWithItems): string {
  const freq = order.recurringFrequency === 'YEARLY' ? 'Annual' : 'Monthly'
  const subjects: Record<OrderType, string> = {
    ONE_TIME_DONATION: 'Thank You for Supporting Little Paws!',
    RECURRING_DONATION: `Your ${freq} Gift to Little Paws is Active`,
    ADOPTION_FEE: 'Your Adoption Fee Payment is Received',
    PURCHASE: 'Your Little Paws Order is Confirmed',
    ECARD: 'Your Little Paws Ecard is Confirmed',
    AUCTION_PURCHASE: 'Your Auction Payment is Confirmed — Thank You!'
  }
  return subjects[order.type]
}

// ─── Colors (WCAG AA compliant against white/light backgrounds) ───────────────

const COLOR = {
  heading: '#09090b',
  body: '#3f3f46',
  accent: '#155e75',
  footer: '#52525b',
  border: '#d4d4d8',
  bgMuted: '#f4f4f5'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: number | string) => `$${Number(amount).toFixed(2)}`

const fmtDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

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

// ─── Template ─────────────────────────────────────────────────────────────────

export function orderConfirmationTemplate(order: OrderWithItems): string {
  const copy = ORDER_COPY[order.type]
  const hasItems = order.items.length > 0
  const firstName = order.customerName.split(' ')[0]

  // ── Details table rows ──────────────────────────────────
  const detailRows: string[] = []

  if (hasItems) {
    const itemRows = order.items
      .map((item) => row(item.itemName ?? 'Item', fmt(Number(item.price) * (item.quantity ?? 1))))
      .join('')

    detailRows.push(itemRows)
    detailRows.push(accentRow('Total', fmt(Number(order.totalAmount))))
  } else {
    detailRows.push(accentRow('Amount', fmt(Number(order.totalAmount))))
  }

  if (order.coverFees) {
    detailRows.push(row('Processing fee covered', fmt(Number(order.feesCovered))))
  }

  if (order.isRecurring && order.recurringFrequency) {
    const freq = order.recurringFrequency === 'YEARLY' ? 'Annual' : 'Monthly'
    detailRows.push(row('Frequency', freq))
    if (order.nextBillingDate) {
      detailRows.push(row('Next charge', fmtDate(order.nextBillingDate)))
    }
    if (order.recurringFrequency === 'YEARLY') {
      detailRows.push(row('Annual contribution', fmt(Number(order.totalAmount) * 12)))
    }
  }

  detailRows.push(row('Date', fmtDate(order.createdAt)))
  detailRows.push(row('Confirmation ID', order.id))

  // ── Shipping address ────────────────────────────────────
  const shippingBlock =
    order.isPhysical && order.addressLine1
      ? `
    <div style="margin-bottom: 36px;">
      <p style="margin: 0 0 12px 0; color: ${COLOR.body}; font-size: 9px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Ships to
      </p>
      <div style="padding: 16px; background: ${COLOR.bgMuted}; border: 1px solid ${COLOR.border};">
        <p style="margin: 0; color: ${COLOR.heading}; font-size: 14px; line-height: 1.8;">
          ${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ''}<br>
          ${order.city}, ${order.state} ${order.zipPostalCode}
        </p>
      </div>
    </div>`
      : ''

  // ── Notice blocks ───────────────────────────────────────
  const notices: string[] = []

  if (order.isRecurring) {
    notices.push(
      noticeBlock(
        'Need to cancel?',
        `You can cancel your recurring donation at any time by contacting us at <a href="mailto:lpdr@littlepawsdr.org" style="color: ${COLOR.accent}; text-decoration: underline; font-weight: 500;">lpdr@littlepawsdr.org</a>`
      )
    )
  }

  if (
    order.type === 'ADOPTION_FEE' ||
    order.type === 'ONE_TIME_DONATION' ||
    order.type === 'RECURRING_DONATION'
  ) {
    notices.push(
      noticeBlock(
        'Tax information',
        'Little Paws Dachshund Rescue is a 501(c)(3) nonprofit organization. Your donation is tax-deductible to the extent allowed by law.'
      )
    )
  }

  // ── Full template ───────────────────────────────────────
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getOrderEmailSubject(order)}</title>
  <style>
    @media only screen and (max-width: 480px) {
      .main-heading { font-size: 22px !important; }
      .main-text    { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 540px; margin: 0 auto; padding: 56px 24px;">

    <!-- Header label -->
    <div style="margin-bottom: 48px; display: flex; align-items: center; gap: 12px;">
      <div aria-hidden="true" style="width: 24px; height: 1px; background: ${COLOR.accent};"></div>
      <p style="margin: 0; color: ${COLOR.accent}; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Little Paws Dachshund Rescue
      </p>
    </div>

    <!-- Heading -->
    <h1 class="main-heading" style="margin: 0 0 12px 0; color: ${COLOR.heading}; font-size: 26px; font-weight: 900; line-height: 1.2;">
      ${copy.heading.replace('!', `, ${firstName}!`)}
    </h1>

    <!-- Body -->
    <p class="main-text" style="margin: 0 0 36px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
      ${copy.body}
    </p>

    <!-- Details table -->
    <div style="margin-bottom: 36px;">
      <p style="margin: 0 0 12px 0; color: ${COLOR.body}; font-size: 9px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Order details
      </p>
      <table role="table" aria-label="Order details" style="width: 100%; border-collapse: collapse;">
        ${detailRows.join('')}
      </table>
    </div>

    ${shippingBlock}

    <!-- Divider -->
    <div aria-hidden="true" style="margin: 40px 0; height: 1px; background: ${COLOR.border};"></div>

    ${notices.join('')}

    <!-- Footer -->
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 10px 0; color: ${COLOR.body}; font-size: 9px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Questions? We&apos;re here to help.
      </p>
      <p style="margin: 0 0 6px 0;">
        <a href="mailto:lpdr@littlepawsdr.org" style="color: ${COLOR.accent}; text-decoration: underline; font-size: 13px;">
          lpdr@littlepawsdr.org
        </a>
      </p>
    </div>

    <!-- Legal -->
    <div style="margin-top: 24px;">
      <p style="margin: 0; font-size: 11px; color: ${COLOR.footer};">
        <a href="https://www.littlepawsdr.org/privacy-policy" style="color: ${COLOR.footer}; text-decoration: underline; margin-right: 16px;">Privacy Policy</a>
        <a href="https://www.littlepawsdr.org/terms" style="color: ${COLOR.footer}; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>

    <!-- Bottom label -->
    <div style="margin-top: 40px; display: flex; align-items: center; gap: 12px;">
      <div aria-hidden="true" style="width: 24px; height: 1px; background: ${COLOR.border};"></div>
      <p style="margin: 0; color: ${COLOR.footer}; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Little Paws Dachshund Rescue
      </p>
    </div>

  </div>
</body>
</html>`
}
