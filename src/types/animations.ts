/**
 * Advanced TypeScript Animation Types
 * Ultra-professional animation system with strict typing
 */

import { Variants, Transition, MotionValue } from 'framer-motion'

// ============================================
// CORE ANIMATION TYPES
// ============================================

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'circIn' | 'circOut' | 'circInOut' | 'backIn' | 'backOut' | 'backInOut' | 'anticipate'

export type SpringPreset = 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses'

export interface AnimationConfig {
  duration?: number
  delay?: number
  ease?: EasingFunction | number[]
  repeat?: number
  repeatType?: 'loop' | 'reverse' | 'mirror'
  repeatDelay?: number
}

export interface SpringConfig {
  type: 'spring'
  stiffness?: number
  damping?: number
  mass?: number
  velocity?: number
}

// ============================================
// PREMIUM ANIMATION VARIANTS
// ============================================

export const premiumVariants = {
  // Fade animations
  fadeIn: {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  } as Variants,

  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  } as Variants,

  // Scale animations
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    }
  } as Variants,

  // Stagger container
  staggerContainer: (staggerDelay: number = 0.1) => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
        when: 'beforeChildren'
      }
    }
  } as Variants),

  // Stagger child item
  staggerItem: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  } as Variants,

  // Slide animations
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  } as Variants,

  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  } as Variants,

  // Rotate animations
  rotateIn: {
    hidden: { opacity: 0, rotate: -10, scale: 0.95 },
    show: { 
      opacity: 1, 
      rotate: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20
      }
    }
  } as Variants
} as const

// ============================================
// HOVER ANIMATIONS
// ============================================

export const hoverAnimations = {
  lift: {
    y: -8,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },

  scale: {
    scale: 1.05,
    transition: { duration: 0.3, type: 'spring', stiffness: 300 }
  },

  glow: {
    boxShadow: '0 0 30px rgba(30, 58, 138, 0.3), 0 0 60px rgba(30, 58, 138, 0.15)',
    transition: { duration: 0.3 }
  },

  rotate: {
    rotate: 3,
    scale: 1.05,
    transition: { duration: 0.3, type: 'spring' }
  }
} as const

// ============================================
// TAP ANIMATIONS
// ============================================

export const tapAnimations = {
  shrink: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },

  press: {
    scale: 0.98,
    y: 2,
    transition: { duration: 0.1 }
  }
} as const

// ============================================
// CONTINUOUS ANIMATIONS
// ============================================

export const continuousAnimations = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  glow: {
    boxShadow: [
      '0 0 20px rgba(30, 58, 138, 0.2)',
      '0 0 40px rgba(30, 58, 138, 0.4)',
      '0 0 20px rgba(30, 58, 138, 0.2)'
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  float: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  shimmer: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
} as const

// ============================================
// SPRING PRESETS
// ============================================

export const springPresets: Record<SpringPreset, SpringConfig> = {
  gentle: { type: 'spring', stiffness: 100, damping: 15 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12 },
  stiff: { type: 'spring', stiffness: 300, damping: 20 },
  slow: { type: 'spring', stiffness: 60, damping: 15 },
  molasses: { type: 'spring', stiffness: 50, damping: 20 }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create custom spring animation with TypeScript safety
 */
export const createSpring = (preset: SpringPreset, overrides?: Partial<SpringConfig>): SpringConfig => {
  return { ...springPresets[preset], ...overrides }
}

/**
 * Create stagger container with custom delay
 */
export const createStagger = (
  staggerDelay: number = 0.1,
  delayChildren: number = 0.2
): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
      when: 'beforeChildren'
    }
  }
})

/**
 * Create parallax effect with TypeScript-safe transform
 */
export interface ParallaxConfig {
  scrollRange: [number, number]
  outputRange: [string, string]
  ease?: EasingFunction
}

export const createParallax = (config: ParallaxConfig) => config

// ============================================
// ADVANCED GESTURE ANIMATIONS
// ============================================

export interface GestureAnimations {
  hover?: Record<string, any>
  tap?: Record<string, any>
  drag?: Record<string, any>
  focus?: Record<string, any>
}

export const createGestures = (config: GestureAnimations) => config

// ============================================
// TYPE-SAFE ANIMATION HELPERS
// ============================================

export type AnimationVariant = keyof typeof premiumVariants
export type HoverAnimation = keyof typeof hoverAnimations
export type TapAnimation = keyof typeof tapAnimations
export type ContinuousAnimation = keyof typeof continuousAnimations

