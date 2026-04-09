'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Props {
  voteId: string
  memberId: string
  options: { id: string; text: string }[]
}

export default function VotarButton({ voteId, memberId, options }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function castVote() {
    if (!selected) return
    setLoading(true)
    await fetch('/api/votaciones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vote_id: voteId,
        member_id: memberId,
        option_id: selected === 'abstain' ? null : selected,
      }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Emite tu voto</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.id} type="button"
            onClick={() => setSelected(opt.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
              selected === opt.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}>
            {opt.text}
          </button>
        ))}
        <button type="button"
          onClick={() => setSelected('abstain')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
            selected === 'abstain'
              ? 'border-slate-400 bg-slate-100 text-slate-700'
              : 'border-slate-200 text-slate-500 hover:border-slate-300'
          }`}>
          Abstención
        </button>
      </div>
      {selected && (
        <button onClick={castVote} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Votando...</> : 'Confirmar voto'}
        </button>
      )}
    </div>
  )
}
