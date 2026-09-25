'use client'

import { useEffect, useRef } from 'react'

export function HeroBackground({ paused }: { paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // The slideshow's pause button and the reduce-motion setting stop the video too, since it's moving
  // content that runs longer than five seconds, the same as the slides
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (paused) video.pause()
    else video.play().catch(() => {})
  }, [paused])

  return (
    <div className="absolute inset-0 h-full" aria-hidden="true">
      <video
        ref={videoRef}
        src="/videos/landing-2.mp4"
        autoPlay={!paused}
        muted
        loop
        playsInline
        className="h-full w-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-linear-to-r from-bg-light/90 dark:from-bg-dark/90 via-bg-light/40 dark:via-bg-dark/40 to-transparent" />
      {/* Ends in the solid page color, so there's no line where the next section begins */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-bg-light via-bg-light/60 to-transparent dark:from-bg-dark dark:via-bg-dark/60" />
    </div>
  )
}
