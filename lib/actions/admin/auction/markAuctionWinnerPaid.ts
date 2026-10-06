'use server'

import prisma from 'prisma/client'
import { revalidatePath } from 'next/cache'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import sendConfirmationEmail from 'lib/email/sendConfirmationEmail'
import type { ActionResult } from 'types/action.types'
import { markAuctionWinnerPaidSchema } from 'lib/schemas/auction.schema'
import { sendAdminShippingNotice } from 'lib/email/sendAdminShippingNotice'

class AlreadyPaid extends Error {}

/** Records a winner who paid outside Stripe, the same way a card payment would have been recorded */
export async function markAuctionWinnerPaid(input: unknown): Promise<ActionResult<{ orderId: string }>> {
  const gate = await requireAccess('AUCTIONS')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(markAuctionWinnerPaidSchema, input)
  if (parsed.ok === false) return parsed.result

  const { winningBidderId, method, receivedOn, reference } = parsed.data
  const paidAt = receivedOn ?? new Date()

  try {
    const winner = await prisma.auctionWinningBidder.findUnique({
      where: { id: winningBidderId },
      include: {
        auction: { select: { id: true, title: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, address: true } },
        auctionItems: { select: { name: true, soldPrice: true, requiresShipping: true, shippingCosts: true } }
      }
    })

    if (!winner) return { success: false, data: null, error: 'Winner not found' }
    if (winner.winningBidPaymentStatus === 'PAID') return { success: false, data: null, error: 'This winner is already paid.' }

    const hasPhysical = winner.auctionItems.some((i) => i.requiresShipping)
    const address = winner.user.address

    // The order, the winner and the revenue move together. The status check inside the transaction
    // means two admins clicking at once can't both record the payment
    const orderId = await prisma.$transaction(async (tx) => {
      const { count } = await tx.auctionWinningBidder.updateMany({
        where: { id: winningBidderId, winningBidPaymentStatus: { not: 'PAID' } },
        data: {
          winningBidPaymentStatus: 'PAID',
          auctionItemPaymentStatus: 'PAID',
          paidOn: paidAt,
          shippingStatus: 'PENDING_FULFILLMENT'
        }
      })
      if (count === 0) throw new AlreadyPaid()

      const order = await tx.order.create({
        data: {
          type: 'AUCTION_PURCHASE',
          status: 'CONFIRMED',
          subtotal: winner.itemsTotal,
          shipping: winner.shipping,
          totalAmount: winner.totalPrice ?? 0,
          customerEmail: winner.user.email ?? '',
          customerName: [winner.user.firstName, winner.user.lastName].filter(Boolean).join(' '),
          customerPhone: winner.user.phone,
          userId: winner.userId,
          paidAt,
          offlinePaymentMethod: method,
          notes: reference,
          isPhysical: hasPhysical,
          shippingStatus: hasPhysical ? 'PENDING_FULFILLMENT' : null,
          addressLine1: address?.addressLine1 ?? null,
          addressLine2: address?.addressLine2 ?? null,
          city: address?.city ?? null,
          state: address?.state ?? null,
          zipPostalCode: address?.zipPostalCode ?? null,
          country: 'US',
          items: {
            create: winner.auctionItems.map((item) => {
              const price = Number(item.soldPrice ?? 0)
              const shipping = item.requiresShipping ? Number(item.shippingCosts ?? 0) : 0
              return {
                itemType: 'AUCTION_WINNING_BID' as const,
                itemName: item.name,
                price,
                quantity: 1,
                subtotal: price,
                shippingPrice: shipping,
                totalPrice: price + shipping,
                isPhysical: item.requiresShipping
              }
            })
          }
        },
        select: { id: true }
      })

      await tx.auction.update({
        where: { id: winner.auctionId },
        data: { totalAuctionRevenue: { increment: winner.itemsTotal ?? 0 } }
      })

      return order.id
    })

    // The same emails a card payment sends: the winner's receipt, and the rescue's notice that
    // something needs posting. The payment is recorded either way, so a failed email is logged, not undone
    try {
      const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } })
      await sendConfirmationEmail(order)
      if (hasPhysical && order.addressLine1) await sendAdminShippingNotice(order)
    } catch (error) {
      await createLog('error', 'Auction winner receipt failed to send', { winningBidderId, orderId, error: getErrorMessage(error) })
    }

    const payload = {
      winningBidderId,
      orderId,
      auctionTitle: winner.auction.title,
      name: [winner.user.firstName, winner.user.lastName].filter(Boolean).join(' ') || winner.user.email,
      amount: Number(winner.totalPrice ?? 0),
      method,
      markedBy: gate.userId
    }

    await Promise.all([
      createLog('info', 'Auction winner marked paid', payload),
      pusherSuperuser('winner-marked-paid', payload).catch(() => {})
    ])

    revalidatePath(`/admin/auctions/${winner.auctionId}`)
    revalidatePath('/admin/transactions')

    return { success: true, data: { orderId } }
  } catch (error) {
    if (error instanceof AlreadyPaid) return { success: false, data: null, error: 'This winner is already paid.' }

    await createLog('error', 'Failed to mark auction winner paid', { winningBidderId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to record the payment. Please try again.' }
  }
}
