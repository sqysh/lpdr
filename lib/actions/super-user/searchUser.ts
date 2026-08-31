'use server'

import prisma from 'prisma/client'

export async function searchUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true
    }
  })

  if (!user) return { success: false, data: null }

  return {
    success: true,
    data: {
      id: user.id,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      status: user.status
    }
  }
}
