'use client'

import { useSolicitudForm } from '../hooks/useSolicitudForm'
import { StepIndicator } from './form/StepIndicator'
import { StepPrograma } from './form/StepPrograma'
import { StepGeneral } from './form/StepGeneral'
import { PersonaForm } from './form/PersonaForm'
import { StepCredito } from './form/StepCredito'
import { GarantiaForm } from './form/GarantiaForm'
import { NegocioForm } from './form/NegocioForm'
import { MercadoForm } from './form/MercadoForm'
import { BancariosForm } from './form/BancariosForm'
import { StepResumen } from './form/StepResumen'
import { useRouter } from 'next/navigation'

export function NuevaSolicitudForm() {
  const router = useRouter()
  const {
    currentStep,
    stepIndex,
    solicitud,
    loading,
    error,
    goBack,
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
  } = useSolicitudForm()

  async function handleEnviar() {
    await enviarSolicitud()
    router.push('/dashboard/usuarios/solicitudes')
  }

  return (
    <div className="max-w-8xl mx-auto space-y-8">
      <StepIndicator currentIndex={stepIndex} />

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        {currentStep === 'programa' && (
          <StepPrograma
            onSubmit={crearSolicitud}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 'general' && solicitud && (
          <StepGeneral
            solicitud={solicitud}
            onSubmit={guardarGenerales}
            onBack={goBack}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 'solicitante' && solicitud && (
          <PersonaForm
            title="Datos del solicitante"
            subtitle="Información personal de quien solicita el crédito"
            defaultValues={solicitud.datosSolicitante}
            onSubmit={guardarSolicitante}
            onBack={goBack}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 'aval' && solicitud && (
          <PersonaForm
            title="Datos del aval"
            subtitle="Información de la persona que respalda la solicitud"
            defaultValues={solicitud.datosAval}
            onSubmit={guardarAval}
            onBack={goBack}
            loading={loading}
            error={error}
            skipLabel="Omitir aval"
            onSkip={skipAval}
          />
        )}

        {currentStep === 'credito' && solicitud && (
          <StepCredito
            defaultValues={solicitud.datosCredito}
            onSubmit={guardarCredito}
            onBack={goBack}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 'garantia' && solicitud && (
          <GarantiaForm
            defaultValues={solicitud.datosGarantia}
            onSubmit={guardarGarantia}
            onBack={goBack}
            loading={loading}
          />
        )}

        {currentStep === 'negocio' && solicitud && (
          <NegocioForm
            defaultValues={solicitud.datosNegocio}
            onSubmit={guardarNegocio}
            onBack={goBack}
            loading={loading}
          />
        )}

        {currentStep === 'mercado' && solicitud && (
          <MercadoForm
            defaultValues={solicitud.datosMercado}
            onSubmit={guardarMercado}
            onBack={goBack}
            loading={loading}
          />
        )}

        {currentStep === 'bancarios' && solicitud && (
          <BancariosForm
            defaultValues={solicitud.datosBancarios}
            onSubmit={guardarBancarios}
            onBack={goBack}
            loading={loading}
          />
        )}

        {currentStep === 'resumen' && solicitud && (
          <StepResumen
            solicitud={solicitud}
            onEnviar={handleEnviar}
            onBack={goBack}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  )
}