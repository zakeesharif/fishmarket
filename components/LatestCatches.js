'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LatestCatches() {
  const [catches, setCatches] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data, error } = await supabase
        .from('catches')
        .select('id, species, weight_lbs, location, photo_url, caption, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(4)
      if (error) { setLoaded(true); return }
      if (!data || data.length === 0) { setLoaded(true); return }

      const userIds = [...new Set(data.map((c) => c.user_id))]
      const { data: profiles } = await supabase
        .from('profiles').select('id, username, avatar_url').in('id', userIds)
      const profileMap = {}
      if (profiles) profiles.forEach((p) => { profileMap[p.id] = p })

      setCatches(data.map((c) => ({ ...c, profile: profileMap[c.user_id] || null })))
      setLoaded(true)
    }
    load()
  }, [])

  if (!loaded || catches.length === 0) return null

  return (
    <section style={{ padding: '80px 48px', borderTop: '1px solid #162a4a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 10px' }}>Community</p>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '400', color: '#f8f9fa', margin: 0, letterSpacing: '-0.01em' }}>Latest Catches</h2>
          </div>
          <Link href="/catches" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.4)'}
          >
            View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {catches.map((c) => (
            <Link key={c.id} href={`/catches/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="listing-card">
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#0a1628' }}>
                  {c.photo_url ? (
                    <Image src={c.photo_url} alt={c.species} fill sizes="300px" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a1628, #0f2040)', color: 'rgba(201,168,76,0.06)', fontSize: '64px' }}>🎣</div>
                  )}
                  {c.weight_lbs && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(10,22,40,0.88)', backdropFilter: 'blur(6px)', border: '1px solid rgba(201,168,76,0.3)', padding: '4px 10px', borderRadius: '2px', fontFamily: 'var(--font-playfair, serif)', fontSize: '13px', color: '#c9a84c' }}>
                      {c.weight_lbs} lbs
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 18px 18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px' }}>{c.species}</h3>
                  {c.caption && <p className="truncate-2" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.5)', margin: '0 0 10px', lineHeight: 1.5, fontWeight: '300' }}>{c.caption}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.35)' }}>
                      {c.location && `📍 ${c.location}`}
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>
                      {c.profile?.username || 'Angler'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
