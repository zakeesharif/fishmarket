'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const CATEGORY_PHOTOS = {
  'Rods':         'https://images.unsplash.com/photo-1529230117010-b6c436154f25?w=400&auto=format&fit=crop',
  'Reels':        'https://images.unsplash.com/photo-1650081484358-b338642813c0?w=400&auto=format&fit=crop',
  'Lures':        'https://images.unsplash.com/photo-1592929043000-fbea34bc8ad5?w=400&auto=format&fit=crop',
  'Boats':        'https://images.unsplash.com/photo-1507124441518-c9584b9dc520?w=400&auto=format&fit=crop',
  'Engines':      'https://images.unsplash.com/photo-1685720543627-a49e4754dd0a?w=400&auto=format&fit=crop',
  'Tackle Boxes': 'https://images.unsplash.com/photo-1586920917141-71ffe0798441?w=400&auto=format&fit=crop',
  'Line':         'https://images.unsplash.com/photo-1593442998882-7cb49031174b?w=400&auto=format&fit=crop',
  'Other':        'https://images.unsplash.com/photo-1541742425281-c1d3fc8aff96?w=400&auto=format&fit=crop',
  'default':      'https://images.unsplash.com/photo-1610741620547-1191d693e43d?w=400&auto=format&fit=crop',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const StatCard = ({ label, value, sub, icon }) => (
  <div style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(143,163,184,0.06)', borderRadius: '8px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', fontWeight: '500', color: '#f8f9fa', margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.45)', margin: '4px 0 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
      {sub && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  </div>
)

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [listings, setListings] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    loadData()
  }, [user, authLoading])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const [{ data: lData }, { data: pData }] = await Promise.all([
      supabase
        .from('listings')
        .select('id,title,price,condition,category,location,photo_url,created_at,views,saves,status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    setListings(lData || [])
    setProfile(pData || null)
    setLoading(false)
  }

  const toggleSold = async (listing) => {
    const newStatus = listing.status === 'sold' ? 'active' : 'sold'
    setMarkingId(listing.id)
    const supabase = createClient()
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    if (error) {
      addToast('Failed to update listing', 'error')
    } else {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l))
      addToast(newStatus === 'sold' ? 'Marked as sold!' : 'Relisted as active', 'success')
    }
    setMarkingId(null)
  }

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    const supabase = createClient()
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) { addToast('Failed to delete', 'error'); return }
    setListings(prev => prev.filter(l => l.id !== id))
    addToast('Listing deleted', 'info')
  }

  if (authLoading || loading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)', fontSize: '14px' }}>Loading...</p>
        </div>
      </main>
    )
  }

  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0)
  const totalSaves = listings.reduce((s, l) => s + (l.saves || 0), 0)
  const active = listings.filter(l => l.status === 'active').length
  const sold = listings.filter(l => l.status === 'sold').length

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '4px' }}>
              My Dashboard
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.4)', fontSize: '13px', fontWeight: '300', margin: 0 }}>
              {profile?.username ? `@${profile.username}` : user?.email}
            </p>
          </div>
          <Link href="/listings/new" className="btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>
            + List New Gear
          </Link>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          <StatCard label="Active Listings" value={active} icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          } />
          <StatCard label="Items Sold" value={sold} icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          } />
          <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          } />
          <StatCard label="Total Saves" value={totalSaves.toLocaleString()} icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          } />
        </div>

        {/* Listings table */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '16px', fontWeight: '500' }}>
            Your Listings
          </h2>

          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(15,32,64,0.4)', borderRadius: '8px', border: '1px solid rgba(143,163,184,0.06)' }}>
              <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.3rem', color: 'rgba(143,163,184,0.2)', marginBottom: '12px' }}>No listings yet</p>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: '24px' }}>
                Start selling your fishing gear today
              </p>
              <Link href="/listings/new" className="btn-primary">List Your First Item</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.map(listing => {
                const photo = listing.photo_url || CATEGORY_PHOTOS[listing.category] || CATEGORY_PHOTOS['default']
                const isSold = listing.status === 'sold'
                return (
                  <div key={listing.id} style={{ background: 'rgba(15,32,64,0.6)', border: `1px solid ${isSold ? 'rgba(143,163,184,0.04)' : 'rgba(143,163,184,0.06)'}`, borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', opacity: isSold ? 0.65 : 1, transition: 'opacity 0.2s' }}>

                    {/* Thumbnail */}
                    <Link href={`/listings/${listing.id}`} style={{ flexShrink: 0, display: 'block', borderRadius: '6px', overflow: 'hidden', width: '72px', height: '60px', position: 'relative', background: '#0a1628' }}>
                      <Image src={photo} alt={listing.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
                          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', display: 'block' }}>
                            {listing.title}
                          </span>
                        </Link>
                        {isSold && (
                          <span style={{ background: 'rgba(143,163,184,0.08)', color: 'rgba(143,163,184,0.4)', border: '1px solid rgba(143,163,184,0.1)', padding: '1px 7px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
                            Sold
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '15px', color: '#c9a84c' }}>
                          ${Number(listing.price).toLocaleString()}
                        </span>
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          {(listing.views || 0).toLocaleString()} views
                        </span>
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                          {(listing.saves || 0)} saves
                        </span>
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.25)' }}>
                          {timeAgo(listing.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <Link href={`/listings/${listing.id}/edit`} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', padding: '6px 12px', border: '1px solid rgba(143,163,184,0.1)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.15s', display: 'block' }}>
                        Edit
                      </Link>
                         <button
                        onClick={() => toggleSold(listing)}
                        disabled={markingId === listing.id}
                        style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', cursor: 'pointer', padding: '6px 12px', border: `1px solid ${isSold ? 'rgba(74,158,255,0.2)' : 'rgba(201,168,76,0.2)'}`, borderRadius: '4px', background: isSold ? 'rgba(74,158,255,0.06)' : 'rgba(201,168,76,0.06)', color: isSold ? '#4a9eff' : '#c9a84c', transition: 'all 0.15s', opacity: markingId === listing.id ? 0.5 : 1 }}
                      >
                        {markingId === listing.id ? '...' : isSold ? 'Relist' : 'Mark Sold'}
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        style={{ background: 'none', border: '1px solid rgba(180,80,80,0.12)', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', color: 'rgba(220,100,100,0.4)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                        title="Delete listing"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
