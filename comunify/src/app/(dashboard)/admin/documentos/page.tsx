import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FileText, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import SubirDocumento from './SubirDocumento'
import DocumentoItem from './DocumentoItem'

const typeLabels: Record<string, string> = {
  statute: 'Estatutos',
  minutes: 'Actas',
  budget: 'Presupuestos',
  contract: 'Contratos',
  insurance: 'Seguros',
  other: 'Otros',
}

export default async function DocumentosPage() {
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
  const { data: docsRaw } = await (admin.from('documents') as any)
    .select('*, uploader:profiles!uploaded_by(full_name)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false }) as any

  const docs: any[] = docsRaw ?? []

  // Agrupar por tipo
  const grouped = docs.reduce((acc: any, doc: any) => {
    const key = doc.type ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(doc)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
          <p className="text-slate-500 mt-1">{docs.length} archivos</p>
        </div>
        <SubirDocumento communityId={communityId} />
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay documentos aún</p>
          <p className="text-slate-400 text-sm mt-1">Sube estatutos, actas, seguros y más</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, typeDocs]: any) => (
            <div key={type}>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                {typeLabels[type] ?? type} ({typeDocs.length})
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                {typeDocs.map((doc: any) => (
                  <DocumentoItem key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
