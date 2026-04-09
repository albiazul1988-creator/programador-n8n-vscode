'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, UserX, Loader2 } from 'lucide-react'

interface Props {
  memberId: string
  memberName: string
}

export default function VecinoActions({ memberId, memberName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDeactivate() {
    if (!confirm(`¿Dar de baja a ${memberName}?`)) return
    setLoading(true)
    setOpen(false)
    await fetch('/api/vecinos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            <button
              onClick={handleDeactivate}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <UserX className="w-4 h-4" />
              Dar de baja
            </button>
          </div>
        </>
      )}
    </div>
  )
}
