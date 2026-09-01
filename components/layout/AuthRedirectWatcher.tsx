'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useNavigationStore } from 'stores/navigation.store'

export function AuthRedirectWatcher() {
  const searchParams = useSearchParams()
  const openMobileNav = useNavigationStore((s) => s.openMobileNav)

  useEffect(() => {
    if (searchParams.get('ref') === 'navdrawer') {
      openMobileNav()
    }
  }, [openMobileNav, searchParams])

  return null
}
