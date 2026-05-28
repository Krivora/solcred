'use client'

import type { Solicitud } from '@/lib/types/solicitudes.types'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/FormError'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Send, User, Users, Briefcase } from 'lucide-react'

interface Props {
  solicitud: Solicitud
  onEnviar: () => void
  onBack: () => void
  loading: boolean
  error: string | null
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  )
}

const SECTOR_LABELS: Record<string, string> = {
  AGROPECUARIO: 'Agropecuario', INDUSTRIAL: 'Industrial', COMERCIAL: 'Comercial',
  SERVICIOS: 'Servicios', TECNOLOGIA: 'Tecnología', OTRO: 'Otro',
}

export function StepResumen({ solicitud, onEnviar, onBack, loading, error }: Props) {
  const s = solicitud.datosSolicitante
  const a = solicitud.datosAval

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Resumen de la solicitud</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Revisa la información antes de enviar. Una vez enviada no podrás editarla.
        </p>
      </div>

      <div className="space-y-3">
        {/* Programa */}
        <Section icon={Briefcase} title="Programa y condiciones">
          <InfoRow label="Programa" value={solicitud.programa?.nombre} />
          <InfoRow label="Tipo de persona" value={solicitud.tipoPersona === 'FISICA' ? 'Persona Física' : 'Persona Moral'} />
          <InfoRow label="Sector" value={SECTOR_LABELS[solicitud.sector]} />
          <InfoRow label="Tamaño de empresa" value={solicitud.tamanoEmpresa ?? undefined} />
          <Separator className="my-1" />
          <InfoRow label="Monto solicitado" value={solicitud.montoSolicitado != null
              ? `$${solicitud.montoSolicitado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
              : undefined
            }
          />          
          <InfoRow label="Plazo" value={`${solicitud.plazoSolicitado} meses`} />
        </Section>

        {/* Solicitante */}
        {s && (
          <Section icon={User} title="Datos del solicitante">
            <InfoRow label="Nombre" value={`${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`} />
            <InfoRow label="CURP" value={s.curp} />
            <InfoRow label="RFC" value={s.rfc} />
            <InfoRow label="Correo" value={s.correo} />
            <InfoRow label="Celular" value={s.celular} />
            <InfoRow label="Domicilio" value={[s.calle, s.numeroExterior, s.colonia, s.ciudad, s.estado].filter(Boolean).join(', ')} />
          </Section>
        )}

        {/* Aval */}
        {a && (
          <Section icon={Users} title="Datos del aval">
            <InfoRow label="Nombre" value={`${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno}`} />
            <InfoRow label="CURP" value={a.curp} />
            <InfoRow label="RFC" value={a.rfc} />
            <InfoRow label="Correo" value={a.correo} />
          </Section>
        )}
      </div>

      <FormError message={error} />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button onClick={onEnviar} disabled={loading} className="gap-2">
          <Send className="w-4 h-4" />
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </div>
    </div>
  )
}