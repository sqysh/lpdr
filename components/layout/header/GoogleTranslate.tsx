'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { store } from 'lib/store/store'
import { motion } from 'framer-motion'
import { setIsNotSpanish, setIsSpanish } from 'lib/store/slices/uiSlice'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh-CN', name: 'Mandarin' },
  { code: 'ht', name: 'Creole' }
]

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')
  const [isReady, setIsReady] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const pathname = usePathname()

  // Function to get current language from Google Translate
  const getCurrentLanguage = () => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
    if (select && select.value) {
      return select.value
    }

    // Fallback: check cookie
    const cookies = document.cookie.split(';')
    const googleTransCookie = cookies.find((c) => c.trim().startsWith('googtrans='))
    if (googleTransCookie) {
      const lang = googleTransCookie.split('/')[2]
      return lang || 'en'
    }

    return 'en'
  }

  // Sync state with Google Translate
  const syncLanguageState = useCallback(() => {
    const lang = getCurrentLanguage()
    setCurrentLang(lang)

    // Update Redux state
    if (lang === 'es') {
      store.dispatch(setIsSpanish())
    } else {
      store.dispatch(setIsNotSpanish())
    }
  }, [])

  useEffect(() => {
    // Initialize Google Translate
    ;(window as any).googleTranslateElementInit = function () {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,zh-CN,ht',
          autoDisplay: false
        },
        'google_translate_element_hidden'
      )

      // Wait for the select element to be ready
      const checkInterval = setInterval(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
        if (select) {
          setIsReady(true)
          clearInterval(checkInterval)

          // Sync state on initial load
          setTimeout(() => {
            syncLanguageState()
          }, 500)
        }
      }, 100)

      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000)
    }

    // Load the script
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script')
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      document.body.appendChild(script)
    } else {
      // Script already loaded, just sync state
      setTimeout(() => {
        syncLanguageState()
        setIsReady(true)
      }, 500)
    }
  }, [syncLanguageState])

  // Re-sync on route change
  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        syncLanguageState()
      }, 300)
    }
  }, [isReady, pathname, syncLanguageState])

  const changeLanguage = async (langCode: string) => {
    if (isTranslating) return // Prevent multiple clicks

    setIsTranslating(true)
    setCurrentLang(langCode)
    setIsOpen(false)

    if (langCode === 'es') {
      store.dispatch(setIsSpanish())
    } else {
      store.dispatch(setIsNotSpanish())
    }

    // Retry mechanism with increasing delays
    const attemptTranslation = async (attempt: number = 0): Promise<boolean> => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement

      if (!select && attempt < 10) {
        // Wait and retry if select not found
        await new Promise((resolve) => setTimeout(resolve, 200))
        return attemptTranslation(attempt + 1)
      }

      if (!select) {
        setIsTranslating(false)
        return false
      }

      // Set the value
      select.value = langCode

      // Trigger multiple events to ensure it fires
      select.dispatchEvent(new Event('change', { bubbles: true }))
      select.dispatchEvent(new Event('input', { bubbles: true }))

      // Also trigger click event on select
      select.click()

      // Wait for translation to start
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Verify the translation happened by checking if the language changed
      const newLang = getCurrentLanguage()

      if (newLang !== langCode && attempt < 3) {
        // Translation didn't work, retry
        await new Promise((resolve) => setTimeout(resolve, 500))
        return attemptTranslation(attempt + 1)
      }

      // Hide the Google Translate frame
      setTimeout(() => {
        const frame = document.querySelector('.goog-te-menu-frame') as HTMLElement
        if (frame) {
          frame.style.display = 'none'
        }
      }, 100)

      setIsTranslating(false)
      return true
    }

    // Start the translation attempt
    const success = await attemptTranslation()

    if (!success) {
      // Force a page reload as last resort if translation completely fails
      setTimeout(() => {
        if (getCurrentLanguage() !== langCode) {
          // Set cookie manually and reload
          document.cookie = `googtrans=/en/${langCode}; path=/`
          window.location.reload()
        }
      }, 1000)
    }
  }

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element_hidden" style={{ display: 'none' }}></div>

      {/* Custom UI */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!isReady || isTranslating}
          className="inline-flex items-center gap-3 px-4 py-2.5 bg-button-light dark:bg-surface-dark/50 transition-colors notranslate disabled:opacity-50 disabled:cursor-not-allowed h-11 cursor-pointer w-[126.41px] border-l-2 border-l-primary-light dark:border-l-primary-dark"
        >
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-on-dark">
            {isTranslating ? 'Translating…' : LANGUAGES.find((l) => l.code === currentLang)?.name}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex text-on-dark ml-auto"
            aria-hidden="true"
          >
            <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
          </motion.span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div
              className="absolute left-0 w-[126.41px] bg-topbar-light dark:bg-topbar-dark border border-border-dark border-t-2 border-t-primary-light dark:border-t-primary-dark shadow-xl z-160 notranslate px-5 py-4 space-y-1"
              translate="no"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  disabled={isTranslating}
                  className={`group relative w-full text-left py-1.5 text-[10px] font-mono tracking-[0.15em] uppercase transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
                    currentLang === lang.code
                      ? 'text-primary-light dark:text-primary-dark'
                      : 'text-on-dark hover:text-primary-light dark:hover:text-primary-dark'
                  }`}
                >
                  <span className="relative whitespace-nowrap">
                    {lang.name}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-0 h-px bg-primary-light dark:bg-primary-dark transition-all duration-300 ease-out ${
                        currentLang === lang.code ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .goog-te-banner-frame,
        .goog-te-menu-frame,
        .skiptranslate iframe,
        #google_translate_element_hidden,
        #google_translate_element_hidden * {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0 !important;
          position: static !important;
        }
        .notranslate,
        .notranslate * {
          translate: no !important;
        }
      `}</style>
    </>
  )
}
