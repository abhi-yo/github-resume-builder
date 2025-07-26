export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  location: string
  company: string
  blog: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  created_at: string
  updated_at: string
}

export interface LanguageStats {
  [language: string]: number
}

export interface ContributionDay {
  date: string
  count: number
  level: number
}
