'use client'

import React, { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  useInView,
} from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Smartphone, Zap, Shield, Crown, Flame, CreditCard } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type ActivePlan = '6m' | '12m'

// ── Phone Catalogue ─────────────────────────────────────────────────────────
const PHONES = [
  {
    id: 'galaxy-a55',
    model:    'Galaxy A55',
    brand:    'Samsung',
    price6m:  4_200,
    price12m: 2_300,
    accent:   '#4D7FFF',
    rgb:      '77,127,255',
    gradient: 'linear-gradient(145deg, #1428A0, #0055B3)',
    badge:    '⚡ TOP VENTE',
    emoji:    '📱',
    featured: true,
  },
  {
    id: 'iphone-13',
    model:    'iPhone 13',
    brand:    'Apple',
    price6m:  7_800,
    price12m: 4_100,
    accent:   '#C8C8D4',
    rgb:      '200,200,212',
    gradient: 'linear-gradient(145deg, #3A3A3C, #1C1C1E)',
    badge:    '👑 PREMIUM',
    emoji:    '🍎',
    featured: false,
  },
  {
    id: 'xiaomi-note13',
    model:    'Redmi Note 13',
    brand:    'Xiaomi',
    price6m:  2_800,
    price12m: 1_500,
    accent:   '#FF8C42',
    rgb:      '255,140,66',
    gradient: 'linear-gradient(145deg, #E02B00, #FF4500)',
    badge:    '🔥 PRIX CHOC',
    emoji:    '💥',
    featured: false,
  },
  {
    id: 'galaxy-s23fe',
    model:    'Galaxy S23 FE',
    brand:    'Samsung',
    price6m:  6_000,
    price12m: 3_200,
    accent:   '#60A5FA',
    rgb:      '96,165,250',
    gradient: 'linear-gradient(145deg, #1428A0, #2563EB)',
    badge:    '✨ FAN ÉDITION',
    emoji:    '🌟',
    featured: false,
  },
] as const

// ── Reveal Variant ─────────────────────────────────────────────────────────
const reveal = {
  hidden: { opacity: 0, y: 30 },
  show:   (i: number) => ({
    opacity:    1,
    y:          0,
    transition: { delay: i * 0.09, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

// ── AnimatedStat ─────────────────────────────────────────────────────────────
function AnimatedStat({ value, label, arabic, color, rgb, index }: {
  value: string; label: string; arabic: string; color: string; rgb: string; index: number
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.82 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.35 + index * 0.1, duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col items-center gap-0.5 rounded-2xl px-5 py-4"
      style={{
        background: `rgba(${rgb},0.07)`,
        border:     `1px solid rgba(${rgb},0.2)`,
      }}
    >
      <span className="text-3xl font-black tracking-tight" style={{ color }}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span dir="rtl" className="font-arabic text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{arabic}</span>
    </motion.div>
  )
}

// ── AnimatedPrice ─────────────────────────────────────────────────────────
function AnimatedPrice({ price, accent, plan }: { price: number; accent: string; plan: ActivePlan }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${price}-${plan}`}
        initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
        exit={   { opacity: 0, y: -14, filter: 'blur(10px)' }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-end gap-2">
          <span className="text-[2.75rem] font-black leading-none tracking-tight text-white">
            {price.toLocaleString('fr-DZ')}
          </span>
          <span className="pb-1 text-sm font-bold" style={{ color: accent }}>
            DA/mois
          </span>
        </div>
        <p className="mt-1 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {plan === '6m' ? '× 6 mensualités' : '× 12 mensualités'} · 0% intérêts
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

// ── PhoneCard ──────────────────────────────────────────────────────────────
function PhoneCard({
  phone, plan, index, reduced,
}: { phone: typeof PHONES[number]; plan: ActivePlan; index: number; reduced: boolean | null }) {
  const price = plan === '6m' ? phone.price6m : phone.price12m

  return (
    <motion.article
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      whileHover={reduced ? undefined : { y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative w-[230px] flex-shrink-0 cursor-pointer sm:w-auto"
      aria-label={`${phone.model} — ${price.toLocaleString('fr-DZ')} DA/mois`}
    >
      {/* Featured star */}
      {phone.featured && (
        <div
          className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-black shadow-lg"
          style={{ background: `linear-gradient(90deg, ${phone.accent}, #00E5FF)` }}
        >
          ★ Best-seller
        </div>
      )}

      {/* Rotating neon border — GPU-composited (transform only) */}
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
          aria-hidden="true"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 110deg, ${phone.accent} 180deg, transparent 250deg, transparent 360deg)`,
          }}
        />
      )}

      {/* Card body */}
      <div
        className="relative overflow-hidden rounded-[28px]"
        style={{
          background: 'linear-gradient(160deg, rgba(10,16,34,0.98) 0%, rgba(5,8,18,0.98) 100%)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 8px 40px rgba(0,0,0,0.65)',
        }}
      >
        {/* Top neon line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${phone.accent}, transparent)` }}
          aria-hidden="true"
        />

        {/* Ambient hover glow */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% 0%, rgba(${phone.rgb},0.16), transparent 58%)` }}
          aria-hidden="true"
        />

        <div className="relative p-6 pb-7">
          {/* Phone visual block */}
          <div
            className="relative mx-auto mb-5 flex h-[98px] w-[78px] items-center justify-center overflow-hidden rounded-[22px]"
            style={{
              background:  phone.gradient,
              boxShadow:   `0 10px 36px rgba(${phone.rgb},0.55), inset 0 1px 0 rgba(255,255,255,0.18)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 52%)' }}
              aria-hidden="true"
            />
            <span className="relative z-10 text-[2.4rem]" role="img" aria-label={phone.model}>
              {phone.emoji}
            </span>
          </div>

          {/* Badge */}
          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
            style={{
              background: `rgba(${phone.rgb},0.12)`,
              border:     `1px solid rgba(${phone.rgb},0.3)`,
              color:       phone.accent,
            }}
          >
            {phone.badge}
          </div>

          {/* Brand + model */}
          <p
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            {phone.brand}
          </p>
          <h4 className="mt-0.5 text-base font-black leading-tight text-white">{phone.model}</h4>

          {/* Price */}
          <div className="mt-5 border-t pt-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <AnimatedPrice price={price} accent={phone.accent} plan={plan} />
          </div>

          {/* CTA */}
          <Link href="/form" tabIndex={-1} aria-hidden="true">
            <motion.span
              whileTap={{ scale: 0.96 }}
              className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2"
              style={{
                background: `rgba(${phone.rgb},0.13)`,
                border:     `1px solid rgba(${phone.rgb},0.28)`,
                color:       phone.accent,
              }}
            >
              <span>Je prends</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

