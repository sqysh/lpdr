'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireSuper } from 'lib/auth/guards'
import { resend } from 'lib/email/resend'
import { accountMergedTemplate } from 'lib/email/templates/account-merged.template'
import { getErrorMessage } from 'app/utils/_error.utils'

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
    if (primary.id === duplicate.id)
      return { success: false, error: 'That email belongs to this account.' }

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { userId: duplicate.id },
        data: { userId: primaryUserId }
      })
      await tx.paymentMethod.updateMany({
        where: { userId: duplicate.id },
        data: { userId: primaryUserId }
      })
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
          lastName: primary.lastName ?? duplicate.lastName,
          phone: primary.phone ?? duplicate.phone,
          stripeCustomerId: primary.stripeCustomerId ?? duplicate.stripeCustomerId
        }
      })

      await tx.user.delete({ where: { id: duplicate.id } })
    })

    const firstName = primary.firstName ?? primary.email.split('@')[0]
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
