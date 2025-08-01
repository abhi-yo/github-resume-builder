import { authOptions } from '@/lib/auth'
import { createGitHubClient, fetchUserRepos } from '@/lib/github'
import { validateRequest, addSecurityHeaders, sanitizeUsername, schemas } from '@/lib/validation'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Validate request with rate limiting and parameter validation
  const validationError = await validateRequest(request, {
    requireAuth: true,
    rateLimit: { windowMs: 60000, maxRequests: 20 }, // 20 requests per minute
    validateParams: {
      username: schemas.username
    }
  })
  
  if (validationError) {
    return validationError
  }

  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const username = sanitizeUsername(searchParams.get('username')!)

    const octokit = createGitHubClient(session!.accessToken!)
    const repos = await fetchUserRepos(octokit, username)

    // Sort by stars (but return all repos for project selection)
    const sortedRepos = repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))

    const response = NextResponse.json({ success: true, data: sortedRepos })
    return addSecurityHeaders(response)
  } catch (error: unknown) {
    console.error('Error fetching repos:', error)

    // Handle specific GitHub API errors
    if (error && typeof error === 'object' && 'status' in error) {
      if ((error as { status: number }).status === 404) {
        return NextResponse.json({ error: 'User not found', success: false }, { status: 404 })
      }
      if ((error as { status: number }).status === 403) {
        return NextResponse.json({ error: 'API rate limit exceeded or insufficient permissions', success: false }, { status: 403 })
      }
      if ((error as { status: number }).status === 401) {
        return NextResponse.json({ error: 'Invalid GitHub token', success: false }, { status: 401 })
      }
    }

    return NextResponse.json({
      error: 'Failed to fetch repositories',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
