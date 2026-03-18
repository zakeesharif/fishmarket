'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

const IconUser = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconPhoto = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

export default function ProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    load()
  }, [username])

  async function load() {
    const supabase = createClient()
    const { data: p } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (!p) { setLoading(false); return }
    setProfile(p)
    setEditUsername(p.username || '')
    setEditBio(p.bio || '')

    const { data: l } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', p.id)
      .order('created_at', { ascending: false })
    setListings(l || [])
    setLoading(false)
  }

  const isOwnProfile = user?.id === profile?.id

  async function saveProfile(e) {
    e.preventDefault()
    setSaveError('')
    if (!editUsername.trim()) { setSaveError('Username is required'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ username: editUsername.trim(), bio: editBio.trim() })
      .eq('id', user.id)
    if (error) {
      setSaveError(error.message.includes('unique') ? 'That username is taken' : error.message)
      setSaving(false)
      return
    }
    setSaving(false)
    setEditOpen(false)
    // Navigate to new username if changed
    if (editUsername.trim() !== username) {
      router.replace(`/profile/${editUsername.trim()}`)
    } else {
      load()
    }
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

  if (!profile) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: 'rgba(143,163,184,0.3)', marginBottom: '24px' }}>User not found</p>
          <Link href="/browse" className="btn-primary">Browse Gear</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 32px 80px' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', marginBottom: '60px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#0f2040',
            border: '1px solid #162a4a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(143,163,184,0.4)',
            flexShrink: 0,
          }}>
            <IconUser />
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-playfair, serif)',
                fontSize: '1.8rem',
                fontWeight: '500',
                color: '#f8f9fa',
                margin: 0,
              }}>
                {profile.username || 'Seaitall Member'}
              </h1>
              {isOwnProfile && (
                <button
                  onClick={() => setEditOpen(true)}
                  style={{
                    background: 'none',
                    border: '1px solid #162a4a',
                    borderRadius: '4px',
                    padding: '7px 14px',
                    cursor: 'pointer',
                    color: 'rgba(143,163,184,0.5)',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#f8f9fa'; e.currentTarget.style.borderColor = '#1e3455' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(143,163,184,0.5)'; e.currentTarget.style.borderColor = '#162a4a' }}
                >
                  <IconEdit /> Edit Profile
                </button>
              )}
            </div>

            {profile.bio && (
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300', color: '#8fa3b8', lineHeight: 1.6, margin: '0 0 10px', maxWidth: '480px' }}>
                {profile.bio}
              </p>
            )}

            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', margin: 0 }}>
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              &nbsp;&middot;&nbsp;
              {listings.length} listing{listings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Edit modal */}
        {editOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,22,40,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}>
            <div style={{
              background: '#0f2040',
              border: '1px solid #162a4a',
              borderRadius: '8px',
              padding: '40px',
              width: '100%',
              maxWidth: '440px',
            }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', color: '#f8f9fa', marginBottom: '28px' }}>
                Edit Profile
              </h2>
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="fm-label">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="yourusername"
                    className="fm-input"
                    required
                  />
                </div>
                <div>
                  <label className="fm-label">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell other fishermen about yourself..."
                    rows={3}
                    className="fm-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {saveError && (
                  <div style={{ background: 'rgba(180,80,80,0.1)', border: '1px solid rgba(180,80,80,0.25)', borderRadius: '4px', padding: '10px 14px', color: 'rgba(220,100,100,0.9)', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                    {saveError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setEditOpen(false); setSaveError('') }} className="btn-ghost" style={{ padding: '14px 20px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listings */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.3rem', fontWeight: '400', color: '#f8f9fa', marginBottom: '24px' }}>
            {isOwnProfile ? 'Your Listings' : 'Listings'}
          </h2>

          {listings.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', border: '1px solid #162a4a', borderRadius: '6px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.3)', fontWeight: '300', marginBottom: isOwnProfile ? '20px' : '0' }}>
                No listings yet
              </p>
              {isOwnProfile && <Link href="/listings/new" className="btn-primary">List Your Gear</Link>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {listings.map((l) => (
                <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none' }}>
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
                      {l.photo_url ? (
                        <img src={l.photo_url} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'rgba(74,158,255,0.1)' }}><IconPhoto /></span>
                      )}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                      <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', color: '#c9a84c', margin: 0 }}>${Number(l.price).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
