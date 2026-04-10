// TikCredit Pro — Orbital rings preloader · 2026
'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const expo = [0.16, 1, 0.3, 1] as const

// ── Brand characters with word-space ────────────────────────────────────────
type CharEntry = { char: string; color: string; glow: string }

const CHAR_ENTRIES: CharEntry[] = [
  ...['T', 'i', 'k'].map(c => ({
    char:  c,
    color: 'rgba(255,255,255,0.92)',
    glow:  '0 0 16px rgba(255,255,255,0.2)',
  })),
  { char: '\u00A0', color: 'transparent', glow: 'none' },
  ...['C', 'r', 'e', 'd', 'i', 't'].map((c, i) => ({
    char:  c,
    color: `hsl(${188 + i * 4}deg, 100%, 62%)`,
    glow:  '0 0 18px rgba(0,212,255,0.38)',
  })),
]

// ── Center icon (self-contained, no external deps) ───────────────────────────
function CenterIcon({ size = 58 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tik Credit Pro"
    >
      <defs>
        <linearGradient id="ol-bg" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#010915" />
          <stop offset="42%"  stopColor="#0B2160" />
          <stop offset="100%" stopColor="#1255D4" />
        </linearGradient>
        <radialGradient id="ol-sheen" cx="28%" cy="22%" r="44%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ol-check" x1="9" y1="20" x2="28" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#00D4FF" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#E5C76B" stopOpacity="0.97" />
        </linearGradient>
        <radialGradient id="ol-dot" cx="50%" cy="35%" r="50%">
          <stop offset="0%"   stopColor="#FEFCBF" />
          <stop offset="38%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
        <filter id="ol-shadow">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="18" cy="18" r="16.5" fill="url(#ol-bg)" />
      <circle cx="18" cy="18" r="16.5" fill="url(#ol-sheen)" />
      <circle cx="18" cy="18" r="16"   stroke="rgba(255,255,255,0.11)" strokeWidth="0.5" fill="none" />
      <path
        d="M 8.5 20 C 10 22 13 25.5 15.5 27.2 C 18 29 20.5 23 28 10.2"
        stroke="url(#ol-check)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#ol-shadow)"
      />
      <circle cx="28"   cy="10.2" r="3"   fill="url(#ol-dot)" opacity="0.98" />
      <circle cx="27.2" cy="9.5"  r="1.1" fill="white" opacity="0.58" />
    </svg>
  )
}

// ── Orbital ring — GPU-composited rotate + single neon dot ───────────────────
function OrbitalRing({
  size, duration, color, rgb, dotSize = 8, reverse = false, opacity = 0.12,
}: {
  size: number; duration: number; color: string; rgb: string
  dotSize?: number; reverse?: boolean; opacity?: number
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width:      size,
        height:     size,
        marginLeft: -size / 2,
        marginTop:  -size / 2,
        border:     `1px solid rgba(${rgb},${opacity})`,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, ease: 'linear', repeat: Infinity }}
      aria-hidden="true"
    >
      {/* Neon dot at 12 o'clock */}
      <div
        className="absolute left-1/2 top-0 rounded-full"
        style={{
          width:      dotSize,
          height:     dotSize,
          marginLeft: -dotSize / 2,
          marginTop:  -dotSize / 2,
          background: color,
          boxShadow:  `0 0 ${dotSize * 1.4}px ${color}, 0 0 ${dotSize * 3}px rgba(${rgb},0.45)`,
        }}
      />
    </motion.div>
  )
}

