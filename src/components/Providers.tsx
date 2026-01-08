'use client'

import React from 'react'
import ToastProvider from '@/components/ui/Toast'

/**
 * Client-side Providers Wrapper
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
