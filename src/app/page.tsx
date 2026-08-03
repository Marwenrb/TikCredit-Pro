// TikCredit Pro — Luxury Apple White Theme + 21st.dev Style Cards · 2026
'use client'

import React, { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import Logo from '@/components/ui/Logo'
import MagicCard from '@/components/ui/MagicCard'
import BlueParticles from '@/components/ui/BlueParticles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    router.prefetch('/form')
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative overflow-hidden min-h-screen selection:bg-apple-blue/20">
      {/* ── Ambient Background Particles ───────────────────────────────── */}
      <BlueParticles className="fixed inset-0 z-0 opacity-[0.15]" density={25} />

      <div className="relative z-10">
        {/* ── Apple-Grade Navigation ─────────────────────────────────────── */}
        <nav className={cn(
          "sticky top-0 z-50 transition-all duration-300 ease-apple-out",
          scrolled
            ? "py-4 apple-glass border-b border-glass-border shadow-apple-card"
            : "py-8 bg-transparent"
        )}>
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ease: premiumEasing, duration: 0.8 }}
              >
                <Logo size="md" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, ease: premiumEasing, duration: 0.8 }}
                className="flex items-center gap-4"
              >
                <Link href="/form">
                  <Button variant="default" size="default" className="bg-apple-900 text-white hover:bg-black shadow-apple-btn transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold rounded-full px-6">
                    ابدأ الآن
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </nav>

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <main className="container mx-auto px-6 py-16 md:py-24 max-w-7xl">
          <div className="text-center mb-20">

            {/* Trust badge — Apple glass pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, ease: premiumEasing, duration: 0.8 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full apple-glass border border-glass-border mb-8 relative overflow-hidden group cursor-default"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-apple-blue animate-pulse-soft relative shadow-[0_0_10px_rgba(0,102,204,0.4)]">
                <div className="absolute inset-0 rounded-full bg-apple-blue animate-ping opacity-40" />
              </div>
              <span className="text-sm font-semibold text-apple-900 tracking-wide relative z-10 transition-colors duration-300">
                منصة التمويل الأكثر ثقة في الجزائر
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-normal flex flex-col items-center"
            >
              <motion.div
                className="text-apple-900 drop-shadow-sm flex flex-row flex-nowrap justify-center items-center py-2 overflow-visible"
                dir="ltr"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                {Array.from("Tik Credit Pro").map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.8, filter: 'blur(8px)' },
                      show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', damping: 14, stiffness: 200 } }
                    }}
                    className={letter === " " ? "w-3 md:w-5" : "inline-block"}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
              
              <motion.span
                className="text-apple-gradient inline-block mt-4 pb-4 pt-2 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
              className="text-xl md:text-2xl text-apple-300 mb-10 max-w-3xl mx-auto font-medium leading-relaxed tracking-normal"
            >
              حلول تمويل احترافية ومبتكرة تناسب احتياجاتك مع أفضل الشروط والأسعار التنافسية. 
              مصممة خصيصاً لتمنحك تجربة سلسة، آمنة، واستثنائية.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, ...springConfig }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/form">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ ease: premiumEasing }}
                >
                  <Button size="xl" className="bg-apple-blue text-white hover:bg-apple-blueHover shadow-[0_8px_20px_rgba(0,102,204,0.3)] rounded-full px-10 text-lg font-bold transition-all duration-300">
                    قدم طلبك الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* ── Trust Stats — Next-Gen Magic Cards ──────────────────────── */}
            <motion.div
              className="grid grid-cols-3 gap-4 sm:gap-6 mt-16 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, ...springConfig }}
            >
              {[
                { value: '100%', label: 'حماية مشفّرة', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', color: '#0066CC' },
                { value: '24h', label: 'قبول الطلبات', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2', color: '#FF9500' },
                { value: '+5K', label: 'عميل يثق بنا', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', color: '#34C759' },
              ].map((stat, i) => (
                <MagicCard
                  key={i}
                  className="p-5 sm:p-6 text-center cursor-default group"
                  gradientColor={`${stat.color}15`}
                >
                  <div
                    className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center shadow-sm transition-transform duration-500 ease-apple-out group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={stat.icon} />
                    </svg>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-apple-900 tracking-tight mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-apple-300">
                    {stat.label}
                  </p>
                </MagicCard>
              ))}
            </motion.div>
          </div>

          {/* ── Feature Cards — 21st.dev Magic Cards ──────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
          >
            {([
              {
                title: 'تمويل فوري',
                subtitle: 'قرار خلال 24 ساعة',
                description: 'لا انتظار، لا تعقيدات — نراجع طلبك ونوافق عليه بسرعة قياسية.',
                color: '#0066CC',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              },
              {
                title: 'حماية مطلقة',
                subtitle: 'تشفير 256-bit',
                description: 'بياناتك مؤمّنة بنفس تقنيات البنوك العالمية — خصوصيتك أولويتنا.',
                color: '#AF52DE',
                icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
              },
              {
                title: 'بدون تعقيدات',
                subtitle: 'إجراءات مبسّطة',
                description: 'نموذج واحد فقط — بدون أوراق، بدون طوابير، كل شيء رقمي بالكامل.',
                color: '#FF2D55',
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
              },
            ] as const).map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <MagicCard
                  className="p-8 h-full"
                  gradientColor={`${feature.color}15`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform duration-500 ease-apple-out group-hover:rotate-[5deg] group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-apple-900 tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-semibold mb-4" style={{ color: feature.color }}>
                    {feature.subtitle}
                  </p>
                  <p className="text-apple-300 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </MagicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Why Choose Us — Magic Card Layout ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: premiumEasing }}
            className="mb-24 relative"
          >
            <MagicCard className="p-10 md:p-14 relative overflow-hidden" gradientColor="rgba(0, 102, 204, 0.08)">
              <motion.h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center mb-12 text-apple-900">
                لماذا تختارنا؟
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {([
                  'عملية بسيطة وسريعة جداً',
                  'أسعار تنافسية ومناسبة للجميع',
                  'دعم عملاء على مدار الساعة',
                  'موافقة فورية على الطلبات',
                  'لا حاجة لضمانات معقدة',
                  'خدمة عملاء متميزة ومحترفة',
                ] as const).map((benefit, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, x: 4 }}
                    transition={{ ease: premiumEasing }}
                    className="flex items-center gap-5 p-5 rounded-2xl bg-white/50 border border-black/[0.03] hover:bg-white/80 hover:shadow-apple-btn transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center flex-shrink-0 border border-apple-blue/20">
                      <CheckCircle className="w-5 h-5 text-apple-blue" />
                    </div>
                    <span className="text-lg font-bold text-apple-900/90">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </MagicCard>
          </motion.div>

          {/* ── CTA Section ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: premiumEasing }}
            className="text-center"
          >
            <MagicCard className="p-14 relative overflow-hidden group" gradientColor="rgba(0, 102, 204, 0.15)">
              <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-apple-900 mb-5">
                  جاهز للبدء؟
                </h2>
                <p className="text-xl text-apple-300 mb-10 max-w-2xl mx-auto font-medium">
                  قدم طلبك الآن واحصل على التمويل الذي تحتاجه بأفضل الشروط وبأسرع وقت.
                </p>
                <Link href="/form">
                  <Button className="bg-apple-900 text-white hover:bg-black shadow-apple-btn rounded-full px-12 py-6 text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    ابدأ الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </Link>
              </div>
            </MagicCard>
          </motion.div>
        </main>

        {/* ── Footer — Premium Minimalist ────────────────────────────── */}
        <footer className="border-t border-glass-border mt-20">
          <div className="container mx-auto px-6 py-10 max-w-7xl">
            <div className="flex flex-col items-center gap-6">
              
              {/* Premium Origin Badge */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-3 px-5 py-2.5 rounded-full apple-glass border-glass-border">
                <span className="text-[10px] md:text-[11px] font-bold text-apple-300 tracking-wider">ENGINEERED IN ALGERIA</span>
                <span className="text-base md:text-lg leading-none drop-shadow-sm">🇩🇿</span>
                <span className="w-1 h-1 rounded-full bg-apple-300/50 hidden md:block" />
                <span className="text-[10px] md:text-[11px] font-black text-apple-900 tracking-tight">{new Date().getFullYear()}</span>
                <span className="text-[8px] md:text-[9px] font-black text-apple-blue tracking-[0.2em]">PRO</span>
              </div>

              {/* Minimal Copyright */}
              <div className="flex items-center gap-2 text-xs text-apple-300 font-semibold">
                <span className="text-apple-900 font-bold">TikCredit</span>
                <span className="text-[8px] font-black text-apple-blue tracking-[0.1em] -mt-0.5">PRO</span>
                <span className="w-1 h-1 rounded-full bg-glass-border mx-1" />
                <span>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة</span>
              </div>

            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
