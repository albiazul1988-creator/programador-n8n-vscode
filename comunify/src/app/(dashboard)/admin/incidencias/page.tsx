import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AlertCircle, Plus, Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import IncidenciaStatusBadge from './IncidenciaStatusBadge'

const priorityConfig: Record<string, { label: string; color: string }> = {
  low:    { label: 'Baja',    color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media',   color: 'bg-blue-50 text-blue-700' },
  high:   { label: 'Alta',    color: 'bg-orange-50 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-50 text-red-700' },
}

const statusTabs = [
  { value: 'all',         label: 'Todas' },
  { value: 'open',        label: 'Abiertas' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'resolved',    label: 'Resueltas' },
  { value: 'closed',      label: 'Cerradas' },
]

export default async function IncidenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'all' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single() as any

  const communityId = membership?.community_id

  let query = (supabase.from('incidents') as any)
    .select('*, reporter:profiles!reported_by(full_name)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data: incidenciasRaw } = await query
  const incidencias: any[] = incidenciasRaw ?? []

  // Contadores para tabs
  const { data: countsRaw } = await (supabase.from('incidents') as any)
    .select('status')
    .eq('community_id', communityId) as any
  const counts: any[] = countsRaw ?? []

  const countByStatus = counts.reduce((acc: any, i: any) => {
    acc[i.status] = (acc[i.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incidencias</h1>
          <p className="text-slate-500 mt-1">{counts.length} en total</p>
        </div>
        <Link
          href="/admin/incidencias/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nueva incidencia
        </Link>
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {statusTabs.map((tab) => {
          const count = tab.value === 'all' ? counts.length : (countByStatus[tab.value] ?? 0)
          return (
            <Link
              key={tab.value}
              href={`/admin/incidencias${tab.value !== 'all' ? `?status=${tab.value}` : ''}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                status === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  status === tab.value ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Lista */}
      {incidencias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay incidencias {status !== 'all' ? 'con este estado' : 'aún'}</p>
          {status === 'all' && (
            <Link
              href="/admin/incidencias/nueva"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Registrar primera incidencia
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Incidencia</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ubicación</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prioridad</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidencias.map((inc: any) => {
                const pCfg = priorityConfig[inc.priority] ?? priorityConfig.medium
                return (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{inc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{inc.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Por: {inc.reporter?.full_name ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{inc.location ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pCfg.color}`}>
                        {pCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <IncidenciaStatusBadge status={inc.status} incidenciaId={inc.id} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(inc.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/incidencias/${inc.id}`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
