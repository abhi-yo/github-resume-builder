"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { GitHubUser, GitHubRepo, LanguageStats } from "@/types/github";
import {
  MapPin,
  Globe,
  Github,
  Calendar,
  Star,
  GitFork,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { generateLatexResume } from "@/lib/latex-generator";
import Image from "next/image";

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

  const handleDownloadPDF = async () => {
    if (!profile) return;
    
    setIsGeneratingLatex(true);
    try {
      // Prepare data for the PDF page
      const resumeData = {
        profile,
        repos,
        languages
      };
      
      // Encode data for URL
      const encodedData = encodeURIComponent(JSON.stringify(resumeData));
      
      // Open PDF preview page in new window
      const pdfUrl = `/resume-pdf?data=${encodedData}&autoprint=true`;
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (!printWindow) {
        alert('Please allow popups to generate PDF. You can also use the LaTeX option for offline generation.');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF resume');
    } finally {
      setIsGeneratingLatex(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white">
        <div className="animate-pulse space-y-8">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Resume
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Retry
          </button>
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
    <div className="max-w-4xl mx-auto bg-white shadow-2xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-8">
        <div className="flex gap-8 items-start">
          <Image
            src={profile.avatar_url}
            alt={profile.name || profile.login}
            width={128}
            height={128}
            className="w-32 h-32 rounded-xl border-4 border-white/20 shadow-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {profile.name || profile.login}
            </h1>
            <h2 className="text-xl text-blue-200 mb-4 font-medium">
              Full Stack Developer & Open Source Contributor
            </h2>

            {profile.bio && (
              <p className="text-gray-100 text-lg mb-6 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-200">
                <Github className="w-4 h-4" />
                <span>@{profile.login}</span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-200">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.blog && (
                <div className="flex items-center gap-2 text-gray-200">
                  <Globe className="w-4 h-4" />
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
              <div className="flex items-center gap-2 text-gray-200">
                <Calendar className="w-4 h-4" />
                <span>GitHub since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LaTeX Resume Generation Section */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Download Professional Resume</h2>
          <p className="text-purple-200 mb-6">
            Get your professional resume as a PDF for job applications, or download LaTeX source for customization.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingLatex}
              className="flex items-center gap-2 bg-white text-purple-800 hover:bg-purple-50 disabled:bg-gray-200 disabled:text-gray-500 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
            >
              <Download className="w-6 h-6" />
              {isGeneratingLatex ? 'Generating...' : 'Download PDF Resume'}
            </button>
            <button
              onClick={handleGenerateLatex}
              disabled={isGeneratingLatex}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-4 rounded-lg font-medium transition-colors border-2 border-purple-400"
            >
              <FileText className="w-5 h-5" />
              {isGeneratingLatex ? 'Generating...' : 'LaTeX Source'}
            </button>
          </div>
          <p className="text-sm text-purple-200 mt-4">
            PDF works in all browsers with print-to-PDF. LaTeX option for advanced users who want to customize formatting.
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            Professional Summary
          </h2>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {profile.public_repos}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Repositories
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {totalStars}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Stars
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {profile.followers}
              </div>
              <div className="text-sm text-gray-600 font-medium">Followers</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {topLanguages.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Languages</div>
            </div>
          </div>
        </section>

        {/* Technical Skills */}
        {totalBytes > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
              Technical Skills
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Programming Languages
                </h3>
                <div className="space-y-3">
                  {topLanguages.slice(0, 4).map(([language, bytes]) => {
                    const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                    return (
                      <div key={language} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium text-gray-700">
                          {language}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-xs text-gray-500 font-medium">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Additional Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topLanguages.slice(4).map(([language]) => (
                    <span
                      key={language}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border"
                    >
                      {language}
                    </span>
                  ))}
                  {/* Add common technologies */}
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border">
                    Git
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border">
                    REST APIs
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border">
                    Databases
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border">
                    CI/CD
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Projects */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            Featured Projects
          </h2>
          <div className="space-y-6">
            {repos.slice(0, 4).map((repo) => (
              <div
                key={repo.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      {repo.name}
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </h3>
                    {repo.description && (
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {repo.language && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {repo.language}
                    </span>
                  )}

                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source Contributions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            Open Source Impact
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {totalStars}
              </div>
              <div className="text-sm text-gray-600">Total Stars Earned</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 mb-2">
                {totalForks}
              </div>
              <div className="text-sm text-gray-600">Total Forks</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-2">
                {profile.following}
              </div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            Contact Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Github className="w-5 h-5 text-gray-600" />
              <a
                href={`https://github.com/${profile.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                github.com/{profile.login}
              </a>
            </div>
            {profile.blog && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="w-5 h-5 text-gray-600" />
                <a
                  href={profile.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {profile.blog.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* LaTeX Information Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            About LaTeX Resumes
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Why Choose LaTeX for Your Resume?
            </h3>
            <div className="text-blue-700 space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Professional Standards</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Industry standard for academic positions</li>
                    <li>Preferred by tech companies and research institutions</li>
                    <li>Consistent formatting across all platforms</li>
                    <li>Version control friendly (plain text)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Technical Advantages</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Superior typography and spacing</li>
                    <li>Automatic section numbering and references</li>
                    <li>Mathematical expressions support</li>
                    <li>Customizable templates and styling</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-100 rounded">
                <h4 className="font-semibold mb-2">How to Compile Your LaTeX Resume:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Download the .tex file using the button above</li>
                  <li>Install LaTeX distribution: <a href="https://www.latex-project.org/get/" className="underline" target="_blank">TeX Live</a>, <a href="https://miktex.org/" className="underline" target="_blank">MiKTeX</a>, or <a href="https://www.tug.org/mactex/" className="underline" target="_blank">MacTeX</a></li>
                  <li>Run: <code className="bg-blue-200 px-1 rounded font-mono">pdflatex your_resume.tex</code></li>
                  <li>Or use <a href="https://www.overleaf.com" className="underline" target="_blank">Overleaf</a> for online compilation</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
