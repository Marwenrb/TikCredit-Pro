'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface LoaderProps {
  /** sm = inline dots · md = ring dots · lg = letter glow · fullscreen = full spectrum */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  className?: string
  /** Custom text shown in lg + fullscreen (default: "TikCredit") */
  label?: string
}

// ── CSS keyframes — injected once as a <style> tag ─────────────────────────
// All animations are GPU-composited (opacity + transform only)
const KEYFRAMES = `
  @keyframes tc-letter {
    0%   { opacity: 0; transform: scale(1) translateY(0px); }
    5%   { opacity: 1; transform: scale(1.12) translateY(-3px);
            text-shadow: 0 0 8px #fff, 0 0 20px rgba(99,179,237,0.8); }
    22%  { opacity: 0.18; transform: scale(1) translateY(0px); text-shadow: none; }
    100% { opacity: 0; }
  }
  @keyframes tc-sweep {
    0%   { transform: translateX(-58%); }
    100% { transform: translateX(58%); }
  }
  @keyframes tc-fade {
    0%, 100% { opacity: 0; }
    14%       { opacity: 1; }
    62%       { opacity: 0; }
  }
  @keyframes tc-dot {
    0%, 100% { transform: translateY(0px); opacity: 0.35; }
    50%       { transform: translateY(-7px); opacity: 1; }
  }
  @keyframes tc-ring-spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

// ── Letter timing (10-slot grid, ~107ms apart) ──────────────────────────────
const LETTER_DELAYS = [0.1, 0.207, 0.314, 0.421, 0.528, 0.635, 0.742, 0.849, 0.956, 1.063]

// ── Sub-components ────────────────────────────────────────────────────────────

/** sm: three animated gold + blue dots */
function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full"
          style={{
            background: i === 1
              ? 'linear-gradient(135deg,#D4AF37,#F59E0B)'
              : 'linear-gradient(135deg,#1E3A8A,#2563EB)',
            animation: 'tc-dot 1.1s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  )
}

/** md: five-dot ring orbit */
function RingLoader({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-10 w-10 items-center justify-center', className)}>
      {/* outer ring arc */}
      <span
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: '#2563EB',
          borderRightColor: '#D4AF37',
          animation: 'tc-ring-spin 1s linear infinite',
        }}
      />
      {/* inner ring arc (opposite direction) */}
      <span
        className="absolute inset-1.5 rounded-full border-2 border-transparent"
        style={{
          borderBottomColor: '#1E3A8A',
          borderLeftColor: '#F59E0B',
          animation: 'tc-ring-spin 0.7s linear infinite reverse',
        }}
      />
      {/* center dot */}
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #2563EB)' }}
      />
    </div>
  )
}

/** lg + fullscreen: letter glow animation with optional spectrum sweep */
function LetterLoader({
  text,
  showSweep,
  className,
}: {
  text: string
  showSweep: boolean
  className?: string
}) {
  const letters = text.slice(0, 10).split('')

  return (
    <div
      className={cn('relative flex items-center justify-center select-none', className)}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Letters ── */}
      {letters.map((char, i) => (
        <span
          key={i}
          className="relative z-10 inline-block font-black text-white"
          style={{
            fontSize: showSweep ? '2rem' : '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            opacity: 0,
            animation: 'tc-letter 4s infinite linear',
            animationDelay: `${LETTER_DELAYS[i] ?? i * 0.107}s`,
          }}
        >
          {char}
        </span>
      ))}

      {/* ── Spectrum sweep (fullscreen only) ── */}
      {showSweep && (
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            // scan-line mask: 1px opaque bars every 8px
            mask: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, black 7px, black 8px)',
            WebkitMask: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, black 7px, black 8px)',
          }}
        >
          {/* the rainbow sweep element */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: [
                'radial-gradient(circle at 50% 50%, #ffe066 0%, transparent 50%)',
                'radial-gradient(circle at 45% 45%, #ff4757 0%, transparent 45%)',
                'radial-gradient(circle at 55% 55%, #00e5ff 0%, transparent 45%)',
                'radial-gradient(circle at 45% 55%, #2ed573 0%, transparent 45%)',
                'radial-gradient(circle at 55% 45%, #5352ed 0%, transparent 45%)',
              ].join(','),
              // ring mask: only reveal the mid-region, not center or outer
              maskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 8%, black 22%, black 28%, transparent 50%)`,
              WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 8%, black 22%, black 28%, transparent 50%)`,
              animation: 'tc-sweep 2s cubic-bezier(0.6,0.8,0.5,1) infinite alternate, tc-fade 4s infinite',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const prefersReducedMotion = useReducedMotion()

  // Inject keyframes once — safe for SSR (client component only)
  const styleTag = <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

  // Reduced motion: static skeleton instead of animated elements
  if (prefersReducedMotion) {
    if (size === 'fullscreen') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lux-navy/90 backdrop-blur-md">
          <p className="text-lg font-bold text-white">{label ?? 'TikCredit'}</p>
        </div>
      )
    }
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div className="h-5 w-5 rounded-full border-2 border-lux-sapphire border-t-transparent" />
        {label && <span className="text-sm text-gray-500">{label}</span>}
      </div>
    )
  }

  // ── sm: dots ──────────────────────────────────────────────────────────────
  if (size === 'sm') {
    return (
      <>
        {styleTag}
        <DotsLoader className={className} />
      </>
    )
  }

  // ── md: dual-ring orbit ───────────────────────────────────────────────────
  if (size === 'md') {
    return (
      <>
        {styleTag}
        <div className={cn('flex items-center justify-center gap-3', className)}>
          <RingLoader />
          {label && <span className="text-sm font-medium text-gray-500">{label}</span>}
        </div>
      </>
    )
  }

  // ── lg: letter glow (no sweep) — for inline use on dark surfaces ──────────
  if (size === 'lg') {
    return (
      <>
        {styleTag}
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-2xl px-6 py-3',
            'bg-gradient-to-r from-lux-navy to-[#0E2259]',
            'shadow-[0_4px_32px_rgba(30,58,138,0.35)]',
            className,
          )}
        >
          <LetterLoader
            text={label ?? 'TikCredit'}
            showSweep={false}
          />
        </div>
      </>
    )
  }

  // ── fullscreen: dark overlay + full letter + spectrum sweep ───────────────
  return (
    <>
      {styleTag}
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at 50% 42%, #0E2259 0%, #040C1C 65%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top edge glow bar */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.6) 30%, rgba(212,175,55,0.6) 60%, transparent)',
          }}
        />

        {/* Ambient orbs */}
        <div
          aria-hidden="true"
          className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent 70%)' }}
        />

        {/* Letter animation with spectrum sweep */}
        <LetterLoader
          text={label ?? 'TikCredit'}
          showSweep={true}
          className="scale-[2] md:scale-[2.5]"
        />

        {/* Sub-label below */}
        <motion.p
          className="mt-20 text-xs font-semibold uppercase tracking-[0.32em] text-white/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          جاري التحميل…
        </motion.p>

        {/* Bottom progress bar */}
        <motion.div
          className="absolute bottom-10 left-1/2 h-[2px] w-32 -translate-x-1/2 overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #1E3A8A, #2563EB, #D4AF37)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </>
  )
}

export default Loader
