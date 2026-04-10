'use client'

import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Shield, Smartphone, Clock, CheckCircle2,
  Zap, BadgeCheck, Star, TrendingUp, Percent, Sparkles,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ActiveTab = 'loan' | 'phone'

// ── Data ──────────────────────────────────────────────────────────────────────
const loanStats = [
  { value: 20, suffix: 'M+', label: 'Montant max', arabic: 'أقصى مبلغ' },
  { value: 84, suffix: ' mois', label: 'Durée max', arabic: 'أقصى مدة' },
  { value: 0, suffix: '%', label: 'Frais dossier', arabic: 'رسوم: صفر' },
]

const phoneModels = [
  {
    model: 'Samsung Galaxy A55',
    monthlyPrice: 3_200,
    months: 36,
    brand: 'Samsung',
    gradient: 'from-[#1428A0] to-[#0055B3]',
    bgAccent: 'rgba(20,40,160,0.08)',
  },
  {
    model: 'iPhone 13',
    monthlyPrice: 5_800,
    months: 24,
    brand: 'Apple',
    gradient: 'from-[#3A3A3C] to-[#1C1C1E]',
    bgAccent: 'rgba(58,58,60,0.08)',
  },
  {
    model: 'Xiaomi Note 13',
    monthlyPrice: 2_100,
    months: 36,
    brand: 'Xiaomi',
    gradient: 'from-[#FF6900] to-[#FF3B00]',
    bgAccent: 'rgba(255,105,0,0.08)',
  },
  {
    model: 'Galaxy S23 FE',
    monthlyPrice: 4_500,
    months: 36,
    brand: 'Samsung',
    gradient: 'from-[#1428A0] to-[#2563EB]',
    bgAccent: 'rgba(20,40,160,0.08)',
  },
]

const trustBadges = [
  { Icon: Zap,        label: 'Accord f 2min',     arabic: 'موافقة لحظية',    colorClass: 'text-premium-gold' },
  { Icon: Shield,     label: 'Bla justificatif',   arabic: 'بلا وثائق',       colorClass: 'text-emerald-600'  },
  { Icon: Smartphone, label: 'Tous les modèles',   arabic: 'كل الموديلات',    colorClass: 'text-lux-sapphire' },
]

// ── Reveal Variant ────────────────────────────────────────────────────────────
const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

// ── AnimatedNumber ─────────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayed, setDisplayed] = React.useState(0)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  React.useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1600
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, value])

  return <span ref={ref}>{displayed}{suffix}</span>
}