// ── Main Section ───────────────────────────────────────────────────────────────
export default function PhoneSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [plan, setPlan]      = useState<ActivePlan>('6m')
  const reduced              = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target:  sectionRef,
    offset:  ['start end', 'end start'],
  })
  const orbY  = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-14%',  '14%'])
  const orbY2 = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : [ '10%', '-10%'])
  const orbY3 = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-6%',   '6%'])

  return (
    <section
      ref={sectionRef}
      id="telephone-facilite"
      aria-labelledby="phone-section-heading"
      dir="ltr"
      className="relative overflow-hidden py-28 md:py-40 font-sans"
      style={{ background: 'linear-gradient(180deg, #020508 0%, #030A12 50%, #020508 100%)' }}
    >
      {/* ── Aurora layer ─────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="absolute -right-40 top-10 h-[640px] w-[640px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 65%)',
          filter: 'blur(1px)',
          y: orbY,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -left-28 bottom-10 h-[520px] w-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 62%)',
          filter: 'blur(1px)',
          y: orbY2,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-[40%] h-[380px] w-[380px] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 60%)',
          y: orbY3,
        }}
      />

      {/* ── Dot grid texture ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />

      {/* ── Watermark ────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden text-center font-black uppercase leading-none"
        style={{
          fontSize:      'clamp(110px, 24vw, 340px)',
          color:         'rgba(255,255,255,0.018)',
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
        }}
      >
        CRÉDIT
      </div>

      <div className="container relative z-10 mx-auto px-6">

        {/* ── Hero Header ──────────────────────────────────────────────────── */}
        <header className="mb-16 text-center">

          {/* Eyebrow pill */}
          <motion.div
            custom={0} variants={reveal} initial="hidden"
            whileInView="show" viewport={{ once: true, amount: 0.5 }}
            className="inline-flex flex-wrap items-center gap-3 rounded-full px-5 py-2"
            style={{
              background: 'rgba(0,212,255,0.06)',
              border:     '1px solid rgba(0,212,255,0.22)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-55" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-[0.34em]"
              style={{ color: '#00D4FF' }}
            >
              Facilité Smartphone · TikCredit Pro
            </span>
            <span className="hidden h-3.5 w-px bg-white/15 sm:block" />
            <span dir="rtl" className="font-arabic text-sm font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>
              هاتفك بالتقسيط
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            id="phone-section-heading"
            custom={1} variants={reveal} initial="hidden"
            whileInView="show" viewport={{ once: true, amount: 0.4 }}
            className="mt-8 font-black leading-[1.04] tracking-tight"
            style={{ fontSize: 'clamp(2.8rem, 7.5vw, 5.8rem)' }}
          >
            <span className="block text-white">Ton smartphone —</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(118deg, #00D4FF 8%, #4D7FFF 46%, #D4AF37 100%)' }}
            >
              bالتقسيط، maintenant.
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.div
            custom={2} variants={reveal} initial="hidden"
            whileInView="show" viewport={{ once: true, amount: 0.4 }}
            className="mx-auto mt-6 max-w-xl space-y-2"
          >
            <p className="text-lg font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Bla avance, bla galère. Tu choisis ton modèle, on finance —
              livraison <span className="font-black text-white">48h</span>, zéro intérêts, tout en ligne.
            </p>
            <p dir="rtl" className="font-arabic text-base font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              اختر هاتفك — نقسّطه عليك بالراحة، بلا فوائد وبلا تعقيد
            </p>
          </motion.div>

          {/* Key stats row */}
          <motion.div
            custom={3} variants={reveal} initial="hidden"
            whileInView="show" viewport={{ once: true, amount: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
          >
            <AnimatedStat value="0%"  label="Intérêts"  arabic="بلا فوائد"           color="#10B981" rgb="16,185,129"  index={0} />
            <AnimatedStat value="48H" label="Livraison" arabic="توصيل سريع"          color="#00D4FF" rgb="0,212,255"   index={1} />
            <AnimatedStat value="6/12" label="Mois"     arabic="أقساط مرنة"          color="#D4AF37" rgb="212,175,55"  index={2} />
          </motion.div>
        </header>

        {/* ── Plan Toggle ───────────────────────────────────────────────────── */}
        <motion.div
          custom={4} variants={reveal} initial="hidden"
          whileInView="show" viewport={{ once: true, amount: 0.4 }}
          className="mx-auto mb-14 max-w-[460px]"
        >
          <p
            className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.36em]"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Choisir ma facilité — اختر مدة التقسيط
          </p>

          {/* Toggle pill */}
          <div
            className="relative flex rounded-[32px] p-2 gap-2"
            role="radiogroup"
            aria-label="Durée de la facilité"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border:     '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Gliding highlight — layoutId spring */}
            <motion.div
              layoutId="plan-pill"
              className="absolute rounded-[26px]"
              aria-hidden="true"
              style={{
                top:        '8px',
                bottom:     '8px',
                width:      'calc(50% - 12px)',
                left:       plan === '6m' ? '8px' : 'calc(50% + 4px)',
                background: plan === '6m'
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.12))'
                  : 'linear-gradient(135deg, rgba(0,212,255,0.16), rgba(77,127,255,0.10))',
                border: `1.5px solid ${plan === '6m' ? 'rgba(249,115,22,0.5)' : 'rgba(0,212,255,0.42)'}`,
                boxShadow: plan === '6m'
                  ? '0 0 28px rgba(249,115,22,0.18)'
                  : '0 0 28px rgba(0,212,255,0.14)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            />

            {(['6m', '12m'] as const).map((p) => {
              const is6m    = p === '6m'
              const isActive = plan === p
              const color   = is6m ? '#F97316' : '#00D4FF'
              const Icon    = is6m ? Flame : CreditCard
              return (
                <button
                  key={p}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setPlan(p)}
                  className="relative z-10 flex flex-1 flex-col items-center gap-1.5 rounded-[26px] px-4 py-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                  style={{ focusVisibleRingColor: color } as React.CSSProperties}
                >
                  <Icon
                    className="h-5 w-5 transition-colors duration-300"
                    style={{ color: isActive ? color : 'rgba(255,255,255,0.22)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-xl font-black tracking-tight transition-colors duration-300"
                    style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.28)' }}
                  >
                    {is6m ? '6 Mois' : '12 Mois'}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300"
                    style={{ color: isActive ? color : 'rgba(255,255,255,0.18)' }}
                  >
                    {is6m ? 'Financement rapide' : 'Mensualités légères'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active plan descriptor */}
          <AnimatePresence mode="wait">
            <motion.p
              key={plan}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={   { opacity: 0, y: -7 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-3 text-center text-xs font-semibold"
              style={{ color: 'rgba(255,255,255,0.32)' }}
            >
              {plan === '6m'
                ? '→ Soldé en 6 mois · Libéré plus vite · 0% intérêts'
                : '→ Étalé sur 12 mois · Mensualités allégées · 0% intérêts'}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* ── Phone Cards Grid ───────────────────────────────────────────────── */}
        <div
          className="overflow-x-auto pb-6 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0"
          role="list"
          aria-label="Modèles disponibles"
        >
          <div className="flex gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {PHONES.map((phone, i) => (
              <div key={phone.id} role="listitem">
                <PhoneCard phone={phone} plan={plan} index={i} reduced={reduced} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust Strip ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-3"
          role="list"
          aria-label="Garanties"
        >
          {[
            { Icon: Zap,    text: 'Accord instantané',       arabic: 'موافقة فورية',            color: '#F97316', rgb: '249,115,22'  },
            { Icon: Shield, text: '0% intérêts garantis',    arabic: 'بلا فوائد — مضمون 100%', color: '#10B981', rgb: '16,185,129'  },
            { Icon: Crown,  text: 'Livraison 48h gratuite',  arabic: 'توصيل مجاني خلال 48 ساعة', color: '#D4AF37', rgb: '212,175,55'  },
          ].map(({ Icon, text, arabic, color, rgb }) => (
            <motion.div
              key={text}
              role="listitem"
              whileHover={reduced ? undefined : { y: -4 }}
              className="flex items-center gap-4 rounded-[22px] px-6 py-5 transition-all duration-300"
              style={{
                background: `rgba(${rgb},0.06)`,
                border:     `1px solid rgba(${rgb},0.16)`,
              }}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[16px]"
                style={{
                  background: `rgba(${rgb},0.13)`,
                  border:     `1px solid rgba(${rgb},0.28)`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{text}</p>
                <p dir="rtl" className="font-arabic text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {arabic}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Global CTA ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Link href="/form">
            <motion.span
              whileHover={reduced ? undefined : { scale: 1.025, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex min-h-[60px] items-center justify-center gap-3 overflow-hidden rounded-[22px] px-10 py-4 text-base font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
              style={{
                background:  'linear-gradient(135deg, #0055B3 0%, #00D4FF 58%, #4D7FFF 100%)',
                boxShadow:   '0 0 44px rgba(0,212,255,0.28), 0 10px 36px rgba(0,0,0,0.45)',
                transition:  'box-shadow 0.3s ease',
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden="true"
              />
              <Smartphone className="relative z-10 h-5 w-5" aria-hidden="true" />
              <span className="relative z-10">Je commande mon smartphone</span>
              <span dir="rtl" className="relative z-10 font-arabic text-base">اطلب هاتفك الآن</span>
              <ArrowRight
                className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </motion.span>
          </Link>
          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.24)' }}>
            Préinscription gratuite, sans engagement · بلا التزام ولا دفع مسبق
          </p>
        </motion.div>

      </div>
    </section>
  )
}
