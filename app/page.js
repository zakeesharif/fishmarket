import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 40px' }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '0 0 20px', lineHeight: 1.2 }}>
          Everything Fishing.<br />
          <span style={{ color: '#1a7f4f' }}>One Place.</span>
        </h2>
        <p style={{ color: '#aaa', fontSize: '1.3rem', maxWidth: '600px', margin: '0 auto 40px' }}>
          Buy and sell tackle, find boats, book charters, and learn to fish — all in one platform built by fishermen for fishermen.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse">
            <button style={{ background: '#1a7f4f', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
              Start Browsing
            </button>
          </Link>
          <Link href="/listings/new">
            <button style={{ background: 'transparent', color: 'white', border: '1px solid #444', padding: '16px 36px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' }}>
              List Your Gear
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '60px', padding: '40px', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1a7f4f' }}>10,000+</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>Gear Listings</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1a7f4f' }}>500+</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>Captains & Charters</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1a7f4f' }}>50+</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>Countries</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1a7f4f' }}>Free</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>To List Gear</div>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ padding: '80px 40px' }}>
        <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '50px' }}>Everything You Need</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '32px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎣</div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Buy & Sell Tackle</h4>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>New and used gear from the community. Rods, reels, lures and more.</p>
          </div>

          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '32px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⛵</div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Boats & Marine</h4>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Browse boats, engines and marine equipment from sellers nationwide.</p>
          </div>

          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '32px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗺️</div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Find a Charter</h4>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Book captains and fishing trips anywhere in the world.</p>
          </div>

          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '32px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📚</div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Learn to Fish</h4>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>From surf casting to boat handling — learn from the best.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '40px', textAlign: 'center', color: '#444' }}>
        <p>© 2025 FishMarket — Built by fishermen for fishermen</p>
      </footer>
    </main>
  )
}
