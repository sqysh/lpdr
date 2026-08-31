import prisma from 'prisma/client'
import { monthRange } from 'app/utils/_date.utils'

export async function getAdoptionFeeStats() {
  const now = new Date()
  const thisMonth = monthRange(now.getFullYear(), now.getMonth())
  const sixteenWeeksAgo = new Date(now.getTime() - 112 * 24 * 60 * 60 * 1000)

  const [totalAdoptionFees, adoptionFeesThisMonth, adoptionFeeRecords] = await Promise.all([
    prisma.adoptionFee.count({ where: { status: 'ACTIVE' } }),
    prisma.adoptionFee.count({ where: { status: 'ACTIVE', createdAt: { gte: thisMonth.start } } }),
    prisma.adoptionFee.findMany({
      where: { createdAt: { gte: sixteenWeeksAgo }, status: 'ACTIVE' },
      select: { createdAt: true, feeAmount: true }
    })
  ])

  const heatmapMap = new Map<string, { count: number; amount: number }>()
  for (const fee of adoptionFeeRecords) {
    const key = fee.createdAt.toISOString().slice(0, 10)
    const prev = heatmapMap.get(key) ?? { count: 0, amount: 0 }
    heatmapMap.set(key, {
      count: prev.count + 1,
      amount: prev.amount + Number(fee.feeAmount ?? 15)
    })
  }
  const adoptionFeeHeatmap = Array.from(heatmapMap.entries()).map(([date, { count, amount }]) => ({
    date,
    count,
    amount
  }))

  return { totalAdoptionFees, adoptionFeesThisMonth, adoptionFeeHeatmap }
}
