'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

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
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
)

const IconMessage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const IconPhoto = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [seller, setSeller] = useState(null)
  const [related, setRelated] = useState([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contactOpen, setContactOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()

    async function load() {
      const { data: l } = await supabase.from('listings').select('*').eq('id', id).single()
      if (!l) { setLoading(false); return }
      setListing(l)

      // Fetch seller profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', l.user_id).single()
      setSeller(p)

      // Related listings (same category)
      const { data: rel } = await supabase
        .from('listings')
        .select('*')
        .eq('category', l.category)
        .neq('id', id)
        .limit(3)
      setRelated(rel || [])

      // Check if saved
      if (user) {
        const { data: sv } = await supabase
          .from('saved_listings')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', id)
          .single()
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
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id })
      setSaved(true)
    }
    setSaveLoading(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (!message.trim()) return
    setSending(true)
    const supabase = createClient()
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: listing.user_id,
      listing_id: id,
      content: message.trim(),
    })
    setSending(false)
    setSent(true)
    setMessage('')
  }

  if (loading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 24px', color: 'rgba(143,163,184,0.3)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px' }}>
          Loading...
        </div>
      </main>
    )
  }

  if (!listing) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.3)', marginBottom: '24px' }}>Listing not found</p>
          <Link href="/browse" className="btn-primary">Back to Browse</Link>
        </div>
      </main>
    )
  }

  const cond = CONDITION_COLORS[listing.condition] || CONDITION_COLORS['Good']
  const isOwnListing = user?.id === listing.user_id

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'rgba(143,163,184,0.5)',
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '0 0 32px',
            letterSpacing: '0.04em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f8f9fa'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.5)'}
        >
          <IconBack /> Browse
        </button>

        {/* Main layout */}
        <div className="listing-detail-grid">

          {/* Left: Photo */}
          <div>
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              background: '#0f2040',
              border: '1px solid #162a4a',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {listing.photo_url ? (
                <img src={listing.photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'rgba(74,158,255,0.1)' }}><IconPhoto /></span>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Category + Save */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(10,22,40,0.85)',
                border: '1px solid #162a4a',
                padding: '4px 12px',
                fontSize: '10px',
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4a9eff',
                borderRadius: '2px',
              }}>
                {listing.category}
              </span>
              {!isOwnListing && (
                <button
                  onClick={toggleSave}
                  disabled={saveLoading}
                  style={{
                    background: 'none',
                    border: '1px solid #162a4a',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: saved ? '#c9a84c' : 'rgba(143,163,184,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '12px',
                    transition: 'all 0.15s',
                  }}
                >
                  <IconBookmark filled={saved} />
                  {saved ? 'Saved' : 'Save'}
                </button>
              )}
            </div>

            {/* Title + Price */}
            <div>
              <h1 style={{
                fontFamily: 'var(--font-playfair, serif)',
                fontSize: '1.8rem',
                fontWeight: '500',
                color: '#f8f9fa',
                lineHeight: 1.25,
                marginBottom: '12px',
              }}>
                {listing.title}
              </h1>
              <p style={{
                fontFamily: 'var(--font-playfair, serif)',
                fontSize: '2rem',
                color: '#c9a84c',
                fontWeight: '500',
                margin: 0,
              }}>
                ${Number(listing.price).toLocaleString()}
              </p>
            </div>

            {/* Condition + Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {listing.condition && (
                <span style={{
                  background: cond.bg,
                  color: cond.text,
                  border: `1px solid ${cond.border}`,
                  padding: '4px 12px',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                }}>
                  {listing.condition}
                </span>
              )}
              {listing.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(143,163,184,0.5)', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                  <IconPin /> {listing.location}
                </span>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <p style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '14px',
                fontWeight: '300',
                color: '#8fa3b8',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {listing.description}
              </p>
            )}

            {/* Date */}
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', margin: 0 }}>
              Listed {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            {/* Seller card */}
            <div style={{
              background: '#0f2040',
              border: '1px solid #162a4a',
              borderRadius: '6px',
              padding: '20px',
            }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '14px' }}>
                Seller
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#162a4a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(143,163,184,0.5)',
                  flexShrink: 0,
                }}>
                  <IconUser />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', margin: 0 }}>
                    {seller?.username || 'Seaitall Member'}
                  </p>
                  {seller?.created_at && (
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', margin: 0 }}>
                      Member since {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              {!isOwnListing && (
                <>
                  {!contactOpen ? (
                    <button
                      onClick={() => { if (!user) { router.push('/auth/login') } else { setContactOpen(true) } }}
                      className="btn-primary"
                      style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <IconMessage /> Contact Seller
                    </button>
                  ) : sent ? (
                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#c9a84c', margin: 0 }}>
                        Message sent — check your inbox
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Hi, I'm interested in your ${listing.title}...`}
                        required
                        rows={3}
                        className="fm-input"
                        style={{ resize: 'vertical', minHeight: '80px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" disabled={sending} className="btn-primary" style={{ flex: 1, border: 'none', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1 }}>
                          {sending ? 'Sending...' : 'Send'}
                        </button>
                        <button type="button" onClick={() => setContactOpen(false)} className="btn-ghost" style={{ padding: '12px 16px', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {related.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '1.4rem',
              fontWeight: '400',
              color: '#f8f9fa',
              marginBottom: '28px',
            }}>
              More {listing.category}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {related.map((rel) => (
                <Link key={rel.id} href={`/listings/${rel.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      background: '#0f2040',
                      border: '1px solid #162a4a',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1e3455'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#162a4a'}
                  >
                    <div style={{ height: '160px', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {rel.photo_url ? (
                        <img src={rel.photo_url} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'rgba(74,158,255,0.1)' }}><IconPhoto /></span>
                      )}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px' }}>{rel.title}</p>
                      <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', color: '#c9a84c', margin: 0 }}>${Number(rel.price).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
