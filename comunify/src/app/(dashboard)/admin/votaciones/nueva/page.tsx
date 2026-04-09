'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react'

export default function NuevaVotacionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', quorum_pct: '50', ends_at: '' })
  const [options, setOptions] = useState(['A favor', 'En contra', 'Abstención'])

  function addOption() { setOptions([...options, '']) }
  function removeOption(i: number) { setOptions(options.filter((_, idx) => idx !== i)) }
  function updateOption(i: number, val: string) {
    const next = [...options]; next[i] = val; setOptions(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (options.filter(o => o.trim()).length < 2) {
      setError('Añade al menos 2 opciones'); return
    }
    setLoading(true)
    setError('')

    const meRes = await fetch('/api/me')
    const me = await meRes.json()

    const res = await fetch('/api/votaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        options: options.filter(o => o.trim()),
        community_id: me.community_id,
        quorum_pct: parseInt(form.quorum_pct),
        ends_at: form.ends_at || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al crear'); setLoading(false); return }
    router.push('/admin/votaciones')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/votaciones" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva votación</h1>
          <p className="text-slate-500 mt-0.5">Los vecinos podrán votar desde su panel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Pregunta</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              placeholder="Ej: ¿Aprobamos la instalación del ascensor?"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              placeholder="Información adicional sobre la votación..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quórum mínimo (%)</label>
              <input type="number" min="1" max="100" value={form.quorum_pct}
                onChange={e => setForm({ ...form, quorum_pct: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de cierre</label>
              <input type="date" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Opciones de voto</h3>
            <button type="button" onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> Añadir opción
            </button>
          </div>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input value={opt} onChange={e => updateOption(i, e.target.value)}
                placeholder={`Opción ${i + 1}`}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        <div className="flex gap-3">
          <Link href="/admin/votaciones"
            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : 'Crear y abrir votación'}
          </button>
        </div>
      </form>
    </div>
  )
}
