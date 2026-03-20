'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

function CatchCard({ catch: c }) {
  return (
    <div
      style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#162a4a'}
    >
      <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0a1628, #0f2040)' }}>
        {c.photo_url ? (
          <img src={c.photo_url} alt={c.species} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(201,168,76,0.06)', fontSize: '72px' }}>
            🎣
          </div>
        )}
        {c.weight_lbs && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(10,22,40,0.88)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', border: '1px solid rgba(201,168,76,0.3)', padding: '4px 12px', borderRadius: '2px', fontFamily: 'var(--font-playfair, serif)', fontSize: '13px', color: '#c9a84c', fontWeight: '500' }}>
            {c.weight_lbs} lbs
          </div>
        )}
      </div>

      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.1rem', fontWeight: '500', color: '#f8f9fa', margin: 0, letterSpacing: '-0.01em' }}>
            {c.species}
          </h3>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.35)', whiteSpace: 'nowrap' }}>
            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {c.caption && (
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.55)', margin: '0 0 12px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '300' }}>
            {c.caption}
          </p>
        )}

        {c.gear_used && (
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.35)', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            🎣 {c.gear_used}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(143,163,184,0.38)', fontSize: '11px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
            {c.location && <><IconPin /> {c.location}</>}
          </span>
          <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.3)' }}>
            {c.username || 'Angler'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CatchesPage() {
  const { user } = useAuth()
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data, error } = await supabase
        .from('catches')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) { setError(error.message); setLoading(false); return }

      const records = data || []
      if (records.length === 0) { setCatches([]); setLoading(false); return }

      const userIds = [...new Set(records.map((c) => c.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)
      const profileMap = {}
      if (profiles) profiles.forEach((p) => { profileMap[p.id] = p.username })

      setCatches(records.map((c) => ({ ...c, username: profileMap[c.user_id] || 'Angler' })))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8', paddingTop: '60px' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 10px' }}>
              Community
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.4rem', fontWeight: '500', color: '#f8f9fa', marginBottom: '6px', letterSpacing: '-0.01em' }}>
              Catch Log
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.45)', margin: 0, fontSize: '14px', fontWeight: '300' }}>
              {loading ? 'Loading...' : `${catches.length} catch${catches.length !== 1 ? 'es' : ''} logged`}
            </p>
          </div>
          {user ? (
            <Link href="/catches/new" className="btn-primary">
              Log a Catch
            </Link>
          ) : (
            <Link href="/auth/login" className="btn-ghost">
              Sign in to Log a Catch
            </Link>
          )}
        </div>

        {/* Results */}
        {error ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: 'rgba(143,163,184,0.4)', marginBottom: '8px' }}>
              Could not load catches
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(143,163,184,0.3)', background: 'rgba(10,22,40,0.5)', border: '1px solid #162a4a', borderRadius: '4px', padding: '12px 16px', display: 'inline-block' }}>
              Run the catches table SQL in your Supabase dashboard first
            </p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'rgba(143,163,184,0.25)', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', fontWeight: '300' }}>
            Loading catches...
          </div>
        ) : catches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', color: 'rgba(143,163,184,0.2)', marginBottom: '16px' }}>
              No catches yet
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', color: 'rgba(143,163,184,0.3)', fontSize: '14px', fontWeight: '300', marginBottom: '32px' }}>
              Be the first to share a catch with the community
            </p>
            {user && (
              <Link href="/catches/new" className="btn-primary">Log Your First Catch</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {catches.map((c) => (
              <CatchCard key={c.id} catch={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
