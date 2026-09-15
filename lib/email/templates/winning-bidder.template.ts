const money = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

/** First notice announces the win. Reminders lead with the fact that payment is outstanding. */
const copyFor = (reminderNumber: number, firstName: string, itemCount: number) => {
  const them = itemCount === 1 ? 'it' : 'them'
  const item = itemCount === 1 ? 'item' : 'items'

  if (reminderNumber === 0) {
    return {
      badge: 'Auction Winner',
      heading: `You won,<br>${firstName}!`,
      sub: itemCount === 1 ? 'Your item is ready to claim.' : `${itemCount} items are ready to claim.`,
      body: `Congratulations, your bid${itemCount > 1 ? 's' : ''} came out on top. Every dollar raised goes directly toward the care of our dachshunds. Thank you for making a difference.`,
      noticeTitle: 'Payment keeps your items reserved',
      noticeBody: `Please complete your payment so we can get ${them} packed up and on the way to you. We will send a reminder if we have not heard from you.`
    }
  }

  if (reminderNumber === 1) {
    return {
      badge: 'Payment Due',
      heading: `A quick reminder,<br>${firstName}`,
      sub: `Your ${item} ${itemCount === 1 ? 'is' : 'are'} still waiting.`,
      body: `You won at the auction and we have not received payment yet. If you have already paid, thank you, and please ignore this. Otherwise the link below picks up where you left off.`,
      noticeTitle: 'Need a hand?',
      noticeBody: `If something is not working, or you need to arrange payment another way, reply to this email and we will sort it out with you.`
    }
  }

  return {
    badge: 'Payment Outstanding',
    heading: `Still waiting to hear<br>from you, ${firstName}`,
    sub: `Your ${item} ${itemCount === 1 ? 'has' : 'have'} not been paid for.`,
    body: `We have sent a few messages about the ${item} you won. We would rather hear from you than chase you, so if there is a problem, just reply to this email and we will work it out.`,
    noticeTitle: 'Please get in touch',
    noticeBody: `If we do not hear from you, we may offer ${them} to the next bidder so the ${item} can still raise money for the dogs.`
  }
}

export const auctionWinningBidderTemplate = ({
  url,
  firstName,
  items,
  itemsTotal,
  shipping,
  totalPrice,
  reminderNumber = 0
}: {
  url: string
  firstName: string
  items: { name: string; soldPrice: number }[]
  itemsTotal: number
  shipping: number
  totalPrice: number
  reminderNumber?: number
}) => {
  const copy = copyFor(reminderNumber, firstName, items.length)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reminderNumber === 0 ? 'You won at the Little Paws Auction!' : 'Your Little Paws auction items'}</title>
  <style>
    @media only screen and (max-width: 480px) {
      .main-heading { font-size: 28px !important; }
      .sub-heading  { font-size: 16px !important; }
      .button       { padding: 14px 28px !important; font-size: 11px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 540px; margin: 0 auto; padding: 56px 24px;">

    <!-- Header label (table-based for email client compatibility) -->
    <table role="presentation" style="margin-bottom: 48px; border-collapse: collapse;">
      <tr>
        <td style="width: 24px; padding-right: 12px;">
          <div style="width: 24px; height: 1px; background: #0891b2;"></div>
        </td>
        <td>
          <p style="margin: 0; color: #0891b2; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
            Little Paws Dachshund Rescue
          </p>
        </td>
      </tr>
    </table>

    <!-- Badge -->
    <div style="margin-bottom: 24px; display: inline-block; padding: 6px 14px; background: #0891b2;">
      <p style="margin: 0; color: #ffffff; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 700;">
        &nbsp;${copy.badge}
      </p>
    </div>

    <!-- Main heading -->
    <h1 class="main-heading" style="margin: 0 0 8px 0; color: #09090b; font-size: 36px; font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;">
      ${copy.heading}
    </h1>

    <!-- Sub heading -->
    <p class="sub-heading" style="margin: 0 0 36px 0; color: #0891b2; font-size: 18px; font-weight: 700; line-height: 1.4;">
      ${copy.sub}
    </p>

    <!-- Body text -->
    <p style="margin: 0 0 36px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      ${copy.body}
    </p>

    <!-- Won items -->
    <div style="margin-bottom: 36px;">
      <p style="margin: 0 0 12px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Your winning ${items.length === 1 ? 'item' : 'items'}
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        ${items
          .map(
            (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #09090b; font-size: 14px;">
            ${item.name}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #09090b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace; font-weight: 700;">
            ${money(item.soldPrice)}
          </td>
        </tr>`
          )
          .join('')}
        <tr>
          <td style="padding: 16px 0 4px 0; color: #52525b; font-size: 14px;">
            Items
          </td>
          <td style="padding: 16px 0 4px 0; color: #09090b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace;">
            ${money(itemsTotal)}
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 12px 0; color: #52525b; font-size: 14px; border-bottom: 1px solid #e4e4e7;">
            Shipping
          </td>
          <td style="padding: 0 0 12px 0; color: #09090b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace; border-bottom: 1px solid #e4e4e7;">
            ${shipping > 0 ? money(shipping) : 'None'}
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 0 0 0; color: #09090b; font-size: 14px; font-weight: 700;">
            Total due
          </td>
          <td style="padding: 14px 0 0 0; color: #0891b2; font-size: 20px; text-align: right; font-family: 'Courier New', monospace; font-weight: 900;">
            ${money(totalPrice)}
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="margin-bottom: 16px;">
      <a href="${url}" class="button" style="display: inline-block; background: #0891b2; color: #ffffff; text-decoration: none; padding: 16px 40px; font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Complete your payment &rarr;
      </a>
    </div>
    <p style="margin: 0 0 40px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace;">
      Or copy this link: <a href="${url}" style="color: #0891b2;">${url}</a>
    </p>

    <!-- Divider -->
    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

    <!-- Notice -->
    <div style="margin-bottom: 40px; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-left: 3px solid #0891b2;">
      <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.7;">
        <strong>${copy.noticeTitle}</strong><br>
        ${copy.noticeBody}
      </p>
    </div>

    <!-- Divider -->
    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

    <!-- Footer -->
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 10px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Questions? We&apos;re here to help.
      </p>
      <p style="margin: 0 0 6px 0;">
        <a href="mailto:lpdr@littlepawsdr.org" style="color: #0891b2; font-size: 14px;">
          lpdr@littlepawsdr.org
        </a>
      </p>
    </div>

    <!-- Legal -->
    <div style="margin-top: 24px;">
      <p style="margin: 0; font-size: 12px; color: #52525b;">
        <a href="https://www.littlepawsdr.org/privacy-policy" style="color: #52525b; margin-right: 16px;">Privacy Policy</a>
        <a href="https://www.littlepawsdr.org/terms" style="color: #52525b;">Terms of Service</a>
      </p>
    </div>

    <!-- Bottom label (table-based for email client compatibility) -->
    <table role="presentation" style="margin-top: 40px; border-collapse: collapse;">
      <tr>
        <td style="width: 24px; padding-right: 12px;">
          <div style="width: 24px; height: 1px; background: #e4e4e7;"></div>
        </td>
        <td>
          <p style="margin: 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
            Little Paws Dachshund Rescue
          </p>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>
`
}
