import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>

      {/* Hook SVG */}
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '28px' }}>
        {/* Hook shaft */}
        <line x1="50" y1="10" x2="50" y2="60" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round"/>
        {/* Hook eye */}
        <circle cx="50" cy="10" r="7" stroke="#c9a84c" strokeWidth="2.5" fill="none"/>
        {/* Hook bend */}
        <path d="M50 60 C50 85 75 90 75 75 C75 65 65 62 58 68" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Barb */}
        <path d="M58 68 L65 72" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round"/>
        {/* Sparkles */}
        <circle cx="20" cy="40" r="2" fill="rgba(201,168,76,0.3)"/>
        <circle cx="80" cy="50" r="1.5" fill="rgba(201,168,76,0.25)"/>
        <circle cx="15" cy="65" r="1" fill="rgba(201,168,76,0.2)"/>
        <circle cx="85" cy="30" r="2.5" fill="rgba(201,168,76,0.15)"/>
        {/* Line at top */}
        <line x1="50" y1="2" x2="50" y2="3" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 6"/>
      </svg>

      <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '500', color: '#f8f9fa', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
        Looks like that one got away.
      </h1>

      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '16px', color: '#8fa3b8', margin: '0 0 8px', fontWeight: '300' }}>
        The page you&apos;re looking for has left the dock.
      </p>

      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(143,163,184,0.5)', margin: '0 0 40px' }}>
        Error 404
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            background: '#c9a84c',
            color: '#0a1628',
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '4px',
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/browse"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            background: 'transparent',
            color: '#8fa3b8',
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '14px',
            fontWeight: '400',
            borderRadius: '4px',
            textDecoration: 'none',
            border: '1px solid #162a4a',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          Browse Gear
        </Link>
      </div>

    </div>
  )
}
