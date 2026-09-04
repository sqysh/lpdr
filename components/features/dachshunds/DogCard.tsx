import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { IDachshund } from 'types/rescue-groups.types'
import { cardVariants } from 'lib/constants/motion.constants'
import Picture from '../../_common/Picture'

export function DogCard({ dog, index }: { dog: IDachshund; index: number }) {
  const a = dog?.attributes
  const photo = a?.photos?.[0]
  const pathname = usePathname()

  return (
    <motion.li
      layout
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="group"
    >
      <Link
        href={`/dachshunds/${dog?.id}?from=${encodeURIComponent(pathname)}`}
        aria-label={`Meet ${a?.name}, ${a?.ageString}, ${a?.colorDetails} — click to view profile`}
        className="block relative overflow-hidden aspect-3/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        {/* Photo */}
        {photo ? (
          <Picture
            priority={index < 4 ? true : false}
            src={photo}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-light dark:bg-surface-dark flex items-center justify-center">
            <span className="text-muted-light dark:text-muted-dark text-xs font-mono">
              No photo
            </span>
          </div>
        )}

        {/* Gradient */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
          aria-hidden="true"
        />

        {/* Hover wash */}
        <div
          className="absolute inset-0 bg-primary-light/0 group-hover:bg-primary-light/15 dark:group-hover:bg-primary-dark/15 transition-colors duration-300"
          aria-hidden="true"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {a?.isAdoptionPending && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-500 text-white px-2 py-0.5">
              Pending
            </span>
          )}
          {a?.isSpecialNeeds && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-secondary-light dark:bg-secondary-dark text-white px-2 py-0.5">
              Special Needs
            </span>
          )}
          {a?.isCourtesyListing && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-button-light dark:bg-button-dark text-white px-2 py-0.5">
              Courtesy
            </span>
          )}
        </div>

        {/* Index number */}
        <p className="absolute top-3 right-3 text-white/40 text-xs font-mono" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </p>

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <p className="text-white font-quicksand font-bold text-lg sm:text-xl leading-tight group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
            {a?.name}
          </p>
          <p className="text-white/60 text-xs font-mono mt-0.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            {a?.ageString}
            {a?.colorDetails ? ` · ${a?.colorDetails}` : ''}
          </p>
        </div>
      </Link>
    </motion.li>
  )
}
