'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const FISHING_TYPES = ['Surf', 'Offshore', 'Inshore', 'Freshwater', 'Fly', 'Ice', 'Kayak', 'Charter', 'Pier', 'Rock']

const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconStar = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
)

const IconYoutube = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
)

const IconVerified = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#4a9eff" stroke="none">
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
  </svg>
)

function Stars({ rating }) {
  const r = Math.round(rating || 0)
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => <IconStar key={i} filled={i <= r} />)}
    </span>
  )
}

function InitialsCircle({ username, size = 88, fontSize = 28 }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(201,168,76,0.15)',
      border: '3px solid #c9a84c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: '600', color: '#c9a84c',
      fontFamily: 'var(--font-dm-sans, sans-serif)',
    }}>
      {initials}
    </div>
  )
}

export default function ProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')

  // Edit state
  const [editOpen, setEditOpen] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editFishingTypes, setEditFishingTypes] = useState([])
  const [editInstagram, setEditInstagram] = useState('')
  const [editYoutube, setEditYoutube] = useState('')
  const [saving, setSaving] = useState(false)

  // Upload state
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => { load() }, [username])

  async function load() {
    setLoading(true)
    const { data: p } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (!p) { setLoading(false); return }
    setProfile(p)
    setEditBio(p.bio || '')
    setEditLocation(p.location || '')
    setEditFishingTypes(p.fishing_types || [])
    setEditInstagram(p.instagram || '')
    setEditYoutube(p.youtube || '')

    const [{ data: l }, { data: r }] = await Promise.all([
      supabase.from('listings').select('*').eq('user_id', p.id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('ratings').select('*, rater:profiles!rater_id(username, avatar_url)').eq('rated_user_id', p.id).order('created_at', { ascending: false }),
    ])
    setListings(l || [])
    setReviews(r || [])
    setLoading(false)
  }

  const isOwnProfile = user?.id === profile?.id

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setProfile(p => ({ ...p, avatar_url: publicUrl }))
      addToast('Avatar updated', 'success')
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error')
    }
    setUploadingAvatar(false)
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `covers/${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)
      await supabase.from('profiles').update({ cover_url: publicUrl }).eq('id', user.id)
      setProfile(p => ({ ...p, cover_url: publicUrl }))
      addToast('Cover photo updated', 'success')
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error')
    }
    setUploadingCover(false)
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      bio: editBio.trim() || null,
      location: editLocation.trim() || null,
      fishing_types: editFishingTypes,
      instagram: editInstagram.trim() || null,
      youtube: editYoutube.trim() || null,
    }).eq('id', user.id)
    if (error) {
      addToast(error.message, 'error')
    } else {
      addToast('Profile saved', 'success')
      setEditOpen(false)
      load()
    }
    setSaving(false)
  }

  function toggleFishingType(ft) {
    setEditFishingTypes(prev => prev.includes(ft) ? prev.filter(x => x !== ft) : [...prev, ft])
  }

  if (loading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px' }}>
          {/* Cover skeleton */}
          <div className="skeleton" style={{ height: '280px', borderRadius: '0 0 8px 8px', marginBottom: '60px' }} />
          <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
            <div className="skeleton" style={{ width: '160px', height: '20px', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '6px' }} />)}
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', color: 'rgba(143,163,184,0.3)', marginBottom: '24px' }}>Profile not found</p>
          <Link href="/browse" className="btn-primary">Browse Gear</Link>
        </div>
      </main>
    )
  }

  const memberYear = new Date(profile.created_at).getFullYear()

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      {/* ── Cover Photo ── */}
      <div style={{ position: 'relative', height: '280px', background: profile.cover_url ? 'transparent' : 'linear-gradient(135deg, #0f2040 0%, #1a3255 50%, #0f2040 100%)' }}>
        {profile.cover_url && (
          <Image src={profile.cover_url} alt="cover" fill style={{ objectFit: 'cover' }} priority />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.7) 0%, transparent 60%)' }} />
        {isOwnProfile && (
          <>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                padding: '8px 14px', cursor: 'pointer', color: '#f8f9fa',
                fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'background 0.15s',
              }}
            >
              <IconCamera /> {uploadingCover ? 'Uploading...' : 'Change Cover'}
            </button>
          </>
        )}
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px 80px' }}>

        {/* ── Avatar + Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '24px', marginTop: '-44px', position: 'relative', zIndex: 10 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.avatar_url ? (
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #c9a84c' }}>
                <Image src={profile.avatar_url} alt={profile.username} width={88} height={88} style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <InitialsCircle username={profile.username} />
            )}
            {isOwnProfile && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{
                    position: 'absolute', bottom: '0', right: '0',
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#c9a84c', border: '2px solid #0a1628',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#0a1628',
                  }}
                >
                  <IconCamera />
                </button>
              </>
            )}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, paddingBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.9rem', fontWeight: '500', color: '#f8f9fa', margin: 0 }}>
                @{profile.username}
              </h1>
              {profile.verified && (
                <span className="verified-badge">
                  <IconVerified /> Verified
                </span>
              )}
            </div>
            {profile.location && (
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.5)', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 8px' }}>
                <IconPin /> {profile.location}
              </p>
            )}
            {profile.fishing_types?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {profile.fishing_types.map(ft => (
                  <span key={ft} className="category-badge">{ft}</span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', paddingBottom: '4px', flexShrink: 0 }}>
            {isOwnProfile ? (
              <button
                onClick={() => setEditOpen(true)}
                className="btn-secondary"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                Edit Profile
              </button>
            ) : (
              <Link href={`/messages?to=${profile.username}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                Message
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #162a4a', borderBottom: '1px solid #162a4a', marginBottom: '40px' }}>
          {[
            { label: 'Listings', value: profile.total_listings || listings.length },
            { label: 'Sales', value: profile.total_sales || 0 },
            { label: 'Rating', value: profile.rating ? `${Number(profile.rating).toFixed(1)} ⭐` : '—' },
            { label: 'Member Since', value: memberYear },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, padding: '20px 24px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid #162a4a' : 'none',
            }}>
              <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.3rem', color: '#f8f9fa', margin: '0 0 4px' }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Tab Nav ── */}
        <div className="tab-nav" style={{ marginBottom: '32px' }}>
          {['listings', 'reviews', 'about'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-link${activeTab === tab ? ' active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
            >
              {tab}
              {tab === 'listings' && ` (${listings.length})`}
              {tab === 'reviews' && ` (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* ── Listings Tab ── */}
        {activeTab === 'listings' && (
          listings.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', border: '1px solid #162a4a', borderRadius: '6px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: isOwnProfile ? '20px' : '0' }}>
                No active listings
              </p>
              {isOwnProfile && <Link href="/listings/new" className="btn-primary">List Gear</Link>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {listings.map(l => (
                <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="listing-card"
                    style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
                  >
                    <div style={{ height: '160px', background: '#0a1628', position: 'relative', overflow: 'hidden' }}>
                      {l.photo_url ? (
                        <Image src={l.photo_url} alt={l.title} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(74,158,255,0.08)', fontSize: '48px' }}>🎣</div>
                      )}
                      {l.condition && (
                        <span className="category-badge" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>{l.condition}</span>
                      )}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                      <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.05rem', color: '#c9a84c', margin: 0 }}>${Number(l.price).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', border: '1px solid #162a4a', borderRadius: '6px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300' }}>
                No reviews yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <Link href={`/profile/${r.rater?.username}`} style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', textDecoration: 'none' }}>
                        @{r.rater?.username || 'Angler'}
                      </Link>
                      <div style={{ marginTop: '4px' }}>
                        <Stars rating={r.stars} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.35)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {r.review && (
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300', color: '#8fa3b8', margin: 0, lineHeight: 1.6 }}>
                      {r.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── About Tab ── */}
        {activeTab === 'about' && (
          <div style={{ maxWidth: '600px' }}>
            {profile.bio && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '12px' }}>About</p>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', fontWeight: '300', color: '#8fa3b8', lineHeight: 1.7, margin: 0 }}>
                  {profile.bio}
                </p>
              </div>
            )}
            {profile.fishing_types?.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '12px' }}>Fishing Types</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.fishing_types.map(ft => (
                    <span key={ft} className="category-badge" style={{ fontSize: '11px', padding: '4px 12px' }}>{ft}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.location && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '12px' }}>Location</p>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconPin /> {profile.location}
                </p>
              </div>
            )}
            {(profile.instagram || profile.youtube) && (
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', marginBottom: '12px' }}>Social</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4a9eff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                      <IconInstagram /> @{profile.instagram.replace('@', '')}
                    </a>
                  )}
                  {profile.youtube && (
                    <a href={profile.youtube.startsWith('http') ? profile.youtube : `https://youtube.com/@${profile.youtube}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4a9eff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                      <IconYoutube /> {profile.youtube}
                    </a>
                  )}
                </div>
              </div>
            )}
            {!profile.bio && !profile.location && !profile.fishing_types?.length && !profile.instagram && !profile.youtube && (
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300' }}>
                No additional info provided.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.88)',
          backdropFilter: 'blur(8px)', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ background: '#0f2040', border: '1px solid #1e3455', borderRadius: '8px', padding: '40px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: '#f8f9fa', marginBottom: '32px' }}>
              Edit Profile
            </h2>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="fm-label">Bio</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell the community about yourself..." rows={3} className="fm-input" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="fm-label">Location</label>
                <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="e.g. Montauk, NY" className="fm-input" />
              </div>
              <div>
                <label className="fm-label">Fishing Types</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {FISHING_TYPES.map(ft => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => toggleFishingType(ft)}
                      style={{
                        padding: '6px 14px', borderRadius: '3px', cursor: 'pointer',
                        fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', fontWeight: '500',
                        border: editFishingTypes.includes(ft) ? '1px solid #c9a84c' : '1px solid #1e3455',
                        background: editFishingTypes.includes(ft) ? 'rgba(201,168,76,0.12)' : 'transparent',
                        color: editFishingTypes.includes(ft) ? '#c9a84c' : 'rgba(143,163,184,0.5)',
                        transition: 'all 0.15s',
                      }}
                    >{ft}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="fm-label">Instagram</label>
                <input type="text" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} placeholder="@yourhandle" className="fm-input" />
              </div>
              <div>
                <label className="fm-label">YouTube</label>
                <input type="text" value={editYoutube} onChange={e => setEditYoutube(e.target.value)} placeholder="@yourchannel or URL" className="fm-input" />
              </div>
              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditOpen(false)} className="btn-ghost" style={{ cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
