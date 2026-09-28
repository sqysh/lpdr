// Tagged so sqysh.com's analytics can tell visits from this credit apart from anywhere else
const creditUrl = (auctionLink: string) =>
  `https://sqysh.com/?${new URLSearchParams({
    utm_source: 'littlepawsdr.org',
    utm_medium: 'referral',
    utm_campaign: 'client_credit',
    utm_content: 'auction_footer',
    utm_term: auctionLink
  })}`

export function AuctionFooter({ auctionLink }: { auctionLink: string }) {
  return (
    <footer className="border-t border-border-light dark:border-border-dark">
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 py-4 flex flex-col xs:flex-row items-center justify-between gap-2">
        <p className="text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">
          &copy; {new Date().getFullYear()} Little Paws Dachshund Rescue
        </p>
        <a
          href={creditUrl(auctionLink)}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center gap-1.5 min-h-8 text-[10px] font-mono tracking-tag text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          built by{' '}
          <span className="font-black group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">sqysh</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </footer>
  )
}
