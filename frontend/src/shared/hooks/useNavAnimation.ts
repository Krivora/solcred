'use client'

import { useEffect, useState, useRef } from 'react'

export function useNavAnimation(defaultClass: string) {
  const [claseAnimacion, setClaseAnimacion] = useState('')
  const yaEjecutado = useRef(false)

  useEffect(() => {
    if (yaEjecutado.current) return
    yaEjecutado.current = true

    const direccion = sessionStorage.getItem('nav-direction')
    setClaseAnimacion(
      direccion === 'atras' ? 'animate-slide-regreso' : defaultClass
    )
    sessionStorage.removeItem('nav-direction')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return claseAnimacion
}