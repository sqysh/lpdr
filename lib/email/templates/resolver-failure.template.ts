export const resolverFailureTemplate = ({
  auctionId,
  auctionTitle,
  message
}: {
  auctionId: string
  auctionTitle: string
  message: string
}) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:40px 24px;">

    <div style="display:inline-block;padding:6px 14px;background:#dc2626;margin-bottom:20px;">
      <p style="margin:0;color:#ffffff;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;">
        &nbsp;Auction did not resolve
      </p>
    </div>

    <h1 style="margin:0 0 8px 0;color:#09090b;font-size:24px;font-weight:900;line-height:1.2;">
      ${auctionTitle}
    </h1>

    <p style="margin:0 0 24px 0;color:#52525b;font-size:15px;line-height:1.7;">
      The auction has ended but winners were not resolved, so no payment requests have gone out and
      nothing has been charged. The job will try again at the top of the next hour, but it will hit
      the same problem unless something changes.
    </p>

    <div style="margin-bottom:24px;padding:16px;background:#f4f4f5;border:1px solid #e4e4e7;border-left:3px solid #dc2626;">
      <p style="margin:0 0 6px 0;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">
        What went wrong
      </p>
      <p style="margin:0;color:#09090b;font-size:14px;line-height:1.6;font-family:'Courier New',monospace;">
        ${message}
      </p>
    </div>

    <p style="margin:0 0 6px 0;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">
      Auction id
    </p>
    <p style="margin:0 0 28px 0;color:#09090b;font-size:13px;font-family:'Courier New',monospace;">
      ${auctionId}
    </p>

    <a href="https://www.littlepawsdr.org/admin/auctions/${auctionId}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:14px 32px;font-weight:700;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;">
      Open the auction &rarr;
    </a>

  </div>
</body>
</html>
`
