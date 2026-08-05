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
import { usePerfilUsuario } from '@/features/solicitudes/hooks/usePerfilUsuario'
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

  const esFisica = solicitud?.tipoPersona === 'FISICA'
  const yaTieneDatosSolicitante = Boolean(solicitud?.datosSolicitante)
  const debePrecargarPerfil =
    currentStep === 'solicitante' && esFisica && !yaTieneDatosSolicitante

  const { usuario, isLoading: cargandoPerfil } = usePerfilUsuario(debePrecargarPerfil)
  console.log('usuario', usuario)
  const defaultValuesSolicitante = yaTieneDatosSolicitante
    ? solicitud!.datosSolicitante
    : esFisica && usuario
      ? {
          nombre: usuario.nombre,
          apellidoPaterno: usuario.apellidoPaterno,
          apellidoMaterno: usuario.apellidoMaterno,
          curp: usuario.curp ?? undefined,
          rfc: usuario.rfc ?? undefined,
          correo: usuario.correo,
        }
      : undefined
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
          debePrecargarPerfil && cargandoPerfil ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Cargando tus datos…
            </div>
          ) : (
            <PersonaForm
              title={esFisica ? 'Datos del solicitante' : 'Datos del representante legal'}
              subtitle={
                esFisica
                  ? 'Información personal de quien solicita el crédito'
                  : 'Información de quien representa legalmente a la empresa'
              }
              defaultValues={defaultValuesSolicitante}
              onSubmit={guardarSolicitante}
              onBack={goBack}
              loading={loading}
              error={error}
            />
          )
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