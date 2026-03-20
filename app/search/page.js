'use client'
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const CHARTER_FALLBACK = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&auto=format&fit=crop'
const LISTING_FALLBACK = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop'
const CATCH_FALLBACK = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&auto=format&fit=crop'

const TABS = ['Listings', 'Catches', 'Profiles', 'Charters']

function SkeletonCard() {
  return (
    <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '160px', width: '100%' }} />
      <div style={{ padding: '12px 14px' }}>
        <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '12px', width: '50%', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQ)
  const [activeTab, setActiveTab] = useState('Listings')
  const [results, setResults] = useState({ Listings: [], Catches: [], Profiles: [], Charters: [] })
  const [counts, setCounts] = useState({ Listings: 0, Catches: 0, Profiles: 0, Charters: 0 })
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [focused, setFocused] = useState(false)

  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      setRecentSearches(Array.isArray(stored) ? stored : [])
    } catch { setRecentSearches([]) }
  }, [])

  const saveSearch = useCallback((q) => {
    if (!q.trim()) return
    setRecentSearches(prev => {
      const updated = [q, ...prev.filter(s => s !== q)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })
  }, [])

  const fetchResults = useCallback(async (q) => {
    if (!q.trim()) { setResults({ Listings: [], Catches: [], Profiles: [], Charters: [] }); setCounts({ Listings: 0, Catches: 0, Profiles: 0, Charters: 0 }); setLoading(false); return }
    setLoading(true)
    const supabase = createClient()
    const term = `%${q}%`

    const [listingsRes, catchesRes, profilesRes, chartersRes] = await Promise.all([
      supabase.from('listings').select('id,title,price,category,location,photo_url,photos,condition').ilike('title', term).limit(20),
      supabase.from('catches').select('id,species,weight_lbs,location,photo_url,created_at').ilike('species', term).limit(20),
      supabase.from('profiles').select('id,username,avatar_url,bio,location,fishing_types').ilike('username', term).limit(20),
      supabase.from('charters').select('id,vessel_name,captain_name,vessel_photo,location,price_per_person,rating').eq('status','active').ilike('location', term).limit(20),
    ])

    const newResults = {
      Listings: listingsRes.data || [],
      Catches: catchesRes.data || [],
      Profiles: profilesRes.data || [],
      Charters: chartersRes.data || [],
    }
    setResults(newResults)
    setCounts({ Listings: newResults.Listings.length, Catches: newResults.Catches.length, Profiles: newResults.Profiles.length, Charters: newResults.Charters.length })
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchResults(initialQ)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (val) params.set('q', val)
      router.replace(`/search?${params.toString()}`, { scroll: false })
      fetchResults(val)
      if (val.trim()) saveSearch(val.trim())
    }, 400)
  }

  const handleRecentClick = (s) => {
    setQuery(s)
    setFocused(false)
    router.replace(`/search?q=${encodeURIComponent(s)}`, { scroll: false })
    fetchResults(s)
  }

  const listingPhoto = (l) => l.photo_url || (l.photos && l.photos[0]) || LISTING_FALLBACK

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Search bar */}
        <div style={{ marginBottom: '28px', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8fa3b8', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="fm-input"
              placeholder="Search listings, catches, profiles, charters..."
              value={query}
              onChange={handleQueryChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              style={{ paddingLeft: '40px', fontSize: '15px', width: '100%' }}
            />
          </div>
          {/* Recent searches dropdown */}
          {focused && !query && recentSearches.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px 6px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8fa3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent Searches</div>
              {recentSearches.map(s => (
                <button key={s} onClick={() => handleRecentClick(s)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#f8f9fa', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8fa3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.62"/></svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tab-nav" style={{ marginBottom: '24px', borderBottom: '1px solid #162a4a' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-link${activeTab === tab ? ' active' : ''}`}
                style={{
                  padding: '10px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #c9a84c' : '2px solid transparent',
                  color: activeTab === tab ? '#c9a84c' : '#8fa3b8',
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  fontWeight: activeTab === tab ? '500' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginBottom: '-1px',
                }}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span style={{ marginLeft: '6px', background: activeTab === tab ? 'rgba(201,168,76,0.15)' : '#162a4a', color: activeTab === tab ? '#c9a84c' : '#8fa3b8', fontSize: '10px', padding: '1px 6px', borderRadius: '999px' }}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Listings */}
            {activeTab === 'Listings' && (
              <>
                {results.Listings.length === 0 ? (
                  <EmptyState tab="Listings" q={query} />
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', marginBottom: '16px' }}>{results.Listings.length} results</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {results.Listings.map(l => (
                        <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none', display: 'block', background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
                        >
                          <div style={{ position: 'relative', height: '160px', background: '#0a1628' }}>
                            <Image src={listingPhoto(l)} alt={l.title} fill sizes="220px" style={{ objectFit: 'cover' }} />
                            {l.condition && <span className="category-badge" style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px' }}>{l.condition}</span>}
                          </div>
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', margin: '0 0 4px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                            {l.price != null && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#c9a84c', margin: '0 0 4px', fontWeight: '600' }}>${l.price}</p>}
                            {l.location && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8fa3b8', margin: 0 }}>{l.location}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Catches */}
            {activeTab === 'Catches' && (
              <>
                {results.Catches.length === 0 ? (
                  <EmptyState tab="Catches" q={query} />
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', marginBottom: '16px' }}>{results.Catches.length} results</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {results.Catches.map(c => (
                        <div key={c.id} style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ position: 'relative', height: '160px', background: '#0a1628' }}>
                            <Image src={c.photo_url || CATCH_FALLBACK} alt={c.species} fill sizes="220px" style={{ objectFit: 'cover' }} />
                            {c.weight_lbs && <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(10,22,40,0.9)', color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', padding: '3px 8px', borderRadius: '2px', border: '1px solid rgba(201,168,76,0.3)' }}>{c.weight_lbs} lbs</span>}
                          </div>
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '14px', color: '#f8f9fa', margin: '0 0 4px', fontWeight: '500' }}>{c.species}</p>
                            {c.location && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8fa3b8', margin: 0 }}>{c.location}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Profiles */}
            {activeTab === 'Profiles' && (
              <>
                {results.Profiles.length === 0 ? (
                  <EmptyState tab="Profiles" q={query} />
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', marginBottom: '16px' }}>{results.Profiles.length} results</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {results.Profiles.map(p => (
                        <Link key={p.id} href={`/profile/${p.username || p.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', padding: '14px 16px', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
                        >
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#162a4a', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                            {p.avatar_url ? (
                              <Image src={p.avatar_url} alt={p.username || ''} fill sizes="44px" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎣</div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#f8f9fa', margin: '0 0 3px', fontWeight: '500' }}>@{p.username}</p>
                            {p.bio && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.bio}</p>}
                            {p.fishing_types && p.fishing_types.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {p.fishing_types.slice(0, 3).map(ft => (
                                  <span key={ft} style={{ background: 'rgba(74,158,255,0.1)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.2)', padding: '1px 7px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>{ft}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {p.location && <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8fa3b8', flexShrink: 0 }}>{p.location}</span>}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Charters */}
            {activeTab === 'Charters' && (
              <>
                {results.Charters.length === 0 ? (
                  <EmptyState tab="Charters" q={query} />
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', marginBottom: '16px' }}>{results.Charters.length} results</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {results.Charters.map(c => (
                        <Link key={c.id} href={`/charters/${c.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '14px', background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
                        >
                          <div style={{ position: 'relative', width: '100px', height: '80px', flexShrink: 0, background: '#0a1628' }}>
                            <Image src={c.vessel_photo || CHARTER_FALLBACK} alt={c.vessel_name || 'Charter'} fill sizes="100px" style={{ objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: '12px 14px 12px 0', flex: 1 }}>
                            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '14px', color: '#f8f9fa', margin: '0 0 3px', fontWeight: '500' }}>{c.vessel_name || 'Charter'}</p>
                            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8', margin: '0 0 4px' }}>Capt. {c.captain_name} · {c.location}</p>
                            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#c9a84c', margin: 0, fontWeight: '600' }}>${c.price_per_person}/person</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab, q }) {
  const icons = { Listings: '🎣', Catches: '🐟', Profiles: '👤', Charters: '⛵' }
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icons[tab]}</div>
      <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>
        No {tab.toLowerCase()} found
      </h3>
      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', margin: 0 }}>
        {q ? `No results for "${q}" in ${tab.toLowerCase()}.` : `Start typing to search ${tab.toLowerCase()}.`}
      </p>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a1628', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="skeleton" style={{ height: '48px', borderRadius: '6px', marginBottom: '28px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
