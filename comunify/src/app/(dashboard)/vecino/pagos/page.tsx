import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import PagarButton from './PagarButton'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid:    { label: 'Pagado',    color: 'bg-green-50 text-green-700',  icon: CheckCircle2 },
  pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700',  icon: Clock },
  overdue: { label: 'Vencido',   color: 'bg-red-50 text-red-700',      icon: AlertTriangle },
  exempt:  { label: 'Exento',    color: 'bg-slate-100 text-slate-500',  icon: CheckCircle2 },
}

export default async function VecinoPagosPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const { paid } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const admin = createAdminClient()

  const { data: pagosRaw } = await (admin.from('fee_payments') as any)
    .select('id, amount, status, due_date, paid_at, period, fee:fees(name)')
    .eq('member_id', membership?.id)
    .order('due_date', { ascending: false })

  const pagos: any[] = pagosRaw ?? []

  const pagado   = pagos.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount ?? 0), 0)
  const pendiente = pagos.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount ?? 0), 0)
  const vencido  = pagos.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount ?? 0), 0)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mis cuotas</h1>
        <p className="text-slate-500 mt-1">Historial de pagos de la comunidad</p>
      </div>

      {/* Mensaje de pago exitoso */}
      {paid === 'true' && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl mb-6">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Pago realizado correctamente</p>
            <p className="text-xs text-green-600 mt-0.5">Tu cuota quedará marcada como pagada en breve.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">Pagado</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(pagado)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">Pendiente</p>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(pendiente)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1">Vencido</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(vencido)}</p>
        </div>
      </div>

      {pagos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay cuotas registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 grid grid-cols-5 gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="col-span-2">Cuota</span>
            <span>Período</span>
            <span>Vence</span>
            <span className="text-right">Importe</span>
          </div>
          {pagos.map((p: any) => {
            const cfg = statusConfig[p.status] ?? statusConfig.pending
            const Icon = cfg.icon
            const canPay = p.status === 'pending' || p.status === 'overdue'
            return (
              <div key={p.id} className="px-6 py-4 border-b border-slate-50 last:border-0 grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.fee?.name ?? 'Cuota'}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>
                    {canPay && <PagarButton feePaymentId={p.id} />}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{p.period ?? '—'}</p>
                <p className="text-sm text-slate-600">{formatDate(p.due_date)}</p>
                <p className="text-sm font-semibold text-slate-900 text-right">{formatCurrency(p.amount)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
