import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  AlertCircle,
  CreditCard,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Obtener la primera comunidad del usuario (después se expandirá para multi-comunidad)
  const { data: membershipRaw } = await supabase
    .from('community_members')
    .select('community_id, communities(*)')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const membership = membershipRaw as any
  const communityId = membership?.community_id as string | undefined

  // Stats en paralelo
  const [
    { count: totalMembers },
    { count: openIncidents },
    { count: pendingPayments },
    { count: todayReservations },
    { data: recentAnnouncements },
    { data: recentIncidents },
  ] = await Promise.all([
    supabase.from('community_members').select('*', { count: 'exact', head: true })
      .eq('community_id', communityId!).eq('active', true),
    supabase.from('incidents').select('*', { count: 'exact', head: true })
      .eq('community_id', communityId!).in('status', ['open', 'in_progress']),
    supabase.from('fee_payments').select('*', { count: 'exact', head: true })
      .eq('community_id', communityId!).eq('status', 'overdue'),
    supabase.from('reservations').select('*', { count: 'exact', head: true })
      .eq('community_id', communityId!).eq('date', new Date().toISOString().split('T')[0]),
    supabase.from('announcements').select('*')
      .eq('community_id', communityId!).order('created_at', { ascending: false }).limit(3),
    supabase.from('incidents').select('*, reporter:profiles!reported_by(full_name)')
      .eq('community_id', communityId!).in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false }).limit(5),
  ])

  const community = membership?.communities as any

  const stats = [
    { label: 'Vecinos activos', value: totalMembers ?? 0, icon: Users, color: 'blue', change: null },
    { label: 'Incidencias abiertas', value: openIncidents ?? 0, icon: AlertCircle, color: 'orange', change: null },
    { label: 'Recibos vencidos', value: pendingPayments ?? 0, icon: CreditCard, color: 'red', change: null },
    { label: 'Reservas hoy', value: todayReservations ?? 0, icon: Calendar, color: 'green', change: null },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    open: { label: 'Abierta', color: 'text-orange-600 bg-orange-50', icon: Clock },
    in_progress: { label: 'En proceso', color: 'text-blue-600 bg-blue-50', icon: TrendingUp },
    resolved: { label: 'Resuelta', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
    closed: { label: 'Cerrada', color: 'text-slate-600 bg-slate-100', icon: XCircle },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{community?.name ?? 'Tu comunidad'}</h1>
        <p className="text-slate-500 mt-1">{community?.address}, {community?.city}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Anuncios recientes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Anuncios recientes</h2>
            <a href="/admin/anuncios" className="text-sm text-blue-600 hover:underline">Ver todos</a>
          </div>
          {recentAnnouncements && recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {recentAnnouncements.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    a.type === 'urgent' ? 'bg-red-500' :
                    a.type === 'important' ? 'bg-orange-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.published_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No hay anuncios aún</p>
          )}
        </div>

        {/* Incidencias abiertas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Incidencias activas</h2>
            <a href="/admin/incidencias" className="text-sm text-blue-600 hover:underline">Ver todas</a>
          </div>
          {recentIncidents && recentIncidents.length > 0 ? (
            <div className="space-y-3">
              {recentIncidents.map((inc: any) => {
                const cfg = statusConfig[inc.status] ?? statusConfig.open
                const Icon = cfg.icon
                return (
                  <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{inc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                        {inc.location && (
                          <span className="text-xs text-slate-400">{inc.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No hay incidencias abiertas</p>
          )}
        </div>
      </div>
    </div>
  )
}
