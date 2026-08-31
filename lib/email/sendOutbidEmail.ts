import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { getErrorMessage } from 'app/utils/_error.utils'
import { auctionOutBidTemplate } from './templates/out-bid.template'

type SendOutbidEmailParams = {
  email: string
  firstName: string
  itemName: string
  yourBid: number
  newBid: number
  minimumBid: number
  url: string
}

export const sendOutbidEmail = async ({
  email,
  firstName,
  itemName,
  yourBid,
  newBid,
  minimumBid,
  url
}: SendOutbidEmailParams) => {
  try {
    const result = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: email,
      subject: `You've been outbid on ${itemName}`,
      html: auctionOutBidTemplate({ firstName, itemName, yourBid, newBid, minimumBid, url })
    })

    await Promise.all([
      createLog('info', 'Outbid email sent', {
        email,
        itemName,
        messageId: result.data?.id ?? null
      }),
      pusherSuperuser('outbid-email-sent', {
        email,
        name: firstName,
        itemName,
        yourBid,
        newBid,
        minimumBid
      })
    ])
  } catch (error) {
    await createLog('error', 'Failed to send outbid email', {
      email,
      itemName,
      error: getErrorMessage(error)
    })
    throw error
  }
}
