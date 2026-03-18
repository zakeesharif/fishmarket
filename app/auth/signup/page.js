'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) {
    return (
      <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '12px' }}>Check your email</h2>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: '#8fa3b8', fontSize: '14px', lineHeight: '1.6', fontWeight: '300', marginBottom: '28px' }}>
              We sent a confirmation link to{' '}
              <strong style={{ color: '#f8f9fa', fontWeight: '500' }}>{email}</strong>.
              Click it to activate your account.
            </p>
            <Link href="/auth/login" className="btn-ghost">Back to Login</Link>
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
              Create account
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.55)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
              Join thousands of fishing enthusiasts
            </p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="fm-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="fm-input" />
            </div>

            <div>
              <label className="fm-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters" className="fm-input" />
            </div>

            <div>
              <label className="fm-label">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••" className="fm-input" />
            </div>

            {error && (
              <div style={{ background: 'rgba(180,80,80,0.1)', border: '1px solid rgba(180,80,80,0.25)', borderRadius: '4px', padding: '11px 14px', color: 'rgba(220,100,100,0.9)', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', textAlign: 'center', color: 'rgba(143,163,184,0.4)', marginTop: '28px', fontSize: '13px', fontWeight: '300' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#4a9eff', fontWeight: '400' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
