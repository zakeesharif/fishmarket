'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

const CHARTER_FALLBACK = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop'

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0
  return (
    <span style={{ color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px' }}>
      {r.toFixed(1)} ★
    </span>
  )
}

function CharterCard({ charter }) {
  const photo = charter.vessel_photo || CHARTER_FALLBACK
  const species = charter.species_targeted || []

  return (
    <div
      style={{
        background: '#0f2040',
        border: '1px solid #162a4a',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <Link href={`/charters/${charter.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0a1628' }}>
          <Image
            src={photo}
            alt={charter.vessel_name || 'Charter vessel'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onError={e => { e.target.src = CHARTER_FALLBACK }}
          />
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(10,22,40,0.88)', backdropFilter: 'blur(6px)', border: '1px solid rgba(201,168,76,0.3)', padding: '4px 10px', borderRadius: '2px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#c9a84c', fontWeight: '600' }}>
            ${charter.price_per_person}/person
          </div>
        </div>
      </Link>
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '8px' }}>
          <Link href={`/charters/${charter.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.05rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
              {charter.vessel_name || 'Unnamed Vessel'}
            </h3>
          </Link>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8', margin: 0 }}>
            Capt. {charter.captain_name}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8fa3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8' }}>{charter.location}</span>
          <span style={{ color: '#162a4a', margin: '0 2px' }}>·</span>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8' }}>{charter.duration_hours}hr trip</span>
        </div>

        {species.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            {species.slice(0, 3).map(s => (
              <span key={s} style={{ background: 'rgba(74,158,255,0.1)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.2)', padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                {s}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <StarRating rating={charter.rating} />
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.5)' }}>
              {charter.total_trips || 0} trips
            </span>
          </div>
          <Link href={`/charters/${charter.id}`} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '200px', width: '100%' }} />
      <div style={{ padding: '16px 18px 18px' }}>
        <div className="skeleton" style={{ height: '18px', width: '70%', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '12px', width: '80%', borderRadius: '4px', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '2px' }} />)}
        </div>
        <div className="skeleton" style={{ height: '30px', width: '90px', borderRadius: '4px', marginLeft: 'auto' }} />
      </div>
    </div>
  )
}

export default function ChartersPage() {
  const { user } = useAuth()
  const [charters, setCharters] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationFilter, setLocationFilter] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [durationFilter, setDurationFilter] = useState('all')
  const [speciesSearch, setSpeciesSearch] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const fetchCharters = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('charters').select('*').eq('status', 'active')

    const loc = locationFilter || searchLocation
    if (loc) query = query.ilike('location', `%${loc}%`)
    if (priceMax) query = query.lte('price_per_person', parseFloat(priceMax))
    if (speciesSearch) query = query.contains('species_targeted', [speciesSearch])
    if (durationFilter === 'half') query = query.gte('duration_hours', 4).lte('duration_hours', 5)
    if (durationFilter === 'full') query = query.gte('duration_hours', 7).lte('duration_hours', 9)
    if (durationFilter === 'overnight') query = query.gte('duration_hours', 12)

    const { data } = await query.order('rating', { ascending: false })
    setCharters(data || [])
    setLoading(false)
  }, [locationFilter, searchLocation, priceMax, durationFilter, speciesSearch])

  useEffect(() => {
    fetchCharters()
  }, [fetchCharters])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    setLocationFilter(searchLocation)
  }

  const DURATION_OPTIONS = [
    { value: 'all', label: 'All Durations' },
    { value: 'half', label: 'Half Day (4-5hr)' },
    { value: 'full', label: 'Full Day (7-9hr)' },
    { value: 'overnight', label: 'Overnight (12+hr)' },
  ]

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', background: 'linear-gradient(180deg, #0a1628 0%, #0f2040 100%)', borderBottom: '1px solid #162a4a', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '500', color: '#f8f9fa', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Find Your Perfect<br /><span style={{ color: '#c9a84c' }}>Fishing Charter</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#8fa3b8', margin: '0 0 32px', lineHeight: 1.6 }}>
            Connect with experienced captains. Book your next unforgettable fishing adventure.
          </p>
          <form onSubmit={handleHeroSearch} style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '0 auto' }}>
            <input
              type="text"
              className="fm-input"
              placeholder="Search by location (e.g. Miami, FL)"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              style={{ flex: 1, fontSize: '14px' }}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0 20px' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Filters */}
        <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '8px', padding: '18px 20px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label className="fm-label">Location</label>
            <input
              type="text"
              className="fm-input"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label className="fm-label">Max Price / Person</label>
            <input
              type="number"
              className="fm-input"
              placeholder="e.g. 300"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="fm-label">Duration</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDurationFilter(opt.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: durationFilter === opt.value ? '1px solid #c9a84c' : '1px solid #162a4a',
                    background: durationFilter === opt.value ? 'rgba(201,168,76,0.12)' : 'transparent',
                    color: durationFilter === opt.value ? '#c9a84c' : '#8fa3b8',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label className="fm-label">Species</label>
            <input
              type="text"
              className="fm-input"
              placeholder="e.g. Mahi-Mahi"
              value={speciesSearch}
              onChange={e => setSpeciesSearch(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', margin: 0 }}>
            {loading ? 'Loading charters...' : `${charters.length} charter${charters.length !== 1 ? 's' : ''} found`}
          </p>
          {user && (
            <Link href="/charters/new" className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              + List Your Charter
            </Link>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : charters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛵</div>
            <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: '#f8f9fa', margin: '0 0 8px' }}>
              No charters found in this area
            </h3>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: '0 0 24px' }}>
              Try adjusting your filters or search in a different location.
            </p>
            <button onClick={() => { setLocationFilter(''); setSearchLocation(''); setPriceMax(''); setDurationFilter('all'); setSpeciesSearch('') }} className="btn-ghost">
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {charters.map(c => <CharterCard key={c.id} charter={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}
