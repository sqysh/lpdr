'use server'

import { resend } from 'lib/email/resend'
import { contactEmailTemplate } from 'lib/email/templates/contact-email.template'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { looksAutomated } from 'lib/utils/looksAutomated.utils'
import { auctionOfferSchema } from 'lib/schemas/auction-offer.schema'
import { INBOX, SENDER } from 'lib/constants/email.constants'
import type { ActionResult } from 'types/action.types'

export async function offerAuctionItem(input: unknown): Promise<ActionResult<null>> {
  const parsed = parseInput(auctionOfferSchema, input)
  if (parsed.ok === false) return parsed.result

  const { name, email, item, value, notes, website, renderedAt } = parsed.data

  const reason = looksAutomated({ website, renderedAt })
  if (reason) {
    await createLog('info', 'Automated auction offer ignored', { location: ['offerAuctionItem.ts'], reason, email })
    return { success: true, data: null }
  }

  const message = [`Item: ${item}`, value && `Approximate value: ${value}`, notes && `Notes:\n${notes}`].filter(Boolean).join('\n\n')

  try {
    const result = await resend.emails.send({
      from: SENDER.notifications,
      to: INBOX.auctions,
      replyTo: email,
      subject: `[Auction item] ${item}`,
      html: contactEmailTemplate({ name, email, subject: `Holiday auction item: ${item}`, message })
    })

    if (result.error || !result.data?.id) throw new Error(result.error?.message ?? 'Resend returned no message id')

    await createLog('info', 'Auction item offered', { location: ['offerAuctionItem.ts'], name, email, item })
    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to send auction item offer', {
      location: ['offerAuctionItem.ts'],
      name,
      email,
      item,
      error: getErrorMessage(error)
    })
    return { success: false, error: `Something went wrong. Please try again, or email ${INBOX.auctions}.`, data: null }
  }
}
