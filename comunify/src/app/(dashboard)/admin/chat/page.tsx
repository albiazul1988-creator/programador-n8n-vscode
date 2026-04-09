import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ChatWindow from './ChatWindow'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', user!.id)
    .eq('active', true)
    .single() as any

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single() as any

  const communityId = membership?.community_id

  const admin = createAdminClient()

  // Últimos 50 mensajes del canal general
  const { data: messagesRaw } = await (admin.from('chat_messages') as any)
    .select('*, sender:profiles(full_name, role)')
    .eq('community_id', communityId)
    .eq('channel', 'general')
    .order('created_at', { ascending: false })
    .limit(50) as any

  const messages = (messagesRaw ?? []).reverse()

  return (
    <ChatWindow
      communityId={communityId}
      userId={user!.id}
      userName={profileRaw?.full_name ?? 'Admin'}
      initialMessages={messages}
    />
  )
}
