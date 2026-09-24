import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { formatWithCommas } from 'lib/utils/currency.utils'
import { useState } from 'react'
import { AmountState } from './DonateForm'

export function CustomAmount({
  amount,
  patchAmount
}: {
  amount: { useCustom: boolean; customAmount: string }
  patchAmount: (data: Partial<AmountState>) => void
}) {
  const [amountBlurred, setAmountBlurred] = useState(false)

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5} className="mb-6">
      <label
        htmlFor="custom-amount"
        className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-2"
      >
        Custom Amount
        <span className="ml-1 text-muted-light/60 dark:text-muted-dark/60 normal-case tracking-normal font-sans">(min $5)</span>
      </label>
      <div className="relative">
        <span
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-quicksand font-black text-sm pointer-events-none transition-colors duration-200 ${
            amount?.useCustom ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'
          }`}
          aria-hidden="true"
        >
          $
        </span>
        <input
          id="custom-amount"
          type="text"
          inputMode="numeric"
          placeholder="Enter amount"
          value={amount?.customAmount ? formatWithCommas(amount.customAmount) : ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '')
            patchAmount({ customAmount: raw, useCustom: true, selectedAmount: null })
          }}
          onFocus={() => {
            setAmountBlurred(false)
            patchAmount({ useCustom: true, selectedAmount: null })
          }}
          onBlur={() => setAmountBlurred(true)}
          aria-describedby="custom-amount-hint"
          className={`
              w-full pl-8 pr-4 py-3 text-base sm:text-sm font-quicksand font-bold border-2 bg-surface-light dark:bg-surface-dark
              text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50
              transition-colors duration-200 focus:outline-none
              ${amount?.useCustom ? 'border-primary-light dark:border-primary-dark' : 'border-border-light dark:border-border-dark'}
              focus-visible:border-primary-light dark:focus-visible:border-primary-dark
            `}
        />
        {amount?.useCustom && amountBlurred && amount?.customAmount && parseFloat(amount?.customAmount) < 5 && (
          <p id="custom-amount-hint" role="alert" className="absolute text-[11px] text-red-500 dark:text-red-400 mt-1.5 font-mono">
            Minimum donation is $5
          </p>
        )}
      </div>
    </motion.div>
  )
}
