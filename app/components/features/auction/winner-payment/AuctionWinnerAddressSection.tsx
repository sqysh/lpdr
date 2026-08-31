import { useState } from 'react'
import { AddressSectionProps } from 'types/_address.types'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { MapPin, Pencil } from 'lucide-react'
import { UpdateAddressModal } from 'app/components/my-pack/UpdateAddressModal'

export function AuctionWinnerAddressSection({ address }: AddressSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <UpdateAddressModal open={modalOpen} onClose={() => setModalOpen(false)} address={address} />

      <motion.div
        key="card-form"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={3}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
            <span className="  text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
              Shipping Address
            </span>
          </div>

          {address ? (
            <div className="border border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-surface-dark">
              <div className="flex items-start justify-between gap-4 px-4 py-3.5">
                <div className="flex items-start gap-3 min-w-0">
                  <MapPin
                    className="w-4 h-4 text-cyan-600 dark:text-violet-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="  text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark leading-snug">
                      {address.name}
                    </p>
                    <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark mt-0.5 leading-relaxed">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                      <br />
                      {address.city}, {address.state} {address.zipPostalCode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  aria-label="Edit shipping address"
                  className="shrink-0 flex items-center gap-1.5   text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                >
                  <Pencil className="w-3 h-3" aria-hidden="true" />
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-3.5 border border-dashed border-zinc-200 dark:border-border-dark hover:border-cyan-600/40 dark:hover:border-violet-400/40 text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400   text-[10px] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Add shipping address
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}
