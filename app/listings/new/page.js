'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

const CATEGORIES = [
  { name: 'Rods',         desc: 'Spinning, casting, fly rods',  icon: RodIcon },
  { name: 'Reels',        desc: 'Spinning, baitcasting, fly',   icon: ReelIcon },
  { name: 'Lures',        desc: 'Soft plastics, hard baits',    icon: LureIcon },
  { name: 'Line',         desc: 'Mono, fluoro, braid',          icon: LineIcon },
  { name: 'Tackle Boxes', desc: 'Storage & organization',       icon: TackleIcon },
  { name: 'Boats',        desc: 'Aluminum, fiberglass, inflatables', icon: BoatIcon },
  { name: 'Engines',      desc: 'Outboards, trolling motors',   icon: EngineIcon },
  { name: 'Other',        desc: 'Accessories & misc gear',      icon: OtherIcon },
]
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const CONDITION_COLORS = {
  'New':      { bg: 'rgba(74,158,255,0.12)', text: '#4a9eff', border: 'rgba(74,158,255,0.25)' },
  'Like New': { bg: 'rgba(74,158,255,0.08)', text: 'rgba(74,158,255,0.8)', border: 'rgba(74,158,255,0.18)' },
  'Good':     { bg: 'rgba(201,168,76,0.1)',  text: '#c9a84c', border: 'rgba(201,168,76,0.25)' },
  'Fair':     { bg: 'rgba(200,160,80,0.08)', text: 'rgba(200,160,80,0.8)', border: 'rgba(200,160,80,0.2)' },
  'Poor':     { bg: 'rgba(180,80,80,0.1)',   text: 'rgba(220,100,100,0.9)', border: 'rgba(180,80,80,0.25)' },
}
const CATEGORY_PHOTOS = {
  'Rods':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'Reels':        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'Lures':        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
  'Boats':        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop',
  'Engines':      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop',
  'Tackle Boxes': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
  'Line':         'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
  'Other':        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
}
const DRAFT_KEY = 'seaitall_listing_draft'
const TOTAL_STEPS = 5

