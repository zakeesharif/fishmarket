'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

const SPECIES_SUGGESTIONS = [
  'Striped Bass', 'Bluefish', 'Fluke / Summer Flounder', 'Black Sea Bass',
  'Weakfish', 'Red Drum / Redfish', 'Snook', 'Tarpon', 'Mahi-Mahi', 'Yellowfin Tuna',
  'Bluefin Tuna', 'Yellowtail', 'Mako Shark', 'Wahoo', 'Sailfish', 'Marlin',
  'Largemouth Bass', 'Smallmouth Bass', 'Rainbow Trout', 'Brown Trout',
]

const IconPhoto = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

export default function NewCatchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [species, setSpecies] = useState('')
  const [weight, setWeight] = useState('')
  const [location, setLocation] = useState('')
  const [gearUsed, setGearUsed] = useState('')
  const [dateCaught, setDateCaught] = useState('')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10MB')
      return
    }
    setPhoto(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!species.trim()) { setError('Species is required'); return }
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      let photo_url = null

      if (photo) {
        const ext = photo.name.split('.').pop()
        const path = `catches/${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(path, photo, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(path)
        photo_url = publicUrl
      }

      const { error: insertError } = await supabase.from('catches').insert({
        user_id: user.id,
        species: species.trim(),
        weight_lbs: weight ? parseFloat(weight) : null,
        location: location.trim() || null,
        gear_used: gearUsed.trim() || null,
        caption: caption.trim() || null,
        photo_url,
      })
      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => router.push('/catches'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !user) return null

  if (success) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', color: '#f8f9fa', marginBottom: '8px' }}>Catch logged.</p>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.45)', fontWeight: '300' }}>Redirecting to the catch log…</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 32px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/catches" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', letterSpacing: '0.04em', marginBottom: '24px', transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#8fa3b8'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.35)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Catches
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '6px', letterSpacing: '-0.01em' }}>
            Log a Catch
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300', color: 'rgba(143,163,184,0.4)', margin: 0 }}>
            Share your catch with the Seaitall community
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(180,80,80,0.08)', border: '1px solid rgba(180,80,80,0.2)', borderRadius: '4px', padding: '12px 16px', marginBottom: '24px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(220,100,100,0.85)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Photo upload */}
          <div>
            <label className="fm-label">Photo</label>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              <div style={{
                width: '100%',
                height: photoPreview ? '260px' : '180px',
                border: `1px dashed ${photoPreview ? '#162a4a' : '#1e3455'}`,
                borderRadius: '4px',
                background: '#0f2040',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                transition: 'border-color 0.18s',
              }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'rgba(143,163,184,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <IconPhoto />
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', letterSpacing: '0.04em' }}>
                      Click to upload a photo
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.15)' }}>
                      JPG, PNG, WEBP — max 10MB
                    </span>
                  </div>
                )}
              </div>
            </label>
            {photoPreview && (
              <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null) }} style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', letterSpacing: '0.04em' }}>
                Remove photo
              </button>
            )}
          </div>

          {/* Species */}
          <div>
            <label className="fm-label">Species <span style={{ color: '#c9a84c' }}>*</span></label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Striped Bass"
              className="fm-input"
              required
              list="species-list"
            />
            <datalist id="species-list">
              {SPECIES_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          {/* Weight + Location row */}
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="fm-label">Weight (lbs)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="28.5"
                  className="fm-input"
                  min="0"
                  step="0.1"
                  style={{ paddingRight: '40px' }}
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.3)' }}>lbs</span>
              </div>
            </div>
            <div>
              <label className="fm-label">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Montauk, NY"
                className="fm-input"
              />
            </div>
          </div>

          {/* Gear used */}
          <div>
            <label className="fm-label">Rod & Reel Used</label>
            <input
              type="text"
              value={gearUsed}
              onChange={(e) => setGearUsed(e.target.value)}
              placeholder="e.g. St. Croix Mojo Surf + Van Staal VR75"
              className="fm-input"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="fm-label">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell us about the catch — conditions, bait, the story..."
              className="fm-input"
              rows={4}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Logging catch...' : 'Log Catch'}
            </button>
            <Link href="/catches" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
