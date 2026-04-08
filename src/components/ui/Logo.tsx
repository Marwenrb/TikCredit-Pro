// Last modified: 2026-04-08 — TikCredit Pro transformation
'use client'

import React from 'react'

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showWordmark?: boolean
}

const sizeMap = {
  sm: { markSize: 24, textSize: 16, subSize: 7 },
  md: { markSize: 32, textSize: 21, subSize: 9 },
  lg: { markSize: 48, textSize: 30, subSize: 11 },
}

/**
 * TikCredit Pro — Premium SVG Wordmark Logo
 *
 * Geometric mark: stylized TC monogram inside a rounded diamond/square
 * Colors adapt via CSS custom properties for dark/light mode
 * --logo-primary: #1E3A8A (elegant blue)
 * --logo-accent:  #F59E0B (premium gold)
 */
const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showWordmark = true }) => {
  const { markSize, textSize, subSize } = sizeMap[size]
  const radius = markSize * 0.29

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      style={
        {
          '--logo-primary': '#1E3A8A',
          '--logo-accent': '#F59E0B',
        } as React.CSSProperties
      }
    >
      {/* ── Geometric Mark ── */}
      <div className="relative flex-shrink-0" style={{ width: markSize, height: markSize }}>
        {/* Outer glow */}
        <div
          className="absolute -inset-0.5 rounded-[14px] opacity-20 blur-sm"
          style={{ background: 'linear-gradient(135deg, var(--logo-primary), #3B82F6)' }}
        />
        {/* Main container */}
        <svg
          width={markSize}
          height={markSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          role="img"
          aria-label="TikCredit Pro logo mark"
        >
          {/* Background rounded square with gradient */}
          <rect width="32" height="32" rx={radius} fill="url(#logoGradient)" />

          {/* Light refraction overlay */}
          <rect width="32" height="32" rx={radius} fill="url(#logoSheen)" />

          {/* Letter T — bold geometric */}
          <rect x="4.5" y="6" width="10" height="2.8" rx="1" fill="white" opacity="0.95" />
          <rect x="8.4" y="6" width="2.8" height="14" rx="1" fill="white" opacity="0.95" />

          {/* Letter C — clean arc */}
          <path
            d="M25 9.5C25 7.567 23.433 6 21.5 6H20.5C20.5 6 18 6 18 9.5V22.5C18 26 20.5 26 20.5 26H21.5C23.433 26 25 24.433 25 22.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.92"
          />

          {/* Gold accent bottom-right dot */}
          <rect
            x="24"
            y="24"
            width="5"
            height="5"
            rx="2"
            fill="url(#logoAccent)"
            opacity="0.95"
          />

          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="logoSheen" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0.12" />
              <stop offset="50%" stopColor="white" stopOpacity="0.04" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="logoAccent" x1="24" y1="24" x2="29" y2="29" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          {/* Main wordmark: TIK bold + CREDIT in lighter blue */}
          <div
            className="font-black tracking-tight leading-none"
            style={{ fontSize: textSize, fontFamily: 'var(--font-sans)', color: '#0A1628' }}
          >
            Tik
            <span
              style={{
                background: 'linear-gradient(90deg, #1E3A8A, #2563EB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Credit
            </span>
          </div>

          {/* Sub-label: PRO badge */}
          <div className="flex items-center gap-1 mt-0.5">
            <div
              className="rounded-full"
              style={{
                height: 1.5,
                width: subSize * 1.6,
                background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
              }}
            />
            <span
              className="font-extrabold uppercase tracking-[0.4em] leading-none"
              style={{ fontSize: subSize, color: '#B8941F', fontFamily: 'var(--font-sans)' }}
            >
              PRO
            </span>
            <div
              className="rounded-full"
              style={{
                height: 1.5,
                width: subSize * 1.6,
                background: 'linear-gradient(90deg, #FBBF24, #F59E0B)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Logo
