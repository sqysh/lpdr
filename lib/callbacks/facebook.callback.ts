import type { User, Account, Profile } from 'next-auth'
import { createLog } from '../actions/log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import { stampUserGeoFromRequest } from '../actions/auth/stampUserGeoFromRequest'

interface FacebookProfile extends Profile {
  first_name?: string | null
  last_name?: string | null
  picture?: {
    data?: {
      url?: string | null
    }
  }
}

export async function handleFacebookCallback(
  user: User,
  account: Account,
  profile: FacebookProfile
): Promise<boolean> {
  if (!user.email) {
    await createLog('warn', 'Facebook sign-in missing email', { profile })
    return false
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { accounts: true }
    })

    if (existingUser) {
      if (existingUser.status === 'SUSPENDED') return false
      if (existingUser.status === 'TERMINATED') return false

      const hasFacebookAccount = existingUser.accounts.some((a) => a.provider === 'facebook')

      const details = await stampUserGeoFromRequest(existingUser.id)

      await Promise.all([
        !hasFacebookAccount
          ? prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope
              }
            })
          : Promise.resolve(),
        prisma.user.update({
          where: { id: existingUser.id },
          data: {
            lastLoginAt: new Date(),
            lastGeoLatitude: details.geoLatitude,
            lastGeoLongitude: details.geoLongitude,
            lastGeoCity: details.geoCity,
            lastGeoRegion: details.geoRegion,
            lastGeoCountry: details.geoCountry,
            firstName: existingUser.firstName || profile?.first_name,
            lastName: existingUser.lastName || profile?.last_name,
            image: profile?.picture?.data?.url || existingUser.image
          }
        }),
        createLog('info', 'Facebook sign-in', {
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
    }

    return true
  } catch (error) {
    await createLog('error', 'Facebook callback failed', {
      email: user.email,
      error: getErrorMessage(error)
    })
    return false
  }
}
