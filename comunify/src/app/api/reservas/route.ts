import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Crear zona común
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { community_id, name, description, capacity, max_reservations_per_month, rules } = body

  const admin = createAdminClient()
  const { data, error } = await (admin.from('common_areas') as any).insert({
    community_id,
    name,
    description: description || null,
    capacity: capacity ? parseInt(capacity) : null,
    max_reservations_per_month: max_reservations_per_month || 4,
    rules: rules || null,
    active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

// Crear reserva
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { area_id, community_id, member_id, date, start_time, end_time, notes } = body

  const admin = createAdminClient()

  // Verificar que no hay conflicto de horario
  const { data: conflict } = await (admin.from('reservations') as any)
    .select('id')
    .eq('area_id', area_id)
    .eq('date', date)
    .eq('status', 'confirmed')
    .or(`start_time.lt.${end_time},end_time.gt.${start_time}`)
    .limit(1) as any

  if (conflict && conflict.length > 0) {
    return NextResponse.json({ error: 'Ya existe una reserva en ese horario' }, { status: 409 })
  }

  const { data, error } = await (admin.from('reservations') as any).insert({
    area_id,
    community_id,
    member_id,
    date,
    start_time,
    end_time,
    notes: notes || null,
    status: 'confirmed',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

// Cancelar reserva
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await request.json()
  const admin = createAdminClient()

  const { error } = await (admin.from('reservations') as any)
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: user.id })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
