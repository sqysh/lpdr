import { Decimal } from '@prisma/client/runtime/client'

export interface IAdoptionFee {
  id: string
  firstName: string | null
  lastName: string | null
  feeAmount: number | Decimal | null
  email: string
  state?: string
  bypassCode?: string
  status: AdoptionFeeStatus
  expiresAt: Date | null
  createdAt: Date

  order?: { geoRegion: string | null } | null
}

export interface UpdateAdoptionFeeInputs {
  adoptionFeeId: string
  firstName: string
  lastName: string
  email: string
  state: string
}

export type AdoptionFeeStatus = 'ACTIVE' | 'EXPIRED' | 'APPROVED' | 'REJECTED'
