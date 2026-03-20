'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const SPECIES_LIST = [
  'Striped Bass', 'Bluefish', 'Mahi-Mahi', 'Yellowfin Tuna', 'Bluefin Tuna',
  'Snook', 'Red Drum', 'Tarpon', 'False Albacore', 'Wahoo', 'Sailfish', 'Marlin',
  'Fluke', 'Black Sea Bass', 'Grouper', 'Snapper', 'Trout', 'Largemouth Bass',
  'Smallmouth Bass', 'Salmon', 'Steelhead', 'Pike', 'Walleye',
]

const IconPhoto = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)

export default function NewCatchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const fileInputRef = useRef(null)

  const [species, setSpecies] = useState('')
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [location, setLocation] = useState('')
  const [rod, setRod] = useState('')
  const [reel, setReel] = useState('')
  const [lureBait, setLureBait] = useState('')
  const [caption, setCaption] = useState('')
  const [dateCaught, setDateCaught] = useState(() => new Date().toISOString().split('T')[0])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { addToast('Please select an image file', 'error'); return }
    if (file.size > 10 * 1024 * 1024) { addToast('Photo must be under 10MB', 'error'); return }
    setPhoto(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  function handlePhotoChange(e) { handleFile(e.target.files[0]) }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!species.trim()) { addToast('Species is required', 'error'); return }
    if (!photo) { addToast('A photo is required', 'error'); return }

    setSubmitting(true)
    try {
      const supabase = createClient()
      let photo_url = null

      // Upload photo
      const ext = photo.name.split('.').pop()
      const path = `catches/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('catch-photos')
        .upload(path, photo, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('catch-photos').getPublicUrl(path)
      photo_url = publicUrl

      // Insert catch
      const { data: newCatch, error: insertError } = await supabase.from('catches').insert({
        user_id: user.id,
        species: species.trim(),
        weight_lbs: weight ? parseFloat(weight) : null,
        length_inches: length ? parseFloat(length) : null,
        location: location.trim() || null,
        rod: rod.trim() || null,
        reel: reel.trim() || null,
        lure_bait: lureBait.trim() || null,
        caption: caption.trim() || null,
        photo_url,
        likes: 0,
      }).select().single()

      if (insertError) throw insertError
      addToast('Catch logged!', 'success')
      router.push(`/catches/${newCatch.id}`)
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error')
      setSubmitting(false)
    }
  }

  if (authLoading || !user) return null

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 32px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/catches"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.35)', letterSpacing: '0.04em', marginBottom: '24px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#8fa3b8'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(143,163,184,0.35)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Catches
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Log a Catch
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300', color: 'rgba(143,163,184,0.4)', margin: 0 }}>
            Share your catch with the Seaitall community
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Photo upload */}
          <div>
            <label className="fm-label">Photo <span style={{ color: '#c9a84c' }}>*</span></label>
            <div
              onClick={() => !photoPreview && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              style={{
                width: '100%',
                height: photoPreview ? '320px' : '200px',
                border: `2px dashed ${dragging ? '#c9a84c' : photoPreview ? '#162a4a' : '#1e3455'}`,
                borderRadius: '6px',
                background: dragging ? 'rgba(201,168,76,0.05)' : '#0f2040',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
                cursor: photoPreview ? 'default' : 'pointer',
                transition: 'border-color 0.18s, background 0.18s',
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(143,163,184,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <IconPhoto />
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', margin: '0 0 4px', letterSpacing: '0.02em' }}>
                      Drag & drop or click to upload
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.15)', margin: 0 }}>
                      JPG, PNG, WEBP — max 10MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                    className="btn-secondary"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 16px' }}
                  >
                    <IconUpload /> Choose Photo
                  </button>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            {photoPreview && (
              <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null) }} style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', letterSpacing: '0.04em', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#8fa3b8'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(143,163,184,0.3)'}
              >
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
              onChange={e => setSpecies(e.target.value)}
              placeholder="e.g. Striped Bass"
              className="fm-input"
              list="species-datalist"
              required
            />
            <datalist id="species-datalist">
              {SPECIES_LIST.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          {/* Weight + Length row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="fm-label">Weight (lbs)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="28.5" className="fm-input" min="0" step="0.1" style={{ paddingRight: '44px' }} />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.3)' }}>lbs</span>
              </div>
            </div>
            <div>
              <label className="fm-label">Length (inches)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="32.0" className="fm-input" min="0" step="0.1" style={{ paddingRight: '44px' }} />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.3)' }}>in</span>
              </div>
            </div>
          </div>

          {/* Location + Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="fm-label">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Montauk, NY" className="fm-input" />
            </div>
            <div>
              <label className="fm-label">Date Caught</label>
              <input type="date" value={dateCaught} onChange={e => setDateCaught(e.target.value)} className="fm-input" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Gear section — 2 column */}
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 16px' }}>
              Gear Used
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="fm-label">Rod</label>
                <input type="text" value={rod} onChange={e => setRod(e.target.value)} placeholder="e.g. St. Croix Mojo" className="fm-input" />
              </div>
              <div>
                <label className="fm-label">Reel</label>
                <input type="text" value={reel} onChange={e => setReel(e.target.value)} placeholder="e.g. Van Staal VR75" className="fm-input" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="fm-label">Lure / Bait</label>
                <input type="text" value={lureBait} onChange={e => setLureBait(e.target.value)} placeholder="e.g. SP Minnow, Bunker, Poppers" className="fm-input" />
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="fm-label">Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Tell us about the catch — conditions, the story, how it fought..."
              className="fm-input"
              rows={4}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer', border: 'none' }}
            >
              {submitting ? 'Logging catch...' : 'Log Catch'}
            </button>
            <Link href="/catches" className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  )
}
