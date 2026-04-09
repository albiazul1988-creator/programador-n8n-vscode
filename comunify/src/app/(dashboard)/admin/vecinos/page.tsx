import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus, Upload, UserCheck, UserX, Home } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import VecinoActions from './VecinoActions'

export default async function VecinosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single() as any

  const communityId = membership?.community_id

  const { data: membersRaw } = await supabase
    .from('community_members')
    .select('*, profile:profiles(id, full_name, phone, avatar_url, role)')
    .eq('community_id', communityId)
    .order('unit_number') as any

  const members: any[] = membersRaw ?? []
  const active = members.filter(m => m.active)
  const inactive = members.filter(m => !m.active)

  const roleLabel: Record<string, string> = {
    president: 'Presidente',
    vocal: 'Vocal',
    neighbor: 'Vecino',
    property_manager: 'Admin. fincas',
  }

  const memberTypeLabel: Record<string, string> = {
    owner: 'Propietario',
    tenant: 'Inquilino',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vecinos</h1>
          <p className="text-slate-500 mt-1">{active.length} activos · {inactive.length} inactivos</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/vecinos/importar"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </Link>
          <Link
            href="/admin/vecinos/nuevo"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Nuevo vecino
          </Link>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{active.length}</p>
            <p className="text-sm text-slate-500">Total activos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {active.filter(m => m.member_type === 'owner').length}
            </p>
            <p className="text-sm text-slate-500">Propietarios</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {active.filter(m => m.member_type === 'tenant').length}
            </p>
            <p className="text-sm text-slate-500">Inquilinos</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {active.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No hay vecinos aún</p>
            <p className="text-slate-400 text-sm mt-1">Añade el primer vecino manualmente o importa desde CSV</p>
            <Link
              href="/admin/vecinos/nuevo"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Añadir primer vecino
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vecino</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vivienda</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {active.map((member: any) => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                        {member.profile?.full_name ? getInitials(member.profile.full_name) : '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.profile?.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{member.profile?.phone ?? 'Sin teléfono'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-medium text-slate-700">
                        {[member.portal && `Portal ${member.portal}`, member.unit_number].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      member.member_type === 'owner'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {memberTypeLabel[member.member_type] ?? member.member_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {roleLabel[member.role] ?? member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <VecinoActions memberId={member.id} memberName={member.profile?.full_name ?? 'este vecino'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
