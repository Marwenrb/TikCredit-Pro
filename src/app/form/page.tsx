'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE OPTIMIZATION: Preload CleanForm component
// Instead of lazy loading on navigation, we render it immediately but hidden
// This eliminates the perceived "lag" when clicking "Start"
// ═══════════════════════════════════════════════════════════════════════════════

import CleanForm from '@/components/form/CleanForm'

export default function FormPage() {
  // Track if component is mounted (hydrated)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after initial render
    setIsHydrated(true)
  }, [])

  return (
    <div className="min-h-screen bg-luxury-gradient relative overflow-hidden">
      {/* Subtle Background Pattern - GPU accelerated with will-change */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ willChange: 'opacity' }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1E3A8A 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Shapes - GPU accelerated */}
      <div
        className="absolute top-20 right-10 w-72 h-72 bg-elegant-blue-light/5 rounded-full blur-3xl animate-float"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-premium-gold-light/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '2s', willChange: 'transform', transform: 'translateZ(0)' }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-elegant-blue hover:text-elegant-blue-dark font-semibold transition-colors duration-300"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Link>
          </motion.div>
        </div>

        {/* Form Container */}
        <div className="container mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent">
                نموذج طلب التمويل
              </span>
            </h1>
            <p className="text-lg text-luxury-darkGray max-w-2xl mx-auto">
              املأ النموذج التالي بدقة وسنقوم بمراجعة طلبك في أقرب وقت ممكن
            </p>
          </motion.div>

          {/* Form with fade-in animation - pre-rendered but animated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHydrated ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ willChange: 'opacity' }}
          >
            {/* Show loading skeleton until hydrated */}
            {!isHydrated ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-elegant-blue animate-spin" />
              </div>
            ) : (
              <CleanForm />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
