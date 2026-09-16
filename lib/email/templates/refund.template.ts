import { REFUND_REASONS, type RefundReason } from 'lib/constants/refund.constants'

const money = (n: number) => `$${n.toFixed(2)}`

export const refundTemplate = ({ firstName, amount, reason }: { firstName: string; amount: number; reason: RefundReason }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:540px;margin:0 auto;padding:56px 24px;">

    <table role="presentation" style="margin-bottom:40px;border-collapse:collapse;">
      <tr>
        <td style="width:24px;padding-right:12px;"><div style="width:24px;height:1px;background:#0891b2;"></div></td>
        <td>
          <p style="margin:0;color:#0891b2;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;">
            Little Paws Dachshund Rescue
          </p>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 20px 0;color:#09090b;font-size:30px;font-weight:900;line-height:1.15;letter-spacing:-0.02em;">
      Hi ${firstName}, your<br>refund is on its way.
    </h1>

    <p style="margin:0 0 20px 0;color:#52525b;font-size:15px;line-height:1.7;">
      ${REFUND_REASONS[reason].line}
    </p>

    <div style="margin-bottom:24px;padding:16px;background:#f4f4f5;border:1px solid #e4e4e7;border-left:3px solid #0891b2;">
      <p style="margin:0 0 4px 0;color:#52525b;font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.15em;text-transform:uppercase;">
        Refunded
      </p>
      <p style="margin:0;color:#09090b;font-size:24px;font-family:'Courier New',monospace;font-weight:900;">
        ${money(amount)}
      </p>
    </div>

    <p style="margin:0 0 32px 0;color:#52525b;font-size:15px;line-height:1.7;">
      It goes back to the card you paid with, usually within five to ten business days depending on
      your bank. There is nothing you need to do. If anything about this looks wrong, just reply to
      this email and we will sort it out.
    </p>

    <p style="margin:0 0 32px 0;color:#52525b;font-size:15px;line-height:1.7;">
      Thank you for supporting our dachshunds.
    </p>

    <div style="margin:40px 0;height:1px;background:#e4e4e7;"></div>

    <p style="margin:0 0 10px 0;color:#52525b;font-size:12px;font-family:'Courier New',monospace;letter-spacing:0.2em;text-transform:uppercase;">
      Questions? We&apos;re here to help.
    </p>
    <p style="margin:0;">
      <a href="mailto:lpdr@littlepawsdr.org" style="color:#0891b2;font-size:14px;">lpdr@littlepawsdr.org</a>
    </p>

  </div>
</body>
</html>
`
