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

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
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
            textAlign: 'center',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📬</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '12px', color: '#1a7f4f' }}>Check your email</h2>
            <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              We sent a confirmation link to <strong style={{ color: 'white' }}>{email}</strong>.
              Click it to activate your account.
            </p>
            <Link href="/auth/login">
              <button style={{
                background: 'transparent',
                color: '#1a7f4f',
                border: '1px solid #1a7f4f',
                padding: '12px 28px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
              }}>
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
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
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 8px' }}>Create account</h2>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Join thousands of fishing enthusiasts</p>
          </div>

          <form onSubmit={handleSignup}>
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '13px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
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
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#555', marginTop: '28px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#1a7f4f', textDecoration: 'none', fontWeight: '600' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
