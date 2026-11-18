'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { LPDRLogo, type LPDRLogoProps } from './LPDRLogo'
import type { LogoAnimationHandle } from './useLogoAnimation'

// A group of logos that are controlled together: the butterfly's wing colours, a pause, and "play this animation now". Each logo
// in the group is still its own independent <LPDRLogo />; the stage only keeps a list of their handles. Stages can be nested or
// side by side, and each controls only its own logos.

export type Wings = 'monochrome' | 'rainbow' | 'custom'
export type LogoAction = 'blink' | 'flutter' | 'ear' | 'look'

type Stage = {
  wings: Wings
  setWings: (wings: Wings) => void
  wingColor: string
  setWingColor: (color: string) => void
  paused: boolean
  setPaused: (paused: boolean) => void
  play: (action: LogoAction) => void
  register: (handle: LogoAnimationHandle) => () => void
}

const StageContext = createContext<Stage | null>(null)

export const useLogoStage = () => useContext(StageContext)

export function LogoStage({ children, wings: initialWings = 'monochrome' }: { children: ReactNode; wings?: Wings }) {
  const [wings, setWings] = useState<Wings>(initialWings)
  const [wingColor, setWingColor] = useState('#f9a8d4')
  const [paused, setPaused] = useState(false)
  const handles = useRef(new Set<LogoAnimationHandle>())

  const register = useCallback((handle: LogoAnimationHandle) => {
    handles.current.add(handle)
    return () => {
      handles.current.delete(handle)
    }
  }, [])

  const play = useCallback((action: LogoAction) => {
    handles.current.forEach((h) => ({ blink: h.blink, flutter: h.flutter, ear: h.twitchEar, look: h.lookAround })[action]())
  }, [])

  return <StageContext value={{ wings, setWings, wingColor, setWingColor, paused, setPaused, play, register }}>{children}</StageContext>
}

// An <LPDRLogo /> that belongs to the stage above it (animated, unless the stage is paused, in the stage's wing colours). Outside a
// stage it is a plain animated logo.
export function StageLogo(props: LPDRLogoProps) {
  const stage = useLogoStage()
  const ref = useRef<LogoAnimationHandle>(null)
  const register = stage?.register

  // Register a stand-in that always reaches the logo's current handle, which changes when the stage pauses or resumes it
  useEffect(() => {
    if (!register) return
    return register({
      blink: () => ref.current?.blink(),
      flutter: () => ref.current?.flutter(),
      twitchEar: () => ref.current?.twitchEar(),
      lookAround: () => ref.current?.lookAround()
    })
  }, [register])

  const wings = stage
    ? stage.wings === 'custom'
      ? { wingColor: stage.wingColor, wingSheen: 'transparent' }
      : { wings: stage.wings }
    : null

  return <LPDRLogo animated={!stage?.paused} {...wings} {...props} ref={ref} />
}
