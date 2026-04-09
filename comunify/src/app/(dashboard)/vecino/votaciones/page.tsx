import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { Vote, Clock } from 'lucide-react'
import VotarButton from './VotarButton'

export default async function VecinoVotacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('id, community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const memberId: string = membership?.id
  const communityId: string = membership?.community_id
  const admin = createAdminClient()

  const { data: votesRaw } = await (admin.from('votes') as any)
    .select('*, options:vote_options(*), responses:vote_responses(id, member_id, option_id)')
    .eq('community_id', communityId)
    .in('status', ['open', 'closed'])
    .order('created_at', { ascending: false })

  const votes: any[] = votesRaw ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Votaciones</h1>
        <p className="text-slate-500 mt-1">Participa en las decisiones de tu comunidad</p>
      </div>

      {votes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <Vote className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay votaciones activas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {votes.map((vote: any) => {
            const options: any[] = vote.options?.sort((a: any, b: any) => a.order_index - b.order_index) ?? []
            const responses: any[] = vote.responses ?? []
            const myResponse = responses.find((r: any) => r.member_id === memberId)
            const totalVotos = responses.length
            const isClosed = vote.status === 'closed'

            return (
              <div key={vote.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        vote.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {vote.status === 'open' ? 'Abierta' : 'Cerrada'}
                      </span>
                      {vote.ends_at && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" /> Cierra {formatDate(vote.ends_at)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">{vote.title}</h2>
                    {vote.description && <p className="text-sm text-slate-500 mt-1">{vote.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-slate-900">{totalVotos}</p>
                    <p className="text-xs text-slate-400">votos</p>
                  </div>
                </div>

                {/* Opciones */}
                <div className="space-y-3">
                  {options.map((opt: any) => {
                    const count = responses.filter((r: any) => r.option_id === opt.id).length
                    const pct = totalVotos > 0 ? Math.round((count / totalVotos) * 100) : 0
                    const isMyChoice = myResponse?.option_id === opt.id
                    const isWinner = isClosed && options.reduce((max: any, o: any) => {
                      const c = responses.filter((r: any) => r.option_id === o.id).length
                      const mc = responses.filter((r: any) => r.option_id === max.id).length
                      return c > mc ? o : max
                    }, options[0])?.id === opt.id && totalVotos > 0

                    return (
                      <div key={opt.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isMyChoice ? 'text-blue-700' : 'text-slate-900'}`}>
                              {opt.text}
                            </span>
                            {isMyChoice && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Tu voto</span>}
                          </div>
                          <span className="text-xs text-slate-500">{count} · {pct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isMyChoice ? 'bg-blue-600' : isWinner ? 'bg-green-500' : 'bg-slate-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Votar */}
                {vote.status === 'open' && (
                  <div className="mt-5 pt-4 border-t border-slate-50">
                    {myResponse ? (
                      <p className="text-sm text-slate-500 text-center">
                        ✓ Ya has votado · {myResponse.option_id
                          ? options.find((o: any) => o.id === myResponse.option_id)?.text
                          : 'Abstención'}
                      </p>
                    ) : (
                      <VotarButton voteId={vote.id} memberId={memberId} options={options} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
