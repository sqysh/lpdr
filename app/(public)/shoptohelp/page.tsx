'use client'

import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import Picture from 'components/_common/Picture'

const shopToHelpData = [
  {
    textKey: 'Little Paws Dachshund Rescue and Chewy have teamed up! Shop our wishlist today.',
    linkKey:
      'https://www.chewy.com/g/little-paws-dachshund-resccue_b106319134#wish-list&wishlistsortby=DEFAULT',
    img: '/images/shop-to-help/chewy.png'
  },
  {
    textKey:
      'Support Little Paws by shopping with iGive—your everyday shopping makes a difference!',
    linkKey: 'http://www.igive.com/welcome/lptest/wr31a.cfm?c=64803&p=19992&jltest=1',
    img: '/images/shop-to-help/i-give.png'
  },
  {
    textKey: 'Show your love for Little Paws with our Bonfire merch. Buy today and support!',
    linkKey: 'https://www.bonfire.com/store/little-paws-dachshund-rescue',
    img: '/images/shop-to-help/bonfire.webp'
  }
]

export default function ShopToHelp() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-12 sm:mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Shop To Help
            </p>
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
          </div>
          <h1 className="font-quicksand text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark leading-tight mb-4">
            Shop &amp; Make a{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">Difference</span>
          </h1>
          <p className="text-base text-muted-light dark:text-on-dark max-w-lg mx-auto leading-relaxed">
            Support Little Paws Dachshund Rescue by shopping with our partners! Each purchase helps
            provide the supplies and resources needed to care for our dachshunds.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark"
          role="list"
          aria-label="Shop to help partners"
        >
          {shopToHelpData.map((item, i) => (
            <motion.li
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              custom={i}
              className="bg-bg-light dark:bg-bg-dark flex flex-col"
            >
              {/* Logo area */}
              <div className="bg-surface-light dark:bg-surface-dark flex items-center justify-center px-8 py-10 border-b border-border-light dark:border-border-dark">
                <Picture
                  priority={false}
                  src={item.img}
                  alt=""
                  aria-hidden="true"
                  className="max-h-16 max-w-45 w-auto object-contain"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5 sm:p-6 gap-4">
                <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed flex-1">
                  {item.textKey}
                </p>
                <a
                  href={item.linkKey}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Shop with this partner to support Little Paws (opens in new tab)`}
                  className="block w-full text-center bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark text-white font-semibold text-sm py-3 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Shop Now
                </a>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  )
}
