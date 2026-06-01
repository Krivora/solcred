import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { FileText, Plus } from 'lucide-react'

export function SolicitudesEmptyState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Aún no tienes solicitudes
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Crea tu primera solicitud de crédito y sigue su proceso en tiempo real.
      </p>
      <Button
        className="gap-2"
        onClick={() => router.push('/dashboard/usuarios/solicitudes/nueva')}
      >
        <Plus className="w-4 h-4" />
        Nueva solicitud
      </Button>
    </div>
  )
}