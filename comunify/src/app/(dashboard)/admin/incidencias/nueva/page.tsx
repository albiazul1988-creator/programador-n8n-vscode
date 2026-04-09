'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const prioridades = [
  { value: 'low',    label: 'Baja',    desc: 'Sin urgencia',           color: 'border-slate-200', active: 'border-slate-500 bg-slate-50' },
  { value: 'medium', label: 'Media',   desc: 'Atención en días',       color: 'border-slate-200', active: 'border-blue-500 bg-blue-50' },
  { value: 'high',   label: 'Alta',    desc: 'Requiere pronta acción', color: 'border-slate-200', active: 'border-orange-500 bg-orange-50' },
  { value: 'urgent', label: 'Urgente', desc: 'Acción inmediata',       color: 'border-slate-200', active: 'border-red-500 bg-red-50' },
]

export default function NuevaIncidenciaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const meRes = await fetch('/api/me')
    const me = await meRes.json()

    const res = await fetch('/api/incidencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, community_id: me.community_id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al crear la incidencia')
      setLoading(false)
      return
    }

    router.push('/admin/incidencias')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/incidencias" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva incidencia</h1>
          <p className="text-slate-500 mt-0.5">Registra un problema para hacerle seguimiento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prioridad */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Prioridad</h3>
          <div className="grid grid-cols-4 gap-3">
            {prioridades.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm({ ...form, priority: p.value })}
                className={`border-2 rounded-xl p-3 text-left transition ${
                  form.priority === p.value ? p.active : p.color + ' hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-slate-900 text-sm">{p.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Detalles</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Ej: Fuga de agua en garaje planta -1"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ubicación</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Ej: Garaje planta -1, junto al ascensor"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe el problema con el mayor detalle posible..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/incidencias"
            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Registrar incidencia'}
          </button>
        </div>
      </form>
    </div>
  )
}
