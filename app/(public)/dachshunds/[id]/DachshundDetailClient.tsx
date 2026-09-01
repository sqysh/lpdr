'use client'

import { Dog } from 'types/_rescue-groups.types'
import { Breadcrumb } from './_components/Breadcrumb'
import { LeftGallery } from './_components/LeftGallery'
import { RightInfoPanel } from './_components/RightInfoPanel'

export default function DachshundDetailClient({ data }: { data: Dog }) {
  const a = data?.attributes

  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      {/* ── Breadcrumb ── */}
      <Breadcrumb a={a} />

      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
          {/* —— LEFT — Gallery —— */}
          <LeftGallery a={a} />

          {/* —— RIGHT — Info panel —— */}
          <RightInfoPanel a={a} />
        </div>
      </div>
    </main>
  )
}
