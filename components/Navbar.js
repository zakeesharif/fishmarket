'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
)

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/>
    <line x1="16.5" y1="16.5" x2="22" y2="22"/>
  </svg>
)

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const IconMessage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

export default function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!user) { setUnread(0); return }
    const supabase = createClient()
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false)
      setUnread(count || 0)
    }
    fetchUnread()
    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, fetchUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, fetchUnread)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  return (
    <>
      {/* ── Desktop / Tablet Nav ─────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 48px',
        height: '60px',
        background: transparent ? 'transparent' : 'rgba(10, 22, 40, 0.97)',
        borderBottom: transparent ? '1px solid transparent' : '1px solid var(--border)',
        backdropFilter: transparent ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(12px)',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '1.25rem',
            fontWeight: '500',
            color: 'var(--text)',
            letterSpacing: '0.01em',
          }}>
            Seaitall
          </span>
        </Link>

        {/* Center links */}
        <div className="desktop-nav-links">
          <Link href="/browse" className="nav-link">Tackle</Link>
          <Link href="/browse?category=Boats" className="nav-link">Boats</Link>
          <Link href="/browse" className="nav-link">Charters</Link>
          <Link href="/browse" className="nav-link">Learn</Link>
        </div>

        {/* Right: auth */}
        <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {!loading && (
            user ? (
              <>
                <Link href="/listings/new" className="nav-link">Sell Gear</Link>
                <Link href="/messages" className="nav-link" style={{ position: 'relative' }}>
                  Messages
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-10px',
                      background: '#c9a84c',
                      color: '#0a1628',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: '700',
                    }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    transition: 'color 0.15s',
                    letterSpacing: '0.04em',
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="nav-link">Log In</Link>
                <Link href="/auth/signup" className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ────────────────────── */}
      <div className="bottom-nav">
        <Link href="/" className={`bottom-nav-item${pathname === '/' ? ' active' : ''}`}>
          <IconHome />
          Home
        </Link>
        <Link href="/browse" className={`bottom-nav-item${pathname === '/browse' ? ' active' : ''}`}>
          <IconSearch />
          Browse
        </Link>
        <Link href="/listings/new" className={`bottom-nav-item${pathname === '/listings/new' ? ' active' : ''}`}>
          <IconPlus />
          Sell
        </Link>
        {user ? (
          <Link href="/messages" className={`bottom-nav-item${pathname === '/messages' ? ' active' : ''}`} style={{ position: 'relative' }}>
            <IconMessage />
            {unread > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: 'calc(50% - 16px)',
                background: '#c9a84c',
                color: '#0a1628',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: '700',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
            Inbox
          </Link>
        ) : (
          <Link href="/auth/login" className={`bottom-nav-item${pathname.startsWith('/auth') ? ' active' : ''}`}>
            <IconUser />
            Account
          </Link>
        )}
      </div>
    </>
  )
}
