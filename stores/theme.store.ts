'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

type ThemeState = {
  isDark: boolean
  setIsDark: (v: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  setIsDark: (isDark) => set({ isDark })
}))

export function useSyncTheme() {
  const setIsDark = useThemeStore((s) => s.setIsDark)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const dark = mediaQuery.matches
      document.documentElement.classList.toggle('dark', dark)
      setIsDark(dark)
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [setIsDark])
}
