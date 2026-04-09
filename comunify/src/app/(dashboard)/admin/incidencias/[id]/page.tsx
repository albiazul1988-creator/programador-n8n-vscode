import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, User, Calendar, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import IncidenciaStatusBadge from '../IncidenciaStatusBadge'
import AddComentario from './AddComentario'

const priorityConfig: Record<string, { label: string; color: string }> = {
  low:    { label: 'Baja',    color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media',   color: 'bg-blue-50 text-blue-700' },
  high:   { label: 'Alta',    color: 'bg-orange-50 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-50 text-red-700' },
}

export default async function IncidenciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inc } = await (supabase.from('incidents') as any)
    .select('*, reporter:profiles!reported_by(full_name, phone), updates:incident_updates(*, author:profiles(full_name))')
    .eq('id', id)
    .single()

  if (!inc) notFound()

  const pCfg = priorityConfig[inc.priority] ?? priorityConfig.medium
  const updates: any[] = inc.updates ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/incidencias" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{inc.title}</h1>
          <p className="text-slate-500 mt-0.5">Incidencia #{id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Descripción</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{inc.description}</p>
          </div>

          {/* Historial */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Historial de actualizaciones</h3>
            {updates.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin actualizaciones aún</p>
            ) : (
              <div className="space-y-4">
                {updates
                  .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((u: any) => (
                    <div key={u.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 text-xs font-bold">
                        {u.author?.full_name?.[0] ?? 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">{u.author?.full_name ?? 'Admin'}</span>
                          <span className="text-xs text-slate-400">{formatDateTime(u.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{u.comment}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-slate-100">
              <AddComentario incidenciaId={id} currentStatus={inc.status} />
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Estado</p>
              <IncidenciaStatusBadge status={inc.status} incidenciaId={inc.id} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Prioridad</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pCfg.color}`}>{pCfg.label}</span>
            </div>
            {inc.location && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Ubicación</p>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {inc.location}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Reportado por</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                {inc.reporter?.full_name ?? '—'}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Fecha apertura</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDateTime(inc.created_at)}
              </div>
            </div>
            {inc.resolved_at && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Fecha resolución</p>
                <div className="flex items-center gap-1.5 text-sm text-green-700">
                  <Clock className="w-4 h-4 text-green-400" />
                  {formatDateTime(inc.resolved_at)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
