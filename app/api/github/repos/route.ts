import { authOptions } from '@/lib/auth'
import { createGitHubClient, fetchUserRepos } from '@/lib/github'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const octokit = createGitHubClient(session.accessToken)
    const repos = await fetchUserRepos(octokit, username)

    // Sort by stars and get top repos
    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)

    return NextResponse.json({ success: true, data: topRepos })
  } catch (error: any) {
    console.error('Error fetching repos:', error)

    // Handle specific GitHub API errors
    if (error.status === 404) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 })
    }
    if (error.status === 403) {
      return NextResponse.json({ error: 'API rate limit exceeded or insufficient permissions', success: false }, { status: 403 })
    }
    if (error.status === 401) {
      return NextResponse.json({ error: 'Invalid GitHub token', success: false }, { status: 401 })
    }

    return NextResponse.json({
      error: 'Failed to fetch repositories',
      success: false,
      details: error.message
    }, { status: 500 })
  }
}
