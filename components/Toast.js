'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

function ToastItem({ id, message, type, onRemove }) {
  const [exiting, setExiting] = useState(false)

  const handleRemove = useCallback(() => {
    setExiting(true)
    setTimeout(() => onRemove(id), 280)
  }, [id, onRemove])

  useEffect(() => {
    const t = setTimeout(handleRemove, 4000)
    return () => clearTimeout(t)
  }, [handleRemove])

  const colors = {
    success: { bg: 'rgba(15,32,64,0.98)', border: 'rgba(74,222,128,0.25)', icon: '#4ade80', iconBg: 'rgba(74,222,128,0.12)' },
    error:   { bg: 'rgba(15,32,64,0.98)', border: 'rgba(220,80,80,0.25)',  icon: '#dc5050', iconBg: 'rgba(220,80,80,0.12)' },
    info:    { bg: 'rgba(15,32,64,0.98)', border: 'rgba(74,158,255,0.25)', icon: '#4a9eff', iconBg: 'rgba(74,158,255,0.12)' },
  }
  const c = colors[type] || colors.info

  const icons = {
    success: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    error: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    info: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  }

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '6px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
      }}
      onClick={handleRemove}
    >
      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.icon, flexShrink: 0 }}>
        {icons[type] || icons.info}
      </div>
      <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#f8f9fa', lineHeight: 1.5, fontWeight: '400', flex: 1 }}>
        {message}
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(143,163,184,0.4)" strokeWidth="2.5" strokeLinecap="round" flexShrink="0">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { addToast: () => {} }
  return ctx
}
