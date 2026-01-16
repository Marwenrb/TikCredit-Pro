# TikCredit Pro - Advanced Developer Guide

## Table of Contents
1. [Debug Mode](#debug-mode)
2. [Database Debugging](#database-debugging)
3. [API Debugging](#api-debugging)
4. [Performance Profiling](#performance-profiling)
5. [Advanced Firebase](#advanced-firebase)
6. [Advanced Authentication](#advanced-authentication)
7. [Email Service Debugging](#email-service-debugging)
8. [Rate Limiting Customization](#rate-limiting-customization)
9. [Real-time Updates Deep Dive](#real-time-updates-deep-dive)
10. [Production Monitoring](#production-monitoring)
11. [Advanced Deployment](#advanced-deployment)

---

## Debug Mode

### Enable Verbose Logging

Edit `.env.local`:
```env
DEBUG=*
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

Then create a debug utility:

```typescript
// src/lib/debug.ts
export const debug = (namespace: string) => {
  return (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${namespace}] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      )
    }
  }
}

// Usage:
const log = debug('FormComponent')
log('Form submitted', { values })
```

### Browser DevTools Debugging

**Open DevTools:**
```
Windows/Linux: F12 or Ctrl+Shift+I
Mac: Cmd+Option+I
```

**Debugging React Components:**
1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect any React component
4. View props and state

**Debugging JavaScript:**
1. Open DevTools → Sources tab
2. Click line number to set breakpoint
3. Interact with app
4. Inspect variables when paused

---

## Database Debugging

### Check Firebase Connection

```typescript
// src/lib/firebase-admin.ts - Add logging

import { adminDb } from '@/lib/firebase-admin'

// Test connection
async function testConnection() {
  try {
    const snapshot = await adminDb.collection('submissions').limit(1).get()
    console.log('✅ Firebase connection successful')
    console.log(`📊 Database has ${snapshot.size} submissions`)
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
  }
}

// Call in API route for testing:
testConnection()
```

### View Local Submissions File

```bash
# Check if submissions are saved locally
cat .tmp/submissions.json

# Pretty print
cat .tmp/submissions.json | jq .

# Count submissions
cat .tmp/submissions.json | jq 'length'
```

### Query Firestore from Console

```javascript
// In browser console:

// Get all submissions
db.collection('submissions').get().then(snapshot => {
  console.log(`Total: ${snapshot.size}`)
  snapshot.forEach(doc => console.log(doc.data()))
})

// Get specific submission
db.collection('submissions').doc('document-id').get().then(doc => {
  console.log(doc.data())
})

// Get recent submissions
db.collection('submissions')
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => console.log(doc.data()))
  })
```

---

## API Debugging

### Test API Endpoints with cURL

```bash
# Test form submission
curl -X POST http://localhost:3000/api/submissions/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "0512345678",
    "wilaya": "الجزائر",
    "profession": "موظف",
    "monthlyIncomeRange": "50,000 - 80,000 د.ج",
    "financingType": "قرض شخصي",
    "requestedAmount": 10000000,
    "salaryReceiveMethod": "حساب بنكي"
  }' \
  -v

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "YourPassword"}' \
  -v

# Test verify token
curl http://localhost:3000/api/auth/verify \
  -H "Cookie: token=YOUR_TOKEN" \
  -v
```

### Test API Endpoints with Postman

1. Download Postman from postman.com
2. Create new request
3. Set method to POST
4. URL: http://localhost:3000/api/submissions/submit
5. Body (raw JSON):
   ```json
   {
     "fullName": "Test User",
     "phone": "0512345678",
     "wilaya": "الجزائر",
     "profession": "موظف",
     "monthlyIncomeRange": "50,000 - 80,000 د.ج",
     "financingType": "قرض شخصي",
     "requestedAmount": 10000000,
     "salaryReceiveMethod": "حساب بنكي"
   }
   ```
6. Click Send
7. View response

### Log API Calls

```typescript
// src/app/api/submissions/submit/route.ts

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
  
  console.log(`[API] POST /api/submissions/submit from ${clientIp}`)
  
  try {
    const data = await request.json()
    console.log('[API] Received data:', {
      fullName: data.fullName,
      phone: data.phone,
      amount: data.requestedAmount
    })
    
    const response = await handleSubmission(data)
    
    const duration = Date.now() - startTime
    console.log(`[API] ✅ Success in ${duration}ms`)
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[API] ❌ Error after ${duration}ms:`, error)
    throw error
  }
}
```

---

## Performance Profiling

### Measure Component Render Time

```typescript
// src/components/MyComponent.tsx
import { Profiler, ProfilerOnRenderCallback } from 'react'

const onRenderCallback: ProfilerOnRenderCallback = (
  id, phase, actualDuration, baseDuration, startTime, commitTime
) => {
  console.log(`
    Component: ${id}
    Phase: ${phase}
    Actual Duration: ${actualDuration}ms
    Base Duration: ${baseDuration}ms
  `)
}

export default function MyComponent() {
  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      <div>Component Content</div>
    </Profiler>
  )
}
```

### Measure API Response Time

```typescript
async function fetchSubmissions() {
  const startTime = performance.now()
  
  const response = await fetch('/api/submissions/list')
  const data = await response.json()
  
  const endTime = performance.now()
  console.log(`API call took ${endTime - startTime}ms`)
  
  return data
}
```

### Bundle Size Analysis

```bash
# Generate bundle report
npm run analyze

# This opens a visual representation of bundle size
# Shows which modules are largest
# Helps identify optimization opportunities
```

---

## Advanced Firebase

### Custom Firestore Queries

```typescript
// src/lib/firebase-queries.ts

import { adminDb } from '@/lib/firebase-admin'

// Get submissions in date range
export async function getSubmissionsByDateRange(
  startDate: Date,
  endDate: Date
) {
  return adminDb
    .collection('submissions')
    .where('timestamp', '>=', startDate.toISOString())
    .where('timestamp', '<=', endDate.toISOString())
    .orderBy('timestamp', 'desc')
    .get()
}

// Get high-value submissions
export async function getHighValueSubmissions(minAmount: number) {
  return adminDb
    .collection('submissions')
    .where('data.requestedAmount', '>=', minAmount)
    .orderBy('data.requestedAmount', 'desc')
    .get()
}

// Get submissions by province
export async function getSubmissionsByWilaya(wilaya: string) {
  return adminDb
    .collection('submissions')
    .where('data.wilaya', '==', wilaya)
    .get()
}

// Aggregate submissions count
export async function getSubmissionCount() {
  const snapshot = await adminDb
    .collection('submissions')
    .count()
    .get()
  return snapshot.data().count
}
```

### Batch Operations

```typescript
// Batch write multiple submissions
async function batchCreateSubmissions(submissions: any[]) {
  const batch = adminDb.batch()
  
  submissions.forEach(sub => {
    const docRef = adminDb.collection('submissions').doc(sub.id)
    batch.set(docRef, sub)
  })
  
  await batch.commit()
  console.log(`✅ Batch created ${submissions.length} submissions`)
}

// Batch update status
async function batchUpdateStatus(submissionIds: string[], status: string) {
  const batch = adminDb.batch()
  
  submissionIds.forEach(id => {
    const docRef = adminDb.collection('submissions').doc(id)
    batch.update(docRef, { status })
  })
  
  await batch.commit()
  console.log(`✅ Updated ${submissionIds.length} submissions to ${status}`)
}

// Batch delete
async function batchDeleteSubmissions(submissionIds: string[]) {
  const batch = adminDb.batch()
  
  submissionIds.forEach(id => {
    const docRef = adminDb.collection('submissions').doc(id)
    batch.delete(docRef)
  })
  
  await batch.commit()
  console.log(`✅ Deleted ${submissionIds.length} submissions`)
}
```

### Firestore Transactions

```typescript
// Transfer data between documents atomically
async function transferSubmission(fromId: string, toId: string) {
  await adminDb.runTransaction(async (transaction) => {
    const fromDoc = await transaction.get(
      adminDb.collection('submissions').doc(fromId)
    )
    
    if (!fromDoc.exists) throw new Error('Source not found')
    
    // Create in destination
    transaction.set(
      adminDb.collection('submissions').doc(toId),
      fromDoc.data()
    )
    
    // Delete from source
    transaction.delete(
      adminDb.collection('submissions').doc(fromId)
    )
  })
}

// Update with conditional check
async function updateIfUnchanged(id: string, newData: any) {
  try {
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(
        adminDb.collection('submissions').doc(id)
      )
      
      const currentVersion = doc.get('version') || 0
      
      transaction.update(
        adminDb.collection('submissions').doc(id),
        {
          ...newData,
          version: currentVersion + 1
        }
      )
    })
  } catch (error) {
    console.error('Transaction failed:', error)
  }
}
```

---

## Advanced Authentication

### Create Custom JWT Tokens

```typescript
// src/lib/auth.ts

import jwt from 'jsonwebtoken'

interface TokenPayload {
  role: 'admin' | 'user'
  userId: string
  permissions: string[]
  expiresAt: number
}

export function createToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be 32+ characters')
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: '8h',
    algorithm: 'HS256'
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET
    return jwt.verify(token, secret!) as TokenPayload
  } catch (error) {
    return null
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch {
    return null
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token)
  if (!decoded?.expiresAt) return null
  return new Date(decoded.expiresAt * 1000)
}

// Check if token will expire soon (within 1 hour)
export function isTokenExpiringSoon(token: string): boolean {
  const expiration = getTokenExpiration(token)
  if (!expiration) return true
  
  const oneHourFromNow = new Date(Date.now() + 3600000)
  return expiration < oneHourFromNow
}
```

### Multi-Level Access Control

```typescript
// src/lib/permissions.ts

type Permission = 
  | 'view_submissions'
  | 'edit_submissions'
  | 'delete_submissions'
  | 'export_data'
  | 'manage_users'

type Role = 'admin' | 'moderator' | 'viewer'

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_submissions',
    'edit_submissions',
    'delete_submissions',
    'export_data',
    'manage_users'
  ],
  moderator: [
    'view_submissions',
    'edit_submissions',
    'export_data'
  ],
  viewer: [
    'view_submissions',
    'export_data'
  ]
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function requirePermission(permission: Permission) {
  return (role: Role) => {
    if (!hasPermission(role, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }
}
```

---

## Email Service Debugging

### Test Email Sending

```typescript
// src/lib/emailService.ts - Add test function

export async function testEmailSending(): Promise<boolean> {
  console.log('[Email] Testing email service...')
  
  const result = await sendSubmissionNotification(
    'test-id-123',
    new Date().toISOString(),
    {
      fullName: 'Test User',
      phone: '0512345678',
      wilaya: 'الجزائر',
      profession: 'موظف',
      monthlyIncomeRange: '50,000 د.ج',
      financingType: 'قرض',
      requestedAmount: 5000000,
      salaryReceiveMethod: 'بطاقة',
    },
    'http://localhost:3000'
  )
  
  if (result.success) {
    console.log('✅ Email test successful')
    return true
  } else {
    console.error('❌ Email test failed:', result.error)
    return false
  }
}

// Call from API route:
export async function GET(request: NextRequest) {
  const success = await testEmailSending()
  return NextResponse.json({ success })
}
```

### Check Email Logs

```bash
# View Resend emails
# https://resend.com/dashboard/emails

# View SendGrid emails
# https://mail.sendgrid.com/logs

# Local testing (Mailhog)
# Install: brew install mailhog
# Run: mailhog
# View at: http://localhost:1025
```

---

## Rate Limiting Customization

### Custom Rate Limiting Strategy

```typescript
// src/lib/rateLimit.ts - Advanced example

export class AdvancedRateLimiter {
  private store = new Map<string, RateLimitEntry[]>()
  
  constructor(
    private config: {
      windowMs: number        // Time window
      maxRequests: number     // Max requests in window
      skipSuccessfulRequests: boolean
      skipFailedRequests: boolean
    }
  ) {}
  
  check(identifier: string, success: boolean): RateLimitResult {
    const now = Date.now()
    const window = this.config.windowMs
    
    // Get or create entry
    if (!this.store.has(identifier)) {
      this.store.set(identifier, [])
    }
    
    const entries = this.store.get(identifier)!
    
    // Remove old entries
    const filtered = entries.filter(e => now - e.timestamp < window)
    
    // Skip counting if configured
    if (this.config.skipSuccessfulRequests && success) {
      this.store.set(identifier, filtered)
      return { success: true, remaining: this.config.maxRequests }
    }
    
    if (this.config.skipFailedRequests && !success) {
      this.store.set(identifier, filtered)
      return { success: true, remaining: this.config.maxRequests }
    }
    
    // Check if limit exceeded
    const allowed = filtered.length < this.config.maxRequests
    
    if (allowed) {
      filtered.push({ timestamp: now, success })
      this.store.set(identifier, filtered)
    }
    
    return {
      success: allowed,
      remaining: Math.max(0, this.config.maxRequests - filtered.length),
      retryAfter: !allowed ? Math.ceil((filtered[0].timestamp + window - now) / 1000) : 0
    }
  }
}
```

### Per-User Rate Limiting

```typescript
// src/app/api/submissions/submit/route.ts - Add user-specific limits

const userRateLimiters = new Map<string, RateLimiter>()

function getUserRateLimiter(userId: string): RateLimiter {
  if (!userRateLimiters.has(userId)) {
    userRateLimiters.set(userId, new RateLimiter({
      interval: 3600000, // 1 hour
      uniqueTokenPerInterval: 5 // 5 submissions per hour per user
    }))
  }
  return userRateLimiters.get(userId)!
}
```

---

## Real-time Updates Deep Dive

### Server-Sent Events Implementation

```typescript
// src/app/api/realtime/submissions/route.ts - Full example

const activeConnections = new Set<ReadableStreamDefaultController>()
const lastEventId = new Map<string, string>()

export function GET(request: NextRequest) {
  const connectionId = crypto.randomUUID()
  
  // Create stream
  const stream = new ReadableStream({
    start(controller) {
      // Connection established
      activeConnections.add(controller)
      
      // Send initial event
      const event = `event: connected\ndata: ${JSON.stringify({
        connectionId,
        timestamp: new Date().toISOString()
      })}\n\n`
      
      controller.enqueue(new TextEncoder().encode(event))
      
      // Heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({
          timestamp: new Date().toISOString()
        })}\n\n`
        
        try {
          controller.enqueue(new TextEncoder().encode(heartbeat))
        } catch {
          clearInterval(heartbeatInterval)
        }
      }, 30000)
      
      // Cleanup on close
      controller.closed.finally(() => {
        activeConnections.delete(controller)
        clearInterval(heartbeatInterval)
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

// Broadcast function
export function broadcastSubmission(submission: any) {
  const event = `event: new_submission\ndata: ${JSON.stringify({
    id: submission.id,
    timestamp: submission.timestamp,
    name: submission.data.fullName,
    amount: submission.data.requestedAmount
  })}\n\n`
  
  const encoded = new TextEncoder().encode(event)
  
  activeConnections.forEach(controller => {
    try {
      controller.enqueue(encoded)
    } catch {
      activeConnections.delete(controller)
    }
  })
}
```

### Client-side Real-time Handling

```typescript
// src/hooks/useRealtimeSubmissions.ts - Advanced example

import { useEffect, useState, useCallback } from 'react'

interface RealtimeEvent {
  type: 'connected' | 'new_submission' | 'error'
  data: any
}

export function useRealtimeSubmissions() {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    
    function connect() {
      try {
        eventSource = new EventSource('/api/realtime/submissions')
        
        eventSource.addEventListener('connected', (e) => {
          setIsConnected(true)
          setError(null)
          console.log('✅ Connected to real-time updates')
        })
        
        eventSource.addEventListener('new_submission', (e) => {
          const data = JSON.parse(e.data)
          setEvents(prev => [...prev, { type: 'new_submission', data }])
        })
        
        eventSource.addEventListener('error', () => {
          setIsConnected(false)
          setError('Connection lost. Reconnecting...')
          eventSource?.close()
          
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000)
        })
        
      } catch (err) {
        setError(String(err))
      }
    }
    
    connect()
    
    return () => {
      if (eventSource) eventSource.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [])
  
  return { isConnected, events, error }
}
```

---

## Production Monitoring

### Error Tracking

```typescript
// src/lib/errorTracking.ts

interface ErrorReport {
  message: string
  stack?: string
  context: Record<string, any>
  timestamp: string
  url: string
  userAgent: string
}

export async function reportError(error: Error, context: Record<string, any>) {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  }
  
  // Send to error tracking service
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      await fetch(process.env.NEXT_PUBLIC_SENTRY_DSN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      })
    } catch (err) {
      console.error('Failed to report error:', err)
    }
  }
}
```

### Performance Monitoring

```typescript
// src/lib/monitoring.ts

