import { AgedOutWinner } from 'lib/email/sendUnpaidWinnersAlert'

const money = (n: number) => `$${n.toFixed(2)}`

export const unpaidWinnersTemplate = ({ winners, auctionTitle }: { winners: AgedOutWinner[]; auctionTitle: string }) => {
  const total = winners.reduce((sum, w) => sum + w.owed, 0)

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:40px 24px;">

    <div style="display:inline-block;padding:6px 14px;background:#d97706;margin-bottom:20px;">
      <p style="margin:0;color:#ffffff;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;">
        &nbsp;Unpaid winners
      </p>
    </div>

    <h1 style="margin:0 0 8px 0;color:#09090b;font-size:24px;font-weight:900;line-height:1.2;">
      ${winners.length} winner${winners.length === 1 ? '' : 's'} never paid
    </h1>

    <p style="margin:0 0 28px 0;color:#52525b;font-size:15px;line-height:1.7;">
      These people won items in ${auctionTitle} and have had every reminder we send. Nothing will
      chase them from here, so if the items are going to raise anything they need a person now:
      a direct email, or offering them to the next bidder.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:0 0 8px 0;border-bottom:1px solid #e4e4e7;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">Who</td>
        <td style="padding:0 0 8px 0;border-bottom:1px solid #e4e4e7;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;text-align:right;">Owed</td>
      </tr>
      ${winners
        .map(
          (w) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;color:#09090b;font-size:14px;">
          <a href="mailto:${w.email}" style="color:#0891b2;">${w.email}</a>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;color:#09090b;font-size:14px;text-align:right;font-family:'Courier New',monospace;font-weight:700;">${money(w.owed)}</td>
      </tr>`
        )
        .join('')}
      <tr>
        <td style="padding:14px 0 0 0;color:#09090b;font-size:14px;font-weight:700;">Uncollected</td>
        <td style="padding:14px 0 0 0;color:#d97706;font-size:20px;text-align:right;font-family:'Courier New',monospace;font-weight:900;">${money(total)}</td>
      </tr>
    </table>

    <a href="https://www.littlepawsdr.org/admin/auctions" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:14px 32px;font-weight:700;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;">
      Open auctions &rarr;
    </a>

  </div>
</body>
</html>
`
}
