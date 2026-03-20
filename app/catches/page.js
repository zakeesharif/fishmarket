'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#c9a84c' : 'none'} stroke={filled ? '#c9a84c' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const IconRod = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="21" x2="21" y2="3"/><path d="M12 12l3-3"/>
  </svg>
)

function InitialsCircle({ name, size = 26 }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '9px', fontWeight: '600', color: '#c9a84c',
      fontFamily: 'var(--font-dm-sans, sans-serif)', flexShrink: 0,
    }}>{initials}</div>
  )
}

function CatchCard({ catch: c, currentUserId, onLikeToggle }) {
  const router = useRouter()

  function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUserId) { router.push('/auth/login'); return }
    onLikeToggle(c.id, c.liked)
  }

  return (
    <Link href={`/catches/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="masonry-item"
        style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.transform = 'none' }}
      >
        {/* Photo */}
        <div style={{ position: 'relative', height: '260px', overflow: 'hidden', background: '#0a1628' }}>
          {c.photo_url ? (
            <Image src={c.photo_url} alt={c.species} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: 'rgba(201,168,76,0.06)' }}>🎣</div>
          )}

          {/* Gradient overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, rgba(10,22,40,0.9) 0%, transparent 100%)' }} />

          {/* Species name over photo */}
          <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '60px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.1rem', fontWeight: '500', color: '#f8f9fa', margin: 0, letterSpacing: '-0.01em' }}>
              {c.species}
            </h3>
          </div>

          {/* Weight/length badges top-right */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            {c.weight_lbs && (
              <span style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(201,168,76,0.3)', padding: '3px 10px', borderRadius: '2px', fontFamily: 'var(--font-playfair, serif)', fontSize: '12px', color: '#c9a84c', fontWeight: '500' }}>
                {c.weight_lbs} lbs
              </span>
            )}
            {c.length_inches && (
              <span style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(74,158,255,0.25)', padding: '3px 10px', borderRadius: '2px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#4a9eff' }}>
                {c.length_inches}"
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px' }}>
          {c.caption && (
            <p className="truncate-3" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '300', color: 'rgba(143,163,184,0.6)', margin: '0 0 10px', lineHeight: 1.55 }}>
              {c.caption}
            </p>
          )}

          {c.location && (
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.4)', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 8px' }}>
              <IconPin /> {c.location}
            </p>
          )}

          {(c.rod || c.reel) && (
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <IconRod /> {[c.rod, c.reel].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Footer: user + date + like */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <InitialsCircle name={c.username || '?'} size={24} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', color: 'rgba(143,163,184,0.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.username || 'Angler'}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', color: 'rgba(143,163,184,0.28)', margin: 0 }}>
                  {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={handleLike}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: c.liked ? '#c9a84c' : 'rgba(143,163,184,0.4)', padding: '4px', transition: 'color 0.15s', flexShrink: 0 }}
            >
              <IconHeart filled={!!c.liked} />
              <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px' }}>{c.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CatchesPage() {
  const { user } = useAuth()
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [sort, setSort] = useState('newest')

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase.from('catches').select('*').limit(20)
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else query = query.order('likes', { ascending: false })

    const { data, error: err } = await query
    if (err) { setError(err.message); setLoading(false); return }

    const records = data || []
    if (records.length === 0) { setCatches([]); setLoading(false); return }

    // Fetch profiles
    const userIds = [...new Set(records.map(c => c.user_id))]
    const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url').in('id', userIds)
    const profileMap = {}
    if (profiles) profiles.forEach(p => { profileMap[p.id] = p })

    // Fetch user's likes
    let likedSet = new Set()
    if (user) {
      const catchIds = records.map(c => c.id)
      const { data: likes } = await supabase.from('catch_likes').select('catch_id').eq('user_id', user.id).in('catch_id', catchIds)
      if (likes) likes.forEach(l => likedSet.add(l.catch_id))
    }

    setCatches(records.map(c => ({
      ...c,
      username: profileMap[c.user_id]?.username || 'Angler',
      avatar_url: profileMap[c.user_id]?.avatar_url || null,
      liked: likedSet.has(c.id),
    })))
    setLoading(false)
  }, [user, sort])

  useEffect(() => { load() }, [load])

  async function handleLikeToggle(catchId, currentlyLiked) {
    if (!user) return
    const supabase = createClient()

    // Optimistic update
    setCatches(prev => prev.map(c => {
      if (c.id !== catchId) return c
      return { ...c, liked: !currentlyLiked, likes: (c.likes || 0) + (currentlyLiked ? -1 : 1) }
    }))

    if (currentlyLiked) {
      await supabase.from('catch_likes').delete().eq('user_id', user.id).eq('catch_id', catchId)
      await supabase.from('catches').update({ likes: supabase.rpc ? undefined : undefined }).eq('id', catchId)
      // Decrement
      const { data: c } = await supabase.from('catches').select('likes').eq('id', catchId).single()
      if (c) await supabase.from('catches').update({ likes: Math.max(0, (c.likes || 1) - 1) }).eq('id', catchId)
    } else {
      await supabase.from('catch_likes').insert({ user_id: user.id, catch_id: catchId })
      const { data: c } = await supabase.from('catches').select('likes').eq('id', catchId).single()
      if (c) await supabase.from('catches').update({ likes: (c.likes || 0) + 1 }).eq('id', catchId)
    }
  }

  const filtered = catches.filter(c => !speciesFilter || c.species?.toLowerCase().includes(speciesFilter.toLowerCase()))

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 10px' }}>
              Community
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.4rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              Catch Log
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.4)', margin: 0, fontSize: '14px', fontWeight: '300' }}>
              {loading ? 'Loading...' : `${filtered.length} catch${filtered.length !== 1 ? 'es' : ''} shared`}
            </p>
          </div>
          {user ? (
            <Link href="/catches/new" className="btn-primary">Log a Catch</Link>
          ) : (
            <Link href="/auth/login" className="btn-ghost">Sign In to Log a Catch</Link>
          )}
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            placeholder="Filter by species..."
            className="fm-input"
            style={{ maxWidth: '260px' }}
          />
          <div style={{ display: 'flex', gap: '0', border: '1px solid #1e3455', borderRadius: '4px', overflow: 'hidden' }}>
            {['newest', 'liked'].map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  background: sort === s ? '#c9a84c' : 'transparent',
                  color: sort === s ? '#0a1628' : 'rgba(143,163,184,0.5)',
                  border: 'none', cursor: 'pointer',
                  padding: '10px 18px',
                  fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', fontWeight: '500',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}
              >
                {s === 'newest' ? 'Newest' : 'Most Liked'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: 'rgba(143,163,184,0.4)', marginBottom: '8px' }}>Could not load catches</p>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(143,163,184,0.3)', background: 'rgba(10,22,40,0.5)', border: '1px solid #162a4a', borderRadius: '4px', padding: '12px 16px', display: 'inline-block' }}>
              Make sure the catches table exists in your Supabase project
            </p>
          </div>
        ) : loading ? (
          <div className="masonry-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="masonry-item skeleton" style={{ height: `${240 + (i % 3) * 40}px`, borderRadius: '8px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', color: 'rgba(143,163,184,0.2)', marginBottom: '16px' }}>
              {speciesFilter ? `No "${speciesFilter}" catches found` : 'No catches yet'}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)', fontSize: '14px', fontWeight: '300', marginBottom: '32px' }}>
              {speciesFilter ? 'Try a different species filter' : 'Be the first to share a catch with the community'}
            </p>
            {user && !speciesFilter && (
              <Link href="/catches/new" className="btn-primary">Log Your First Catch</Link>
            )}
          </div>
        ) : (
          <div className="masonry-grid">
            {filtered.map(c => (
              <CatchCard
                key={c.id}
                catch={c}
                currentUserId={user?.id}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
