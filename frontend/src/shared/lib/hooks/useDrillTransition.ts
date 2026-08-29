// shared/hooks/useDrillTransition.ts
'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

interface DrillState {
  top: number
  left: number
  width: number
  height: number
  fase: 'expandiendo' | 'cubierto'
}

export function useDrillTransition() {
  const router = useRouter()
  const [drill, setDrill] = useState<DrillState | null>(null)

  const navegar = useCallback((el: HTMLElement, url: string) => {
    const r = el.getBoundingClientRect()
    setDrill({ top: r.top, left: r.left, width: r.width, height: r.height, fase: 'expandiendo' })

    // Deja correr la animación de expansión, luego navega
    window.setTimeout(() => {
      router.push(url)
    }, 380)
  }, [router])

  return { drill, navegar }
}