'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['All', 'Rods', 'Reels', 'Lures', 'Line', 'Tackle Boxes', 'Boats', 'Engines', 'Other']

const CATEGORY_PHOTOS = {
  'Rods':         'https://source.unsplash.com/400x300/?fishing,rod,angling',
  'Reels':        'https://source.unsplash.com/400x300/?fishing,reel,spinning',
  'Lures':        'https://source.unsplash.com/400x300/?fishing,lure,bait',
  'Line':         'https://source.unsplash.com/400x300/?fishing,line,cast,saltwater',
  'Tackle Boxes': 'https://source.unsplash.com/400x300/?fishing,tackle,gear',
  'Boats':        'https://source.unsplash.com/400x300/?fishing,boat,ocean,water',
  'Engines':      'https://source.unsplash.com/400x300/?boat,marine,outboard',
  'Other':        'https://source.unsplash.com/400x300/?fishing,ocean,saltwater',
}
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

const CONDITION_COLORS = {
  'New':      { bg: 'rgba(74,158,255,0.12)', text: '#4a9eff', border: 'rgba(74,158,255,0.25)' },
  'Like New': { bg: 'rgba(74,158,255,0.08)', text: 'rgba(74,158,255,0.8)', border: 'rgba(74,158,255,0.18)' },
  'Good':     { bg: 'rgba(201,168,76,0.1)',  text: '#c9a84c', border: 'rgba(201,168,76,0.25)' },
  'Fair':     { bg: 'rgba(200,160,80,0.08)', text: 'rgba(200,160,80,0.8)', border: 'rgba(200,160,80,0.2)' },
  'Poor':     { bg: 'rgba(180,80,80,0.1)',   text: 'rgba(220,100,100,0.9)', border: 'rgba(180,80,80,0.25)' },
}

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
  </svg>
)

