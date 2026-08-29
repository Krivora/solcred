'use client'

interface Props {
  drill: { top: number; left: number; width: number; height: number; fase: string } | null
}

export function DrillOverlay({ drill }: Props) {
  if (!drill) return null

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden">
      <div
        className="absolute bg-card border border-primary/20 shadow-2xl animate-drill-expandir"
        style={{
          '--origen-top': `${drill.top}px`,
          '--origen-left': `${drill.left}px`,
          '--origen-width': `${drill.width}px`,
          '--origen-height': `${drill.height}px`,
        } as React.CSSProperties}
      />
      {/* Fade del fondo para reforzar la sensación de profundidad */}
      <div className="absolute inset-0 bg-background/0 animate-drill-fondo" />
    </div>
  )
}