// ── PhoneCard ─────────────────────────────────────────────────────────────────
function PhoneCard({
  model, monthlyPrice, months, brand, gradient, bgAccent, index,
}: (typeof phoneModels)[0] & { index: number }) {
  return (
    <motion.div
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      className="group relative w-[210px] flex-shrink-0 overflow-hidden rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-luxury-lg backdrop-blur-sm sm:w-auto"
    >
      {/* Brand accent bar */}
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${gradient}`} />

      {/* Background tint */}
      <div
        className="absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${bgAccent}, transparent 65%)` }}
        aria-hidden="true"
      />

      {/* Phone illustration */}
      <div
        className={`mx-auto mb-4 flex h-24 w-20 items-center justify-center rounded-[20px] bg-gradient-to-br ${gradient} relative overflow-hidden shadow-lg`}
      >
        {/* Glass shine on phone illustration */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />
        <Smartphone className="relative z-10 h-10 w-10 text-white/90" aria-hidden="true" />
      </div>

      {/* 0% badge */}
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        <span className="text-[10px] font-bold text-emerald-700">0% frais</span>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-lux-slate">{brand}</p>
      <h4 className="mt-1 text-sm font-black leading-tight text-lux-navy">{model}</h4>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-2xl font-black text-lux-navy">
          {monthlyPrice.toLocaleString('fr-DZ')}
        </span>
        <span className="pb-1 text-xs font-semibold text-lux-slate">DA/mois</span>
      </div>
      <p className="mt-1 text-xs font-medium text-lux-slate">
        {months} mensualités · bla frais
      </p>

      <Link href="/form">
        <motion.span
          whileTap={{ scale: 0.97 }}
          className="relative mt-4 flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-[14px] bg-lux-navy px-4 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-lux-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-sapphire focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <span
            className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden="true"
          />
          <span className="relative z-10">Ana intéressé — نبدا</span>
        </motion.span>
      </Link>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PhoneSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('loan')
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const orbY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['-10%', '10%'],
  )
  const orbY2 = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['6%', '-6%'],
  )

  return (
    <section
      ref={sectionRef}
      id="telephone-facilite"
      dir="ltr"
      className="relative overflow-hidden py-24 md:py-32 font-sans"
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-lux-ivory via-lux-pearl to-white" />

      {/* Orbs */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-32 top-16 h-[420px] w-[420px] rounded-full bg-lux-sapphire/[0.09] blur-3xl"
        style={{ y: orbY }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -right-24 bottom-8 h-[340px] w-[340px] rounded-full bg-premium-gold/[0.11] blur-3xl"
        style={{ y: orbY2 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lux-sapphire/[0.05] blur-3xl"
        style={{ y: orbY }}
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(10,22,40,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,22,40,0.12) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 88%)',
        }}
      />

      <div className="container relative z-10 mx-auto px-6">

        {/* ── Programme Hero ─────────────────────────────────────────────── */}
        <div className="mb-16 text-center">

          {/* Eyebrow badge */}
          <motion.div
            custom={0}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="inline-flex flex-wrap items-center gap-3 rounded-full border border-lux-sapphire/12 bg-white/90 px-5 py-2 shadow-luxury backdrop-blur-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-premium-gold opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-premium-gold shadow-glow-gold" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-lux-sapphire">
              Programmes TikCredit Pro
            </span>
            <span className="hidden h-4 w-px bg-lux-silver sm:block" />
            <span dir="rtl" className="font-arabic text-sm font-semibold text-lux-navy">
              حصري — برامجنا
            </span>
          </motion.div>

          {/* H2 — Franco-Arabic headline */}
          <motion.h2
            custom={1}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-6 text-4xl font-black leading-tight text-lux-navy md:text-[3.6rem] xl:text-[4rem]"
          >
            Prêt ou Smartphone —
            <span
              className="mt-2 block bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(110deg, #1E3A8A 0%, #2563EB 40%, #D4AF37 100%)',
              }}
            >
              choisis، و نبدا.
            </span>
          </motion.h2>

          {/* Subtext — Derija pitch */}
          <motion.div
            custom={2}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mx-auto mt-5 max-w-2xl space-y-2"
          >
            <p className="text-lg font-medium leading-relaxed text-lux-slate">
              Bla justificatif, bla prise de tête. Prêt dyalek wala smartphone à crédit —
              réponse f moins de 2 minutes, tout en ligne.
            </p>
            <p dir="rtl" className="font-arabic text-base font-semibold text-lux-navy">
              بلا وثائق وبلا تعقيد — قرضك أو هاتفك بالتقسيط، كل شيء أونلاين
            </p>
          </motion.div>

          {/* Tab Buttons */}
          <motion.div
            custom={3}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >
            <motion.button
              onClick={() => setActiveTab('loan')}
              whileHover={{ scale: activeTab === 'loan' ? 1 : 1.025 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={activeTab === 'loan'}
              className={[
                'relative flex min-h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] px-7 py-3.5 text-base font-bold',
                'transition-all duration-300 sm:w-auto',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-sapphire focus-visible:ring-offset-2',
                'active:scale-[0.97]',
                activeTab === 'loan'
                  ? 'bg-gradient-to-r from-lux-navy via-lux-sapphire to-lux-azure text-white shadow-premium-xl'
                  : 'border-2 border-lux-sapphire/18 bg-white/85 text-lux-navy hover:border-lux-sapphire/45 hover:bg-white hover:shadow-luxury',
              ].join(' ')}
            >
              {activeTab === 'loan' && (
                <span
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] transition-transform duration-1000"
                  style={{ animation: 'shimmer 2.4s infinite' }}
                  aria-hidden="true"
                />
              )}
              <TrendingUp className="relative z-10 h-5 w-5" aria-hidden="true" />
              <span className="relative z-10">Prêt Personnel</span>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('phone')}
              whileHover={{ scale: activeTab === 'phone' ? 1 : 1.025 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={activeTab === 'phone'}
              className={[
                'relative flex min-h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] px-7 py-3.5 text-base font-bold',
                'transition-all duration-300 sm:w-auto',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-sapphire focus-visible:ring-offset-2',
                'active:scale-[0.97]',
                activeTab === 'phone'
                  ? 'bg-gradient-to-r from-lux-navy via-lux-sapphire to-lux-azure text-white shadow-premium-xl'
                  : 'border-2 border-lux-sapphire/18 bg-white/85 text-lux-navy hover:border-lux-sapphire/45 hover:bg-white hover:shadow-luxury',
              ].join(' ')}
            >
              {activeTab === 'phone' && (
                <span
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] transition-transform duration-1000"
                  aria-hidden="true"
                />
              )}
              <Smartphone className="relative z-10 h-5 w-5" aria-hidden="true" />
              <span className="relative z-10">Smartphone à Crédit</span>
            </motion.button>
          </motion.div>
        </div>

        {/* ── Tab Panels ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ─── Panel A: Prêts Personnels ───────────────────────────────── */}
          {activeTab === 'loan' && (
            <motion.div
              key="loan"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative overflow-hidden rounded-[36px] border border-white/75 bg-white/82 shadow-luxury-2xl backdrop-blur-xl">
                {/* Radial accent lights */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.1),transparent_32%)]" />
                {/* Top edge shimmer */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lux-sapphire/30 to-transparent" />

                <div className="relative px-6 py-10 md:px-12 md:py-14 xl:px-16 xl:py-16">
                  <div className="grid items-center gap-12 xl:grid-cols-[1.15fr_0.85fr]">

                    {/* Left: content */}
                    <div>
                      <motion.div
                        custom={0} variants={reveal} initial="hidden"
                        whileInView="show" viewport={{ once: true }}
                        className="inline-flex items-center gap-2.5 rounded-full border border-lux-sapphire/14 bg-lux-sapphire/[0.07] px-4 py-2"
                      >
                        <Clock className="h-4 w-4 text-lux-sapphire" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-[0.22em] text-lux-sapphire">
                          Prêts Personnels
                        </span>
                      </motion.div>

                      {/* Headline — Derija */}
                      <motion.h3
                        custom={1} variants={reveal} initial="hidden"
                        whileInView="show" viewport={{ once: true }}
                        className="mt-5 text-3xl font-black leading-tight text-lux-navy md:text-5xl"
                      >
                        Mchroua dyalek —
                        <span
                          className="block bg-clip-text text-transparent"
                          style={{
                            backgroundImage: 'linear-gradient(110deg, #1E3A8A 0%, #2563EB 60%)',
                          }}
                        >
                          financé en 24h.
                        </span>
                      </motion.h3>
                      <p dir="rtl" className="mt-2 font-arabic text-xl font-bold text-lux-navy">
                        مشروعك ممول في 24 ساعة — بلا تعقيد
                      </p>

                      {/* Description — Derija pitch */}
                      <motion.p
                        custom={2} variants={reveal} initial="hidden"
                        whileInView="show" viewport={{ once: true }}
                        className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-lux-slate"
                      >
                        Bla fiche de paie fixe, bla complications. Tu déposes ta pièce
                        d&apos;identité, on étudie ton dossier — réponse de principe f quelques
                        minutes, tout en ligne.
                      </motion.p>

                      {/* Feature list — Derija labels */}
                      <motion.ul
                        custom={3} variants={reveal} initial="hidden"
                        whileInView="show" viewport={{ once: true }}
                        className="mt-8 space-y-3"
                        role="list"
                      >
                        {[
                          'Bla fiche de paie — start direct',
                          'Réponse f quelques minutes فقط',
                          'Mensualités 12 jusqu\'à 84 mois',
                        ].map((feat) => (
                          <li key={feat} className="flex items-center gap-3">
                            <CheckCircle2
                              className="h-5 w-5 flex-shrink-0 text-emerald-600"
                              aria-hidden="true"
                            />
                            <span className="text-base font-medium text-lux-navy">{feat}</span>
                          </li>
                        ))}
                      </motion.ul>

                      {/* CTA — Derija */}
                      <motion.div
                        custom={4} variants={reveal} initial="hidden"
                        whileInView="show" viewport={{ once: true }}
                        className="mt-8"
                      >
                        <Link href="/form">
                          <motion.span
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] bg-gradient-to-r from-lux-navy via-lux-sapphire to-lux-azure px-8 py-3.5 text-base font-bold text-white shadow-premium-xl sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                          >
                            <span
                              className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                              aria-hidden="true"
                            />
                            <ArrowRight
                              className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                              aria-hidden="true"
                            />
                            <span className="relative z-10">Je commence — نبدا</span>
                          </motion.span>
                        </Link>
                      </motion.div>
                    </div>

                    {/* Right: Glassmorphism stats card */}
                    <motion.div
                      initial={{ opacity: 0, x: 28, scale: 0.95 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative"
                    >
                      {/* Hover gradient ring */}
                      <div
                        className="pointer-events-none absolute -inset-[1px] rounded-[33px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(30,58,138,0.45), rgba(212,175,55,0.45), rgba(37,99,235,0.45))',
                        }}
                        aria-hidden="true"
                      />
                      <div className="relative overflow-hidden rounded-[32px] border border-lux-silver/55 bg-white/78 p-8 shadow-luxury-xl backdrop-blur-xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.07),transparent_38%)]" />

                        <div className="relative">
                          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lux-slate">
                            Indicateurs clés · أرقام رئيسية
                          </p>

                          <div className="mt-6 space-y-4">
                            {loanStats.map((stat, i) => (
                              <motion.div
                                key={stat.label}
                                custom={i}
                                variants={reveal}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                className="flex items-center justify-between rounded-[20px] border border-white/85 bg-white/85 px-5 py-4 shadow-luxury"
                              >
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lux-slate">
                                    {stat.label}
                                  </p>
                                  <p dir="rtl" className="mt-0.5 font-arabic text-xs text-lux-slate">
                                    {stat.arabic}
                                  </p>
                                </div>
                                <p className="text-3xl font-black text-lux-navy">
                                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                </p>
                              </motion.div>
                            ))}
                          </div>

                          <div className="mt-5 rounded-[20px] border border-lux-sapphire/12 bg-lux-sapphire/[0.05] px-5 py-4">
                            <div className="flex items-start gap-3">
                              <Percent
                                className="mt-0.5 h-5 w-5 flex-shrink-0 text-lux-sapphire"
                                aria-hidden="true"
                              />
                              <div>
                                <p className="text-sm font-semibold text-lux-navy">
                                  0% frais de dossier · SSL-256
                                </p>
                                <p dir="rtl" className="mt-1 font-arabic text-xs text-lux-slate">
                                  رسوم: صفر — بياناتك محمية بالكامل
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Panel B: Smartphones à Crédit ──────────────────────────── */}
          {activeTab === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative overflow-hidden rounded-[36px] border border-white/75 bg-white/82 shadow-luxury-2xl backdrop-blur-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.08),transparent_32%)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-premium-gold/30 to-transparent" />

                <div className="relative px-6 py-10 md:px-12 md:py-14">

                  {/* Section header */}
                  <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-lux-sapphire/12 bg-lux-sapphire/[0.06] px-4 py-2">
                      <Sparkles className="h-4 w-4 text-premium-gold" aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-lux-sapphire">
                        Smartphones à Crédit
                      </span>
                    </div>

                    {/* Headline — Derija */}
                    <motion.h3
                      custom={0} variants={reveal} initial="hidden"
                      whileInView="show" viewport={{ once: true }}
                      className="mt-5 text-3xl font-black leading-tight text-lux-navy md:text-5xl"
                    >
                      Smartphone dyalek —
                      <span
                        className="block bg-clip-text text-transparent"
                        style={{
                          backgroundImage: 'linear-gradient(110deg, #1E3A8A 0%, #2563EB 45%, #D4AF37 100%)',
                        }}
                      >
                        maintenant، بالتقسيط.
                      </span>
                    </motion.h3>
                    <p dir="rtl" className="mx-auto mt-2 font-arabic text-lg font-bold text-lux-navy">
                      الهاتف اللي تبغي — بالتقسيط، بلا فوائد
                    </p>
                  </div>

                  {/* Trust badges — always horizontal, never stacked */}
                  <div
                    className="mb-10 flex flex-row flex-wrap justify-center gap-3"
                    role="list"
                    aria-label="Points forts du programme"
                  >
                    {trustBadges.map(({ Icon, label, arabic, colorClass }) => (
                      <motion.div
                        key={label}
                        role="listitem"
                        whileHover={{ y: -2, scale: 1.025 }}
                        className="flex items-center gap-2.5 rounded-full border border-white/85 bg-white/92 px-5 py-2.5 shadow-luxury backdrop-blur-sm"
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${colorClass}`} aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-lux-navy">{label}</p>
                          <p dir="rtl" className="font-arabic text-[10px] text-lux-slate">{arabic}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Phone model cards — horizontal scroll mobile / grid desktop */}
                  <div
                    className="overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0"
                    role="list"
                    aria-label="Modèles disponibles"
                  >
                    <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                      {phoneModels.map((phone, index) => (
                        <div key={phone.model} role="listitem">
                          <PhoneCard {...phone} index={index} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch notice — Derija */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8 rounded-[24px] border border-premium-gold/20 bg-premium-gold/[0.06] px-6 py-5 text-center"
                  >
                    <div className="flex items-center justify-center gap-2.5">
                      <Star className="h-5 w-5 text-premium-gold" aria-hidden="true" />
                      <p className="text-sm font-semibold text-lux-navy">
                        Programme bientôt dispo — enregistre-toi, نكونلك أول واحد
                      </p>
                    </div>
                    <p dir="rtl" className="mt-2 font-arabic text-sm text-lux-slate">
                      البرنامج قريباً — سجّل الآن وكن أول من يُشعَر
                    </p>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  )
}
