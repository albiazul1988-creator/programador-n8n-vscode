'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Props { voteId: string; currentStatus: string }

export default function VotacionActions({ voteId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function changeStatus(status: string) {
    setLoading(true)
    await fetch('/api/votaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote_id: voteId, status }),
    })
    router.refresh()
    setLoading(false)
  }

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-slate-400" />

  if (currentStatus === 'open') {
    return (
      <button onClick={() => changeStatus('closed')}
        className="text-sm text-red-600 hover:underline font-medium">
        Cerrar votación
      </button>
    )
  }
  if (currentStatus === 'draft') {
    return (
      <button onClick={() => changeStatus('open')}
        className="text-sm text-green-600 hover:underline font-medium">
        Abrir votación
      </button>
    )
  }
  return null
}
