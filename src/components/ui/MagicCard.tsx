'use client'

import React, { useRef, useState } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagicCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  gradientColor?: string
}

export default function MagicCard({
  children,
  className,
  gradientColor = 'rgba(0, 102, 204, 0.15)',
  ...props
}: MagicCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setOpacity(1)
  const handleMouseLeave = () => setOpacity(0)

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-3xl bg-white/70 border border-black/5 shadow-apple-card transition-all duration-500 ease-apple-out hover:shadow-apple-card-hover hover:-translate-y-1',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 40%)`,
        }}
      />
      
      {/* Shine effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.8), transparent 40%)`,
        }}
      />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  )
}
