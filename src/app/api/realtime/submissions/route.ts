import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

/**
 * Real-time Server-Sent Events (SSE) endpoint for live submission updates
 * 
 * This endpoint establishes a persistent connection with the client and
 * sends real-time updates when new submissions arrive.
 */

// Store active connections for broadcasting
const connections = new Map<string, ReadableStreamDefaultController<Uint8Array>>()

// Track last known submission count for change detection
let lastSubmissionCount = 0
let lastSubmissionId: string | null = null

/**
 * Broadcast a new submission event to all connected clients
 * Note: This is an internal function, not exported from the route handler
 */
function broadcastNewSubmission(submission: Record<string, unknown>) {
  const event = {
    type: 'new_submission',
    data: submission,
    timestamp: new Date().toISOString(),
  }
  
  const message = `event: new_submission\ndata: ${JSON.stringify(event)}\n\n`
  const encoder = new TextEncoder()
  const encoded = encoder.encode(message)
  
  connections.forEach((controller, connectionId) => {
    try {
      controller.enqueue(encoded)
    } catch (error) {
      console.error(`Failed to send to connection ${connectionId}:`, error)
      connections.delete(connectionId)
    }
  })
}

/**
 * Poll Firestore for new submissions and broadcast changes
 * In production, use Firestore onSnapshot listener instead
 */
async function pollForChanges() {
  if (!adminDb) return
  
  try {
    const snapshot = await adminDb
      .collection('submissions')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    
    if (!snapshot.empty) {
      const latestDoc = snapshot.docs[0]
      const latestId = latestDoc.id
      
      // Check if this is a new submission
      if (lastSubmissionId && latestId !== lastSubmissionId) {
        const submission = {
          id: latestId,
          ...latestDoc.data(),
        }
        broadcastNewSubmission(submission)
      }
      
      lastSubmissionId = latestId
    }
    
    // Get total count
    const countSnapshot = await adminDb.collection('submissions').count().get()
    const currentCount = countSnapshot.data().count
    
    if (currentCount !== lastSubmissionCount) {
      // Broadcast count change
      const countEvent = {
        type: 'count_update',
        count: currentCount,
        timestamp: new Date().toISOString(),
      }
      
      const message = `event: count_update\ndata: ${JSON.stringify(countEvent)}\n\n`
      const encoder = new TextEncoder()
      const encoded = encoder.encode(message)
      
      connections.forEach((controller, connectionId) => {
        try {
          controller.enqueue(encoded)
        } catch (error) {
          connections.delete(connectionId)
        }
      })
      
      lastSubmissionCount = currentCount
    }
  } catch (error) {
    console.error('Polling error:', error)
  }
}

// Start polling interval (5 seconds) - only if there are connections
let pollingInterval: NodeJS.Timeout | null = null

function startPolling() {
  if (!pollingInterval && connections.size > 0) {
    pollingInterval = setInterval(pollForChanges, 5000)
    pollForChanges() // Initial poll
  }
}

function stopPolling() {
  if (pollingInterval && connections.size === 0) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

export async function GET(request: NextRequest) {
  // Verify authentication
  const token = request.cookies.get('admin-token')?.value
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  const connectionId = crypto.randomUUID()
  
  // Create SSE stream
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Store connection
      connections.set(connectionId, controller)
      
      // Start polling if needed
      startPolling()
      
      // Send initial connection event
      const encoder = new TextEncoder()
      const connectEvent = {
        type: 'connected',
        connectionId,
        timestamp: new Date().toISOString(),
        activeConnections: connections.size,
      }
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify(connectEvent)}\n\n`))
      
      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify(heartbeat)}\n\n`))
        } catch (error) {
          clearInterval(heartbeatInterval)
          connections.delete(connectionId)
          stopPolling()
        }
      }, 30000)
      
      // Handle connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        connections.delete(connectionId)
        stopPolling()
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
    cancel() {
      connections.delete(connectionId)
      stopPolling()
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  })
}

/**
 * POST handler for manually triggering a broadcast (used by submit endpoint)
 */
export async function POST(request: NextRequest) {
  // Verify internal call or admin
  const authHeader = request.headers.get('X-Internal-Token')
  const internalToken = process.env.INTERNAL_API_TOKEN
  
  // Allow internal calls or authenticated admins
  if (authHeader !== internalToken) {
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
  }
  
  try {
    const submission = await request.json()
    broadcastNewSubmission(submission)
    
    return new Response(JSON.stringify({ 
      success: true, 
      broadcastedTo: connections.size 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
  }
}
