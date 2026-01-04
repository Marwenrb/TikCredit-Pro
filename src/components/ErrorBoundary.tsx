'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo)
    
    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
    
    this.setState({ errorInfo })
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-luxury-gradient">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center max-w-2xl"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex p-6 rounded-full bg-status-error/10 mb-6"
            >
              <AlertCircle className="w-16 h-16 text-status-error" />
            </motion.div>

            {/* Error Message */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-elegant-blue mb-4"
            >
              حدث خطأ غير متوقع
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-luxury-darkGray mb-8 max-w-md mx-auto leading-relaxed"
            >
              عذراً، حدث خطأ أثناء تحميل الصفحة. يُرجى إعادة تحميل الصفحة أو الاتصال بالدعم الفني إذا استمرت المشكلة.
            </motion.p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8 p-6 bg-luxury-offWhite rounded-luxury-lg border border-luxury-lightGray text-left"
              >
                <p className="text-sm font-bold text-status-error mb-2">
                  Error Details (Development):
                </p>
                <p className="text-xs font-mono text-luxury-charcoal break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="text-xs font-semibold text-luxury-darkGray cursor-pointer hover:text-elegant-blue">
                      Component Stack
                    </summary>
                    <pre className="text-xs mt-2 p-3 bg-white rounded overflow-auto max-h-40 text-luxury-charcoal">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                variant="gradient"
                size="lg"
                onClick={this.handleReload}
              >
                <RefreshCw className="w-5 h-5 ml-2" />
                إعادة تحميل الصفحة
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/'}
              >
                العودة للصفحة الرئيسية
              </Button>
            </motion.div>

            {/* Support Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-sm text-luxury-mediumGray"
            >
              إذا استمرت المشكلة، يُرجى الاتصال بالدعم الفني
            </motion.p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary



