import Navbar from '@/components/Navbar'
import ActivityTicker from '@/components/ActivityTicker'
import LatestCatches from '@/components/LatestCatches'
import Link from 'next/link'

const BENTO = [
  {
    label: 'Tackle Marketplace',
    stat: '2,400+',
    desc: 'Rods, reels, lures, line and tackle boxes from verified sellers.',
    href: '/browse',
  },
  {
    label: 'Boats & Marine',
    stat: '340+',
    desc: 'Vessels, outboards and marine equipment listed nationwide.',
    href: '/browse?category=Boats',
  },
  {
    label: 'Charters & Trips',
    stat: '500+',
    desc: 'Licensed captains and guides across fresh and saltwater.',
    href: '/browse',
  },
  {
    label: 'Learn to Fish',
    stat: 'Free',
    desc: 'Expert instruction from your first cast to offshore bluewater.',
    href: '/browse',
  },
]

export default function Home() {
  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8' }}>
      <Navbar />
      <ActivityTicker />

      {/* ── Hero ───────────────────────────────── */}
      <section style={{
        minHeight: '100svh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        overflow: 'hidden',
      }}>
        {/* Background photo — fishing at golden hour */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(https://source.unsplash.com/featured/?fishing,ocean,saltwater)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }} />

        {/* Dark cinematic overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,22,40,0.45) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.95) 90%, #0a1628 100%)',
        }} />

        {/* Grain texture overlay for film-like feel */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          opacity: 0.5,
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.7)',
            marginBottom: '24px',
          }}>
            The World's Fishing Marketplace
          </p>

          <h1
            className="hero-headline"
            style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '5.5rem',
              fontWeight: '500',
              lineHeight: 1.08,
              color: '#f8f9fa',
              maxWidth: '820px',
              marginBottom: '28px',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 40px rgba(0,0,0,0.5)',
            }}
          >
            Sea it all.<br />
            Buy it all.<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(248,249,250,0.45)' }}>Fish it all.</em>
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '1.05rem',
            fontWeight: '300',
            color: 'rgba(248,249,250,0.55)',
            maxWidth: '380px',
            lineHeight: 1.7,
            marginBottom: '52px',
            letterSpacing: '0.01em',
            margin: '0 auto 52px',
          }}>
            Gear, boats, charters, and knowledge —<br />all in one place.
          </p>

          <div className="hero-ctas" style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>
            <Link href="/browse" className="btn-primary">
              Browse Gear
            </Link>
            <Link href="/listings/new" className="btn-ghost">
              List Your Gear
            </Link>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
            <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(248,249,250,0.6))' }} />
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ───────────────────── */}
      <div style={{
        borderTop: '1px solid #162a4a',
        borderBottom: '1px solid #162a4a',
        padding: '18px 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-dm-sans, sans-serif)',
        fontSize: '13px',
        color: 'rgba(143,163,184,0.5)',
        letterSpacing: '0.04em',
      }}>
        Join{' '}
        <span style={{ color: '#c9a84c', fontWeight: '500' }}>2,400</span>
        {' '}fishermen already on Seaitall
      </div>

      {/* ── Bento Grid ─────────────────────────── */}
      <section style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '2rem',
            fontWeight: '400',
            color: '#f8f9fa',
            marginBottom: '40px',
            letterSpacing: '-0.01em',
          }}>
            Everything you need
          </h2>

          <div className="bento-grid">
            {BENTO.map((item) => (
              <div key={item.label} className="bento-cell">
                <p style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(143,163,184,0.5)',
                  margin: '0 0 20px',
                }}>
                  {item.label}
                </p>

                <p style={{
                  fontFamily: 'var(--font-playfair, serif)',
                  fontSize: '3.2rem',
                  fontWeight: '500',
                  color: '#c9a84c',
                  lineHeight: 1,
                  margin: '0 0 16px',
                  letterSpacing: '-0.01em',
                }}>
                  {item.stat}
                </p>

                <p style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '14px',
                  fontWeight: '300',
                  color: '#8fa3b8',
                  lineHeight: 1.6,
                  margin: '0 0 28px',
                  maxWidth: '320px',
                }}>
                  {item.desc}
                </p>

                <Link href={item.href} className="bento-explore-link">
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Catches ──────────────────────── */}
      <LatestCatches />

      {/* ── Footer ─────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #162a4a',
        padding: '32px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <span style={{
          fontFamily: 'var(--font-playfair, serif)',
          fontSize: '1rem',
          color: 'rgba(143,163,184,0.35)',
        }}>
          Seaitall
        </span>
        <span style={{
          fontFamily: 'var(--font-dm-sans, sans-serif)',
          fontSize: '12px',
          color: 'rgba(143,163,184,0.35)',
          letterSpacing: '0.06em',
        }}>
          © 2025 Seaitall — The world's fishing platform
        </span>
        <div style={{ display: 'flex', gap: '28px' }}>
          <Link href="/browse" className="nav-link">Browse</Link>
          <Link href="/catches" className="nav-link">Catches</Link>
          <Link href="/listings/new" className="nav-link">Sell</Link>
          <Link href="/auth/signup" className="nav-link">Join</Link>
        </div>
      </footer>
    </main>
  )
}
