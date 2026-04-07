'use client'

import React, { useEffect } from 'react'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================
// ANIMATION SYSTEM
// ============================================

const premiumEasing = [0.16, 1, 0.3, 1] as const
const springConfig = { type: 'spring' as const, stiffness: 100, damping: 15 }

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
      ease: premiumEasing,
      when: 'beforeChildren'
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfig
  }
}

const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: premiumEasing
    }
  }
}

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/form')
  }, [router])

  return (
    <div className="min-h-screen bg-lux-ivory relative overflow-hidden">
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3.5"
            >
              {/* ═══ ENGINEERED LOGO MARK ═══ */}
              <div className="relative w-12 h-12 group">
                {/* Outer glow ring */}
                <div className="absolute -inset-0.5 rounded-[14px] bg-gradient-to-br from-lux-sapphire via-elegant-blue to-elegant-blue-light opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
                {/* Main shape */}
                <div className="relative w-12 h-12 rounded-[14px] bg-gradient-to-br from-lux-sapphire via-elegant-blue to-elegant-blue-light shadow-xl overflow-hidden">
                  {/* Inner light refraction */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5" />
                  {/* Monogram */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
                      {/* T letterform — geometric */}
                      <rect x="3" y="2" width="12" height="2.5" rx="1" fill="white" opacity="0.95"/>
                      <rect x="8" y="2" width="2.5" height="13" rx="1" fill="white" opacity="0.95"/>
                      {/* C letterform — arc */}
                      <path d="M22 6.5C22 4.567 20.433 3 18.5 3H17.5C17.5 3 15 3 15 6.5V15.5C15 19 17.5 19 17.5 19H18.5C20.433 19 22 17.433 22 15.5" stroke="white" strokeWidth="2.3" strokeLinecap="round" fill="none" opacity="0.9"/>
                    </svg>
                  </div>
                </div>
                {/* Gold accent dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3">
                  <div className="w-full h-full rounded-[4px] bg-gradient-to-br from-premium-gold to-premium-gold-light border-[1.5px] border-white shadow-sm" />
                </div>
              </div>
              {/* ═══ BRAND TYPE ═══ */}
              <div className="flex flex-col">
                <span className="text-[22px] font-black tracking-tight leading-none" style={{ fontFamily: 'var(--font-sans)', color: '#0A1628' }}>
                  Tik<span className="bg-gradient-to-r from-lux-sapphire to-elegant-blue bg-clip-text text-transparent">Credit</span>
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-[1.5px] w-4 bg-gradient-to-r from-premium-gold to-premium-gold-light rounded-full" />
                  <span className="text-[9px] font-extrabold tracking-[0.4em] uppercase leading-none" style={{ fontFamily: 'var(--font-sans)', color: '#B8941F' }}>
                    PRO
                  </span>
                  <div className="h-[1.5px] w-4 bg-gradient-to-r from-premium-gold-light to-premium-gold rounded-full" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/form">
                <Button variant="default" size="default">
                  ابدأ الآن
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-lux-sapphire/[0.07] backdrop-blur-sm rounded-full border border-lux-sapphire/15 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-elegant-blue animate-pulse-soft" />
              <span className="text-sm font-semibold text-lux-sapphire tracking-wide">منصة التمويل الأكثر ثقة في الجزائر</span>
            </motion.div>

            <motion.h1
              variants={heroTextVariants}
              initial="hidden"
              animate="show"
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6"
            >
              <motion.span
                className="bg-gradient-to-r from-lux-navy via-lux-sapphire to-elegant-blue bg-clip-text text-transparent leading-tight inline-block"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{ backgroundSize: '200% auto' }}
              >
                TikCredit Pro
              </motion.span>
              <br />
              <motion.span
                className="text-lux-navy text-4xl md:text-6xl inline-block font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, ...springConfig }}
              >
                تمويلك بثقة وأمان
              </motion.span>
            </motion.h1>

            <motion.p
              variants={heroTextVariants}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-lux-slate mb-10 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              حلول تمويل احترافية ومبتكرة تناسب احتياجاتك مع أفضل الشروط والأسعار التنافسية
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150, damping: 20 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/form">
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2, ease: premiumEasing }
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <Button variant="default" size="xl">
                    قدم طلبك الآن
                    <ArrowLeft className="w-6 h-6 mr-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-8 mt-10"
              variants={itemVariants}
            >
              {[
                { label: 'آمن 100%', color: '#1E3A8A' },
                { label: 'رد خلال 48 ساعة', color: '#B8941F' },
                { label: '+5000 عميل', color: '#059669' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-lux-slate">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {([
              {
                title: 'تمويل سريع',
                description: 'احصل على قرار فوري خلال دقائق معدودة',
                gradient: 'from-lux-sapphire to-elegant-blue',
                accentColor: '#1E3A8A',
                iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
              },
              {
                title: 'آمن ومضمون',
                description: 'بياناتك محمية بأعلى معايير الأمان العالمية',
                gradient: 'from-premium-gold-dark to-premium-gold',
                accentColor: '#B8941F',
                iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
              },
              {
                title: 'معالجة سريعة',
                description: 'معالجة احترافية لطلبك في أقل وقت ممكن',
                gradient: 'from-elegant-blue to-elegant-blue-light',
                accentColor: '#2563EB',
                iconPath: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83',
              },
            ] as const).map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <div className="luxury-card p-8 h-full relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-elegant-blue/[0.03] via-elegant-blue-light/[0.02] to-transparent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1, transition: { duration: 0.4 } }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-elegant-blue/10 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%', transition: { duration: 1.2, ease: 'easeInOut' } }}
                  />

                  {/* Custom SVG Icon */}
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg relative z-10`}
                    style={{ boxShadow: `0 8px 24px ${feature.accentColor}30` }}
                    whileHover={{
                      scale: 1.15,
                      rotate: [0, -5, 5, 0],
                      transition: { type: 'spring', stiffness: 400, damping: 15 }
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feature.iconPath} />
                    </svg>
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-white/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: [0, 0.5, 0], scale: [0.8, 1.3, 0.8], transition: { duration: 1, repeat: Infinity } }}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-lux-navy mb-3 relative z-10 group-hover:text-lux-sapphire transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-lux-slate leading-relaxed relative z-10 font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 120, damping: 20 }}
            className="luxury-card p-10 md:p-12 mb-20 relative overflow-hidden group/section"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-elegant-blue/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center mb-10 relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, ...springConfig }}
            >
              <span className="bg-gradient-to-r from-lux-navy via-lux-sapphire to-elegant-blue bg-clip-text text-transparent inline-block">
                لماذا تختارنا؟
              </span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {([
                'عملية بسيطة وسريعة',
                'أسعار تنافسية ومناسبة',
                'دعم عملاء على مدار الساعة',
                'موافقة فورية على الطلبات',
                'لا حاجة لضمانات معقدة',
                'خدمة عملاء متميزة ومحترفة',
              ] as const).map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    delay: 1.1 + index * 0.08,
                    type: 'spring',
                    stiffness: 200,
                    damping: 25
                  }}
                  whileHover={{
                    scale: 1.03,
                    x: 5,
                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                  }}
                  className="flex items-center gap-4 p-4 rounded-luxury bg-white border border-lux-silver hover:border-elegant-blue/20 transition-all duration-300 cursor-default group/item shadow-sm hover:shadow-md"
                >
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-lux-sapphire to-elegant-blue flex items-center justify-center shadow-md"
                    style={{ boxShadow: '0 4px 12px rgba(30,58,138,0.2)' }}
                    whileHover={{
                      rotate: 360, scale: 1.1,
                      transition: { duration: 0.6, type: 'spring', stiffness: 200 }
                    }}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-base font-semibold text-lux-navy group-hover/item:text-lux-sapphire transition-colors duration-300">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 100, damping: 20 }}
            className="text-center mb-20"
          >
            <motion.div
              className="p-12 rounded-luxury-lg relative overflow-hidden shadow-luxury-xl"
              style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 40%, #2563EB 80%, #3B82F6 100%)' }}
              whileHover={{
                scale: 1.01,
                boxShadow: '0 25px 50px -12px rgba(10, 22, 40, 0.35)',
                transition: { duration: 0.3 }
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                  ],
                  backgroundPosition: ['-200% 0', '200% 0']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 100%' }}
              />

              {/* Geometric accents */}
              <div className="absolute top-6 right-8 w-20 h-20 border border-white/[0.06] rounded-2xl rotate-12" />
              <div className="absolute bottom-8 left-10 w-16 h-16 border border-white/[0.06] rounded-full" />
              <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-premium-gold/30" />

              <div className="relative z-10">
                <motion.h2
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4, type: 'spring', stiffness: 200, damping: 25 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  جاهز للبدء؟
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, ease: premiumEasing }}
                  className="text-xl text-white/70 mb-8 max-w-2xl mx-auto"
                >
                  قدم طلبك الآن واحصل على التمويل الذي تحتاجه بأفضل الشروط
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.8, type: 'spring', stiffness: 150, damping: 20 }}
                >
                  <Link href="/form">
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="white" size="xl">
                        ابدأ الآن
                        <ArrowLeft className="w-6 h-6 mr-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative mt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lux-sapphire/[0.02] to-lux-sapphire/[0.04]" />
          <div className="relative container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <motion.div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-luxury-lg border border-lux-silver/50">
                <span className="text-xl">🇩🇿</span>
                <span className="text-sm font-bold text-lux-navy">صُنع بإتقان في الجزائر</span>
                <div className="w-px h-4 bg-lux-silver" />
                <span className="text-xs font-semibold text-lux-slate">{new Date().getFullYear()}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.3 }}
                className="flex items-center justify-center flex-wrap gap-3 text-sm text-lux-slate font-medium"
              >
                <span>&copy; {new Date().getFullYear()} TikCredit Pro</span>
                <span className="w-1 h-1 rounded-full bg-lux-sapphire/30" />
                <span>جميع الحقوق محفوظة</span>
              </motion.div>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}
