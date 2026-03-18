import Navbar from '@/components/Navbar'
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

      {/* ── Hero ───────────────────────────────── */}
      <section style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
      }}>
        <h1
          className="hero-headline"
          style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: '5rem',
            fontWeight: '500',
            lineHeight: 1.12,
            color: '#f8f9fa',
            maxWidth: '760px',
            marginBottom: '24px',
            letterSpacing: '-0.01em',
          }}
        >
          Sea it all. Buy it all.<br />
          <em style={{ fontStyle: 'italic', color: 'rgba(248,249,250,0.6)' }}>Fish it all.</em>
        </h1>

        <p style={{
          fontFamily: 'var(--font-dm-sans, sans-serif)',
          fontSize: '1.1rem',
          fontWeight: '300',
          color: '#8fa3b8',
          maxWidth: '400px',
          lineHeight: 1.6,
          marginBottom: '48px',
          letterSpacing: '0.01em',
        }}>
          The world's fishing marketplace. Gear, boats, charters, and knowledge — all in one place.
        </p>

        <div className="hero-ctas" style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>
          <Link href="/browse" className="btn-primary">
            Browse Gear
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            List Your Gear
          </Link>
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
        color: 'rgba(143,163,184,0.6)',
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
          <Link href="/listings/new" className="nav-link">Sell</Link>
          <Link href="/auth/signup" className="nav-link">Join</Link>
        </div>
      </footer>
    </main>
  )
}
