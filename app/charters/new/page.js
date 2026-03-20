'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

export default function NewCharterPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [form, setForm] = useState({
    captain_name: '',
    vessel_name: '',
    location: '',
    price_per_person: '',
    max_passengers: 6,
    duration_hours: 8,
    description: '',
  })
  const [species, setSpecies] = useState([])
  const [speciesInput, setSpeciesInput] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const addSpecies = () => {
    const trimmed = speciesInput.trim()
    if (trimmed && !species.includes(trimmed)) {
      setSpecies(prev => [...prev, trimmed])
    }
    setSpeciesInput('')
  }

  const removeSpecies = (s) => {
    setSpecies(prev => prev.filter(x => x !== s))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.captain_name || !form.location || !form.price_per_person) {
      addToast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    const supabase = createClient()

    let vessel_photo = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `charters/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('charter-photos')
        .upload(path, photoFile, { contentType: photoFile.type, upsert: false })
      if (uploadError) {
        addToast('Photo upload failed: ' + uploadError.message, 'error')
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('charter-photos').getPublicUrl(path)
      vessel_photo = urlData.publicUrl
    }

    const { data, error } = await supabase.from('charters').insert({
      user_id: user.id,
      captain_name: form.captain_name,
      vessel_name: form.vessel_name || null,
      location: form.location,
      price_per_person: parseFloat(form.price_per_person),
      max_passengers: parseInt(form.max_passengers) || 6,
      duration_hours: parseFloat(form.duration_hours) || 8,
      description: form.description || null,
      species_targeted: species.length > 0 ? species : null,
      vessel_photo,
      status: 'active',
      rating: 5.0,
      total_trips: 0,
    }).select().single()

    setSubmitting(false)
    if (error) {
      addToast('Failed to create charter: ' + error.message, 'error')
    } else {
      addToast('Charter listed successfully!', 'success')
      router.push(`/charters/${data.id}`)
    }
  }

  if (authLoading) {
    return (
      <div style={{ background: '#0a1628', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
          <div className="skeleton" style={{ width: '560px', height: '500px', borderRadius: '10px' }} />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500', letterSpacing: '-0.02em' }}>
            List Your Charter
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: 0 }}>
            Share your vessel with anglers looking for their next adventure.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Vessel Photo */}
          <div style={{ marginBottom: '24px' }}>
            <label className="fm-label">Vessel Photo</label>
            <div
              style={{ border: '2px dashed #162a4a', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: '#0f2040', position: 'relative', overflow: 'hidden' }}
              onClick={() => document.getElementById('vessel-photo-input').click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px' }} />
              ) : (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', margin: 0 }}>
                    Click to upload vessel photo
                  </p>
                </>
              )}
              <input id="vessel-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Two-column fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="fm-label">Captain Name <span style={{ color: '#c9a84c' }}>*</span></label>
              <input type="text" name="captain_name" className="fm-input" placeholder="Your name" value={form.captain_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="fm-label">Vessel Name</label>
              <input type="text" name="vessel_name" className="fm-input" placeholder="e.g. Sea Spirit" value={form.vessel_name} onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="fm-label">Location <span style={{ color: '#c9a84c' }}>*</span></label>
            <input type="text" name="location" className="fm-input" placeholder="e.g. Miami, FL" value={form.location} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="fm-label">Price / Person ($) <span style={{ color: '#c9a84c' }}>*</span></label>
              <input type="number" name="price_per_person" className="fm-input" placeholder="150" min="0" value={form.price_per_person} onChange={handleChange} required />
            </div>
            <div>
              <label className="fm-label">Max Passengers</label>
              <input type="number" name="max_passengers" className="fm-input" placeholder="6" min="1" max="50" value={form.max_passengers} onChange={handleChange} />
            </div>
            <div>
              <label className="fm-label">Duration (hours)</label>
              <input type="number" name="duration_hours" className="fm-input" placeholder="8" min="1" step="0.5" value={form.duration_hours} onChange={handleChange} />
            </div>
          </div>

          {/* Species chips */}
          <div style={{ marginBottom: '16px' }}>
            <label className="fm-label">Target Species</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="fm-input"
                placeholder="e.g. Mahi-Mahi"
                value={speciesInput}
                onChange={e => setSpeciesInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecies() } }}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={addSpecies} className="btn-secondary" style={{ whiteSpace: 'nowrap', padding: '0 16px' }}>
                Add
              </button>
            </div>
            {species.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {species.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(74,158,255,0.1)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                    {s}
                    <button type="button" onClick={() => removeSpecies(s)} style={{ background: 'none', border: 'none', color: 'rgba(74,158,255,0.6)', cursor: 'pointer', padding: '0', fontSize: '14px', lineHeight: 1, display: 'flex' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="fm-label">Description</label>
            <textarea
              name="description"
              className="fm-input"
              placeholder="Tell anglers about your vessel, experience, what to expect on the trip..."
              value={form.description}
              onChange={handleChange}
              rows={5}
              style={{ resize: 'vertical', minHeight: '120px' }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: '15px', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Publishing...' : 'Publish Charter Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
