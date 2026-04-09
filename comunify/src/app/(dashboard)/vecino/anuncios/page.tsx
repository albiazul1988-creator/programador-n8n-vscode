import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { Megaphone, Pin } from 'lucide-react'

const typeConfig: Record<string, { label: string; color: string }> = {
  urgent:    { label: 'Urgente',    color: 'bg-red-100 text-red-700 border-red-200' },
  important: { label: 'Importante', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  normal:    { label: 'Información', color: 'bg-blue-50 text-blue-700 border-blue-200' },
}

export default async function VecinoAnunciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const admin = createAdminClient()

  const { data: anunciosRaw } = await (admin.from('announcements') as any)
    .select('id, title, body, type, pinned, created_at, author:profiles!author_id(full_name)')
    .eq('community_id', membership?.community_id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  const anuncios: any[] = anunciosRaw ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tablón de anuncios</h1>
        <p className="text-slate-500 mt-1">{anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''}</p>
      </div>

      {anuncios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay anuncios</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anuncios.map((a: any) => {
            const cfg = typeConfig[a.type] ?? typeConfig.normal
            return (
              <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${a.pinned ? 'border-blue-200' : 'border-slate-100'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {a.pinned && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <Pin className="w-3 h-3" /> Fijado
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">{a.title}</h2>
                    {a.body && <p className="text-slate-600 mt-2 text-sm leading-relaxed">{a.body}</p>}
                    <p className="text-xs text-slate-400 mt-3">
                      {a.author?.full_name ?? 'Administración'} · {formatDate(a.created_at)}
                    </p>
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
