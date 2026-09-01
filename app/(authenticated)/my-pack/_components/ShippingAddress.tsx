import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { formatDate } from 'app/utils/_date.utils'
import { UpdateAddressModal } from '../../../components/_common/UpdateAddressModal'
import { EmptyState } from './EmptyState'

export function ShippingAddress({ setAddressModalOpen, user, addressModalOpen }) {
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
            <MapPin
              className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark">
                {user.address.name}
              </p>
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-1 leading-relaxed">
                {user.address.addressLine1}
                {user.address.addressLine2 && `, ${user.address.addressLine2}`}
                <br />
                {user.address.city}, {user.address.state} {user.address.zipPostalCode}
              </p>
            </div>
          </div>
          {user.address.updatedAt && (
            <div className="px-5 py-2.5 border-t border-border-light dark:border-border-dark">
              <p className="text-[10px] font-mono text-muted-light/60 dark:text-muted-dark/60">
                Last updated {formatDate(user.address.updatedAt)}
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <EmptyState message="No shipping address on file." />
      )}

      <UpdateAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        address={user?.address ?? null}
      />
    </section>
  )
}
