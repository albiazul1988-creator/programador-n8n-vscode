import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import EditarPerfil from './EditarPerfil'

const memberTypeLabel: Record<string, string> = {
  owner: 'Propietario', tenant: 'Inquilino',
}
const memberRoleLabel: Record<string, string> = {
  neighbor: 'Vecino', president: 'Presidente', vocal: 'Vocal',
  property_manager: 'Administrador', super_admin: 'Super admin',
}

export default async function VecinoPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, avatar_url')
    .eq('id', user!.id)
    .single() as any

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('unit_number, floor, portal, member_type, role, active, joined_at, community:communities(name, address, city)')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const initials = getInitials(profile?.full_name ?? user?.email ?? 'U')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 mt-1">Tu información en la comunidad</p>
      </div>

      {/* Avatar + info personal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name ?? '—'}</h2>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nombre</p>
            <p className="text-sm text-slate-900">{profile?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Teléfono</p>
            <p className="text-sm text-slate-900">{profile?.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-slate-900">{user?.email}</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-50">
          <EditarPerfil currentName={profile?.full_name ?? ''} currentPhone={profile?.phone ?? ''} />
        </div>
      </div>

      {/* Datos de la unidad */}
      {membership && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Mi unidad</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Número</p>
              <p className="text-sm text-slate-900">{membership.unit_number ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Tipo</p>
              <p className="text-sm text-slate-900">{memberTypeLabel[membership.member_type] ?? membership.member_type ?? '—'}</p>
            </div>
            {membership.portal && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Portal</p>
                <p className="text-sm text-slate-900">{membership.portal}</p>
              </div>
            )}
            {membership.floor && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Planta</p>
                <p className="text-sm text-slate-900">{membership.floor}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Rol</p>
              <p className="text-sm text-slate-900">{memberRoleLabel[membership.role] ?? membership.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Miembro desde</p>
              <p className="text-sm text-slate-900">{membership.joined_at ? formatDate(membership.joined_at) : '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comunidad */}
      {membership?.community && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Mi comunidad</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nombre</p>
              <p className="text-sm text-slate-900">{membership.community.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Dirección</p>
              <p className="text-sm text-slate-900">{membership.community.address}, {membership.community.city}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
