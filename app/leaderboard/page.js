'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { id: 'views',    label: 'Most Viewed',   icon: '👁' },
  { id: 'listings', label: 'Top Sellers',   icon: '🎣' },
  { id: 'saves',    label: 'Most Saved',    icon: '🔖' },
]

const MEDAL = ['🥇', '🥈', '🥉']

function Avatar({ username, size = 36 }) {
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const hue = ((username || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 36) * 10
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},40%,18%)`, border: `1px solid hsl(${hue},40%,28%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: size * 0.38 + 'px', fontWeight: '500', color: `hsl(${hue},60%,65%)` }}>{initials}</span>
    </div>
  )
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState('views')
  const [data, setData] = useState({ views: [], listings: [], saves: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    const supabase = createClient()

    // Fetch all listings with user_id, views, saves
    const { data: listings } = await supabase
      .from('listings')
      .select('user_id, views, saves, status')
      .not('user_id', 'is', null)

    if (!listings) { setLoading(false); return }

    // Aggregate by user
    const byUser = {}
    for (const l of listings) {
      if (!byUser[l.user_id]) byUser[l.user_id] = { user_id: l.user_id, totalViews: 0, totalSaves: 0, listingCount: 0, activeCount: 0 }
      byUser[l.user_id].totalViews += (l.views || 0)
      byUser[l.user_id].totalSaves += (l.saves || 0)
      byUser[l.user_id].listingCount += 1
      if (l.status === 'active') byUser[l.user_id].activeCount += 1
    }

    // Fetch profiles for all these users
    const userIds = Object.keys(byUser)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, bio, location')
      .in('id', userIds)

    const profileMap = {}
    if (profiles) profiles.forEach(p => { profileMap[p.id] = p })

    const enriched = Object.values(byUser).map(u => ({
      ...u,
      username: profileMap[u.user_id]?.username || 'angler',
      bio: profileMap[u.user_id]?.bio || null,
      location: profileMap[u.user_id]?.location || null,
    })).filter(u => u.listingCount > 0)

    const topViews    = [...enriched].sort((a, b) => b.totalViews - a.totalViews).slice(0, 20)
    const topListings = [...enriched].sort((a, b) => b.listingCount - a.listingCount).slice(0, 20)
    const topSaves    = [...enriched].sort((a, b) => b.totalSaves - a.totalSaves).slice(0, 20)

    setData({ views: topViews, listings: topListings, saves: topSaves })
    setLoading(false)
  }

  const rows = data[tab] || []

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px', padding: '4px 14px', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '500' }}>Community</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.6rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '12px' }}>
            Angler Leaderboard
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.45)', fontSize: '15px', fontWeight: '300', margin: 0 }}>
            Top gear sellers and most active anglers in the community
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(143,163,184,0.06)', borderRadius: '8px', padding: '4px', marginBottom: '32px' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: tab === t.id ? '500' : '400', background: tab === t.id ? 'rgba(201,168,76,0.12)' : 'transparent', color: tab === t.id ? '#c9a84c' : 'rgba(143,163,184,0.45)', transition: 'all 0.15s', border: tab === t.id ? '1px solid rgba(201,168,76,0.18)' : '1px solid transparent' }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '8px' }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.2)' }}>No data yet</p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', marginTop: '8px' }}>Be the first to list gear!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rows.map((angler, i) => {
              const isTop3 = i < 3
              const metric = tab === 'views' ? angler.totalViews : tab === 'saves' ? angler.totalSaves : angler.listingCount
              const metricLabel = tab === 'views' ? 'views' : tab === 'saves' ? 'saves' : 'listings'

              return (
                <div
                  key={angler.user_id}
                  style={{
                    background: isTop3 ? 'rgba(201,168,76,0.04)' : 'rgba(15,32,64,0.5)',
                    border: `1px solid ${isTop3 ? 'rgba(201,168,76,0.12)' : 'rgba(143,163,184,0.05)'}`,
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Rank */}
                  <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                    {isTop3 ? (
                      <span style={{ fontSize: '20px' }}>{MEDAL[i]}</span>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.25)', fontWeight: '500' }}>#{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar username={angler.username} size={40} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', fontWeight: '500', color: '#f8f9fa' }}>
                        @{angler.username}
                      </span>
                      {angler.location && (
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {angler.location}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>
                        {angler.listingCount} listing{angler.listingCount !== 1 ? 's' : ''}
                      </span>
                      {angler.totalViews > 0 && tab !== 'views' && (
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>
                          {angler.totalViews.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', fontWeight: '500', color: isTop3 ? '#c9a84c' : '#f8f9fa', margin: 0, lineHeight: 1 }}>
                      {metric.toLocaleString()}
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', color: 'rgba(143,163,184,0.3)', margin: '3px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {metricLabel}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: '48px', padding: '32px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.3rem', color: '#f8f9fa', marginBottom: '8px' }}>
              Want to climb the board?
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.4)', fontWeight: '300', marginBottom: '20px' }}>
              List your gear and grow your profile in the Seaitall community
            </p>
            <Link href="/listings/new" className="btn-primary" style={{ fontSize: '13px', padding: '10px 24px' }}>
              List Your Gear
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}
