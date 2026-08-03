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
      {/* ── ICON MARK (Apple-Tier Glass & Metallic Aesthetic) ──────────────── */}
      <div 
        className="relative flex-shrink-0 flex items-center justify-center rounded-[14px] bg-gradient-to-b from-[#1A1C23] to-[#0D0E12] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-black/10"
        style={{ width: icon, height: icon }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="TikCredit Pro"
        >
          <defs>
            <filter id={`premium-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`neon-pro-${uid}`} x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00C6FF" />
              <stop offset="100%" stopColor="#0072FF" />
            </linearGradient>
            <linearGradient id={`gold-pro-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="45%" stopColor="#FDE08B" />
              <stop offset="55%" stopColor="#FDE08B" />
              <stop offset="100%" stop-color="#B8860B" />
            </linearGradient>
          </defs>

          <g transform="translate(1, -1)">
            {/* T Letter */}
            <path d="M 15 21 L 29 21" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 22 21 L 22 43" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Glowing Checkmark */}
            <path
              d="M 27 19.5 L 31 23.5 L 37 14.5"
              stroke={`url(#gold-pro-${uid})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter={`url(#premium-glow-${uid})`}
            />
            
            {/* Glowing C Arc */}
            <path
              d="M 51 25 A 12.5 12.5 0 1 0 51 41"
              stroke={`url(#neon-pro-${uid})`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              filter={`url(#premium-glow-${uid})`}
            />
          </g>
        </svg>
      </div>

      {/* ── WORDMARK ───────────────────────────────────────────────── */}
      {showWordmark && (
        <div className="flex flex-col leading-none" style={{ gap: Math.max(3, Math.round(icon * 0.085)) }}>
          {/* Row 1: Tik | Credit */}
          <div className="flex items-center" style={{ gap: Math.round(fs * 0.2) }}>
            <span
              className="font-sans font-normal uppercase tracking-[0.16em]"
              style={{
                fontSize: fs,
                lineHeight: 1,
                color: dk ? 'rgba(255,255,255,0.45)' : 'rgba(100,116,139,0.9)',
              }}
            >
              Tik
            </span>

            {/* Hairline type separator */}
            <span
              className="inline-block flex-shrink-0"
              style={{
                width: '1px',
                height: fs * 0.58,
                backgroundColor: dk ? 'rgba(255,255,255,0.2)' : 'rgba(203,213,225,0.6)',
              }}
            />

            <span
              className="font-sans font-semibold tracking-[-0.02em] text-transparent bg-clip-text"
              style={{
                fontSize: fs,
                lineHeight: 1,
                backgroundImage: dk
                  ? 'linear-gradient(122deg, #FFFFFF 0%, #93C5FD 35%, #60A5FA 65%, #3B82F6 100%)'
                  : 'linear-gradient(122deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)',
              }}
            >
              Credit
            </span>
          </div>

          {/* Row 2: PRO badge */}
          <div
            className="inline-flex self-start rounded-full p-[1px]"
            style={{
              backgroundImage: 'linear-gradient(112deg, #E2B14C, #FFEBA0, #D49926)',
              boxShadow: dk
                ? '0 2px 10px rgba(226,177,76,0.35)'
                : '0 2px 8px rgba(212,175,55,0.15)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(180deg, #1C1C1E 0%, #0C0C0E 100%)',
                paddingInline: Math.round(pro * 1.18),
                paddingBlock: Math.round(pro * 0.35),
              }}
            >
              <span
                className="font-sans font-bold tracking-[0.4em] text-transparent bg-clip-text"
                style={{
                  fontSize: pro,
                  backgroundImage: 'linear-gradient(90deg, #E2B14C, #FFEBA0, #D49926)',
                  marginLeft: '0.2em',
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
