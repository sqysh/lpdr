import 'server-only'
import { headers } from 'next/headers'
import prisma from 'prisma/client'

/**
 * The agreement if it belongs to this user and has been sent, otherwise null. Callers return the same
 * "not found" either way, so an id never confirms that someone else's agreement exists.
 */
export async function findOwnedAgreement(id: string, userId: string) {
  const agreement = await prisma.adoptionAgreement.findUnique({
    where: { id },
    include: { signatures: { select: { role: true } } }
  })

  if (!agreement || agreement.userId !== userId) return null
  // Drafts aren't the adopter's to see yet, and a voided agreement is gone as far as they're concerned
  if (agreement.status === 'DRAFT' || agreement.status === 'VOID') return null

  return agreement
}

// Who and where, recorded with every signature. This is what makes a typed name hold up
export async function getSigningContext() {
  const h = await headers()
  return {
    ipAddress: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: h.get('user-agent')?.slice(0, 500) ?? null
  }
}

// True if the agreement changed after the adopter's page loaded it
export const changedSince = (updatedAt: Date, loadedAt: string) => updatedAt.getTime() > Date.parse(loadedAt)

export const hasSigned = (signatures: { role: string }[], role: string) => signatures.some((s) => s.role === role)
