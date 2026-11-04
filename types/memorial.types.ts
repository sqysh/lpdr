export type AdminMemorial = {
  id: string
  dogName: string
  message: string | null
  photoUrl: string | null
  donorDisplayName: string | null
  showDonorName: boolean
  status: 'PENDING' | 'APPROVED' | 'HIDDEN' | 'EXPIRED'
  hiddenReason: string | null
  approvedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  order: { id: string; totalAmount: number; status: string; customerName: string | null; customerEmail: string | null } | null
}
