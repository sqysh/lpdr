import { escapeHtml } from 'lib/utils/html.utils'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'

type Props = {
  firstName: string
  itemName: string
  itemImage: string | null
  yourBid: number
  newBid: number
  minimumBid: number
  endsAt: Date | string
  url: string
}

export const auctionOutBidTemplate = ({ firstName, itemName, itemImage, yourBid, newBid, minimumBid, endsAt, url }: Props) => {
  const name = escapeHtml(firstName)
  const item = escapeHtml(itemName)
  const closes = formatDate(endsAt, true)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been outbid on ${item}</title>
  <style>
    @media only screen and (max-width: 480px) {
      .main-heading { font-size: 22px !important; }
      .main-text    { font-size: 14px !important; }
      .button       { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Preheader: the line most inboxes show beside the subject -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    The current bid on ${item} is ${formatMoney(newBid)}. Bid ${formatMoney(minimumBid)} to take the lead.
  </div>

  <div style="max-width: 540px; margin: 0 auto; padding: 56px 24px;">

    <table role="presentation" style="margin-bottom: 40px; border-collapse: collapse;">
      <tr>
        <td style="width: 24px; padding-right: 12px;"><div style="width: 24px; height: 1px; background: #0891b2;"></div></td>
        <td><p style="margin: 0; color: #0891b2; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Little Paws Dachshund Rescue</p></td>
      </tr>
    </table>

    <h1 class="main-heading" style="margin: 0 0 12px 0; color: #09090b; font-size: 26px; font-weight: 900; line-height: 1.2;">
      You've been outbid, ${name}
    </h1>

    <p class="main-text" style="margin: 0 0 28px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      Someone placed a higher bid on <strong style="color: #09090b;">${item}</strong>. There's still time to take the lead.
    </p>

    ${
      itemImage
        ? `<a href="${url}" style="display: block; margin-bottom: 28px;"><img src="${itemImage}" alt="${item}" width="492" style="display: block; width: 100%; max-width: 492px; height: auto; border: 1px solid #e4e4e7;"></a>`
        : ''
    }

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #52525b; font-size: 14px;">Your bid</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #52525b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace; text-decoration: line-through;">${formatMoney(yourBid)}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #09090b; font-size: 14px;">Current bid</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #b91c1c; font-size: 14px; text-align: right; font-family: 'Courier New', monospace; font-weight: 700;">${formatMoney(newBid)}</td>
      </tr>
      <tr>
        <td style="padding: 16px 0 0 0; color: #09090b; font-size: 14px; font-weight: 700;">Minimum next bid</td>
        <td style="padding: 16px 0 0 0; color: #0891b2; font-size: 16px; text-align: right; font-family: 'Courier New', monospace; font-weight: 900;">${formatMoney(minimumBid)}</td>
      </tr>
    </table>

    <div style="margin-bottom: 16px;">
      <a href="${url}" class="button" style="display: inline-block; background: #0891b2; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Bid again
      </a>
    </div>
    <p style="margin: 0 0 36px 0; color: #52525b; font-size: 13px; line-height: 1.6;">
      On the item page, Lightning bid goes $10 over the current bid in one tap.
    </p>

    <div style="margin-bottom: 40px; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-left: 3px solid #0891b2;">
      <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.7;">
        <strong>Bidding closes ${closes}.</strong><br>
        Every bid helps the dogs in our care.
      </p>
    </div>

    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 10px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Questions? We&apos;re here to help.</p>
      <p style="margin: 0;"><a href="mailto:lpdr@littlepawsdr.org" style="color: #0891b2; font-size: 14px;">lpdr@littlepawsdr.org</a></p>
    </div>

    <p style="margin: 24px 0 0 0; font-size: 12px; color: #52525b;">
      <a href="https://www.littlepawsdr.org/privacy-policy" style="color: #52525b; margin-right: 16px;">Privacy Policy</a>
      <a href="https://www.littlepawsdr.org/terms" style="color: #52525b;">Terms of Service</a>
    </p>

  </div>
</body>
</html>
`
}
