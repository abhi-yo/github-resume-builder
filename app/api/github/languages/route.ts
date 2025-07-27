import { authOptions } from '@/lib/auth'
import { calculateLanguageStats, createGitHubClient, fetchRepoLanguages, fetchUserRepos } from '@/lib/github'
import { validateRequest, addSecurityHeaders, sanitizeUsername, schemas } from '@/lib/validation'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Validate request with rate limiting and parameter validation
  const validationError = await validateRequest(request, {
    requireAuth: true,
    rateLimit: { windowMs: 60000, maxRequests: 10 }, // 10 requests per minute (expensive operation)
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

    // Fetch language data for each repo (with error handling)
    const languagePromises = repos.map(async (repo) => {
      try {
        const languages = await fetchRepoLanguages(octokit, repo.owner.login, repo.name)
        return { [repo.full_name]: languages }
      } catch {
        return { [repo.full_name]: {} }
      }
    })

    const languageResults = await Promise.all(languagePromises)
    const languageData = Object.assign({}, ...languageResults)

    const languageStats = calculateLanguageStats(repos, languageData)

    const response = NextResponse.json({ success: true, data: languageStats })
    return addSecurityHeaders(response)
  } catch (error: unknown) {
    console.error('Error fetching languages:', error)

    if (error && typeof error === 'object' && 'status' in error) {
      if ((error as { status: number }).status === 404) {
        return NextResponse.json({ error: 'User not found', success: false }, { status: 404 })
      }
      if ((error as { status: number }).status === 403) {
        return NextResponse.json({ error: 'API rate limit exceeded', success: false }, { status: 403 })
      }
    }

    return NextResponse.json({
      error: 'Failed to fetch language data',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
