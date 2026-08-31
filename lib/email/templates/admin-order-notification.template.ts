export const adminOrderNotificationTemplate = ({
  orderId,
  customerName,
  customerEmail,
  items,
  addressLine1,
  addressLine2,
  city,
  state,
  zipPostalCode
}: {
  orderId: string
  customerName: string
  customerEmail: string
  items: { name: string; quantity?: number }[]
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  zipPostalCode: string
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New order requires shipping</title>
</head>
<body style="margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 540px; margin: 0 auto; padding: 56px 24px;">

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

    <h1 style="margin: 0 0 12px 0; color: #09090b; font-size: 26px; font-weight: 900; line-height: 1.2;">
      New order requires shipping
    </h1>

    <p style="margin: 0 0 36px 0; color: #52525b; font-size: 15px; line-height: 1.7;">
      Order <strong style="color: #09090b; font-family: 'Courier New', monospace;">#${orderId.slice(-8).toUpperCase()}</strong> has been paid and needs to be fulfilled.
    </p>

    <!-- Customer -->
    <div style="margin-bottom: 36px;">
      <p style="margin: 0 0 12px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Customer
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #52525b; font-size: 14px; width: 120px;">Name</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #09090b; font-size: 14px;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #52525b; font-size: 14px;">Email</td>
          <td style="padding: 12px 0; font-size: 14px;">
            <a href="mailto:${customerEmail}" style="color: #0891b2;">${customerEmail}</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    <div style="margin-bottom: 36px;">
      <p style="margin: 0 0 12px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Items to ship
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        ${items
          .map(
            (item, i) => `
        <tr>
          <td style="padding: 12px 0; ${i < items.length - 1 ? 'border-bottom: 1px solid #e4e4e7;' : ''} color: #09090b; font-size: 14px;">
            ${item.name}
          </td>
          ${
            item.quantity && item.quantity > 1
              ? `<td style="padding: 12px 0; ${i < items.length - 1 ? 'border-bottom: 1px solid #e4e4e7;' : ''} color: #52525b; font-size: 14px; text-align: right; font-family: 'Courier New', monospace;">x${item.quantity}</td>`
              : '<td></td>'
          }
        </tr>`
          )
          .join('')}
      </table>
    </div>

    <!-- Ship to -->
    <div style="margin-bottom: 40px;">
      <p style="margin: 0 0 12px 0; color: #52525b; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">
        Ship to
      </p>
      <div style="padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-left: 3px solid #0891b2;">
        <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.8;">
          ${addressLine1}<br>
          ${addressLine2 ? `${addressLine2}<br>` : ''}
          ${city}, ${state} ${zipPostalCode}
        </p>
      </div>
    </div>

    <div style="margin: 40px 0; height: 1px; background: #e4e4e7;"></div>

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
