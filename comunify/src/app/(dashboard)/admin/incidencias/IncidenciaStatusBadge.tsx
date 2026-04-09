'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, TrendingUp, CheckCircle2, XCircle, ChevronDown, Loader2 } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: 'Abierta',    color: 'bg-orange-50 text-orange-700',  icon: Clock },
  in_progress: { label: 'En proceso', color: 'bg-blue-50 text-blue-700',      icon: TrendingUp },
  resolved:    { label: 'Resuelta',   color: 'bg-green-50 text-green-700',    icon: CheckCircle2 },
  closed:      { label: 'Cerrada',    color: 'bg-slate-100 text-slate-600',   icon: XCircle },
}

const transitions: Record<string, string[]> = {
  open:        ['in_progress', 'closed'],
  in_progress: ['resolved', 'open'],
  resolved:    ['closed'],
  closed:      [],
}

interface Props {
  status: string
  incidenciaId: string
}

export default function IncidenciaStatusBadge({ status, incidenciaId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(status)

  const cfg = statusConfig[current] ?? statusConfig.open
  const Icon = cfg.icon
  const nextStates = transitions[current] ?? []

  async function changeStatus(newStatus: string) {
    setLoading(true)
    setOpen(false)
    await fetch('/api/incidencias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: incidenciaId,
        status: newStatus,
        comment: `Estado cambiado a: ${statusConfig[newStatus]?.label}`,
      }),
    })
    setCurrent(newStatus)
    router.refresh()
    setLoading(false)
  }

  if (nextStates.length === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color} hover:opacity-80 transition`}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
        {cfg.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
            {nextStates.map((s) => {
              const sCfg = statusConfig[s]
              const SIcon = sCfg.icon
              return (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <SIcon className="w-4 h-4 text-slate-400" />
                  {sCfg.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
