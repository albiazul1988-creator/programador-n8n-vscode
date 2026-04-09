import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: membership } = await supabase
    .from('community_members')
    .select('id, community_id, role, community:communities(id, name, city)')
    .eq('profile_id', user.id)
    .eq('active', true)
    .single() as any

  return NextResponse.json({
    user_id: user.id,
    member_id: membership?.id ?? null,
    community_id: membership?.community_id ?? null,
    role: membership?.role ?? null,
    community: membership?.community ?? null,
  })
}
