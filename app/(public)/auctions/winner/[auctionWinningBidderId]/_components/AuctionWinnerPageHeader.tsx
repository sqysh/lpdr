import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { Trophy, User } from 'lucide-react'
import Link from 'next/link'

const EYEBROW = 'text-f10 uppercase tracking-[0.25em]'

type Props = {
  auctionTitle: string
  userFirstName: string
  itemCount: number
}

export function AuctionWinnerPageHeader({ auctionTitle, userFirstName, itemCount }: Props) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
          <span className={`${EYEBROW} text-cyan-600 dark:text-violet-400`}>{auctionTitle}</span>
        </div>
        <Link
          href="/my-pack"
          className={`flex items-center gap-1.5 ${EYEBROW} text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors`}
        >
          <User className="w-3 h-3" aria-hidden="true" />
          My Pack
        </Link>
      </div>

      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-cyan-600/10 dark:bg-violet-400/10">
          <Trophy className="w-5 h-5 text-cyan-600 dark:text-violet-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl 430:text-4xl uppercase leading-none text-zinc-950 dark:text-text-dark mb-2">
            Congratulations, {userFirstName}!
          </h1>
          <p className="font-lato text-sm text-zinc-500 dark:text-muted-dark leading-relaxed max-w-lg">
            You won {itemCount === 1 ? 'an item' : `${itemCount} items`} in the auction. Complete your payment below to claim{' '}
            {itemCount === 1 ? 'it' : 'them'}.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
