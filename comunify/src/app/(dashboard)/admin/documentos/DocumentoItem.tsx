'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  doc: any
}

export default function DocumentoItem({ doc }: Props) {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function formatSize(bytes: number | null) {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  async function handleDownload() {
    setDownloading(true)
    const res = await fetch(`/api/documentos?path=${encodeURIComponent(doc.file_url)}`)
    const data = await res.json()
    if (data.url) {
      window.open(data.url, '_blank')
    }
    setDownloading(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${doc.name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    await fetch('/api/documentos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, file_url: doc.file_url }),
    })
    router.refresh()
    setDeleting(false)
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{doc.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-slate-400">{formatSize(doc.file_size_bytes)}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">{formatDate(doc.created_at)}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">{doc.uploader?.full_name ?? 'Admin'}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        {doc.visible_to_all
          ? <Eye className="w-4 h-4" />
          : <EyeOff className="w-4 h-4" />
        }
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition text-slate-400"
          title="Descargar"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition text-slate-400"
          title="Eliminar"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
