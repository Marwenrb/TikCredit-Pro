import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  SUBMISSIONS_FILE,
  readSubmissionsFile,
  getFileModTime,
  isDev as isDevMode
} from '@/lib/storage-utils'

/**
 * Real-time Server-Sent Events (SSE) endpoint for live submission updates
 * Works with local storage when Firebase is unavailable
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Store active connections for broadcasting
const connections = new Map<string, ReadableStreamDefaultController<Uint8Array>>()

// Track last known submission info for change detection
let lastSubmissionCount = 0
let lastSubmissionId: string | null = null
let lastFileModTime = 0

/**
 * Check local file for new submissions
 */
async function checkLocalSubmissions(): Promise<{ count: number; latestId: string | null; latestSubmission: unknown }> {
  try {
    const modTime = await getFileModTime()

    // Only read file if it was modified
    if (modTime === lastFileModTime) {
      return { count: lastSubmissionCount, latestId: lastSubmissionId, latestSubmission: null }
    }

    lastFileModTime = modTime

    const data = await readSubmissionsFile()
    const submissions = data.submissions || []

    const count = submissions.length
    const latestId = submissions.length > 0 ? submissions[0].id : null
    const latestSubmission = submissions.length > 0 ? submissions[0] : null

    return { count, latestId, latestSubmission }
  } catch {
    return { count: 0, latestId: null, latestSubmission: null }
  }
}

/**
 * Broadcast a new submission event to all connected clients
 */
function broadcastNewSubmission(submission: unknown) {
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
    } catch {
      connections.delete(connectionId)
    }
  })
}

/**
 * Poll for changes (local storage only - no Firebase errors)
 */
async function pollForChanges() {
  try {
    const { count, latestId, latestSubmission } = await checkLocalSubmissions()

    // Check if this is a new submission
    if (lastSubmissionId && latestId !== lastSubmissionId && latestSubmission) {
      broadcastNewSubmission(latestSubmission)
    }

    lastSubmissionId = latestId

    if (count !== lastSubmissionCount) {
      // Broadcast count change
      const countEvent = {
        type: 'count_update',
        count: count,
        timestamp: new Date().toISOString(),
      }

      const message = `event: count_update\ndata: ${JSON.stringify(countEvent)}\n\n`
      const encoder = new TextEncoder()
      const encoded = encoder.encode(message)

      connections.forEach((controller, connectionId) => {
        try {
          controller.enqueue(encoded)
        } catch {
          connections.delete(connectionId)
        }
      })

      lastSubmissionCount = count
    }
  } catch (error) {
    // Silent error - don't spam console
  }
}

// Polling interval management
let pollingInterval: NodeJS.Timeout | null = null

function startPolling() {
  if (!pollingInterval && connections.size > 0) {
    pollingInterval = setInterval(pollForChanges, 3000) // Poll every 3 seconds
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

  const decoded = await verifyToken(token)
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

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify(heartbeat)}\n\n`))
        } catch {
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
      'X-Accel-Buffering': 'no',
    },
  })
}

/**
 * POST handler for manually triggering a broadcast
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('X-Internal-Token')
  const internalToken = process.env.INTERNAL_API_TOKEN

  if (authHeader !== internalToken) {
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    const decoded = await verifyToken(token)
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
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
  }
}
