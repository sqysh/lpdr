'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  /** Icon element, already sized — e.g. <Gavel size={20} aria-hidden="true" /> */
  icon: ReactNode
  title: string
  description?: string
  /** Optional action (button/link) shown below the text. */
  action?: ReactNode
}

export default function AdminEmptyState({ icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-border-light dark:border-border-dark py-20 flex flex-col items-center justify-center gap-4"
    >
      <div className="w-12 h-12 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-quicksand font-black text-text-light dark:text-text-dark mb-1">{title}</p>
        {description && <p className="text-xs font-mono text-muted-light dark:text-muted-dark">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
