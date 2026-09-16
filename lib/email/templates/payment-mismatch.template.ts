const money = (n: number) => `$${n.toFixed(2)}`

export const paymentMismatchTemplate = ({
  payments
}: {
  payments: { paymentIntentId: string; amount: number; email: string; orderType: string; createdAt: string }[]
}) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:40px 24px;">

    <div style="display:inline-block;padding:6px 14px;background:#dc2626;margin-bottom:20px;">
      <p style="margin:0;color:#ffffff;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;">
        &nbsp;Payments without orders
      </p>
    </div>

    <h1 style="margin:0 0 8px 0;color:#09090b;font-size:24px;font-weight:900;line-height:1.2;">
      ${payments.length} payment${payments.length === 1 ? '' : 's'} succeeded with no order
    </h1>

    <p style="margin:0 0 28px 0;color:#52525b;font-size:15px;line-height:1.7;">
      These charges went through in Stripe but no order exists for them, which usually means the
      webhook did not reach the site. Resend the events from the Stripe dashboard and the orders
      will be created. If they do not appear, the endpoint itself needs looking at.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr>
        ${['When', 'Who', 'Type', 'Amount']
          .map(
            (h) =>
              `<td style="padding:0 0 8px 0;border-bottom:1px solid #e4e4e7;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">${h}</td>`
          )
          .join('')}
      </tr>
      ${payments
        .map(
          (p) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;color:#52525b;font-size:13px;">${new Date(p.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;color:#09090b;font-size:13px;">${p.email}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;color:#52525b;font-size:13px;">${p.orderType.replaceAll('_', ' ').toLowerCase()}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;color:#09090b;font-size:13px;text-align:right;font-family:'Courier New',monospace;font-weight:700;">${money(p.amount)}</td>
      </tr>
      <tr>
        <td colspan="4" style="padding:0 0 8px 0;color:#a1a1aa;font-size:11px;font-family:'Courier New',monospace;">${p.paymentIntentId}</td>
      </tr>`
        )
        .join('')}
    </table>

    <a href="https://dashboard.stripe.com/payments" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:14px 32px;font-weight:700;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;">
      Open Stripe &rarr;
    </a>

  </div>
</body>
</html>
`
