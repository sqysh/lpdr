import { COLOR } from 'lib/constants/order-confirmation.constants'

type MemorialReviewEmail = {
  siteUrl: string
  memorialId: string
  dogName: string
  message: string | null
  photoUrl: string | null
  donorName: string
  donorEmail: string
  displayName: string | null
  amount: string
}

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function memorialReviewTemplate(e: MemorialReviewEmail) {
  const dog = escape(e.dogName)
  const reviewUrl = `${e.siteUrl}/admin/memorials`
  const artUrl = `${e.siteUrl}/api/memorial-art/${e.memorialId}`

  const subject = `A memorial for ${e.dogName} is waiting for review`

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:${COLOR.footer};width:140px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:${COLOR.heading};vertical-align:top;">${value}</td>
    </tr>`

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${COLOR.bgMuted};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.bgMuted};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${COLOR.border};">
            <tr>
              <td style="padding:24px 22px 8px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${COLOR.accent};">Rainbow Bridge</p>
                <h1 style="margin:0;font-size:20px;line-height:1.3;color:${COLOR.heading};">A memorial for ${dog} is waiting for review</h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:${COLOR.body};">
                  It won't appear on the Rainbow Bridge page until someone approves it.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 22px 0;">
                <img src="${artUrl}" width="476" alt="Memorial card for ${dog}" style="display:block;width:100%;max-width:476px;height:auto;border:1px solid ${COLOR.border};" />
              </td>
            </tr>
            <tr>
              <td style="padding:16px 22px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${e.photoUrl ? row('Photo', `<img src="${escape(e.photoUrl)}" width="96" height="96" alt="Photo of ${dog}" style="display:block;width:96px;height:96px;object-fit:cover;border:1px solid ${COLOR.border};" />`) : row('Photo', 'None')}
                  ${row('Shown as', e.displayName ? `Loved by ${escape(e.displayName)}` : 'Donor name not shown')}
                  ${e.message ? row('Message', escape(e.message).replace(/\n/g, '<br />')) : ''}
                  ${row('Gift', escape(e.amount))}
                  ${row('From', `${escape(e.donorName)}<br /><span style="color:${COLOR.footer};">${escape(e.donorEmail)}</span>`)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;">
                <a href="${reviewUrl}" style="display:inline-block;padding:12px 22px;background:${COLOR.accent};color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Review memorials</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    `A memorial for ${e.dogName} is waiting for review.`,
    `It won't appear on the Rainbow Bridge page until someone approves it.`,
    '',
    `Shown as: ${e.displayName ? `Loved by ${e.displayName}` : 'Donor name not shown'}`,
    e.message ? `Message: ${e.message}` : null,
    `Photo: ${e.photoUrl ? 'Yes' : 'None'}`,
    `Gift: ${e.amount}`,
    `From: ${e.donorName} (${e.donorEmail})`,
    '',
    `Review memorials: ${reviewUrl}`
  ]
    .filter((line) => line !== null)
    .join('\n')

  return { subject, html, text }
}
