'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'

const IconHome     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
const IconSearch   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
const IconPlus     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconFish     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12c0 0-4-6-9-6S2 12 2 12s4 6 9 6 9-6 9-6z"/><circle cx="11" cy="12" r="2"/></svg>
const IconMsg      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconUser     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconBell     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconSearchSm = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>

export default function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [unreadMsgs, setUnreadMsgs]   = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [scrolled, setScrolled]       = useState(false)
  const [profile, setProfile]         = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef(null)

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch profile + unread counts when user changes
  useEffect(() => {
    if (!user) { setUnreadMsgs(0); setUnreadNotifs(0); setProfile(null); return }
    const supabase = createClient()

    // Fetch profile for avatar
    supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
      .then(({ data }) => setProfile(data))

    // Unread messages
    const fetchUnread = async () => {
      const { count: msgCount } = await supabase
        .from('messages').select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id).eq('read', false)
      setUnreadMsgs(msgCount || 0)

      const { count: notifCount } = await supabase
        .from('notifications').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('read', false)
      setUnreadNotifs(notifCount || 0)
    }
    fetchUnread()

    const channel = supabase.channel('navbar-counts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, fetchUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, fetchUnread)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchUnread)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchFocused(false)
    }
  }

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  const Badge = ({ count, offset = '-6px' }) => count > 0 ? (
    <span style={{
      position: 'absolute', top: offset, right: offset,
      background: '#c9a84c', color: '#0a1628',
      borderRadius: '50%', width: '15px', height: '15px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '8px', fontWeight: '700', fontFamily: 'var(--font-dm-sans, sans-serif)',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  ) : null

  const AvatarCircle = ({ size = 28 }) => {
    if (profile?.avatar_url) {
      return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.3)', flexShrink: 0 }}>
          <Image src={profile.avatar_url} alt="avatar" width={size} height={size} style={{ objectFit: 'cover' }} />
        </div>
      )
    }
    const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '?'
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', flexShrink: 0 }}>
        {initials}
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop / Tablet Nav ────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: '60px',
        background: transparent ? 'transparent' : 'rgba(10,22,40,0.97)',
        borderBottom: transparent ? '1px solid transparent' : '1px solid var(--border)',
        backdropFilter: transparent ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(16px)',
        transition: 'background 0.3s, border-color 0.3s',
      }}>

        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '1.2rem', fontWeight: '500',
            color: '#f8f9fa', letterSpacing: '0.01em',
          }}>
            Seaitall
          </span>
        </Link>

        {/* Center: links */}
        <div className="desktop-nav-links">
          <Link href="/browse" className={`nav-link${pathname === '/browse' ? ' active' : ''}`}>Gear</Link>
          <Link href="/browse?category=Boats" className="nav-link">Boats</Link>
          <Link href="/charters" className={`nav-link${pathname.startsWith('/charters') ? ' active' : ''}`}>Charters</Link>
          <Link href="/catches" className={`nav-link${pathname.startsWith('/catches') ? ' active' : ''}`}>Catches</Link>
        </div>

        {/* Right: search + auth */}
        <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Global search */}
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(143,163,184,0.4)', pointerEvents: 'none',
            }}>
              <IconSearchSm />
            </div>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search gear, catches..."
              style={{
                background: searchFocused ? 'rgba(22,42,74,0.9)' : 'rgba(15,32,64,0.7)',
                border: `1px solid ${searchFocused ? 'rgba(201,168,76,0.4)' : 'rgba(22,42,74,0.8)'}`,
                borderRadius: '4px',
                padding: '7px 12px 7px 30px',
                color: '#f8f9fa',
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '12px',
                outline: 'none',
                width: searchFocused ? '220px' : '160px',
                transition: 'width 0.25s, border-color 0.18s, background 0.18s',
              }}
            />
          </form>

          {!loading && (user ? (
            <>
              {/* Notifications bell */}
              <Link href="/notifications" style={{ position: 'relative', color: 'rgba(143,163,184,0.6)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.6)'}
              >
                <IconBell />
                <Badge count={unreadNotifs} offset="-5px" />
              </Link>

              {/* Messages */}
              <Link href="/messages" style={{ position: 'relative', color: 'rgba(143,163,184,0.6)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.6)'}
              >
                <IconMsg />
                <Badge count={unreadMsgs} offset="-5px" />
              </Link>

              {/* Log a catch */}
              <Link href="/catches/new" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#c9a84c', fontWeight: '500', letterSpacing: '0.03em', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e0b85a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#c9a84c'}
              >
                Log Catch
              </Link>

              {/* Sell gear */}
              <Link href="/listings/new" className="btn-primary" style={{ padding: '8px 18px', fontSize: '12px' }}>
                Sell Gear
              </Link>

              {/* Avatar dropdown */}
              <Link href={profile?.username ? `/profile/${profile.username}` : '#'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AvatarCircle size={30} />
              </Link>

              <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', transition: 'color 0.15s', letterSpacing: '0.04em' }}
                onMouseEnter={(e) => e.target.style.color = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(143,163,184,0.4)'}
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
          ))}
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ──────────────────── */}
      <div className="bottom-nav">
        <Link href="/" className={`bottom-nav-item${pathname === '/' ? ' active' : ''}`}>
          <IconHome />Home
        </Link>
        <Link href="/browse" className={`bottom-nav-item${pathname === '/browse' ? ' active' : ''}`}>
          <IconSearch />Browse
        </Link>
        <Link href="/listings/new" className={`bottom-nav-item${pathname === '/listings/new' ? ' active' : ''}`}>
          <IconPlus />Sell
        </Link>
        <Link href="/catches" className={`bottom-nav-item${pathname.startsWith('/catches') ? ' active' : ''}`}>
          <IconFish />Catches
        </Link>
        {user ? (
          <Link href="/messages" className={`bottom-nav-item${pathname === '/messages' ? ' active' : ''}`} style={{ position: 'relative' }}>
            <IconMsg />
            {unreadMsgs > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: 'calc(50% - 18px)', background: '#c9a84c', color: '#0a1628', borderRadius: '50%', width: '13px', height: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: '700' }}>
                {unreadMsgs > 9 ? '9+' : unreadMsgs}
              </span>
            )}
            Inbox
          </Link>
        ) : (
          <Link href="/auth/login" className={`bottom-nav-item${pathname.startsWith('/auth') ? ' active' : ''}`}>
            <IconUser />Account
          </Link>
        )}
      </div>
    </>
  )
}
