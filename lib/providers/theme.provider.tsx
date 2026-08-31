'use client'

import { setIsDark } from 'lib/store/slices/uiSlice'
import { useAppDispatch } from 'lib/store/store'
import { useEffect, ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const dark = mediaQuery.matches
      document.documentElement.classList.toggle('dark', dark)
      dispatch(setIsDark(dark))
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [dispatch])

  return <>{children}</>
}
