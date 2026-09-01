'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { store, useToastSelector } from 'lib/store/store'
import { hideToast } from 'lib/store/slices/toastSlice'

export const Toast = () => {
  const { isVisible, type, message, description, duration } = useToastSelector()

  useEffect(() => {
    const timer = setTimeout(() => {
      store.dispatch(hideToast())
    }, duration)

    return () => clearTimeout(timer)
  }, [isVisible, type, duration])

  const getBackgroundColor = () => {
    const base = 'bg-bg-light dark:bg-bg-dark'

    switch (type) {
      case 'success':
        return `${base} border-primary-light dark:border-primary-dark`
      case 'error':
        return `${base} border-red-200 dark:border-red-800`
      case 'warning':
        return `${base} border-yellow-200 dark:border-yellow-800`
      case 'info':
      default:
        return `${base} border-secondary-light dark:border-secondary-dark`
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-primary-light/50 dark:border-primary-dark/50'
      case 'error':
        return 'border-red-200 dark:border-red-800/50'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800/50'
      case 'info':
      default:
        return 'border-secondary-light/50 dark:border-secondary-dark/50'
    }
  }

  const getTextColor = () => {
    return 'text-text-light dark:text-text-dark'
  }

  const getIcon = () => {
    const iconClasses = 'w-4 h-4 sm:w-6 sm:h-6'

    switch (type) {
      case 'success':
        return (
          <div className="p-1 sm:p-1.5 bg-primary-light/20 dark:bg-primary-dark/20 rounded-[5px]">
            <CheckCircle className={`${iconClasses} text-primary-light dark:text-primary-dark`} />
          </div>
        )
      case 'error':
        return (
          <div className="p-1 sm:p-1.5 bg-red-100 dark:bg-red-900/30 rounded-[5px]">
            <AlertCircle className={`${iconClasses} text-red-600 dark:text-red-400`} />
          </div>
        )
      case 'warning':
        return (
          <div className="p-1 sm:p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-[5px]">
            <AlertTriangle className={`${iconClasses} text-yellow-600 dark:text-yellow-400`} />
          </div>
        )
      case 'info':
      default:
        return (
          <div className="p-1 sm:p-1.5 bg-secondary-light/20 dark:bg-secondary-dark/20 rounded-[5px]">
            <Info className={`${iconClasses} text-secondary-light dark:text-secondary-dark`} />
          </div>
        )
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: -20,
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: 'easeInOut'
            }
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          className={`
            fixed z-160
            top-3 left-3 right-3
            sm:top-4 sm:right-4 sm:left-auto
            ${getBackgroundColor()}
            border ${getBorderColor()}
            rounded-[5px] shadow-lg
            p-3 sm:p-4 sm:max-w-md w-auto sm:w-auto
          `}
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))'
          }}
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-xs sm:text-base leading-snug ${getTextColor()}`}>
                {message}
              </h3>
              {description && (
                <p className="text-text-light/60 dark:text-text-dark/60 text-[11px] sm:text-sm mt-0.5 sm:mt-1 line-clamp-2 leading-snug">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={() => store.dispatch(hideToast())}
              className="shrink-0 p-1 hover:bg-accent dark:hover:bg-accent-dark rounded-[5px] transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-text-light/50 dark:text-text-dark/50" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
