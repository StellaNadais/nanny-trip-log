import { useEffect, useRef } from 'react'

/** Place Falconite — Te Amo as `public/audio/te-amo-falconite.mp3` (see `public/audio/README.md`). */
const UPCOMING_GIGS_THEME_SRC = `${import.meta.env.BASE_URL}audio/te-amo-falconite.mp3`

/**
 * When schedule flip shows the “Upcoming gigs” face (after a tap), plays the theme from the start.
 * Stops when that face closes or the page unmounts.
 */
export function useUpcomingGigsThemePlayback(faceOpen) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!faceOpen) {
      const a = audioRef.current
      if (a) {
        a.pause()
        audioRef.current = null
      }
      return undefined
    }

    const audio = new Audio(UPCOMING_GIGS_THEME_SRC)
    audioRef.current = audio
    audio.volume = 0.88
    void audio.play().catch(() => {
      /* missing file / autoplay blocked — harmless */
    })

    return () => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [faceOpen])
}
