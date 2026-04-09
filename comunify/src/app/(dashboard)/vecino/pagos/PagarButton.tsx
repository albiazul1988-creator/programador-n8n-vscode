'use client'

import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'

export default function PagarButton({ feePaymentId }: { feePaymentId: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePagar() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee_payment_id: feePaymentId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error ?? 'Error al iniciar el pago')
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePagar} disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition">
      {loading
        ? <><Loader2 className="w-3 h-3 animate-spin" /> Redirigiendo...</>
        : <><CreditCard className="w-3 h-3" /> Pagar</>
      }
    </button>
  )
}
