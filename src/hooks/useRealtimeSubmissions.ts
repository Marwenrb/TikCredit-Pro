'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Submission } from '@/types'

export interface SSEEvent {
  type: 'connected' | 'new_submission' | 'count_update' | 'heartbeat'
  data?: Submission | Record<string, unknown>
  timestamp: string
  connectionId?: string
  activeConnections?: number
  count?: number
}

export interface UseRealtimeSubmissionsOptions {
  enabled?: boolean
  onNewSubmission?: (submission: Submission) => void
  onCountUpdate?: (count: number) => void
  onError?: (error: Error) => void
  onConnect?: (connectionId: string) => void
  onDisconnect?: () => void
  reconnectAttempts?: number
  reconnectInterval?: number
}

export interface UseRealtimeSubmissionsResult {
  isConnected: boolean
  connectionId: string | null
  activeConnections: number
  lastEvent: SSEEvent | null
  error: Error | null
  reconnect: () => void
  disconnect: () => void
}

/**
 * Custom hook for real-time submission updates via Server-Sent Events
 */
export function useRealtimeSubmissions(
  options: UseRealtimeSubmissionsOptions = {}
): UseRealtimeSubmissionsResult {
  const {
    enabled = true,
    onNewSubmission,
    onCountUpdate,
    onError,
    onConnect,
    onDisconnect,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const [activeConnections, setActiveConnections] = useState(0)
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource('/api/realtime/submissions')
      eventSourceRef.current = eventSource

      eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse(event.data) as SSEEvent
        setIsConnected(true)
        setConnectionId(data.connectionId || null)
        setActiveConnections(data.activeConnections || 0)
        setLastEvent(data)
        setError(null)
        reconnectCountRef.current = 0
        onConnect?.(data.connectionId || '')
      })

      eventSource.addEventListener('new_submission', (event) => {
        const data = JSON.parse(event.data) as SSEEvent
        setLastEvent(data)
        if (data.data) {
          onNewSubmission?.(data.data as Submission)
        }
      })

      eventSource.addEventListener('count_update', (event) => {
        const data = JSON.parse(event.data) as SSEEvent
        setLastEvent(data)
        if (typeof data.count === 'number') {
          onCountUpdate?.(data.count)
        }
      })

      eventSource.addEventListener('heartbeat', (event) => {
        const data = JSON.parse(event.data) as SSEEvent
        setLastEvent(data)
      })

      eventSource.onerror = (err) => {
        console.error('SSE error:', err)
        setIsConnected(false)
        
        const error = new Error('Connection lost')
        setError(error)
        onError?.(error)
        onDisconnect?.()
        
        // Attempt reconnection
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++
          console.log(`Reconnecting... attempt ${reconnectCountRef.current}/${reconnectAttempts}`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled) {
              connect()
            }
          }, reconnectInterval * reconnectCountRef.current)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect')
      setError(error)
      onError?.(error)
    }
  }, [enabled, onNewSubmission, onCountUpdate, onError, onConnect, onDisconnect, reconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsConnected(false)
    setConnectionId(null)
    onDisconnect?.()
  }, [onDisconnect])

  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0
    disconnect()
    connect()
  }, [connect, disconnect])

  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    connectionId,
    activeConnections,
    lastEvent,
    error,
    reconnect,
    disconnect,
  }
}

export default useRealtimeSubmissions
