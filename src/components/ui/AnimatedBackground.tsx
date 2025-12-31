'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export interface AnimatedBackgroundProps {
  className?: string
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Particle system
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.5 + 0.2
        this.color = Math.random() > 0.5 ? '#D4AF37' : '#B8941F'
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(canvas.width, canvas.height))
    }

    // Connection lines
    const drawConnections = () => {
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.hypot(
            particle.x - otherParticle.x,
            particle.y - otherParticle.y
          )
          
          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = '#D4AF37'
            ctx.globalAlpha = (1 - distance / 150) * 0.2
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update(canvas.width, canvas.height)
        particle.draw()
      })
      
      drawConnections()
      
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${className}`}
        style={{ opacity: 0.3 }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-full h-full bg-gradient-radial from-gold-500/20 via-gold-600/10 to-transparent rounded-full blur-3xl" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-0 left-0 w-[800px] h-[800px]"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-full h-full bg-gradient-radial from-gold-600/15 via-gold-700/5 to-transparent rounded-full blur-3xl" />
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="w-full h-full bg-gradient-conic from-gold-500/10 via-transparent to-gold-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* Mesh gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at top right, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(184, 148, 31, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid 20s linear infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes grid {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </>
  )
}

export default AnimatedBackground

