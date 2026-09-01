import type { User } from 'next-auth'
import prisma from 'prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { createLog } from '../actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { stampUserGeoFromRequest } from '../actions/_infra/stampUserGeoFromRequest'

export async function handleMagicLinkCallback(user: User): Promise<boolean | string> {
  const existingUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { accounts: true }
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
        emailVerified: existingUser.emailVerified ?? new Date()
      }
    }),
    createLog('info', 'Magic link sign-in', {
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
