'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const UNSPLASH = (id, w = 400) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop`

const CATEGORY_PHOTOS = {
  'Rods':         UNSPLASH('photo-1544551763-46a013bb70d5'),
  'Reels':        UNSPLASH('photo-1571019613454-1cb2f99b2d8b'),
  'Lures':        UNSPLASH('photo-1578662996442-48f60103fc96'),
  'Boats':        UNSPLASH('photo-1567899378494-47b22a2ae96a'),
  'Engines':      UNSPLASH('photo-1558618666-fcd25c85cd64'),
  'Tackle Boxes': UNSPLASH('photo-1544551763-46a013bb70d5'),
  'Line':         UNSPLASH('photo-1544551763-46a013bb70d5'),
  'Other':        UNSPLASH('photo-1544551763-46a013bb70d5'),
}

const CONDITION_COLORS = {
  'New':      { bg: 'rgba(74,158,255,0.12)', text: '#4a9eff', border: 'rgba(74,158,255,0.2)' },
  'Like New': { bg: 'rgba(74,158,255,0.08)', text: 'rgba(74,158,255,0.8)', border: 'rgba(74,158,255,0.15)' },
  'Good':     { bg: 'rgba(201,168,76,0.1)',  text: '#c9a84c', border: 'rgba(201,168,76,0.2)' },
  'Fair':     { bg: 'rgba(200,160,80,0.08)', text: 'rgba(200,160,80,0.8)', border: 'rgba(200,160,80,0.18)' },
  'Poor':     { bg: 'rgba(180,80,80,0.1)',   text: 'rgba(220,100,100,0.9)', border: 'rgba(180,80,80,0.2)' },
}

export default function HomepageDynamic() {
  const [stats, setStats]       = useState({ listings: 0, members: 0, catches: 0 })
  const [listings, setListings] = useState([])
  const [charters, setCharters] = useState([])

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [
        { count: listingsCount },
        { count: membersCount },
        { count: catchesCount },
        { data: recentListings },
        { data: recentCharters },
      ] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('catches').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id,title,price,condition,category,location,photo_url,photos,created_at').eq('status','active').order('created_at', { ascending: false }).limit(8),
        supabase.from('charters').select('id,captain_name,vessel_name,location,price_per_person,duration_hours,species_targeted,rating,vessel_photo').eq('status','active').limit(4),
      ])

      setStats({ listings: listingsCount || 0, members: membersCount || 0, catches: catchesCount || 0 })
      setListings(recentListings || [])
      setCharters(recentCharters || [])
    }
    load()
  }, [])

  const getPhoto = (l) => {
    if (l.photo_url) return l.photo_url
    if (l.photos && l.photos.length > 0) return l.photos[0]
    return CATEGORY_PHOTOS[l.category] || CATEGORY_PHOTOS['Other']
  }

  return (
    <>
      {/* Stats Strip */}
      <div style={{ borderTop: '1px solid #162a4a', borderBottom: '1px solid #162a4a', padding: '28px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
          {[
            { value: stats.listings.toLocaleString(), label: 'Active Listings' },
            { value: stats.members.toLocaleString(), label: 'Members' },
            { value: stats.catches.toLocaleString(), label: 'Catches Logged' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 2 ? '1px solid #162a4a' : 'none' }}>
              <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2.4rem', fontWeight: '500', color: '#c9a84c', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {s.value || '—'}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '400', color: 'rgba(143,163,184,0.4)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Listings */}
      {listings.length > 0 && (
        <section style={{ padding: '80px 48px', borderBottom: '1px solid #162a4a' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 10px' }}>Just Listed</p>
                <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '400', color: '#f8f9fa', margin: 0, letterSpacing: '-0.01em' }}>Fresh Gear</h2>
              </div>
              <Link href="/browse" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.4)'}
              >
                View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {listings.map((l) => {
                const cond = CONDITION_COLORS[l.condition] || CONDITION_COLORS['Good']
                return (
                  <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="listing-card">
                      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#0a1628' }}>
                        <Image src={getPhoto(l)} alt={l.title} fill sizes="280px" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                        <span className="category-badge" style={{ position: 'absolute', top: '10px', left: '10px' }}>{l.category}</span>
                      </div>
                      <div style={{ padding: '14px 16px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <h3 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: '500', color: '#f8f9fa', margin: 0, lineHeight: 1.4 }} className="truncate-2">{l.title}</h3>
                          <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '15px', color: '#c9a84c', fontWeight: '500', whiteSpace: 'nowrap' }}>${Number(l.price).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'inline-block', background: cond.bg, color: cond.text, border: `1px solid ${cond.border}`, padding: '2px 7px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>{l.condition}</span>
                          {l.location && <span style={{ fontSize: '11px', color: 'rgba(143,163,184,0.35)', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>{l.location.split(',')[0]}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Charters Preview */}
      {charters.length > 0 && (
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', margin: '0 0 10px' }}>Book a Trip</p>
                <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '2rem', fontWeight: '400', color: '#f8f9fa', margin: 0, letterSpacing: '-0.01em' }}>Featured Charters</h2>
              </div>
              <Link href="/charters" style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(143,163,184,0.4)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(143,163,184,0.4)'}
              >
                All charters <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {charters.map((c) => (
                <Link key={c.id} href={`/charters/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="listing-card">
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#0a1628' }}>
                      <Image src={c.vessel_photo || `https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&auto=format&fit=crop`} alt={c.vessel_name || 'Charter'} fill sizes="300px" style={{ objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.8) 0%, transparent 50%)' }} />
                      <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                        <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '15px', color: '#f8f9fa', margin: 0 }}>{c.captain_name}</p>
                        <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(248,249,250,0.5)', margin: '2px 0 0' }}>{c.vessel_name}</p>
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: 'rgba(143,163,184,0.45)' }}>{c.location}</span>
                        <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '15px', color: '#c9a84c', fontWeight: '500' }}>${c.price_per_person}/person</span>
                      </div>
                      {c.species_targeted && c.species_targeted.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {c.species_targeted.slice(0, 3).map((s) => (
                            <span key={s} style={{ background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.15)', color: 'rgba(74,158,255,0.7)', padding: '2px 8px', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
