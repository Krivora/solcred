import { PageHeader } from '@/shared/components/common/PageHeader'
import { NuevaSolicitudForm } from '@/features/solicitudes/components/NuevaSolicitudForm'

export default function NuevaSolicitudPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva solicitud"
        description="Completa los pasos para registrar tu solicitud de crédito."
        backHref="/dashboard/usuarios/solicitudes"
      />
      <NuevaSolicitudForm />
    </div>
  )
}
