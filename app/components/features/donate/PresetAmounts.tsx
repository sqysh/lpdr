import { fadeUp } from 'lib/constants/motion.constants'
import { AnimatePresence, motion } from 'framer-motion'
import { PaymentInputs } from './DonateForm'

interface PresetAmountsProps {
  inputs: PaymentInputs
  onSelect: (amount: number) => void
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500]

export function PresetAmounts({ inputs, onSelect }: PresetAmountsProps) {
  return (
    <motion.fieldset
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={0.25}
      className="mb-5 border-0 p-0 min-w-0"
    >
      <legend className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-3">
        Select Amount
      </legend>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Preset donation amounts">
        {PRESET_AMOUNTS.map((amount) => {
          const isSelected = !inputs.useCustom && inputs.selectedAmount === amount
          return (
            <motion.button
              key={amount}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(amount)}
              aria-pressed={isSelected}
              aria-label={`Donate $${amount}`}
              className={`
                relative py-3 text-sm font-black font-quicksand border-2 transition-colors duration-200 overflow-hidden
                focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                ${
                  isSelected
                    ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                    : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50 hover:text-text-light dark:hover:text-text-dark'
                }
              `}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    key="sel"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-primary-dark"
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>
              ${amount}
            </motion.button>
          )
        })}
      </div>
    </motion.fieldset>
  )
}
