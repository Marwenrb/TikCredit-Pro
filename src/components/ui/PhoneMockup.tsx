// Last modified: 2026-04-08 — TikCredit Pro transformation
'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * PhoneMockup — Decorative bezel-less phone frame
 * Illustrative only — shows a mini financing UI inside the screen
 */
const PhoneMockup: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <motion.div
      className={`relative inline-flex ${className}`}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Drop shadow glow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-36 h-8 rounded-full blur-2xl opacity-30"
        style={{ background: 'radial-gradient(ellipse, #1E3A8A 0%, transparent 70%)' }}
      />

      {/* Phone Frame */}
      <div
        className="relative w-44 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-[36px] overflow-hidden"
        style={{
          boxShadow: [
            '0 0 0 2px #2a2a4a',
            '0 0 0 3px #1E3A8A40',
            '0 32px 64px rgba(10,22,40,0.5)',
          ].join(', '),
          paddingBottom: 24,
        }}
      >
        {/* Notch / dynamic island */}
        <div className="flex justify-center pt-3 mb-2">
          <div className="w-20 h-5 bg-[#1a1a2e] rounded-full flex items-center justify-center gap-2"
            style={{ border: '1px solid #2a2a4a' }}>
            <div className="w-2 h-2 rounded-full bg-[#2a2a4a]" />
            <div className="w-6 h-1.5 rounded-full bg-[#2a2a4a]" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="mx-3 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f1a35] to-[#1a2a50]"
          style={{ minHeight: 260 }}>

          {/* Status bar */}
          <div className="flex justify-between items-center px-3 py-1.5">
            <span className="text-white/50 text-[8px] font-bold">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 border border-white/40 rounded-[2px] relative">
                <div className="absolute inset-[1.5px] right-auto w-2/3 bg-white/70 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App header */}
          <div className="px-3 pt-1 pb-2">
            <div className="text-[9px] font-bold text-white/40 tracking-wider uppercase mb-0.5">TikCredit Pro</div>
            <div className="text-[12px] font-black text-white leading-tight">Samsung A55</div>
          </div>

          {/* Product image placeholder */}
          <div className="mx-3 rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-[#1E3A8A]/40 to-[#2563EB]/20 flex items-center justify-center"
            style={{ height: 80 }}>
            {/* Phone icon */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="opacity-60">
              <rect x="6" y="2" width="12" height="20" rx="3" stroke="#60A5FA" strokeWidth="1.5" />
              <circle cx="12" cy="18.5" r="1" fill="#60A5FA" />
              <rect x="9" y="5" width="6" height="1" rx="0.5" fill="#60A5FA" opacity="0.5" />
            </svg>
          </div>

          {/* Price info */}
          <div className="mx-3 mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-black text-[#F59E0B] leading-none">3 200</span>
              <span className="text-[10px] font-semibold text-white/50">DA/mois</span>
            </div>
            <div className="text-[8px] text-white/40 font-medium mt-0.5">36 mensualités · 0% frais de dossier</div>
          </div>

          {/* CTA Button */}
          <div className="mx-3 mb-2">
            <div className="w-full py-2 rounded-xl text-center text-[9px] font-black text-white"
              style={{ background: 'linear-gradient(90deg, #1E3A8A, #2563EB)' }}>
              Demander ce téléphone
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center mt-3">
          <div className="w-16 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      {/* ── Floating Approval Badge ── */}
      <motion.div
        className="absolute -top-3 -right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg z-20"
        style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-white font-black text-[9px] whitespace-nowrap">Approuvé en 2 min</span>
      </motion.div>

      {/* ── Interest-free badge ── */}
      <motion.div
        className="absolute -bottom-2 -left-6 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg z-20"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <span className="text-white font-black text-[9px] whitespace-nowrap">Zéro justificatif</span>
      </motion.div>
    </motion.div>
  )
}

export default PhoneMockup
