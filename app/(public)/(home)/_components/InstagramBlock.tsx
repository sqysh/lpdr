'use client'

import Picture from 'app/components/_common/Picture'

const INSTA_PHOTOS = [
  {
    src: '/images/instagram/insta-1.jpg',
    alt: 'Little Paws Dachshund Rescue on Instagram',
    objectPosition: 'object-top'
  },
  {
    src: '/images/instagram/insta-2.jpg',
    alt: 'Little Paws Dachshund Rescue on Instagram',
    objectPosition: 'object-center'
  },
  {
    src: '/images/instagram/insta-3.jpg',
    alt: 'Little Paws Dachshund Rescue on Instagram',
    objectPosition: 'object-top'
  },
  {
    src: '/images/instagram/insta-4.jpg',
    alt: 'Little Paws Dachshund Rescue on Instagram',
    objectPosition: 'object-center'
  },
  {
    src: '/images/instagram/insta-5.jpg',
    alt: 'Little Paws Dachshund Rescue on Instagram',
    objectPosition: 'object-bottom'
  }
]

export default function InstagramBlock() {
  return (
    <section
      aria-labelledby="instagram-heading"
      className="pt-16 sm:pt-20 overflow-hidden bg-bg-light dark:bg-bg-dark"
    >
      {/* Header */}
      <div className="px-4 sm:px-8 mb-8 sm:mb-10">
        <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto w-full">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] text-primary-light dark:text-primary-dark uppercase">
              Instagram
            </p>
          </div>
          <h2
            id="instagram-heading"
            className="font-quicksand text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark"
          >
            <span className="font-bold"># Follow</span>{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">Our Journey</span>
          </h2>
        </div>
      </div>

      {/* Photo strip */}
      <div role="list" aria-label="Instagram photo gallery" className="flex">
        {INSTA_PHOTOS.map((photo, i) => (
          <a
            key={i}
            href="https://www.instagram.com/littlepawsdr"
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            aria-label={`View photo ${i + 1} on Instagram`}
            className={`group relative overflow-hidden shrink-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark aspect-4/3 flex-1`}
          >
            <Picture
              priority={false}
              src={photo.src}
              alt={photo.alt}
              className={`absolute inset-0 w-full h-full object-cover ${photo.objectPosition} transition-transform duration-700 group-hover:scale-105`}
            />

            {/* Hover overlay using theme primaries */}
            <div
              className="absolute inset-0 bg-primary-light/0 group-hover:bg-primary-light/45 dark:group-hover:bg-primary-dark/20 transition-colors duration-300"
              aria-hidden="true"
            />

            {/* Bottom Instagram icon — always visible */}
            <div className="absolute bottom-4 left-4" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-4 h-4 opacity-90"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
