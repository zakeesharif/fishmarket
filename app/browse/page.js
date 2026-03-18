'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['All', 'Rods', 'Reels', 'Lures', 'Line', 'Tackle Boxes', 'Boats', 'Engines', 'Other']

const CONDITION_COLORS = {
  'New': { bg: 'rgba(26,127,79,0.15)', text: '#2ecc71', border: 'rgba(26,127,79,0.4)' },
  'Like New': { bg: 'rgba(26,127,79,0.1)', text: '#1a9f60', border: 'rgba(26,127,79,0.3)' },
  'Good': { bg: 'rgba(30,100,200,0.12)', text: '#5b9fff', border: 'rgba(30,100,200,0.3)' },
  'Fair': { bg: 'rgba(200,160,0,0.12)', text: '#f0c040', border: 'rgba(200,160,0,0.3)' },
  'Poor': { bg: 'rgba(200,60,60,0.12)', text: '#ff6b6b', border: 'rgba(200,60,60,0.3)' },
}

const CATEGORY_ICONS = {
  'Rods': '🎣',
  'Reels': '🔄',
  'Lures': '🪝',
  'Line': '🧵',
  'Tackle Boxes': '🧰',
  'Boats': '⛵',
  'Engines': '⚙️',
  'Other': '📦',
}

function ListingCard({ listing }) {
  const cond = CONDITION_COLORS[listing.condition] || { bg: '#222', text: '#aaa', border: '#333' }

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1a7f4f'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e1e1e'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Photo */}
      <div style={{ width: '100%', height: '200px', background: '#161616', overflow: 'hidden', position: 'relative' }}>
        {listing.photo_url ? (
          <img
            src={listing.photo_url}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', gap: '8px' }}>
            <span style={{ fontSize: '3rem' }}>{CATEGORY_ICONS[listing.category] || '🎣'}</span>
            <span style={{ fontSize: '11px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No photo</span>
          </div>
        )}
        {/* Category badge overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(10,10,10,0.85)',
          border: '1px solid #2a2a2a',
          borderRadius: '20px',
          padding: '4px 10px',
          fontSize: '12px',
          color: '#aaa',
          backdropFilter: 'blur(4px)',
        }}>
          {CATEGORY_ICONS[listing.category]} {listing.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: 'white', lineHeight: '1.4', flex: 1 }}>
            {listing.title}
          </h3>
          <span style={{ color: '#1a7f4f', fontWeight: '800', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
            ${Number(listing.price).toLocaleString()}
          </span>
        </div>

        {listing.condition && (
          <span style={{
            display: 'inline-block',
            background: cond.bg,
            color: cond.text,
            border: `1px solid ${cond.border}`,
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '10px',
          }}>
            {listing.condition}
          </span>
        )}

        {listing.description && (
          <p style={{
            color: '#555',
            fontSize: '13px',
            lineHeight: '1.5',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {listing.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {listing.location ? (
            <span style={{ color: '#444', fontSize: '12px' }}>📍 {listing.location}</span>
          ) : <span />}
          <span style={{ color: '#333', fontSize: '11px' }}>
            {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setListings(data || [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = listings
    if (category !== 'All') {
      result = result.filter((l) => l.category === category)
    }
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
  }, [listings, search, category])

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 6px' }}>Browse Gear</h1>
            <p style={{ color: '#555', margin: 0, fontSize: '15px' }}>
              {loading ? 'Loading...' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <Link href="/listings/new">
            <button style={{
              background: '#1a7f4f',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
            }}>
              + Sell Your Gear
            </button>
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or location..."
            style={{
              width: '100%',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '16px 20px 16px 50px',
              color: 'white',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                background: category === cat ? '#1a7f4f' : '#111',
                color: category === cat ? 'white' : '#777',
                border: `1px solid ${category === cat ? '#1a7f4f' : '#222'}`,
                padding: '8px 18px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: category === cat ? '600' : '400',
                transition: 'all 0.15s',
              }}
            >
              {cat !== 'All' && CATEGORY_ICONS[cat] + ' '}{cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 40px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.3 }}>🎣</div>
            <p style={{ color: '#444', fontSize: '16px' }}>Loading listings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>🎣</div>
            <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '8px' }}>No listings found</p>
            <p style={{ color: '#333', fontSize: '14px' }}>
              {search || category !== 'All' ? 'Try adjusting your search or filters' : 'Be the first to list your gear!'}
            </p>
            {!search && category === 'All' && (
              <Link href="/listings/new">
                <button style={{
                  marginTop: '24px',
                  background: '#1a7f4f',
                  color: 'white',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}>
                  List Your Gear
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
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
