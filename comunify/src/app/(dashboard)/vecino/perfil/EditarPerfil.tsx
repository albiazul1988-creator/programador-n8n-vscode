'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Pencil } from 'lucide-react'

interface Props {
  currentName: string
  currentPhone: string
}

export default function EditarPerfil({ currentName, currentPhone }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(currentName)
  const [phone, setPhone] = useState(currentPhone)
  const [error, setError] = useState('')

  async function save() {
    setLoading(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: err } = await (supabase.from('profiles') as any)
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq('id', user!.id)

    if (err) { setError(err.message); setLoading(false); return }
    setEditing(false)
    router.refresh()
    setLoading(false)
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
        <Pencil className="w-3.5 h-3.5" /> Editar datos personales
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre completo</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => setEditing(false)}
          className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition">
          Cancelar
        </button>
        <button onClick={save} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition">
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</> : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
