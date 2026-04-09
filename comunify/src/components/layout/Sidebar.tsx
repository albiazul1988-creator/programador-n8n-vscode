'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types/database'
import {
  Building2,
  LayoutDashboard,
  Megaphone,
  AlertCircle,
  Calendar,
  CreditCard,
  Vote,
  FileText,
  MessageSquare,
  Users,
  Car,
  Shield,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Anuncios', href: '/admin/anuncios', icon: Megaphone },
  { label: 'Incidencias', href: '/admin/incidencias', icon: AlertCircle },
  { label: 'Reservas', href: '/admin/reservas', icon: Calendar },
  { label: 'Cuotas y pagos', href: '/admin/pagos', icon: CreditCard },
  { label: 'Votaciones', href: '/admin/votaciones', icon: Vote },
  { label: 'Documentos', href: '/admin/documentos', icon: FileText },
  { label: 'Chat', href: '/admin/chat', icon: MessageSquare },
  { label: 'Vecinos', href: '/admin/vecinos', icon: Users },
  { label: 'Parking', href: '/admin/parking', icon: Car },
  { label: 'Accesos', href: '/admin/accesos', icon: Shield },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

const neighborNavItems = [
  { label: 'Inicio', href: '/vecino', icon: LayoutDashboard },
  { label: 'Mis pagos', href: '/vecino/pagos', icon: CreditCard },
  { label: 'Incidencias', href: '/vecino/incidencias', icon: AlertCircle },
  { label: 'Reservas', href: '/vecino/reservas', icon: Calendar },
  { label: 'Votaciones', href: '/vecino/votaciones', icon: Vote },
  { label: 'Documentos', href: '/vecino/documentos', icon: FileText },
  { label: 'Chat', href: '/vecino/chat', icon: MessageSquare },
  { label: 'Mi perfil', href: '/vecino/perfil', icon: Settings },
]

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isAdmin = profile?.role && ['super_admin', 'property_manager', 'president', 'vocal'].includes(profile.role)
  const navItems = isAdmin ? adminNavItems : neighborNavItems

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">Comunify</span>
            <p className="text-xs text-slate-400 leading-none mt-0.5">
              {isAdmin ? 'Panel admin' : 'Mi portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && href !== '/vecino' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
            {profile?.full_name ? getInitials(profile.full_name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name ?? 'Usuario'}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
