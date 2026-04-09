import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { title, description, location, priority, community_id } = body

  if (!title || !community_id) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await (supabase.from('incidents') as any).insert({
    community_id,
    reported_by: user.id,
    title,
    description,
    location: location || null,
    priority: priority || 'medium',
    status: 'open',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { id, status, comment } = body

  // Actualizar estado
  const { error: updateError } = await (supabase.from('incidents') as any)
    .update({
      status,
      ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  // Añadir comentario al historial
  if (comment) {
    await (supabase.from('incident_updates') as any).insert({
      incident_id: id,
      author_id: user.id,
      comment,
      status_change: status,
    })
  }

  return NextResponse.json({ success: true })
}
