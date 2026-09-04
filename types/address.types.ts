export interface IAddress {
  updatedAt: Date
  id: string
  name: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  zipPostalCode: string
  country: string
}

export interface AddressSectionProps {
  address: IAddress | null
}

export interface UpdateAddressInput {
  name?: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  zipPostalCode: string
  country: string
}
