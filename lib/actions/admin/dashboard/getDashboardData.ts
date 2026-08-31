'use server'

import { getErrorMessage } from 'app/utils/_error.utils'
import { getPendingShipments } from './queries/getPendingShipments'
import { getTotalRevenue } from './queries/getTotalRevenue'
import { getOrderMetrics } from './queries/getOrderMetrics'
import { getAuctionStats } from './queries/getAuctionStats'
import { getUserStats } from './queries/getUserStats'
import { getContentCounts } from './queries/getContentCounts'
import { getBypassCodeStatus } from './queries/getBypassCodeStatus'
import { getWelcomeWienerRevenue } from './queries/getWelcomeWienerRevenue'
import { getAdoptionFeeStats } from './queries/getAdoptionFeeStats'
import { getTopSupporters } from './queries/getTopSupporters'
import { getTopSellingProducts } from './queries/getTopSellingProducts'
import { createLog } from '../../log/createLog'

export async function getDashboardData() {
  try {
    const [
      pendingShipments,
      totalRevenue,
      orderMetrics,
      auctionStats,
      userStats,
      contentCounts,
      bypassCodeStatus,
      welcomeWienerRevenue,
      adoptionFeeStats,
      topSupporters,
      topProducts
    ] = await Promise.all([
      getPendingShipments(),
      getTotalRevenue(),
      getOrderMetrics(),
      getAuctionStats(),
      getUserStats(),
      getContentCounts(),
      getBypassCodeStatus(),
      getWelcomeWienerRevenue(),
      getAdoptionFeeStats(),
      getTopSupporters(),
      getTopSellingProducts()
    ])

    return {
      success: true,
      error: null,
      data: {
        pendingShipments,
        totalRevenue,
        liveRevenue: totalRevenue,
        ...orderMetrics,
        ...auctionStats,
        ...userStats,
        ...contentCounts,
        ...bypassCodeStatus,
        welcomeWienerRevenue,
        ...adoptionFeeStats,
        topSupporters,
        topProducts
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to load dashboard data', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to load dashboard data', data: null }
  }
}
