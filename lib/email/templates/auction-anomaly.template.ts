import { ANOMALY_TYPES, type AnomalyType } from 'lib/utils/end-auction/recordAuctionAnomaly.util'

export const auctionAnomalyTemplate = ({
  auctionId,
  auctionTitle,
  type,
  itemName,
  message
}: {
  auctionId: string
  auctionTitle: string
  type: AnomalyType
  itemName?: string
  message: string
}) => {
  const copy = ANOMALY_TYPES[type]

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:40px 24px;">

    <div style="display:inline-block;padding:6px 14px;background:#dc2626;margin-bottom:20px;">
      <p style="margin:0;color:#ffffff;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;">
        &nbsp;${type.replaceAll('_', ' ')}
      </p>
    </div>

    <h1 style="margin:0 0 6px 0;color:#09090b;font-size:24px;font-weight:900;line-height:1.2;">
      ${copy.title}
    </h1>
    <p style="margin:0 0 24px 0;color:#52525b;font-size:14px;font-family:'Courier New',monospace;">
      ${auctionTitle}${itemName ? ` &middot; ${itemName}` : ''}
    </p>

    <p style="margin:0 0 24px 0;color:#52525b;font-size:15px;line-height:1.7;">
      ${copy.what}
    </p>

    <div style="margin-bottom:24px;padding:16px;background:#f4f4f5;border:1px solid #e4e4e7;border-left:3px solid #dc2626;">
      <p style="margin:0 0 6px 0;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">
        Message
      </p>
      <p style="margin:0;color:#09090b;font-size:14px;line-height:1.6;font-family:'Courier New',monospace;">
        ${message}
      </p>
    </div>

    <div style="margin-bottom:28px;padding:16px;background:#f4f4f5;border:1px solid #e4e4e7;border-left:3px solid #0891b2;">
      <p style="margin:0 0 6px 0;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">
        What to do
      </p>
      <p style="margin:0;color:#09090b;font-size:14px;line-height:1.7;">
        ${copy.fix}
      </p>
    </div>

    <a href="https://www.littlepawsdr.org/admin/auctions/${auctionId}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:14px 32px;font-weight:700;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;">
      Open the auction &rarr;
    </a>

  </div>
</body>
</html>
`
}
