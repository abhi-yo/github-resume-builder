import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Rate limiting store (in production, use Redis or external store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Request validation schemas
export const schemas = {
  username: {
    required: true,
    pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]){0,38}$/,
    maxLength: 39,
    minLength: 1
  },
  latexContent: {
    required: true,
    maxLength: 100000, // 100KB limit
    minLength: 100
  }
}

interface ValidationOptions {
  requireAuth?: boolean
  rateLimit?: { windowMs: number; maxRequests: number }
  validateBody?: Record<string, ValidationRule>
  validateParams?: Record<string, ValidationRule>
}

interface ValidationRule {
  required?: boolean
  type?: string
  pattern?: RegExp
  maxLength?: number
  minLength?: number
  min?: number
  max?: number
  minItems?: number
  maxItems?: number
}

// Validation middleware
export async function validateRequest(
  request: NextRequest,
  options: ValidationOptions = {}
) {
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  try {
    // 1. Authentication validation
    if (options.requireAuth !== false) {
      const session = await getServerSession(authOptions)
      if (!session?.accessToken) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    // 2. Rate limiting
    if (options.rateLimit) {
      const rateLimitResult = checkRateLimit(clientIp, options.rateLimit)
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': rateLimitResult.retryAfter.toString(),
              'X-RateLimit-Limit': options.rateLimit.maxRequests.toString(),
              'X-RateLimit-Remaining': '0'
            }
          }
        )
      }
    }

    // 3. Request body validation
    if (options.validateBody) {
      const body = await request.json().catch(() => ({}))
      const bodyValidation = validateObject(body, options.validateBody)
      if (!bodyValidation.valid) {
        return NextResponse.json(
          { success: false, error: 'Invalid request body', details: bodyValidation.errors },
          { status: 400 }
        )
      }
    }

    // 4. URL parameters validation
    if (options.validateParams) {
      const { searchParams } = new URL(request.url)
      const params: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        params[key] = value
      })
      
      const paramsValidation = validateObject(params, options.validateParams)
      if (!paramsValidation.valid) {
        return NextResponse.json(
          { success: false, error: 'Invalid request parameters', details: paramsValidation.errors },
          { status: 400 }
        )
      }
    }

    return null // Validation passed
  } catch (error) {
    console.error('Validation middleware error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Rate limiting helper
function checkRateLimit(
  identifier: string,
  options: { windowMs: number; maxRequests: number }
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  
  const current = rateLimitStore.get(identifier)
  
  if (!current || current.resetTime < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs
    })
    return { allowed: true, retryAfter: 0 }
  }
  
  if (current.count >= options.maxRequests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  // Increment count
  current.count++
  return { allowed: true, retryAfter: 0 }
}

// Object validation helper
function validateObject(
  obj: Record<string, unknown>,
  schema: Record<string, ValidationRule>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key]
    
    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${key}' is required`)
      continue
    }
    
    // Skip validation if field is not required and empty
    if (!rules.required && (!value || value === '')) {
      continue
    }
    
    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`Field '${key}' must be of type ${rules.type}`)
      continue
    }
    
    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Field '${key}' must be at least ${rules.minLength} characters`)
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Field '${key}' must be at most ${rules.maxLength} characters`)
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`Field '${key}' format is invalid`)
      }
    }
    
    // Number validations
    if (typeof value === 'number') {
      if (rules.min && value < rules.min) {
        errors.push(`Field '${key}' must be at least ${rules.min}`)
      }
      
      if (rules.max && value > rules.max) {
        errors.push(`Field '${key}' must be at most ${rules.max}`)
      }
    }
    
    // Array validations
    if (Array.isArray(value)) {
      if (rules.minItems && value.length < rules.minItems) {
        errors.push(`Field '${key}' must have at least ${rules.minItems} items`)
      }
      
      if (rules.maxItems && value.length > rules.maxItems) {
        errors.push(`Field '${key}' must have at most ${rules.maxItems} items`)
      }
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Input sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000) // Limit length
}

export function sanitizeUsername(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '') // Only allow alphanumeric and hyphens
    .substring(0, 39) // GitHub username max length
}

// Security headers helper
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://avatars.githubusercontent.com; " +
    "connect-src 'self' https://api.github.com;"
  )
  
  return response
}
