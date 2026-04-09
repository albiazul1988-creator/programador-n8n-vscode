import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreditCard, AlertTriangle, CheckCircle2, Clock, Settings } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import ConfigurarCuota from './ConfigurarCuota'
import GenerarRecibos from './GenerarRecibos'
import PagoRow from './PagoRow'

function getCurrentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function PagosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single() as any

  const communityId = membership?.community_id
  const admin = createAdminClient()
  const period = getCurrentPeriod()

  // Cuota activa
  const { data: feeRaw } = await (admin.from('fees') as any)
    .select('*')
    .eq('community_id', communityId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as any
  const fee: any = feeRaw

  // Pagos del mes actual
  const { data: paymentsRaw } = fee ? await (admin.from('fee_payments') as any)
    .select('*, member:community_members(unit_number, portal, profile:profiles(full_name, phone))')
    .eq('community_id', communityId)
    .eq('fee_id', fee.id)
    .eq('period', period)
    .order('status') : { data: [] }

  const payments: any[] = paymentsRaw ?? []

  const paid = payments.filter(p => p.status === 'paid')
  const pending = payments.filter(p => p.status === 'pending')
  const overdue = payments.filter(p => p.status === 'overdue')
  const totalRecaudado = paid.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuotas y pagos</h1>
          <p className="text-slate-500 mt-1">Periodo: {period}</p>
        </div>
        <div className="flex gap-3">
          {fee && <GenerarRecibos communityId={communityId} feeId={fee.id} period={period} />}
          <ConfigurarCuota communityId={communityId} currentFee={fee} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{paid.length}</p>
            <p className="text-sm text-slate-500">Pagados</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{pending.length}</p>
            <p className="text-sm text-slate-500">Pendientes</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{overdue.length}</p>
            <p className="text-sm text-slate-500">Vencidos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRecaudado)}</p>
            <p className="text-sm text-slate-500">Recaudado</p>
          </div>
        </div>
      </div>

      {!fee ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <Settings className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay cuota configurada</p>
          <p className="text-slate-400 text-sm mt-1">Configura el importe de la cuota para empezar</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay recibos generados para {period}</p>
          <p className="text-slate-400 text-sm mt-1">Pulsa "Generar recibos" para crear los recibos del mes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vecino</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vivienda</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Importe</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha pago</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p: any) => (
                <PagoRow key={p.id} pago={p} feeId={fee.id} period={period} communityId={communityId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
