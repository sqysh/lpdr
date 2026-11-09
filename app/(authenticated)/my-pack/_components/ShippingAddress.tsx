import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Trash2 } from 'lucide-react'
import { formatDate } from 'lib/utils/date.utils'
import { UpdateAddressModal } from 'components/_common/UpdateAddressModal'
import { deleteAddress } from 'lib/actions/my-pack/deleteAddress'
import { EmptyState } from './EmptyState'

const footerButton =
  'text-[10px] font-mono tracking-eyebrow uppercase transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export function ShippingAddress({ setAddressModalOpen, user, addressModalOpen }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleDelete = () =>
    startTransition(async () => {
      setError(null)
      const result = await deleteAddress()
      if (!result.success) {
        setError(result.error ?? 'Failed to remove address. Please try again.')
        return
      }
      setConfirming(false)
      router.refresh()
    })

  return (
    <section aria-labelledby="address-heading">
      {user?.address ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark"
        >
          <div className="flex items-start gap-3 p-5">
            <MapPin className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark">{user.address.name}</p>
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-1 leading-relaxed">
                {user.address.addressLine1}
                {user.address.addressLine2 && `, ${user.address.addressLine2}`}
                <br />
                {user.address.city}, {user.address.state} {user.address.zipPostalCode}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-t border-border-light dark:border-border-dark">
            <p className="text-[10px] font-mono text-muted-light/60 dark:text-muted-dark/60">
              {user.address.updatedAt && `Last updated ${formatDate(user.address.updatedAt)}`}
            </p>

            {confirming ? (
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono text-text-light dark:text-text-dark">Remove this address?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className={`${footerButton} text-red-600 dark:text-red-400 hover:underline`}
                >
                  {pending ? 'Removing...' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false)
                    setError(null)
                  }}
                  disabled={pending}
                  className={`${footerButton} text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={`${footerButton} inline-flex items-center gap-1.5 shrink-0 text-muted-light dark:text-muted-dark hover:text-red-600 dark:hover:text-red-400`}
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="px-5 pb-3 text-[11px] font-mono text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </motion.div>
      ) : (
        <EmptyState message="No shipping address on file." />
      )}

      <UpdateAddressModal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} address={user?.address ?? null} />
    </section>
  )
}
