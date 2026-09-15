type Params = {
  name: string | null
  amount: number
  failureReason: string | null
  myPackUrl: string
}

export function paymentFailedTemplate({ name, amount, failureReason, myPackUrl }: Params): string {
  const reason = failureReason ?? 'Your payment could not be processed.'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment failed</title>
  <style>
    @media only screen and (max-width: 480px) {
      .main-heading { font-size: 22px !important; }
      .main-text    { font-size: 14px !important; }
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
          <div style="width: 24px; height: 1px; background: #b43535;"></div>
        </td>
        <td>
          <p style="margin: 0; color: #b43535; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
            Little Paws Dachshund Rescue
          </p>
        </td>
      </tr>
    </table>

    <!-- Alert label -->
    <p style="margin: 0 0 12px 0; color: #b43535; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700;">
      ⚠&nbsp; Action required
    </p>

    <!-- Main heading -->
    <h1 class="main-heading" style="margin: 0 0 12px 0; color: #09090b; font-size: 26px; font-weight: 900; line-height: 1.2;">
      Your payment failed, ${name ? name.split(' ')[0] : 'there'}
    </h1>

    <!-- Body text -->
    <p class="main-text" style="margin: 0 0 36px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      We were unable to process your recurring donation of <strong style="color: #09090b;">$${amount.toFixed(2)}</strong> to Little Paws Dachshund Rescue. <strong style="color: #b43535;">Your donation is currently paused.</strong>
    </p>

    <!-- Reason -->
    <div style="margin-bottom: 36px;">
      <p style="margin: 0 0 12px 0; color: #b43535; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Reason
      </p>
      <div style="padding: 16px; background: #fff5f5; border: 1px solid #fecaca; border-left: 3px solid #b43535;">
        <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.7;">
          ${reason}
        </p>
      </div>
    </div>

    <!-- CTA -->
    <div style="margin-bottom: 40px;">
      <p style="margin: 0 0 16px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
        To keep your donation active, please update your payment method in My Pack.
      </p>
      <a href="${myPackUrl}" class="button" style="display: inline-block; background: #b43535; color: #ffffff; text-decoration: none; padding: 13px 32px; font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Update payment method
      </a>
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
  `.trim()
}
