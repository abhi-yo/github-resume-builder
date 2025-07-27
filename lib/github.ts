import { Octokit } from "@octokit/rest"

export function createGitHubClient(token: string) {
  return new Octokit({
    auth: token,
  })
}

export async function fetchUserProfile(octokit: Octokit) {
  const { data } = await octokit.rest.users.getAuthenticated()
  return data
}

export async function fetchUserRepos(octokit: Octokit, username: string) {
  const { data } = await octokit.rest.repos.listForUser({
    username,
    sort: 'updated',
    per_page: 100,
  })
  return data
}

export async function fetchRepoLanguages(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    })
    return data
  } catch {
    return {}
  }
}

export function calculateLanguageStats(repos: unknown[], languageData: { [key: string]: unknown }) {
  const stats: { [key: string]: number } = {}

  repos.forEach(repo => {
    if (repo && typeof repo === 'object' && 'full_name' in repo) {
      const repoLanguages = languageData[(repo as { full_name: string }).full_name] || {}
      if (typeof repoLanguages === 'object' && repoLanguages !== null) {
        Object.entries(repoLanguages).forEach(([lang, bytes]) => {
          if (typeof bytes === 'number') {
            stats[lang] = (stats[lang] || 0) + bytes
          }
        })
      }
    }
  })

  return stats
}
