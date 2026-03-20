'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const FISHING_TYPES = [
  { id: 'freshwater', label: 'Freshwater', emoji: '🎣' },
  { id: 'saltwater_inshore', label: 'Saltwater Inshore', emoji: '🌊' },
  { id: 'surf', label: 'Surf Fishing', emoji: '🏄' },
  { id: 'offshore', label: 'Offshore', emoji: '⛵' },
  { id: 'fly', label: 'Fly Fishing', emoji: '🪰' },
  { id: 'ice', label: 'Ice Fishing', emoji: '🧊' },
  { id: 'kayak', label: 'Kayak Fishing', emoji: '🛶' },
  { id: 'charter_captain', label: 'Charter Captain', emoji: '⚓' },
]

function FishSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 30 C10 10 35 5 60 15 C75 20 85 25 90 30 C85 35 75 40 60 45 C35 55 10 50 10 30Z" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" strokeWidth="1.5"/>
      <path d="M90 30 L100 20 L100 40 Z" fill="#c9a84c" opacity="0.5"/>
      <circle cx="25" cy="27" r="4" fill="rgba(201,168,76,0.6)"/>
      <circle cx="24" cy="26" r="1.5" fill="#0a1628"/>
      <path d="M50 18 C55 22 55 38 50 42" stroke="rgba(201,168,76,0.3)" strokeWidth="1" fill="none"/>
      <path d="M65 20 C70 24 70 36 65 40" stroke="rgba(201,168,76,0.3)" strokeWidth="1" fill="none"/>
    </svg>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle | checking | available | taken | invalid
  const [fishingTypes, setFishingTypes] = useState([])
  const [location, setLocation] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    // Check if already onboarded
    supabase.from('profiles').select('username').eq('id', user.id).single().then(({ data }) => {
      if (data?.username) router.push('/browse')
    })
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkUsername = useCallback((val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = val.trim()
    if (!trimmed) { setUsernameStatus('idle'); return }
    const valid = /^[a-zA-Z0-9_]{3,20}$/.test(trimmed)
    if (!valid) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('username', trimmed).maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }, [supabase])

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    checkUsername(e.target.value)
  }

  const toggleFishingType = (id) => {
    setFishingTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const savePartial = async (data) => {
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, ...data }, { onConflict: 'id' })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const nextStep = async () => {
    if (step === 2) {
      await savePartial({ username: username.trim() })
    }
    if (step === 3) {
      await savePartial({ fishing_types: fishingTypes })
    }
    if (step === 4) {
      await savePartial({ location: location.trim() || null })
    }
    setStep(s => s + 1)
  }

  const finish = async () => {
    setSaving(true)
    let avatar_url = null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('profile-photos')
        .upload(path, avatarFile, { contentType: avatarFile.type, upsert: false })
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    await savePartial({ avatar_url })
    setSaving(false)
    addToast('Welcome to Seaitall!', 'success')
    router.push('/browse')
  }

  const TOTAL_STEPS = 5
  const usernameValid = usernameStatus === 'available'

  const inputBorderColor = () => {
    if (usernameStatus === 'available') return '#4ade80'
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return '#dc5050'
    return '#162a4a'
  }

  if (authLoading || !user) {
    return (
      <div style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '480px', height: '400px', borderRadius: '12px' }} />
      </div>
    )
  }

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8' }}>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#c9a84c', fontWeight: '500' }}>
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div style={{ height: '4px', background: '#162a4a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #c9a84c, #e0b96a)', borderRadius: '2px', width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < step ? '#c9a84c' : '#162a4a', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '12px', padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }} className="animate-fade-up-1">
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <FishSVG />
              </div>
              <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Welcome to Seaitall
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#8fa3b8', margin: '0 0 32px', lineHeight: 1.65, fontWeight: '300' }}>
                The marketplace built for anglers. Buy, sell, share catches, and book fishing charters — all in one place.
              </p>
              <button onClick={() => setStep(2)} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: '15px' }}>
                Let&apos;s get you set up →
              </button>
            </div>
          )}

          {/* Step 2 — Username */}
          {step === 2 && (
            <div className="animate-fade-up-1">
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>Choose your username</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: '0 0 24px', lineHeight: 1.5, fontWeight: '300' }}>
                This is how other anglers will find you. Letters, numbers, and underscores only.
              </p>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="fm-input"
                  placeholder="your_username"
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={20}
                  style={{ border: `1px solid ${inputBorderColor()}`, paddingRight: '36px', fontSize: '15px' }}
                  autoFocus
                />
                {usernameStatus === 'available' && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4ade80', fontSize: '16px' }}>✓</span>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#dc5050', fontSize: '16px' }}>✗</span>
                )}
                {usernameStatus === 'checking' && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8fa3b8', fontSize: '12px' }}>…</span>
                )}
              </div>
              {usernameStatus === 'taken' && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#dc5050', margin: '0 0 16px' }}>Username is already taken.</p>}
              {usernameStatus === 'invalid' && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#dc5050', margin: '0 0 16px' }}>3–20 characters, letters/numbers/underscores only.</p>}
              {usernameStatus === 'available' && <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#4ade80', margin: '0 0 16px' }}>Username is available!</p>}
              {!['taken','invalid','available'].includes(usernameStatus) && <div style={{ marginBottom: '16px' }} />}
              <button onClick={nextStep} disabled={!usernameValid} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', opacity: usernameValid ? 1 : 0.45 }}>
                Next →
              </button>
            </div>
          )}

          {/* Step 3 — Fishing types */}
          {step === 3 && (
            <div className="animate-fade-up-1">
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>What kind of fishing do you do?</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: '0 0 24px', fontWeight: '300' }}>Select all that apply.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {FISHING_TYPES.map(ft => {
                  const selected = fishingTypes.includes(ft.id)
                  return (
                    <button
                      key={ft.id}
                      type="button"
                      onClick={() => toggleFishingType(ft.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 14px', borderRadius: '8px',
                        border: selected ? '1px solid rgba(201,168,76,0.5)' : '1px solid #162a4a',
                        background: selected ? 'rgba(201,168,76,0.08)' : 'transparent',
                        color: selected ? '#c9a84c' : '#8fa3b8',
                        fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{ft.emoji}</span>
                      <span>{ft.label}</span>
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={nextStep} className="btn-ghost" style={{ flex: 1, padding: '11px', fontSize: '14px' }}>Skip</button>
                <button onClick={nextStep} className="btn-primary" style={{ flex: 2, padding: '11px', fontSize: '14px' }}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 4 — Location */}
          {step === 4 && (
            <div className="animate-fade-up-1">
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>Where do you fish?</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: '0 0 24px', fontWeight: '300' }}>
                Help local anglers find you. Optional.
              </p>
              <input
                type="text"
                className="fm-input"
                placeholder="e.g. Miami, FL or Gulf Coast"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ marginBottom: '24px', fontSize: '15px' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={nextStep} className="btn-ghost" style={{ flex: 1, padding: '11px', fontSize: '14px' }}>Skip</button>
                <button onClick={nextStep} className="btn-primary" style={{ flex: 2, padding: '11px', fontSize: '14px' }}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 5 — Profile photo */}
          {step === 5 && (
            <div className="animate-fade-up-1">
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>Add a profile photo</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', margin: '0 0 24px', fontWeight: '300' }}>
                Show off your best catch or just your face. Optional.
              </p>
              <div
                style={{ border: '2px dashed #162a4a', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#0a1628', marginBottom: '24px', transition: 'border-color 0.2s' }}
                onClick={() => document.getElementById('avatar-upload').click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#162a4a'}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #c9a84c', marginBottom: '8px' }} />
                ) : (
                  <>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#162a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px' }}>👤</div>
                  </>
                )}
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', margin: 0 }}>
                  {avatarPreview ? 'Click to change photo' : 'Click to upload photo'}
                </p>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={finish} disabled={saving} className="btn-ghost" style={{ flex: 1, padding: '11px', fontSize: '14px' }}>Skip</button>
                <button onClick={finish} disabled={saving} className="btn-primary" style={{ flex: 2, padding: '11px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Setting up...' : "Let's Go! 🎣"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
