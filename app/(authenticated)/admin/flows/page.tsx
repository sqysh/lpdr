import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { Workflow } from 'lucide-react'
import { FlowsClient } from './FlowsClient'

export default function AdminFlowsPage() {
  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Flows" />

      <div className="w-full px-3.5 sm:px-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
        <div className="flex items-start gap-2.5 sm:gap-3 mb-6 sm:mb-8 px-1">
          <Workflow
            className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-[11px] sm:text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed">
            This page walks through what happens, step by step, for the most common things a visitor
            does on the site. If someone emails you a question, paste it into the search box below
            to jump straight to the relevant flow.
          </p>
        </div>
      </div>

      <FlowsClient />
    </main>
  )
}
