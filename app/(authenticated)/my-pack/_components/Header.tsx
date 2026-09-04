'use client'

import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { FormField } from 'components/_primitives/FormField'
import { PackMember } from 'types/my-pack.types'
import { formatRole } from 'lib/utils/user.utils'
import { EmailChangeSection } from './EmailChangeSection'
import Picture from 'components/_common/Picture'

interface HeaderProps {
  user: PackMember
  editingName: boolean
  setEditingName: Dispatch<SetStateAction<boolean>>
  handleUpdateName: (e: { preventDefault: () => void }) => Promise<void>
  firstNameInput: string
  setFirstNameInput: Dispatch<SetStateAction<string>>
  lastNameInput: string
  setLastNameInput: Dispatch<SetStateAction<string>>
  nameLoading: boolean
}

export function Header({
  user,
  editingName,
  handleUpdateName,
  firstNameInput,
  setFirstNameInput,
  lastNameInput,
  setLastNameInput,
  nameLoading,
  setEditingName
}: HeaderProps) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Member'
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-start gap-4 sm:gap-5"
    >
      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-center shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        {user.image ? (
          <Picture
            priority={true}
            src={user.image}
            alt=""
            className="w-full h-full object-cover"
            unoptimized={false}
          />
        ) : (
          <span className="font-quicksand font-black text-base text-primary-light dark:text-primary-dark">
            {initials}
          </span>
        )}
      </motion.div>

      <div className="min-w-0 flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-3 mb-1"
        >
          <span
            className="block w-5 h-px bg-primary-light dark:bg-primary-dark"
            aria-hidden="true"
          />
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
            {formatRole(user.role)}
          </p>
        </motion.div>

        {editingName ? (
          <motion.form
            key="name-form"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleUpdateName}
            className="flex flex-col xs:flex-row gap-2 mt-1"
            aria-label="Update your name"
          >
            <FormField
              id="my-pack-firstName"
              label="First name"
              name="firstName"
              value={firstNameInput}
              onChange={(e) => setFirstNameInput(e.target.value)}
              placeholder="First name"
              autoComplete="given-name"
              required
              className="xs:w-32"
            />
            <FormField
              id="my-pack-lastName"
              label="Last name"
              name="lastName"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
              required
              className="xs:w-32"
            />
            <div className="flex gap-2 items-end">
              <button
                type="submit"
                disabled={nameLoading}
                aria-label="Save name"
                className="px-3 py-2 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50"
              >
                {nameLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
                    aria-hidden="true"
                  />
                ) : (
                  'Save'
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                aria-label="Cancel editing name"
                className="px-3 py-2 border border-border-light dark:border-border-dark text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <h1 className="font-quicksand font-black text-3xl sm:text-4xl text-text-light dark:text-text-dark leading-tight">
              {fullName}
            </h1>
            <button
              type="button"
              onClick={() => {
                setFirstNameInput(user.firstName ?? '')
                setLastNameInput(user.lastName ?? '')
                setEditingName(true)
              }}
              aria-label="Edit your name"
              className="shrink-0 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark p-1"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        <EmailChangeSection currentEmail={user.email} />
      </div>
    </motion.div>
  )
}
