'use client'
import { Suspense } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const CATEGORY_PHOTOS = {
  'Rods':         'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&auto=format&fit=crop',
  'Reels':        'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&auto=format&fit=crop',
  'Lures':        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop',
  'Boats':        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop',
  'Engines':      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop',
  'Tackle Boxes': 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&auto=format&fit=crop',
  'Line':         'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&auto=format&fit=crop',
  'Other':        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
}
const CATEGORIES = ['All','Rods','Reels','Lures','Line','Tackle Boxes','Boats','Engines','Other']
const CONDITIONS = ['New','Like New','Good','Fair','Poor']
const SORTS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
  { value: 'views',     label: 'Most Viewed' },
  { value: 'saves',     label: 'Most Saved' },
]
const CONDITION_COLORS = {
  'New':      { bg: 'rgba(74,158,255,0.12)', text: '#4a9eff', border: 'rgba(74,158,255,0.2)' },
  'Like New': { bg: 'rgba(74,158,255,0.08)', text: 'rgba(74,158,255,0.8)', border: 'rgba(74,158,255,0.15)' },
  'Good':     { bg: 'rgba(201,168,76,0.1)',  text: '#c9a84c', border: 'rgba(201,168,76,0.2)' },
  'Fair':     { bg: 'rgba(200,160,80,0.08)', text: 'rgba(200,160,80,0.8)', border: 'rgba(200,160,80,0.18)' },
  'Poor':     { bg: 'rgba(180,80,80,0.1)',   text: 'rgba(220,100,100,0.9)', border: 'rgba(180,80,80,0.2)' },
}

const PAGE_SIZE = 12

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ListingCard({ listing, onSave, savedIds }) {
  const cond = CONDITION_COLORS[listing.condition] || CONDITION_COLORS['Good']
  const photo = listing.photo_url || (listing.photos && listing.photos[0]) || CATEGORY_PHOTOS[listing.category] || CATEGORY_PHOTOS['Other']
  const isSaved = savedIds?.has(listing.id)

  return (
    <div className="masonry-item listing-card" style={{ background: '#0f2040' }}>
      <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0a1628' }}>
          <Image src={photo} alt={listing.title} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
          <span className="category-badge" style={{ position: 'absolute', top: '10px', left: '10px' }}>{listing.category}</span>
          {listing.condition && (
            <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: cond.bg, color: cond.text, border: `1px solid ${cond.border}`, padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)', backdropFilter: 'blur(4px)' }}>
              {listing.condition}
            </span>
          )}
        </div>
      </Link>

      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none', flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', margin: 0, lineHeight: 1.4 }} className="truncate-2">
              {listing.title}
            </h3>
          </Link>
          <button
            onClick={() => onSave(listing.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? '#c9a84c' : 'rgba(143,163,184,0.3)', padding: '2px', transition: 'color 0.15s', flexShrink: 0 }}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '16px', color: '#c9a84c', fontWeight: '500' }}>
            ${Number(listing.price).toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>
            {timeAgo(listing.created_at)}
          </span>
        </div>

        {listing.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(143,163,184,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>{listing.location}</span>
          </div>
        )}

        {listing.seller_username && (
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.25)', margin: '6px 0 0' }}>
            by {listing.seller_username}
          </p>
        )}
      </div>
    </div>
  )
}

function BrowsePageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set())
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filters
  const [search, setSearch]       = useState(searchParams.get('q') || '')
  const [category, setCategory]   = useState(searchParams.get('category') || 'All')
  const [conditions, setConditions] = useState([])
  const [priceMin, setPriceMin]   = useState('')
  const [priceMax, setPriceMax]   = useState('')
  const [location, setLocation]   = useState('')
  const [sort, setSort]           = useState('newest')
  const [page, setPage]           = useState(0)
  const observerTarget = useRef(null)

  // Update URL params
  const updateURL = useCallback((params) => {
    const url = new URLSearchParams()
    if (params.q)        url.set('q', params.q)
    if (params.category && params.category !== 'All') url.set('category', params.category)
    if (params.sort && params.sort !== 'newest') url.set('sort', params.sort)
    router.replace(`/browse?${url.toString()}`, { scroll: false })
  }, [router])

  // Fetch listings
  const fetchListings = useCallback(async (pageNum = 0, replace = true) => {
    if (pageNum === 0) setLoading(true)
    else setLoadingMore(true)

    try {
      const supabase = createClient()
      let query = supabase
        .from('listings')
        .select('id,title,price,condition,category,location,photo_url,created_at,user_id,seller_email', { count: 'exact' })

      if (category !== 'All') query = query.eq('category', category)
      if (conditions.length > 0) query = query.in('condition', conditions)
      if (priceMin) query = query.gte('price', Number(priceMin))
      if (priceMax) query = query.lte('price', Number(priceMax))
      if (location.trim()) query = query.ilike('location', `%${location}%`)
      if (search.trim()) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

      switch (sort) {
        case 'price_asc':  query = query.order('price', { ascending: true }); break
        case 'price_desc': query = query.order('price', { ascending: false }); break
        case 'views':      query = query.order('created_at', { ascending: false }); break
        case 'saves':      query = query.order('created_at', { ascending: false }); break
        default:           query = query.order('created_at', { ascending: false })
      }

      query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)
      const { data, count, error } = await query
      if (error) throw error

      // Fetch usernames for sellers
      const userIds = [...new Set((data || []).map(l => l.user_id))]
      let profileMap = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id,username').in('id', userIds)
        if (profiles) profiles.forEach(p => { profileMap[p.id] = p.username })
      }

      const enriched = (data || []).map(l => ({ ...l, seller_username: profileMap[l.user_id] || null }))
      setTotal(count || 0)
      setHasMore((data || []).length === PAGE_SIZE)
      if (replace) setListings(enriched)
      else setListings(prev => [...prev, ...enriched])
    } catch (err) {
      console.error('Browse fetch error:', err)
      addToast('Failed to load listings', 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, conditions, priceMin, priceMax, location, search, sort, addToast])

  // Fetch saved listings for current user
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return }
    const supabase = createClient()
    supabase.from('saved_listings').select('listing_id').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map(r => r.listing_id)))
      })
  }, [user])

  // Initial load + filter changes
  useEffect(() => {
    setPage(0)
    fetchListings(0, true)
    updateURL({ q: search, category, sort })
  }, [category, conditions, priceMin, priceMax, location, search, sort])

  // Infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1
          setPage(next)
          fetchListings(next, false)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, fetchListings])

  const handleSave = async (listingId) => {
    if (!user) { addToast('Sign in to save listings', 'info'); router.push('/auth/login'); return }
    const supabase = createClient()
    if (savedIds.has(listingId)) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId)
      setSavedIds(prev => { const next = new Set(prev); next.delete(listingId); return next })
      addToast('Listing removed from saves', 'info')
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId })
      setSavedIds(prev => new Set([...prev, listingId]))
      addToast('Listing saved!', 'success')
    }
  }

  const clearAll = () => { setSearch(''); setCategory('All'); setConditions([]); setPriceMin(''); setPriceMax(''); setLocation(''); setSort('newest') }
  const hasFilters = search || category !== 'All' || conditions.length > 0 || priceMin || priceMax || location

  const FilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p className="fm-label" style={{ marginBottom: '12px' }}>Category</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ background: category === cat ? 'rgba(201,168,76,0.1)' : 'none', color: category === cat ? '#c9a84c' : 'rgba(143,163,184,0.55)', border: `1px solid ${category === cat ? 'rgba(201,168,76,0.25)' : 'transparent'}`, padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)', textAlign: 'left', transition: 'all 0.15s', fontWeight: category === cat ? '500' : '400' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="fm-label" style={{ marginBottom: '12px' }}>Condition</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {CONDITIONS.map(cond => {
            const active = conditions.includes(cond)
            const c = CONDITION_COLORS[cond]
            return (
              <button key={cond} onClick={() => setConditions(prev => active ? prev.filter(x => x !== cond) : [...prev, cond])} style={{ background: active ? c.bg : 'none', color: active ? c.text : 'rgba(143,163,184,0.55)', border: `1px solid ${active ? c.border : 'transparent'}`, padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)', textAlign: 'left', transition: 'all 0.15s' }}>
                {cond}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="fm-label" style={{ marginBottom: '12px' }}>Price Range</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>$</span>
            <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min" className="fm-input" style={{ paddingLeft: '22px', padding: '9px 10px 9px 22px' }} min="0" />
          </div>
          <span style={{ color: 'rgba(143,163,184,0.3)', fontSize: '12px' }}>—</span>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>$</span>
            <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max" className="fm-input" style={{ paddingLeft: '22px', padding: '9px 10px 9px 22px' }} min="0" />
          </div>
        </div>
      </div>

      <div>
        <p className="fm-label" style={{ marginBottom: '12px' }}>Location</p>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, state..." className="fm-input" />
      </div>

      {hasFilters && (
        <button onClick={clearAll} style={{ background: 'none', border: '1px solid rgba(220,80,80,0.2)', borderRadius: '4px', padding: '10px', cursor: 'pointer', color: 'rgba(220,100,100,0.6)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '4px' }}>Browse Gear</h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.4)', margin: 0, fontSize: '13px', fontWeight: '300' }}>
              {loading ? 'Loading...' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} className="fm-input" style={{ width: 'auto', padding: '9px 14px', fontSize: '13px' }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {/* Mobile filter toggle */}
            <button onClick={() => setMobileFiltersOpen(true)} className="btn-secondary" style={{ display: 'none' }} id="mobile-filter-btn">
              Filters
            </button>
            <Link href="/listings/new" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>Sell Gear</Link>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(143,163,184,0.4)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          </span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="fm-input" style={{ paddingLeft: '44px', fontSize: '15px' }} />
        </div>

        {/* Active filter pills */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {search && <FilterPill label={`"${search}"`} onRemove={() => setSearch('')} />}
            {category !== 'All' && <FilterPill label={category} onRemove={() => setCategory('All')} />}
            {conditions.map(c => <FilterPill key={c} label={c} onRemove={() => setConditions(prev => prev.filter(x => x !== c))} />)}
            {priceMin && <FilterPill label={`Min $${priceMin}`} onRemove={() => setPriceMin('')} />}
            {priceMax && <FilterPill label={`Max $${priceMax}`} onRemove={() => setPriceMax('')} />}
            {location && <FilterPill label={location} onRemove={() => setLocation('')} />}
          </div>
        )}

        {/* Main layout: sidebar + grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Sidebar filters (desktop) */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <FilterPanel />
          </div>

          {/* Listings grid */}
          <div>
            {loading ? (
              <div className="masonry-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="masonry-item">
                    <div className="skeleton" style={{ height: '200px', borderRadius: '6px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '4px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.2)', marginBottom: '12px' }}>No listings found</p>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: '24px' }}>
                  {hasFilters ? 'Try adjusting your filters' : 'Be the first to list gear'}
                </p>
                {hasFilters ? (
                  <button onClick={clearAll} className="btn-ghost">Clear Filters</button>
                ) : (
                  <Link href="/listings/new" className="btn-primary">List Your Gear</Link>
                )}
              </div>
            ) : (
              <>
                <div className="masonry-grid">
                  {listings.map(l => (
                    <ListingCard key={l.id} listing={l} onSave={handleSave} savedIds={savedIds} />
                  ))}
                </div>
                {/* Infinite scroll trigger */}
                <div ref={observerTarget} style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loadingMore && <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.3)' }}>Loading more...</span>}
                  {!hasMore && listings.length > 0 && <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.2)' }}>All listings loaded</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)' }}>Loading...</div>}>
      <BrowsePageInner />
    </Suspense>
  )
}

function FilterPill({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', padding: '4px 10px', borderRadius: '2px', fontSize: '12px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(201,168,76,0.5)', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </span>
  )
}
