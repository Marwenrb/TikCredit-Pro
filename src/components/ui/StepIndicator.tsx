'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepIndicatorProps {
  steps: Array<{ id: number; title: string; description: string }>
  currentStep: number
  className?: string
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                    isCompleted && 'bg-elegant-blue text-white',
                    isCurrent && 'bg-elegant-blue text-white scale-110 shadow-lg shadow-elegant-blue/50',
                    isUpcoming && 'bg-white border-2 border-luxury-lightGray text-luxury-mediumGray'
                  )}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    step.id
                  )}
                </motion.div>
                <motion.div
                  className="mt-2 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      isCurrent && 'text-elegant-blue',
                      isCompleted && 'text-elegant-blue',
                      isUpcoming && 'text-luxury-mediumGray'
                    )}
                  >
                    {step.title}
                  </p>
                </motion.div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 relative">
                  <div className="absolute inset-0 bg-luxury-lightGray" />
                  <motion.div
                    className={cn(
                      'absolute inset-0 h-full',
                      isCompleted ? 'bg-elegant-blue' : 'bg-luxury-lightGray'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator






