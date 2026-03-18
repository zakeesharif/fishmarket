'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Rods', 'Reels', 'Lures', 'Line', 'Tackle Boxes', 'Boats', 'Engines', 'Other']
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

const inputStyle = {
  width: '100%',
  background: '#0f0f0f',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  padding: '14px 16px',
  color: 'white',
  fontSize: '15px',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'sans-serif',
}

const labelStyle = {
  display: 'block',
  color: '#888',
  marginBottom: '8px',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

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
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10MB')
      return
    }
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
      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, photo)

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message)
        setSubmitting(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(fileName)

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

    if (insertError) {
      setError('Failed to create listing: ' + insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/browse'), 2000)
  }

  if (loading) {
    return (
      <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ color: '#444' }}>Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) return null

  if (success) {
    return (
      <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a7f4f', margin: 0 }}>Listing Published!</h2>
          <p style={{ color: '#555', margin: 0 }}>Redirecting you to browse...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <Navbar />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 8px' }}>List Your Gear</h1>
          <p style={{ color: '#555', margin: 0, fontSize: '15px' }}>
            Reach thousands of fishing enthusiasts
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Photo Upload */}
          <div>
            <label style={labelStyle}>Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${photoPreview ? '#1a7f4f' : '#2a2a2a'}`,
                borderRadius: '14px',
                padding: photoPreview ? '16px' : '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#0f0f0f',
                transition: 'border-color 0.2s',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => { if (!photoPreview) e.currentTarget.style.borderColor = '#1a7f4f' }}
              onMouseLeave={(e) => { if (!photoPreview) e.currentTarget.style.borderColor = '#2a2a2a' }}
            >
              {photoPreview ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <p style={{ color: '#555', fontSize: '13px', marginTop: '10px', marginBottom: 0 }}>
                    Click to change photo
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📸</div>
                  <p style={{ color: '#555', margin: '0 0 4px', fontSize: '15px' }}>Click to upload a photo</p>
                  <p style={{ color: '#333', margin: 0, fontSize: '12px' }}>JPG, PNG, WebP — max 10MB</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>
              Title <span style={{ color: '#1a7f4f' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Shimano Stradic FL 2500 Spinning Reel"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your item — include condition details, what's included, reason for selling..."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
            />
          </div>

          {/* Price + Condition */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>
                Price (USD) <span style={{ color: '#1a7f4f' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '15px' }}>$</span>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{ ...inputStyle, paddingLeft: '30px' }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Condition</label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Miami, FL"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(255, 60, 60, 0.08)',
              border: '1px solid rgba(255, 60, 60, 0.3)',
              borderRadius: '10px',
              padding: '14px 16px',
              color: '#ff6b6b',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                background: submitting ? '#0f4f30' : '#1a7f4f',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'background 0.2s',
              }}
            >
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
            <Link href="/browse">
              <button
                type="button"
                style={{
                  background: 'transparent',
                  color: '#555',
                  border: '1px solid #2a2a2a',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
