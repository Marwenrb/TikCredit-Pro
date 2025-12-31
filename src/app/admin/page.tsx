'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-gradient">
        <div className="w-16 h-16 border-4 border-elegant-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <AdminLogin onSuccess={handleAuthSuccess} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <AdminDashboard />
    </div>
  )
}

