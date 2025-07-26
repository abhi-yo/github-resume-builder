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
  } catch (error) {
    return {}
  }
}

export function calculateLanguageStats(repos: any[], languageData: { [key: string]: any }) {
  const stats: { [key: string]: number } = {}

  repos.forEach(repo => {
    const repoLanguages = languageData[repo.full_name] || {}
    Object.entries(repoLanguages).forEach(([lang, bytes]) => {
      stats[lang] = (stats[lang] || 0) + (bytes as number)
    })
  })

  return stats
}
