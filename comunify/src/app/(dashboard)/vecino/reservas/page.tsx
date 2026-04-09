import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import NuevaReservaVecino from './NuevaReservaVecino'
import CancelarReservaVecino from './CancelarReservaVecino'

export default async function VecinoReservasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('id, community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const admin = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [areasRes, reservasRes] = await Promise.all([
    (admin.from('common_areas') as any)
      .select('id, name, capacity, max_reservations_per_month, rules')
      .eq('community_id', membership?.community_id)
      .eq('active', true)
      .order('name'),
    (admin.from('reservations') as any)
      .select('id, date, start_time, end_time, notes, status, area:common_areas(name)')
      .eq('member_id', membership?.id)
      .gte('date', today)
      .order('date', { ascending: true }),
  ])

  const areas: any[] = areasRes.data ?? []
  const reservas: any[] = reservasRes.data ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>
          <p className="text-slate-500 mt-1">Reserva zonas comunes de la comunidad</p>
        </div>
        {areas.length > 0 && (
          <NuevaReservaVecino areas={areas} memberId={membership?.id} communityId={membership?.community_id} />
        )}
      </div>

      {/* Mis próximas reservas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-900">Mis próximas reservas</h2>
        </div>
        {reservas.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No tienes reservas próximas</p>
          </div>
        ) : (
          <div>
            {reservas.map((r: any, idx: number) => (
              <div key={r.id} className={`px-6 py-4 flex items-center justify-between ${idx < reservas.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.area?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(r.date)} · {r.start_time}–{r.end_time}</p>
                  {r.notes && <p className="text-xs text-slate-500 mt-0.5">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    r.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {r.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                  </span>
                  {r.status === 'confirmed' && (
                    <CancelarReservaVecino reservationId={r.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zonas disponibles */}
      {areas.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">Zonas disponibles</h2>
          </div>
          {areas.map((area: any, idx: number) => (
            <div key={area.id} className={`px-6 py-4 ${idx < areas.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{area.name}</p>
                  {area.capacity && <p className="text-xs text-slate-400 mt-0.5">Aforo: {area.capacity} personas</p>}
                  {area.max_reservations_per_month && (
                    <p className="text-xs text-slate-400">Máx. {area.max_reservations_per_month} reservas/mes</p>
                  )}
                  {area.rules && <p className="text-xs text-slate-500 mt-1 italic">{area.rules}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
