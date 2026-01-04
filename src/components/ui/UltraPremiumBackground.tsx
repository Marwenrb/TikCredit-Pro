'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Ultra-Premium Animated Background v2.0
 * Features:
 * - Advanced Aurora Effects
 * - 3D Floating Orbs with depth
 * - Interactive cursor magnetic field
 * - Geometric pattern overlay
 * - Morphing gradient meshes
 * - Cinematic light beams
 */

interface UltraPremiumBackgroundProps {
  variant?: 'aurora' | 'cosmic' | 'luxury' | 'minimal'
  intensity?: 'low' | 'medium' | 'high'
  interactive?: boolean
  className?: string
}

// Particle types for variety
interface Particle {
  id: number
  x: number
  y: number
  size: number
  type: 'orb' | 'star' | 'dust'
  color: string
  glow: string
  duration: number
  delay: number
  depth: number
}

// Geometric shapes for pattern overlay
interface GeometricShape {
  id: number
  type: 'hexagon' | 'triangle' | 'diamond'
  x: number
  y: number
  size: number
  rotation: number
  opacity: number
}

const UltraPremiumBackground: React.FC<UltraPremiumBackgroundProps> = ({
  variant = 'aurora',
  intensity = 'medium',
  interactive = true,
  className = '',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mouse tracking with throttling for performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    requestAnimationFrame(() => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    })
  }, [])

  useEffect(() => {
    if (interactive && isClient) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [interactive, isClient, handleMouseMove])

  // Generate particles based on intensity
  const particleCount = intensity === 'low' ? 15 : intensity === 'medium' ? 30 : 50

  const particles = useMemo<Particle[]>(() => {
    if (!isClient) return []
    return Array.from({ length: particleCount }).map((_, i) => {
      const type = i % 4 === 0 ? 'orb' : i % 3 === 0 ? 'star' : 'dust'
      const colors = {
        orb: {
          color: 'rgba(59, 130, 246, 0.6)',
          glow: 'rgba(59, 130, 246, 0.4)',
        },
        star: {
          color: 'rgba(245, 158, 11, 0.7)',
          glow: 'rgba(245, 158, 11, 0.3)',
        },
        dust: {
          color: 'rgba(255, 255, 255, 0.5)',
          glow: 'rgba(255, 255, 255, 0.2)',
        },
      }
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: type === 'orb' ? 6 + Math.random() * 8 : type === 'star' ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
        type,
        color: colors[type].color,
        glow: colors[type].glow,
        duration: 10 + Math.random() * 20,
        delay: Math.random() * 8,
        depth: 0.5 + Math.random() * 0.5,
      }
    })
  }, [isClient, particleCount])

  // Geometric pattern shapes
  const geometricShapes = useMemo<GeometricShape[]>(() => {
    if (!isClient) return []
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      type: ['hexagon', 'triangle', 'diamond'][i % 3] as 'hexagon' | 'triangle' | 'diamond',
      x: 10 + (i * 12) + Math.random() * 5,
      y: 20 + Math.random() * 60,
      size: 40 + Math.random() * 60,
      rotation: Math.random() * 360,
      opacity: 0.02 + Math.random() * 0.03,
    }))
  }, [isClient])

  if (!isClient) {
    return <div className={`fixed inset-0 -z-10 bg-gradient-to-br from-white via-blue-50/30 to-white ${className}`} />
  }

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/20" />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Aurora Effect - Primary Wave */}
      {variant === 'aurora' && (
        <>
          <motion.div
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[100%] opacity-30"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.1) 30%, rgba(99, 102, 241, 0.15) 50%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)',
              filter: 'blur(60px)',
              transform: 'rotate(-12deg)',
            }}
            animate={{
              x: ['-10%', '10%', '-10%'],
              y: ['-5%', '5%', '-5%'],
              rotate: [-12, -8, -12],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Aurora Secondary Wave */}
          <motion.div
            className="absolute -top-1/4 -right-1/4 w-[100%] h-[80%] opacity-20"
            style={{
              background: 'linear-gradient(200deg, transparent 0%, rgba(245, 158, 11, 0.08) 30%, rgba(251, 191, 36, 0.1) 50%, rgba(245, 158, 11, 0.08) 70%, transparent 100%)',
              filter: 'blur(80px)',
              transform: 'rotate(15deg)',
            }}
            animate={{
              x: ['5%', '-5%', '5%'],
              y: ['5%', '-5%', '5%'],
              rotate: [15, 20, 15],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </>
      )}

      {/* Cosmic variant - Deep space effect */}
      {variant === 'cosmic' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-transparent to-indigo-900/5" />
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </>
      )}

      {/* Luxury variant - Gold accent beams */}
      {variant === 'luxury' && (
        <>
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full opacity-10"
            style={{
              background: 'linear-gradient(135deg, transparent 40%, rgba(245, 158, 11, 0.3) 50%, transparent 60%)',
              filter: 'blur(40px)',
            }}
            animate={{
              x: ['-20%', '20%', '-20%'],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </>
      )}

      {/* Interactive Cursor Magnetic Field */}
      {interactive && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Primary glow */}
          <div 
            className="w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          {/* Secondary ring */}
          <div 
            className="absolute inset-0 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, transparent 30%, rgba(245, 158, 11, 0.03) 50%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      )}

      {/* Floating 3D Orbs with Depth Effect */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.type === 'orb' 
                ? `radial-gradient(circle at 30% 30%, ${particle.color}, transparent 70%)`
                : particle.color,
              boxShadow: particle.type === 'orb' 
                ? `0 0 ${particle.size * 3}px ${particle.glow}, inset 0 0 ${particle.size}px rgba(255,255,255,0.3)`
                : `0 0 ${particle.size * 2}px ${particle.glow}`,
              zIndex: Math.floor(particle.depth * 10),
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, -80 * particle.depth, 0],
              x: [(Math.random() - 0.5) * 50 * particle.depth, (Math.random() - 0.5) * -50 * particle.depth, (Math.random() - 0.5) * 50 * particle.depth],
              opacity: [0, 0.8 * particle.depth, 0],
              scale: [0.3, 1.2 * particle.depth, 0.3],
              rotate: particle.type === 'star' ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {geometricShapes.map((shape) => (
          <motion.div
            key={`shape-${shape.id}`}
            className="absolute border border-blue-200/20"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              opacity: shape.opacity,
              clipPath: shape.type === 'hexagon' 
                ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                : shape.type === 'triangle'
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            animate={{
              rotate: [shape.rotation, shape.rotation + 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 30 + shape.id * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Cinematic Light Beams */}
      <motion.div
        className="absolute -top-20 left-1/4 w-1 h-[120%] opacity-10"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
          filter: 'blur(20px)',
          transform: 'rotate(25deg)',
        }}
        animate={{
          x: [0, 100, 0],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -top-20 right-1/3 w-1 h-[120%] opacity-5"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(245, 158, 11, 0.2), transparent)',
          filter: 'blur(15px)',
          transform: 'rotate(-20deg)',
        }}
        animate={{
          x: [0, -80, 0],
          opacity: [0.03, 0.1, 0.03],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />

      {/* Floating Gradient Orbs - Large Ambient */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Central Focal Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Vignette Effect for Premium Feel */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.02) 100%)',
        }}
      />
    </div>
  )
}

export default UltraPremiumBackground
