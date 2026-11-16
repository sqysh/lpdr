'use client'

import RaffleWheel, { RaffleEntry } from 'components/raffle/RaffleWheel'

const demo: RaffleEntry[] = [
  { id: '1', name: 'Biscuit' },
  { id: '2', name: 'Noodle', weight: 3 },
  { id: '3', name: 'Waffles' },
  { id: '4', name: 'Pretzel', weight: 2 },
  { id: '5', name: 'Cocoa' },
  { id: '6', name: 'Penny' }
]

export default function Page() {
  return (
    <div className="h-screen">
      <RaffleWheel entries={demo} theme="iridescent" />
    </div>
  )
}
