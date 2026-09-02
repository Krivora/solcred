'use client'

import Link from 'next/link'
import { useAuthStore } from '@/shared/stores/auth.store'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { PanoramaDashboard } from '@/features/dashboard/components/PanoramaDashboard'

const AREA_POR_ROL: Record<string, { label: string; href: string }> = {
  GESTOR: { label: 'Ir a Mis Casos', href: '/dashboard/admin/promocion/mis-casos' },
  ANALISTA: { label: 'Ir a Mis Casos', href: '/dashboard/financiamiento/mis-casos' },
  SUPERVISOR: { label: 'Ir a Validación', href: '/dashboard/financiamiento/validacion' },
  ENCARGADO_PROMOCION: { label: 'Ir a Promoción', href: '/dashboard/admin/promocion/solicitudes' },
  ENCARGADO_FINANCIAMIENTO: { label: 'Ir a Validación', href: '/dashboard/financiamiento/validacion' },
  MESA_CONTROL: { label: 'Ir a Mesa de Control', href: '/dashboard/financiamiento/mesa-control' },
  SOPORTE: { label: 'Ir a Soporte', href: '/dashboard/soporte/mis-tickets' },
  CLIENTE: { label: 'Ir a Mis Solicitudes', href: '/dashboard/usuarios/solicitudes' },
}

export default function DashboardPage() {
  const { usuario, rol } = useAuthStore()

  // SUPERVISOR ve el mismo panorama que ADMIN (en modo solo lectura).
  if (rol === 'ADMIN' || rol === 'SUPERVISOR') {
    return <PanoramaDashboard />
  }

  const area = rol ? AREA_POR_ROL[rol] : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${usuario?.nombre ?? ''}`.trim()}
        description="Desde aquí puedes ir directo a tu área de trabajo."
      />
      {area && (
        <Button asChild>
          <Link href={area.href}>{area.label}</Link>
        </Button>
      )}
    </div>
  )
}
