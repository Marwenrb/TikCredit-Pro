'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Animated count-up hook using requestAnimationFrame
 * @param target - The target number to count up to
 * @param duration - Duration in ms (default 1000)
 * @returns The current animated value
 */
export function useCountUp(target: number, duration: number = 1000): number {
  const [current, setCurrent] = useState(0)
  const prevTarget = useRef(0)
  const rafId = useRef<number>()

  useEffect(() => {
    const start = prevTarget.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(start + diff * eased)
      setCurrent(value)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        prevTarget.current = target
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [target, duration])

  return current
}
