export function AgreementFooter() {
  return (
    <footer className="border-t border-border-light dark:border-border-dark">
      <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-muted-light dark:text-muted-dark">
        <p>
          Little Paws Dachshund Rescue ·{' '}
          <a
            href="mailto:applications@littlepawsdr.org"
            className="hover:text-primary-light dark:hover:text-primary-dark underline-offset-2 hover:underline"
          >
            lpdr@littlepawsdr.org
          </a>
        </p>

        <a
          href="https://sqysh.com"
          target="_blank"
          rel="noopener noreferrer"
          className="tracking-eyebrow hover:text-primary-light dark:hover:text-primary-dark transition-colors"
        >
          powered by sqysh
        </a>
      </div>
    </footer>
  )
}
