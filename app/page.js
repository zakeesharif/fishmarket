import Navbar from '@/components/Navbar'
import ActivityTicker from '@/components/ActivityTicker'
import LatestCatches from '@/components/LatestCatches'
import HomepageDynamic from '@/components/HomepageDynamic'
import Link from 'next/link'
import Image from 'next/image'

const UNSPLASH = (id, w = 600) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop`

const CATEGORIES = [
  { label: 'Rods & Reels',  href: '/browse?category=Rods',   photo: UNSPLASH('photo-1544551763-46a013bb70d5'), count: '2,400+', desc: 'From surf sticks to ultralight finesse rods' },
  { label: 'Boats & Marine', href: '/browse?category=Boats', photo: UNSPLASH('photo-1567899378494-47b22a2ae96a'), count: '340+', desc: 'Center consoles, skiffs, and outboards' },
  { label: 'Charters',       href: '/charters',              photo: UNSPLASH('photo-1559827260-dc66d52bef19'), count: '500+', desc: 'Licensed captains across fresh and saltwater' },
  { label: 'Lures & Tackle', href: '/browse?category=Lures', photo: UNSPLASH('photo-1578662996442-48f60103fc96'), count: '8,000+', desc: 'Plugs, jigs, flies, and terminal tackle' },
]

export const metadata = {
  title: 'Seaitall — The World\'s Fishing Marketplace',
  description: 'Buy and sell fishing gear, find charters, book guides, and log your catches. Seaitall is the world\'s fishing marketplace.',
}

export default function Home() {
  return (
    <main style={{ background: '#0a1628', minHeight: '100vh', color: '#8fa3b8' }}>
      <Navbar />
      <ActivityTicker />

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{
        minHeight: '100svh', position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '120px 24px 100px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src={UNSPLASH('photo-1544551763-46a013bb70d5', 1920)}
            alt="Fishing at golden hour" fill priority sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(10,22,40,0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(10,22,40,0.2) 0%, rgba(10,22,40,0.5) 60%, rgba(10,22,40,1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.4) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px', width: '100%' }}>
          <p className="animate-fade-up-1" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.8)', marginBottom: '28px' }}>
            The World's Fishing Marketplace
          </p>

          <h1 className="hero-headline" style={{ fontFamily: 'var(--font-playfair, serif)', fontWeight: '500', fontSize: '5.8rem', lineHeight: 1.06, color: '#f8f9fa', marginBottom: 0, letterSpacing: '-0.02em', textShadow: '0 2px 40px rgba(0,0,0,0.4)' }}>
            <span className="animate-fade-up-1" style={{ display: 'block' }}>Sea it all.</span>
            <span className="animate-fade-up-2" style={{ display: 'block' }}>Buy it all.</span>
            <span className="animate-fade-up-3" style={{ display: 'block', color: 'rgba(248,249,250,0.38)', fontStyle: 'italic' }}>Fish it all.</span>
          </h1>

          <p className="animate-fade-up-3" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '1.05rem', fontWeight: '300', color: 'rgba(248,249,250,0.5)', lineHeight: 1.7, marginBottom: '52px', marginTop: '28px', letterSpacing: '0.01em' }}>
            Gear, boats, charters, and knowledge — all in one place.
          </p>

          <div className="hero-ctas animate-fade-up-4" style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>
            <Link href="/browse" className="btn-primary" style={{ padding: '15px 32px', fontSize: '15px' }}>Browse Gear</Link>
            <Link href="/listings/new" className="btn-ghost" style={{ padding: '14px 32px', fontSize: '15px' }}>List Your Gear</Link>
          </div>

          <div className="animate-fade-up-4" style={{ marginTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.2 }}>
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f8f9fa' }}>scroll</span>
            <div style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, transparent, rgba(248,249,250,0.7))' }} />
          </div>
        </div>
      </section>

      {/* Dynamic: stats, listings, charters */}
      <HomepageDynamic />

      {/* ── CATEGORIES ──────────────────────────────── */}
      <section style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '400', color: '#f8f9fa', letterSpacing: '-0.01em' }}>Everything you need</h2>
            <Link href="/browse" className="bento-explore-link">Browse all <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2px' }}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} href={cat.href} style={{ textDecoration: 'none', display: 'block' }} className="cat-card">
                <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
                  <Image src={cat.photo} alt={cat.label} fill sizes="300px" style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.45)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.9) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a84c', margin: '0 0 6px' }}>{cat.count}</p>
                    <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.4rem', fontWeight: '500', color: '#f8f9fa', margin: '0 0 6px' }}>{cat.label}</h3>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(248,249,250,0.5)', margin: 0, fontWeight: '300' }}>{cat.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Catches */}
      <LatestCatches />

      {/* ── BOTTOM CTA ──────────────────────────────── */}
      <section style={{ padding: '100px 48px', textAlign: 'center', borderTop: '1px solid #162a4a' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '20px' }}>Join the community</p>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.8rem', fontWeight: '400', color: '#f8f9fa', marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            The fishing world<br />in one place.
          </h2>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', fontWeight: '300', color: 'rgba(143,163,184,0.55)', lineHeight: 1.7, marginBottom: '40px' }}>
            Buy and sell gear, find charters, log your catches, and connect with anglers everywhere.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse" className="btn-primary" style={{ padding: '15px 36px', fontSize: '15px' }}>Browse Gear</Link>
            <Link href="/auth/signup" className="btn-ghost" style={{ padding: '14px 36px', fontSize: '15px' }}>Sign Up Free</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #162a4a', padding: '48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.2rem', color: '#f8f9fa', display: 'block', marginBottom: '12px' }}>Seaitall</span>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '300', color: 'rgba(143,163,184,0.4)', lineHeight: 1.6, margin: 0 }}>The world's fishing marketplace.</p>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.3)', marginBottom: '16px' }}>Marketplace</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[['Browse Gear','/browse'],['Sell Gear','/listings/new'],['Charters','/charters'],['Catch Log','/catches']].map(([l,h]) => (
              <Link key={h} href={h} className="nav-link" style={{ fontSize: '13px', fontWeight: '300' }}>{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.3)', marginBottom: '16px' }}>Account</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[['Sign Up','/auth/signup'],['Log In','/auth/login'],['Messages','/messages'],['Notifications','/notifications']].map(([l,h]) => (
              <Link key={h} href={h} className="nav-link" style={{ fontSize: '13px', fontWeight: '300' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
      <div style={{ borderTop: '1px solid #162a4a', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.25)' }}>© 2025 Seaitall</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/browse" className="nav-link" style={{ fontSize: '12px', color: 'rgba(143,163,184,0.25)' }}>Browse</Link>
          <Link href="/catches" className="nav-link" style={{ fontSize: '12px', color: 'rgba(143,163,184,0.25)' }}>Catches</Link>
        </div>
      </div>
    </main>
  )
}
