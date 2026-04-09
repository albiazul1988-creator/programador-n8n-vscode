'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CancelarReservaVecino({ reservationId }: { reservationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function cancel() {
    if (!confirm('¿Cancelar esta reserva?')) return
    setLoading(true)
    await fetch('/api/reservas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reservationId }),
    })
    router.refresh()
    setLoading(false)
  }

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-slate-400" />

  return (
    <button onClick={cancel} className="text-xs text-red-500 hover:underline font-medium">
      Cancelar
    </button>
  )
}