const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconPhoto = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function ListingCard({ listing }) {
  const cond = CONDITION_COLORS[listing.condition] || { bg: 'rgba(74,158,255,0.08)', text: '#4a9eff', border: 'rgba(74,158,255,0.15)' }

  return (
    <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
    <div
      style={{
        background: '#0f2040',
        border: '1px solid #162a4a',
        borderRadius: '6px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1e3455'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#162a4a'}
    >
      {/* Photo */}
      <div style={{ width: '100%', height: '192px', background: '#0a1628', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : CATEGORY_PHOTOS[listing.category] ? (
          <img
            src={CATEGORY_PHOTOS[listing.category]}
            alt={listing.category}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) saturate(0.85)' }}
          />
        ) : (
          <span style={{ color: 'rgba(74,158,255,0.15)' }}><IconPhoto /></span>
        )}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(10,22,40,0.85)',
          border: '1px solid #162a4a',
          padding: '3px 9px',
          fontSize: '10px',
          fontFamily: 'var(--font-dm-sans, sans-serif)',
          fontWeight: '500',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#4a9eff',
          backdropFilter: 'blur(4px)',
          borderRadius: '2px',
        }}>
          {listing.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          <h3 style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '14px',
            fontWeight: '500',
            margin: 0,
            color: '#f8f9fa',
            lineHeight: 1.4,
            flex: 1,
          }}>
            {listing.title}
          </h3>
          <span style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '1rem',
            color: '#c9a84c',
            fontWeight: '500',
            whiteSpace: 'nowrap',
          }}>
            ${Number(listing.price).toLocaleString()}
          </span>
        </div>

        {listing.condition && (
          <span style={{
            display: 'inline-block',
            background: cond.bg,
            color: cond.text,
            border: `1px solid ${cond.border}`,
            padding: '2px 9px',
            borderRadius: '2px',
            fontSize: '11px',
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontWeight: '400',
            marginBottom: '10px',
          }}>
            {listing.condition}
          </span>
        )}

        {listing.description && (
          <p style={{
            color: '#8fa3b8',
            fontSize: '13px',
            lineHeight: '1.55',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontWeight: '300',
            margin: '0 0 12px',
          }}>
            {listing.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          {listing.location ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(143,163,184,0.45)', fontSize: '11px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
              <IconPin /> {listing.location}
            </span>
          ) : <span />}
          <span style={{ color: 'rgba(143,163,184,0.3)', fontSize: '11px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
            {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
    </Link>
  )
}

export default function BrowsePage() {
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [conditions, setConditions] = useState([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)

  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase listings error:', error)
          setFetchError(error.message)
        } else {
          setListings(data || [])
        }
        setLoading(false)
      })
  }, [])

  const hasFilters = search || category !== 'All' || conditions.length > 0 || priceMin || priceMax || location

  const clearAll = () => {
    setSearch('')
    setCategory('All')
    setConditions([])
    setPriceMin('')
    setPriceMax('')
    setLocation('')
  }

  const toggleCondition = (cond) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    )
  }

  useEffect(() => {
    let result = listings
    if (category !== 'All') result = result.filter((l) => l.category === category)
    if (conditions.length > 0) result = result.filter((l) => conditions.includes(l.condition))
    if (priceMin) result = result.filter((l) => Number(l.price) >= Number(priceMin))
    if (priceMax) result = result.filter((l) => Number(l.price) <= Number(priceMax))
    if (location.trim()) result = result.filter((l) => l.location?.toLowerCase().includes(location.toLowerCase()))
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(s) ||
          l.description?.toLowerCase().includes(s) ||
          l.location?.toLowerCase().includes(s)
      )
    }
    setFiltered(result)
  }, [listings, search, category, conditions, priceMin, priceMax, location])

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '2.2rem',
              fontWeight: '500',
              color: '#f8f9fa',
              marginBottom: '6px',
            }}>
              Browse Gear
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.55)', margin: 0, fontSize: '14px', fontWeight: '300' }}>
              {loading ? 'Loading...' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <Link href="/listings/new" className="btn-primary">
            Sell Your Gear
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#8fa3b8' }}>
            <IconSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or location..."
            className="fm-input"
            style={{ paddingLeft: '44px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat ? '#c9a84c' : 'transparent',
                  color: category === cat ? '#0a1628' : 'rgba(143,163,184,0.55)',
                  border: `1px solid ${category === cat ? '#c9a84c' : '#162a4a'}`,
                  padding: '6px 16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontWeight: category === cat ? '600' : '400',
                  letterSpacing: '0.04em',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Condition + Price + Location row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

            {/* Condition pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CONDITIONS.map((cond) => {
                const active = conditions.includes(cond)
                return (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    style={{
                      background: active ? 'rgba(74,158,255,0.12)' : 'transparent',
                      color: active ? '#4a9eff' : 'rgba(143,163,184,0.45)',
                      border: `1px solid ${active ? 'rgba(74,158,255,0.3)' : '#162a4a'}`,
                      padding: '5px 13px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      letterSpacing: '0.04em',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cond}
                  </button>
                )
              })}
            </div>

            {/* Price range */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px' }}>$</span>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="fm-input"
                  style={{ width: '90px', paddingLeft: '22px', padding: '8px 10px 8px 22px' }}
                  min="0"
                />
              </div>
              <span style={{ color: 'rgba(143,163,184,0.3)', fontSize: '12px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>—</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px' }}>$</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="fm-input"
                  style={{ width: '90px', padding: '8px 10px 8px 22px' }}
                  min="0"
                />
              </div>
            </div>

            {/* Location filter */}
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="fm-input"
              style={{ width: '160px', padding: '8px 14px' }}
            />

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: '1px solid #162a4a',
                  borderRadius: '2px',
                  padding: '5px 13px',
                  cursor: 'pointer',
                  color: 'rgba(143,163,184,0.4)',
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.4)'}
              >
                <IconX /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {fetchError ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: 'rgba(220,100,100,0.7)', marginBottom: '12px' }}>
              Could not load listings
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', fontWeight: '300', fontFamily: 'monospace', background: 'rgba(180,80,80,0.06)', border: '1px solid rgba(180,80,80,0.15)', borderRadius: '4px', padding: '12px 16px', display: 'inline-block' }}>
              {fetchError}
            </p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'rgba(143,163,184,0.3)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300' }}>
            Loading listings...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.3)', marginBottom: '12px' }}>
              No listings found
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)', fontSize: '13px', fontWeight: '300', marginBottom: '28px' }}>
              {search || category !== 'All' ? 'Try adjusting your search or filters' : 'Be the first to list your gear'}
            </p>
            {!search && category === 'All' && (
              <Link href="/listings/new" className="btn-primary">List Your Gear</Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
