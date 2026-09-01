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
  CLIENTE: { label: 'Ir a Mis Solicitudes', href: '/dashboard/usuarios/solicitudes' },
}

export default function DashboardPage() {
  const { usuario, rol } = useAuthStore()

  if (rol === 'ADMIN') {
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
