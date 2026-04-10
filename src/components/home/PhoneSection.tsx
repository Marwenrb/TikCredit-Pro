'use client'

import React, { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Smartphone, Zap, Shield, Crown, Check } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type ActivePlan = '6m' | '12m'

interface Phone {
  id:       string
  model:    string
  brand:    string
  price6m:  number
  price12m: number
  accent:   string
  rgb:      string
  gradient: string
  badge:    string
  emoji:    string
  role:     'featured' | 'mini' | 'wide'
  specs?:   string[]
}

const expo = [0.16, 1, 0.3, 1] as const

// ── Phone Catalogue ─────────────────────────────────────────────────────────
const PHONES: Phone[] = [
  {
    id:       'galaxy-a55',
    model:    'Galaxy A55',
    brand:    'Samsung',
    price6m:  4_200,
    price12m: 2_300,
    accent:   '#4D7FFF',
    rgb:      '77,127,255',
    gradient: 'linear-gradient(145deg, #1428A0, #0055B3)',
    badge:    '★ Best Seller',
    emoji:    '📱',
    role:     'featured',
    specs:    ['AMOLED 6.6"', '50 MP Triple', '5000 mAh'],
  },
  {
    id:       'iphone-13',
    model:    'iPhone 13',
    brand:    'Apple',
    price6m:  7_800,
    price12m: 4_100,
    accent:   '#C8C8D4',
    rgb:      '200,200,212',
    gradient: 'linear-gradient(145deg, #3A3A3C, #1C1C1E)',
    badge:    '👑 Premium',
    emoji:    '🍎',
    role:     'mini',
  },
  {
    id:       'xiaomi-note13',
    model:    'Redmi Note 13',
    brand:    'Xiaomi',
    price6m:  2_800,
    price12m: 1_500,
    accent:   '#FF8C42',
    rgb:      '255,140,66',
    gradient: 'linear-gradient(145deg, #E02B00, #FF4500)',
    badge:    '🔥 Prix Choc',
    emoji:    '💥',
    role:     'mini',
  },
  {
    id:       'galaxy-s23fe',
    model:    'Galaxy S23 FE',
    brand:    'Samsung',
    price6m:  6_000,
    price12m: 3_200,
    accent:   '#60A5FA',
    rgb:      '96,165,250',
    gradient: 'linear-gradient(145deg, #1428A0, #2563EB)',
    badge:    '✨ Fan Édition',
    emoji:    '🌟',
    role:     'wide',
    specs:    ['Dynamic AMOLED 6.4"', '50 MP Camera', '4000 mAh'],
  },
]

// ── AnimatedPrice ─────────────────────────────────────────────────────────
function AnimatedPrice({
  price, accent, plan, large = false,
}: { price: number; accent: string; plan: ActivePlan; large?: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${price}-${plan}`}
        initial={{ opacity: 0, y: 10,  filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0,   filter: 'blur(0px)'  }}
        exit={   { opacity: 0, y: -10, filter: 'blur(10px)' }}
        transition={{ duration: 0.35, ease: expo }}
      >
        <div className="flex items-end gap-2 leading-none">
          <span
            className="font-black tracking-tight text-white"
            style={{ fontSize: large ? 'clamp(2.4rem, 4.5vw, 3.2rem)' : 'clamp(1.55rem, 2.8vw, 1.9rem)' }}
          >
            {price.toLocaleString('fr-DZ')}
          </span>
          <span className="pb-1.5 text-[11px] font-bold" style={{ color: accent }}>DA/mois</span>
        </div>
        <p className="mt-1 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
          × {plan === '6m' ? 6 : 12} mensualités · 0% intérêts
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

// ── SpinningBorder — GPU-composited conic neon ring ───────────────────────
function SpinningBorder({
  accent, radius = 26, speed = 6, alwaysOn = false, reduced,
}: { accent: string; radius?: number; speed?: number; alwaysOn?: boolean; reduced: boolean | null }) {
  if (reduced) return null
  return (
    <motion.div
      className={`pointer-events-none absolute -inset-[2px] ${
        alwaysOn ? 'opacity-60' : 'opacity-0 transition-opacity duration-500 group-hover:opacity-100'
      }`}
      animate={{ rotate: 360 }}
      transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      aria-hidden="true"
      style={{
        borderRadius: `${radius}px`,
        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 105deg, ${accent} 185deg, transparent 255deg, transparent 360deg)`,
      }}
    />
  )
}

