'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const UNSPLASH = (id) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`
const CATEGORY_PHOTOS = {
  'Rods':         UNSPLASH('photo-1544551763-46a013bb70d5'),
  'Reels':        UNSPLASH('photo-1571019613454-1cb2f99b2d8b'),
  'Lures':        UNSPLASH('photo-1578662996442-48f60103fc96'),
  'Boats':        UNSPLASH('photo-1567899378494-47b22a2ae96a'),
  'Engines':      UNSPLASH('photo-1558618666-fcd25c85cd64'),
  'Tackle Boxes': UNSPLASH('photo-1544551763-46a013bb70d5'),
  'Line':         UNSPLASH('photo-1544551763-46a013bb70d5'),
  'Other':        UNSPLASH('photo-1544551763-46a013bb70d5'),
}
const CONDITION_COLORS = {
  'New':      { bg: 'rgba(74,158,255,0.12)', text: '#4a9eff', border: 'rgba(74,158,255,0.25)' },
  'Like New': { bg: 'rgba(74,158,255,0.08)', text: 'rgba(74,158,255,0.8)', border: 'rgba(74,158,255,0.18)' },
  'Good':     { bg: 'rgba(201,168,76,0.1)',  text: '#c9a84c', border: 'rgba(201,168,76,0.25)' },
  'Fair':     { bg: 'rgba(200,160,80,0.08)', text: 'rgba(200,160,80,0.8)', border: 'rgba(200,160,80,0.2)' },
  'Poor':     { bg: 'rgba(180,80,80,0.1)',   text: 'rgba(220,100,100,0.9)', border: 'rgba(180,80,80,0.25)' },
}

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconBookmark = ({ filled }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconMessage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconShare = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconHeart = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#c9a84c" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconVerified = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconFlag = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
)
const IconChevron = ({ dir = 'right' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'up' ? 'rotate(-90deg)' : dir === 'down' ? 'rotate(90deg)' : 'none' }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconPhoto = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [listing, setListing] = useState(null)
  const [seller, setSeller] = useState(null)
  const [related, setRelated] = useState([])
  const [saved, setSaved] = useState(false)
  const [savesCount, setSavesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()

    async function load() {
      const { data: l, error } = await supabase.from('listings').select('*').eq('id', id).single()
      if (error || !l) { setLoading(false); return }

      // Increment view count (fire and forget)
      supabase.from('listings').update({ views: (l.views || 0) + 1 }).eq('id', id).then(() => {})

      setListing(l)
      setSavesCount(l.saves || 0)
      document.title = `${l.title} — Seaitall`

      // Fetch seller profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', l.user_id).single()
      setSeller(p || null)

      // Related listings (same category, limit 4)
      const { data: rel } = await supabase
        .from('listings')
        .select('id,title,price,condition,category,location,photo_url,photos,created_at')
        .eq('category', l.category)
        .eq('status', 'active')
        .neq('id', id)
        .limit(4)
      setRelated(rel || [])

      // Check if saved by current user
      if (user) {
        const { data: sv } = await supabase
          .from('saved_listings')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', id)
          .maybeSingle()
        setSaved(!!sv)
      }

      setLoading(false)
    }

    load()
  }, [id, user])

  const toggleSave = async () => {
    if (!user) { router.push('/auth/login'); return }
    setSaveLoading(true)
    const supabase = createClient()
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', id)
      setSaved(false)
      setSavesCount(prev => Math.max(0, prev - 1))
      addToast('Removed from saved listings', 'info')
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id })
      setSaved(true)
      setSavesCount(prev => prev + 1)
      addToast('Listing saved!', 'success')
    }
    setSaveLoading(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (!message.trim()) return
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: listing.user_id,
      listing_id: id,
      content: message.trim(),
    })
    setSending(false)
    if (error) { addToast('Failed to send message', 'error'); return }
    setSent(true)
    setMessage('')
    addToast('Message sent!', 'success')
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      addToast('Link copied to clipboard', 'success')
    } catch {
      addToast('Could not copy link', 'error')
    }
  }

  const submitReport = async (e) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (!reportReason.trim()) return
    setReportSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      listing_id: id,
      reason: reportReason.trim(),
    })
    setReportSubmitting(false)
    if (error) { addToast('Failed to submit report', 'error'); return }
    setReportSent(true)
    addToast('Report submitted', 'success')
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px' }}>
          <div className="skeleton" style={{ height: '14px', width: '280px', borderRadius: '4px', marginBottom: '40px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'start' }}>
            <div>
              <div className="skeleton" style={{ width: '100%', height: '480px', borderRadius: '6px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: '80px', height: '60px', borderRadius: '4px' }} />)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="skeleton" style={{ height: '32px', width: '60%', borderRadius: '4px' }} />
              <div className="skeleton" style={{ height: '44px', width: '40%', borderRadius: '4px' }} />
              <div className="skeleton" style={{ height: '100px', borderRadius: '6px' }} />
              <div className="skeleton" style={{ height: '140px', borderRadius: '6px' }} />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!listing) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', color: 'rgba(143,163,184,0.2)', marginBottom: '8px' }}>Listing not found</p>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: '32px' }}>
            This listing may have been removed or the link is incorrect.
          </p>
          <button onClick={() => router.back()} className="btn-ghost" style={{ marginRight: '12px' }}>Go Back</button>
          <Link href="/browse" className="btn-primary">Browse Listings</Link>
        </div>
      </main>
    )
  }

  const cond = CONDITION_COLORS[listing.condition] || CONDITION_COLORS['Good']
  const isOwnListing = user?.id === listing.user_id
  const fallbackPhoto = CATEGORY_PHOTOS[listing.category] || CATEGORY_PHOTOS['Other']

  // Build photos array: prefer listing.photos[], else photo_url, else fallback
  const photos = (() => {
    if (listing.photos && listing.photos.length > 0) return listing.photos
    if (listing.photo_url) return [listing.photo_url]
    return [fallbackPhoto]
  })()
  const mainPhoto = photos[activePhoto] || photos[0]

  const descTruncated = listing.description && listing.description.length > 300
  const descText = listing.description
    ? (descTruncated && !descExpanded ? listing.description.slice(0, 300) + '…' : listing.description)
    : null

  const sellerInitials = seller?.username
    ? seller.username.slice(0, 2).toUpperCase()
    : (listing.seller_email ? listing.seller_email.slice(0, 2).toUpperCase() : 'SM')

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 32px 100px' }}>

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Home', href: '/' },
            { label: 'Browse', href: '/browse' },
            { label: listing.category, href: `/browse?category=${encodeURIComponent(listing.category)}` },
          ].map((crumb, i) => (
            <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {i > 0 && <span style={{ color: 'rgba(143,163,184,0.2)', fontSize: '12px' }}>/</span>}
              <Link href={crumb.href} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', letterSpacing: '0.02em', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(143,163,184,0.4)'}
              >
                {crumb.label}
              </Link>
            </span>
          ))}
          <span style={{ color: 'rgba(143,163,184,0.2)', fontSize: '12px' }}>/</span>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.55)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </span>
        </nav>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'start' }}>

          {/* ── LEFT: Photo + Description ──────────────────────────────────── */}
          <div>
            {/* Hero image */}
            <div style={{ position: 'relative', width: '100%', height: '60vh', minHeight: '380px', background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', overflow: 'hidden' }}>
              <Image
                src={mainPhoto}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, 65vw"
                style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                priority
              />
              {/* Photo counter if multiple */}
              {photos.length > 1 && (
                <span style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '2px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(248,249,250,0.7)', letterSpacing: '0.04em' }}>
                  {activePhoto + 1} / {photos.length}
                </span>
              )}
              {/* Prev / Next arrows for multi-photo */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhoto(p => (p - 1 + photos.length) % photos.length)}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f8f9fa', transition: 'background 0.15s', backdropFilter: 'blur(4px)' }}
                  >
                    <IconChevron dir="left" />
                  </button>
                  <button
                    onClick={() => setActivePhoto(p => (p + 1) % photos.length)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f8f9fa', transition: 'background 0.15s', backdropFilter: 'blur(4px)' }}
                  >
                    <IconChevron dir="right" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    style={{
                      flexShrink: 0,
                      width: '72px',
                      height: '54px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: `2px solid ${activePhoto === i ? '#c9a84c' : 'rgba(22,42,74,0.6)'}`,
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <Image src={photo} alt={`Photo ${i + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ marginTop: '36px' }}>
              <h2 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '14px' }}>
                Description
              </h2>
              {descText ? (
                <>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300', color: '#8fa3b8', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {descText}
                  </p>
                  {descTruncated && (
                    <button
                      onClick={() => setDescExpanded(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', padding: '10px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {descExpanded ? 'Show less' : 'Show more'} <IconChevron dir={descExpanded ? 'up' : 'down'} />
                    </button>
                  )}
                </>
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: 'rgba(143,163,184,0.25)', fontWeight: '300', margin: 0 }}>
                  No description provided.
                </p>
              )}
            </div>

            {/* Specs grid */}
            <div style={{ marginTop: '36px', background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #162a4a' }}>
                <h2 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)' }}>
                  Item Details
                </h2>
              </div>
              {[
                { label: 'Category',    value: listing.category },
                { label: 'Condition',   value: listing.condition },
                { label: 'Location',    value: listing.location || '—' },
                { label: 'Listed',      value: new Date(listing.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                { label: 'Item ID',     value: `#${listing.id.slice(0, 8).toUpperCase()}` },
              ].map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', padding: '13px 20px', borderBottom: i < 4 ? '1px solid rgba(22,42,74,0.6)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', width: '120px', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', fontWeight: '400' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Report link */}
            <div style={{ marginTop: '24px' }}>
              {!reportOpen ? (
                <button
                  onClick={() => { if (!user) { router.push('/auth/login') } else { setReportOpen(true) } }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(143,163,184,0.3)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', padding: 0, display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(220,100,100,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(143,163,184,0.3)'}
                >
                  <IconFlag /> Report this listing
                </button>
              ) : reportSent ? (
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)' }}>Report submitted. Thank you.</p>
              ) : (
                <form onSubmit={submitReport} style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', fontWeight: '500', color: 'rgba(143,163,184,0.5)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Report Listing</p>
                  <textarea
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    placeholder="Describe the issue (e.g. spam, misleading, prohibited item)..."
                    required
                    rows={3}
                    className="fm-input"
                    style={{ resize: 'vertical', minHeight: '72px', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" disabled={reportSubmitting} style={{ background: 'rgba(180,80,80,0.12)', border: '1px solid rgba(180,80,80,0.25)', borderRadius: '4px', padding: '8px 16px', cursor: reportSubmitting ? 'not-allowed' : 'pointer', color: 'rgba(220,100,100,0.8)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', opacity: reportSubmitting ? 0.6 : 1 }}>
                      {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button type="button" onClick={() => setReportOpen(false)} style={{ background: 'none', border: '1px solid #162a4a', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── RIGHT: Sticky price panel ──────────────────────────────────── */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Price card */}
            <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '24px' }}>
              {/* Title */}
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.35rem', fontWeight: '500', color: '#f8f9fa', lineHeight: 1.3, marginBottom: '16px' }}>
                {listing.title}
              </h1>

              {/* Price */}
              <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.4rem', color: '#c9a84c', fontWeight: '500', margin: '0 0 16px', lineHeight: 1 }}>
                ${Number(listing.price).toLocaleString()}
              </p>

              {/* Condition + Location row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {listing.condition && (
                  <span style={{ background: cond.bg, color: cond.text, border: `1px solid ${cond.border}`, padding: '4px 10px', borderRadius: '2px', fontSize: '11px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontWeight: '500', letterSpacing: '0.04em' }}>
                    {listing.condition}
                  </span>
                )}
                {listing.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(143,163,184,0.45)', fontSize: '12px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                    <IconPin /> {listing.location}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(22,42,74,0.7)', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)' }}>
                  <IconHeart /> {savesCount} saved
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)' }}>
                  <IconEye /> {(listing.views || 0).toLocaleString()} views
                </span>
              </div>

              {/* CTA buttons */}
              {!isOwnListing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Message Seller */}
                  {!contactOpen ? (
                    <button
                      onClick={() => { if (!user) { router.push('/auth/login') } else { setContactOpen(true) } }}
                      className="btn-primary"
                      style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <IconMessage /> Message Seller
                    </button>
                  ) : sent ? (
                    <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '4px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#c9a84c', margin: 0 }}>
                        Message sent — check your inbox
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={`Hi, I'm interested in your ${listing.title}...`}
                        required
                        rows={3}
                        className="fm-input"
                        style={{ resize: 'vertical', minHeight: '80px', fontSize: '13px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" disabled={sending} className="btn-primary" style={{ flex: 1, border: 'none', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1, fontSize: '13px', padding: '11px' }}>
                          {sending ? 'Sending…' : 'Send'}
                        </button>
                        <button type="button" onClick={() => setContactOpen(false)} className="btn-ghost" style={{ padding: '11px 16px', fontSize: '13px', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Save toggle */}
                  <button
                    onClick={toggleSave}
                    disabled={saveLoading}
                    style={{ width: '100%', background: saved ? 'rgba(201,168,76,0.08)' : 'transparent', border: `1px solid ${saved ? 'rgba(201,168,76,0.3)' : '#162a4a'}`, borderRadius: '4px', padding: '12px', cursor: saveLoading ? 'not-allowed' : 'pointer', color: saved ? '#c9a84c' : 'rgba(143,163,184,0.5)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s', opacity: saveLoading ? 0.6 : 1 }}
                  >
                    <IconBookmark filled={saved} />
                    {saved ? 'Saved' : 'Save Listing'}
                  </button>
                </div>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid #162a4a', borderRadius: '4px', padding: '10px', cursor: 'pointer', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3455'; e.currentTarget.style.color = 'rgba(143,163,184,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.color = 'rgba(143,163,184,0.4)' }}
              >
                <IconShare /> Share listing
              </button>
            </div>

            {/* Seller card */}
            <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '20px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.35)', marginBottom: '16px' }}>
                Seller
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {/* Avatar */}
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#162a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {seller?.avatar_url ? (
                    <Image src={seller.avatar_url} alt={seller.username || 'Seller'} fill sizes="44px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '600', color: 'rgba(143,163,184,0.6)' }}>{sellerInitials}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {seller?.username ? (
                      <Link href={`/profile/${seller.username}`} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                        onMouseLeave={e => e.currentTarget.style.color = '#f8f9fa'}
                      >
                        {seller.username}
                      </Link>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa' }}>Seaitall Member</span>
                    )}
                    {seller?.verified && (
                      <span title="Verified seller"><IconVerified /></span>
                    )}
                  </div>
                  {seller?.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <IconStar />
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#c9a84c' }}>{Number(seller.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {seller?.created_at && (
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', margin: 0 }}>
                    Member since {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                )}
                {seller?.total_listings != null && (
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', margin: 0 }}>
                    {seller.total_listings} listing{seller.total_listings !== 1 ? 's' : ''} total
                  </p>
                )}
              </div>

              {seller?.username && (
                <Link href={`/profile/${seller.username}`}
                  style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent', border: '1px solid #162a4a', borderRadius: '4px', padding: '9px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.45)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3455'; e.currentTarget.style.color = 'rgba(143,163,184,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.color = 'rgba(143,163,184,0.45)' }}
                >
                  View profile <IconChevron dir="right" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Listings ───────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', fontWeight: '400', color: '#f8f9fa', margin: 0 }}>
                More {listing.category}
              </h2>
              <Link href={`/browse?category=${encodeURIComponent(listing.category)}`} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(143,163,184,0.4)'}
              >
                See all <IconChevron dir="right" />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
              {related.map(rel => {
                const relPhoto = rel.photo_url || (rel.photos && rel.photos[0]) || CATEGORY_PHOTOS[rel.category] || CATEGORY_PHOTOS['Other']
                const relCond = CONDITION_COLORS[rel.condition] || CONDITION_COLORS['Good']
                return (
                  <Link key={rel.id} href={`/listings/${rel.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div
                      className="listing-card"
                      style={{ background: '#0f2040', transition: 'border-color 0.2s, transform 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3455'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ position: 'relative', height: '170px', background: '#0a1628', overflow: 'hidden' }}>
                        <Image src={relPhoto} alt={rel.title} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                        {rel.condition && (
                          <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: relCond.bg, color: relCond.text, border: `1px solid ${relCond.border}`, padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)', backdropFilter: 'blur(4px)' }}>
                            {rel.condition}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p className="truncate-2" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px', lineHeight: 1.4 }}>
                          {rel.title}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '15px', color: '#c9a84c' }}>
                            ${Number(rel.price).toLocaleString()}
                          </span>
                          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>
                            {timeAgo(rel.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile sticky bottom bar ─────────────────────────────────────────── */}
      <div style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f2040', borderTop: '1px solid #162a4a', padding: '12px 20px', zIndex: 100, alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
        id="mobile-bar"
      >
        <div>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: '#c9a84c', margin: 0, lineHeight: 1 }}>
            ${Number(listing.price).toLocaleString()}
          </p>
          {listing.condition && (
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.4)' }}>
              {listing.condition}
            </span>
          )}
        </div>
        {!isOwnListing && (
          <button
            onClick={() => { if (!user) { router.push('/auth/login') } else { setContactOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
            className="btn-primary"
            style={{ border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <IconMessage /> Message Seller
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-bar { display: flex !important; }
        }
      `}</style>
    </main>
  )
}
