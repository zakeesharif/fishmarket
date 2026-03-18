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

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/browse')
      router.refresh()
    }
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{
          background: '#111',
          border: '1px solid #1a7f4f',
          borderRadius: '20px',
          padding: '48px',
          width: '100%',
          maxWidth: '420px',
          boxSizing: 'border-box',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎣</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 8px' }}>Welcome back</h2>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Sign in to your FishMarket account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '13px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '13px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 60, 60, 0.08)',
                border: '1px solid rgba(255, 60, 60, 0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#ff6b6b',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#0f4f30' : '#1a7f4f',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#555', marginTop: '28px', fontSize: '14px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#1a7f4f', textDecoration: 'none', fontWeight: '600' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
