import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Megaphone, Plus, Pin, AlertTriangle, Info } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import AnuncioActions from './AnuncioActions'

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  normal:    { label: 'Normal',    color: 'bg-slate-100 text-slate-600',   icon: Info },
  important: { label: 'Importante', color: 'bg-orange-50 text-orange-700', icon: AlertTriangle },
  urgent:    { label: 'Urgente',   color: 'bg-red-50 text-red-700',        icon: AlertTriangle },
}

export default async function AnunciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single() as any

  const communityId = membership?.community_id

  const { data: anunciosRaw } = await supabase
    .from('announcements')
    .select('*, author:profiles(full_name)')
    .eq('community_id', communityId)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false }) as any

  const anuncios: any[] = anunciosRaw ?? []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Anuncios</h1>
          <p className="text-slate-500 mt-1">{anuncios.length} publicados</p>
        </div>
        <Link
          href="/admin/anuncios/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuevo anuncio
        </Link>
      </div>

      {/* Lista */}
      {anuncios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay anuncios aún</p>
          <p className="text-slate-400 text-sm mt-1">Crea el primer comunicado para tus vecinos</p>
          <Link
            href="/admin/anuncios/nuevo"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Crear anuncio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {anuncios.map((a: any) => {
            const cfg = typeConfig[a.type] ?? typeConfig.normal
            const Icon = cfg.icon
            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border shadow-sm p-6 flex gap-5 items-start transition hover:shadow-md ${
                  a.type === 'urgent' ? 'border-red-200' :
                  a.type === 'important' ? 'border-orange-200' : 'border-slate-100'
                }`}
              >
                {/* Icono tipo */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && (
                      <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                    <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{a.body}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {a.author?.full_name ?? 'Admin'} · {formatDateTime(a.published_at)}
                  </p>
                </div>

                {/* Acciones */}
                <AnuncioActions anuncioId={a.id} title={a.title} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