// ── SVG Icons ──────────────────────────────────────────────────────────────────
function RodIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="20" y2="4"/>
      <polyline points="14 4 20 4 20 10"/>
      <circle cx="7" cy="17" r="2"/>
    </svg>
  )
}
function ReelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="3" x2="12" y2="9"/>
      <line x1="12" y1="15" x2="12" y2="21"/>
      <line x1="3" y1="12" x2="9" y2="12"/>
      <line x1="15" y1="12" x2="21" y2="12"/>
    </svg>
  )
}
function LureIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c0-3 4-7 8-7s8 4 8 7"/>
      <path d="M10 12c0 1.1.9 2 2 2s2-.9 2-2"/>
      <path d="M18 12l3 3-3 3"/>
    </svg>
  )
}
function LineIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 0 1 9 9"/>
      <path d="M12 3a9 9 0 0 0-9 9"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 15v6"/>
    </svg>
  )
}
function TackleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="9" y1="5" x2="9" y2="19"/>
      <line x1="15" y1="5" x2="15" y2="19"/>
    </svg>
  )
}
function BoatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l2-8h14l2 8"/>
      <path d="M5 17H3a9 9 0 0 0 18 0h-2"/>
      <line x1="12" y1="9" x2="12" y2="3"/>
      <path d="M9 6h6"/>
    </svg>
  )
}
function EngineIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="14" height="8" rx="2"/>
      <path d="M17 12h2a2 2 0 0 1 0 4h-2"/>
      <path d="M7 8V6"/>
      <path d="M11 8V5"/>
    </svg>
  )
}
function OtherIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <circle cx="19" cy="5" r="2"/>
      <circle cx="5" cy="19" r="2"/>
      <line x1="10.5" y1="10.5" x2="6.5" y2="18"/>
      <line x1="13.5" y1="13.5" x2="17.5" y2="6"/>
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  )
}
function CheckIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function NewListingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const fileRef = useRef(null)
  const dropRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [photos, setPhotos] = useState([]) // Array of { file: File, preview: string }
  const [form, setForm] = useState({ title: '', description: '', condition: 'Good', price: '', location: '' })
  const [errors, setErrors] = useState({})
  const [publishing, setPublishing] = useState(false)
  const [publishedListing, setPublishedListing] = useState(null)

  // ── Auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  // ── Draft: restore on mount ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft.category) setCategory(draft.category)
      if (draft.form) setForm(f => ({ ...f, ...draft.form }))
      if (draft.step && draft.step > 1 && draft.step < 5) setStep(draft.step)
    } catch {}
  }, [])

  // ── Draft: save on step/form/category change ───────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, category, form }))
    } catch {}
  }, [step, category, form])

  // ── Drag and drop handlers ─────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    addPhotos(files)
  }, [photos])

  const addPhotos = (files) => {
    const remaining = 8 - photos.length
    const toAdd = files.slice(0, remaining)
    if (toAdd.length === 0) { addToast('Maximum 8 photos allowed', 'error'); return }
    const oversized = toAdd.filter(f => f.size > 10 * 1024 * 1024)
    if (oversized.length > 0) { addToast('Each photo must be under 10MB', 'error'); return }
    const newPhotos = toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (index) => {
    setPhotos(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  // ── Step validation ────────────────────────────────────────────────────────
  const validateStep3 = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters'
    if (!form.price) errs.price = 'Price is required'
    else if (isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Enter a valid price'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => {
    if (step === 3 && !validateStep3()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Publish ────────────────────────────────────────────────────────────────
  const publish = async () => {
    if (!user) return
    setPublishing(true)

    try {
      const supabase = createClient()
      const uploadedUrls = []

      // Upload photos to Supabase Storage
      for (let i = 0; i < photos.length; i++) {
        const { file } = photos[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${i}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('listing-photos').upload(path, file)
        if (uploadErr) throw new Error(`Photo ${i + 1} upload failed: ${uploadErr.message}`)
        const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path)
        uploadedUrls.push(publicUrl)
      }

      const { data: inserted, error: insertErr } = await supabase.from('listings').insert({
        user_id: user.id,
        seller_email: user.email,
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        condition: form.condition,
        location: form.location.trim() || null,
        category,
        photo_url: uploadedUrls[0] || null,
      }).select('id').single()

      if (insertErr) throw new Error(insertErr.message)

      // Clear draft
      try { localStorage.removeItem(DRAFT_KEY) } catch {}

      setPublishedListing(inserted)
      setStep(5)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      addToast(err.message || 'Failed to publish listing', 'error')
      setPublishing(false)
    }
  }

  // ── Loading / unauthenticated guard ───────────────────────────────────────
  if (authLoading) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(143,163,184,0.3)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px' }}>
          Loading...
        </div>
      </main>
    )
  }
  if (!user) return null

  const previewPhoto = photos[0]?.preview || (category ? CATEGORY_PHOTOS[category] : null)
  const condColors = CONDITION_COLORS[form.condition] || CONDITION_COLORS['Good']

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        {step < 5 && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.4)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Step {step} of {TOTAL_STEPS - 1}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.3)', margin: 0 }}>
                {['', 'Category', 'Photos', 'Details', 'Preview'][step]}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '3px' }}>
              {[1, 2, 3, 4].map(s => (
                <div key={s} style={{ flex: 1, borderRadius: '2px', background: s <= step ? '#c9a84c' : 'rgba(22,42,74,0.8)', transition: 'background 0.3s ease' }} />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 1 — Category
        ════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="animate-fade-up-1">
            <div style={{ marginBottom: '36px' }}>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
                What are you selling?
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.45)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
                Choose the category that best fits your item.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '36px' }}>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const selected = category === cat.name
                return (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    style={{
                      background: selected ? 'rgba(201,168,76,0.07)' : '#0f2040',
                      border: `1.5px solid ${selected ? '#c9a84c' : '#162a4a'}`,
                      borderRadius: '6px',
                      padding: '20px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = '#1e3455'; e.currentTarget.style.background = 'rgba(15,32,64,0.9)' } }}
                    onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.background = '#0f2040' } }}
                  >
                    {selected && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', color: '#c9a84c' }}>
                        <CheckIcon size={14} />
                      </span>
                    )}
                    <div style={{ color: selected ? '#c9a84c' : 'rgba(143,163,184,0.45)', marginBottom: '10px' }}>
                      <Icon />
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: selected ? '#c9a84c' : '#f8f9fa', margin: '0 0 4px' }}>
                      {cat.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.35)', margin: 0, fontWeight: '300', lineHeight: 1.4 }}>
                      {cat.desc}
                    </p>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={goNext}
                disabled={!category}
                className="btn-primary"
                style={{ border: 'none', cursor: category ? 'pointer' : 'not-allowed', opacity: category ? 1 : 0.35, minWidth: '140px' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 2 — Photos
        ════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="animate-fade-up-1">
            <div style={{ marginBottom: '36px' }}>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
                Add photos
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.45)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
                Up to 8 photos. The first photo will be your cover. Better photos sell faster.
              </p>
            </div>

            {/* Drop zone */}
            <div
              ref={dropRef}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#c9a84c' : photos.length > 0 ? 'rgba(201,168,76,0.3)' : '#162a4a'}`,
                borderRadius: '6px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: photos.length >= 8 ? 'not-allowed' : 'pointer',
                background: isDragging ? 'rgba(201,168,76,0.04)' : '#0f2040',
                transition: 'all 0.2s',
                marginBottom: '16px',
              }}
            >
              <div style={{ color: isDragging ? '#c9a84c' : 'rgba(74,158,255,0.25)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <UploadIcon />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.55)', margin: '0 0 6px', fontSize: '14px', fontWeight: '400' }}>
                {isDragging ? 'Drop photos here' : 'Click or drag photos here'}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)', margin: 0, fontSize: '12px' }}>
                JPG, PNG, WebP — max 10MB each · {photos.length}/8 added
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileRef}
              style={{ display: 'none' }}
              onChange={e => { addPhotos(Array.from(e.target.files)); e.target.value = '' }}
            />

            {/* Photo previews */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', width: '90px', height: '70px', borderRadius: '4px', overflow: 'hidden', border: `2px solid ${i === 0 ? '#c9a84c' : '#162a4a'}`, flexShrink: 0 }}>
                    <Image src={p.preview} alt={`Photo ${i + 1}`} fill sizes="90px" style={{ objectFit: 'cover' }} />
                    {i === 0 && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,168,76,0.85)', padding: '2px 0', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '9px', fontWeight: '600', color: '#0a1628', letterSpacing: '0.06em' }}>COVER</span>
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); removePhoto(i) }}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(10,22,40,0.8)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f8f9fa', padding: 0 }}
                    >
                      <XIcon size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
              <button onClick={goBack} className="btn-ghost" style={{ cursor: 'pointer' }}>← Back</button>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {photos.length === 0 && (
                  <button onClick={goNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(143,163,184,0.4)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', padding: '12px 0' }}>
                    Skip for now
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={false}
                  className="btn-primary"
                  style={{ border: 'none', cursor: 'pointer', minWidth: '140px' }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 3 — Details
        ════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="animate-fade-up-1">
            <div style={{ marginBottom: '36px' }}>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
                Describe your item
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.45)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
                Be specific — good descriptions get more inquiries.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Title */}
              <div>
                <label className="fm-label">Title <span style={{ color: '#c9a84c' }}>*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })) }}
                  placeholder="e.g. Shimano Stradic FL 2500 Spinning Reel — barely used"
                  className="fm-input"
                  style={{ borderColor: errors.title ? 'rgba(220,100,100,0.4)' : undefined }}
                />
                {errors.title && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(220,100,100,0.8)', margin: '6px 0 0' }}>{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="fm-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your item — condition details, included accessories, reason for selling, specs..."
                  rows={5}
                  className="fm-input"
                  style={{ resize: 'vertical', lineHeight: 1.65, minHeight: '120px' }}
                />
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)', margin: '5px 0 0', textAlign: 'right' }}>
                  {form.description.length} chars
                </p>
              </div>

              {/* Condition + Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="fm-label">Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                    className="fm-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fm-label">Price (USD) <span style={{ color: '#c9a84c' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(143,163,184,0.4)', fontSize: '14px', fontFamily: 'var(--font-dm-sans, sans-serif)', pointerEvents: 'none' }}>$</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(er => ({ ...er, price: '' })) }}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="fm-input"
                      style={{ paddingLeft: '28px', borderColor: errors.price ? 'rgba(220,100,100,0.4)' : undefined }}
                    />
                  </div>
                  {errors.price && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(220,100,100,0.8)', margin: '6px 0 0' }}>{errors.price}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="fm-label">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Miami, FL"
                  className="fm-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
              <button onClick={goBack} className="btn-ghost" style={{ cursor: 'pointer' }}>← Back</button>
              <button onClick={goNext} className="btn-primary" style={{ border: 'none', cursor: 'pointer', minWidth: '140px' }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 4 — Preview
        ════════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="animate-fade-up-1">
            <div style={{ marginBottom: '36px' }}>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
                Preview your listing
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.45)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
                This is how your listing will appear to buyers.
              </p>
            </div>

            {/* Mock listing card */}
            <div style={{ maxWidth: '320px', margin: '0 auto 40px', background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', overflow: 'hidden' }}>
              {/* Photo */}
              <div style={{ height: '220px', background: '#0a1628', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewPhoto ? (
                  <Image src={previewPhoto} alt={form.title || 'Preview'} fill sizes="320px" style={{ objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'rgba(74,158,255,0.1)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </span>
                )}
                {/* Category badge */}
                <span className="category-badge" style={{ position: 'absolute', top: '10px', left: '10px' }}>{category}</span>
                {/* Condition badge */}
                {form.condition && (
                  <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: condColors.bg, color: condColors.text, border: `1px solid ${condColors.border}`, padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)', backdropFilter: 'blur(4px)' }}>
                    {form.condition}
                  </span>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: '16px' }}>
                <h3 className="truncate-2" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '500', color: '#f8f9fa', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {form.title || 'Your listing title'}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '18px', color: '#c9a84c', fontWeight: '500' }}>
                    {form.price ? `$${Number(form.price).toLocaleString()}` : '$—'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>Just now</span>
                </div>
                {form.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(143,163,184,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>{form.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Publishing note */}
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '6px', padding: '16px 20px', marginBottom: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(201,168,76,0.7)', margin: 0 }}>
                Looks good? Your listing will go live immediately and be visible to thousands of buyers.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={goBack} className="btn-ghost" style={{ cursor: 'pointer' }}>← Back</button>
              <button
                onClick={publish}
                disabled={publishing}
                className="btn-primary"
                style={{ border: 'none', cursor: publishing ? 'not-allowed' : 'pointer', opacity: publishing ? 0.7 : 1, minWidth: '180px' }}
              >
                {publishing ? 'Publishing…' : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 5 — Success
        ════════════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="animate-fade-up-1" style={{ textAlign: 'center', padding: '40px 24px' }}>
            {/* Animated gold checkmark */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}>
              <span style={{ color: '#c9a84c' }}><CheckIcon size={36} /></span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '12px' }}>
              Your listing is live!
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: 'rgba(143,163,184,0.55)', fontWeight: '300', maxWidth: '400px', margin: '0 auto 36px', lineHeight: 1.65 }}>
              Buyers can now find <strong style={{ color: '#f8f9fa', fontWeight: '500' }}>{form.title}</strong> on Seaitall. Share it to reach more buyers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', maxWidth: '320px', margin: '0 auto' }}>
              {publishedListing && (
                <Link href={`/listings/${publishedListing.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  View My Listing
                </Link>
              )}
              <Link href="/browse" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Browse All Gear
              </Link>
              <button
                onClick={() => {
                  if (publishedListing) {
                    const url = `${window.location.origin}/listings/${publishedListing.id}`
                    navigator.clipboard.writeText(url).then(() => addToast('Link copied!', 'success')).catch(() => {})
                  }
                }}
                style={{ background: 'none', border: '1px solid #162a4a', borderRadius: '4px', padding: '10px 24px', cursor: 'pointer', color: 'rgba(143,163,184,0.45)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', transition: 'all 0.15s', width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3455'; e.currentTarget.style.color = 'rgba(143,163,184,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#162a4a'; e.currentTarget.style.color = 'rgba(143,163,184,0.45)' }}
              >
                Copy listing link
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.2)', margin: '40px 0 0' }}>
              Want to list another item?{' '}
              <button
                onClick={() => {
                  setStep(1); setCategory(''); setPhotos([]); setForm({ title: '', description: '', condition: 'Good', price: '', location: '' }); setErrors({}); setPublishedListing(null)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(201,168,76,0.5)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', padding: 0, textDecoration: 'underline' }}
              >
                Start over
              </button>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 600px) {
          .step1-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  )
}
