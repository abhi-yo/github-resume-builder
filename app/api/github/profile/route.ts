import { authOptions } from '@/lib/auth'
import { createGitHubClient, fetchUserProfile } from '@/lib/github'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const octokit = createGitHubClient(session.accessToken)
    const profile = await fetchUserProfile(octokit)

    return NextResponse.json({ success: true, data: profile })
  } catch (error: any) {
    console.error('Error fetching profile:', error)

    if (error.status === 401) {
      return NextResponse.json({ error: 'Invalid GitHub token', success: false }, { status: 401 })
    }
    if (error.status === 403) {
      return NextResponse.json({ error: 'API rate limit exceeded', success: false }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Failed to fetch profile',
      success: false,
      details: error.message
    }, { status: 500 })
  }
}
