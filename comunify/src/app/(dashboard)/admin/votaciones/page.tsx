import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Vote, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import VotacionActions from './VotacionActions'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:  { label: 'Borrador', color: 'bg-slate-100 text-slate-600',  icon: Clock },
  open:   { label: 'Abierta',  color: 'bg-green-50 text-green-700',   icon: CheckCircle2 },
  closed: { label: 'Cerrada',  color: 'bg-slate-100 text-slate-500',  icon: XCircle },
}

export default async function VotacionesPage() {
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

  const { data: votesRaw } = await (admin.from('votes') as any)
    .select('*, options:vote_options(*), responses:vote_responses(id)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false }) as any

  const votes: any[] = votesRaw ?? []

  // Total miembros para calcular participación
  const { count: totalMembers } = await (admin.from('community_members') as any)
    .select('*', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('active', true) as any

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Votaciones</h1>
          <p className="text-slate-500 mt-1">{votes.length} en total</p>
        </div>
        <Link href="/admin/votaciones/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nueva votación
        </Link>
      </div>

      {votes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <Vote className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay votaciones aún</p>
          <p className="text-slate-400 text-sm mt-1">Crea votaciones para que los vecinos participen en decisiones</p>
          <Link href="/admin/votaciones/nueva"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold">
            <Plus className="w-4 h-4" /> Crear primera votación
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {votes.map((v: any) => {
            const cfg = statusConfig[v.status] ?? statusConfig.draft
            const Icon = cfg.icon
            const responses = v.responses?.length ?? 0
            const participacion = totalMembers ? Math.round((responses / totalMembers) * 100) : 0

            return (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />{cfg.label}
                      </span>
                      {v.ends_at && (
                        <span className="text-xs text-slate-400">Cierra: {formatDate(v.ends_at)}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{v.title}</h3>
                    {v.description && <p className="text-sm text-slate-500 mt-1">{v.description}</p>}

                    {/* Opciones */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {v.options?.map((opt: any) => (
                        <span key={opt.id} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          {opt.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-slate-900">{responses}</p>
                    <p className="text-xs text-slate-400">de {totalMembers ?? '—'} votos</p>
                    <div className="mt-2 w-24">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${participacion}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-right">{participacion}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400">Creada el {formatDate(v.created_at)}</p>
                  <div className="flex gap-3">
                    <Link href={`/admin/votaciones/${v.id}`}
                      className="text-sm text-blue-600 hover:underline font-medium">Ver detalle →</Link>
                    <VotacionActions voteId={v.id} currentStatus={v.status} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
