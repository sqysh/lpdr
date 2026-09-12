'use client'

import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'

export function LinkBody({
  icon,
  label,
  spinnerClass = 'w-3 h-3'
}: {
  icon: React.ReactNode
  label: string
  spinnerClass?: string
}) {
  const { pending } = useLinkStatus()

  return (
    <>
      {pending ? <Loader2 className={`${spinnerClass} animate-spin`} aria-hidden="true" /> : icon}
      {label}
    </>
  )
}
