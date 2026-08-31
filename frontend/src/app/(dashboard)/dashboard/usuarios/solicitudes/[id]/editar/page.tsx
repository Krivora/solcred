// app/dashboard/usuarios/solicitudes/[id]/editar/page.tsx
import { EditarSolicitudForm } from '@/features/solicitudes/components/edit/EditarSolicitudForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditarSolicitudPage({ params }: Props) {
    const { id } = await params

    return <EditarSolicitudForm solicitudId={id} />
}
