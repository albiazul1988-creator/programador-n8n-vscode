'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid:    { label: 'Pagado',    color: 'bg-green-50 text-green-700',  icon: CheckCircle2 },
  pending: { label: 'Pendiente', color: 'bg-orange-50 text-orange-700', icon: Clock },
  overdue: { label: 'Vencido',   color: 'bg-red-50 text-red-700',      icon: AlertTriangle },
  exempt:  { label: 'Exento',    color: 'bg-slate-100 text-slate-600', icon: CheckCircle2 },
}

interface Props {
  pago: any
  feeId: string
  period: string
  communityId: string
}

export default function PagoRow({ pago, feeId, period, communityId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(pago.status)

  const cfg = statusConfig[currentStatus] ?? statusConfig.pending
  const Icon = cfg.icon

  async function changeStatus(newStatus: string) {
    setLoading(true)
    setOpen(false)
    await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fee_id: feeId,
        member_id: pago.member_id,
        community_id: communityId,
        period,
        amount: pago.amount,
        status: newStatus,
      }),
    })
    setCurrentStatus(newStatus)
    router.refresh()
    setLoading(false)
  }

  const member = pago.member
  const profile = member?.profile

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4">
        <p className="font-medium text-slate-900">{profile?.full_name ?? '—'}</p>
        <p className="text-xs text-slate-400">{profile?.phone ?? 'Sin teléfono'}</p>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {[member?.portal && `Portal ${member.portal}`, member?.unit_number].filter(Boolean).join(' · ')}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
        {formatCurrency(pago.amount)}
      </td>
      <td className="px-6 py-4">
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
              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {Object.entries(statusConfig)
                  .filter(([k]) => k !== currentStatus)
                  .map(([k, v]) => {
                    const SI = v.icon
                    return (
                      <button key={k} onClick={() => changeStatus(k)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                        <SI className="w-4 h-4 text-slate-400" />{v.label}
                      </button>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500">
        {pago.paid_at ? formatDate(pago.paid_at) : '—'}
      </td>
      <td className="px-6 py-4" />
    </tr>
  )
}
