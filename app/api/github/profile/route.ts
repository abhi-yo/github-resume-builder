import { authOptions } from '@/lib/auth'
import { createGitHubClient, fetchUserProfile } from '@/lib/github'
import { validateRequest, addSecurityHeaders } from '@/lib/validation'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Validate request with rate limiting
  const validationError = await validateRequest(request, {
    requireAuth: true,
    rateLimit: { windowMs: 60000, maxRequests: 30 } // 30 requests per minute
  })
  
  if (validationError) {
    return validationError
  }

  try {
    const session = await getServerSession(authOptions)
    const octokit = createGitHubClient(session!.accessToken!)

    const profile = await fetchUserProfile(octokit)

    const response = NextResponse.json({ success: true, data: profile })
    return addSecurityHeaders(response)
  } catch (error: unknown) {
    console.error('Error fetching profile:', error)

    if (error && typeof error === 'object' && 'status' in error) {
      if ((error as { status: number }).status === 401) {
        return NextResponse.json({ error: 'Invalid GitHub token', success: false }, { status: 401 })
      }
      if ((error as { status: number }).status === 403) {
        return NextResponse.json({ error: 'API rate limit exceeded', success: false }, { status: 403 })
      }
    }

    return NextResponse.json({
      error: 'Failed to fetch profile',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
