'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const priorities = [
  { value: 'low',      label: 'Baja',    desc: 'Sin urgencia' },
  { value: 'medium',   label: 'Media',   desc: 'Requiere atención' },
  { value: 'high',     label: 'Alta',    desc: 'Urgente' },
  { value: 'critical', label: 'Crítica', desc: 'Emergencia' },
]

export default function NuevaIncidenciaVecinoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', location: '', priority: 'medium' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const meRes = await fetch('/api/me')
    const me = await meRes.json()

    const res = await fetch('/api/incidencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        priority: form.priority,
        community_id: me.community_id,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al crear'); setLoading(false); return }
    router.push('/vecino/incidencias')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/vecino/incidencias" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva incidencia</h1>
          <p className="text-slate-500 mt-0.5">La administración recibirá tu reporte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              placeholder="Ej: Fuga de agua en escalera"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
              placeholder="Describe el problema con detalle..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ubicación</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Ej: Escalera B, planta 3"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Prioridad</h3>
          <div className="grid grid-cols-2 gap-3">
            {priorities.map(p => (
              <button key={p.value} type="button" onClick={() => setForm({ ...form, priority: p.value })}
                className={`p-3 rounded-xl border-2 text-left transition ${
                  form.priority === p.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <p className={`text-sm font-semibold ${form.priority === p.value ? 'text-blue-700' : 'text-slate-900'}`}>{p.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        <div className="flex gap-3">
          <Link href="/vecino/incidencias"
            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Enviar incidencia'}
          </button>
        </div>
      </form>
    </div>
  )
}
