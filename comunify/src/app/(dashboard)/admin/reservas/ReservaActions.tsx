'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'

export default function ReservaActions({ reservaId }: { reservaId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('¿Cancelar esta reserva?')) return
    setLoading(true)
    await fetch('/api/reservas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reservaId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handleCancel} disabled={loading}
      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition text-slate-400"
      title="Cancelar reserva">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
    </button>
  )
}
