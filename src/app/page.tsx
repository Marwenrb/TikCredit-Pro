'use client'

import React from 'react'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle, Sparkles, TrendingUp, Heart, Flag } from 'lucide-react'
import { Button, GlassCard } from '@/components/ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Lazy load particles and background for better performance
const BlueParticles = dynamic(() => import('@/components/ui/BlueParticles'), { 
  ssr: false,
  loading: () => null
})

const UltraPremiumBackground = dynamic(() => import('@/components/ui/UltraPremiumBackground'), {
  ssr: false,
  loading: () => null
})

// ============================================
// ADVANCED TYPESCRIPT ANIMATION SYSTEM
// ============================================

// Type-safe animation variants
const premiumEasing = [0.16, 1, 0.3, 1] as const
const springConfig = { type: 'spring' as const, stiffness: 100, damping: 15 }

// Stagger animation variants with strict typing
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

// Hero text animation with cascade effect
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
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  return (
    <div className="min-h-screen bg-luxury-gradient relative overflow-hidden">
      {/* Ultra-Premium Animated Background */}
      <UltraPremiumBackground 
        variant="default" 
        showParticles={true} 
        showCursorGlow={true}
      />
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-8 h-8 text-elegant-blue" />
              <span className="text-3xl font-bold bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent">
              TikCredit Pro
              </span>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-elegant-blue/10 backdrop-blur-sm rounded-full border border-elegant-blue/20 mb-8"
            >
              <TrendingUp className="w-4 h-4 text-elegant-blue" />
              <span className="text-sm font-medium text-elegant-blue">منصة التمويل الأكثر ثقة في الجزائر</span>
            </motion.div>

            <motion.h1
              variants={heroTextVariants}
              initial="hidden"
              animate="show"
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6"
            >
              <motion.span 
                className="bg-gradient-to-r from-elegant-blue via-elegant-blue-light to-premium-gold bg-clip-text text-transparent leading-tight inline-block"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{ backgroundSize: '200% auto' }}
            >
              TikCredit Pro
              </motion.span>
              <br />
              <motion.span 
                className="text-luxury-charcoal text-4xl md:text-6xl inline-block font-bold"
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
              className="text-xl md:text-2xl text-luxury-darkGray mb-10 max-w-3xl mx-auto font-medium leading-relaxed"
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
          </div>

          {/* Advanced Feature Cards with TypeScript-Powered Animations */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {([
              {
                icon: <CreditCard className="w-10 h-10" />,
                title: 'تمويل سريع',
                description: 'احصل على قرار فوري خلال دقائق معدودة',
                color: 'from-elegant-blue to-elegant-blue-light',
              },
              {
                icon: <Shield className="w-10 h-10" />,
                title: 'آمن ومضمون',
                description: 'بياناتك محمية بأعلى معايير الأمان العالمية',
                color: 'from-premium-gold to-premium-gold-light',
              },
              {
                icon: <Clock className="w-10 h-10" />,
                title: 'معالجة سريعة',
                description: 'معالجة احترافية لطلبك في أقل وقت ممكن',
                color: 'from-elegant-silver to-elegant-silver-light',
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
                  {/* Animated gradient overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-elegant-blue/[0.03] via-elegant-blue-light/[0.02] to-transparent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { duration: 0.4 }
                    }}
                  />
                  
                  {/* Premium shimmer on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-elegant-blue/10 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ 
                      x: '100%',
                      transition: { duration: 1.2, ease: 'easeInOut' }
                    }}
                  />
                  
                  {/* Icon with advanced animation */}
                  <motion.div 
                    className={`inline-flex p-4 rounded-luxury-lg bg-gradient-to-br ${feature.color} mb-6 shadow-premium relative z-10`}
                    whileHover={{ 
                      scale: 1.15,
                      rotate: [0, -5, 5, 0],
                      transition: { 
                        type: 'spring',
                        stiffness: 400,
                        damping: 15
                      }
                    }}
                  >
                    <div className="text-white">{feature.icon}</div>
                    {/* Icon glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-luxury-lg bg-white/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ 
                        opacity: [0, 0.5, 0],
                        scale: [0.8, 1.3, 0.8],
                        transition: { duration: 1, repeat: Infinity }
                      }}
                    />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-luxury-charcoal mb-3 relative z-10 group-hover:text-elegant-blue transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-luxury-darkGray leading-relaxed relative z-10 font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Why Choose Us - Advanced TypeScript Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 120, damping: 20 }}
            className="luxury-card p-10 md:p-12 mb-20 relative overflow-hidden group/section"
          >
            {/* Premium shimmer background */}
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
              <span className="bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent inline-block">
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
                  className="flex items-center gap-4 p-4 rounded-luxury bg-gradient-to-r from-luxury-offWhite to-white hover:from-elegant-blue/5 hover:to-elegant-blue-light/5 border border-luxury-lightGray hover:border-elegant-blue/30 transition-all duration-300 cursor-default group/item shadow-sm hover:shadow-md"
                >
                  <motion.div 
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-elegant-blue to-premium-gold flex items-center justify-center shadow-lg"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.6, type: 'spring', stiffness: 200 }
                    }}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-base font-semibold text-luxury-charcoal group-hover/item:text-elegant-blue transition-colors duration-300">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ultra-Advanced CTA Section - TypeScript Powered */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 100, damping: 20 }}
            className="text-center mb-20"
          >
            <motion.div 
              className="luxury-card p-12 bg-gradient-to-br from-elegant-blue via-elegant-blue-dark to-elegant-blue relative overflow-hidden shadow-luxury-xl"
              whileHover={{ 
                scale: 1.01,
                boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.25)',
                transition: { duration: 0.3 }
              }}
            >
              {/* Advanced multi-layer shimmer */}
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  background: [
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                  ],
                  backgroundPosition: ['-200% 0', '200% 0']
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{ backgroundSize: '200% 100%' }}
              />
              
              {/* Sophisticated particle system */}
              {([
                { size: 2, x: '10%', y: '15%', delay: 0 },
                { size: 3, x: '85%', y: '20%', delay: 0.5 },
                { size: 2, x: '25%', y: '80%', delay: 1 },
                { size: 2.5, x: '75%', y: '70%', delay: 1.5 },
                { size: 1.5, x: '50%', y: '40%', delay: 2 }
              ] as const).map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/30 backdrop-blur-sm"
                  style={{
                    width: particle.size * 4,
                    height: particle.size * 4,
                    left: particle.x,
                    top: particle.y
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: particle.delay,
                    ease: 'easeInOut'
                  }}
                />
              ))}
              
              {/* Glow pulse effect */}
              <motion.div
                className="absolute -inset-[1px] rounded-luxury-lg"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(30, 58, 138, 0)',
                    '0 0 0 4px rgba(30, 58, 138, 0.1)',
                    '0 0 0 0 rgba(30, 58, 138, 0)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              
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
                  className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
                >
                  قدم طلبك الآن واحصل على التمويل الذي تحتاجه بأفضل الشروط
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.8, type: 'spring', stiffness: 150, damping: 20 }}
                >
              <Link href="/form">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
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

        {/* Ultra-Compact Premium Footer */}
        <footer className="relative mt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-elegant-blue/[0.02] to-elegant-blue/[0.05]" />
          
          <div className="relative container mx-auto px-6 py-8">
            {/* Compact Premium Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              {/* Made in Algeria - Premium Linked Badge */}
              <motion.a
                href="https://marwen-rabai.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-luxury-lg bg-gradient-to-br from-white via-luxury-lightGray to-luxury-offWhite shadow-premium border border-elegant-blue/10 hover:border-elegant-blue/30 hover:shadow-luxury-lg transition-all duration-500 group cursor-pointer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <Heart className="w-5 h-5 text-status-error fill-status-error drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-status-error/20"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  />
                </motion.div>
                
                <span className="text-base font-bold bg-gradient-to-r from-elegant-blue via-status-error to-elegant-blue bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient group-hover:scale-105 transition-transform duration-300">
                  صُنع بحب في الجزائر
                </span>
                
                <motion.div
                  animate={{ 
                    rotate: [0, 8, -8, 0],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    repeatDelay: 6,
                    ease: "easeInOut"
                  }}
                  className="group-hover:scale-110 transition-transform duration-300"
                >
                  <span className="text-xl drop-shadow-md">🇩🇿</span>
                </motion.div>
              </motion.a>

              {/* Compact Copyright Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.3 }}
                className="flex items-center justify-center flex-wrap gap-3 text-sm text-luxury-darkGray font-medium"
              >
                <span className="font-medium">&copy; {new Date().getFullYear()} TikCredit Pro</span>
                <motion.span 
                  className="w-1 h-1 rounded-full bg-elegant-blue"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="opacity-70">جميع الحقوق محفوظة</span>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Subtle Shine Effect */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-elegant-blue/20 to-transparent"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scaleX: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </footer>
      </div>
    </div>
  )
}

