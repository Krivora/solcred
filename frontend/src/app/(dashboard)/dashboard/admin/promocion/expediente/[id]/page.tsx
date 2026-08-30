'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useExpediente } from '@/features/expediente/hooks/useExpediente'
import { useHistorialDocumento } from '@/features/expediente/hooks/useHistorialDocumento'
import { useSubirDocumento } from '@/features/expediente/hooks/useSubirDocumento'
import { useAuthStore } from '@/shared/stores/auth.store'

import { DatosGeneralesCard } from '@/features/expediente/components/DatosGeneralesCard'
import { MetricasExpedientePanel } from '@/features/expediente/components/MetricasExpedienteBar'
import { TablaDocumentos } from '@/features/expediente/components/TablaDocumentos'
import { HistorialDocumentoSheet } from '@/features/expediente/components/HistorialDocumentoSheet'

import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'

import { ArrowLeft, FolderOpen, AlertTriangle, FileText } from 'lucide-react'
import Link from 'next/link'

interface ExpedientePageProps {
    params: Promise<{ id: string }>
}

const ExpedienteSkeleton = () => (
    <div className="flex gap-5 animate-pulse">
        <Skeleton className="hidden lg:block w-50 shrink-0 h-90 rounded-xl" />
        <div className="flex-1 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-105 w-full rounded-xl" />
        </div>
    </div>
)

const irAtras = () => sessionStorage.setItem('nav-direction', 'atras')

const ExpedienteError = ({
    mensaje,
    backHref,
}: {
    mensaje: string
    backHref: string
}) => (
    <div className="flex flex-col items-center justify-center min-h-90 gap-5">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <div className="rounded-2xl bg-destructive/8 p-5 ring-1 ring-destructive/15">
                <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>

            <div>
                <p className="font-semibold text-foreground text-base">
                    No se pudo cargar el expediente
                </p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {mensaje}
                </p>
            </div>
        </div>

        <Button variant="outline" size="sm" asChild>
            <Link href={backHref} onClick={irAtras}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Regresar
            </Link>
        </Button>
    </div>
)

export default function ExpedientePage({
    params,
}: ExpedientePageProps) {
    const { id: solicitudId } = use(params)
    const router = useRouter()
    const { usuario } = useAuthStore()
    const claseAnimacion = useNavAnimation('animate-slide-entrada') // siempre "avanzas" hacia aquí

    const handleRegresar = () => {
        sessionStorage.setItem('nav-direction', 'atras')
        router.back()
    }

    // ─── Expediente ───────────────────────────────────────────
    const {
        expediente,
        loading,
        error,
        validando,
        refetch,
        validarDocumento,
    } = useExpediente(solicitudId)
    // ─── Uploads ──────────────────────────────────────────────
    const {
        subiendo,
        subirDocumento,
    } = useSubirDocumento(
        solicitudId,
        refetch
    )

    // ─── Historial ────────────────────────────────────────────
    const {
        historial,
        loading: loadingHistorial,
        open,
        tipoNombre,
        verHistorial,
        cerrar,
    } = useHistorialDocumento()

    const backHref =
        usuario?.tipoUsuario === 'CLIENTE'
            ? '/dashboard/usuarios/solicitudes'
            : usuario?.personal?.rol === 'GESTOR'
                ? '/dashboard/admin/promocion/mis-casos'
                : '/dashboard/admin/promocion/solicitudes'

    const handleVerHistorial = (
        tipoDocumentoId: string,
        nombre: string
    ) => {
        verHistorial(
            solicitudId,
            tipoDocumentoId,
            nombre
        )
    }

    return (
        <div className={`${claseAnimacion} space-y-5`}>
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
                        <FolderOpen className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Expediente digital
                        </h1>

                        <p className="text-sm text-muted-foreground mt-0.5">
                            {expediente
                                ? `Folio ${expediente.folio} · ${expediente.programa.nombre}`
                                : loading
                                    ? 'Cargando información...'
                                    : 'Gestión de documentos del crédito'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                            sessionStorage.setItem('nav-direction', 'adelante')
                            router.push(`/dashboard/admin/promocion/solicitud/${solicitudId}`)
                        }}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Ver solicitud
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.push(`/dashboard/admin/solicitudes/${solicitudId}/pdf`)}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Generar PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.push(`/dashboard/admin/promocion/expediente/${solicitudId}`)}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Tarjeta Informativa
                    </Button>
                </div>
            </div>

            {/* Loading */}
            {loading && <ExpedienteSkeleton />}

            {/* Error */}
            {error && !loading && (
                <ExpedienteError
                    mensaje={error}
                    backHref={backHref}
                />
            )}

            {/* Content */}
            {expediente && !loading && (
                <div className="flex flex-col lg:flex-row gap-5 items-start">
                    {/* Sidebar */}
                    <div className="w-full lg:w-49 shrink-0 lg:sticky lg:top-6">
                        <MetricasExpedientePanel
                            metricas={expediente.metricas}
                        />
                    </div>

                    {/* Main */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <DatosGeneralesCard
                            expediente={expediente}
                        />

                        <TablaDocumentos
                            solicitudId={solicitudId}
                            documentos={expediente.documentos}
                            validando={validando}
                            subiendo={subiendo}
                            rolUsuario={usuario?.personal?.rol ?? ''}
                            gestorAsignadoId={
                                expediente.gestor?.id ?? null
                            }
                            usuarioId={usuario?.personal?.id ?? ''}
                            onValidar={validarDocumento}
                            onSubir={subirDocumento}
                            onVerHistorial={handleVerHistorial}
                        />
                    </div>
                </div>
            )}

            {/* Historial */}
            <HistorialDocumentoSheet
                open={open}
                onOpenChange={(v) => !v && cerrar()}
                tipoNombre={tipoNombre}
                historial={historial}
                loading={loadingHistorial}
            />
        </div>
    )
}