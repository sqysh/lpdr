import { useCallback, useRef, useEffect } from 'react'

const SOUND_PATHS = {
  se1: '/sound-effects/se1.mp3',
  se2: '/sound-effects/se2.mp3'
} as const

type SoundKey = keyof typeof SOUND_PATHS

interface UseSoundsOptions {
  enabled?: boolean
  volume?: number // 0 to 1
}

export const useSounds = ({ enabled = true, volume = 0.5 }: UseSoundsOptions = {}) => {
  const soundsRef = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({})

  const play = useCallback(
    (key: SoundKey) => {
      if (!enabled) return

      let audio = soundsRef.current[key]

      if (!audio) {
        audio = new Audio(SOUND_PATHS[key])
        audio.preload = 'auto'
        soundsRef.current[key] = audio
      }

      audio.volume = volume
      audio.currentTime = 0

      audio.play().catch(() => {
        // Autoplay blocked until first user gesture — fine for click-triggered SFX
      })
    },
    [enabled, volume]
  )

  useEffect(() => {
    const sounds = soundsRef.current // capture once for cleanup
    return () => {
      Object.values(sounds).forEach((audio) => {
        audio?.pause()
        if (audio) audio.src = ''
      })
      soundsRef.current = {}
    }
  }, [])

  return { play }
}
