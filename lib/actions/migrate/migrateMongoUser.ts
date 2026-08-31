import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { pusherTrigger } from 'lib/pusher/pusher.utils'

function mongoId(ref: any): string | null {
  if (!ref) return null
  return ref.$oid ?? ref.toString()
}

function joinName(first: string | null, last: string | null, fallback: string): string {
  return [first, last].filter(Boolean).join(' ') || fallback
}

function mapShippingStatus(status: string | null): string | null {
  if (!status) return null
  const map: Record<string, string | null> = {
    shipped: 'SHIPPED',
    delivered: 'SHIPPED',
    'not-shipped': 'PENDING_FULFILLMENT',
    processing: 'PENDING_FULFILLMENT',
    Shipped: 'SHIPPED',
    'Pending Payment Confirmation': 'PENDING_FULFILLMENT',
    Digital: null
  }
  return map[status] ?? null
}

function parseDate(val: any): Date {
  return new Date(val?.$date ?? val)
}

// ── Step helpers ──────────────────────────────────────────────────────────────

async function migrateUserFields(tx: any, mongoUser: any, userId: string) {
  if (!mongoUser) return
  const d = mongoUser.data as any
  const fullName = `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || 'Unknown'

  await tx.user.update({
    where: { id: userId },
    data: {
      firstName: d.firstName ?? undefined,
      lastName: d.lastName ?? undefined,
      phone: d.phone ?? undefined,
      anonymousBidding: d.anonymousBidding ?? true
    }
  })

  if (d.shippingAddress?.address || d.addressRef) {
    const existingAddress = await tx.address.findUnique({ where: { userId } })
    if (!existingAddress) {
      if (d.shippingAddress?.address) {
        await tx.address.create({
          data: {
            user: { connect: { id: userId } },
            name: d.shippingAddress.name ?? fullName,
            addressLine1: d.shippingAddress.address ?? '',
            addressLine2: d.shippingAddress.addressLine2 ?? null,
            city: d.shippingAddress.city ?? '',
            state: d.shippingAddress.state ?? '',
            zipPostalCode: d.shippingAddress.zipPostalCode ?? '',
            country: d.shippingAddress.country ?? 'US'
          }
        })
      } else if (d.addressRef) {
        const addressMongoId = d.addressRef?.$oid ?? d.addressRef?.toString() ?? d.addressRef
        const mongoAddress = await tx.mongoAddress.findUnique({
          where: { mongoId: addressMongoId }
        })
        if (mongoAddress) {
          const a = mongoAddress.data as any
          await tx.address.create({
            data: {
              user: { connect: { id: userId } },
              name: a.name ?? fullName,
              addressLine1: a.address ?? '',
              addressLine2: a.addressLine2 ?? null,
              city: a.city ?? '',
              state: a.state ?? '',
              zipPostalCode: a.zipPostalCode ?? '',
              country: a.country ?? 'US'
            }
          })
        }
      }
    }
  }
}

async function migrateDonations(tx: any, normalizedEmail: string, userId: string) {
  const donations = await tx.mongoDonation.findMany({ where: { email: normalizedEmail } })
  for (const rec of donations) {
    const d = rec.data as any
    if (!d.donationAmount) continue
    await tx.order.create({
      data: {
        type: 'ONE_TIME_DONATION',
        status: 'CONFIRMED',
        totalAmount: d.donationAmount,
        customerEmail: normalizedEmail,
        customerName: joinName(d.firstName, d.lastName, normalizedEmail),
        userId,
        isPhysical: false,
        source: 'MONGO_MIGRATION',
        paidAt: parseDate(d.createdAt),
        createdAt: parseDate(d.createdAt)
      }
    })
    await tx.mongoDonation.delete({ where: { id: rec.id } })
  }
}

async function migrateOrders(tx: any, normalizedEmail: string, userId: string) {
  const orders = await tx.mongoOrder.findMany({ where: { email: normalizedEmail } })

  for (const rec of orders) {
    const d = rec.data as any
    if (d.status === 'pending' || d.status === 'refunded') {
      await tx.mongoOrder.delete({ where: { id: rec.id } })
      continue
    }

    const items = await tx.mongoOrderItem.findMany({ where: { mongoOrderId: rec.mongoId } })
    const itemDocs = items.map((i: any) => i.data as any)

    const isPhysical = itemDocs.some((i: any) => i.isPhysicalProduct)
    const shippingStatus = mapShippingStatus(d.shippingStatus)

    const order = await tx.order.create({
      data: {
        type: 'PURCHASE',
        status: d.status === 'completed' ? 'CONFIRMED' : 'FAILED',
        totalAmount: d.totalPrice,
        customerEmail: normalizedEmail,
        customerName: d.name ?? normalizedEmail,
        userId,
        isPhysical,
        source: 'MONGO_MIGRATION',
        shippingStatus: shippingStatus as any,
        addressLine1: d.shippingAddress?.address ?? null,
        city: d.shippingAddress?.city ?? null,
        state: d.shippingAddress?.state ?? null,
        zipPostalCode: d.shippingAddress?.zipPostalCode ?? null,
        country: d.shippingAddress?.country ?? null,
        paidAt: parseDate(d.createdAt),
        createdAt: parseDate(d.createdAt)
      }
    })

    for (const item of itemDocs) {
      const itemType =
        item.itemType === 'welcomeWiener'
          ? 'WELCOME_WIENER'
          : item.itemType === 'ecard'
            ? 'ECARD'
            : 'PRODUCT'

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          itemType,
          itemName: item.itemName ?? null,
          itemImage: item.itemImage ?? null,
          quantity: item.quantity ?? 1,
          price: item.price ?? 0,
          shippingPrice: item.shippingPrice ?? 0,
          totalPrice: item.totalPrice ?? null,
          subtotal: item.subtotal ?? null,
          isPhysical: item.isPhysicalProduct ?? false,
          size: item.size ?? null
        }
      })
    }

    await tx.mongoOrderItem.deleteMany({ where: { mongoOrderId: rec.mongoId } })
    await tx.mongoOrder.delete({ where: { id: rec.id } })
  }
}

async function migrateAdoptionFees(tx: any, normalizedEmail: string, userId: string) {
  const adoptionFees = await tx.mongoAdoptionFee.findMany({ where: { email: normalizedEmail } })
  for (const rec of adoptionFees) {
    const d = rec.data as any

    try {
      if (d.feeAmount != null) {
        const order = await tx.order.create({
          data: {
            type: 'ADOPTION_FEE',
            status: 'CONFIRMED',
            totalAmount: d.feeAmount,
            customerEmail: normalizedEmail,
            customerName: joinName(d.firstName, d.lastName, normalizedEmail),
            userId,
            isPhysical: false,
            source: 'MONGO_MIGRATION',
            paidAt: parseDate(d.createdAt),
            createdAt: parseDate(d.createdAt)
          }
        })

        const now = new Date()
        const expiresAt = d.expiresAt ? parseDate(d.expiresAt) : null
        const isExpired = expiresAt ? expiresAt < now : false

        await tx.adoptionFee.create({
          data: {
            userId,
            orderId: order.id,
            email: normalizedEmail,
            firstName: d.firstName ?? null,
            lastName: d.lastName ?? null,
            feeAmount: d.feeAmount,
            status: isExpired ? 'EXPIRED' : 'ACTIVE',
            expiresAt,
            bypassCode: d.bypassCode ?? null,
            createdAt: parseDate(d.createdAt)
          }
        })
      } else {
        await createLog('warn', 'Adoption fee migration skipped — missing feeAmount', {
          mongoId: rec.id,
          email: normalizedEmail
        })
      }

      await tx.mongoAdoptionFee.delete({ where: { id: rec.id } })
    } catch (err) {
      await createLog('error', 'Adoption fee migration failed for record', {
        mongoId: rec.id,
        email: normalizedEmail,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
      throw err
    }
  }
}

async function migrateAuctions(tx: any, normalizedEmail: string, userId: string) {
  // ── Helpers ───────────────────────────────────────────────────────────────

  async function getAuction(mongoAuctionId: string | null) {
    if (!mongoAuctionId) return null
    return tx.auction.findUnique({ where: { mongoId: mongoAuctionId } })
  }

  async function getOrCreateBidder(auctionId: string) {
    const existing = await tx.auctionBidder.findFirst({ where: { auctionId, userId } })
    if (existing) return existing
    return tx.auctionBidder.create({ data: { auctionId, userId } })
  }

  async function attachPhotos(itemId: string, mongoItemData: any) {
    const photoIds = (mongoItemData.photos ?? [])
      .map((ref: any) => ref.$oid ?? ref.toString())
      .filter(Boolean) as string[]
    if (!photoIds.length) return

    const photos = await tx.mongoAuctionItemPhoto.findMany({
      where: { mongoId: { in: photoIds } }
    })
    if (!photos.length) return

    await tx.auctionItemPhoto.createMany({
      data: photos.map((p: any, i: number) => {
        const d = p.data as any
        return {
          itemId,
          url: d.url ?? '',
          name: d.name ?? null,
          size: d.size ?? null,
          isPrimary: i === 0,
          sortOrder: i
        }
      })
    })
  }

  // ── Auction Winners ───────────────────────────────────────────────────────

  const winners = await tx.mongoAuctionWinner.findMany({ where: { email: normalizedEmail } })

  for (const rec of winners) {
    const d = rec.data as any
    if (d.winningBidPaymentStatus !== 'Paid') {
      await tx.mongoAuctionWinner.delete({ where: { id: rec.id } })
      continue
    }

    const mongoAuctionId = d.auction?.$oid ?? d.auction?.toString()
    const auction = await getAuction(mongoAuctionId)
    if (!auction) {
      await tx.mongoAuctionWinner.delete({ where: { id: rec.id } })
      continue
    }

    const auctionItemIds = (d.auctionItems ?? [])
      .map((ref: any) => mongoId(ref))
      .filter(Boolean) as string[]
    const mongoAuctionItems = await tx.mongoAuctionItem.findMany({
      where: { mongoId: { in: auctionItemIds } }
    })

    const winningBidder = await tx.auctionWinningBidder.create({
      data: {
        auctionId: auction.id,
        userId,
        winningBidPaymentStatus: 'PAID',
        totalPrice: d.totalPrice ?? 0,
        itemSoldPrice: d.subtotal ?? d.totalPrice ?? 0,
        shipping: d.shipping ?? 0,
        shippingStatus:
          (mapShippingStatus(d.shippingStatus) as any) ?? 'PENDING_PAYMENT_CONFIRMATION',
        paidOn: d.paidOn ? parseDate(d.paidOn) : parseDate(d.createdAt),
        createdAt: parseDate(d.createdAt)
      }
    })

    // Create AuctionItem per won item with photos
    for (const ai of mongoAuctionItems) {
      const item = ai.data as any
      const auctionItem = await tx.auctionItem.create({
        data: {
          auctionId: auction.id,
          auctionWinningBidderId: winningBidder.id,
          name: item.name ?? 'Auction Item',
          sellingFormat: 'AUCTION',
          soldPrice: item.soldPrice ?? 0,
          requiresShipping: item.requiresShipping ?? false,
          shippingCosts: item.shippingCosts ?? null,
          status: 'SOLD',
          isAuction: true
        }
      })
      await attachPhotos(auctionItem.id, item)
    }

    await tx.mongoAuctionWinner.delete({ where: { id: rec.id } })
  }

  // ── Instant Buyers ────────────────────────────────────────────────────────

  const instantBuyers = await tx.mongoInstantBuyer.findMany({ where: { email: normalizedEmail } })

  for (const rec of instantBuyers) {
    const d = rec.data as any
    if (d.paymentStatus !== 'Paid') {
      await tx.mongoInstantBuyer.delete({ where: { id: rec.id } })
      continue
    }

    const mongoAuctionId = d.auction?.$oid ?? d.auction?.toString()
    const auction = await getAuction(mongoAuctionId)

    const mongoItemId = mongoId(d.auctionItem)
    const mongoItem = mongoItemId
      ? await tx.mongoAuctionItem.findUnique({ where: { mongoId: mongoItemId } })
      : null
    const item = mongoItem?.data as any
    const isPhysical = !d.isDigital
    const shippingStatus = isPhysical ? 'PENDING_FULFILLMENT' : 'DIGITAL'

    if (auction && item) {
      const auctionItem = await tx.auctionItem.create({
        data: {
          auctionId: auction.id,
          name: item.name ?? 'Auction Item',
          sellingFormat: 'FIXED',
          buyNowPrice: item.buyNowPrice ?? d.totalPrice ?? 0,
          soldPrice: d.totalPrice ?? 0,
          requiresShipping: isPhysical,
          status: 'SOLD',
          isFixed: true
        }
      })
      await attachPhotos(auctionItem.id, item)

      await tx.auctionItemInstantBuyer.create({
        data: {
          auctionId: auction.id,
          auctionItemId: auctionItem.id,
          userId,
          name: d.name ?? null,
          email: normalizedEmail,
          totalPrice: d.totalPrice ?? 0,
          paymentStatus: 'PAID',
          shippingStatus: shippingStatus as any,
          createdAt: parseDate(d.createdAt)
        }
      })
    }

    await tx.mongoInstantBuyer.delete({ where: { id: rec.id } })
  }

  // ── Bids ──────────────────────────────────────────────────────────────────

  const bids = await tx.mongoBid.findMany({ where: { email: normalizedEmail } })

  for (const rec of bids) {
    const d = rec.data as any
    if (!d.bidAmount) {
      await tx.mongoBid.delete({ where: { id: rec.id } })
      continue
    }

    const mongoAuctionId = d.auction?.$oid ?? d.auction?.toString()
    const auction = await getAuction(mongoAuctionId)
    if (!auction) {
      await tx.mongoBid.delete({ where: { id: rec.id } })
      continue
    }

    const mongoItemId = d.auctionItem?.$oid ?? d.auctionItem?.toString()
    const mongoItem = mongoItemId
      ? await tx.mongoAuctionItem.findUnique({ where: { mongoId: mongoItemId } })
      : null
    const item = mongoItem?.data as any

    const bidder = await getOrCreateBidder(auction.id)

    // Reuse existing AuctionItem if already created by winners/instant buyers
    let auctionItem = mongoItemId
      ? await tx.auctionItem.findFirst({
          where: { auctionId: auction.id, name: item?.name ?? 'Auction Item' }
        })
      : null

    if (!auctionItem && item) {
      auctionItem = await tx.auctionItem.create({
        data: {
          auctionId: auction.id,
          name: item.name ?? 'Auction Item',
          sellingFormat: 'AUCTION',
          startingPrice: item.startingPrice ?? 0,
          soldPrice: item.soldPrice ?? null,
          requiresShipping: item.requiresShipping ?? false,
          shippingCosts: item.shippingCosts ?? null,
          status: item.status === 'Sold' ? 'SOLD' : 'UNSOLD',
          isAuction: true,
          totalBids: item.totalBids ?? 0
        }
      })
      await attachPhotos(auctionItem.id, item)
    }

    if (!auctionItem) {
      await tx.mongoBid.delete({ where: { id: rec.id } })
      continue
    }

    await tx.auctionBid.create({
      data: {
        auctionId: auction.id,
        auctionItemId: auctionItem.id,
        userId,
        bidderId: bidder.id,
        bidAmount: d.bidAmount ?? 0,
        bidderName: d.bidder ?? null,
        email: normalizedEmail,
        status: d.status === 'Top Bid' ? 'TOP_BID' : 'OUTBID',
        createdAt: parseDate(d.createdAt)
      }
    })

    await tx.mongoBid.delete({ where: { id: rec.id } })
  }
}

async function migrateProductOrders(tx: any, normalizedEmail: string, userId: string) {
  const productOrders = await tx.mongoProductOrder.findMany({ where: { email: normalizedEmail } })
  for (const rec of productOrders) {
    const d = rec.data as any

    const parentMongoOrder = await tx.mongoOrder.findUnique({
      where: { mongoId: rec.mongoOrderId }
    })
    if (!parentMongoOrder) {
      await tx.mongoProductOrder.delete({ where: { id: rec.id } })
      continue
    }

    const parentOrder = await tx.order.findFirst({
      where: { userId, createdAt: parseDate((parentMongoOrder.data as any).createdAt) }
    })
    if (!parentOrder) {
      await tx.mongoProductOrder.delete({ where: { id: rec.id } })
      continue
    }

    await tx.orderItem.create({
      data: {
        orderId: parentOrder.id,
        itemName: d.productName ?? null,
        itemImage: d.productImage ?? null,
        quantity: d.quantity ?? 1,
        price: d.price ?? 0,
        subtotal: d.subtotal ?? null,
        totalPrice: d.price && d.quantity ? d.price * d.quantity : null,
        size: d.size ?? null,
        isPhysical: d.isPhysicalProduct ?? true
      }
    })

    await tx.mongoProductOrder.delete({ where: { id: rec.id } })
  }
}

async function migrateEcardOrders(tx: any, normalizedEmail: string, userId: string) {
  const ecardOrders = await tx.mongoEcardOrder.findMany({ where: { email: normalizedEmail } })
  for (const rec of ecardOrders) {
    const d = rec.data as any

    const parentMongoOrder = await tx.mongoOrder.findUnique({
      where: { mongoId: rec.mongoOrderId }
    })
    if (!parentMongoOrder) {
      await tx.mongoEcardOrder.delete({ where: { id: rec.id } })
      continue
    }

    const parentOrder = await tx.order.findFirst({
      where: { userId, createdAt: parseDate((parentMongoOrder.data as any).createdAt) }
    })
    if (!parentOrder) {
      await tx.mongoEcardOrder.delete({ where: { id: rec.id } })
      continue
    }

    await tx.orderItem.create({
      data: {
        orderId: parentOrder.id,
        itemName: d.productName ?? null,
        itemImage: d.image ?? null,
        quantity: d.quantity ?? 1,
        price: d.totalPrice ?? 0,
        subtotal: d.subtotal ?? null,
        totalPrice: d.totalPrice ?? null,
        isPhysical: false
      }
    })

    await tx.mongoEcardOrder.delete({ where: { id: rec.id } })
  }
}

async function migrateWelcomeWienerOrders(tx: any, normalizedEmail: string, userId: string) {
  const wwOrders = await tx.mongoWelcomeWienerOrder.findMany({ where: { email: normalizedEmail } })
  for (const rec of wwOrders) {
    const d = rec.data as any
    if (!d.totalPrice) {
      await tx.mongoWelcomeWienerOrder.delete({ where: { id: rec.id } })
      continue
    }

    // Find the parent order if it has an orderId
    const mongoOrderId = d.orderId?.$oid ?? d.orderId?.toString() ?? d.orderId

    if (mongoOrderId) {
      // It's a line item on an existing order
      const parentOrder = await tx.order.findFirst({
        where: { userId, source: 'MONGO_MIGRATION' }
      })

      if (parentOrder) {
        await tx.orderItem.create({
          data: {
            orderId: parentOrder.id,
            itemName: [d.dachshundName, d.productName].filter(Boolean).join(' — '),
            itemImage: d.productImage ?? null,
            quantity: d.quantity ?? 1,
            price: d.price ?? 0,
            totalPrice: d.totalPrice ?? null,
            subtotal: d.subtotal ?? null,
            isPhysical: d.isPhysicalProduct ?? false
          }
        })
        await tx.mongoWelcomeWienerOrder.delete({ where: { id: rec.id } })
        continue
      }
    }

    // Standalone welcome wiener order
    const order = await tx.order.create({
      data: {
        type: 'PURCHASE',
        status: 'CONFIRMED',
        totalAmount: d.totalPrice,
        customerEmail: normalizedEmail,
        customerName: normalizedEmail,
        userId,
        isPhysical: d.isPhysicalProduct ?? false,
        source: 'MONGO_MIGRATION',
        paidAt: parseDate(d.createdAt),
        createdAt: parseDate(d.createdAt)
      }
    })

    await tx.orderItem.create({
      data: {
        orderId: order.id,
        itemType: 'WELCOME_WIENER',
        itemName: [d.dachshundName, d.productName].filter(Boolean).join(' — '),
        itemImage: d.productImage ?? null,
        quantity: d.quantity ?? 1,
        price: d.price ?? 0,
        totalPrice: d.totalPrice ?? null,
        subtotal: d.subtotal ?? null,
        isPhysical: d.isPhysicalProduct ?? false
      }
    })

    await tx.mongoWelcomeWienerOrder.delete({ where: { id: rec.id } })
  }
}

async function runMigrationTransaction(
  tx: any,
  normalizedEmail: string,
  userId: string,
  mongoUser?: any
) {
  if (mongoUser) {
    await migrateUserFields(tx, mongoUser, userId)
  }

  await Promise.all([
    migrateDonations(tx, normalizedEmail, userId),
    migrateOrders(tx, normalizedEmail, userId),
    migrateAdoptionFees(tx, normalizedEmail, userId),
    migrateAuctions(tx, normalizedEmail, userId)
  ])

  await Promise.all([
    migrateProductOrders(tx, normalizedEmail, userId),
    migrateEcardOrders(tx, normalizedEmail, userId),
    migrateWelcomeWienerOrders(tx, normalizedEmail, userId)
  ])

  if (mongoUser) {
    await tx.mongoUser.deleteMany({ where: { email: normalizedEmail } })
  }

  // Check the live side, not staging — staging empties out as records migrate,
  // so this correctly catches both "just migrated now" and "already migrated
  // in a prior run" cases.
  const migratedOrderCount = await tx.order.count({
    where: { userId, source: 'MONGO_MIGRATION' }
  })

  if (mongoUser || migratedOrderCount > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { hasMigrated: true, migratedAt: new Date() }
    })
  }
}

/**
 * Called on first login for each user.
 * Migrates all historical Mongo data into live Prisma tables.
 * Deletes each staging record after successful migration.
 * Once all users have migrated, staging tables will be empty and can be dropped.
 */
export async function migrateMongoUser(
  email: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim()

  try {
    const mongoUser = await prisma.mongoUser.findUnique({ where: { email: normalizedEmail } })

    if (!mongoUser) {
      await prisma.$transaction(
        async (tx) => runMigrationTransaction(tx, normalizedEmail, userId),
        { timeout: 60000 }
      )
      await createLog('info', 'No mongo user record — migrated orphaned records only', {
        email: normalizedEmail,
        userId
      })
      return { success: true }
    }

    await createLog('info', 'Starting migration', { email: normalizedEmail, userId })

    await prisma.$transaction(
      async (tx) => runMigrationTransaction(tx, normalizedEmail, userId, mongoUser),
      { timeout: 60000 }
    )

    await pusherTrigger(`user-${userId}`, 'migration-complete', {})
    await createLog('info', 'Mongo user migration complete', { email: normalizedEmail, userId })
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await createLog('error', 'Mongo user migration failed', {
      email: normalizedEmail,
      userId,
      error: errorMessage
    })
    return { success: false, error: errorMessage }
  }
}
