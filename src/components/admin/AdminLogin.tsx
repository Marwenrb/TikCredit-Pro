'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useRouter } from 'next/navigation'

export interface AdminLoginProps {
  onSuccess: () => void
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          onSuccess()
        }
      }
    } catch (error) {
      // Not authenticated
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Authentication successful
        onSuccess()
        router.refresh()
      } else {
        setError(data.error === 'Invalid password' ? 'كلمة المرور غير صحيحة' : 'حدث خطأ أثناء تسجيل الدخول')
        setPassword('')
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-luxury-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-luxury-lightGray shadow-luxury-xl p-8">
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-elegant-blue/10 rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Lock className="w-8 h-8 text-elegant-blue" />
            </motion.div>
            <h1 className="text-3xl font-bold text-elegant-blue mb-2">لوحة التحكم</h1>
            <p className="text-luxury-darkGray">يرجى إدخال كلمة المرور للوصول</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="pr-12"
                error={error}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-mediumGray hover:text-elegant-blue transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-luxury-mediumGray">
              هذه الصفحة محمية بكلمة مرور. الوصول مخصص للمسؤولين فقط.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin

