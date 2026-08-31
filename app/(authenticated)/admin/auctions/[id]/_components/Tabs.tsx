import { motion } from 'framer-motion'

export function Tabs({ visibleTabs, activeTab, selectTab }) {
  return (
    <div
      role="tablist"
      aria-label="Auction sections"
      className="flex items-center gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark w-fit mb-6 flex-wrap"
    >
      {visibleTabs.map((tab) => (
        <button
          key={tab.label}
          role="tab"
          id={`tab-${tab.label}`}
          aria-selected={activeTab === tab.label}
          aria-controls={`panel-${tab.label}`}
          onClick={() => selectTab(tab.label)}
          className={`relative px-4 py-2 text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
            activeTab === tab.label
              ? 'text-text-light dark:text-text-dark bg-bg-light dark:bg-bg-dark'
              : 'text-muted-light dark:text-muted-dark bg-surface-light dark:bg-surface-dark hover:text-text-light dark:hover:text-text-dark'
          }`}
        >
          {activeTab === tab.label && (
            <motion.span
              layoutId="auction-detail-tab"
              className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-light dark:bg-primary-dark"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              aria-hidden="true"
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
