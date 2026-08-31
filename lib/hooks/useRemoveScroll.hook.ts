import { useEffect } from 'react'

export const useRemoveScroll = (hide: boolean) => {
  useEffect(() => {
    if (hide) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [hide])
}
