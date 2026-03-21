'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Supabase sends the access token in the URL hash after clicking the reset link
  useEffect(() => {
    const supabase = createClient()
    // Listen for the PASSWORD_RECOVERY event which fires when user lands here via reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also check if already authenticated (token in hash was processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else {
      setSuccess(true)
      setTimeout(() => router.push('/browse'), 2500)
    }
  }

  if (success) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '12px' }}>
              Password updated
            </h2>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: '#8fa3b8', fontSize: '14px', lineHeight: '1.6', fontWeight: '300' }}>
              Redirecting you to browse...
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (!ready) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.4)', fontSize: '14px', marginBottom: '20px' }}>
              Verifying your reset link...
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.25)', fontSize: '13px' }}>
              If nothing happens, your link may have expired.{' '}
              <Link href="/auth/forgot-password" style={{ color: '#4a9eff' }}>Request a new one</Link>
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
              New password
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.55)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
              Choose a strong password for your account
            </p>
          </div>

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="fm-label">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
                className="fm-input"
              />
            </div>

            <div>
              <label className="fm-label">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="fm-input"
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(180,80,80,0.1)', border: '1px solid rgba(180,80,80,0.25)', borderRadius: '4px', padding: '11px 14px', color: 'rgba(220,100,100,0.9)', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '8px' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
