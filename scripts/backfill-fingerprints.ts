import prisma from '../prisma/client'
import { stripeClient } from '../lib/stripe/stripe-client'

async function main() {
  const rows = await prisma.paymentMethod.findMany({
    where: { fingerprint: null },
    select: { id: true, stripePaymentId: true, cardLast4: true }
  })

  console.log(`${rows.length} rows to backfill`)

  for (const row of rows) {
    try {
      const pm = await stripeClient.paymentMethods.retrieve(row.stripePaymentId)
      const fingerprint = pm.card?.fingerprint

      if (!fingerprint) {
        console.log(`skip ${row.id} (••••${row.cardLast4}) — no fingerprint`)
        continue
      }

      await prisma.paymentMethod.update({
        where: { id: row.id },
        data: { fingerprint }
      })

      console.log(`ok ${row.id} (••••${row.cardLast4}) → ${fingerprint}`)
    } catch (err) {
      console.log(`fail ${row.id} (••••${row.cardLast4}) —`, (err as Error).message)
    }
  }
}

main().finally(() => prisma.$disconnect())
