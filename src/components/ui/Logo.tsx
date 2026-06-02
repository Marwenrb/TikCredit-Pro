'use client'

import React, { useId } from 'react'

export interface LogoProps {
  size?:         'sm' | 'md' | 'lg'
  className?:    string
  showWordmark?: boolean
  variant?:      'light' | 'dark'
}

const dims = {
  sm: { icon: 34, fs: 15, pro: 6.5, gap: 9  },
  md: { icon: 46, fs: 20, pro: 8.5, gap: 13 },
  lg: { icon: 64, fs: 28, pro: 12,  gap: 18 },
} as const

const Logo: React.FC<LogoProps> = ({
  size         = 'md',
  className    = '',
  showWordmark = true,
  variant      = 'light',
}) => {
  const uid = useId().replace(/:/g, '')
  const { icon, fs, pro, gap } = dims[size]
  const dk = variant === 'dark'

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ gap }}>

      {/* ── ICON MARK ──────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: icon, height: icon }}>
        <svg
          width={icon} height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="TikCredit Pro"
        >
          <defs>
            {/* Deep-space background: 4-stop obsidian-to-royal-blue */}
            <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#05091A" />
              <stop offset="26%"  stopColor="#0B1838" />
              <stop offset="60%"  stopColor="#152E62" />
              <stop offset="100%" stopColor="#1A3D8C" />
            </linearGradient>

            {/* Electric neon: cyan → electric-blue → violet */}
            <linearGradient id={`neon-${uid}`} x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#00E5FF" />
              <stop offset="40%"  stopColor="#1760EE" />
              <stop offset="100%" stopColor="#6518CC" />
            </linearGradient>

            {/* Platinum gold: dark → rich → bright → rich → dark */}
            <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#5C3F08" />
              <stop offset="26%"  stopColor="#A87B1A" />
              <stop offset="50%"  stopColor="#DDB840" />
              <stop offset="74%"  stopColor="#A87B1A" />
              <stop offset="100%" stopColor="#5C3F08" />
            </linearGradient>

            {/* Crystal top-left sheen */}
            <radialGradient id={`sheen-${uid}`} cx="22%" cy="16%" r="44%">
              <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.26" />
              <stop offset="50%"  stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* Bottom ambient haze */}
            <radialGradient id={`haze-${uid}`} cx="50%" cy="90%" r="54%">
              <stop offset="0%"   stopColor="#1760EE" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#1760EE" stopOpacity="0" />
            </radialGradient>

            {/* Multi-layer letter glow */}
            <filter id={`glow-${uid}`} x="-45%" y="-45%" width="190%" height="190%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b1" />
              <feColorMatrix in="b1" type="matrix"
                values="0 0 0 0 0.04  0 0 0 0 0.42  0 0 0 0 1  0 0 0 0.38 0"
                result="cb1" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b2" />
              <feColorMatrix in="b2" type="matrix"
                values="0 0 0 0 0.04  0 0 0 0 0.55  0 0 0 0 1  0 0 0 0.55 0"
                result="cb2" />
              <feMerge>
                <feMergeNode in="cb1" />
                <feMergeNode in="cb2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gold accent glow */}
            <filter id={`glow-g-${uid}`} x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b" />
              <feColorMatrix in="b" type="matrix"
                values="0 0 0 0 0.82  0 0 0 0 0.56  0 0 0 0 0  0 0 0 0.70 0"
                result="gb" />
              <feMerge>
                <feMergeNode in="gb" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Outer ambient ring (dark variant) ──────────────── */}
          {dk && (
            <rect x="1.5" y="1.5" width="61" height="61" rx="18.5" ry="18.5"
              fill="none"
              stroke="rgba(0,200,255,0.13)"
              strokeWidth="1"
            />
          )}

          {/* ── Main body ──────────────────────────────────────── */}
          <rect x="4" y="4" width="56" height="56" rx="16" ry="16" fill={`url(#bg-${uid})`} />
          <rect x="4" y="4" width="56" height="56" rx="16" ry="16" fill={`url(#sheen-${uid})`} />
          <rect x="4" y="4" width="56" height="56" rx="16" ry="16" fill={`url(#haze-${uid})`} />

          {/* Inner micro-border */}
          <rect x="4.8" y="4.8" width="54.4" height="54.4" rx="15.4" ry="15.4"
            stroke={dk ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)'}
            strokeWidth="0.6"
            fill="none"
          />

          {/* ── Crystal facet geometry ─────────────────────────── */}
          <line x1="45" y1="4"  x2="60" y2="21" stroke="rgba(255,255,255,0.033)" strokeWidth="0.6" />
          <line x1="4"  y1="44" x2="21" y2="60" stroke="rgba(255,255,255,0.022)" strokeWidth="0.6" />

          {/* ── Corner accent arcs ─────────────────────────────── */}
          <path d="M 47 60 A 16 16 0 0 0 60 47"
            stroke={`url(#neon-${uid})`}
            strokeWidth="2" strokeLinecap="round" fill="none"
            opacity={dk ? 0.82 : 0.52}
          />
          <path d="M 17 4 A 16 16 0 0 0 4 17"
            stroke={`url(#gold-${uid})`}
            strokeWidth="1.6" strokeLinecap="round" fill="none"
            opacity={dk ? 0.72 : 0.48}
          />

          {/* ── TC Letterforms ─────────────────────────────────── */}
          <g filter={`url(#glow-${uid})`}>
            {/* T: crossbar */}
            <path d="M 12.5 18 L 29 18"
              stroke="white" strokeWidth="3.6" strokeLinecap="round" opacity="0.97" />
            {/* T: stem */}
            <path d="M 20.8 18 L 20.8 43"
              stroke="white" strokeWidth="3.6" strokeLinecap="round" opacity="0.97" />
            {/* Tick — plays on the brand name "Tik" */}
            <path d="M 27.5 17 L 30.5 20 L 35.5 13.5"
              stroke={`url(#gold-${uid})`}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              fill="none" opacity="0.88"
            />
            {/* C: open arc */}
            <path d="M 50 22 A 13.5 13.5 0 1 0 50 42"
              stroke={`url(#neon-${uid})`}
              strokeWidth="3.6" strokeLinecap="round" fill="none"
            />
          </g>

          {/* ── Gold diamond node ──────────────────────────────── */}
          <g filter={`url(#glow-g-${uid})`} transform="translate(40.5, 13.5)">
            <rect x="-3.2" y="-3.2" width="6.4" height="6.4" rx="1.3"
              transform="rotate(45)"
              fill={`url(#gold-${uid})`}
            />
            <circle cx="-1" cy="-1.2" r="1.1" fill="white" opacity="0.62" />
          </g>
        </svg>
      </div>

      {/* ── WORDMARK ───────────────────────────────────────────────── */}
      {showWordmark && (
        <div className="flex flex-col" style={{ lineHeight: 1, gap: Math.max(3, Math.round(icon * 0.085)) }}>

          {/* Row 1: Tik | Credit */}
          <div className="flex items-center" style={{ gap: Math.round(fs * 0.17) }}>
            <span
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      fs,
                fontWeight:    200,
                letterSpacing: '0.12em',
                lineHeight:    1,
                textTransform: 'uppercase' as const,
                color: dk ? 'rgba(255,255,255,0.34)' : 'rgba(5,9,26,0.34)',
              }}
            >
              Tik
            </span>

            {/* Hairline type separator */}
            <span
              style={{
                display:    'inline-block',
                width:      '1px',
                height:     fs * 0.58,
                background: dk ? 'rgba(255,255,255,0.14)' : 'rgba(5,9,26,0.09)',
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontFamily:           'var(--font-sans)',
                fontSize:             fs,
                fontWeight:           900,
                letterSpacing:        '-0.04em',
                lineHeight:           1,
                background: dk
                  ? 'linear-gradient(122deg, #FFFFFF 0%, #93C5FD 28%, #00D4FF 55%, #818CF8 82%, #C084FC 100%)'
                  : 'linear-gradient(122deg, #05091A 0%, #152E62 32%, #1760EE 62%, #2563EB 82%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              Credit
            </span>
          </div>

          {/* Row 2: PRO badge */}
          <div
            className="inline-flex self-start rounded-full"
            style={{
              padding:    '1px',
              background: 'linear-gradient(112deg, #4E3506, #9B7518, #D9B43C, #ECC95C, #9B7518, #4E3506)',
              boxShadow: dk
                ? '0 0 14px rgba(175,138,28,0.52), 0 2px 8px rgba(175,138,28,0.26)'
                : '0 0 8px rgba(175,138,28,0.30), 0 1px 4px rgba(175,138,28,0.18)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                background:    'linear-gradient(135deg, #04081A 0%, #081228 100%)',
                paddingInline: Math.round(pro * 1.18),
                paddingBlock:  Math.round(pro * 0.30),
              }}
            >
              <span
                style={{
                  fontFamily:           'var(--font-sans)',
                  fontSize:             pro,
                  fontWeight:           900,
                  letterSpacing:        '0.45em',
                  background:           'linear-gradient(90deg, #6A4A0C, #9B7518, #D9B43C, #ECC95C, #9B7518)',
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
