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
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLatex = async () => {
    if (!profile) return;
    
    setIsGeneratingLatex(true);
    try {
      const latex = generateLatexResume(profile, repos, languages);
      
      // Download the LaTeX file
      const blob = new Blob([latex], { type: 'application/x-latex' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.login}_resume.tex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating LaTeX:', error);
      alert('Failed to generate LaTeX resume');
    } finally {
      setIsGeneratingLatex(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)]"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Error Loading Resume
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.5),0_25px_65px_rgba(0,0,0,0.15)] transition-all duration-300 text-slate-700 font-medium"
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
    .slice(0, 8);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header with Logout */}
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.5),0_25px_65px_rgba(0,0,0,0.15)] transition-all duration-300 text-slate-700 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-8">
          <div className="flex gap-8 items-start">
            <Image
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              width={128}
              height={128}
              className="w-32 h-32 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] object-cover"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 text-slate-800">
                {profile.name || profile.login}
              </h1>
              <h2 className="text-xl text-slate-600 mb-4 font-medium">
                Full Stack Developer & Open Source Contributor
              </h2>

              {profile.bio && (
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Github className="w-4 h-4" />
                  <span>@{profile.login}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.blog && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-4 h-4" />
                    <a
                      href={profile.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-800 transition-colors"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>GitHub since {memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LaTeX Generation */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Generate Professional Resume
            </h3>
            <p className="text-slate-600 mb-6">
              Download your professional LaTeX resume file
            </p>
            <button
              onClick={handleGenerateLatex}
              disabled={isGeneratingLatex}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.5),0_25px_65px_rgba(0,0,0,0.15)] transition-all duration-300 text-slate-700 font-semibold text-lg disabled:opacity-50"
            >
              <FileText className="w-6 h-6" />
              {isGeneratingLatex ? 'Generating...' : 'Download LaTeX Resume'}
            </button>
          </div>
        </div>

        {/* GitHub Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-6 text-center">
            <div className="text-2xl font-bold text-slate-800">{profile.public_repos}</div>
            <div className="text-slate-600">Repositories</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-6 text-center">
            <div className="text-2xl font-bold text-slate-800">{totalStars}</div>
            <div className="text-slate-600">Total Stars</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-6 text-center">
            <div className="text-2xl font-bold text-slate-800">{profile.followers}</div>
            <div className="text-slate-600">Followers</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-6 text-center">
            <div className="text-2xl font-bold text-slate-800">{totalForks}</div>
            <div className="text-slate-600">Total Forks</div>
          </div>
        </div>

        {/* Programming Languages */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Programming Languages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topLanguages.map(([language, bytes]) => {
              const percentage = ((bytes / totalBytes) * 100).toFixed(1);
              return (
                <div key={language} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)]">
                  <span className="font-medium text-slate-700">{language}</span>
                  <span className="text-slate-600">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Repositories */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Featured Repositories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {repos.slice(0, 6).map((repo) => (
              <div
                key={repo.id}
                className="p-6 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)]"
              >
                <h4 className="font-semibold text-slate-800 mb-2">{repo.name}</h4>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {repo.description || "No description available"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {repo.language && (
                      <span>{repo.language}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
