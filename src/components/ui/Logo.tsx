// TikCredit Pro — Next-gen cinematic logo · 2026
'use client'

import React from 'react'

export interface LogoProps {
  size?:         'sm' | 'md' | 'lg'
  className?:    string
  showWordmark?: boolean
  /** 'light' = on ivory/white bg (navbar) · 'dark' = on near-black bg (preloader, dark sections) */
  variant?:      'light' | 'dark'
}

const sizeMap = {
  sm: { icon: 28, tik: 10,  credit: 14, gap: 8  },
  md: { icon: 38, tik: 12,  credit: 19, gap: 10 },
  lg: { icon: 56, tik: 16,  credit: 26, gap: 14 },
}

/**
 * TikCredit Pro — Premium circular icon mark + cinematic wordmark
 *
 * Icon: Deep navy-to-electric-blue circle, curved bezier checkmark
 * (white → #00D4FF → #D4AF37), glowing gold tip dot, outer neon ring.
 *
 * Wordmark: stacked — "Tik" superscript + "Credit" bold-gradient + "PRO" chip
 *
 * @param variant - 'light' for light backgrounds (default) · 'dark' for dark surfaces
 */
const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = true,
  variant = 'light',
}) => {
  const { icon, tik, credit, gap } = sizeMap[size]
  // uid prevents SVG gradient ID collisions when multiple logo sizes appear on screen
  const uid = `${size}-${variant}`

  return (
    <div className={`inline-flex items-center ${className}`} style={{ gap }}>

      {/* ── Icon Mark ─────────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: icon, height: icon }}>

        {/* Outer ambient glow — radiates from the icon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            inset:      '-6px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.22) 0%, rgba(30,58,138,0.14) 45%, transparent 70%)',
            filter:     'blur(8px)',
          }}
        />

        {/* Fine neon ring — visible on dark surfaces */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            inset:     '-2px',
            background: 'conic-gradient(from 135deg at 50% 50%, transparent 0deg, rgba(0,212,255,0.55) 90deg, rgba(212,175,55,0.45) 180deg, transparent 260deg)',
            borderRadius: '50%',
            opacity:   variant === 'dark' ? 1 : 0.55,
          }}
        />

        <svg
          width={icon}
          height={icon}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          role="img"
          aria-label="TikCredit Pro logo"
        >
          <defs>
            {/* Background: deep navy → midnight indigo → electric blue */}
            <linearGradient id={`bg-${uid}`} x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#010915" />
              <stop offset="42%"  stopColor="#0B2160" />
              <stop offset="100%" stopColor="#1255D4" />
            </linearGradient>

            {/* Depth vignette — bottom darkening for 3D feel */}
            <radialGradient id={`depth-${uid}`} cx="50%" cy="72%" r="58%" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#000" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#000" stopOpacity="0"  />
            </radialGradient>

            {/* Glass sheen — upper-left white brilliance */}
            <radialGradient id={`sheen-${uid}`} cx="28%" cy="22%" r="44%" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#fff" stopOpacity="0.24" />
              <stop offset="55%"  stopColor="#fff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0"   />
            </radialGradient>

            {/* Checkmark stroke: white → electric cyan → warm gold */}
            <linearGradient id={`check-${uid}`} x1="9" y1="20" x2="28" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="0.95" />
              <stop offset="50%"  stopColor="#00D4FF"  stopOpacity="0.90" />
              <stop offset="100%" stopColor="#E5C76B"  stopOpacity="0.97" />
            </linearGradient>

            {/* Gold tip dot radial */}
            <radialGradient id={`dot-${uid}`} cx="50%" cy="35%" r="50%" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="#FEFCBF" />
              <stop offset="38%"  stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#A16207" />
            </radialGradient>

            {/* Outer ring gradient — neon cyan to gold arc */}
            <linearGradient id={`ring-${uid}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#00D4FF" stopOpacity="0.7" />
              <stop offset="50%"  stopColor="#4D7FFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E5C76B" stopOpacity="0.65" />
            </linearGradient>

            {/* Subtle inner shadow filter */}
            <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.50" />
            </filter>
          </defs>

          {/* ── Outer glow ring (decorative, behind everything) ── */}
          <circle cx="18" cy="18" r="17.5" stroke={`url(#ring-${uid})`} strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* ── Circle base ── */}
          <circle cx="18" cy="18" r="16.5" fill={`url(#bg-${uid})`} />

          {/* Depth vignette for 3-D solidity */}
          <circle cx="18" cy="18" r="16.5" fill={`url(#depth-${uid})`} />

          {/* Glass sheen highlight */}
          <circle cx="18" cy="18" r="16.5" fill={`url(#sheen-${uid})`} />

          {/* Inner fine border */}
          <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.13)" strokeWidth="0.5" fill="none" />

          {/*
            ── Hero Checkmark ──
            Curved bezier path for an organic, non-generic feel.
            Bottom-left ignition → kink → soaring top-right tip.
            stroke: white (trust) → cyan (tech) → gold (approval).
          */}
          <path
            d="M 8.5 20 C 10 22 13 25.5 15.5 27.2 C 18 29 20.5 23 28 10.2"
            stroke={`url(#check-${uid})`}
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#shadow-${uid})`}
          />

          {/* Gold glow dot — premium accent at the check tip */}
          <circle cx="28" cy="10.2" r="3"   fill={`url(#dot-${uid})`} opacity="0.98" />
          {/* Specular inner core of dot */}
          <circle cx="27.2" cy="9.5" r="1.1" fill="white" opacity="0.60" />

          {/* Subtle bottom credit-chip motif */}
          <rect x="8" y="29.5" width="20" height="1.6" rx="0.8" fill="white" opacity="0.07" />
          <rect x="8" y="29.5" width="8"  height="1.6" rx="0.8" fill={`url(#ring-${uid})`} opacity="0.55" />
        </svg>
      </div>

      {/* ── Wordmark ───────────────────────────────────────────────────── */}
      {showWordmark && (
        <div className="flex flex-col" style={{ lineHeight: 1, gap: Math.round(icon * 0.1) }}>

          {/* "Tik" — brand prefix, smaller weight */}
          <span
            style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      tik,
              fontWeight:    700,
              letterSpacing: '0.04em',
              color:         variant === 'dark' ? 'rgba(255,255,255,0.52)' : '#3D4F6B',
              lineHeight:    1,
            }}
          >
            Tik
          </span>

          {/* "Credit" + PRO chip — same row */}
          <div className="flex items-center" style={{ gap: Math.round(icon * 0.16) }}>
            <span
              style={{
                fontFamily:           'var(--font-sans)',
                fontSize:             credit,
                fontWeight:           900,
                letterSpacing:        '-0.02em',
                lineHeight:           1,
                background:           variant === 'dark'
                  ? 'linear-gradient(118deg, #00D4FF 0%, #4D7FFF 55%, #A78BFA 100%)'
                  : 'linear-gradient(118deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              Credit
            </span>

            {/* PRO chip — gold gradient pill */}
            <div
              className="inline-flex shrink-0 rounded-full"
              style={{
                padding:    '1.5px',
                background: 'linear-gradient(108deg, #92400E, #D97706, #FBBF24, #FDE68A, #F59E0B, #92400E)',
                boxShadow:  '0 0 8px rgba(212,175,55,0.35)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  background: variant === 'dark' ? '#010915' : '#040C1C',
                  paddingInline: Math.round(tik * 0.6),
                  paddingBlock:  1,
                }}
              >
                <span
                  style={{
                    fontFamily:           'var(--font-sans)',
                    fontSize:             tik * 0.82,
                    fontWeight:           800,
                    letterSpacing:        '0.32em',
                    background:           'linear-gradient(90deg, #D97706, #FBBF24, #FDE68A, #F59E0B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor:  'transparent',
                    backgroundClip:       'text',
                  }}
                >
                  PRO
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default Logo
