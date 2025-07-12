import { throttle } from '@/lib/utils/utils'
import { useState, useEffect, useCallback } from 'react'

export function useMousePosition(enabled = true) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    throttle((e) => {
      if (enabled) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }, 16), // ~60fps
    [enabled]
  )

  useEffect(() => {
    if (enabled) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [enabled, handleMouseMove])

  return mousePosition
}