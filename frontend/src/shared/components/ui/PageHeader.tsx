'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils/cn'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageAction {
  label: string
  onClick?: () => void
  href?: string
  loading?: boolean
  icon?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  backHref?: string
  back?: boolean
  action?: PageAction
  actions?: PageAction[]
  children?: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  back,
  action,
  actions,
  children,
  className,
  icon,
}: PageHeaderProps) {
  const router = useRouter()
  const allActions = [...(actions ?? []), ...(action ? [action] : [])]

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1 flex items-start gap-3">

        {/* Botón regresar — ruta fija */}
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 mt-0.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            asChild
          >
            <Link href={backHref} aria-label="Regresar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {/* Botón regresar — historial */}
        {!backHref && back && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 mt-0.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => router.back()}
            aria-label="Regresar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Ícono decorativo */}
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 mt-0.5">
            {icon}
          </div>
        )}

        {/* Texto */}
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5"
            >
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1
                return (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />}
                    {isLast ? (
                      <span className="font-medium text-foreground truncate">{crumb.label}</span>
                    ) : crumb.href ? (
                      <a href={crumb.href} className="hover:text-foreground transition-colors truncate">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="truncate">{crumb.label}</span>
                    )}
                  </span>
                )
              })}
            </nav>
          )}

          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight truncate">
            {title}
          </h1>

          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{description}</p>
          )}

          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>

      {/* Acciones */}
      {allActions.length > 0 && (
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {allActions.map((act, i) =>
            act.href ? (
              <Button
                key={i}
                variant={act.variant ?? 'default'}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                asChild
              >
                <Link href={act.href}>
                  {act.icon}
                  {act.label}
                </Link>
              </Button>
            ) : (
              <Button
                key={i}
                variant={act.variant ?? (i === allActions.length - 1 ? 'outline' : 'ghost')}
                size="sm"
                onClick={act.onClick}
                disabled={act.loading}
                className={cn(
                  'gap-1.5 h-8 text-xs border-border/60',
                  'hover:bg-accent hover:text-accent-foreground hover:border-primary/20',
                  'transition-colors'
                )}
              >
                {act.icon && (
                  <span className={cn('h-3.5 w-3.5', act.loading && '[&>svg]:animate-spin')}>
                    {act.icon}
                  </span>
                )}
                {act.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export function RefreshAction(onClick: () => void, loading: boolean): PageAction {
  return {
    label: 'Actualizar',
    onClick,
    loading,
    icon: <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin text-primary')} />,
    variant: 'outline',
  }
}