import { useState } from 'react'
import { solicitudesApi } from '../api/solicitudes'
import type { CrearSolicitudDto, DatosGenerales, DatosPersona, Solicitud } from '../types/solicitudes.types'

export type Step = 'programa' | 'general' | 'solicitante' | 'aval' | 'resumen'

const STEPS: Step[] = ['programa', 'general', 'solicitante', 'aval', 'resumen']

export function useSolicitudForm() {
  const [currentStep, setCurrentStep] = useState<Step>('programa')
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepIndex = STEPS.indexOf(currentStep)

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1])
  }

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1])
  }

  const goTo = (step: Step) => setCurrentStep(step)

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
      goNext()
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
      goNext()
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
      goNext()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar datos del aval')
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
    goNext,
    goBack,
    goTo,
    crearSolicitud,
    guardarGenerales,
    guardarSolicitante,
    guardarAval,
    enviarSolicitud,
  }
}