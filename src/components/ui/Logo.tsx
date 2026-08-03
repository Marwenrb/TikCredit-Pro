'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  }
  
  return (
    <motion.div 
      className={cn("flex items-center gap-3 cursor-pointer select-none", className)}
      whileHover="hover"
      initial="initial"
      animate="animate"
    >
      <div className="relative flex items-center justify-center">
        {/* Animated glowing orb behind logo */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-apple-blue to-[#00C6FF] rounded-full blur-[10px] opacity-20"
          variants={{
            hover: { scale: 1.6, opacity: 0.5, rotate: 90 },
            animate: { rotate: 360, transition: { duration: 15, repeat: Infinity, ease: 'linear' } }
          }}
        />
        {/* Glassmorphic icon container */}
        <div className="relative z-10 w-11 h-11 rounded-[14px] bg-white/80 backdrop-blur-xl border border-black/5 shadow-apple-card flex items-center justify-center overflow-hidden transition-all duration-500 ease-apple-out group-hover:shadow-apple-card-hover group-hover:border-black/10">
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-[#1D1D1F] to-[#434347]"
            style={{ 
              maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\'/%3E%3C/svg%3E")', 
              maskSize: '55%', 
              maskPosition: 'center', 
              maskRepeat: 'no-repeat', 
              WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\'/%3E%3C/svg%3E")', 
              WebkitMaskSize: '55%', 
              WebkitMaskPosition: 'center', 
              WebkitMaskRepeat: 'no-repeat' 
            }}
            variants={{ hover: { scale: 1.1, backgroundImage: 'linear-gradient(to bottom right, #0066CC, #00C6FF)' } }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
      
      <div className="flex flex-col justify-center">
        <h1 className={cn("font-black tracking-tighter text-apple-900 leading-none", sizes[size])}>
          Tik<span className="text-apple-blue">Credit</span>
        </h1>
        <motion.span 
          className="text-[10px] font-bold tracking-[0.25em] text-apple-300 uppercase mt-0.5 ml-0.5"
          variants={{ hover: { letterSpacing: '0.35em', color: '#0066CC' } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Pro Edition
        </motion.span>
      </div>
    </motion.div>
  )
}
