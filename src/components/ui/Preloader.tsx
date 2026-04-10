// TikCredit Pro — Cinematic word-wipe preloader · 2026
'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const expo   = [0.16, 1, 0.3, 1] as const
const linear = 'linear' as const

// ── Inline Logo SVG ──────────────────────────────────────────────────────────
function CenterIcon({ size = 62 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 36 36" fill="none"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tik Credit Pro"
    >
      <defs>
        <linearGradient id="pi-bg" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#010915" />
          <stop offset="42%"  stopColor="#0B2160" />
          <stop offset="100%" stopColor="#1255D4" />
        </linearGradient>
        <radialGradient id="pi-sheen" cx="28%" cy="22%" r="44%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pi-check" x1="9" y1="20" x2="28" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#00D4FF" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#E5C76B" stopOpacity="0.97" />
        </linearGradient>
        <radialGradient id="pi-dot" cx="50%" cy="35%" r="50%">
          <stop offset="0%"   stopColor="#FEFCBF" />
          <stop offset="38%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
        <filter id="pi-shadow">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <circle cx="18" cy="18" r="16.5" fill="url(#pi-bg)" />
      <circle cx="18" cy="18" r="16.5" fill="url(#pi-sheen)" />
      <circle cx="18" cy="18" r="16"   stroke="rgba(255,255,255,0.11)" strokeWidth="0.5" fill="none" />
      <path
        d="M 8.5 20 C 10 22 13 25.5 15.5 27.2 C 18 29 20.5 23 28 10.2"
        stroke="url(#pi-check)" strokeWidth="3.8"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none" filter="url(#pi-shadow)"
      />
      <circle cx="28"   cy="10.2" r="3"   fill="url(#pi-dot)" opacity="0.98" />
      <circle cx="27.2" cy="9.5"  r="1.1" fill="white"         opacity="0.58" />
    </svg>
  )
}

// ── WipeWord — horizontal clip-path reveal + laser-edge streak ───────────────
function WipeWord({
  text, delay, duration, style, streakColor,
}: {
  text: string
  delay: number
  duration: number
  style: React.CSSProperties
  streakColor: string
}) {
  return (
    <div className="relative overflow-hidden" style={{ display: 'inline-block' }}>
      {/* Text — revealed by clip-path growing from left */}
      <motion.span
        style={{ display: 'inline-block', ...style }}
        initial={{ clipPath: 'inset(0 102% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)'   }}
        transition={{ duration, delay, ease: expo }}
      >
        {text}
      </motion.span>

      {/* Laser-scan leading edge — travels left → right at same speed */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[-8px]"
        style={{
          width:      '2px',
          background: `linear-gradient(180deg, transparent 0%, ${streakColor} 30%, white 50%, ${streakColor} 70%, transparent 100%)`,
          boxShadow:  `0 0 16px 3px ${streakColor}`,
          left:       0,
        }}
        initial={{ left: '0%', opacity: 0 }}
        animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
        transition={{ duration, delay, ease: linear }}
      />
    </div>
  )
}

// ── Main Preloader ───────────────────────────────────────────────────────────
const Preloader: React.FC = () => {
  const reduced           = useReducedMotion()
  const [showPro, setShowPro]   = useState(false)
  const [showSub, setShowSub]   = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowPro(true),  1400)
    const t2 = setTimeout(() => setShowSub(true),  1650)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (reduced) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020508]">
        <p className="text-lg font-bold text-white tracking-widest">TIK CREDIT PRO</p>
      </div>
    )
  }

  return (
    <motion.div
      key="preloader"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#020508' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity:    0,
        scale:      0.97,
        filter:     'blur(14px)',
        transition: { duration: 0.55, ease: 'easeIn' },
      }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-live="polite"
      aria-label="Chargement…"
    >
      {/* ── Deep radial background glow ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 64% 52% at 50% 46%, #0A1C42 0%, #020508 68%)',
        }}
      />

      {/* ── Corner aurora blobs ─────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-16 h-[360px] w-[360px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 68%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -bottom-12 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* ── Dot grid ────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize:  '30px 30px',
        }}
      />

      {/* ── LOGO — springs in with bloom ────────────────────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Bloom behind icon */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{ width: 110, height: 110, background: 'radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 68%)' }}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0, 0.8, 0.55] }}
          transition={{ duration: 2.8, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative z-10"
          initial={{ scale: 0.2, opacity: 0, filter: 'blur(24px)' }}
          animate={{ scale: 1,   opacity: 1, filter: 'blur(0px)'  }}
          transition={{ duration: 0.75, delay: 0.18, ease: expo }}
        >
          <CenterIcon size={62} />
        </motion.div>
      </div>

      {/* ── Brand name — two words, each with wipe reveal ───────────────── */}
      <div
        className="mt-8 flex select-none items-baseline"
        style={{
          gap:        '0.38em',
          fontFamily: 'var(--font-sans)',
        }}
        aria-label="Tik Credit"
      >
        {/* "Tik" — white, medium weight */}
        <WipeWord
          text="Tik"
          delay={0.52}
          duration={0.62}
          streakColor="rgba(255,255,255,0.9)"
          style={{
            fontSize:      'clamp(2rem, 5.5vw, 2.8rem)',
            fontWeight:    600,
            letterSpacing: '-0.025em',
            color:         'rgba(255,255,255,0.88)',
          }}
        />

        {/* "Credit" — gradient, heavy weight */}
        <WipeWord
          text="Credit"
          delay={0.96}
          duration={0.82}
          streakColor="rgba(0,212,255,0.9)"
          style={{
            fontSize:             'clamp(2rem, 5.5vw, 2.8rem)',
            fontWeight:           900,
            letterSpacing:        '-0.025em',
            background:           'linear-gradient(118deg, #00D4FF 0%, #4D7FFF 55%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}
        />
      </div>

      {/* ── PRO badge ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            transition={{ duration: 0.45, ease: expo }}
            className="mt-3 inline-flex rounded-full"
            style={{
              padding:    '1.5px',
              background: 'linear-gradient(108deg, #92400E, #D97706, #FBBF24, #FDE68A, #F59E0B, #92400E)',
              boxShadow:  '0 0 14px rgba(212,175,55,0.35)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full px-4 py-0.5"
              style={{ background: '#010915' }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             '0.6rem',
                  fontWeight:           800,
                  letterSpacing:        '0.38em',
                  background:           'linear-gradient(90deg, #D97706, #FBBF24, #FDE68A, #F59E0B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor:  'transparent',
                  backgroundClip:       'text',
                }}
              >
                PRO
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Arabic subtitle ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSub && (
          <motion.p
            dir="rtl"
            className="mt-5 font-arabic text-xs"
            style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            جاري التحميل…
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        style={{ width: 140 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        aria-hidden="true"
      >
        <div className="h-px w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #1E3A8A, #2563EB 35%, #00D4FF 65%, #D4AF37)' }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 2.0, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* ── Top shimmer hairline ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.45) 38%, rgba(212,175,55,0.38) 62%, transparent)' }}
      />
    </motion.div>
  )
}

export default Preloader
