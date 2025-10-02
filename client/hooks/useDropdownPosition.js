'use client'
import { useRef, useState, useCallback, useEffect } from 'react'

export function useDropdownPosition(isOpen, options = {}) {
  const { desiredMax = 240, minHeight = 140, offset = 4 } = options
  const buttonRef = useRef(null)
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0, maxHeight: desiredMax })

  const computePosition = useCallback(() => {
    const el = buttonRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewportH = window.innerHeight || document.documentElement.clientHeight
    const spaceBelow = viewportH - rect.bottom
    const spaceAbove = rect.top
    const down = spaceBelow >= Math.min(200, desiredMax) || spaceBelow >= spaceAbove
    const maxHeight = Math.min(desiredMax, (down ? spaceBelow : spaceAbove) - 16)
    const top = down ? Math.min(rect.bottom + offset, viewportH - 8) : Math.max(8, rect.top - offset)
    setPanelPos({ top, left: rect.left, width: rect.width, maxHeight: Math.max(minHeight, maxHeight) })
  }, [desiredMax, minHeight, offset])

  useEffect(() => {
    if (!isOpen) return
    computePosition()
    const handler = () => computePosition()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [isOpen, computePosition])

  return { buttonRef, panelPos, computePosition }
}
