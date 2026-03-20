'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ActivityTicker() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, category, location, price, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      if (!listings || listings.length === 0) return

      const userIds = [...new Set(listings.map((l) => l.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)

      const profileMap = {}
      if (profiles) profiles.forEach((p) => { profileMap[p.id] = p.username })

      const enriched = listings.map((l) => ({
        ...l,
        username: profileMap[l.user_id] || null,
      }))
      setItems(enriched)
    }
    load()
  }, [])

  if (items.length === 0) return null

  // Duplicate for seamless infinite scroll
  const track = [...items, ...items, ...items]

  return (
    <>
      <style>{`
        @keyframes seaitall-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-track {
          display: inline-flex;
          animation: seaitall-ticker 60s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          zIndex: 190,
          height: '34px',
          background: 'rgba(10,22,40,0.97)',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, rgba(10,22,40,0.97), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to left, rgba(10,22,40,0.97), transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div className="ticker-track">
          {track.map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'rgba(201,168,76,0.3)', margin: '0 28px', fontSize: '7px', letterSpacing: '0.1em' }}>◆</span>
              <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', letterSpacing: '0.01em' }}>
                {item.username ? (
                  <>
                    <span style={{ color: '#c9a84c', fontWeight: '500' }}>{item.username}</span>
                    <span style={{ color: 'rgba(143,163,184,0.5)' }}> listed </span>
                  </>
                ) : (
                  <span style={{ color: 'rgba(143,163,184,0.4)' }}>New listing: </span>
                )}
                <span style={{ color: 'rgba(248,249,250,0.6)' }}>{item.title}</span>
                {item.price && (
                  <span style={{ color: 'rgba(201,168,76,0.6)', fontWeight: '500' }}> — ${Number(item.price).toLocaleString()}</span>
                )}
                {item.location && (
                  <span style={{ color: 'rgba(143,163,184,0.35)' }}> · {item.location}</span>
                )}
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
