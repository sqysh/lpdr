import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, CreditCard } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function PaymentMethods({
  paymentMethods,
  setDefaultSuccess,
  handleSetDefaultPaymentMethod,
  handleDeletePaymentMethod,
  deleteError
}) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  return (
    <section aria-labelledby="payment-methods-heading">
      {paymentMethods?.length === 0 ? (
        <EmptyState message="No saved payment methods." />
      ) : (
        <ul
          className="grid grid-cols-1 xs:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
          role="list"
        >
          <AnimatePresence initial={false}>
            {paymentMethods?.map((pm, i) => (
              <motion.li
                key={pm.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="bg-bg-light dark:bg-bg-dark p-4"
              >
                <div className="flex items-center gap-3 min-w-0 mb-3">
                  <div className="shrink-0 w-10 h-7 flex items-center justify-center border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                    <CreditCard
                      className="w-4 h-4 text-muted-light dark:text-muted-dark"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark capitalize">
                        {pm.cardBrand} •••• {pm.cardLast4}
                      </p>
                      {pm.isDefault && (
                        <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                      {pm.cardholderName && `${pm.cardholderName} · `}Expires{' '}
                      {pm.cardExpMonth.toString().padStart(2, '0')}/{pm.cardExpYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-13">
                  {!pm.isDefault && (
                    <>
                      {setDefaultSuccess === pm.id ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5"
                        >
                          <CheckCircle
                            className="w-3 h-3 text-green-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-[9px] font-mono tracking-widest uppercase text-green-500">
                            Default updated
                          </span>
                        </motion.div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                          aria-label={`Set ${pm.cardBrand} ending in ${pm.cardLast4} as default`}
                          className="text-[9px] font-mono tracking-widest uppercase px-2.5 py-1.5 border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                        >
                          Set Default
                        </button>
                      )}
                    </>
                  )}

                  <AnimatePresence mode="wait">
                    {confirmingDelete === pm.id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-[9px] font-mono tracking-widest uppercase text-red-500 dark:text-red-400">
                          Remove?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeletePaymentMethod(pm.id)
                            setConfirmingDelete(null)
                          }}
                          aria-label={`Confirm delete ${pm.cardBrand} ending in ${pm.cardLast4}`}
                          className="text-[9px] font-mono tracking-widest uppercase px-2.5 py-1.5 border border-red-500 dark:border-red-400 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(null)}
                          aria-label="Cancel delete"
                          className="text-[9px] font-mono tracking-widest uppercase px-2.5 py-1.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                        >
                          No
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="delete"
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 4 }}
                        transition={{ duration: 0.15 }}
                        type="button"
                        onClick={() => setConfirmingDelete(pm.id)}
                        aria-label={`Delete ${pm.cardBrand} ending in ${pm.cardLast4}`}
                        className="text-[9px] font-mono tracking-widest uppercase px-2.5 py-1.5 border border-border-light dark:border-border-dark hover:border-red-500 dark:hover:border-red-400 text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        Delete
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {deleteError[pm.id] && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[10px] font-mono text-red-500 dark:text-red-400 mt-2 pl-13 leading-relaxed"
                  >
                    {deleteError[pm.id]}
                  </motion.p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
