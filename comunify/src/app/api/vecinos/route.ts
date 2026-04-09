import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { full_name, email, phone, unit_number, portal, floor, door, member_type, role, community_id, coefficient } = body

  if (!full_name || !email || !unit_number || !community_id) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Crear usuario en Supabase Auth con contraseña temporal
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name, phone, role: role || 'neighbor' },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const newUserId = authData.user.id

  // 2. Crear entrada en community_members
  const { error: memberError } = await (admin.from('community_members') as any).insert({
    community_id,
    profile_id: newUserId,
    role: role || 'neighbor',
    member_type: member_type || 'owner',
    unit_number,
    portal: portal || null,
    floor: floor || null,
    door: door || null,
    coefficient: coefficient ? parseFloat(coefficient) : 0,
    active: true,
  })

  if (memberError) {
    // Limpiar el usuario creado si falla el member
    await admin.auth.admin.deleteUser(newUserId)
    return NextResponse.json({ error: memberError.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    user_id: newUserId,
    temp_password: tempPassword,
  })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { member_id } = await request.json()
  const admin = createAdminClient()

  const { error } = await (admin.from('community_members') as any)
    .update({ active: false })
    .eq('id', member_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
