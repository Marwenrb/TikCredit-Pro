'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
  showCursor?: boolean
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('')
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-gold-400 ml-1 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  )
}

export default Typewriter






