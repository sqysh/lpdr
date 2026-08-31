'use client'

import { motion } from 'framer-motion'
import { FileText, ExternalLink } from 'lucide-react'
import { NewsletterIssue } from '@prisma/client'
import { fadeUp } from 'lib/constants/motion.constants'
import { MONTH_INDEX } from 'lib/constants/date.constants'

export default function PublicNewslettersClient({ issues }: { issues: NewsletterIssue[] }) {
  // Only show live issues, grouped by year (year is a string on the model)
  const byYear = issues
    .filter((issue) => issue.isLive)
    .reduce<Record<string, NewsletterIssue[]>>((acc, issue) => {
      if (!acc[issue.year]) acc[issue.year] = []
      acc[issue.year].push(issue)
      return acc
    }, {})

  // Sort issues within each year, most recent month first
  for (const year of Object.keys(byYear)) {
    byYear[year].sort((a, b) => (MONTH_INDEX[b.month] ?? 0) - (MONTH_INDEX[a.month] ?? 0))
  }

  // Years, newest first
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-570px)] bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-16">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Little Paws Rescue
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight mb-3">
            Newsletter{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">Issues</span>
          </h1>
          <p className="text-sm font-mono text-muted-light dark:text-muted-dark max-w-md leading-relaxed">
            Quarterly updates on rescues, adoptions, events, and ways to get involved.
          </p>
        </motion.div>
        {issues.length === 0 ? (
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            No issues published yet
          </p>
        ) : (
          <div className="space-y-10">
            {years.map((year, yi) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: yi * 0.08 }}
              >
                {/* Year label */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                    {year}
                  </span>
                  <span
                    className="flex-1 h-px bg-border-light dark:bg-border-dark"
                    aria-hidden="true"
                  />
                </div>

                {/* Issues */}
                <ul
                  role="list"
                  className="space-y-0 border border-border-light dark:border-border-dark"
                >
                  {byYear[year].map((issue, i) => (
                    <motion.li
                      key={issue.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: yi * 0.08 + i * 0.05 }}
                      className={`border-b border-border-light dark:border-border-dark last:border-b-0 ${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-surface-light dark:bg-surface-dark'
                      }`}
                    >
                      <a
                        href={issue.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${issue.month} ${issue.year} newsletter PDF in new tab`}
                        className="group flex items-center gap-4 px-5 py-4 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                      >
                        {/* Icon */}
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark group-hover:border-primary-light dark:group-hover:border-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark text-muted-light dark:text-muted-dark transition-colors duration-200">
                          <FileText size={13} aria-hidden="true" />
                        </div>

                        {/* Month + year */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors duration-200 truncate">
                            {issue.month} {issue.year}
                          </p>
                        </div>

                        {/* External icon */}
                        <div className="shrink-0 flex items-center gap-3">
                          <span className="hidden xs:block text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
                            Newsletter
                          </span>
                          <ExternalLink
                            size={11}
                            className="text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors duration-200"
                            aria-hidden="true"
                          />
                        </div>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
