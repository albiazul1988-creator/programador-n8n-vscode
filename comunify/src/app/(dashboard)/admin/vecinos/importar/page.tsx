'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, CheckCircle2, XCircle, Loader2, Download } from 'lucide-react'

interface CsvRow {
  full_name: string
  email: string
  phone?: string
  unit_number: string
  portal?: string
  floor?: string
  member_type?: string
  coefficient?: string
}

interface ImportResult {
  row: CsvRow
  success: boolean
  error?: string
  password?: string
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(';').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

export default function ImportarVecinosPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<CsvRow[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCsv(text)
      setRows(parsed)
      setResults([])
      setDone(false)
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleImport() {
    if (rows.length === 0) return
    setImporting(true)
    setResults([])

    const meRes = await fetch('/api/me')
    const me = await meRes.json()

    const resultList: ImportResult[] = []

    for (const row of rows) {
      const res = await fetch('/api/vecinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...row, community_id: me.community_id }),
      })
      const data = await res.json()
      resultList.push({
        row,
        success: res.ok,
        error: res.ok ? undefined : data.error,
        password: res.ok ? data.temp_password : undefined,
      })
      setResults([...resultList])
    }

    setImporting(false)
    setDone(true)
  }

  function downloadTemplate() {
    const csv = 'full_name;email;phone;unit_number;portal;floor;member_type;coefficient\nAna García;ana@email.com;612345678;1A;A;1;owner;0.0250\nPedro López;pedro@email.com;698765432;2B;B;2;tenant;0.0180'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_vecinos.csv'
    a.click()
  }

  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/vecinos" className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Importar vecinos desde CSV</h1>
          <p className="text-slate-500 mt-0.5">Sube un archivo con todos los vecinos de una vez</p>
        </div>
      </div>

      {/* Plantilla */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900 text-sm">¿Primera vez? Descarga la plantilla</p>
          <p className="text-blue-600 text-xs mt-0.5">Formato CSV separado por punto y coma (;)</p>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium">
          <Download className="w-4 h-4" /> Descargar plantilla
        </button>
      </div>

      {/* Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-6 bg-white"
      >
        <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="font-medium text-slate-600">Haz clic para seleccionar el archivo CSV</p>
        <p className="text-sm text-slate-400 mt-1">o arrastra y suelta aquí</p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {/* Preview */}
      {rows.length > 0 && !done && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="font-semibold text-slate-900">{rows.length} vecinos detectados</p>
            <button onClick={handleImport} disabled={importing}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition text-sm font-semibold">
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : 'Importar todos'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Nombre', 'Email', 'Teléfono', 'Vivienda', 'Portal', 'Tipo'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.email}</td>
                    <td className="px-4 py-3 text-slate-500">{row.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.unit_number}</td>
                    <td className="px-4 py-3 text-slate-500">{row.portal ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.member_type === 'tenant' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                        {row.member_type === 'tenant' ? 'Inquilino' : 'Propietario'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <p className="text-center text-sm text-slate-400 py-3">y {rows.length - 10} más...</p>
            )}
          </div>
        </div>
      )}

      {/* Resultados en tiempo real */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
            <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
              ✓ {successCount} importados
            </span>
            {errorCount > 0 && (
              <span className="text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                ✗ {errorCount} errores
              </span>
            )}
            {done && (
              <Link href="/admin/vecinos" className="ml-auto text-sm text-blue-600 hover:underline">
                Ver lista de vecinos →
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3">
                {r.success
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                }
                <span className="text-sm font-medium text-slate-900 flex-1">{r.row.full_name}</span>
                <span className="text-xs text-slate-400">{r.row.email}</span>
                {r.error && <span className="text-xs text-red-600 ml-2">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
