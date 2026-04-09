import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Calendar, Plus, Users, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import NuevaZona from './NuevaZona'
import NuevaReserva from './NuevaReserva'
import ReservaActions from './ReservaActions'

export default async function ReservasPage() {
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
  const today = new Date().toISOString().split('T')[0]

  const [{ data: areasRaw }, { data: reservasRaw }] = await Promise.all([
    (admin.from('common_areas') as any)
      .select('*')
      .eq('community_id', communityId)
      .eq('active', true)
      .order('name') as any,
    (admin.from('reservations') as any)
      .select('*, area:common_areas(name), member:community_members(unit_number, profile:profiles(full_name))')
      .eq('community_id', communityId)
      .eq('status', 'confirmed')
      .gte('date', today)
      .order('date')
      .order('start_time')
      .limit(50) as any,
  ])

  const areas: any[] = areasRaw ?? []
  const reservas: any[] = reservasRaw ?? []

  // Obtener miembros para el formulario de nueva reserva
  const { data: membersRaw } = await (admin.from('community_members') as any)
    .select('id, unit_number, profile:profiles(full_name)')
    .eq('community_id', communityId)
    .eq('active', true) as any
  const members: any[] = membersRaw ?? []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>
          <p className="text-slate-500 mt-1">{reservas.length} próximas · {areas.length} zonas</p>
        </div>
        <div className="flex gap-3">
          <NuevaZona communityId={communityId} />
          {areas.length > 0 && (
            <NuevaReserva communityId={communityId} areas={areas} members={members} />
          )}
        </div>
      </div>

      {areas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay zonas comunes configuradas</p>
          <p className="text-slate-400 text-sm mt-1">Añade piscina, pista de pádel, salón... para empezar a gestionar reservas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Zonas */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Zonas comunes</h2>
            {areas.map((area: any) => {
              const hoyCount = reservas.filter(r => r.area_id === area.id && r.date === today).length
              return (
                <div key={area.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{area.name}</h3>
                      {area.description && <p className="text-xs text-slate-400 mt-0.5">{area.description}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      hoyCount > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {hoyCount > 0 ? `${hoyCount} hoy` : 'Libre hoy'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {area.capacity && (
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{area.capacity} personas</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Máx. {area.max_reservations_per_month}/mes por vecino
                    </span>
                  </div>
                  {area.rules && (
                    <p className="text-xs text-slate-500 mt-3 p-3 bg-slate-50 rounded-lg">{area.rules}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Calendario de reservas */}
          <div className="xl:col-span-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Próximas reservas</h2>
            {reservas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No hay reservas próximas</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Zona</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Horario</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vecino</th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reservas.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-slate-900">{r.area?.name ?? '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm ${r.date === today ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
                            {r.date === today ? 'Hoy' : formatDate(r.date)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-slate-900">{r.member?.profile?.full_name ?? '—'}</p>
                          <p className="text-xs text-slate-400">{r.member?.unit_number}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <ReservaActions reservaId={r.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
