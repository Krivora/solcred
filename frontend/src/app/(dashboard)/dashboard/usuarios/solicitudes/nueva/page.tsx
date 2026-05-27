import { NuevaSolicitudForm } from '@/components/usuarios/solicitudes/NuevaSolicitudForm'

export default function NuevaSolicitudPage() {
  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva solicitud</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Completa los pasos para registrar tu solicitud de crédito
        </p>
      </div>
      <NuevaSolicitudForm />
    </div>
  )
}