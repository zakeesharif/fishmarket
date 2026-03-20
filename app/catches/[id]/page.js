'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconWeight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.9-2.54L19.4 9.46A2 2 0 0 0 17.48 8z"/>
  </svg>
)

const IconRuler = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l18 18M3 3l4 4m-4-4l4-4M21 21l-4-4m4 4l-4 4"/>
    <line x1="3" y1="21" x2="21" y2="3"/>
  </svg>
)

const IconCal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#c9a84c' : 'none'} stroke={filled ? '#c9a84c' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const IconRod = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="21" x2="21" y2="3"/><path d="M12 12l3-3"/>
  </svg>
)

function InitialsCircle({ name, size = 44 }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.floor(size * 0.33) + 'px', fontWeight: '600',
      color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', flexShrink: 0,
    }}>{initials}</div>
  )
}

export default function CatchPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [catchData, setCatchData] = useState(null)
  const [catcher, setCatcher] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id, user])

  async function load() {
    const supabase = createClient()
    const { data: c } = await supabase.from('catches').select('*').eq('id', id).single()
    if (!c) { setLoading(false); return }
    setCatchData(c)
    setLikeCount(c.likes || 0)

    // Load catcher profile
    const { data: p } = await supabase.from('profiles').select('id, username, avatar_url, verified').eq('id', c.user_id).single()
    setCatcher(p || null)

    // Check if user liked
    if (user) {
      const { data: like } = await supabase.from('catch_likes').select('id').eq('user_id', user.id).eq('catch_id', id).single()
      setLiked(!!like)
    }

    // Related catches (same species)
    const { data: rel } = await supabase.from('catches').select('*').eq('species', c.species).neq('id', id).limit(4).order('created_at', { ascending: false })
    setRelated(rel || [])

    setLoading(false)
  }

  async function handleLike() {
    if (!user) { router.push('/auth/login'); return }
    const supabase = createClient()

    if (liked) {
      setLiked(false)
      setLikeCount(n => Math.max(0, n - 1))
      await supabase.from('catch_likes').delete().eq('user_id', user.id).eq('catch_id', id)
      const { data: c } = await supabase.from('catches').select('likes').eq('id', id).single()
      if (c) await supabase.from('catches').update({ likes: Math.max(0, (c.likes || 1) - 1) }).eq('id', id)
    } else {
      setLiked(true)
      setLikeCount(n => n + 1)
      await supabase.from('catch_likes').insert({ user_id: user.id, catch_id: id })
      const { data: c } = await supabase.from('catches').select('likes').eq('id', id).single()
      if (c) await supabase.from('catches').update({ likes: (c.likes || 0) + 1 }).eq('id', id)
    }
  }

  if (loading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div>
          <div className="skeleton" style={{ height: '60vh', width: '100%' }} />
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 32px' }}>
            <div className="skeleton" style={{ height: '48px', width: '280px', marginBottom: '24px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '12px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '16px', width: '75%', borderRadius: '4px' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!catchData) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.3)', marginBottom: '24px' }}>Catch not found</p>
          <Link href="/catches" className="btn-primary">Back to Catches</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      {/* Hero photo */}
      <div style={{ position: 'relative', height: '60vh', minHeight: '380px', background: '#0f2040' }}>
        {catchData.photo_url && (
          <Image src={catchData.photo_url} alt={catchData.species} fill style={{ objectFit: 'cover' }} priority />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,1) 0%, rgba(10,22,40,0.3) 50%, transparent 100%)' }} />

        {/* Back link */}
        <Link href="/catches"
          style={{ position: 'absolute', top: '24px', left: '32px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(248,249,250,0.7)', backdropFilter: 'blur(4px)', background: 'rgba(10,22,40,0.4)', padding: '8px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', transition: 'background 0.15s', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,22,40,0.7)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,22,40,0.4)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Catches
        </Link>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 32px 80px' }}>
        {/* Main content */}
        <div style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>

          {/* Species heading + like */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '3rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {catchData.species}
              </h1>
            </div>
            <button
              onClick={handleLike}
              style={{
                background: liked ? 'rgba(201,168,76,0.12)' : '#0f2040',
                border: `1px solid ${liked ? 'rgba(201,168,76,0.3)' : '#1e3455'}`,
                borderRadius: '4px', padding: '12px 20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500',
                color: liked ? '#c9a84c' : '#8fa3b8',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              <IconHeart filled={liked} />
              {likeCount}
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #162a4a' }}>
            {catchData.weight_lbs && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconWeight />
                <div>
                  <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: '#c9a84c', margin: 0 }}>{catchData.weight_lbs} lbs</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.35)', margin: 0 }}>Weight</p>
                </div>
              </div>
            )}
            {catchData.length_inches && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconRuler />
                <div>
                  <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: '#4a9eff', margin: 0 }}>{catchData.length_inches}"</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.35)', margin: 0 }}>Length</p>
                </div>
              </div>
            )}
            {catchData.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconPin />
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#f8f9fa', margin: 0 }}>{catchData.location}</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.35)', margin: 0 }}>Location</p>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCal />
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#f8f9fa', margin: 0 }}>
                  {new Date(catchData.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.35)', margin: 0 }}>Date</p>
              </div>
            </div>
          </div>

          {/* Caption */}
          {catchData.caption && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', fontWeight: '300', color: '#8fa3b8', lineHeight: 1.75, margin: 0 }}>
                {catchData.caption}
              </p>
            </div>
          )}

          {/* Gear section */}
          {(catchData.rod || catchData.reel || catchData.lure_bait) && (
            <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '24px', marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 16px' }}>Gear Used</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {catchData.rod && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.3)', margin: '0 0 4px' }}>Rod</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconRod /> {catchData.rod}
                    </p>
                  </div>
                )}
                {catchData.reel && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.3)', margin: '0 0 4px' }}>Reel</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', margin: 0 }}>{catchData.reel}</p>
                  </div>
                )}
                {catchData.lure_bait && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.3)', margin: '0 0 4px' }}>Lure / Bait</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', margin: 0 }}>{catchData.lure_bait}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Catcher card */}
          {catcher && (
            <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
              {catcher.avatar_url ? (
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src={catcher.avatar_url} alt={catcher.username} width={44} height={44} style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <InitialsCircle name={catcher.username} size={44} />
              )}
              <div style={{ flex: 1 }}>
                <Link href={`/profile/${catcher.username}`} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={e => e.currentTarget.style.color = '#f8f9fa'}
                >
                  @{catcher.username}
                </Link>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', margin: '3px 0 0', fontWeight: '300' }}>
                  {new Date(catchData.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {catcher.username && (
                <Link href={`/profile/${catcher.username}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  View Profile
                </Link>
              )}
            </div>
          )}

          {/* Related catches */}
          {related.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', fontWeight: '400', color: '#f8f9fa', margin: '0 0 24px' }}>
                More {catchData.species}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {related.map(r => (
                  <Link key={r.id} href={`/catches/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
                    >
                      <div style={{ position: 'relative', height: '120px', background: '#0a1628' }}>
                        {r.photo_url ? (
                          <Image src={r.photo_url} alt={r.species} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'rgba(201,168,76,0.06)' }}>🎣</div>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        {r.weight_lbs && (
                          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '13px', color: '#c9a84c', margin: '0 0 3px' }}>{r.weight_lbs} lbs</p>
                        )}
                        <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.35)', margin: 0 }}>
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
