'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react'

const tipos = [
  { value: 'normal',    label: 'Normal',     desc: 'Información general',          color: 'border-slate-200 bg-white',      active: 'border-blue-500 bg-blue-50' },
  { value: 'important', label: 'Importante', desc: 'Requiere atención',             color: 'border-slate-200 bg-white',      active: 'border-orange-400 bg-orange-50' },
  { value: 'urgent',    label: 'Urgente',    desc: 'Acción inmediata necesaria',    color: 'border-slate-200 bg-white',      active: 'border-red-500 bg-red-50' },
]

export default function NuevoAnuncioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'normal',
    pinned: false,
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

    const res = await fetch('/api/anuncios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, community_id: me.community_id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al publicar el anuncio')
      setLoading(false)
      return
    }

    router.push('/admin/anuncios')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/anuncios" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo anuncio</h1>
          <p className="text-slate-500 mt-0.5">Se publicará en el tablón de todos los vecinos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Tipo de anuncio</h3>
          <div className="grid grid-cols-3 gap-3">
            {tipos.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className={`border-2 rounded-xl p-4 text-left transition ${
                  form.type === t.value ? t.active : t.color + ' hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-slate-900 text-sm">{t.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contenido</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Ej: Corte de agua el martes 15 de abril"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje *</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Escribe aquí el contenido del anuncio..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Fijar arriba */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm({ ...form, pinned: !form.pinned })}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.pinned ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.pinned ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">Fijar en la parte superior</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Preview */}
        {form.title && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Vista previa</p>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                form.type === 'urgent' ? 'bg-red-500' :
                form.type === 'important' ? 'bg-orange-400' : 'bg-blue-400'
              }`} />
              <div>
                <p className="font-semibold text-slate-900">{form.title}</p>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{form.body}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/anuncios"
            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
              : <><Megaphone className="w-4 h-4" /> Publicar anuncio</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