export class PerformanceMonitor {
  private metrics: Record<string, number[]> = {}
  
  recordMetric(name: string, value: number) {
    if (!this.metrics[name]) {
      this.metrics[name] = []
    }
    this.metrics[name].push(value)
  }
  
  getAverage(name: string): number {
    const values = this.metrics[name] || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b) / values.length
  }
  
  getMax(name: string): number {
    return Math.max(...(this.metrics[name] || [0]))
  }
  
  getMin(name: string): number {
    return Math.min(...(this.metrics[name] || [0]))
  }
  
  report() {
    const report: Record<string, any> = {}
    
    Object.keys(this.metrics).forEach(name => {
      report[name] = {
        avg: this.getAverage(name),
        max: this.getMax(name),
        min: this.getMin(name),
        count: this.metrics[name].length
      }
    })
    
    console.table(report)
    return report
  }
}

// Usage
const monitor = new PerformanceMonitor()

async function fetchSubmissions() {
  const start = performance.now()
  const data = await fetch('/api/submissions/list').then(r => r.json())
  const duration = performance.now() - start
  
  monitor.recordMetric('submissions_api', duration)
  monitor.report()
  
  return data
}
```

---

## Advanced Deployment

### Environment-specific Configuration

```typescript
// src/config/environment.ts

