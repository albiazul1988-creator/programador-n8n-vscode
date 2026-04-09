import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Megaphone, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function VecinoHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('id, community_id, unit_number')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const communityId = membership?.community_id
  const memberId = membership?.id
  const admin = createAdminClient()

  const [anunciosRes, reservasRes, pagosRes, incidenciasRes] = await Promise.all([
    (admin.from('announcements') as any)
      .select('id, title, type, created_at, pinned')
      .eq('community_id', communityId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3),
    (admin.from('reservations') as any)
      .select('id, date, start_time, end_time, area:common_areas(name)')
      .eq('member_id', memberId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(3),
    (admin.from('fee_payments') as any)
      .select('id, amount, status, due_date, fee:fees(name)')
      .eq('member_id', memberId)
      .order('due_date', { ascending: false })
      .limit(4),
    (admin.from('incidents') as any)
      .select('id, title, status, created_at')
      .eq('reported_by', user!.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const anuncios: any[] = anunciosRes.data ?? []
  const reservas: any[] = reservasRes.data ?? []
  const pagos: any[] = pagosRes.data ?? []
  const incidencias: any[] = incidenciasRes.data ?? []

  const typeColor: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    important: 'bg-amber-100 text-amber-700',
    normal: 'bg-blue-50 text-blue-700',
  }
  const statusPago: Record<string, string> = {
    paid: 'bg-green-50 text-green-700',
    pending: 'bg-amber-50 text-amber-700',
    overdue: 'bg-red-50 text-red-700',
    exempt: 'bg-slate-100 text-slate-500',
  }
  const statusPagoLabel: Record<string, string> = {
    paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido', exempt: 'Exento',
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mi portal</h1>
        <p className="text-slate-500 mt-1">Unidad {membership?.unit_number}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Anuncios recientes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Anuncios</h2>
            </div>
            <Link href="/vecino/anuncios" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          {anuncios.length === 0 ? (
            <p className="text-sm text-slate-400">Sin anuncios recientes</p>
          ) : (
            <div className="space-y-3">
              {anuncios.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${typeColor[a.type] ?? typeColor.normal}`}>
                    {a.type === 'urgent' ? 'Urgente' : a.type === 'important' ? 'Importante' : 'Info'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-tight">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximas reservas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Mis reservas</h2>
            </div>
            <Link href="/vecino/reservas" className="text-xs text-blue-600 hover:underline">Gestionar</Link>
          </div>
          {reservas.length === 0 ? (
            <p className="text-sm text-slate-400">No tienes reservas próximas</p>
          ) : (
            <div className="space-y-3">
              {reservas.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.area?.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(r.date)} · {r.start_time}–{r.end_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado de pagos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Mis cuotas</h2>
            </div>
            <Link href="/vecino/pagos" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          {pagos.length === 0 ? (
            <p className="text-sm text-slate-400">Sin cuotas registradas</p>
          ) : (
            <div className="space-y-2">
              {pagos.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.fee?.name ?? 'Cuota'}</p>
                    <p className="text-xs text-slate-400">Vence: {formatDate(p.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusPago[p.status] ?? ''}`}>
                      {statusPagoLabel[p.status] ?? p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mis incidencias */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Mis incidencias</h2>
            </div>
            <Link href="/vecino/incidencias" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          {incidencias.length === 0 ? (
            <p className="text-sm text-slate-400">Sin incidencias reportadas</p>
          ) : (
            <div className="space-y-2">
              {incidencias.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900 truncate flex-1">{i.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${
                    i.status === 'open' ? 'bg-amber-50 text-amber-700' :
                    i.status === 'resolved' ? 'bg-green-50 text-green-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {i.status === 'open' ? 'Abierta' : i.status === 'in_progress' ? 'En curso' : i.status === 'resolved' ? 'Resuelta' : 'Cerrada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
