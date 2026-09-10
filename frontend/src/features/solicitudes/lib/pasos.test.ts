import { describe, it, expect } from 'vitest'
import { obtenerPasosActivos, esPasoOmitible } from './pasos'
import type { ProgramaSeccion } from '@/features/solicitudes/types/solicitud.types'

const sec = (over: Partial<Record<ProgramaSeccion['seccion'], ProgramaSeccion['requerimiento']>>): ProgramaSeccion[] =>
  (Object.entries(over) as [ProgramaSeccion['seccion'], ProgramaSeccion['requerimiento']][]).map(
    ([seccion, requerimiento]) => ({ seccion, requerimiento }),
  )

describe('obtenerPasosActivos', () => {
  it('sin programa cargado => solo los pasos fijos de inicio', () => {
    expect(obtenerPasosActivos(undefined)).toEqual(['programa', 'general'])
  })

  it('incluye un paso dinámico si su sección es OBLIGATORIA u OPCIONAL', () => {
    const pasos = obtenerPasosActivos(sec({ SOLICITANTE: 'OBLIGATORIO', CREDITO: 'OPCIONAL' }))
    expect(pasos).toEqual(['programa', 'general', 'solicitante', 'credito', 'resumen'])
  })

  it('excluye las secciones NO_REQUIERE', () => {
    const pasos = obtenerPasosActivos(sec({ SOLICITANTE: 'OBLIGATORIO', AVAL: 'NO_REQUIERE' }))
    expect(pasos).not.toContain('aval')
  })

  it('respeta el orden canónico de los pasos dinámicos', () => {
    const pasos = obtenerPasosActivos(
      sec({ BANCARIOS: 'OBLIGATORIO', SOLICITANTE: 'OBLIGATORIO', NEGOCIO: 'OBLIGATORIO' }),
    )
    expect(pasos).toEqual(['programa', 'general', 'solicitante', 'negocio', 'bancarios', 'resumen'])
  })

  it('siempre termina en resumen', () => {
    expect(obtenerPasosActivos(sec({ SOLICITANTE: 'OBLIGATORIO' })).at(-1)).toBe('resumen')
  })
})

describe('esPasoOmitible', () => {
  it('true solo para pasos cuya sección es OPCIONAL', () => {
    const secciones = sec({ SOLICITANTE: 'OBLIGATORIO', GARANTIA: 'OPCIONAL' })
    expect(esPasoOmitible(secciones, 'garantia')).toBe(true)
    expect(esPasoOmitible(secciones, 'solicitante')).toBe(false)
  })
  it('false sin secciones y para pasos fijos', () => {
    expect(esPasoOmitible(undefined, 'garantia')).toBe(false)
    expect(esPasoOmitible(sec({ SOLICITANTE: 'OBLIGATORIO' }), 'programa')).toBe(false)
  })
})
