import type { AdoptionFeeStatus } from '@prisma/client'

export interface IAdoptionFee {
  id: string
  firstName: string | null
  lastName: string | null
  feeAmount: number | null
  email: string | null
  state: string | null
  bypassCode: string | null
  status: AdoptionFeeStatus
  expiresAt: Date | null
  createdAt: Date
  geoRegion: string | null
}

export interface UpdateAdoptionFeeInputs {
  adoptionFeeId: string
  firstName: string
  lastName: string
  email: string
  state: string
}
