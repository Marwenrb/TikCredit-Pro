'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Ultra-Premium Animated Background
 * Features: Animated gradient meshes, floating particles, interactive cursor effects
 */

interface UltraPremiumBackgroundProps {
  variant?: 'default' | 'subtle' | 'vibrant'
  showParticles?: boolean
  showCursorGlow?: boolean
  className?: string
}

const UltraPremiumBackground: React.FC<UltraPremiumBackgroundProps> = ({
  variant = 'default',
  showParticles = true,
  showCursorGlow = true,
  className = '',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    if (showCursorGlow) {
      window.addEventListener('mousemove', updateMousePosition)
      return () => window.removeEventListener('mousemove', updateMousePosition)
    }
  }, [showCursorGlow])

  // Generate particle configurations
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.2,
    color:
      i % 3 === 0
        ? 'rgba(59, 130, 246, 0.3)' // Blue
        : i % 3 === 1
        ? 'rgba(245, 158, 11, 0.2)' // Gold
        : 'rgba(255, 255, 255, 0.4)', // White
  }))

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-noise" />

      {/* Animated Gradient Meshes */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Secondary Gradient Layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)',
            'radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.06) 0%, transparent 40%)',
            'radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)',
            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.06) 0%, transparent 40%)',
            'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Cursor Glow Effect */}
      {showCursorGlow && (
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Floating Particle System */}
      {showParticles && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: `${particle.startX}%`,
                top: `${particle.startY}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: particle.color,
                boxShadow: `0 0 ${particle.size * 5}px ${particle.color}`,
              }}
              animate={{
                y: [0, -50 - Math.random() * 100, 0],
                x: [0, (Math.random() - 0.5) * 100, 0],
                opacity: [0, particle.opacity, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Shapes for Extra Depth */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-elegant-blue-light/5 rounded-full blur-3xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-premium-gold-light/5 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-elegant-blue/3 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  )
}

export default UltraPremiumBackground


