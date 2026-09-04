export type WelcomeWienerCategory = 'gear' | 'medical' | 'food' | 'comfort' | 'training' | 'enrichment'

export interface WelcomeWienerProduct {
  id: string
  name: string
  description: string
  price: number
  category: WelcomeWienerCategory
  image?: string
}

export interface IWelcomeWiener {
  id: string
  createdAt: Date
  updatedAt: Date

  // Details
  name: string | null
  bio: string | null
  age: string | null
  displayUrl: string | null
  images: string[]

  // Donation options
  associatedProducts: WelcomeWienerProduct[]

  // Status
  isPhysicalProduct: boolean
  isLive: boolean
  archivedAt: Date | null
}

export type WelcomeWienerInputs = {
  name?: string
  bio?: string
  age?: string
  displayUrl?: string
  images?: string[]
  associatedProducts?: WelcomeWienerProduct[]
  isLive?: boolean
}
