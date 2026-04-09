import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { FileText, Download } from 'lucide-react'

const typeLabel: Record<string, string> = {
  statute: 'Estatutos',
  minutes: 'Actas',
  budget: 'Presupuestos',
  contract: 'Contratos',
  insurance: 'Seguros',
  other: 'Otros',
}

export default async function VecinoDocumentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const admin = createAdminClient()

  const { data: docsRaw } = await (admin.from('documents') as any)
    .select('id, name, file_url, file_size_bytes, type, created_at, uploader:profiles!uploaded_by(full_name)')
    .eq('community_id', membership?.community_id)
    .eq('visible_to_all', true)
    .order('type')
    .order('created_at', { ascending: false })

  const docs: any[] = docsRaw ?? []

  // Agrupar por tipo
  const grouped: Record<string, any[]> = {}
  docs.forEach((d: any) => {
    const cat = d.type ?? 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(d)
  })

  function formatSize(bytes: number) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
        <p className="text-slate-500 mt-1">{docs.length} documento{docs.length !== 1 ? 's' : ''} disponibles</p>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay documentos disponibles</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {typeLabel[type] ?? type}
                </h2>
              </div>
              {items.map((doc: any) => (
                <div key={doc.id} className="px-6 py-4 flex items-center gap-4 border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {doc.uploader?.full_name ?? 'Administración'} · {formatDate(doc.created_at)}
                      {doc.file_size_bytes ? ` · ${formatSize(doc.file_size_bytes)}` : ''}
                    </p>
                  </div>
                  <a href={`/api/documentos?path=${encodeURIComponent(doc.file_url)}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
