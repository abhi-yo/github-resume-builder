import { GitHubRepo } from '@/types/github'

interface RepoCardProps {
  repo: GitHubRepo
}

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
            {repo.name}
          </a>
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            ⭐ {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            🍴 {repo.forks_count}
          </span>
        </div>
      </div>

      {repo.description && (
        <p className="text-gray-600 mb-3 text-sm">
          {repo.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        {repo.language && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {repo.language}
          </span>
        )}

        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
