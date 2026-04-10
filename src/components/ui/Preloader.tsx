// TikCredit Pro — Cinematic UIverse-inspired preloader · 2026
'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// ── Easing ─────────────────────────────────────────────────────────────────
const expo = [0.16, 1, 0.3, 1] as const

// ── Word definitions with per-char styling ─────────────────────────────────
const WORD_TIK    = ['T', 'i', 'k']
const WORD_CREDIT = ['C', 'r', 'e', 'd', 'i', 't']
const ALL_CHARS   = [...WORD_TIK, ...WORD_CREDIT]

// Per-char color roles: first 3 = "Tik" (white), last 6 = "Credit" (cyan)
function charColor(i: number): string {
  return i < 3
    ? 'rgba(255,255,255,0.92)'
    : `hsl(${188 + i * 4}deg, 100%, 62%)` // range #00D4FF → #4D99FF
}

// ── Inline Logo SVG (preloader-sized, no deps) ─────────────────────────────
function PreloaderIcon({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TikCredit Pro"
    >
      <defs>
        <linearGradient id="pl-bg" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#010915" />
          <stop offset="42%"  stopColor="#0B2160" />
          <stop offset="100%" stopColor="#1255D4" />
        </linearGradient>
        <radialGradient id="pl-depth" cx="50%" cy="72%" r="58%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0"  />
        </radialGradient>
        <radialGradient id="pl-sheen" cx="28%" cy="22%" r="44%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0"   />
        </radialGradient>
        <linearGradient id="pl-check" x1="9" y1="20" x2="28" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#00D4FF" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#E5C76B" stopOpacity="0.97" />
        </linearGradient>
        <radialGradient id="pl-dot" cx="50%" cy="35%" r="50%">
          <stop offset="0%"   stopColor="#FEFCBF" />
          <stop offset="38%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
        <filter id="pl-shadow">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.2" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      <circle cx="18" cy="18" r="16.5" fill="url(#pl-bg)" />
      <circle cx="18" cy="18" r="16.5" fill="url(#pl-depth)" />
      <circle cx="18" cy="18" r="16.5" fill="url(#pl-sheen)" />
      <circle cx="18" cy="18" r="16"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />

      <path
        d="M 8.5 20 C 10 22 13 25.5 15.5 27.2 C 18 29 20.5 23 28 10.2"
        stroke="url(#pl-check)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#pl-shadow)"
      />
      <circle cx="28"  cy="10.2" r="3"   fill="url(#pl-dot)" opacity="0.98" />
      <circle cx="27.2" cy="9.5" r="1.1" fill="white" opacity="0.58" />
    </svg>
  )
}

// ── Main Preloader ─────────────────────────────────────────────────────────
const Preloader: React.FC = () => {
  const reduced = useReducedMotion()

  // Stagger phase trackers (not used to block render — just label transitions)
  const [showPro, setShowPro] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPro(true), 1050)
    return () => clearTimeout(t)
  }, [])

  // ── Reduced motion version ───────────────────────────────────────────
  if (reduced) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020508]">
        <p className="text-lg font-bold text-white">TikCredit PRO</p>
      </div>
    )
  }

  return (
    <motion.div
      key="preloader"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #020508 0%, #030A12 55%, #020508 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity:  0,
        scale:    0.97,
        filter:   'blur(8px)',
        transition: { duration: 0.55, ease: 'easeIn' },
      }}
      transition={{ duration: 0.3 }}
      aria-label="Chargement…"
      role="status"
      aria-live="polite"
    >
      {/* ── Aurora blobs ─────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 65%)' }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: expo }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-0 h-[440px] w-[440px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 62%)' }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.15, ease: expo }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 60%)' }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Dot grid texture ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />

      {/* ── Central logo + neon ring ──────────────────────────────────────── */}
      <div className="relative mb-10 flex items-center justify-center">

        {/* Outer pulsing ambient glow */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width:  '160px',
            height: '160px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 65%)',
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Spinning neon ring — same conic technique as PhoneSection cards */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width:  '108px',
            height: '108px',
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 80deg, #00D4FF 160deg, #D4AF37 210deg, transparent 290deg, transparent 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
        />

        {/* Secondary counter ring */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width:  '92px',
            height: '92px',
            background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(77,127,255,0.55) 90deg, transparent 200deg)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 4.5, ease: 'linear', repeat: Infinity }}
        />

        {/* Logo icon — springs in */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.4, opacity: 0, filter: 'blur(16px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.25, ease: expo }}
        >
          <PreloaderIcon size={72} />
        </motion.div>
      </div>

      {/* ── TikCredit letters ─────────────────────────────────────────────── */}
      <motion.div
        className="flex items-center select-none"
        style={{ gap: '0.06em', fontFamily: 'var(--font-sans)' }}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show:   { transition: { staggerChildren: 0.065, delayChildren: 0.55 } },
        }}
        aria-label="TikCredit"
      >
        {ALL_CHARS.map((char, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            variants={{
              hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
              show:   {
                opacity: 1, y: 0, filter: 'blur(0px)',
                transition: { duration: 0.55, ease: expo },
              },
            }}
            style={{
              display:     'inline-block',
              fontSize:    'clamp(2rem, 6vw, 3rem)',
              fontWeight:  900,
              letterSpacing: '-0.02em',
              color:       charColor(i),
              /* subtle text-glow */
              textShadow:  i < 3
                ? '0 0 18px rgba(255,255,255,0.22)'
                : `0 0 20px rgba(0,212,255,0.40)`,
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {/* ── PRO badge ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: expo }}
            className="mt-3 inline-flex rounded-full"
            style={{
              padding:    '1.5px',
              background: 'linear-gradient(108deg, #92400E, #D97706, #FBBF24, #FDE68A, #F59E0B, #92400E)',
              boxShadow:  '0 0 14px rgba(212,175,55,0.4)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full px-4 py-1"
              style={{ background: '#010915' }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             '0.65rem',
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

      {/* ── Arabic subtitle ───────────────────────────────────────────────── */}
      <motion.p
        dir="rtl"
        className="mt-5 font-arabic text-xs tracking-wide"
        style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.7 }}
      >
        جاري التحميل…
      </motion.p>

      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{ width: '160px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        aria-hidden="true"
      >
        {/* Track */}
        <div className="h-[2px] w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          {/* Fill */}
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #1E3A8A, #2563EB 40%, #00D4FF 70%, #D4AF37)',
            }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        {/* Percentage dots */}
        <motion.div
          className="mt-2 flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['0%', '50%', '100%'].map((p) => (
            <span
              key={p}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize:   '9px',
                fontWeight: 600,
                color:      'rgba(255,255,255,0.22)',
                letterSpacing: '0.08em',
              }}
            >
              {p}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Top shimmer line ──────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5) 35%, rgba(212,175,55,0.45) 65%, transparent)',
        }}
      />
    </motion.div>
  )
}

export default Preloader
