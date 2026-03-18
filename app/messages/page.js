'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const bottomRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  // Load conversations
  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  // Open conversation from URL param (e.g. from listing contact)
  useEffect(() => {
    const partner = searchParams.get('with')
    if (partner && conversations.length > 0) {
      const found = conversations.find((c) => c.partnerId === partner)
      if (found) setActiveId(found.partnerId)
    }
  }, [searchParams, conversations])

  // Load thread when active conversation changes
  useEffect(() => {
    if (!activeId || !user) return
    loadThread(activeId)
    markRead(activeId)
  }, [activeId, user])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!data) { setLoadingConvos(false); return }

    // Group by conversation partner
    const map = new Map()
    for (const msg of data) {
      const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
      if (!map.has(partnerId)) {
        map.set(partnerId, { partnerId, lastMessage: msg, unread: 0 })
      }
      if (!msg.read && msg.recipient_id === user.id) {
        map.get(partnerId).unread++
      }
    }

    // Fetch partner profiles
    const partnerIds = [...map.keys()]
    let profiles = {}
    if (partnerIds.length > 0) {
      const { data: profileData } = await supabase.from('profiles').select('*').in('id', partnerIds)
      if (profileData) {
        for (const p of profileData) profiles[p.id] = p
      }
    }

    const convos = [...map.values()].map((c) => ({ ...c, profile: profiles[c.partnerId] || null }))
    setConversations(convos)
    setLoadingConvos(false)

    // Auto-open first conversation
    if (convos.length > 0 && !activeId) setActiveId(convos[0].partnerId)
  }

  async function loadThread(partnerId) {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function markRead(partnerId) {
    const supabase = createClient()
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('recipient_id', user.id)
      .eq('read', false)
  }

  async function sendReply(e) {
    e.preventDefault()
    if (!reply.trim() || !activeId) return
    setSending(true)
    const supabase = createClient()
    const { data: msg } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, recipient_id: activeId, content: reply.trim() })
      .select()
      .single()
    if (msg) setMessages((prev) => [...prev, msg])
    setReply('')
    setSending(false)
    loadConversations()
  }

  const activeConvo = conversations.find((c) => c.partnerId === activeId)

  if (authLoading || (!user && !authLoading)) {
    return <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}><Navbar /></main>
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 80px' }}>

        {/* Header */}
        <div style={{ padding: '40px 0 24px', borderBottom: '1px solid #162a4a' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', fontWeight: '500', color: '#f8f9fa', margin: 0 }}>
            Messages
          </h1>
        </div>

        {loadingConvos ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(143,163,184,0.3)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px' }}>
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.3rem', color: 'rgba(143,163,184,0.3)', marginBottom: '12px' }}>No messages yet</p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: '28px' }}>
              Find a listing you like and contact the seller
            </p>
            <Link href="/browse" className="btn-primary">Browse Gear</Link>
          </div>
        ) : (
          <div className="messages-layout">

            {/* Conversation list */}
            <div style={{ borderRight: '1px solid #162a4a', overflowY: 'auto' }}>
              {conversations.map((convo) => (
                <button
                  key={convo.partnerId}
                  onClick={() => setActiveId(convo.partnerId)}
                  style={{
                    width: '100%',
                    background: activeId === convo.partnerId ? '#0f2040' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #162a4a',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (activeId !== convo.partnerId) e.currentTarget.style.background = 'rgba(15,32,64,0.5)' }}
                  onMouseLeave={(e) => { if (activeId !== convo.partnerId) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#162a4a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(143,163,184,0.5)',
                      flexShrink: 0,
                    }}>
                      <IconUser />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans, sans-serif)',
                          fontSize: '13px',
                          fontWeight: convo.unread > 0 ? '600' : '400',
                          color: convo.unread > 0 ? '#f8f9fa' : '#8fa3b8',
                          margin: 0,
                        }}>
                          {convo.profile?.username || 'Seaitall Member'}
                        </p>
                        {convo.unread > 0 && (
                          <span style={{
                            background: '#c9a84c',
                            color: '#0a1628',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: '700',
                            flexShrink: 0,
                          }}>
                            {convo.unread}
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans, sans-serif)',
                        fontSize: '12px',
                        fontWeight: '300',
                        color: 'rgba(143,163,184,0.45)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {convo.lastMessage.sender_id === user.id ? 'You: ' : ''}{convo.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Thread */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: '400px' }}>
              {activeConvo ? (
                <>
                  {/* Thread header */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #162a4a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#162a4a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(143,163,184,0.5)',
                    }}>
                      <IconUser />
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', margin: 0 }}>
                      {activeConvo.profile?.username || 'Seaitall Member'}
                    </p>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id
                      return (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '70%',
                            background: isMine ? 'rgba(201,168,76,0.12)' : '#0f2040',
                            border: `1px solid ${isMine ? 'rgba(201,168,76,0.2)' : '#162a4a'}`,
                            borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            padding: '10px 14px',
                          }}>
                            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300', color: isMine ? '#e8d48a' : '#8fa3b8', margin: '0 0 4px', lineHeight: 1.5 }}>
                              {msg.content}
                            </p>
                            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', color: 'rgba(143,163,184,0.3)', margin: 0, textAlign: 'right' }}>
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply input */}
                  <form onSubmit={sendReply} style={{ padding: '16px 24px', borderTop: '1px solid #162a4a', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(e) } }}
                      placeholder="Type a message..."
                      rows={1}
                      className="fm-input"
                      style={{ resize: 'none', flex: 1, minHeight: '44px', padding: '11px 14px' }}
                    />
                    <button
                      type="submit"
                      disabled={sending || !reply.trim()}
                      className="btn-primary"
                      style={{
                        border: 'none',
                        cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer',
                        opacity: sending || !reply.trim() ? 0.5 : 1,
                        padding: '11px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                      }}
                    >
                      <IconSend /> Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)' }}>
                    Select a conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
