'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/browse'); router.refresh() }
  }

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '8px' }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.55)', fontSize: '14px', fontWeight: '300', margin: 0 }}>
              Sign in to your Seaitall account
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="fm-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="fm-input" />
            </div>

            <div>
              <label className="fm-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="fm-input" />
            </div>

            {error && (
              <div style={{ background: 'rgba(180,80,80,0.1)', border: '1px solid rgba(180,80,80,0.25)', borderRadius: '4px', padding: '11px 14px', color: 'rgba(220,100,100,0.9)', fontSize: '13px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', textAlign: 'center', color: 'rgba(143,163,184,0.4)', marginTop: '28px', fontSize: '13px', fontWeight: '300' }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: '#4a9eff', fontWeight: '400' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
