// Last modified: 2026-04-08 — TikCredit Pro transformation
'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Calendar, Smartphone } from 'lucide-react'
import PhoneMockup from '@/components/ui/PhoneMockup'

// ─── Animation variants ───────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

const textLineVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.08,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

// ─── Feature cards data ────────────────────────────────────────────────────────

const features = [
  {
    icon: Shield,
    title: 'Éligibilité Simple',
    description: 'Pas de fiche de paie. Votre identité suffit.',
    gradient: 'from-lux-sapphire to-elegant-blue',
    glow: 'rgba(30,58,138,0.2)',
  },
  {
    icon: Calendar,
    title: '12 à 36 Mensualités',
    description: 'Remboursement adapté à votre rythme.',
    gradient: 'from-premium-gold-dark to-premium-gold',
    glow: 'rgba(184,148,31,0.2)',
  },
  {
    icon: Smartphone,
    title: 'Tous Les Modèles',
    description: 'iPhone, Samsung, Xiaomi — tous disponibles.',
    gradient: 'from-elegant-blue to-elegant-blue-light',
    glow: 'rgba(37,99,235,0.2)',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PhoneSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  // Parallax scroll effect for the main image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <section
      ref={sectionRef}
      id="telephone-facilite"
      className="relative pt-24 pb-32 overflow-hidden"
      dir="ltr"
    >
      {/* ── Background texture ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-lux-ivory via-white to-lux-pearl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1E3A8A 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">

        {/* ═══ TOP CONTENT: Eyebrow + Headline ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Left: Text */}
          <div>
            {/* Eyebrow badge */}
            <motion.div
              custom={0}
              variants={textLineVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{
                background: 'linear-gradient(90deg, #F59E0B22, #FBBF2422)',
                border: '1px solid #F59E0B40',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-premium-gold animate-pulse" />
              <span className="text-xs font-extrabold tracking-widest uppercase text-amber-600">
                Nouveau Programme
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              custom={1}
              variants={textLineVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-lux-navy mb-6 leading-tight"
            >
              Un Smartphone{' '}
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(90deg, #1E3A8A, #2563EB, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Entre Vos Mains,
              </span>
              <br />
              Sans Conditions de Revenu
            </motion.h2>

            {/* Sub-headline */}
            <motion.p
              custom={2}
              variants={textLineVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-lg text-lux-slate leading-relaxed mb-8 font-medium"
            >
              Accédez aux meilleurs smartphones en paiement facilité, spécialement conçu pour
              les demandeurs d&apos;emploi et les étudiants.{' '}
              <strong className="text-lux-navy">Zéro justificatif de salaire requis.</strong>
            </motion.p>

            {/* CTA Button */}
            <motion.div
              custom={3}
              variants={textLineVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <Link href="/telephone">
                <motion.button
                  className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 50%, #2563EB 100%)',
                    boxShadow: '0 8px 24px rgba(30,58,138,0.3)',
                  }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: '0 12px 32px rgba(30,58,138,0.45)',
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Shimmer overlay */}
                  <motion.div
                    className="absolute inset-0"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                    }}
                  />
                  <Smartphone className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Voir Les Offres Disponibles</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="relative z-10">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>

              {/* Bottom note */}
              <motion.p
                custom={4}
                variants={textLineVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mt-4 text-xs text-lux-slate/60 font-medium"
              >
                Programme en cours de lancement — Inscrivez-vous pour être notifié en priorité
              </motion.p>
            </motion.div>
          </div>

          {/* Right: Image + Phone Mockup */}
          <div className="relative flex items-center justify-center min-h-[400px]">
            {/* Parallax image */}
            <div
              ref={imageRef}
              className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-luxury-xl"
            >
              <motion.div className="absolute inset-0" style={{ y: imageY }}>
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
                  alt="Paiement facilité smartphone"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority={false}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-lux-navy/60 via-lux-sapphire/20 to-transparent" />
              </motion.div>

              {/* Text overlay on image */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  {['Samsung', 'iPhone', 'Xiaomi'].map((brand) => (
                    <span
                      key={brand}
                      className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating PhoneMockup */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* ═══ FEATURE CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="luxury-card p-8 relative overflow-hidden group cursor-default"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${feature.gradient}`} />

                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg`}
                  style={{ boxShadow: `0 8px 24px ${feature.glow}` }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-lux-navy mb-2 group-hover:text-lux-sapphire transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-lux-slate font-medium leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* ═══ SECOND IMAGE ROW ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          <div className="relative h-56 rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80"
              alt="Smartphone moderne"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-lux-navy/70 to-transparent" />
            <div className="absolute bottom-5 left-6 text-white">
              <p className="text-sm font-black tracking-widest uppercase opacity-70">Disponible</p>
              <p className="text-2xl font-black leading-tight">Derniers Modèles</p>
            </div>
          </div>

          <div className="relative h-56 rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80"
              alt="Technologie smartphone"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-lux-navy/70 to-transparent" />
            <div className="absolute bottom-5 right-6 text-white text-right">
              <p className="text-sm font-black tracking-widest uppercase opacity-70">À partir de</p>
              <p className="text-2xl font-black leading-tight">1 500 DA / mois</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
