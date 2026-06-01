'use client';

import {
  X,
  Copy,
  Check,
  Monitor,
  Globe,
  Hash,
  User,
  Clock,
  Tag,
  FileText,
  Code2,
  ShieldAlert,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { LogAuditoria } from '@/lib/types/logs.types';
import {
  ACCION_CONFIG,
  MODULO_CONFIG,
  formatFullDate,
  formatRelativeTime,
} from '@/lib/config/logs.config';

interface LogDetailModalProps {
  log: LogAuditoria | null;
  loading: boolean;
  onClose: () => void;
}

export function LogDetailModal({ log, loading, onClose }: LogDetailModalProps) {
  const isOpen = loading || log !== null;
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl border-l"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del registro de auditoría"
      >
        {loading ? (
          <>
            <DrawerHeader onClose={onClose} loading />
            <div className="flex-1 overflow-y-auto p-5">
              <LogDetailSkeleton />
            </div>
          </>
        ) : log ? (
          <LogDetailContent log={log} onClose={onClose} />
        ) : null}
      </aside>
    </>
  );
}

// ─────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────

function DrawerHeader({
  log,
  onClose,
  loading,
}: {
  log?: LogAuditoria;
  onClose: () => void;
  loading?: boolean;
}) {
  const accionCfg = log ? ACCION_CONFIG[log.accion] : null;
  const AccionIcon = accionCfg
    ? ((LucideIcons as Record<string, React.ElementType>)[accionCfg.icon] as React.ElementType)
    : ShieldAlert;

  return (
    <div className="border-b bg-muted/30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Registro de auditoría
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 rounded-full"
          aria-label="Cerrar panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Hero section — acción + módulo */}
      {!loading && log && accionCfg && (
        <div className="px-5 pb-4">
          <div className="flex items-start gap-3">
            {/* Ícono grande */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accionCfg.className}`}
            >
              {AccionIcon && <AccionIcon className="h-5 w-5" />}
            </div>

            <div className="min-w-0">
              <p className="text-base font-semibold leading-tight text-foreground">
                {accionCfg.label}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {MODULO_CONFIG[log.modulo].label}
                <span className="mx-1.5 text-border">·</span>
                {formatRelativeTime(log.creadoEn)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────

function LogDetailContent({
  log,
  onClose,
}: {
  log: LogAuditoria;
  onClose: () => void;
}) {
  const moduloCfg = MODULO_CONFIG[log.modulo];
  const ModuloIcon = (LucideIcons as Record<string, React.ElementType>)[
    moduloCfg.icon
  ] as React.ElementType;

  return (
    <>
      <DrawerHeader log={log} onClose={onClose} />

      <div className="flex-1 overflow-y-auto">
        {/* Descripción — destacada */}
        <div className="border-b px-5 py-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Descripción
          </p>
          <p className="text-sm leading-relaxed text-foreground">{log.descripcion}</p>
        </div>

        {/* Sección: quién y cuándo */}
        <Section title="Quién · Cuándo">
          <DetailRow icon={Clock} label="Fecha y hora" value={formatFullDate(log.creadoEn)} />

          {log.usuario ? (
            <DetailRow
              icon={User}
              label="Usuario"
              value={`${log.usuario.nombre} ${log.usuario.apellidoPaterno}`}
              subvalue={log.usuario.correo}
              badge={log.usuario.rol}
            />
          ) : log.usuarioId ? (
            <DetailRow
              icon={User}
              label="Usuario ID"
              value={log.usuarioId}
              copyable
              mono
            />
          ) : null}

          {log.ip && (
            <DetailRow icon={Globe} label="Dirección IP" value={log.ip} copyable mono />
          )}

          {log.userAgent && (
            <DetailRow
              icon={Monitor}
              label="User Agent"
              value={log.userAgent}
              truncate
            />
          )}
        </Section>

        {/* Sección: qué recurso */}
        {(log.id || log.entidadId) && (
          <Section title="Referencia">
            <DetailRow
              icon={Hash}
              label="ID del log"
              value={log.id}
              copyable
              mono
            />
            {log.entidadId && (
              <DetailRow
                icon={Tag}
                label="Entidad afectada"
                value={log.entidadId}
                copyable
                mono
              />
            )}
            <DetailRow
              icon={ModuloIcon || Tag}
              label="Módulo"
              value={moduloCfg.label}
            />
          </Section>
        )}

        {/* Sección: metadata */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <Section title="Metadata adicional" icon={Code2}>
            <MetadataViewer data={log.metadata} />
          </Section>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b px-5 py-4">
      <div className="mb-3 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// DETAIL ROW
// ─────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  subvalue,
  badge,
  copyable,
  mono,
  truncate,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subvalue?: string;
  badge?: string;
  copyable?: boolean;
  mono?: boolean;
  truncate?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>

        <div className="flex items-center gap-1.5">
          <p
            className={`text-sm text-foreground ${mono ? 'font-mono text-xs tracking-tight' : 'font-medium'} ${truncate ? 'truncate' : 'break-all'}`}
            title={truncate ? value : undefined}
          >
            {value}
          </p>

          {badge && (
            <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
          )}

          {copyable && (
            <button
              onClick={handleCopy}
              className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={copied ? 'Copiado' : 'Copiar valor'}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {subvalue && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subvalue}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// METADATA VIEWER
// ─────────────────────────────────────────

function MetadataViewer({ data }: { data: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border bg-muted/60 p-3 font-mono text-xs leading-relaxed text-foreground">
        {json}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Copiar JSON"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────

function LogDetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <Separator />

      {/* Descripción */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      <Separator />

      {/* Rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}