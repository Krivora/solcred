import { useEffect, useState } from 'react'
import { solicitudesApi } from '@/features/solicitudes/api/solicitudes.api'
import { solicitudesToast } from '@/shared/lib/toaster'
import { obtenerPasosActivos, esPasoOmitible, pasoFormularioDe } from '@/features/solicitudes/lib/pasos'
import { useMemo } from 'react'
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

interface UseSolicitudFormOptions {
  solicitudIdExistente?: string
}

// Opciones para el helper genérico de guardado por step.
interface GuardarPasoOpciones<T> {
  accion: () => Promise<T>
  aplicarResultado?: (data: T) => void
  mensajeErrorFallback: string
  onExito: () => void
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

  const pasosActivos = useMemo(
    () => obtenerPasosActivos(solicitud?.programa.secciones),
    [solicitud?.programa.secciones]
  )

  const stepIndex = pasosActivos.indexOf(currentStep)
  const totalSteps = pasosActivos.length

  // Métricas de conversión del formulario: avisa al backend en cada cambio de
  // paso (fire-and-forget — nunca debe afectar la navegación del cliente).
  // El backend solo avanza el marcador, así que retroceder a corregir algo no
  // "resetea" el punto más lejano ya alcanzado.
  useEffect(() => {
    if (!solicitud?.id) return
    solicitudesApi.registrarPasoVisto(solicitud.id, pasoFormularioDe(currentStep)).catch(() => {})
  }, [solicitud?.id, currentStep])

  const goNext = () => {
    if (stepIndex >= 0 && stepIndex < pasosActivos.length - 1) {
      setCurrentStep(pasosActivos[stepIndex + 1])
    }
  }

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(pasosActivos[stepIndex - 1])
  }

  const goTo = (step: Step) => setCurrentStep(step)

  const pasoOmitible = esPasoOmitible(solicitud?.programa.secciones, currentStep)

  // Omitir: no llama al backend, solo avanza. Válido para pasos OPCIONAL.
  const omitirPaso = () => {
    if (!pasoOmitible) return
    if (esEdicion) marcarGuardado()
    else goNext()
  }
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
          const msg = e instanceof Error ? e.message : 'Error al cargar la solicitud'
          setError(msg)
          solicitudesToast.error('No se pudo cargar la solicitud', msg)
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [solicitudIdExistente])


  const marcarGuardado = () => {
    setGuardadoOk(true)
    setTimeout(() => setGuardadoOk(false), 2000)
  }

  // ── Helper genérico: centraliza loading/error/toast/avance ──
  // Elimina la duplicación de las 9 funciones guardarX que antes
  // repetían el mismo bloque try/catch/finally casi idéntico.
  async function guardarPaso<T>({
    accion,
    aplicarResultado,
    mensajeErrorFallback,
    onExito,
  }: GuardarPasoOpciones<T>) {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      const data = await accion()
      aplicarResultado?.(data)
      onExito()
      if (esEdicion) marcarGuardado()
      else goNext()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : mensajeErrorFallback
      setError(msg)
      solicitudesToast.error(mensajeErrorFallback, msg)
    } finally {
      setLoading(false)
    }
  }

  async function crearSolicitud(dto: CrearSolicitudDto) {
    setLoading(true)
    setError(null)
    try {
      const data = await solicitudesApi.crear(dto)
      setSolicitud(data)
      solicitudesToast.creada()
      goNext()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al crear la solicitud'
      setError(msg)
      solicitudesToast.error('Error al crear la solicitud', msg)
    } finally {
      setLoading(false)
    }
  }

  const guardarGenerales = (dto: DatosGenerales) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarGenerales(solicitud!.id, dto),
      aplicarResultado: setSolicitud,
      mensajeErrorFallback: 'Error al guardar datos generales',
      onExito: solicitudesToast.generalesGuardados,
    })

  const guardarSolicitante = (dto: DatosPersona) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarSolicitante(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosSolicitante: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos del solicitante',
      onExito: solicitudesToast.solicitanteGuardado,
    })

  const guardarAval = (dto: DatosPersona) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarAval(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosAval: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos del aval',
      onExito: solicitudesToast.avalGuardado,
    })

  const guardarCredito = (dto: DatosCredito) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarCredito(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosCredito: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos del crédito',
      onExito: solicitudesToast.creditoGuardado,
    })

  const guardarGarantia = (dto: DatosGarantia) => {
    return guardarPaso({
      accion: () => solicitudesApi.guardarGarantia(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosGarantia: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos de garantía',
      onExito: solicitudesToast.garantiaGuardada,
    })
  }

  const guardarNegocio = (dto: DatosNegocio) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarNegocio(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosNegocio: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos del negocio',
      onExito: solicitudesToast.negocioGuardado,
    })

  const guardarMercado = (dto: DatosMercado) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarMercado(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosMercado: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos de mercado',
      onExito: solicitudesToast.mercadoGuardado,
    })

  const guardarBancarios = (dto: DatosBancarios) =>
    guardarPaso({
      accion: () => solicitudesApi.guardarBancarios(solicitud!.id, dto),
      aplicarResultado: (data) => setSolicitud((prev) => prev ? { ...prev, datosBancarios: data } : prev),
      mensajeErrorFallback: 'Error al guardar datos bancarios',
      onExito: solicitudesToast.bancariosGuardados,
    })

  async function enviarSolicitud() {
    if (!solicitud) return
    setLoading(true)
    setError(null)
    try {
      const data = await solicitudesApi.enviar(solicitud.id)
      setSolicitud(data)
      solicitudesToast.solicitudEnviada()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al enviar la solicitud'
      setError(msg)
      solicitudesToast.error('Error al enviar la solicitud', msg)
    } finally {
      setLoading(false)
    }
  }

  return {
    currentStep, stepIndex, totalSteps,
    pasosActivos, pasoOmitible, omitirPaso,
    solicitud, loading, error, esEdicion, guardadoOk,
    goNext, goBack, goTo,
    crearSolicitud, guardarGenerales, guardarSolicitante, guardarAval,
    guardarCredito, guardarGarantia, guardarNegocio, guardarMercado,
    guardarBancarios, enviarSolicitud,
  }
}