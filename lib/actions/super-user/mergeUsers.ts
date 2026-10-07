'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireSuper } from 'lib/auth/guards'
import { resend } from 'lib/email/resend'
import { accountMergedTemplate } from 'lib/email/templates/account-merged.template'
import { getErrorMessage } from 'lib/utils/error.utils'

export async function mergeUsers({
  primaryUserId,
  duplicateEmail
}: {
  primaryUserId: string
  duplicateEmail: string
}): Promise<{ success: boolean; error?: string }> {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error }

  try {
    const [primary, duplicate] = await Promise.all([
      prisma.user.findUnique({ where: { id: primaryUserId }, include: { address: true } }),
      prisma.user.findUnique({
        where: { email: duplicateEmail.trim().toLowerCase() },
        include: { address: true }
      })
    ])

    if (!primary) return { success: false, error: 'Primary user not found.' }
    if (!duplicate) return { success: false, error: 'No account found with that email address.' }
    if (primary.id === duplicate.id) return { success: false, error: 'That email belongs to this account.' }
    // A merge deletes the duplicate account, so never one that runs the site, or your own
    if (duplicate.role === 'SUPER_USER') return { success: false, error: "A super user account can't be merged away." }
    if (duplicate.id === gate.userId) return { success: false, error: "You can't merge away the account you're signed in with." }

    await prisma.$transaction(
      async (tx) => {
        await tx.order.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.paymentMethod.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        // One registration per person per auction. Where both accounts registered for the same auction,
        // move the duplicate's bids onto the primary's registration before removing the duplicate's
        const [primaryRegs, duplicateRegs] = await Promise.all([
          tx.auctionBidder.findMany({ where: { userId: primaryUserId }, select: { id: true, auctionId: true } }),
          tx.auctionBidder.findMany({ where: { userId: duplicate.id }, select: { id: true, auctionId: true } })
        ])
        for (const dupReg of duplicateRegs) {
          const keep = primaryRegs.find((r) => r.auctionId === dupReg.auctionId)
          if (!keep) continue
          await tx.auctionBid.updateMany({ where: { bidderId: dupReg.id }, data: { bidderId: keep.id } })
          await tx.auctionBidder.delete({ where: { id: dupReg.id } })
        }
        await tx.auctionBidder.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.auctionWinningBidder.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.auctionItemInstantBuyer.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.auctionBid.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.adoptionFee.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.account.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })
        await tx.session.updateMany({
          where: { userId: duplicate.id },
          data: { userId: primaryUserId }
        })

        if (!primary.address && duplicate.address) {
          await tx.address.update({
            where: { userId: duplicate.id },
            data: { userId: primaryUserId }
          })
        } else if (duplicate.address) {
          await tx.address.delete({ where: { userId: duplicate.id } })
        }

        await tx.user.update({
          where: { id: primaryUserId },
          data: {
            firstName: primary.firstName ?? duplicate.firstName,
            nameConfirmedAt: primary.nameConfirmedAt ?? duplicate.nameConfirmedAt,
            lastName: primary.lastName ?? duplicate.lastName,
            phone: primary.phone ?? duplicate.phone,
            stripeCustomerId: primary.stripeCustomerId ?? duplicate.stripeCustomerId
          }
        })

        // Agreements: the adopter, and who created, marked paid or closed them
        await tx.adoptionAgreement.updateMany({ where: { userId: duplicate.id }, data: { userId: primaryUserId } })
        await tx.adoptionAgreement.updateMany({ where: { createdById: duplicate.id }, data: { createdById: primaryUserId } })
        await tx.adoptionAgreement.updateMany({ where: { markedPaidById: duplicate.id }, data: { markedPaidById: primaryUserId } })
        await tx.adoptionAgreement.updateMany({ where: { closedById: duplicate.id }, data: { closedById: primaryUserId } })

        // Watches are one per person per item, so drop the duplicate's where the primary already watches
        const primaryWatches = await tx.auctionItemWatch.findMany({ where: { userId: primaryUserId }, select: { auctionItemId: true } })
        await tx.auctionItemWatch.deleteMany({
          where: { userId: duplicate.id, auctionItemId: { in: primaryWatches.map((w) => w.auctionItemId) } }
        })
        await tx.auctionItemWatch.updateMany({ where: { userId: duplicate.id }, data: { userId: primaryUserId } })

        await tx.user.delete({ where: { id: duplicate.id } })
      },
      { timeout: 20000 }
    )

    const firstName = primary.firstName ?? duplicate.firstName ?? null
    const { error: emailError } = await resend.emails.send({
      from: 'Little Paws Dachshund Rescue <support@littlepawsdr.org>',
      to: primary.email,
      subject: 'Your accounts have been merged',
      html: accountMergedTemplate({
        firstName,
        primaryEmail: primary.email,
        duplicateEmail: duplicate.email
      })
    })

    if (emailError) {
      await createLog('error', 'Failed to send account merged email', {
        primaryUserId,
        error: emailError.message
      })
    }

    await createLog('info', 'Users merged', {
      primaryUserId,
      duplicateUserId: duplicate.id,
      primaryEmail: primary.email,
      duplicateEmail: duplicate.email,
      mergedBy: gate.userId
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to merge users', {
      primaryUserId,
      duplicateEmail,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to merge users. Please try again.' }
  }
}
