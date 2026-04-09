import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { title, description, options, community_id, ends_at, quorum_pct } = body

  if (!title || !options?.length || !community_id) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: vote, error: voteError } = await (admin.from('votes') as any).insert({
    community_id,
    created_by: user.id,
    title,
    description: description || null,
    status: 'open',
    quorum_pct: quorum_pct || 50,
    starts_at: new Date().toISOString(),
    ends_at: ends_at || null,
  }).select().single()

  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 400 })

  const optionInserts = options.map((text: string, i: number) => ({
    vote_id: vote.id,
    text,
    order_index: i,
  }))

  const { error: optError } = await (admin.from('vote_options') as any).insert(optionInserts)
  if (optError) return NextResponse.json({ error: optError.message }, { status: 400 })

  return NextResponse.json({ success: true, vote_id: vote.id })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { vote_id, status } = await request.json()
  const admin = createAdminClient()

  const { error } = await (admin.from('votes') as any)
    .update({ status })
    .eq('id', vote_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

// Votar
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { vote_id, option_id, member_id } = await request.json()
  const admin = createAdminClient()

  const { error } = await (admin.from('vote_responses') as any).upsert({
    vote_id,
    member_id,
    option_id: option_id || null,
    voted_at: new Date().toISOString(),
  }, { onConflict: 'vote_id,member_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
