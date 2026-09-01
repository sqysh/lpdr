import { motion } from 'framer-motion'

export function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="text-center mb-10"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">Adopt</p>
        <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
      </div>
      <h1 className="font-quicksand text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark mb-2">
        Adoption <span className="font-light text-muted-light dark:text-muted-dark">Application</span>
      </h1>
      <p className="text-sm text-muted-light dark:text-on-dark">
        Start your journey to giving a dachshund a forever home
      </p>
    </motion.div>
  )
}
