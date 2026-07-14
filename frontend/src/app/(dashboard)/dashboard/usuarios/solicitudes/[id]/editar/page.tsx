// app/dashboard/usuarios/solicitudes/[id]/editar/page.tsx
import { EditarSolicitudForm } from '@/features/solicitudes/components/edit/EditarSolicitudForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditarSolicitudPage({ params }: Props) {
    const { id } = await params

    return (
        <div className="p-6">
            <EditarSolicitudForm solicitudId={id} />
        </div>
    )
}