import { Gavel, Heart, Package, SlidersHorizontal, User } from 'lucide-react'
import { MyPackTab } from 'types/_my-pack.types'

export const TABS: { id: MyPackTab; label: string; icon: React.ElementType }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'giving', label: 'Giving', icon: Heart },
  { id: 'auctions', label: 'Auctions', icon: Gavel },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal }
]

export const addCardStyles =
  'flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'
