'use client'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function InitialsCircle({ name, size = 36 }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(201,168,76,0.12)',
      border: '1px solid rgba(201,168,76,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 32 ? '13px' : '11px', fontWeight: '600',
      color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function MessagesInner() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [listingCtx, setListingCtx] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [mobileShowThread, setMobileShowThread] = useState(false)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const loadConversations = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!data) { setLoadingConvos(false); return }

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

    const partnerIds = [...map.keys()]
    let profiles = {}
    if (partnerIds.length > 0) {
      const { data: profileData } = await supabase.from('profiles').select('id, username, avatar_url').in('id', partnerIds)
      if (profileData) for (const p of profileData) profiles[p.id] = p
    }

    const convos = [...map.values()].map(c => ({ ...c, profile: profiles[c.partnerId] || null }))
    setConversations(convos)
    setLoadingConvos(false)

    // Auto-open: from URL param 'to' (username) or first convo
    const toUsername = searchParams.get('to')
    if (toUsername && convos.length > 0) {
      const found = convos.find(c => c.profile?.username === toUsername)
      if (found && !activeId) setActiveId(found.partnerId)
    } else if (convos.length > 0 && !activeId) {
      setActiveId(convos[0].partnerId)
    }
  }, [user, searchParams])

  useEffect(() => {
    if (user) loadConversations()
  }, [user, loadConversations])

  // Poll every 8 seconds
  useEffect(() => {
    if (!user) return
    pollRef.current = setInterval(() => {
      loadConversations()
      if (activeId) loadThread(activeId, false)
    }, 8000)
    return () => clearInterval(pollRef.current)
  }, [user, activeId, loadConversations])

  const loadThread = useCallback(async (partnerId, scroll = true) => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Check for listing context from first message
    const msgWithListing = (data || []).find(m => m.listing_id)
    if (msgWithListing) {
      const { data: listing } = await supabase.from('listings').select('id, title, photo_url, price').eq('id', msgWithListing.listing_id).single()
      setListingCtx(listing || null)
    } else {
      setListingCtx(null)
    }

    if (scroll) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [user])

  async function markRead(partnerId) {
    if (!user) return
    const supabase = createClient()
    await supabase.from('messages').update({ read: true })
      .eq('sender_id', partnerId).eq('recipient_id', user.id).eq('read', false)
  }

  function openConvo(partnerId) {
    setActiveId(partnerId)
    setMobileShowThread(true)
    loadThread(partnerId)
    markRead(partnerId)
    setConversations(prev => prev.map(c => c.partnerId === partnerId ? { ...c, unread: 0 } : c))
  }

  useEffect(() => {
    if (activeId) {
      loadThread(activeId)
      markRead(activeId)
    }
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendReply(e) {
    e.preventDefault()
    if (!reply.trim() || !activeId) return
    setSending(true)
    const supabase = createClient()
    const { data: msg } = await supabase.from('messages')
      .insert({ sender_id: user.id, recipient_id: activeId, content: reply.trim() })
      .select().single()
    if (msg) setMessages(prev => [...prev, msg])
    setReply('')
    setSending(false)
    loadConversations()
  }

  const activeConvo = conversations.find(c => c.partnerId === activeId)

  if (authLoading || (!user && !authLoading)) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
      </main>
    )
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ padding: '40px 0 24px', borderBottom: '1px solid #162a4a', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', fontWeight: '500', color: '#f8f9fa', margin: 0 }}>
            Messages
          </h1>
        </div>

        {loadingConvos ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '6px', flex: 1 }} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.25)', marginBottom: '12px' }}>
              No messages yet
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: '28px' }}>
              Browse listings and contact a seller to start a conversation
            </p>
            <Link href="/browse" className="btn-primary">Browse Gear</Link>
          </div>
        ) : (
          <div className="messages-layout" style={{ position: 'relative' }}>

            {/* ── Conversation List ── */}
            <div style={{
              borderRight: '1px solid #162a4a',
              overflowY: 'auto',
              display: mobileShowThread ? 'none' : 'block',
            }}>
              {conversations.map(convo => {
                const isActive = activeId === convo.partnerId
                const pName = convo.profile?.username || 'Seaitall Member'
                return (
                  <button
                    key={convo.partnerId}
                    onClick={() => openConvo(convo.partnerId)}
                    style={{
                      width: '100%',
                      background: isActive ? '#0f2040' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #162a4a',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(15,32,64,0.5)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {convo.profile?.avatar_url ? (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          <Image src={convo.profile.avatar_url} alt={pName} width={36} height={36} style={{ objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <InitialsCircle name={pName} size={36} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <p style={{
                            fontFamily: 'var(--font-dm-sans, sans-serif)',
                            fontSize: '13px',
                            fontWeight: convo.unread > 0 ? '600' : '400',
                            color: convo.unread > 0 ? '#f8f9fa' : '#8fa3b8',
                            margin: 0,
                          }}>
                            {pName}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', color: 'rgba(143,163,184,0.3)' }}>
                              {timeAgo(convo.lastMessage.created_at)}
                            </span>
                            {convo.unread > 0 && (
                              <span style={{
                                background: '#c9a84c', color: '#0a1628',
                                borderRadius: '50%', width: '18px', height: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: '700',
                              }}>
                                {convo.unread > 9 ? '9+' : convo.unread}
                              </span>
                            )}
                          </div>
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans, sans-serif)',
                          fontSize: '12px', fontWeight: '300',
                          color: 'rgba(143,163,184,0.45)',
                          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {convo.lastMessage.sender_id === user.id ? 'You: ' : ''}{convo.lastMessage.content.slice(0, 30)}{convo.lastMessage.content.length > 30 ? '…' : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── Thread Panel ── */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              height: 'calc(100vh - 220px)', minHeight: '400px',
            }}>
              {activeConvo ? (
                <>
                  {/* Thread header */}
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #162a4a', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {/* Mobile back */}
                    <button
                      onClick={() => setMobileShowThread(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8fa3b8', display: 'none', padding: '4px', alignItems: 'center' }}
                      className="mobile-back-btn"
                    >
                      <IconBack />
                    </button>
                    {activeConvo.profile?.avatar_url ? (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}>
                        <Image src={activeConvo.profile.avatar_url} alt={activeConvo.profile?.username || ''} width={36} height={36} style={{ objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <InitialsCircle name={activeConvo.profile?.username || 'SM'} size={36} />
                    )}
                    <div style={{ flex: 1 }}>
                      <Link href={`/profile/${activeConvo.profile?.username}`} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', textDecoration: 'none' }}>
                        @{activeConvo.profile?.username || 'Seaitall Member'}
                      </Link>
                    </div>
                  </div>

                  {/* Listing context */}
                  {listingCtx && (
                    <Link href={`/listings/${listingCtx.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 24px', background: '#162a4a', borderBottom: '1px solid #1e3455' }}>
                        {listingCtx.photo_url && (
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                            <Image src={listingCtx.photo_url} alt={listingCtx.title} width={40} height={40} style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div>
                          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', fontWeight: '500', color: '#f8f9fa', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>{listingCtx.title}</p>
                          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '12px', color: '#c9a84c', margin: 0 }}>${Number(listingCtx.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Messages area */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map(msg => {
                      const isMine = msg.sender_id === user.id
                      return (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '70%',
                            background: isMine ? '#c9a84c' : '#162a4a',
                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            padding: '10px 14px',
                          }}>
                            <p style={{
                              fontFamily: 'var(--font-dm-sans, sans-serif)',
                              fontSize: '14px', fontWeight: '300',
                              color: isMine ? '#0a1628' : '#8fa3b8',
                              margin: '0 0 4px', lineHeight: 1.5,
                            }}>
                              {msg.content}
                            </p>
                            <p style={{
                              fontFamily: 'var(--font-dm-sans, sans-serif)',
                              fontSize: '10px',
                              color: isMine ? 'rgba(10,22,40,0.5)' : 'rgba(143,163,184,0.3)',
                              margin: 0, textAlign: 'right',
                            }}>
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply input */}
                  <form
                    onSubmit={sendReply}
                    style={{ padding: '16px 24px', borderTop: '1px solid #162a4a', display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}
                  >
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(e) } }}
                      placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                      rows={2}
                      className="fm-input"
                      style={{ resize: 'none', flex: 1, minHeight: '52px', padding: '14px', lineHeight: 1.5 }}
                    />
                    <button
                      type="submit"
                      disabled={sending || !reply.trim()}
                      className="btn-primary"
                      style={{
                        border: 'none', cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer',
                        opacity: sending || !reply.trim() ? 0.5 : 1,
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                      }}
                    >
                      <IconSend /> Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)' }}>
                    Select a conversation to start messaging
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

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesInner />
    </Suspense>
  )
}
