'use client'

import { use } from 'react'
import { TicketDetalle } from '@/features/soporte/components/TicketDetalle'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <TicketDetalle id={id} />
}
