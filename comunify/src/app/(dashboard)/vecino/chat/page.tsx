import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ChatWindow from '../../admin/chat/ChatWindow'

export default async function VecinoChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single() as any

  const { data: membership } = await (supabase.from('community_members') as any)
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single()

  const admin = createAdminClient()

  const { data: messagesRaw } = await (admin.from('chat_messages') as any)
    .select('id, body, sender_id, created_at, channel, sender:profiles(full_name, role)')
    .eq('community_id', membership?.community_id)
    .eq('channel', 'general')
    .order('created_at', { ascending: true })
    .limit(50)

  return (
    <ChatWindow
      communityId={membership?.community_id}
      userId={user!.id}
      userName={profile?.full_name ?? 'Vecino'}
      initialMessages={messagesRaw ?? []}
    />
  )
}
