'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Copy, CheckCheck } from 'lucide-react'

export default function NuevoVecinoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ name: string; email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    unit_number: '',
    portal: '',
    floor: '',
    door: '',
    member_type: 'owner',
    role: 'neighbor',
    coefficient: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Obtener community_id del usuario actual
    const meRes = await fetch('/api/me')
    const me = await meRes.json()

    const res = await fetch('/api/vecinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, community_id: me.community_id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al crear el vecino')
      setLoading(false)
      return
    }

    setSuccess({ name: form.full_name, email: form.email, password: data.temp_password })
    setLoading(false)
  }

  async function copyCredentials() {
    if (!success) return
    await navigator.clipboard.writeText(
      `Email: ${success.email}\nContraseña temporal: ${success.password}\nAcceso: ${window.location.origin}/login`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (success) {
    return (
      <div className="p-8 max-w-lg">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Vecino añadido</h2>
          <p className="text-slate-500 mb-6">{success.name} puede entrar con estas credenciales</p>

          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-900">{success.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Contraseña temporal</span>
              <span className="font-mono font-bold text-blue-700">{success.password}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">URL de acceso</span>
              <span className="text-slate-900">{typeof window !== 'undefined' ? window.location.origin : ''}/login</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyCredentials}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
            >
              {copied ? <><CheckCheck className="w-4 h-4 text-green-600" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar acceso</>}
            </button>
            <button
              onClick={() => { setSuccess(null); setForm({ full_name: '', email: '', phone: '', unit_number: '', portal: '', floor: '', door: '', member_type: 'owner', role: 'neighbor', coefficient: '' }) }}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
            >
              Añadir otro
            </button>
          </div>
          <Link href="/admin/vecinos" className="block mt-3 text-sm text-slate-400 hover:text-slate-600">
            Volver a la lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/vecinos" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo vecino</h1>
          <p className="text-slate-500 mt-0.5">El vecino recibirá credenciales para acceder a Comunify</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        {/* Datos personales */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Datos personales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required
                placeholder="Ana García Martínez"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="ana@email.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="612 345 678"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Vivienda */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Vivienda</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nº / Identificador *</label>
              <input name="unit_number" value={form.unit_number} onChange={handleChange} required
                placeholder="2A, 3ºB, Local 1..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Portal</label>
              <input name="portal" value={form.portal} onChange={handleChange} placeholder="A, B, 1..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Planta</label>
              <input name="floor" value={form.floor} onChange={handleChange} placeholder="1, 2, B..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Coeficiente (%)</label>
              <input name="coefficient" value={form.coefficient} onChange={handleChange} type="number" step="0.0001"
                placeholder="0.0250"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
              <select name="member_type" value={form.member_type} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                <option value="owner">Propietario</option>
                <option value="tenant">Inquilino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Rol en comunidad</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                <option value="neighbor">Vecino</option>
                <option value="vocal">Vocal</option>
                <option value="president">Presidente</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/admin/vecinos"
            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : 'Crear vecino'}
          </button>
        </div>
      </form>
    </div>
  )
}
