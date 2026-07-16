import { useEffect, useState } from 'react'
import { solicitudesApi } from '../api/solicitudes.api'
import type {
  CrearSolicitudDto,
  DatosBancarios,
  DatosCredito,
  DatosGarantia,
  DatosGenerales,
  DatosMercado,
  DatosNegocio,
  DatosPersona,
  Solicitud,
} from '@/features/solicitudes/types/solicitud.types'

export type Step =
  | 'programa'
  | 'general'
  | 'solicitante'
  | 'aval'
  | 'credito'
  | 'garantia'
  | 'negocio'
  | 'mercado'
  | 'bancarios'
  | 'resumen'

const STEPS: Step[] = [
  'programa',
  'general',
  'solicitante',
  'aval',
  'credito',
  'garantia',
  'negocio',
  'mercado',
  'bancarios',
  'resumen',
]

interface UseSolicitudFormOptions {
  solicitudIdExistente?: string
}

export function useSolicitudForm(options?: UseSolicitudFormOptions) {
  const solicitudIdExistente = options?.solicitudIdExistente
  const esEdicion = Boolean(solicitudIdExistente)

  const [currentStep, setCurrentStep] = useState<Step>(
    esEdicion ? 'general' : 'programa'
  )
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(esEdicion)
  const [error, setError] = useState<string | null>(null)
  const [guardadoOk, setGuardadoOk] = useState(false)

  const stepIndex = STEPS.indexOf(currentStep)

  // Carga inicial de la solicitud existente en modo edición
  useEffect(() => {
    if (!solicitudIdExistente) return

    let cancelado = false

    async function cargar() {
      setLoading(true)
      setError(null)
      try {
        const data = await solicitudesApi.obtener(solicitudIdExistente!)
        if (!cancelado) setSolicitud(data)
      } catch (e: unknown) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : 'Error al cargar la solicitud')
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [solicitudIdExistente])

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1])
  }

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1])
  }

  const goTo = (step: Step) => setCurrentStep(step)

  const marcarGuardado = () => {
    setGuardadoOk(true)
    setTimeout(() => setGuardadoOk(false), 2000)
  }

  async function crearSolicitud(dto: CrearSolicitudDto) {
    setLoading(true)
    setError(null)
    try {
      const data = await solicitudesApi.crear(dto)
      setSolicitud(data)
      goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear la solicitud')
    } finally {
      setLoading(false)
    }
  }

  async function guardarGenerales(dto: DatosGenerales) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      const data = await solicitudesApi.guardarGenerales(solicitud.id, dto)
      setSolicitud(data)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos generales')
    } finally {
      setLoading(false)
    }
  }

  async function guardarSolicitante(dto: DatosPersona) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarSolicitante(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos del solicitante')
    } finally {
      setLoading(false)
    }
  }

  async function guardarAval(dto: DatosPersona) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarAval(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos del aval')
    } finally {
      setLoading(false)
    }
  }

  function skipAval() {
    goTo('credito')
  }

  async function guardarCredito(dto: DatosCredito) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarCredito(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos del crédito')
    } finally {
      setLoading(false)
    }
  }

  async function guardarGarantia(dto: DatosGarantia) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarGarantia(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos de garantía')
    } finally {
      setLoading(false)
    }
  }

  async function guardarNegocio(dto: DatosNegocio) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarNegocio(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos del negocio')
    } finally {
      setLoading(false)
    }
  }

  async function guardarMercado(dto: DatosMercado) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarMercado(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos de mercado')
    } finally {
      setLoading(false)
    }
  }

  async function guardarBancarios(dto: DatosBancarios) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.guardarBancarios(solicitud.id, dto)
      esEdicion ? marcarGuardado() : goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos bancarios')
    } finally {
      setLoading(false)
    }
  }

  async function enviarSolicitud() {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      const data = await solicitudesApi.enviar(solicitud.id)
      setSolicitud(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return {
    currentStep,
    stepIndex,
    totalSteps: STEPS.length,
    solicitud,
    loading,
    error,
    esEdicion,
    guardadoOk,
    goNext,
    goBack,
    goTo,
    crearSolicitud,
    guardarGenerales,
    guardarSolicitante,
    guardarAval,
    guardarCredito,
    guardarGarantia,
    guardarNegocio,
    guardarMercado,
    guardarBancarios,
    enviarSolicitud,
    skipAval,
  }
}