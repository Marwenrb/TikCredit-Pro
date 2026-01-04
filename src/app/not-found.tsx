'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'

/**
 * Premium 404 Not Found Page
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-luxury-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        {/* 404 Number */}
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-9xl font-extrabold bg-gradient-to-r from-elegant-blue to-premium-gold bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Error Message */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-elegant-blue mb-4"
        >
          الصفحة غير موجودة
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-luxury-darkGray mb-8 max-w-md mx-auto"
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button variant="gradient" size="lg">
              <Home className="w-5 h-5 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          <Link href="/form">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 ml-2" />
              تقديم طلب تمويل
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}


