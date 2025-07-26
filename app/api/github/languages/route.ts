import { authOptions } from '@/lib/auth'
import { calculateLanguageStats, createGitHubClient, fetchRepoLanguages, fetchUserRepos } from '@/lib/github'
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

    // Fetch language data for each repo
    const languagePromises = repos.map(repo =>
      fetchRepoLanguages(octokit, repo.owner.login, repo.name)
        .then(data => ({ [repo.full_name]: data }))
        .catch(error => {
          console.warn(`Failed to fetch languages for ${repo.full_name}:`, error)
          return { [repo.full_name]: {} }
        })
    )

    const languageResults = await Promise.all(languagePromises)
    const languageData = Object.assign({}, ...languageResults)

    const languageStats = calculateLanguageStats(repos, languageData)

    return NextResponse.json({ success: true, data: languageStats })
  } catch (error: any) {
    console.error('Error fetching languages:', error)

    if (error.status === 404) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 })
    }
    if (error.status === 403) {
      return NextResponse.json({ error: 'API rate limit exceeded', success: false }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Failed to fetch language data',
      success: false,
      details: error.message
    }, { status: 500 })
  }
}
