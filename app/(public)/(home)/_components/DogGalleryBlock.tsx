'use client'

import Picture from 'components/_common/Picture'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LinkBody } from 'components/_common/LinkBody'

type GalleryImage = {
  id: number
  image: string
  span?: 'tall' | 'wide' | 'normal' | 'featured'
  /** Shown on the photo. Leave out when there's no name to show */
  name?: string
  alt: string
}

// Seven tiles fill a 4 by 3 grid exactly on tablet and up: tall (1x2) + featured (2x2) + four normal + wide (2x1)
const DOGS: GalleryImage[] = [
  { id: 1, image: '/images/gallery/gallery-3.jpg', span: 'tall', name: 'Cruz', alt: 'Cruz, a dachshund rescued by Little Paws' },
  { id: 2, image: '/images/gallery/gallery-9.jpg', span: 'featured', name: 'Sammy', alt: 'Sammy, a dachshund rescued by Little Paws' },
  {
    id: 3,
    image: '/images/gallery/gallery-2.jpg',
    span: 'normal',
    name: 'Hoss & Little Joe',
    alt: 'Hoss and Little Joe, two dachshunds rescued by Little Paws'
  },
  {
    id: 4,
    image: '/images/gallery/gallery-8.jpg',
    span: 'normal',
    name: 'Fred & Rudy',
    alt: 'Fred and Rudy, two dachshunds rescued by Little Paws'
  },
  { id: 5, image: '/images/gallery/gallery-6.jpg', span: 'normal', alt: 'A dachshund cuddling with a colorful patchwork pillow' },
  { id: 6, image: '/images/gallery/gallery-7.jpg', span: 'normal', name: 'Daisy', alt: 'Daisy, a dachshund rescued by Little Paws' },
  { id: 7, image: '/images/gallery/gallery-1.jpg', span: 'wide', name: 'Hoss & Little Joe', alt: 'Hoss and Little Joe together' }
]

const SPAN_CLASS: Record<NonNullable<GalleryImage['span']>, string> = {
  tall: 'col-span-2 sm:col-span-1 row-span-2',
  featured: 'col-span-2 row-span-2',
  wide: 'col-span-2',
  normal: ''
}

export const DogGalleryBlock = () => {
  return (
    <section aria-labelledby="gallery-heading" className="w-full bg-bg-light dark:bg-bg-dark">
      <div className="max-w-300 mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-14 1200:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="w-8 h-px bg-primary-light dark:bg-primary-dark" />
            <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Our Gallery</p>
          </div>
          <h2
            id="gallery-heading"
            className="font-quicksand leading-tight text-text-light dark:text-text-dark"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            <span className="font-black block">GALLERY</span>
            <span className="font-light">OF OUR DACHSHUNDS</span>
          </h2>
        </div>

        <Link
          href="/dachshunds"
          aria-label="View dachshunds available for adoption"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label="View dachshunds" />
        </Link>
      </div>

      {/* Full-bleed grid. Row heights come from the grid alone, so every tile lines up */}
      <ul
        aria-label="Photos of our dachshunds"
        className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[160px] sm:auto-rows-[220px] lg:auto-rows-[300px] xl:auto-rows-[360px] 2xl:auto-rows-[420px]"
      >
        {DOGS.map((dog, i) => (
          <motion.li
            key={dog.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: 'easeOut' }}
            className={`relative overflow-hidden group ${SPAN_CLASS[dog.span ?? 'normal']}`}
          >
            <Picture
              src={dog.image}
              alt={dog.alt}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />

            {/* A light brand tint that clears on hover */}
            <div
              className="absolute inset-0 bg-primary-light/15 dark:bg-primary-dark/10 group-hover:bg-transparent transition-colors duration-500"
              aria-hidden="true"
            />

            {dog.name && (
              <>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/60 to-transparent" aria-hidden="true" />
                <p
                  className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 text-white font-quicksand font-bold text-sm sm:text-lg leading-tight drop-shadow-sm"
                  aria-hidden="true"
                >
                  {dog.name}
                </p>
              </>
            )}
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
