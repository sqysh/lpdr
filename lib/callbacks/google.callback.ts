import { User as NextAuthUser } from 'next-auth'
import { Account } from 'next-auth'
import prisma from 'prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { createLog } from '../actions/log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'
import { stampUserGeoFromRequest } from '../actions/_infra/stampUserGeoFromRequest'

interface GoogleProfile {
  sub?: string | null
  name?: string | null
  given_name?: string | null
  family_name?: string | null
  email?: string | null
  email_verified?: boolean | null
  picture?: string | null
  locale?: string | null
}

export async function handleGoogleCallback(
  user: NextAuthUser,
  __: Account,
  profile?: GoogleProfile
): Promise<boolean | string> {
  const existingUser = await prisma.user.findUnique({
    where: { email: user.email! }
  })

  if (!existingUser) return true
  if (existingUser.status === 'SUSPENDED') return '/auth/suspended'
  if (existingUser.status === 'TERMINATED') return '/auth/terminated'

  const details = await stampUserGeoFromRequest(existingUser.id)

  await Promise.all([
    prisma.user.update({
      where: { id: existingUser.id },
      data: {
        lastLoginAt: new Date(),
        lastGeoLatitude: details.geoLatitude,
        lastGeoLongitude: details.geoLongitude,
        lastGeoCity: details.geoCity,
        lastGeoRegion: details.geoRegion,
        lastGeoCountry: details.geoCountry,
        firstName: existingUser.firstName || profile?.given_name,
        lastName: existingUser.lastName || profile?.family_name,
        image: profile?.picture || existingUser.image,
        emailVerified: existingUser.emailVerified ?? new Date()
      }
    }),
    createLog('info', 'Google sign-in', {
      userId: existingUser.id,
      email: existingUser.email,
      ip: details.ip,
      device: details.device,
      browser: details.browser,
      os: details.os,
      city: details.geoCity,
      region: details.geoRegion,
      country: details.geoCountry
    })
  ])

  await pusherSuperuser('user-signed-in', {
    email: existingUser.email,
    name: existingUser.firstName,
    userId: existingUser.id
  }).catch((error) =>
    createLog('warn', 'Pusher superuser trigger failed', {
      event: 'user-signed-in',
      userId: existingUser.id,
      error: getErrorMessage(error)
    })
  )

  return true
}
