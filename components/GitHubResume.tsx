"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { GitHubUser, GitHubRepo, LanguageStats } from "@/types/github";
import {
  MapPin,
  Globe,
  Github,
  Calendar,
  Star,
  GitFork,
  FileText,
  LogOut,
  Settings,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import { generateLatexResume } from "@/lib/latex-generator";

export default function GitHubResume() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [languages, setLanguages] = useState<LanguageStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingLatex, setIsGeneratingLatex] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<GitHubRepo[]>([]);
  const [customSelection, setCustomSelection] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const profileRes = await fetch("/api/github/profile");
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileResult = await profileRes.json();
      if (!profileResult.success) throw new Error(profileResult.error);

      const profileData = profileResult.data;
      setProfile(profileData);

      // Fetch repos
      const reposRes = await fetch(
        `/api/github/repos?username=${profileData.login}`
      );
      if (!reposRes.ok) throw new Error("Failed to fetch repositories");
      const reposResult = await reposRes.json();
      if (!reposResult.success) throw new Error(reposResult.error);

      setRepos(reposResult.data);

      // Fetch languages
      const languagesRes = await fetch(
        `/api/github/languages?username=${profileData.login}`
      );
      if (languagesRes.ok) {
        const languagesResult = await languagesRes.json();
        if (languagesResult.success) {
          setLanguages(languagesResult.data);
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLatex = async () => {
    if (!profile) return;

    setIsGeneratingLatex(true);
    try {
      // Use selected projects if custom selection is enabled, otherwise use all repos
      const projectsToUse = customSelection ? selectedProjects : repos;
      const latex = generateLatexResume(profile, projectsToUse, languages);

      // Download the LaTeX file
      const blob = new Blob([latex], { type: "application/x-latex" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profile.login}_resume.tex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating LaTeX:", error);
      alert("Failed to generate LaTeX resume");
    } finally {
      setIsGeneratingLatex(false);
    }
  };

  const handleProjectToggle = (repo: GitHubRepo) => {
    setSelectedProjects(prev => {
      const isSelected = prev.some(p => p.id === repo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== repo.id);
      } else {
        return [...prev, repo];
      }
    });
  };

  const handleSelectAllProjects = () => {
    setSelectedProjects([...repos]);
  };

  const handleClearSelection = () => {
    setSelectedProjects([]);
  };

  const handleUseCustomSelection = () => {
    setCustomSelection(true);
    setShowProjectSelector(false);
  };

  const handleUseAutoSelection = () => {
    setCustomSelection(false);
    setSelectedProjects([]);
    setShowProjectSelector(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-zinc-900 rounded-xl"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-900 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-2">
              Error Loading Resume
            </h2>
            <p className="text-zinc-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white hover:bg-zinc-100 rounded-lg text-black text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const totalBytes = Object.values(languages).reduce(
    (sum, bytes) => sum + bytes,
    0
  );
  const memberSince = new Date(profile.created_at).getFullYear();
  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Logout */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-doto text-white">Resume</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex gap-6 items-start">
            <Image
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-doto text-white mb-1">
                {profile.name || profile.login}
              </h2>
              <p className="text-zinc-400 text-sm mb-3">
                Developer & Open Source Contributor
              </p>

              {profile.bio && (
                <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Github className="w-3 h-3" />
                  <span>@{profile.login}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.blog && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Globe className="w-3 h-3" />
                    <a
                      href={profile.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  <span>GitHub since {memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LaTeX Generation */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-4">
              Download your professional LaTeX resume file
            </p>
            {customSelection && (
              <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-300 text-sm">
                  Using {selectedProjects.length} custom selected projects
                </p>
                <button
                  onClick={() => setShowProjectSelector(true)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs underline mt-1"
                >
                  Edit selection
                </button>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowProjectSelector(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-all duration-200 border border-zinc-600/50"
              >
                <Settings className="w-4 h-4" />
                Customize Projects
              </button>
              <button
                onClick={handleGenerateLatex}
                disabled={isGeneratingLatex}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-zinc-200 text-sm rounded-lg transition-all duration-200 disabled:opacity-50 hover:bg-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-zinc-700/50"
                style={{
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                    0 1px 3px 0 rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                <FileText className="w-4 h-4" />
                {isGeneratingLatex ? "Generating..." : "Download LaTeX Resume"}
              </button>
            </div>
          </div>
        </div>

        {/* GitHub Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-lg font-doto text-white">
              {profile.public_repos}
            </div>
            <div className="text-zinc-400 text-xs">Repos</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-lg font-doto text-white">{totalStars}</div>
            <div className="text-zinc-400 text-xs">Stars</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-lg font-doto text-white">
              {profile.followers}
            </div>
            <div className="text-zinc-400 text-xs">Followers</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <div className="text-lg font-doto text-white">{totalForks}</div>
            <div className="text-zinc-400 text-xs">Forks</div>
          </div>
        </div>

        {/* Programming Languages */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h3 className="text-sm font-medium text-white mb-4">Languages</h3>
          <div className="grid grid-cols-2 gap-3">
            {topLanguages.map(([language, bytes]) => {
              const percentage = ((bytes / totalBytes) * 100).toFixed(1);
              return (
                <div
                  key={language}
                  className="group flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700/50 transition-all duration-300 hover:bg-zinc-750 hover:border-zinc-600/50 hover:shadow-lg cursor-pointer"
                  style={{
                    boxShadow: `
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
                      0 1px 3px 0 rgba(0, 0, 0, 0.3)
                    `,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                      0 4px 12px 0 rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.05)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.boxShadow = `
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
                      0 1px 3px 0 rgba(0, 0, 0, 0.3)
                    `;
                  }}
                >
                  <span className="font-medium text-zinc-300 text-xs group-hover:text-zinc-200 transition-colors duration-300">
                    {language}
                  </span>
                  <span className="text-zinc-400 text-xs group-hover:text-zinc-300 transition-colors duration-300">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Repositories */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h3 className="text-sm font-medium text-white mb-4">Projects</h3>
          <div className="grid grid-cols-2 gap-3">
            {repos.slice(0, 6).map((repo) => (
              <div
                key={repo.id}
                className="group p-4 bg-zinc-800 rounded-lg border border-zinc-700/50 transition-all duration-300 hover:bg-zinc-750 hover:border-zinc-600/50 cursor-pointer"
                style={{
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
                    0 1px 3px 0 rgba(0, 0, 0, 0.3)
                  `,
                }}
                onClick={() => window.open(repo.html_url, "_blank")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                    0 8px 25px 0 rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px) scale(1)";
                  e.currentTarget.style.boxShadow = `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
                    0 1px 3px 0 rgba(0, 0, 0, 0.3)
                  `;
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-white text-xs group-hover:text-zinc-100 transition-colors duration-300">
                    {repo.name}
                  </h4>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-3 h-3 text-zinc-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs mb-3 line-clamp-2 group-hover:text-zinc-300 transition-colors duration-300">
                  {repo.description || "No description available"}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-600 group-hover:bg-zinc-500 transition-colors duration-300"></div>
                      {repo.language}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 group-hover:text-zinc-300 transition-all duration-300 group-hover:scale-110" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-3 h-3 group-hover:text-zinc-300 transition-all duration-300 group-hover:scale-110" />
                    <span>{repo.forks_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Selector Modal */}
        {showProjectSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-doto text-white">Select Projects for Resume</h3>
                  <button
                    onClick={() => setShowProjectSelector(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
                <p className="text-zinc-400 text-sm mt-2">
                  Choose which projects to feature in your LaTeX resume, or use auto-selection.
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleSelectAllProjects}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  <div className="ml-auto text-zinc-400 text-sm">
                    {selectedProjects.length} selected
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.map((repo) => {
                    const isSelected = selectedProjects.some(p => p.id === repo.id);
                    return (
                      <div
                        key={repo.id}
                        onClick={() => handleProjectToggle(repo)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500'
                            : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">{repo.name}</h4>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-zinc-600 border-zinc-500'
                              : 'border-zinc-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-zinc-400 text-xs mb-3 line-clamp-2">
                          {repo.description || "No description available"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                              {repo.language}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            <span>{repo.forks_count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-zinc-700">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleUseAutoSelection}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
                  >
                    Use Auto-Selection
                  </button>
                  <button
                    onClick={handleUseCustomSelection}
                    disabled={selectedProjects.length === 0}
                    className="px-4 py-2 bg-white hover:bg-zinc-100 text-black text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Use Selected Projects ({selectedProjects.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
