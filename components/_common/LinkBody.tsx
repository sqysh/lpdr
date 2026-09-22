'use client'

import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'

export function LinkBody({
  icon,
  label,
  spinnerClass = 'w-3 h-3',
  iconAfter = false
}: {
  icon: React.ReactNode
  label: string
  spinnerClass?: string
  iconAfter?: boolean
}) {
  const { pending } = useLinkStatus()
  const glyph = pending ? <Loader2 className={`${spinnerClass} animate-spin`} aria-hidden="true" /> : icon

  return (
    <>
      {!iconAfter && glyph}
      {label}
      {iconAfter && glyph}
    </>
  )
}
