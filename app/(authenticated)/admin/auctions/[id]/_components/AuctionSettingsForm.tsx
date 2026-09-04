import { ChangeEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toDatetimeLocal } from 'lib/utils/date.utils'
import { IAuction } from 'types/auction.types'

const inputStyles = `w-full px-3.5 py-3 text-xs font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark transition-colors scheme-light dark:scheme-dark`

const labelStyles = `text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark`

export function AuctionSettingsForm({
  inputs,
  isActive,
  loading,
  onInput,
  onSave
}: {
  inputs: IAuction
  isActive: boolean
  loading: boolean
  onInput: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onSave: () => void
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelStyles}>
          Title
        </label>
        <input id="title" name="title" type="text" onChange={onInput} value={inputs?.title || ''} className={inputStyles} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="startDate" className={labelStyles}>
            Start Date
          </label>
          <input
            disabled={isActive}
            name="startDate"
            id="startDate"
            type="datetime-local"
            onChange={onInput}
            value={toDatetimeLocal(inputs?.startDate) || ''}
            className={inputStyles}
          />
          {isActive && (
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
              Start date cannot be changed once the auction is live
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="endDate" className={labelStyles}>
            End Date
          </label>
          <input
            disabled={isActive}
            name="endDate"
            id="endDate"
            type="datetime-local"
            onChange={onInput}
            value={toDatetimeLocal(inputs?.endDate) || ''}
            className={`${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {isActive && (
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
              End date cannot be changed once the auction is live
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal" className={labelStyles}>
          Goal ($)
        </label>
        <input
          name="goal"
          id="goal"
          type="number"
          onChange={onInput}
          value={inputs?.goal || ''}
          min={0}
          className={inputStyles}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customAuctionLink" className={labelStyles}>
          Custom Link
        </label>
        <input
          disabled={isActive}
          name="customAuctionLink"
          id="customAuctionLink"
          type="text"
          onChange={onInput}
          value={inputs?.customAuctionLink ?? ''}
          placeholder="e.g. spring-2026"
          className={`${inputStyles} placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {isActive && (
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
            The link cannot be changed once the auction is live
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={onSave}
          disabled={loading}
          className="px-5 py-2.5 bg-primary-light dark:bg-primary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </>
  )
}
