import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Configurar cuota de la comunidad
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { community_id, name, amount, frequency, due_day } = body

  const admin = createAdminClient()

  // Desactivar cuotas anteriores del mismo tipo
  await (admin.from('fees') as any)
    .update({ active: false })
    .eq('community_id', community_id)
    .eq('frequency', frequency)

  const { data, error } = await (admin.from('fees') as any).insert({
    community_id,
    name: name || 'Cuota mensual',
    amount,
    frequency: frequency || 'monthly',
    due_day: due_day || 5,
    active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

// Registrar pago manual
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { fee_id, member_id, community_id, period, amount, status, notes } = body

  const admin = createAdminClient()

  // Upsert — si ya existe el pago del periodo lo actualiza
  const { data, error } = await (admin.from('fee_payments') as any)
    .upsert({
      fee_id,
      member_id,
      community_id,
      period,
      amount,
      status: status || 'paid',
      paid_at: status === 'paid' ? new Date().toISOString() : null,
      notes: notes || null,
    }, { onConflict: 'fee_id,member_id,period' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

// Generar recibos del mes para todos los vecinos
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { community_id, fee_id, period } = await request.json()
  const admin = createAdminClient()

  // Obtener todos los vecinos activos
  const { data: members } = await (admin.from('community_members') as any)
    .select('id')
    .eq('community_id', community_id)
    .eq('active', true) as any

  const { data: fee } = await (admin.from('fees') as any)
    .select('amount')
    .eq('id', fee_id)
    .single() as any

  if (!members || !fee) return NextResponse.json({ error: 'Datos no encontrados' }, { status: 400 })

  const inserts = members.map((m: any) => ({
    fee_id,
    member_id: m.id,
    community_id,
    period,
    amount: fee.amount,
    status: 'pending',
    due_date: null,
  }))

  const { error } = await (admin.from('fee_payments') as any)
    .upsert(inserts, { onConflict: 'fee_id,member_id,period', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, generated: inserts.length })
}