// ── FeaturedCard ─────────────────────────────────────────────────────────
function FeaturedCard({ phone, plan, reduced }: {
  phone: Phone; plan: ActivePlan; reduced: boolean | null
}) {
  const price = plan === '6m' ? phone.price6m : phone.price12m
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: expo }}
      className="group relative md:col-span-2 lg:col-span-2 lg:row-span-2"
      aria-label={`${phone.model} — ${price.toLocaleString('fr-DZ')} DA/mois — Best Seller`}
    >
      <SpinningBorder accent={phone.accent} radius={28} speed={4} alwaysOn reduced={reduced} />

      <div
        className="relative h-full overflow-hidden rounded-[26px]"
        style={{
          background: 'linear-gradient(160deg, rgba(8,14,32,0.99) 0%, rgba(4,8,22,1) 100%)',
          border:     '1px solid rgba(77,127,255,0.2)',
          boxShadow:  '0 16px 70px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)',
          minHeight:  '320px',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${phone.accent}, #00D4FF, transparent)` }}
          aria-hidden="true"
        />
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[420px] -translate-x-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, rgba(77,127,255,0.1) 0%, transparent 65%)` }}
          aria-hidden="true"
        />

        {/* Best-seller badge */}
        <div className="absolute left-5 top-5 z-20">
          <div
            className="rounded-full px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.26em] text-black"
            style={{ background: `linear-gradient(90deg, ${phone.accent}, #00E5FF)` }}
          >
            {phone.badge}
          </div>
        </div>

        {/* Inner layout: stack on mobile, side-by-side on lg */}
        <div className="flex h-full flex-col lg:flex-row">

          {/* Visual column */}
          <div
            className="flex min-h-[180px] flex-1 items-center justify-center p-8 lg:min-h-0"
            aria-hidden="true"
          >
            <div className="relative">
              {/* Bloom glow */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: `radial-gradient(circle, rgba(77,127,255,0.22) 0%, transparent 65%)`, filter: 'blur(20px)' }}
              />
              {/* Phone mockup */}
              <div
                className="relative mx-auto flex h-[148px] w-[95px] items-center justify-center overflow-hidden rounded-[24px]"
                style={{
                  background: phone.gradient,
                  boxShadow:  `0 24px 64px rgba(77,127,255,0.55), inset 0 1px 0 rgba(255,255,255,0.22)`,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 48%)' }}
                />
                <span className="relative z-10 text-5xl" role="img" aria-label={phone.model}>{phone.emoji}</span>
              </div>
              <p className="mt-3 text-center text-[9px] font-black uppercase tracking-[0.32em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                {phone.brand}
              </p>
            </div>
          </div>

          {/* Vertical divider lg only */}
          <div
            className="mx-0 hidden w-px self-stretch lg:block"
            style={{ background: 'linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent 95%)' }}
            aria-hidden="true"
          />

          {/* Detail column */}
          <div className="flex flex-1 flex-col justify-between p-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.32em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                {phone.brand}
              </p>
              <h4 className="mt-1 text-[1.5rem] font-black leading-tight tracking-tight text-white">
                {phone.model}
              </h4>

              {/* Specs list */}
              {phone.specs && (
                <ul className="mt-4 space-y-2">
                  {phone.specs.map(s => (
                    <li key={s} className="flex items-center gap-2.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      <Check
                        className="h-3 w-3 flex-shrink-0"
                        style={{ color: phone.accent }}
                        aria-hidden="true"
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price + CTA */}
            <div className="mt-6 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <AnimatedPrice price={price} accent={phone.accent} plan={plan} large />

              <Link href="/form" className="mt-5 block">
                <motion.span
                  whileHover={reduced ? undefined : { scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D7FFF]"
                  style={{
                    background: `linear-gradient(135deg, rgba(77,127,255,0.22) 0%, rgba(0,212,255,0.13) 100%)`,
                    border:     `1.5px solid rgba(77,127,255,0.42)`,
                    boxShadow:  '0 0 28px rgba(77,127,255,0.15)',
                  }}
                >
                  <Smartphone className="h-4 w-4" aria-hidden="true" />
                  <span>Commencer ma demande</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </motion.span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </motion.article>
  )
}

// ── MiniCard ─────────────────────────────────────────────────────────────
function MiniCard({ phone, plan, index, reduced }: {
  phone: Phone; plan: ActivePlan; index: number; reduced: boolean | null
}) {
  const price = plan === '6m' ? phone.price6m : phone.price12m
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: expo }}
      whileHover={reduced ? undefined : { y: -6 }}
      className="group relative cursor-pointer"
      aria-label={`${phone.model} — ${price.toLocaleString('fr-DZ')} DA/mois`}
    >
      <SpinningBorder accent={phone.accent} radius={22} reduced={reduced} />

      <div
        className="relative overflow-hidden rounded-[20px] p-5"
        style={{
          background: 'linear-gradient(160deg, rgba(8,14,32,0.99) 0%, rgba(4,8,22,1) 100%)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 8px 40px rgba(0,0,0,0.65)',
        }}
      >
        {/* Top neon hairline */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${phone.accent}, transparent)` }}
          aria-hidden="true"
        />
        {/* Hover ambient */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% -10%, rgba(${phone.rgb},0.13), transparent 58%)` }}
          aria-hidden="true"
        />

        {/* Header row */}
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {phone.brand}
            </p>
            <h4 className="mt-0.5 text-[0.92rem] font-black leading-tight text-white">{phone.model}</h4>
            <div
              className="mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[7.5px] font-black uppercase tracking-[0.14em]"
              style={{
                background: `rgba(${phone.rgb},0.12)`,
                border:     `1px solid rgba(${phone.rgb},0.28)`,
                color:       phone.accent,
              }}
            >
              {phone.badge}
            </div>
          </div>
          {/* Phone icon */}
          <div
            className="flex h-[50px] w-[40px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
            style={{
              background: phone.gradient,
              boxShadow:  `0 6px 22px rgba(${phone.rgb},0.48)`,
            }}
            aria-hidden="true"
          >
            <span className="text-xl">{phone.emoji}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="relative mt-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <AnimatedPrice price={price} accent={phone.accent} plan={plan} />
        </div>

        <Link href="/form" tabIndex={-1} aria-hidden="true">
          <motion.span
            whileTap={{ scale: 0.95 }}
            className="relative mt-3 flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-[12px] text-xs font-bold transition-all duration-300"
            style={{
              background: `rgba(${phone.rgb},0.1)`,
              border:     `1px solid rgba(${phone.rgb},0.22)`,
              color:       phone.accent,
            }}
          >
            <span>Je prends</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.span>
        </Link>
      </div>
    </motion.article>
  )
}

// ── WideCard ──────────────────────────────────────────────────────────────
function WideCard({ phone, plan, reduced }: {
  phone: Phone; plan: ActivePlan; reduced: boolean | null
}) {
  const price = plan === '6m' ? phone.price6m : phone.price12m
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay: 0.08, ease: expo }}
      whileHover={reduced ? undefined : { y: -4 }}
      className="group relative cursor-pointer md:col-span-2 lg:col-span-3"
      aria-label={`${phone.model} — ${price.toLocaleString('fr-DZ')} DA/mois`}
    >
      <SpinningBorder accent={phone.accent} radius={22} speed={7} reduced={reduced} />

      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(135deg, rgba(8,14,32,0.99) 0%, rgba(4,8,22,1) 100%)',
          border:     '1px solid rgba(96,165,250,0.14)',
          boxShadow:  '0 8px 44px rgba(0,0,0,0.65)',
        }}
      >
        {/* Top neon hairline */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${phone.accent} 30%, #4D7FFF 70%, transparent)` }}
          aria-hidden="true"
        />
        {/* Hover ambient */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(ellipse at 50% -20%, rgba(${phone.rgb},0.09), transparent 55%)` }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-0">

          {/* Left: brand + model */}
          <div className="flex items-center gap-4 sm:flex-1">
            <div
              className="flex h-[52px] w-[42px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
              style={{ background: phone.gradient, boxShadow: `0 8px 28px rgba(${phone.rgb},0.42)` }}
              aria-hidden="true"
            >
              <span className="text-2xl">{phone.emoji}</span>
            </div>
            <div>
              <div
                className="mb-1 inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em]"
                style={{
                  background: `rgba(${phone.rgb},0.12)`,
                  border:     `1px solid rgba(${phone.rgb},0.26)`,
                  color:       phone.accent,
                }}
              >
                {phone.badge}
              </div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                {phone.brand}
              </p>
              <h4 className="text-[1.05rem] font-black leading-tight text-white">{phone.model}</h4>
            </div>
          </div>

          {/* Divider */}
          <div
            className="hidden h-12 w-px sm:block"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)' }}
            aria-hidden="true"
          />

          {/* Middle: specs */}
          <div className="hidden flex-1 items-center justify-center gap-6 px-8 sm:flex">
            {(phone.specs ?? []).map(s => (
              <span key={s} className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.36)' }}>
                {s}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            className="hidden h-12 w-px sm:block"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)' }}
            aria-hidden="true"
          />

          {/* Right: price + CTA */}
          <div className="flex items-center justify-between gap-5 sm:justify-end sm:pl-8">
            <AnimatedPrice price={price} accent={phone.accent} plan={plan} />

            <Link href="/form" tabIndex={-1} aria-hidden="true">
              <motion.span
                whileTap={{ scale: 0.96 }}
                className="flex min-h-[46px] flex-shrink-0 items-center justify-center gap-2 rounded-[12px] px-5 text-[0.8rem] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: `rgba(${phone.rgb},0.12)`,
                  border:     `1.5px solid rgba(${phone.rgb},0.28)`,
                  color:       phone.accent,
                }}
              >
                <span>Je prends</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </motion.span>
            </Link>
          </div>

        </div>
      </div>
    </motion.article>
  )
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function PhoneSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [plan, setPlan]  = useState<ActivePlan>('6m')
  const reduced          = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const orbY  = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-12%',  '12%'])
  const orbY2 = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : [ '8%',  '-8%'] )

  const featuredPhone = PHONES.find(p => p.role === 'featured')!
  const miniPhones    = PHONES.filter(p => p.role === 'mini')
  const widePhone     = PHONES.find(p => p.role === 'wide')!

  return (
    <section
      ref={sectionRef}
      id="telephone-facilite"
      aria-labelledby="phone-section-heading"
      dir="ltr"
      className="relative overflow-hidden py-14 md:py-20 font-sans"
      style={{ background: 'linear-gradient(180deg, #020508 0%, #030A12 50%, #020508 100%)' }}
    >
      {/* ── Aurora blobs ─────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[580px] w-[580px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 65%)',
          y: orbY,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 bottom-0 h-[480px] w-[480px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 62%)',
          y: orbY2,
        }}
      />

      {/* ── Dot grid ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />

      {/* ── Scanlines ────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0, transparent 1px, rgba(255,255,255,0.15) 1px, rgba(255,255,255,0.15) 2px)',
          backgroundSize:  '100% 4px',
        }}
      />

      {/* ── Watermark ────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden text-center font-black uppercase leading-none"
        style={{
          fontSize:      'clamp(100px, 22vw, 320px)',
          color:         'rgba(255,255,255,0.016)',
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
        }}
      >
        CRÉDIT
      </div>

      <div className="container relative z-10 mx-auto px-5 sm:px-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="mb-10 text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: expo }}
            className="inline-flex flex-wrap items-center gap-3 rounded-full px-4 py-1.5"
            style={{
              background: 'rgba(0,212,255,0.06)',
              border:     '1px solid rgba(0,212,255,0.2)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-55" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.34em]" style={{ color: '#00D4FF' }}>
              Facilité Smartphone · Tik Credit Pro
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span dir="rtl" className="font-arabic text-sm font-bold" style={{ color: 'rgba(255,255,255,0.62)' }}>
              هاتفك بالتقسيط
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            id="phone-section-heading"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: 0.08, ease: expo }}
            className="mt-7 font-black leading-[1.04] tracking-tight"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5.2rem)' }}
          >
            <span className="block text-white">Ton smartphone —</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(118deg, #00D4FF 8%, #4D7FFF 46%, #D4AF37 100%)' }}
            >
              بالتقسيط، maintenant.
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.14, ease: expo }}
            className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.48)' }}
          >
            Bla avance, bla galère — livraison{' '}
            <span className="font-black text-white">48h</span>, zéro intérêts, tout en ligne.
          </motion.p>

          {/* Stat chips — inline row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2, ease: expo }}
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
            aria-label="Avantages clés"
          >
            {[
              { value: '0%',   label: 'intérêts',  color: '#10B981', rgb: '16,185,129'  },
              { value: '48H',  label: 'livraison', color: '#00D4FF', rgb: '0,212,255'   },
              { value: '6/12', label: 'mois',      color: '#D4AF37', rgb: '212,175,55'  },
            ].map(({ value, label, color, rgb }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{
                  background: `rgba(${rgb},0.08)`,
                  border:     `1px solid rgba(${rgb},0.22)`,
                }}
              >
                <span className="text-sm font-black" style={{ color }}>{value}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </header>

        {/* ── Plan toggle — underline tabs ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.05, ease: expo }}
          className="mb-7 flex items-center justify-center"
        >
          <div
            className="flex items-center gap-0 border-b"
            role="radiogroup"
            aria-label="Durée de la facilité"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {(['6m', '12m'] as const).map((p) => {
              const isActive = plan === p
              const color    = p === '6m' ? '#F97316' : '#00D4FF'
              return (
                <button
                  key={p}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setPlan(p)}
                  className="relative px-7 pb-3 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ ['--tw-ring-color' as string]: color }}
                >
                  <span
                    className="text-sm font-black uppercase tracking-[0.22em] transition-colors duration-250"
                    style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.28)' }}
                  >
                    {p === '6m' ? '6 Mois' : '12 Mois'}
                  </span>
                  <span
                    className="block text-center text-[9px] font-bold uppercase tracking-[0.18em] transition-colors duration-250"
                    style={{ color: isActive ? color : 'rgba(255,255,255,0.18)' }}
                  >
                    {p === '6m' ? 'rapide' : 'allégé'}
                  </span>

                  {/* Active underline — layoutId spring */}
                  {isActive && (
                    <motion.div
                      layoutId="plan-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: color, boxShadow: `0 0 12px ${color}80` }}
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* ── Bento Grid ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]"
          role="list"
          aria-label="Modèles disponibles"
        >
          {/* Featured: 2×2 on lg */}
          <div role="listitem">
            <FeaturedCard phone={featuredPhone} plan={plan} reduced={reduced} />
          </div>

          {/* Mini cards: stack in col 3 on lg */}
          {miniPhones.map((phone, i) => (
            <div key={phone.id} role="listitem">
              <MiniCard phone={phone} plan={plan} index={i} reduced={reduced} />
            </div>
          ))}

          {/* Wide card: full row on lg */}
          <div role="listitem">
            <WideCard phone={widePhone} plan={plan} reduced={reduced} />
          </div>
        </motion.div>

        {/* ── Trust strip — horizontal chips ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.6, delay: 0.1, ease: expo }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          role="list"
          aria-label="Garanties"
        >
          {[
            { Icon: Zap,    text: 'Accord instantané',       color: '#F97316', rgb: '249,115,22'  },
            { Icon: Shield, text: '0% intérêts — garanti',   color: '#10B981', rgb: '16,185,129'  },
            { Icon: Crown,  text: 'Livraison 48h gratuite',  color: '#D4AF37', rgb: '212,175,55'  },
          ].map(({ Icon, text, color, rgb }) => (
            <div
              key={text}
              role="listitem"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: `rgba(${rgb},0.07)`,
                border:     `1px solid rgba(${rgb},0.18)`,
              }}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} aria-hidden="true" />
              <span className="text-[11px] font-bold text-white">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.6, delay: 0.15, ease: expo }}
          className="mt-7 text-center"
        >
          <Link href="/form">
            <motion.span
              whileHover={reduced ? undefined : { scale: 1.025, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex min-h-[58px] items-center justify-center gap-3 overflow-hidden rounded-[20px] px-9 py-3.5 text-base font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
              style={{
                background: 'linear-gradient(135deg, #0055B3 0%, #00D4FF 58%, #4D7FFF 100%)',
                boxShadow:  '0 0 44px rgba(0,212,255,0.26), 0 10px 36px rgba(0,0,0,0.45)',
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden="true"
              />
              <Smartphone className="relative z-10 h-5 w-5" aria-hidden="true" />
              <span className="relative z-10">Je commande mon smartphone</span>
              <span dir="rtl" className="relative z-10 font-arabic text-base">اطلب هاتفك الآن</span>
              <ArrowRight
                className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </motion.span>
          </Link>
          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Préinscription gratuite, sans engagement · بلا التزام ولا دفع مسبق
          </p>
        </motion.div>

      </div>
    </section>
  )
}
