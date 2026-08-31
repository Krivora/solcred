import { Hammer } from 'lucide-react'

export function TabEnConstruccion({ nombre }: { nombre: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card py-20 text-center">
      <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
        <Hammer className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{nombre}</p>
        <p className="mt-1 text-xs text-muted-foreground">Esta pestaña está en construcción.</p>
      </div>
    </div>
  )
}
