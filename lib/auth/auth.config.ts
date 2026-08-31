import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe config. No adapter, no Prisma, no DB access.
 * Used by middleware to read the session cookie's existence and by the
 * full auth.ts which spreads this and adds the adapter + providers.
 */
export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  providers: [], // real providers are added in auth.ts (they need DB/Prisma)
  callbacks: {
    // With database sessions, middleware can't validate against the DB on the
    // Edge. This authorized callback only checks whether a session exists
    // (NextAuth resolves `auth` from the session cookie). Real role checks and
    // validation happen in the authenticated layouts on the Node runtime.
    authorized({ auth }) {
      return !!auth?.user
    }
  }
} satisfies NextAuthConfig