type Environment = 'development' | 'staging' | 'production'

const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    logLevel: 'debug',
    rateLimitPerMinute: 100,
    emailProvider: 'console'
  },
  staging: {
    apiUrl: 'https://staging.tikcredit.com',
    logLevel: 'info',
    rateLimitPerMinute: 50,
    emailProvider: 'resend'
  },
  production: {
    apiUrl: 'https://tikcredit.com',
    logLevel: 'warn',
    rateLimitPerMinute: 30,
    emailProvider: 'resend'
  }
}

export function getConfig(env: Environment = process.env.NODE_ENV as Environment) {
  return config[env]
}
```

### Blue-Green Deployment

```bash
#!/bin/bash
# scripts/deploy-bluegreen.sh

BLUE_VERSION="v1.0.0"
GREEN_VERSION="v1.0.1"
CURRENT="blue"

# Deploy green
npm run build
vercel --prod --scope tikcredit

# Test green
curl https://green.tikcredit.com/health

# If successful, switch
if [ $? -eq 0 ]; then
  echo "✅ Green deployment successful, switching..."
  # Update DNS/load balancer to point to green
  CURRENT="green"
else
  echo "❌ Green deployment failed, keeping blue active"
fi

echo "✅ Deployment complete. Current version: $CURRENT"
```

### Database Backup Strategy

```typescript
// src/scripts/backup-database.ts

