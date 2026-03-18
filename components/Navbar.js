'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      borderBottom: '1px solid #1a7f4f',
      background: '#0a0a0a',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ color: '#1a7f4f', fontSize: '1.8rem', fontWeight: '700', cursor: 'pointer' }}>🎣 FishMarket</span>
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link href="/browse" style={{ color: '#aaa', textDecoration: 'none', fontSize: '15px' }}>Browse</Link>

        {user && (
          <Link href="/listings/new" style={{ color: '#aaa', textDecoration: 'none', fontSize: '15px' }}>Sell Gear</Link>
        )}

        {!loading && (
          user ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: '13px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: '#aaa',
                  border: '1px solid #333',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link href="/auth/login" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
              <Link href="/auth/signup">
                <button style={{
                  background: '#1a7f4f',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  )
}
