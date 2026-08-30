// app/(dashboard)/dashboard/admin/promocion/solicitud/[id]/page.tsx
'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FolderOpen, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { useSolicitudDetalle } from '@/features/promocion/hooks/useSolicitudesPromocion'
import { SolicitudTimeline } from '@/features/promocion/components/detalle/SolicitudTimeline'
import { SolicitudInfoGeneral } from '@/features/promocion/components/detalle/SolicitudInfoGeneral'
import { SolicitudDocumentosResumen } from '@/features/promocion/components/detalle/SolicitudDocumentosResumen'
import { ESTATUS_STYLES } from '@/shared/config/solicitudes.config'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'

interface Props {
    params: Promise<{ id: string }>
}

export default function SolicitudDetallePage({ params }: Props) {
    const { id } = use(params)
    const router = useRouter()
    const { solicitud, cargando, error } = useSolicitudDetalle(id)
    const claseAnimacion = useNavAnimation('animate-slide-entrada') // siempre "avanzas" hacia aquí

    const handleRegresar = () => {
        sessionStorage.setItem('nav-direction', 'atras')
        router.back()
    }

    const irAExpediente = () => {
        sessionStorage.setItem('nav-direction', 'adelante')
        router.push(`/dashboard/admin/promocion/expediente/${id}`)
    }

    if (cargando) {
        return (
            <div className={`${claseAnimacion} flex flex-col gap-6 p-6`}>
                <Skeleton className="h-10 w-64 rounded-lg" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>

                    <div className="lg:col-span-1">
                        <Skeleton className="h-full min-h-40 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !solicitud) {
        return (
            <div className={`${claseAnimacion} p-6`}>
                <ErrorState
                    icon={AlertCircle}
                    title="No se pudo cargar la solicitud"
                    description={error ?? 'Ocurrió un error inesperado.'}
                    actionHref="/dashboard/admin/promocion/solicitudes"
                    actionLabel="Volver al listado"
                />
            </div>
        )
    }

    const estatus = ESTATUS_STYLES[solicitud.estatus] ?? ESTATUS_STYLES.BORRADOR

    return (
        <div className={`${claseAnimacion} p-6`}>
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 mt-0.5"
                            onClick={handleRegresar}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <div className="rounded-xl bg-primary/10 p-2.5 ring-1 ring-primary/20">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    Detalle: {solicitud.folio}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${estatus.className}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${estatus.dotClass}`} />
                                    {estatus.label}
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground mt-0.5">
                                {solicitud.programa.nombre}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={irAExpediente}
                        >
                            <FolderOpen className="h-3.5 w-3.5" />
                            Ver expediente
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => router.push(`/dashboard/admin/solicitudes/${solicitud.id}/pdf`)}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Generar PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={irAExpediente}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Tarjeta Informativa
                        </Button>
                    </div>
                </div>

                {/* Contenido: 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <SolicitudInfoGeneral solicitud={solicitud} />
                        <SolicitudDocumentosResumen
                            documentos={solicitud.documentos}
                            documentosRequeridos={solicitud.programa.documentosRequeridos}
                            tipoPersona={solicitud.tipoPersona}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="p-5 sticky top-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Proceso interno
                            </h2>
                            <SolicitudTimeline
                                timeline={solicitud.timeline}
                                gestorAsignado={solicitud.gestorAsignado}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}