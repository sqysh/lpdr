import { Role } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'

declare module '@auth/core/adapters' {
  interface AdapterUser {
    id: string
    role: Role
    firstName: string | null
    lastName: string | null
    nameConfirmedAt: Date | null
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      // Set for accounts whose name was guessed from their email address, which the name prompt asks about
      needsName: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: Role
  }
}