// ── Main Preloader ───────────────────────────────────────────────────────────
const Preloader: React.FC = () => {
  const reduced  = useReducedMotion()
  const [showPro, setShowPro] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPro(true), 900)
    return () => clearTimeout(t)
  }, [])

  // Reduced-motion fallback — instant, no animation
  if (reduced) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020508]">
        <p className="text-lg font-bold text-white">Tik Credit PRO</p>
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
        opacity:    0,
        scale:      0.96,
        filter:     'blur(12px)',
        transition: { duration: 0.58, ease: 'easeIn' },
      }}
      transition={{ duration: 0.28 }}
      role="status"
      aria-live="polite"
      aria-label="Chargement…"
    >
      {/* ── Ambient background blobs ────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-32 -top-10 h-[440px] w-[440px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%)' }}
        />
        <div
          className="absolute -left-24 -bottom-10 h-[380px] w-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 62%)' }}
        />
      </div>

      {/* ── Dot grid texture ────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />

      {/* ── Orbital system ──────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center" style={{ width: 210, height: 210 }}>

        {/* Ring 1 — outer, slow, cyan */}
        <OrbitalRing
          size={200} duration={9}
          color="#00D4FF" rgb="0,212,255"
          dotSize={9} opacity={0.1}
        />

        {/* Ring 2 — middle, medium, gold, counter-clockwise */}
        <OrbitalRing
          size={154} duration={6}
          color="#D4AF37" rgb="212,175,55"
          dotSize={7} opacity={0.15} reverse
        />

        {/* Ring 3 — inner, fast, electric blue */}
        <OrbitalRing
          size={112} duration={3.4}
          color="#4D7FFF" rgb="77,127,255"
          dotSize={5.5} opacity={0.2}
        />

        {/* Center ambient bloom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width:      88,
            height:     88,
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 68%)',
            filter:     'blur(10px)',
          }}
        />

        {/* Gold bloom */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 64, height: 64, background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo — springs in */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.25, opacity: 0, filter: 'blur(20px)' }}
          animate={{ scale: 1,    opacity: 1, filter: 'blur(0px)'  }}
          transition={{ duration: 0.85, delay: 0.28, ease: expo }}
        >
          <CenterIcon size={58} />
        </motion.div>

      </div>

      {/* ── "Tik Credit" stagger letters ────────────────────────────────── */}
      <motion.div
        className="mt-8 flex select-none items-center"
        style={{ gap: '0.045em', fontFamily: 'var(--font-sans)' }}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show:   { transition: { staggerChildren: 0.058, delayChildren: 0.62 } },
        }}
        aria-label="Tik Credit"
      >
        {CHAR_ENTRIES.map((entry, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            variants={{
              hidden: { opacity: 0, y: 14, filter: 'blur(8px)' },
              show:   {
                opacity: 1, y: 0, filter: 'blur(0px)',
                transition: { duration: 0.48, ease: expo },
              },
            }}
            style={{
              display:       'inline-block',
              fontSize:      'clamp(1.8rem, 5.5vw, 2.5rem)',
              fontWeight:    900,
              letterSpacing: '-0.02em',
              color:         entry.color,
              textShadow:    entry.glow,
              width:         entry.char === '\u00A0' ? '0.3em' : undefined,
            }}
          >
            {entry.char}
          </motion.span>
        ))}
      </motion.div>

      {/* ── PRO badge ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.55, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.42, ease: expo }}
            className="mt-2.5 inline-flex rounded-full"
            style={{
              padding:    '1.5px',
              background: 'linear-gradient(108deg, #92400E, #D97706, #FBBF24, #FDE68A, #F59E0B, #92400E)',
              boxShadow:  '0 0 12px rgba(212,175,55,0.32)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full px-4 py-0.5"
              style={{ background: '#010915' }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             '0.58rem',
                  fontWeight:           800,
                  letterSpacing:        '0.36em',
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
      <motion.p
        dir="rtl"
        className="mt-5 font-arabic text-xs"
        style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.25, duration: 0.6 }}
      >
        جاري التحميل…
      </motion.p>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        style={{ width: 136 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        aria-hidden="true"
      >
        {/* Track */}
        <div
          className="h-px w-full overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {/* Fill */}
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #1E3A8A, #2563EB 38%, #00D4FF 68%, #D4AF37)' }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1.9, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* ── Top shimmer line ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.42) 35%, rgba(212,175,55,0.38) 65%, transparent)' }}
      />
    </motion.div>
  )
}

export default Preloader
