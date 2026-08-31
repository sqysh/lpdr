export const accountMergedTemplate = ({
  firstName,
  primaryEmail,
  duplicateEmail
}: {
  firstName: string
  primaryEmail: string
  duplicateEmail: string
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your accounts have been merged</title>
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

    <!-- Heading -->
    <h1 style="margin: 0 0 12px 0; color: #09090b; font-size: 26px; font-weight: 900; line-height: 1.2;">
      Your accounts have been merged, ${firstName}
    </h1>

    <!-- Body -->
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      Our team merged two accounts associated with your name into one. All your orders, bids, payment methods, and history from <strong style="color: #09090b;">${duplicateEmail}</strong> have been moved to your primary account.
    </p>

    <!-- Account summary -->
    <div style="margin-bottom: 36px; border: 1px solid #e4e4e7;">
      <div style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7; background: #f4f4f5;">
        <p style="margin: 0; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase; color: #52525b;">
          Account summary
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7; color: #52525b; font-size: 14px;">
            Kept account
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7; color: #09090b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace;">
            ${primaryEmail}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; color: #52525b; font-size: 14px;">
            Removed account
          </td>
          <td
            style="padding: 12px 16px; color: #52525b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace; text-decoration: line-through;"
            aria-label="Removed account: ${duplicateEmail}"
          >
            ${duplicateEmail}
          </td>
        </tr>
      </table>
    </div>

    <!-- Next steps -->
    <div style="margin-bottom: 40px; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-left: 3px solid #0891b2;">
      <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.7;">
        <strong>Going forward,</strong> sign in using <strong>${primaryEmail}</strong>. The other email address no longer has an account on the site.
      </p>
    </div>

    <!-- Divider -->
    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

    <!-- Footer -->
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 10px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Questions? We are here to help.
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
