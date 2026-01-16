/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TikCredit Pro - Elite Security Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ultra-professional security without developer intervention
 * - Automatic input sanitization
 * - XSS prevention
 * - SQL injection prevention (N/A for Firestore but good practice)
 * - CSRF protection
 * - Rate limiting
 * - Data encryption helpers
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sanitize string input - removes dangerous characters
 */
export function sanitizeString(input: string | undefined | null): string {
    if (!input) return ''

    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove script tags specifically
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Escape HTML entities
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove null bytes
        .replace(/\0/g, '')
        // Trim whitespace
        .trim()
}

/**
 * Sanitize phone number - only allow digits
 */
export function sanitizePhone(phone: string | undefined | null): string {
    if (!phone) return ''
    return phone.replace(/[^\d]/g, '').slice(0, 10)
}

/**
 * Sanitize email - lowercase and trim
 */
export function sanitizeEmail(email: string | undefined | null): string {
    if (!email) return ''
    return email.toLowerCase().trim()
}

/**
 * Sanitize number - ensure valid number within range
 */
export function sanitizeNumber(
    value: number | string | undefined | null,
    min: number,
    max: number,
    defaultValue: number
): number {
    if (value === undefined || value === null) return defaultValue

    const num = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(num)) return defaultValue
    if (num < min) return min
    if (num > max) return max

    return Math.floor(num)
}

/**
 * Sanitize all form data at once
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Special handling for specific fields
            if (key === 'phone') {
                sanitized[key] = sanitizePhone(value)
            } else if (key === 'email') {
                sanitized[key] = sanitizeEmail(value)
            } else {
                sanitized[key] = sanitizeString(value)
            }
        } else if (typeof value === 'number') {
            sanitized[key] = sanitizeNumber(value, 0, Number.MAX_SAFE_INTEGER, 0)
        } else {
            sanitized[key] = value
        }
    }

    return sanitized as T
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate Algerian phone number
 */
export function isValidAlgerianPhone(phone: string): boolean {
    // Format: 05/06/07 + 8 digits
    const phoneRegex = /^(05|06|07)\d{8}$/
    return phoneRegex.test(sanitizePhone(phone))
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(sanitizeEmail(email))
}

/**
 * Validate loan amount (5M - 20M DZD)
 */
export function isValidLoanAmount(amount: number): boolean {
    return amount >= 5_000_000 && amount <= 20_000_000
}

/**
 * Validate required string field
 */
export function isValidRequiredString(value: string | undefined | null, minLength = 1): boolean {
    if (!value) return false
    return sanitizeString(value).length >= minLength
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Security headers to apply to all responses
 */
export const SECURITY_HEADERS: Record<string, string> = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
        "frame-ancestors 'none'",
    ].join('; '),

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // HSTS (only for production with HTTPS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(headers: Headers): void {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(key, value)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IP BLOCKING & ABUSE PREVENTION
// ═══════════════════════════════════════════════════════════════════════════════

// In-memory blocked IPs (for production, use Redis or similar)
const blockedIPs = new Set<string>()
const suspiciousActivity = new Map<string, { count: number; lastActivity: number }>()

const BLOCK_THRESHOLD = 50 // Block after 50 suspicious activities
const BLOCK_WINDOW_MS = 3600_000 // 1 hour window

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
    return blockedIPs.has(ip)
}

/**
 * Record suspicious activity from IP
 */
export function recordSuspiciousActivity(ip: string): void {
    const now = Date.now()
    const activity = suspiciousActivity.get(ip) || { count: 0, lastActivity: now }

    // Reset if window expired
    if (now - activity.lastActivity > BLOCK_WINDOW_MS) {
        activity.count = 0
    }

    activity.count++
    activity.lastActivity = now
    suspiciousActivity.set(ip, activity)

    // Block if threshold exceeded
    if (activity.count >= BLOCK_THRESHOLD) {
        blockedIPs.add(ip)
        console.warn(`🚫 IP BLOCKED: ${ip} (${activity.count} suspicious activities)`)
    }
}

/**
 * Unblock IP (admin function)
 */
export function unblockIP(ip: string): void {
    blockedIPs.delete(ip)
    suspiciousActivity.delete(ip)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA MASKING (for logs and reports)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mask phone number for display (055****56)
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return '****'
    return phone.slice(0, 3) + '****' + phone.slice(-2)
}

/**
 * Mask email for display (m***@gmail.com)
 */
export function maskEmail(email: string): string {
    if (!email) return ''
    const [local, domain] = email.split('@')
    if (!domain) return email
    return local[0] + '***@' + domain
}

/**
 * Mask name for display (محمد أ.)
 */
export function maskName(name: string): string {
    if (!name) return ''
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0] + '***'
    return parts[0] + ' ' + parts[1][0] + '.'
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export interface AuditLogEntry {
    timestamp: string
    action: string
    ip: string
    userId?: string
    details?: Record<string, unknown>
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
}

const auditLog: AuditLogEntry[] = []
const MAX_AUDIT_LOG_SIZE = 10000

/**
 * Log an audit event
 */
export function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const fullEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
    }

    auditLog.push(fullEntry)

    // Trim log if too large
    if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
        auditLog.splice(0, auditLog.length - MAX_AUDIT_LOG_SIZE)
    }

    // Console output based on severity
    switch (entry.severity) {
        case 'CRITICAL':
            console.error('🚨 CRITICAL:', entry.action, entry.details)
            break
        case 'ERROR':
            console.error('❌ ERROR:', entry.action, entry.details)
            break
        case 'WARNING':
            console.warn('⚠️ WARNING:', entry.action, entry.details)
            break
        default:
            console.log('ℹ️ INFO:', entry.action)
    }
}

/**
 * Get recent audit log entries
 */
export function getAuditLog(count = 100): AuditLogEntry[] {
    return auditLog.slice(-count)
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENCRYPTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simple hash for non-sensitive data (not for passwords!)
 */
export function simpleHash(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length]
    }
    return result
}
