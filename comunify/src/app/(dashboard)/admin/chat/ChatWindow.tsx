'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare } from 'lucide-react'
import { formatDateTime, getInitials } from '@/lib/utils'

interface Message {
  id: string
  body: string
  sender_id: string
  created_at: string
  channel: string
  sender?: { full_name: string; role: string }
}

interface Props {
  communityId: string
  userId: string
  userName: string
  initialMessages: Message[]
}

export default function ChatWindow({ communityId, userId, userName, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase Realtime — escuchar mensajes nuevos
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          // Fetch el perfil del sender
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single() as any

          const newMsg: Message = {
            ...(payload.new as Message),
            sender: sender ?? { full_name: 'Vecino', role: 'neighbor' },
          }

          setMessages(prev => {
            // evitar duplicados
            if (prev.find(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [communityId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)

    await (supabase.from('chat_messages') as any).insert({
      community_id: communityId,
      sender_id: userId,
      channel: 'general',
      body: input.trim(),
    })

    setInput('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-screen p-8 pb-0">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Chat de la comunidad</h1>
        <p className="text-slate-500 mt-1">Canal general · {messages.length} mensajes</p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden mb-4">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No hay mensajes aún</p>
              <p className="text-slate-400 text-sm mt-1">Escribe el primer mensaje a la comunidad</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === userId
              return (
                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {getInitials(msg.sender?.full_name ?? 'U')}
                  </div>
                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-medium text-slate-700">{msg.sender?.full_name ?? 'Vecino'}</span>
                      <span className="text-xs text-slate-400">{formatDateTime(msg.created_at)}</span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                    }`}>
                      {msg.body}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition text-sm font-medium"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
