import Link from 'next/link'
import createNewsletter from 'lib/actions/public/newsletter/createNewsletter'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { NAV_LINKS, SOCIAL_LINKS } from 'lib/constants/footer.constants'
import Picture from 'components/_common/Picture'
import { useStatusMessage } from '@hooks/useStatusMessage.hook'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const renderedAt = useRef(0)

  const { status, flash } = useStatusMessage()

  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email.trim()) {
      flash({ tone: 'error', message: 'Please enter your email' })
      return
    }

    setLoading(true)

    const result = await createNewsletter({
      email: email.trim(),
      website,
      renderedAt: renderedAt.current
    })

    setLoading(false)

    if (!result.success) {
      flash({
        tone: 'error',
        message: result.error ?? 'Something went wrong. Please try again.'
      })
      return
    }

    setEmail('')
    flash({ tone: 'success', message: 'You are subscribed' })
  }

  return (
    <footer
      className="bg-navbar-light dark:bg-navbar-dark border-t border-border-light dark:border-border-dark"
      aria-label="Site footer"
    >
      <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Top accent line ── */}
        <div className="h-px bg-primary-light dark:bg-primary-dark opacity-30" aria-hidden="true" />

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 py-14">
          {/* Col 1 — Brand ── */}
          <div className="xs:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="Little Paws Dachshund Rescue — Home"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <Picture
                src="/images/logos/logo.png"
                alt="Little Paws Dachshund Rescue"
                className="block w-auto h-24 object-contain hover:opacity-80 transition-opacity duration-200"
                priority
              />
            </Link>

            <address className="not-italic mt-6 space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Contact
                </p>
              </div>
              <a
                href="mailto:lpdr@littlepawsdr.org"
                className="block text-sm font-mono text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark pl-7"
              >
                lpdr@littlepawsdr.org
              </a>
            </address>

            {/* Socials */}
            <nav aria-label="Social media links" className="mt-6 pl-7">
              <ul className="flex items-center gap-3" role="list">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in new tab)`}
                      className="flex items-center justify-center w-8 h-8 border border-border-light dark:border-border-dark text-on-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      {s.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Col 3 — Nav ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
              <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                Quick Links
              </h2>
            </div>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3" role="list">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm font-mono text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      <span
                        className="block w-0 h-px bg-primary-light dark:bg-primary-dark transition-all duration-200 group-hover:w-4"
                        aria-hidden="true"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Col 4 — Newsletter ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
              <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                Newsletter
              </h2>
            </div>
            <p className="text-[11px] font-mono text-on-dark leading-relaxed mb-4">
              Stay up to date with rescues, events, and ways to help.
            </p>
            <form onSubmit={handleSubmit} aria-label="Newsletter signup" className="relative space-y-2.5">
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute w-px h-px overflow-hidden -left-96"
              />
              <div>
                <label htmlFor="footer-email" className="sr-only">
                  Your email address
                </label>
                <input
                  name="email"
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  autoComplete="email"
                  aria-describedby={status ? 'newsletter-status' : undefined}
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-on-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                aria-disabled={loading}
                className="w-full py-2.5 px-4 text-[10px] font-mono tracking-[0.2em] uppercase border border-primary-light dark:border-primary-dark text-white hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>

              {status && (
                <p
                  id="newsletter-status"
                  role={status.tone === 'error' ? 'alert' : 'status'}
                  className={`text-[10px] font-mono tracking-widest ${
                    status.tone === 'error' ? 'text-red-400' : 'text-primary-light dark:text-primary-dark'
                  }`}
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border-light dark:border-border-dark py-6 flex flex-col xs:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap justify-center xs:justify-start">
            <Link
              href="/privacy-policy"
              className="text-[10px] font-mono tracking-[0.15em] uppercase text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Privacy Policy
            </Link>
            <span className="w-px h-3 bg-border-light dark:bg-border-dark" aria-hidden="true" />
            <Link
              href="/terms"
              className="text-[10px] font-mono tracking-[0.15em] uppercase text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-[10px] font-mono text-on-dark text-center xs:text-right">
            Built &amp; designed by{' '}
            <a
              href="https://sqysh.com?utm_source=littlepawsdr&utm_medium=referral&utm_campaign=site_footer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Sqysh
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
