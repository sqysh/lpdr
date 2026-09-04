'use client'

import { useState } from 'react'
import { Newsletter, NewsletterIssue } from '@prisma/client'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { NewsletterTab } from 'types/newsletter.types'
import { TABS } from 'lib/constants/newsletter.constants'
import { SubscribersPanel } from 'app/(authenticated)/admin/newsletter/_components/SubscribersPanel'
import { IssuesPanel } from 'app/(authenticated)/admin/newsletter/_components/IssuesPanel'

export default function AdminNewsletterPageClient({
  newsletters,
  issues
}: {
  newsletters: Newsletter[]
  issues: NewsletterIssue[]
}) {
  const [tab, setTab] = useState<NewsletterTab>('subscribers')

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Newsletter" />

      {/* Tabs */}
      <div className="border-b border-border-light dark:border-border-dark px-4 sm:px-6">
        <div className="flex items-center gap-0" role="tablist" aria-label="Newsletter sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-[10px] font-mono tracking-[0.2em] uppercase border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                tab === t.id
                  ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                  : 'border-transparent text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div id="panel-subscribers" role="tabpanel" aria-labelledby="tab-subscribers" hidden={tab !== 'subscribers'}>
        <SubscribersPanel newsletters={newsletters} />
      </div>
      <div id="panel-issues" role="tabpanel" aria-labelledby="tab-issues" hidden={tab !== 'issues'}>
        <IssuesPanel issues={issues} />
      </div>
    </main>
  )
}
