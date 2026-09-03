import { RecurringFrequency } from '@prisma/client'
import { SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'

export type Tier = {
  id: string
  name: string
  price: { MONTHLY: number; YEARLY: number }
  badge: string | null
  tier: 'bronze' | 'silver' | 'gold' | 'elite'
}

export type TierKey = 'bronze' | 'silver' | 'gold' | 'elite'

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]
export type SubscriptionTierId = SubscriptionTier['id']

export type BillingInterval = RecurringFrequency
