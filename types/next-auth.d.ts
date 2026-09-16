import { Role } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'

declare module '@auth/core/adapters' {
  interface AdapterUser {
    id: string
    role: Role
    firstName: string | null
    lastName: string | null
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      hasSeenWelcome: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: Role
  }
}
