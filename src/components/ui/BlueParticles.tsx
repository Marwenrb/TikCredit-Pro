'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface BlueParticlesProps {
  className?: string
  density?: number
}

/**
 * Professional Blue Particle Background
 * Lightweight, performant, TypeScript-powered
 */
const BlueParticles: React.FC<BlueParticlesProps> = ({ 
  className = '', 
  density = 30 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Particle class with TypeScript
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      pulseSpeed: number
      hue: number
      canvasWidth: number
      canvasHeight: number

      constructor(width: number, height: number) {
        this.canvasWidth = width
        this.canvasHeight = height
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 0.3
        this.speedY = (Math.random() - 0.5) * 0.3
        this.opacity = Math.random() * 0.3 + 0.1
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.hue = Math.random() * 20 + 210 // Blue range (210-230)
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around edges
        if (this.x > this.canvasWidth) this.x = 0
        if (this.x < 0) this.x = this.canvasWidth
        if (this.y > this.canvasHeight) this.y = 0
        if (this.y < 0) this.y = this.canvasHeight

        // Pulse opacity
        this.opacity += this.pulseSpeed
        if (this.opacity > 0.4 || this.opacity < 0.1) {
          this.pulseSpeed *= -1
        }
      }

      draw() {
        if (!ctx) return
        
        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        )
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${this.opacity})`)
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < density; i++) {
      particles.push(new Particle(canvas.width, canvas.height))
    }

    // Connection lines between nearby particles
    const drawConnections = () => {
      if (!ctx) return
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.strokeStyle = `rgba(30, 58, 138, ${0.15 * (1 - distance / 120)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      if (!ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections first (behind particles)
      drawConnections()
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', setSize)
      cancelAnimationFrame(animationId)
    }
  }, [density])

  return (
    <div className={`pointer-events-none ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-40"
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  )
}

export default BlueParticles

