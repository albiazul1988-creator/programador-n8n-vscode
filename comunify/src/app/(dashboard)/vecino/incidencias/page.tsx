import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'

const statusLabel: Record<string, { label: string; color: string }> = {
  open:        { label: 'Abierta',   color: 'bg-amber-50 text-amber-700' },
  in_progress: { label: 'En curso',  color: 'bg-blue-50 text-blue-700' },
  resolved:    { label: 'Resuelta',  color: 'bg-green-50 text-green-700' },
  closed:      { label: 'Cerrada',   color: 'bg-slate-100 text-slate-500' },
}
const priorityLabel: Record<string, { label: string; color: string }> = {
  low:      { label: 'Baja',     color: 'text-slate-500' },
  medium:   { label: 'Media',    color: 'text-amber-600' },
  high:     { label: 'Alta',     color: 'text-orange-600' },
  critical: { label: 'Crítica',  color: 'text-red-600 font-bold' },
}

export default async function VecinoIncidenciasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: incidenciasRaw } = await (admin.from('incidents') as any)
    .select('id, title, status, priority, location, created_at')
    .eq('reported_by', user!.id)
    .order('created_at', { ascending: false })

  const incidencias: any[] = incidenciasRaw ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis incidencias</h1>
          <p className="text-slate-500 mt-1">{incidencias.length} en total</p>
        </div>
        <Link href="/vecino/incidencias/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nueva incidencia
        </Link>
      </div>

      {incidencias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No has reportado incidencias</p>
          <p className="text-slate-400 text-sm mt-1">Si hay algún problema en la comunidad, repórtalo aquí</p>
          <Link href="/vecino/incidencias/nueva"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold">
            <Plus className="w-4 h-4" /> Reportar incidencia
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {incidencias.map((i: any, idx: number) => {
            const s = statusLabel[i.status] ?? statusLabel.open
            const p = priorityLabel[i.priority] ?? priorityLabel.medium
            return (
              <div key={i.id} className={`p-5 flex items-center gap-4 ${idx < incidencias.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                    <span className={`text-xs ${p.color}`}>{p.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{i.title}</p>
                  {i.location && <p className="text-xs text-slate-400 mt-0.5">📍 {i.location}</p>}
                </div>
                <p className="text-xs text-slate-400 shrink-0">{formatDate(i.created_at)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
