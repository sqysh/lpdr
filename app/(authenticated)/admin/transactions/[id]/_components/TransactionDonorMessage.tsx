import { MessageSquareQuote } from 'lucide-react'

export function TransactionDonorMessage({ message }: { message: string }) {
  return (
    <section
      aria-labelledby="donor-message-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <header className="flex items-center gap-2 px-4 py-2.5 border-b border-border-light dark:border-border-dark">
        <MessageSquareQuote className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark" aria-hidden="true" />
        <h2 id="donor-message-heading" className="text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          Message from the donor
        </h2>
      </header>
      {/* pre-wrap keeps the donor's own line breaks, which matter in a dedication */}
      <blockquote className="px-4 py-4 border-l-2 border-primary-light dark:border-primary-dark m-4 text-sm font-nunito leading-relaxed text-text-light dark:text-text-dark whitespace-pre-wrap break-words">
        {message}
      </blockquote>
    </section>
  )
}
