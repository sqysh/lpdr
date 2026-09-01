import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'

export function VideoThumb() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const handlePlay = () => {
    const v = videoRef.current
    if (!v) return
    v.play()
    setPlaying(true)
  }

  const handlePause = () => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    setPlaying(false)
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src="/videos/hero-2.mp4"
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Play overlay — full cover, shown when paused/stopped */}
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <span className="flex items-center justify-center w-14 h-14 bg-primary-light dark:bg-primary-dark group-hover:scale-105 transition-transform">
            <Play
              className="w-6 h-6 text-white dark:text-bg-dark translate-x-px"
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
        </button>
      )}

      {/* Small pause button — shown while playing, bottom-right */}
      {playing && (
        <button
          type="button"
          onClick={handlePause}
          aria-label="Pause video"
          className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <Pause className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
