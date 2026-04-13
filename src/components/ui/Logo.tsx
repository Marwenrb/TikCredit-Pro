// Tik Credit Pro — Premium Logo · 2026
// TC monogram mark with neon accents + premium wordmark
'use client'

import React from 'react'

export interface LogoProps {
  /** sm = nav-compact · md = nav default · lg = hero / preloader */
  size?:         'sm' | 'md' | 'lg'
  className?:    string
  showWordmark?: boolean
  /** light = ivory/white bg · dark = navy/preloader bg */
  variant?:      'light' | 'dark'
}

const dims = {
  sm: { icon: 32, fs: 15, pro: 7,  gap: 8  },
  md: { icon: 42, fs: 19, pro: 9,  gap: 12 },
  lg: { icon: 60, fs: 28, pro: 13, gap: 16 },
} as const

const Logo: React.FC<LogoProps> = ({
  size         = 'md',
  className    = '',
  showWordmark = true,
  variant      = 'light',
}) => {
  const { icon, fs, pro, gap } = dims[size]
  const id = `tc-${size}-${variant}`
  const dk = variant === 'dark'

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap }}
    >

      {/* ── Icon Mark — TC Monogram ─────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: icon, height: icon }}>
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          role="img"
          aria-label="Tik Credit Pro"
        >
          <defs>
            {/* Main fill gradient */}
            <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              {dk
                ? <>
                    <stop offset="0%"   stopColor="#0A1628" />
                    <stop offset="40%"  stopColor="#0F2347" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </>
                : <>
                    <stop offset="0%"   stopColor="#0F2347" />
                    <stop offset="45%"  stopColor="#1E3A8A" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </>
              }
            </linearGradient>

            {/* Neon accent gradient */}
            <linearGradient id={`neon-${id}`} x1="10" y1="46" x2="46" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#00D4FF" />
              <stop offset="50%"  stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Gold accent gradient */}
            <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#8B6914" />
              <stop offset="35%"  stopColor="#D4AF37" />
              <stop offset="65%"  stopColor="#E5C76B" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>

            {/* Glass sheen */}
            <radialGradient id={`sheen-${id}`} cx="30%" cy="15%" r="50%">
              <stop offset="0%"   stopColor="#fff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>

            {/* Letter glow */}
            <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0.5" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
              {dk && <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00D4FF" floodOpacity="0.25" />}
            </filter>

            {/* Outer ring glow for dark variant */}
            {dk && (
              <filter id={`ring-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00D4FF" floodOpacity="0.20" />
              </filter>
            )}
          </defs>

          {/* ── Rounded square body ──────────────────────────── */}
          <rect x="4" y="4" width="48" height="48" rx="14" ry="14" fill={`url(#bg-${id})`} />

          {/* Glass sheen overlay */}
          <rect x="4" y="4" width="48" height="48" rx="14" ry="14" fill={`url(#sheen-${id})`} />

          {/* Subtle inner border */}
          <rect
            x="4.75" y="4.75" width="46.5" height="46.5" rx="13.5" ry="13.5"
            stroke={dk ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.08)'}
            strokeWidth="0.5" fill="none"
          />

          {/* ── Bottom-right neon accent arc ─────────────────── */}
          <path
            d="M 44 52 A 14 14 0 0 0 52 44"
            stroke={`url(#neon-${id})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity={dk ? 0.6 : 0.35}
          />

          {/* ── Top-left gold accent arc ─────────────────────── */}
          <path
            d="M 12 4 A 14 14 0 0 0 4 12"
            stroke={`url(#gold-${id})`}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity={dk ? 0.5 : 0.3}
          />

          {/* ── TC Monogram ──────────────────────────────────── */}
          <g filter={`url(#glow-${id})`}>
            {/* T — clean geometric */}
            <path
              d="M 14 16 L 28 16"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.95"
            />
            <path
              d="M 21 16 L 21 38"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* C — open arc, slightly overlapping the T stem */}
            <path
              d="M 42 20 A 12 12 0 1 0 42 36"
              stroke={`url(#neon-${id})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* ── Gold diamond accent at intersection ──────────── */}
          <g transform="translate(36, 14)">
            <rect
              x="-2.5" y="-2.5" width="5" height="5" rx="1"
              transform="rotate(45)"
              fill={`url(#gold-${id})`}
            />
            {/* Specular highlight */}
            <circle cx="-0.8" cy="-1" r="0.8" fill="white" opacity="0.55" />
          </g>
        </svg>
      </div>

      {/* ── Wordmark ─────────────────────────────────────────────── */}
      {showWordmark && (
        <div className="flex flex-col" style={{ lineHeight: 1, gap: Math.max(2, Math.round(icon * 0.07)) }}>

          {/* Tik Credit — single baseline */}
          <div className="flex items-baseline" style={{ gap: Math.round(fs * 0.18) }}>
            <span
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      fs,
                fontWeight:    300,
                letterSpacing: '0.06em',
                lineHeight:    1,
                textTransform: 'uppercase' as const,
                color: dk ? 'rgba(255,255,255,0.45)' : 'rgba(10,22,40,0.45)',
              }}
            >
              Tik
            </span>
            <span
              style={{
                fontFamily:           'var(--font-sans)',
                fontSize:             fs,
                fontWeight:           900,
                letterSpacing:        '-0.03em',
                lineHeight:           1,
                background: dk
                  ? 'linear-gradient(115deg, #FFFFFF 0%, #00D4FF 45%, #3B82F6 80%, #7C3AED 100%)'
                  : 'linear-gradient(115deg, #0A1628 0%, #1E3A8A 40%, #2563EB 75%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              Credit
            </span>
          </div>

          {/* PRO pill — gold border, dark fill */}
          <div
            className="inline-flex self-start rounded-full"
            style={{
              padding:    '1.5px',
              background: 'linear-gradient(105deg, #8B6914, #D4AF37, #E5C76B, #D4AF37, #8B6914)',
              boxShadow: dk
                ? '0 0 10px rgba(212,175,55,0.35), 0 0 20px rgba(212,175,55,0.15)'
                : '0 0 6px rgba(212,175,55,0.20)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                background:    '#0A1628',
                paddingInline: Math.round(pro * 1.0),
                paddingBlock:  Math.round(pro * 0.22),
              }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             pro,
                  fontWeight:           900,
                  letterSpacing:        '0.38em',
                  background:           'linear-gradient(90deg, #B8941F, #D4AF37, #E5C76B, #D4AF37)',
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
      )}
    </div>
  )
}

export default Logo
