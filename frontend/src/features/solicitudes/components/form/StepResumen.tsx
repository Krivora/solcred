'use client'

import { useState } from 'react'
import type { Solicitud } from '@/features/solicitudes/types/solicitud.types'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { FormError } from '@/shared/components/common/FormError'
import { Separator } from '@/shared/components/ui/separator'
import { ChevronLeft, Send, User, Users, Briefcase, ShieldCheck, ClipboardCheck } from 'lucide-react'
import { StepHeader } from './StepHeader'

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
  const [aceptaUso, setAceptaUso] = useState(false)
  const s = solicitud.datosSolicitante
  const a = solicitud.datosAval

  // El backend no guarda monto/plazo planos: se derivan de datosCredito.
  const montoSolicitado = solicitud.datosCredito?.conceptos.reduce((acc, c) => acc + c.monto, 0)
  const plazoSolicitado = solicitud.datosCredito?.plazoMeses

  return (
    <div className="space-y-6">
      <StepHeader
        icon={ClipboardCheck}
        title="Resumen de la solicitud"
        subtitle="Revisa la información antes de enviar. Una vez enviada no podrás editarla."
      />

      <div className="space-y-3">
        {/* Programa */}
        <Section icon={Briefcase} title="Programa y condiciones">
          <InfoRow label="Programa" value={solicitud.programa?.nombre} />
          <InfoRow label="Tipo de persona" value={solicitud.tipoPersona === 'FISICA' ? 'Persona Física' : 'Persona Moral'} />
          <InfoRow label="Sector" value={solicitud.sector ? SECTOR_LABELS[solicitud.sector] : undefined} />
          <InfoRow label="Tamaño de empresa" value={solicitud.tamanoEmpresa ?? undefined} />
          <Separator className="my-1" />
          <InfoRow label="Monto solicitado" value={montoSolicitado != null
              ? `$${montoSolicitado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
              : undefined
            }
          />
          <InfoRow label="Plazo" value={plazoSolicitado != null ? `${plazoSolicitado} meses` : undefined} />
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

      {/* Consentimiento de uso de datos */}
      <label
        className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 cursor-pointer hover:bg-muted/70 transition-colors"
      >
        <Checkbox
          checked={aceptaUso}
          onCheckedChange={(v) => setAceptaUso(v === true)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-medium text-foreground">Uso de tus datos</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Confirmo que la información capturada es correcta y autorizo que se utilice
            únicamente para evaluar y dar seguimiento a esta solicitud de crédito. Tus datos
            se manejan de forma confidencial y no se comparten con terceros ajenos al proceso.
          </p>
        </div>
      </label>

      <FormError message={error} />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button onClick={onEnviar} disabled={loading || !aceptaUso} className="gap-2">
          <Send className="w-4 h-4" />
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </div>
    </div>
  )
}