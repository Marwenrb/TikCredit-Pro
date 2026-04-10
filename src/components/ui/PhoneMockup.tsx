'use client'

import React from 'react'
import { motion } from 'framer-motion'

const installments = ['12', '24', '36']

const PhoneMockup: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <motion.div
      className={`relative inline-flex ${className}`}
      animate={{ y: [0, -10, 0], rotate: [0, 0.8, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div
        className="absolute -bottom-7 left-1/2 h-10 w-44 -translate-x-1/2 rounded-full blur-2xl opacity-35"
        style={{ background: 'radial-gradient(ellipse, rgba(30,58,138,0.8) 0%, transparent 72%)' }}
      />

      <div
        className="relative w-[228px] rounded-[38px] bg-[#081221] p-[10px]"
        style={{
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.05)',
            '0 0 0 3px rgba(30,58,138,0.12)',
            '0 28px 60px rgba(10,22,40,0.42)',
          ].join(', '),
        }}
      >
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-b from-[#0d1a31] via-[#102346] to-[#173064]">
          <div className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#06101f]" />

          <div className="px-4 pb-4 pt-4">
            <div className="flex items-center justify-between pt-3 text-[10px] font-bold text-white/75">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/55" />
                <span className="h-2 w-2 rounded-full bg-white/35" />
                <span className="h-2 w-5 rounded-full bg-white/55" />
              </div>
            </div>

            <div className="mt-5 flex items-start justify-between gap-3 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55">
                  TikCredit Pro Select
                </p>
                <p className="mt-2 text-[22px] font-black leading-none">Samsung A55</p>
                <p className="mt-2 text-[10px] font-medium text-white/65">
                  Smartphone premium, paiement facilité
                </p>
              </div>
              <div className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[9px] font-bold text-white/90">
                عرض جديد
              </div>
            </div>
          </div>

          <div className="mx-4 mb-4 rounded-[24px] bg-white p-4 shadow-[0_18px_34px_rgba(10,22,40,0.18)]">
            <div className="rounded-[20px] bg-gradient-to-br from-[#eef4ff] via-[#f8fbff] to-[#fff4d7] p-4">
              <div className="flex h-[118px] items-center justify-center rounded-[18px] border border-white/80 bg-white/65 shadow-inner-luxury">
                <div className="relative">
                  <div className="absolute inset-0 scale-125 rounded-full bg-[#d4af37]/20 blur-2xl" />
                  <svg
                    viewBox="0 0 86 120"
                    fill="none"
                    className="relative z-10 h-[96px] w-[68px]"
                    aria-hidden="true"
                  >
                    <rect x="12" y="4" width="62" height="112" rx="16" fill="#0A1628" />
                    <rect x="16" y="9" width="54" height="102" rx="13" fill="url(#screen)" />
                    <rect x="34" y="15" width="18" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
                    <circle cx="43" cy="97" r="8" fill="rgba(255,255,255,0.12)" />
                    <defs>
                      <linearGradient id="screen" x1="16" y1="9" x2="70" y2="111" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#173064" />
                        <stop offset="0.6" stopColor="#2563EB" />
                        <stop offset="1" stopColor="#60A5FA" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {['AMOLED', '5G', '128 Go'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-lux-silver/80 bg-white/85 px-2.5 py-1 text-[9px] font-bold text-lux-navy"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-slate">
                  Exemple d&apos;offre
                </p>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-[28px] font-black leading-none text-lux-navy">3 200</span>
                  <span className="pb-1 text-[11px] font-bold text-lux-slate">DA/mois</span>
                </div>
              </div>
              <div className="rounded-[16px] bg-lux-mist px-3 py-2 text-right">
                <p className="text-[9px] font-bold text-lux-sapphire">36 mensualités</p>
                <p className="text-[9px] font-medium text-lux-slate">0% dossier</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {installments.map((value) => {
                const active = value === '36'

                return (
                  <div
                    key={value}
                    className={`rounded-[14px] px-3 py-2 text-center text-[10px] font-black ${
                      active
                        ? 'bg-gradient-to-r from-lux-navy via-lux-sapphire to-lux-azure text-white shadow-premium'
                        : 'bg-lux-pearl text-lux-slate'
                    }`}
                  >
                    {value}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-[18px] bg-gradient-to-r from-lux-navy via-lux-sapphire to-lux-azure px-4 py-3 text-center text-[11px] font-black text-white shadow-premium-lg">
              Voir l&apos;offre · شوف العرض
            </div>

            <div className="mt-3 flex items-center justify-between text-[9px] font-medium text-lux-slate">
              <span>Carte d&apos;identité</span>
              <span>Validation rapide</span>
              <span>Suivi clair</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -right-10 top-5 rounded-full bg-gradient-to-r from-status-success to-status-success-light px-3 py-2 text-[10px] font-black text-white shadow-[0_10px_24px_rgba(5,150,105,0.35)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 240, damping: 18 }}
      >
        Accord initial 2 min
      </motion.div>

      <motion.div
        className="absolute left-[-24px] top-1/2 rounded-[18px] border border-white/70 bg-white/92 px-3 py-2 text-[10px] font-bold text-lux-navy shadow-luxury-lg backdrop-blur-sm"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.65, type: 'spring', stiffness: 240, damping: 18 }}
      >
        Carte d&apos;identité فقط
      </motion.div>

      <motion.div
        className="absolute -bottom-2 -left-8 rounded-full bg-gradient-to-r from-premium-gold-dark to-premium-gold px-3 py-2 text-[10px] font-black text-white shadow-[0_10px_24px_rgba(184,148,31,0.35)]"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 240, damping: 18 }}
      >
        0% frais dossier
      </motion.div>
    </motion.div>
  )
}

export default PhoneMockup
