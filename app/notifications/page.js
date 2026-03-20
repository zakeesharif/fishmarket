'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TYPE_ICONS = {
  message: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  listing_saved: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  item_sold: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  new_review: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  catch_liked: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
}

const TYPE_COLORS = {
  message:      { bg: 'rgba(74,158,255,0.12)', color: '#4a9eff' },
  listing_saved: { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c' },
  item_sold:    { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  new_review:   { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c' },
  catch_liked:  { bg: 'rgba(239,68,68,0.12)',  color: '#f87171' },
}

function NotificationItem({ notification, onMarkRead }) {
  const router = useRouter()
  const isUnread = !notification.read
  const icon = TYPE_ICONS[notification.type] || TYPE_ICONS.message
  const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.message

  const handleClick = async () => {
    if (isUnread) await onMarkRead(notification.id)
    if (notification.link) router.push(notification.link)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 20px',
        cursor: notification.link ? 'pointer' : 'default',
        borderBottom: '1px solid #162a4a',
        background: isUnread ? 'rgba(201,168,76,0.02)' : 'transparent',
        borderLeft: isUnread ? '2px solid rgba(201,168,76,0.45)' : '2px solid transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (notification.link) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => e.currentTarget.style.background = isUnread ? 'rgba(201,168,76,0.02)' : 'transparent'}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#f8f9fa', margin: '0 0 4px', fontWeight: isUnread ? '500' : '400', lineHeight: 1.4 }}>
            {notification.title}
          </p>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.4)', whiteSpace: 'nowrap', marginTop: '1px', flexShrink: 0 }}>
            {timeAgo(notification.created_at)}
          </span>
        </div>
        {notification.body && (
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', margin: 0, lineHeight: 1.5, fontWeight: '300' }}>
            {notification.body}
          </p>
        )}
      </div>
      {isUnread && (
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c9a84c', flexShrink: 0, marginTop: '6px' }} />
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    fetchNotifications()
  }, [user, authLoading, fetchNotifications, router])

  // Poll every 10s
  useEffect(() => {
    if (!user) return
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [user, fetchNotifications])

  const markAsRead = async (id) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    if (markingAll) return
    setMarkingAll(true)
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (authLoading || (!user && !authLoading)) {
    return (
      <div style={{ background: '#0a1628', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: '14px', padding: '16px 0', borderBottom: '1px solid #162a4a' }}>
              <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '12px', width: '80%', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.7rem', fontWeight: '500', color: '#f8f9fa', margin: 0, letterSpacing: '-0.02em' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{ background: '#c9a84c', color: '#0a1628', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', minWidth: '20px', textAlign: 'center' }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="btn-ghost"
              style={{ fontSize: '12px', padding: '6px 12px', opacity: markingAll ? 0.6 : 1 }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '10px', overflow: 'hidden' }}>
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: '14px', padding: '16px 20px', borderBottom: '1px solid #162a4a' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: '14px', width: '55%', borderRadius: '4px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '75%', borderRadius: '4px' }} />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
              <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>
                No notifications yet
              </h3>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: 0 }}>
                When someone saves your listing, messages you, or reacts to a catch — you&apos;ll see it here.
              </p>
            </div>
          ) : (
            notifications.map(n => (
              <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
