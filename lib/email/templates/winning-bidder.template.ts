export const auctionWinningBidderTemplate = ({
  url,
  firstName,
  items,
  totalPrice
}: {
  url: string
  firstName: string
  items: { name: string; soldPrice: number }[]
  totalPrice: number
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You won at the Little Paws Auction!</title>
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

    <!-- Winner badge -->
    <div style="margin-bottom: 24px; display: inline-block; padding: 6px 14px; background: #0891b2;">
      <p style="margin: 0; color: #ffffff; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 700;">
        &nbsp;Auction Winner
      </p>
    </div>

    <!-- Main heading -->
    <h1 class="main-heading" style="margin: 0 0 8px 0; color: #09090b; font-size: 36px; font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;">
      You won,<br>${firstName}!
    </h1>

    <!-- Sub heading -->
    <p class="sub-heading" style="margin: 0 0 36px 0; color: #0891b2; font-size: 18px; font-weight: 700; line-height: 1.4;">
      ${items.length === 1 ? 'Your item is ready to claim.' : `${items.length} items are ready to claim.`}
    </p>

    <!-- Body text -->
    <p style="margin: 0 0 36px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      Congratulations — your bid${items.length > 1 ? 's' : ''} came out on top. Every dollar raised goes directly toward the care of our dachshunds. Thank you for making a difference.
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
            $${item.soldPrice.toLocaleString()}
          </td>
        </tr>`
          )
          .join('')}
        <tr>
          <td style="padding: 16px 0 0 0; color: #09090b; font-size: 14px; font-weight: 700;">
            Total due
          </td>
          <td style="padding: 16px 0 0 0; color: #0891b2; font-size: 20px; text-align: right; font-family: 'Courier New', monospace; font-weight: 900;">
            $${totalPrice.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="margin-bottom: 16px;">
      <a href="${url}" class="button" style="display: inline-block; background: #0891b2; color: #ffffff; text-decoration: none; padding: 16px 40px; font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Complete your payment →
      </a>
    </div>
    <p style="margin: 0 0 40px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace;">
      Or copy this link: <a href="${url}" style="color: #0891b2;">${url}</a>
    </p>

    <!-- Divider -->
    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

    <!-- Deadline notice -->
    <div style="margin-bottom: 40px; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-left: 3px solid #0891b2;">
      <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.7;">
        <strong>48-hour payment window</strong><br>
        Please complete your payment within 48 hours to secure your ${items.length === 1 ? 'item' : 'items'}. If payment is not received, ${items.length === 1 ? 'it' : 'they'} may be forfeited to the next bidder.
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
