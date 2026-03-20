'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'

const CHARTER_FALLBACK = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop'

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0
  return (
    <span style={{ color: '#c9a84c', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px' }}>
      {r.toFixed(1)} ★
    </span>
  )
}

function RelatedCard({ charter }) {
  return (
    <Link href={`/charters/${charter.id}`} style={{ textDecoration: 'none', display: 'block', background: '#162a4a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      <div style={{ position: 'relative', height: '130px', background: '#0a1628' }}>
        <Image src={charter.vessel_photo || CHARTER_FALLBACK} alt={charter.vessel_name || 'Charter'} fill sizes="300px" style={{ objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '0.95rem', color: '#f8f9fa', margin: '0 0 4px', fontWeight: '500' }}>{charter.vessel_name}</p>
        <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8', margin: '0 0 6px' }}>{charter.location}</p>
        <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#c9a84c', margin: 0, fontWeight: '600' }}>${charter.price_per_person}/person</p>
      </div>
    </Link>
  )
}

export default function CharterDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [charter, setCharter] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('charters').select('*').eq('id', id).single()
      setCharter(data)

      if (data?.location) {
        const locationWord = data.location.split(',')[0].trim()
        const { data: rel } = await supabase
          .from('charters')
          .select('id, vessel_name, vessel_photo, location, price_per_person, captain_name')
          .neq('id', id)
          .eq('status', 'active')
          .ilike('location', `%${locationWord}%`)
          .limit(3)
        setRelated(rel || [])
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleBook = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!date) {
      addToast('Please select a date', 'error')
      return
    }
    setBooking(true)
    const supabase = createClient()
    const total = passengers * (charter.price_per_person || 0)
    const { error } = await supabase.from('charter_bookings').insert({
      charter_id: charter.id,
      user_id: user.id,
      date,
      passengers,
      total_price: total,
      status: 'pending',
    })
    setBooking(false)
    if (error) {
      addToast('Booking failed. Please try again.', 'error')
    } else {
      setBooked(true)
      addToast('Booking request sent!', 'success')
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#0a1628', minHeight: '100vh' }}>
        <Navbar />
        <div className="skeleton" style={{ height: '55vh', width: '100%' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="skeleton" style={{ height: '32px', width: '300px', borderRadius: '4px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '18px', width: '200px', borderRadius: '4px', marginBottom: '32px' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '4px' }} />
        </div>
      </div>
    )
  }

  if (!charter) {
    return (
      <div style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <p style={{ color: '#8fa3b8', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>Charter not found.</p>
        <Link href="/charters" className="btn-primary" style={{ marginTop: '16px' }}>Browse Charters</Link>
      </div>
    )
  }

  const total = passengers * (charter.price_per_person || 0)
  const photo = charter.vessel_photo || CHARTER_FALLBACK

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', height: '55vh', minHeight: '320px', overflow: 'hidden', background: '#0a1628' }}>
        <Image src={photo} alt={charter.vessel_name || 'Charter vessel'} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,22,40,0.2) 0%, rgba(10,22,40,0.7) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '500', color: '#f8f9fa', margin: '0 0 4px', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            {charter.vessel_name || 'Unnamed Vessel'}
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: 'rgba(248,249,250,0.8)', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            Capt. {charter.captain_name}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>

          {/* Left: Details */}
          <div>
            {/* Captain Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #162a4a' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.3rem', color: '#f8f9fa', margin: '0 0 4px', fontWeight: '500' }}>
                      Capt. {charter.captain_name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {charter.location}
                      </span>
                      <StarRating rating={charter.rating} />
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: 'rgba(143,163,184,0.5)' }}>
                        {charter.total_trips || 0} trips completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {charter.description && (
              <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #162a4a' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.05rem', color: '#f8f9fa', margin: '0 0 12px', fontWeight: '500' }}>About This Trip</h3>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#8fa3b8', lineHeight: 1.7, margin: 0, fontWeight: '300' }}>
                  {charter.description}
                </p>
              </div>
            )}

            {/* Specs */}
            <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #162a4a' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.05rem', color: '#f8f9fa', margin: '0 0 16px', fontWeight: '500' }}>Trip Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'Max Passengers', value: charter.max_passengers, icon: '👥' },
                  { label: 'Duration', value: `${charter.duration_hours} hours`, icon: '⏱' },
                  { label: 'Price Per Person', value: `$${charter.price_per_person}`, icon: '💰' },
                ].map(spec => (
                  <div key={spec.label} style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '6px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>{spec.icon}</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8fa3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{spec.label}</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#f8f9fa', fontWeight: '500' }}>{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Species */}
            {charter.species_targeted && charter.species_targeted.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.05rem', color: '#f8f9fa', margin: '0 0 12px', fontWeight: '500' }}>Target Species</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {charter.species_targeted.map(s => (
                    <span key={s} style={{ background: 'rgba(74,158,255,0.1)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.2)', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.05rem', color: '#f8f9fa', margin: '0 0 16px', fontWeight: '500' }}>Similar Charters Nearby</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                  {related.map(r => <RelatedCard key={r.id} charter={r} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ background: '#0f2040', border: '1px solid #162a4a', borderRadius: '10px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #162a4a', marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.8rem', color: '#c9a84c', fontWeight: '500' }}>
                  ${charter.price_per_person}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8' }}>per person</div>
              </div>

              {booked ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                  <h4 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.1rem', color: '#f8f9fa', margin: '0 0 8px', fontWeight: '500' }}>
                    Booking request sent!
                  </h4>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8', margin: '0 0 16px', lineHeight: 1.5 }}>
                    The captain will confirm your booking shortly.
                  </p>
                  <Link href="/charters" className="btn-ghost" style={{ fontSize: '13px' }}>Browse More Charters</Link>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="fm-label">Select Date</label>
                    <input
                      type="date"
                      className="fm-input"
                      value={date}
                      min={today}
                      onChange={e => setDate(e.target.value)}
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="fm-label">Passengers</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setPassengers(p => Math.max(1, p - 1))}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #162a4a', background: 'transparent', color: '#f8f9fa', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >−</button>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '16px', color: '#f8f9fa', minWidth: '24px', textAlign: 'center', fontWeight: '500' }}>
                        {passengers}
                      </span>
                      <button
                        onClick={() => setPassengers(p => Math.min(charter.max_passengers || 12, p + 1))}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #162a4a', background: 'transparent', color: '#f8f9fa', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#8fa3b8' }}>
                        max {charter.max_passengers}
                      </span>
                    </div>
                  </div>

                  {/* Price calculator */}
                  <div style={{ background: '#162a4a', borderRadius: '6px', padding: '14px 16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#8fa3b8' }}>
                        {passengers} × ${charter.price_per_person}
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa' }}>
                        ${total.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', fontWeight: '500' }}>Total</span>
                      <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '16px', color: '#c9a84c', fontWeight: '600' }}>${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '15px', opacity: booking ? 0.7 : 1 }}
                  >
                    {booking ? 'Sending Request...' : 'Book Now'}
                  </button>

                  {!user && (
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8fa3b8', textAlign: 'center', margin: '10px 0 0' }}>
                      You&apos;ll be asked to log in to complete your booking.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
