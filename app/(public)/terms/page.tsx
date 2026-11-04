'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const EFFECTIVE_DATE = 'April 22, 2026'

interface SectionProps {
  number: string
  title: string
  children: React.ReactNode
}

function Section({ number, title, children }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      aria-labelledby={`section-${number}`}
      className="border-t border-border-light dark:border-border-dark pt-8 sm:pt-10"
    >
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-[10px] tracking-eyebrow text-primary-light dark:text-primary-dark shrink-0">{number}</span>
        <h2
          id={`section-${number}`}
          className="font-quicksand font-black text-lg sm:text-xl text-text-light dark:text-text-dark leading-tight"
        >
          {title}
        </h2>
      </div>
      <div className="pl-0 sm:pl-8 space-y-4 font-nunito text-sm sm:text-[15px] text-text-light dark:text-text-dark leading-relaxed">
        {children}
      </div>
    </motion.section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2" role="list">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1.75 w-1 h-1 bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-quicksand font-bold text-[13px] sm:text-sm text-text-light dark:text-text-dark uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-light dark:text-muted-dark">{children}</p>
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark px-4 py-3">
      <p className="font-nunito text-sm text-text-light dark:text-text-dark leading-relaxed">{children}</p>
    </div>
  )
}

export default function TermsPage() {
  return (
    <main id="main-content" className="bg-bg-light dark:bg-bg-dark min-h-screen">
      {/* Hero */}
      <section aria-labelledby="terms-heading" className="relative border-b border-border-light dark:border-border-dark overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.055] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
          aria-hidden="true"
        />
        <div className="absolute top-0 left-0 w-1 h-20 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />

        <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 mb-4"
            aria-hidden="true"
          >
            <div className="w-6 h-px bg-primary-light dark:bg-primary-dark" />
            <span className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Legal</span>
          </motion.div>

          <motion.h1
            id="terms-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="font-quicksand font-black text-3xl xs:text-4xl sm:text-5xl text-text-light dark:text-text-dark leading-tight mb-4 tracking-tight"
          >
            Terms of Service
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3 sm:gap-6"
          >
            <p className="font-mono text-[11px] tracking-widest text-muted-light dark:text-muted-dark">Effective {EFFECTIVE_DATE}</p>
            <span className="w-px h-3 bg-border-light dark:bg-border-dark" aria-hidden="true" />
            <p className="font-mono text-[11px] tracking-widest text-muted-light dark:text-muted-dark">littlepawsdr.org</p>
            <span className="w-px h-3 bg-border-light dark:bg-border-dark" aria-hidden="true" />
            <Link
              href="/"
              className="font-mono text-[11px] tracking-widest uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Home →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-14 space-y-10 sm:space-y-12">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6"
        >
          <p className="font-nunito text-sm sm:text-[15px] text-text-light dark:text-text-dark leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your use of the Little Paws Dachshund Rescue website and platform at{' '}
            <a href="https://littlepawsdr.org" className="text-primary-light dark:text-primary-dark hover:underline underline-offset-2">
              littlepawsdr.org
            </a>{' '}
            (&quot;Platform&quot;), operated by Little Paws Dachshund Rescue (&quot;Little Paws,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;), a volunteer-run 501(c)(3) nonprofit organization.
          </p>
          <p className="font-nunito text-sm sm:text-[15px] text-muted-light dark:text-muted-dark leading-relaxed mt-3">
            By creating an account or using our Platform, you agree to be bound by these Terms. Please read them carefully. If you do not
            agree, do not use our Platform.
          </p>
        </motion.div>

        {/* Section 1 */}
        <Section number="01" title="Eligibility">
          <p>
            You must be at least 18 years of age to create an account or make any purchase or donation through our Platform. By using our
            Platform, you represent and warrant that you meet this requirement.
          </p>
          <p>
            Our Platform is available to residents of the United States. We make no representation that the Platform is appropriate or
            available in other locations.
          </p>
        </Section>

        {/* Section 2 */}
        <Section number="02" title="Accounts">
          <SubSection title="Registration">
            <p>
              To access certain features of our Platform, you must create an account. You may sign in using your email address via a magic
              link or through Google OAuth. You agree to provide accurate and complete information when creating your account and to keep it
              up to date.
            </p>
          </SubSection>
          <SubSection title="Account Security">
            <p>
              You are responsible for maintaining the security of your account. Because we use passwordless authentication via magic links
              and OAuth, you should keep your email account secure and log out of our Platform on shared devices. If you believe your
              account has been compromised, contact us immediately.
            </p>
          </SubSection>
          <SubSection title="Account Termination">
            <p>
              We reserve the right to suspend or terminate your account at any time if we believe you have violated these Terms, engaged in
              fraudulent activity, or for any other reason at our sole discretion. You may also request deletion of your account at any time
              by contacting us.
            </p>
          </SubSection>
        </Section>

        {/* Section 3 */}
        <Section number="03" title="Donations">
          <p>
            All donations made through our Platform are voluntary contributions to Little Paws Dachshund Rescue, a 501(c)(3) nonprofit
            organization. Donations are generally tax-deductible to the extent permitted by law. We recommend consulting a tax advisor
            regarding your specific situation.
          </p>
          <Warning>
            All donations are final and non-refundable unless we determine at our sole discretion that a refund is appropriate due to a
            technical error or other exceptional circumstance.
          </Warning>
          <p>
            Donation amounts displayed on our Platform are processed in U.S. dollars. Payment processing is handled by Stripe, Inc. By
            making a donation you agree to Stripe&apos;s Terms of Service.
          </p>
          <p>
            We will send a donation receipt to the email address associated with your account. It is your responsibility to maintain records
            of your donations for tax purposes.
          </p>
        </Section>

        {/* Section 4 */}
        <Section number="04" title="Auctions">
          <SubSection title="Bidding">
            <p>
              When you place a bid in one of our auctions, you are entering into a binding commitment to purchase the item at your bid price
              if you are the winning bidder at the close of the auction. Bids cannot be retracted once placed.
            </p>
            <BulletList
              items={[
                'All bids are in U.S. dollars',
                'The highest bid at the close of the auction wins the item',
                'In the event of a tie, the earlier bid takes precedence',
                'We reserve the right to cancel or extend an auction at any time',
                'Minimum bid increments may apply and will be displayed on the auction page'
              ]}
            />
          </SubSection>
          <SubSection title="Winning Bidder Obligations">
            <p>
              If you are the winning bidder, you will receive an email notification with instructions to complete payment. Payment must be
              completed within the timeframe specified in that notification. Failure to complete payment may result in forfeiture of your
              winning bid, suspension of your bidding privileges, and recovery of costs incurred by Little Paws.
            </p>
          </SubSection>
          <SubSection title="Auction Integrity">
            <Warning>
              Shill bidding, bid manipulation, or any attempt to artificially inflate prices or interfere with the auction process is
              strictly prohibited and will result in immediate account termination.
            </Warning>
          </SubSection>
          <SubSection title="Item Descriptions">
            <p>
              We make reasonable efforts to accurately describe auction items. All items are sold as described. Little Paws makes no
              warranties, express or implied, regarding the condition, authenticity, or fitness for a particular purpose of any auction
              item.
            </p>
          </SubSection>
        </Section>

        {/* Section 5 */}
        <Section number="05" title="Store Purchases">
          <p>
            Our store sells physical and digital products including merchandise, Welcome Wiener donation packages, and e-cards. By placing
            an order you agree to pay the listed price plus any applicable shipping fees and taxes.
          </p>
          <SubSection title="Physical Products">
            <BulletList
              items={[
                'Orders are processed within 3–5 business days',
                'Shipping times vary by destination and carrier',
                'We are not responsible for delays caused by carriers or customs',
                'Risk of loss passes to you upon handoff to the carrier'
              ]}
            />
          </SubSection>
          <SubSection title="Digital Products & Donations">
            <p>
              Welcome Wiener packages and e-cards are digital items delivered immediately upon successful payment. These items are
              non-refundable once delivered.
            </p>
          </SubSection>
          <SubSection title="Returns & Refunds">
            <p>
              Physical merchandise may be returned within 14 days of delivery if it arrives damaged or defective. To initiate a return,
              contact us with your order number and a description of the issue. We will provide a prepaid return label for eligible returns.
              Refunds are issued to the original payment method within 5–10 business days of receiving the returned item.
            </p>
            <Muted>We do not accept returns for items that have been used, washed, or altered. Sale items are final sale.</Muted>
          </SubSection>
        </Section>

        {/* Section 6 */}
        <Section number="06" title="Adoption Fees">
          <p>
            Adoption fees paid through our Platform are non-refundable deposits that reserve your place in the adoption process for a
            specific dog. Payment of an adoption fee does not guarantee placement of a dog with you — placement decisions are made at the
            sole discretion of Little Paws based on the dog&apos;s needs and your application.
          </p>
          <p>
            Adoption application processing is managed through Rescue Groups, a separate platform. These Terms do not govern your use of
            Rescue Groups.
          </p>
          <Warning>
            If an adoption is not completed due to circumstances within our control, your adoption fee may be applied to another dog or
            refunded at our discretion. Fees are not refunded if you withdraw your application or are found to be ineligible after
            application review.
          </Warning>
        </Section>

        {/* Section 7 */}
        <Section number="07" title="Prohibited Conduct">
          <p>You agree not to:</p>
          <BulletList
            items={[
              'Use our Platform for any unlawful purpose or in violation of any applicable law',
              'Engage in shill bidding, bid manipulation, or auction fraud',
              'Submit false, misleading, or fraudulent payment information',
              'Create multiple accounts to circumvent a suspension or to gain an unfair advantage in auctions',
              'Attempt to reverse-engineer, scrape, or systematically extract data from our Platform',
              'Attempt to gain unauthorized access to any portion of our Platform or its related systems',
              'Harass, threaten, or intimidate other users, volunteers, or staff',
              'Use our Platform to send unsolicited communications or spam',
              'Impersonate Little Paws, its volunteers, or any other person or entity'
            ]}
          />
        </Section>

        {/* Section 8 */}
        <Section number="08" title="Intellectual Property">
          <p>
            All content on our Platform, including text, photographs, graphics, logos, and dog profiles, is the property of Little Paws
            Dachshund Rescue or is used with permission. You may not reproduce, distribute, modify, or create derivative works from any
            content on our Platform without our prior written consent.
          </p>
          <p>
            Dog photographs submitted by fosters and volunteers remain the property of the photographer. By submitting a photograph to us,
            you grant Little Paws a non-exclusive, royalty-free license to use that photograph on our Platform and in our communications.
          </p>
        </Section>

        {/* Section 9 */}
        <Section number="09" title="Disclaimers">
          <p>
            Our Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or
            implied. We do not warrant that:
          </p>
          <BulletList
            items={[
              'The Platform will be available at all times or free of errors',
              'Auction results will be free from technical errors or disputes',
              'Dog descriptions, photographs, or health information are complete or error-free',
              'Any particular dog will be available for adoption at the time of your application'
            ]}
          />
          <Muted>
            Little Paws is a volunteer-run organization. We do our best but cannot guarantee uninterrupted service or perfect accuracy in
            all listings.
          </Muted>
        </Section>

        {/* Section 10 */}
        <Section number="10" title="Limitation of Liability">
          <Warning>
            To the fullest extent permitted by law, Little Paws Dachshund Rescue, its officers, directors, volunteers, and agents shall not
            be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our
            Platform, including but not limited to loss of data, loss of donations, or auction disputes. Our total liability to you for any
            claim shall not exceed the amount you paid to us in the 12 months preceding the claim.
          </Warning>
        </Section>

        {/* Section 11 */}
        <Section number="11" title="Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless Little Paws Dachshund Rescue and its volunteers, officers, directors, and
            agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees)
            arising out of or in any way connected with your use of our Platform, your violation of these Terms, or your violation of any
            rights of a third party.
          </p>
        </Section>

        {/* Section 12 */}
        <Section number="12" title="Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of
            law provisions. Any dispute arising under these Terms shall be resolved exclusively in the state or federal courts located in
            Florida, and you consent to the personal jurisdiction of such courts.
          </p>
        </Section>

        {/* Section 13 */}
        <Section number="13" title="Changes to These Terms">
          <p>
            We may update these Terms from time to time. When we do, we will update the effective date at the top of this page and, for
            material changes, notify registered users by email. Your continued use of our Platform after changes take effect constitutes
            your acceptance of the updated Terms.
          </p>
        </Section>

        {/* Section 14 */}
        <Section number="14" title="Contact Us">
          <p>If you have questions about these Terms, please contact us:</p>
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5">
            <p className="font-quicksand font-bold text-text-light dark:text-text-dark mb-2">Little Paws Dachshund Rescue</p>
            <Link
              href="/contact"
              className="font-mono text-[11px] tracking-widest text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              littlepawsdr.org/contact →
            </Link>
          </div>
          <Muted>We are a volunteer-run organization and will do our best to respond within 5 business days.</Muted>
        </Section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="border-t border-border-light dark:border-border-dark pt-8 flex flex-wrap items-center justify-between gap-4"
        >
          <p className="font-mono text-[10px] tracking-widest text-muted-light dark:text-muted-dark">
            Little Paws Dachshund Rescue — Terms of Service — Effective {EFFECTIVE_DATE}
          </p>
          <Link
            href="/privacy-policy"
            className="font-mono text-[10px] tracking-tag uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            Privacy Policy →
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
