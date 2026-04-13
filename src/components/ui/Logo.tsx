// Tik Credit Pro — Logo · clean rewrite · 2026
// Uses actual theme tokens: lux-navy #0A1628 · lux-sapphire #1E3A8A
// elegant-blue #2563EB · elegant-blue-light #3B82F6 · premium-gold #D4AF37
// neon-blue #00D4FF
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
  sm: { icon: 30, fs: 14, pro: 7,  gap: 8  },
  md: { icon: 40, fs: 18, pro: 9,  gap: 12 },
  lg: { icon: 56, fs: 25, pro: 13, gap: 16 },
} as const

const Logo: React.FC<LogoProps> = ({
  size         = 'md',
  className    = '',
  showWordmark = true,
  variant      = 'light',
}) => {
  const { icon, fs, pro, gap } = dims[size]
  const id  = `tc-${size}-${variant}`
  const dk = variant === 'dark'

  /* ── Gradient stops by variant ──────────────────────────────────── */
  // Light: CTA gradient (sapphire → blue → light) — pops on ivory bg
  // Dark:  Hero gradient (navy → sapphire → blue)  — deep & cinematic
  const fillStops = dk
    ? [['0%','#0A1628'],['55%','#1E3A8A'],['100%','#2563EB']]
    : [['0%','#1E3A8A'],['50%','#2563EB'],['100%','#3B82F6']]

  // Check gradient
  // Light: pure white (high contrast on blue fill)
  // Dark:  white → neon-blue → gold sweep
  const checkStops = dk
    ? [['0%','#FFFFFF','0.97'],['45%','#00D4FF','0.93'],['100%','#D4AF37','0.95']]
    : [['0%','#FFFFFF','0.98'],['50%','#FFFFFF','0.96'],['100%','#FFFFFF','0.90']]

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap }}
    >

      {/* ── Icon ─────────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: icon, height: icon }}>
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          role="img"
          aria-label="Tik Credit Pro"
        >
          <defs>
            <linearGradient id={`f-${id}`} x1="7" y1="7" x2="37" y2="37" gradientUnits="userSpaceOnUse">
              {fillStops.map(([o, c]) => (
                <stop key={o} offset={o} stopColor={c} />
              ))}
            </linearGradient>

            <linearGradient id={`ck-${id}`} x1="13" y1="26" x2="33" y2="13" gradientUnits="userSpaceOnUse">
              {checkStops.map(([o, c, a]) => (
                <stop key={o} offset={o} stopColor={c} stopOpacity={a} />
              ))}
            </linearGradient>

            <radialGradient id={`sh-${id}`} cx="28%" cy="18%" r="48%">
              <stop offset="0%"   stopColor="#fff" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>

            <radialGradient id={`gd-${id}`} cx="36%" cy="30%" r="52%">
              <stop offset="0%"   stopColor="#FEF3C7" />
              <stop offset="40%"  stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B6914" />
            </radialGradient>

            <filter id={`gl-${id}`} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.8" floodColor="#000" floodOpacity="0.50" />
              {dk && <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00D4FF" floodOpacity="0.28" />}
            </filter>
          </defs>

          {/* Squircle body */}
          <rect x="7" y="7" width="30" height="30" rx="9" ry="9" fill={`url(#f-${id})`} />
          <rect x="7" y="7" width="30" height="30" rx="9" ry="9" fill={`url(#sh-${id})`} />

          {/* Inner rim */}
          <rect
            x="7.6" y="7.6" width="28.8" height="28.8" rx="8.5" ry="8.5"
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" fill="none"
          />

          {/* Checkmark */}
          <path
            d="M 13 23 L 19.5 30.5 L 33 13.5"
            stroke={`url(#ck-${id})`}
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#gl-${id})`}
          />

          {/* Gold dot at tip */}
          <circle cx="33" cy="13.5" r="3" fill={`url(#gd-${id})`} />
          <circle cx="32.3" cy="12.8" r="1" fill="white" opacity="0.65" />
        </svg>
      </div>

      {/* ── Wordmark ─────────────────────────────────────────────── */}
      {showWordmark && (
        <div className="flex flex-col" style={{ lineHeight: 1, gap: Math.max(3, Math.round(icon * 0.09)) }}>

          {/* Tik Credit */}
          <div className="flex items-baseline" style={{ gap: Math.round(fs * 0.20) }}>
            <span
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      fs,
                fontWeight:    400,
                letterSpacing: '0.03em',
                lineHeight:    1,
                color: dk ? 'rgba(255,255,255,0.50)' : '#0A1628',
                opacity: dk ? 1 : 0.52,
              }}
            >
              Tik
            </span>
            <span
              style={{
                fontFamily:           'var(--font-sans)',
                fontSize:             fs,
                fontWeight:           800,
                letterSpacing:        '-0.025em',
                lineHeight:           1,
                background: dk
                  ? 'linear-gradient(112deg, #00D4FF 0%, #3B82F6 55%, #7C3AED 100%)'
                  : 'linear-gradient(112deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              Credit
            </span>
          </div>

          {/* PRO pill */}
          <div
            className="inline-flex self-start rounded-full"
            style={{
              padding:    '1.5px',
              background: 'linear-gradient(108deg, #8B6914, #B8941F, #D4AF37, #E5C76B, #D4AF37, #8B6914)',
              boxShadow: dk
                ? '0 0 10px rgba(212,175,55,0.40)'
                : '0 0 6px rgba(212,175,55,0.25)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                background:    dk ? '#0A1628' : '#0A1628',
                paddingInline: Math.round(pro * 0.9),
                paddingBlock:  Math.round(pro * 0.2),
              }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             pro,
                  fontWeight:           800,
                  letterSpacing:        '0.36em',
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
