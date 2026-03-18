export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#1a7f4f', fontSize: '2.5rem' }}>🎣 FishMarket</h1>
      <p style={{ color: '#555', fontSize: '1.2rem' }}>The one stop shop for everything fishing</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '40px' }}>
        
        <div style={{ background: '#f0faf5', border: '1px solid #1a7f4f', borderRadius: '12px', padding: '24px' }}>
          <h2>🛒 Buy & Sell Tackle</h2>
          <p>New and used fishing gear from the community</p>
        </div>

        <div style={{ background: '#f0faf5', border: '1px solid #1a7f4f', borderRadius: '12px', padding: '24px' }}>
          <h2>⛵ Boats & Marine</h2>
          <p>Browse boats, engines and marine equipment</p>
        </div>

        <div style={{ background: '#f0faf5', border: '1px solid #1a7f4f', borderRadius: '12px', padding: '24px' }}>
          <h2>🗺️ Find a Charter</h2>
          <p>Book captains and fishing trips worldwide</p>
        </div>

      </div>
    </main>
  )
}