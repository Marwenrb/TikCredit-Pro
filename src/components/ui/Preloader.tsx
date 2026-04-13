// Tik Credit Pro — Preloader · clean rewrite · 2026
// CRT aperture iris open/close — uses actual theme tokens
// lux-navy #0A1628 · lux-sapphire #1E3A8A · elegant-blue #2563EB
// premium-gold #D4AF37 · neon-blue #00D4FF
'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const expo = [0.16, 1, 0.3, 1] as const

// ── Inline squircle icon (unique IDs: pl- prefix) ─────────────────────────────
function SplashIcon({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 44 44" fill="none"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tik Credit Pro"
    >
      <defs>
        <linearGradient id="pl-fill" x1="7" y1="7" x2="37" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0A1628" />
          <stop offset="55%"  stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <radialGradient id="pl-sheen" cx="28%" cy="18%" r="48%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pl-ck" x1="13" y1="26" x2="33" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.97" />
          <stop offset="45%"  stopColor="#00D4FF" stopOpacity="0.93" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="pl-dot" cx="36%" cy="30%" r="52%">
          <stop offset="0%"   stopColor="#FEF3C7" />
          <stop offset="40%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <filter id="pl-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000"    floodOpacity="0.50" />
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#00D4FF" floodOpacity="0.32" />
        </filter>
      </defs>

      <rect x="7" y="7" width="30" height="30" rx="9" ry="9" fill="url(#pl-fill)" />
      <rect x="7" y="7" width="30" height="30" rx="9" ry="9" fill="url(#pl-sheen)" />
      <rect
        x="7.6" y="7.6" width="28.8" height="28.8" rx="8.5" ry="8.5"
        stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" fill="none"
      />
      <path
        d="M 13 23 L 19.5 30.5 L 33 13.5"
        stroke="url(#pl-ck)" strokeWidth="4.8"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none" filter="url(#pl-glow)"
      />
      <circle cx="33"   cy="13.5" r="3"   fill="url(#pl-dot)" />
      <circle cx="32.3" cy="12.8" r="1"   fill="white" opacity="0.65" />
    </svg>
  )
}

// ── Preloader ─────────────────────────────────────────────────────────────────
const Preloader: React.FC = () => {
  const reduced = useReducedMotion()

  /* Reduced motion — instant static splash */
  if (reduced) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-lux-navy"
        role="status" aria-label="جاري التحميل"
      >
        <div className="flex flex-col items-center gap-3">
          <SplashIcon size={56} />
          <p className="text-base font-bold text-white tracking-widest">TIK CREDIT PRO</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key="preloader"
      className="fixed inset-0 z-[9999] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="جاري التحميل"
      /* ── CRT iris: 2px slit → full screen ───────────────────── */
      initial={{ clipPath: 'inset(49.5% 0 49.5% 0)' }}
      animate={{ clipPath: 'inset(0% 0 0% 0)' }}
      exit={{
        clipPath:   'inset(49.5% 0 49.5% 0)',
        transition: { duration: 0.34, ease: 'easeIn' },
      }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Bg: hero gradient from theme */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 60%, #2563EB 100%)' }}
      />

      {/* Radial centre glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 65% 50% at 50% 44%, rgba(37,99,235,0.18) 0%, transparent 68%)' }}
      />

      {/* Scan-line texture — fades out after iris opens */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.025) 10px, rgba(255,255,255,0.025) 11px)',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.55, ease: 'easeOut' }}
      />

      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="relative flex h-full flex-col items-center justify-center" style={{ gap: 26 }}>

        {/* Icon — springs in from blur */}
        <motion.div
          className="relative"
          initial={{ scale: 0.35, opacity: 0, filter: 'blur(20px)' }}
          animate={{ scale: 1,    opacity: 1, filter: 'blur(0px)'  }}
          transition={{ delay: 0.26, duration: 0.70, ease: expo }}
        >
          {/* Ambient bloom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              inset:      '-20px',
              background: 'radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 60%)',
              filter:     'blur(16px)',
            }}
          />
          <SplashIcon size={72} />
        </motion.div>

        {/* Brand text — fade up from blur */}
        <motion.div
          className="flex flex-col items-center"
          style={{ gap: 10, fontFamily: 'var(--font-sans)' }}
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
          transition={{ delay: 0.58, duration: 0.60, ease: expo }}
        >
          {/* Tik Credit */}
          <div className="flex items-baseline" style={{ gap: '0.24em' }}>
            <span
              style={{
                fontSize:      'clamp(1.5rem, 4vw, 2rem)',
                fontWeight:    400,
                letterSpacing: '0.04em',
                lineHeight:    1,
                color:         'rgba(255,255,255,0.48)',
              }}
            >
              Tik
            </span>
            <span
              style={{
                fontSize:             'clamp(1.5rem, 4vw, 2rem)',
                fontWeight:           800,
                letterSpacing:        '-0.025em',
                lineHeight:           1,
                background:           'linear-gradient(112deg, #00D4FF 0%, #3B82F6 55%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              Credit
            </span>
          </div>

          {/* PRO badge */}
          <motion.div
            className="inline-flex rounded-full"
            style={{
              padding:    '1.5px',
              background: 'linear-gradient(108deg, #8B6914, #B8941F, #D4AF37, #E5C76B, #D4AF37, #8B6914)',
              boxShadow:  '0 0 12px rgba(212,175,55,0.40)',
            }}
            initial={{ opacity: 0, scale: 0.5, y: 8 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            transition={{ delay: 0.88, duration: 0.40, ease: expo }}
          >
            <div
              className="flex items-center justify-center rounded-full px-4 py-[3px]"
              style={{ background: '#0A1628' }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             '0.58rem',
                  fontWeight:           800,
                  letterSpacing:        '0.40em',
                  background:           'linear-gradient(90deg, #B8941F, #D4AF37, #E5C76B, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor:  'transparent',
                  backgroundClip:       'text',
                }}
              >
                PRO
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Arabic subtitle */}
        <motion.p
          dir="rtl"
          className="font-arabic text-xs"
          style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.45 }}
        >
          جاري التحميل…
        </motion.p>
      </div>

      {/* ── Progress bar ──────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-11 left-1/2 -translate-x-1/2"
        style={{ width: 120 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.30 }}
        aria-hidden="true"
      >
        <div className="h-px w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #1E3A8A, #2563EB 35%, #00D4FF 65%, #D4AF37)' }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 1.85, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* Top accent hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.50) 35%, rgba(212,175,55,0.40) 65%, transparent)' }}
      />
      {/* Bottom accent hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.30) 35%, rgba(0,212,255,0.25) 65%, transparent)' }}
      />
    </motion.div>
  )
}

export default Preloader