import { adminDb } from '@/lib/firebase-admin'
import * as fs from 'fs/promises'
import path from 'path'

export async function backupDatabase() {
  const timestamp = new Date().toISOString()
  const backupDir = path.join(process.cwd(), 'backups', timestamp)
  
  await fs.mkdir(backupDir, { recursive: true })
  
  // Backup submissions
  const submissions = await adminDb.collection('submissions').get()
  const data = submissions.docs.map(doc => doc.data())
  
  await fs.writeFile(
    path.join(backupDir, 'submissions.json'),
    JSON.stringify(data, null, 2)
  )
  
  console.log(`✅ Backup created at ${backupDir}`)
  
  // Delete backups older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const backups = await fs.readdir(path.join(process.cwd(), 'backups'))
  
  for (const backup of backups) {
    const backupDate = new Date(backup)
    if (backupDate < thirtyDaysAgo) {
      await fs.rm(path.join(process.cwd(), 'backups', backup), {
        recursive: true
      })
      console.log(`🗑️ Deleted old backup: ${backup}`)
    }
  }
}

// Schedule daily backup (use cron job or Vercel cron)
// 0 2 * * * node -r ts-node/register scripts/backup-database.ts
```

---

**Advanced Guide Version:** 1.0  
**Last Updated:** January 15, 2026
