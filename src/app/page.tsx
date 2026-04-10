// Last modified: 2026-04-08 — TikCredit Pro transformation
'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import Logo from '@/components/ui/Logo'
import Preloader from '@/components/ui/Preloader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Dynamically import heavy section to avoid hydration issues
const PhoneSection = dynamic(() => import('@/components/home/PhoneSection'), { ssr: false })

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    router.prefetch('/form')
  }, [router])

  // Dismiss preloader after 2.4 s (covers font load + initial paint)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      <div className="min-h-screen bg-lux-ivory relative overflow-hidden">
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Logo size="md" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <Link
                href="#telephone-facilite"
                className="hidden md:block text-sm font-semibold text-lux-slate hover:text-lux-sapphire transition-colors duration-200"
              >
                تليفونات بالتقسيط
              </Link>
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

            {/* Trust Indicators — Premium Stat Cards */}
            <motion.div
              className="grid grid-cols-3 gap-3 sm:gap-5 mt-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 120, damping: 20 }}
            >
              {[
                {
                  value: '100%',
                  label: 'حماية مشفّرة',
                  icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
                  gradient: 'from-lux-sapphire to-elegant-blue',
                  glow: 'rgba(30,58,138,0.12)',
                },
                {
                  value: '24h',
                  label: 'قبول الطلبات',
                  icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2',
                  gradient: 'from-premium-gold-dark to-premium-gold',
                  glow: 'rgba(184,148,31,0.12)',
                },
                {
                  value: '+5K',
                  label: 'عميل يثق بنا',
                  icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
                  gradient: 'from-status-success to-status-success-light',
                  glow: 'rgba(5,150,105,0.12)',
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative bg-white rounded-2xl border border-lux-silver/80 p-4 sm:p-5 text-center shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.gradient}`} />

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}
                    style={{ boxShadow: `0 4px 14px ${stat.glow}` }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={stat.icon} />
                    </svg>
                  </div>

                  {/* Value */}
                  <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent leading-none mb-1`}>
                    {stat.value}
                  </p>

                  {/* Label */}
                  <p className="text-xs sm:text-sm font-semibold text-lux-slate leading-tight">
                    {stat.label}
                  </p>
                </motion.div>
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
                title: 'تمويل فوري',
                subtitle: 'قرار خلال 24 ساعة',
                description: 'لا انتظار، لا تعقيدات — نراجع طلبك ونوافق عليه بسرعة قياسية',
                gradient: 'from-lux-sapphire to-elegant-blue',
                accentColor: '#1E3A8A',
                iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
                badge: 'الأسرع',
              },
              {
                title: 'حماية مطلقة',
                subtitle: 'تشفير 256-bit',
                description: 'بياناتك مؤمّنة بنفس تقنيات البنوك العالمية — خصوصيتك أولويتنا',
                gradient: 'from-premium-gold-dark to-premium-gold',
                accentColor: '#B8941F',
                iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
                badge: 'موثوق',
              },
              {
                title: 'بدون تعقيدات',
                subtitle: 'إجراءات مبسّطة',
                description: 'نموذج واحد فقط — بدون أوراق، بدون طوابير، كل شيء رقمي بالكامل',
                gradient: 'from-elegant-blue to-elegant-blue-light',
                accentColor: '#2563EB',
                iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                badge: 'سهل',
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

                  {/* Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r ${feature.gradient} z-20`}>
                    <span className="text-[10px] font-bold text-white tracking-wider">{feature.badge}</span>
                  </div>

                  {/* Custom SVG Icon */}
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg relative z-10`}
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

                  <h3 className="text-2xl font-bold text-lux-navy mb-1 relative z-10 group-hover:text-lux-sapphire transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className={`text-sm font-bold mb-3 relative z-10 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.subtitle}
                  </p>
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

        {/* ── Téléphones en Facilité Section ── */}
        <PhoneSection />

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
    </>
  )
}
