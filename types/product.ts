export type ProductSizeEntry = { size: string; quantity: number }

export interface IProduct {
  id: string
  name: string | null
  images: string[]
  description: string | null
  price: number
  shippingPrice: number
  countInStock: number
  sizes: ProductSizeEntry[] | null
  isPhysicalProduct: boolean
  isLive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductCreateInputs = {
  name?: string
  images?: string[]
  description?: string
  price?: number
  shippingPrice?: number
  countInStock?: number
  sizes?: ProductSizeEntry[] | null
  isPhysicalProduct?: boolean
  isLive?: boolean
}

export type ProductUpdateInputs = {
  id: string
  name?: string
  images?: string[]
  description?: string
  price?: number
  shippingPrice?: number
  countInStock?: number
  sizes?: ProductSizeEntry[] | null
  isPhysicalProduct?: boolean
  isLive?: boolean
}

export type Product = {
  id: string
  name: string | null
  description: string | null
  images: string[]
  price: number | string
  shippingPrice: number | string
  countInStock: number
  isLive: boolean
  archivedAt: string | null
  /** Derived server-side from orderItems — not a column on Product. */
  sold?: number
}
