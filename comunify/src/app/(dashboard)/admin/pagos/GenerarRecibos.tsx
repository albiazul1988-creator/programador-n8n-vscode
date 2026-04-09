'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'

interface Props {
  communityId: string
  feeId: string
  period: string
}

export default function GenerarRecibos({ communityId, feeId, period }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerar() {
    if (!confirm(`¿Generar recibos para ${period}? Solo se crearán los que no existan aún.`)) return
    setLoading(true)
    const res = await fetch('/api/pagos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ community_id: communityId, fee_id: feeId, period }),
    })
    const data = await res.json()
    if (res.ok) {
      alert(`✓ ${data.generated} recibos generados para ${period}`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleGenerar}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 transition text-sm font-semibold"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      Generar recibos {period}
    </button>
  )
}
