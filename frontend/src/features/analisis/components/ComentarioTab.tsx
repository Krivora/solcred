'use client'

import { useState } from 'react'
import { ClipboardList, CreditCard, LineChart, MapPin, MessageSquareText } from 'lucide-react'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import type { ComentarioData } from '@/features/analisis/types/analisis.types'

interface Props {
  inicial: ComentarioData | null
  editable: boolean
  onGuardar: (data: ComentarioData) => void
}

const SECCIONES: {
  key: keyof ComentarioData
  label: string
  icon: typeof ClipboardList
  placeholder: string
}[] = [
  {
    key: 'antecedentes',
    label: 'Antecedentes',
    icon: ClipboardList,
    placeholder: 'Historial del cliente con la institución: créditos previos, comportamiento de pago, relación comercial…',
  },
  {
    key: 'buroCredito',
    label: 'Buró de Crédito',
    icon: CreditCard,
    placeholder: 'Lectura del reporte: score, atrasos, líneas activas, endeudamiento con otras instituciones…',
  },
  {
    key: 'situacionFinanciera',
    label: 'Situación Financiera',
    icon: LineChart,
    placeholder: 'Lectura cualitativa del balance y el estado de resultados, más allá de los números de esa pestaña…',
  },
  {
    key: 'visita',
    label: 'Visita',
    icon: MapPin,
    placeholder: 'Hallazgos de la visita al negocio o domicilio: instalaciones, operación, inventario visible…',
  },
  {
    key: 'opinionAnalista',
    label: 'Opinión del Analista',
    icon: MessageSquareText,
    placeholder: 'Conclusión y recomendación del analista sobre el caso…',
  },
]

export function ComentarioTab({ inicial, editable, onGuardar }: Props) {
  const [datos, setDatos] = useState<ComentarioData>(() => ({ ...inicial }))

  const actualizar = (key: keyof ComentarioData, texto: string) => {
    const next = { ...datos, [key]: texto }
    setDatos(next)
    if (editable) onGuardar(next)
  }

  return (
    <div className="space-y-4">
      {SECCIONES.map(({ key, label, icon: Icon, placeholder }) => (
        <div key={key} className="space-y-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <Label htmlFor={`comentario-${key}`} className="text-sm font-bold text-primary">
              {label}
            </Label>
          </div>
          <Textarea
            id={`comentario-${key}`}
            value={datos[key] ?? ''}
            disabled={!editable}
            onChange={(e) => actualizar(key, e.target.value)}
            placeholder={placeholder}
            className="min-h-[120px] resize-y text-sm"
          />
        </div>
      ))}
    </div>
  )
}
