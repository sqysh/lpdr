export const magicLinkTemplate = (url: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Little Paws Dachshund Rescue</title>
  <style>
    @media only screen and (max-width: 480px) {
      .main-heading { font-size: 22px !important; }
      .main-text    { font-size: 14px !important; }
      .button       { padding: 14px 28px !important; font-size: 11px !important; }
      .link-text    { font-size: 11px !important; }
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

    <!-- Main heading -->
    <h1 class="main-heading" style="margin: 0 0 12px 0; color: #09090b; font-size: 26px; font-weight: 900; line-height: 1.2;">
      Your secure sign-in link
    </h1>

    <!-- Body text -->
    <p class="main-text" style="margin: 0 0 36px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      Click the button below to sign in to your account. This link expires in 15 minutes.
    </p>

    <!-- Button -->
    <div style="margin-bottom: 40px;">
      <a href="${url}" class="button" style="display: inline-block; background: #0891b2; color: #ffffff; text-decoration: none; padding: 13px 32px; font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Sign in to your account
      </a>
    </div>

    <!-- Divider -->
    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

    <!-- Copy link -->
    <div style="margin-bottom: 40px;">
      <p style="margin: 0 0 10px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Or copy this link
      </p>
      <p class="link-text" style="margin: 0; word-break: break-all; font-family: 'Courier New', monospace; font-size: 12px; color: #0891b2; line-height: 1.8; padding: 12px 16px; background: #f4f4f5; border: 1px solid #e4e4e7;">
        ${url}
      </p>
    </div>

    <!-- Security notice -->
    <div style="margin-bottom: 40px; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-left: 3px solid #0891b2;">
      <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.7;">
        <strong>Didn't request this?</strong><br>
        You can safely ignore this email. Your account is secure.
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
