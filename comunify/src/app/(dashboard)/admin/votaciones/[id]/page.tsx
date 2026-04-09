import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users, CheckCircle2, Clock } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import VotacionActions from '../VotacionActions'

export default async function VotacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: vote } = await (admin.from('votes') as any)
    .select('*, options:vote_options(*), responses:vote_responses(*, member:community_members(unit_number, profile:profiles(full_name)))')
    .eq('id', id)
    .single() as any

  if (!vote) notFound()

  const options: any[] = vote.options ?? []
  const responses: any[] = vote.responses ?? []

  // Contar votos por opción
  const countByOption: Record<string, number> = {}
  options.forEach((o: any) => { countByOption[o.id] = 0 })
  responses.forEach((r: any) => { if (r.option_id) countByOption[r.option_id] = (countByOption[r.option_id] || 0) + 1 })

  const totalVotos = responses.length
  const mayoriaOpcion = options.reduce((max: any, o: any) =>
    (countByOption[o.id] ?? 0) > (countByOption[max?.id] ?? 0) ? o : max, options[0])

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/votaciones" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{vote.title}</h1>
          <p className="text-slate-500 mt-0.5">Creada el {formatDate(vote.created_at)}</p>
        </div>
        <VotacionActions voteId={vote.id} currentStatus={vote.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Resultados */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Resultados</h2>
            {options.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin opciones configuradas</p>
            ) : (
              <div className="space-y-4">
                {options
                  .sort((a: any, b: any) => a.order_index - b.order_index)
                  .map((opt: any) => {
                    const count = countByOption[opt.id] ?? 0
                    const pct = totalVotos > 0 ? Math.round((count / totalVotos) * 100) : 0
                    const isWinner = opt.id === mayoriaOpcion?.id && totalVotos > 0

                    return (
                      <div key={opt.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{opt.text}</span>
                            {isWinner && vote.status === 'closed' && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{count} voto{count !== 1 ? 's' : ''} · {pct}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isWinner ? 'bg-blue-600' : 'bg-slate-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Lista de votos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Registro de participación</h2>
            {responses.length === 0 ? (
              <p className="text-slate-400 text-sm">Nadie ha votado aún</p>
            ) : (
              <div className="space-y-2">
                {responses.map((r: any) => {
                  const optText = options.find((o: any) => o.id === r.option_id)?.text ?? 'Abstención'
                  return (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{r.member?.profile?.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{r.member?.unit_number} · {formatDateTime(r.voted_at)}</p>
                      </div>
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        {optText}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Estado</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                vote.status === 'open' ? 'bg-green-50 text-green-700' :
                vote.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {vote.status === 'open' ? 'Abierta' : vote.status === 'closed' ? 'Cerrada' : 'Borrador'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Participación</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-900">{totalVotos} votos</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Quórum mínimo</p>
              <span className="text-sm text-slate-700">{vote.quorum_pct}%</span>
            </div>
            {vote.ends_at && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Cierre</p>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {formatDate(vote.ends_at)}
                </div>
              </div>
            )}
            {vote.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Descripción</p>
                <p className="text-sm text-slate-600">{vote.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
