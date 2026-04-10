// Last modified: 2026-04-10 — Next-level premium fintech icon mark
'use client'

import React from 'react'

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showWordmark?: boolean
}

const sizeMap = {
  sm: { markSize: 28, textSize: 17, subSize: 7.5 },
  md: { markSize: 36, textSize: 22, subSize: 9.5 },
  lg: { markSize: 52, textSize: 32, subSize: 12 },
}

/**
 * TikCredit Pro — Premium SVG Icon Mark + Wordmark
 *
 * Icon concept: Bold checkmark (✓) — "Tik" = Tick = Loan Approved.
 * The heroic mark is a stroke checkmark with a white→gold gradient,
 * capped with a glowing gold dot at the tip. Deep navy-to-electric-blue
 * background with glass sheen, ambient glow ring, and fine border highlight.
 *
 * Wordmark: "Tik" in midnight navy · "Credit" in electric-blue gradient
 * PRO badge: gradient pill border (gold) with dark fill + gold gradient text
 *
 * @param size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param showWordmark - show text beside the mark (default: true)
 */
const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showWordmark = true }) => {
  const { markSize, textSize, subSize } = sizeMap[size]
  // Unique IDs prevent gradient collisions when multiple logos render on screen
  const uid = size

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>

      {/* ── Icon Mark ── */}
      <div className="relative flex-shrink-0" style={{ width: markSize, height: markSize }}>

        {/* Ambient glow — radiates outward from the mark */}
        <div
          className="absolute -inset-1.5 rounded-[14px]"
          style={{
            background: 'radial-gradient(ellipse at 55% 45%, rgba(37,99,235,0.38) 0%, rgba(10,22,40,0) 68%)',
            filter: 'blur(6px)',
          }}
          aria-hidden="true"
        />

        {/* Glass glint ring — subtle gradient frame */}
        <div
          className="absolute -inset-px rounded-[10px]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 45%, rgba(212,175,55,0.22) 100%)',
            opacity: 0.7,
          }}
          aria-hidden="true"
        />

        <svg
          width={markSize}
          height={markSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          role="img"
          aria-label="TikCredit Pro logo mark"
        >
          <defs>
            {/* Deep navy → vibrant electric blue — premium fintech depth */}
            <linearGradient id={`bg-${uid}`} x1="2" y1="1" x2="34" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#040C1C" />
              <stop offset="38%" stopColor="#0E2259" />
              <stop offset="100%" stopColor="#1A48C8" />
            </linearGradient>

            {/* Inner shadow — adds bottom-right depth */}
            <linearGradient id={`depth-${uid}`} x1="0" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.18" />
            </linearGradient>

            {/* Glass sheen — top-left radial white highlight */}
            <radialGradient id={`sheen-${uid}`} cx="28%" cy="22%" r="48%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="55%" stopColor="white" stopOpacity="0.05" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Checkmark stroke: white at heel → warm gold at tip */}
            <linearGradient id={`check-${uid}`} x1="7.5" y1="19" x2="28.5" y2="10.5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0.93" />
              <stop offset="62%" stopColor="white" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.97" />
            </linearGradient>

            {/* Gold dot gradient at checkmark tip */}
            <radialGradient id={`gold-${uid}`} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>

            {/* Subtle gold shimmer on bottom card-chip accent */}
            <linearGradient id={`chip-${uid}`} x1="7" y1="29.5" x2="29" y2="29.5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.4" />
            </linearGradient>

            {/* Soft drop shadow on the checkmark for perceived depth */}
            <filter id={`cs-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000512" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* ── Background: deep navy rounded rect ── */}
          <rect x="0.5" y="0.5" width="35" height="35" rx="9.5" fill={`url(#bg-${uid})`} />

          {/* Inner depth vignette */}
          <rect x="0.5" y="0.5" width="35" height="35" rx="9.5" fill={`url(#depth-${uid})`} />

          {/* Glass sheen overlay */}
          <rect x="0.5" y="0.5" width="35" height="35" rx="9.5" fill={`url(#sheen-${uid})`} />

          {/* Fine border highlight */}
          <rect
            x="0.75" y="0.75" width="34.5" height="34.5" rx="9.25"
            stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" fill="none"
          />

          {/*
            ── Hero Checkmark ──
            The "Tik" mark: V-shape checkmark, bottom-left start, peak right
            Stroke fades white → gold, symbolizing approval & financial trust
          */}
          <path
            d="M 7.5 18.8 L 14.2 25.5 L 28.8 10.5"
            stroke={`url(#check-${uid})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#cs-${uid})`}
          />

          {/* Gold glow dot at checkmark tip — the premium accent */}
          <circle cx="28.8" cy="10.5" r="2.5" fill={`url(#gold-${uid})`} opacity="0.95" />
          {/* Inner bright core of the dot */}
          <circle cx="28.2" cy="9.9" r="0.9" fill="white" opacity="0.55" />

          {/* Credit card bottom accent — subtle horizontal chip motif */}
          <rect x="7" y="29.5" width="22" height="1.8" rx="0.9" fill="white" opacity="0.08" />
          <rect x="7" y="29.5" width="9" height="1.8" rx="0.9" fill={`url(#chip-${uid})`} />
        </svg>
      </div>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <div className="flex flex-col leading-none">

          {/* Main wordmark: Tik · Credit */}
          <div
            className="flex items-baseline"
            style={{ fontFamily: 'var(--font-sans)', lineHeight: 1 }}
          >
            <span
              className="font-black"
              style={{
                fontSize: textSize,
                color: '#040C1C',
                letterSpacing: '-0.025em',
              }}
            >
              Tik
            </span>
            <span
              className="font-black"
              style={{
                fontSize: textSize,
                letterSpacing: '-0.015em',
                background: 'linear-gradient(118deg, #1E3A8A 0%, #1D4ED8 45%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Credit
            </span>
          </div>

          {/* PRO badge — gold gradient pill border with dark background */}
          <div className="mt-[5px]">
            <div
              className="inline-flex rounded-full p-[1px]"
              style={{
                background: 'linear-gradient(105deg, #92400E, #D97706, #F59E0B, #FDE68A, #F59E0B, #B45309)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full px-2 py-[1.5px]"
                style={{ background: '#040C1C' }}
              >
                <span
                  className="font-extrabold uppercase"
                  style={{
                    fontSize: subSize,
                    letterSpacing: '0.35em',
                    fontFamily: 'var(--font-sans)',
                    background: 'linear-gradient(90deg, #D97706, #F59E0B, #FDE68A, #F59E0B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
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
