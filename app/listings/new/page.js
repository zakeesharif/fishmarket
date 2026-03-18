'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Rods', 'Reels', 'Lures', 'Line', 'Tackle Boxes', 'Boats', 'Engines', 'Other']
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)

export default function NewListingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'Good',
    location: '',
    category: 'Rods',
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Photo must be under 10MB'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    let photoUrl = null

    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('listing-photos').upload(fileName, photo)
      if (uploadError) { setError('Photo upload failed: ' + uploadError.message); setSubmitting(false); return }
      const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(fileName)
      photoUrl = publicUrl
    }

    const { error: insertError } = await supabase.from('listings').insert({
      user_id: user.id,
      seller_email: user.email,
      title: form.title,
      description: form.description || null,
      price: parseFloat(form.price),
      condition: form.condition,
      location: form.location || null,
      category: form.category,
      photo_url: photoUrl,
    })

    if (insertError) { setError('Failed to create listing: ' + insertError.message); setSubmitting(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/browse'), 2000)
  }

  if (loading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(143,163,184,0.3)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px' }}>
          Loading...
        </div>
      </main>
    )
  }

  if (!user) return null

  if (success) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', fontWeight: '500', color: '#f8f9fa' }}>Listing published</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.5)', fontSize: '14px', fontWeight: '300' }}>Redirecting to browse...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
            List your gear
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.55)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
            Reach thousands of fishing enthusiasts
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Photo Upload */}
          <div>
            <label className="fm-label">Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `1px dashed ${photoPreview ? '#c9a84c' : '#162a4a'}`,
                borderRadius: '4px',
                padding: photoPreview ? '16px' : '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#0f2040',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { if (!photoPreview) e.currentTarget.style.borderColor = '#1e3455' }}
              onMouseLeave={(e) => { if (!photoPreview) e.currentTarget.style.borderColor = '#162a4a' }}
            >
              {photoPreview ? (
                <div>
                  <img src={photoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '3px', objectFit: 'cover' }} />
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.35)', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>Click to change</p>
                </div>
              ) : (
                <>
                  <div style={{ color: 'rgba(74,158,255,0.25)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><IconUpload /></div>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.5)', margin: '0 0 4px', fontSize: '14px', fontWeight: '400' }}>Click to upload a photo</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)', margin: 0, fontSize: '12px' }}>JPG, PNG, WebP — max 10MB</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>

          {/* Title */}
          <div>
            <label className="fm-label">Title <span style={{ color: '#c9a84c' }}>*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Shimano Stradic FL 2500 Spinning Reel" className="fm-input" />
          </div>

          {/* Description */}
          <div>
            <label className="fm-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your item — condition details, what's included, reason for selling..." className="fm-input" style={{ resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          {/* Price + Condition */}
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label className="fm-label">Price (USD) <span style={{ color: '#c9a84c' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(143,163,184,0.4)', fontSize: '14px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>$</span>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" placeholder="0.00" className="fm-input" style={{ paddingLeft: '28px' }} />
              </div>
            </div>
            <div>
              <label className="fm-label">Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="fm-input" style={{ cursor: 'pointer' }}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Category + Location */}
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label className="fm-label">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="fm-input" style={{ cursor: 'pointer' }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="fm-label">Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Miami, FL" className="fm-input" />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(180,80,80,0.1)', border: '1px solid rgba(180,80,80,0.25)', borderRadius: '4px', padding: '12px 16px', color: 'rgba(220,100,100,0.9)', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer', border: 'none' }}>
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
            <Link href="/browse" className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  )
}
