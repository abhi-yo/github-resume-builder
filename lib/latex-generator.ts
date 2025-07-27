import { GitHubUser, GitHubRepo, LanguageStats } from "@/types/github";

export function generateLatexResume(
  profile: GitHubUser,
  repos: GitHubRepo[],
  languages: LanguageStats
): string {
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

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
  const accountAge = new Date().getFullYear() - memberSince + 1;

  const firstName = profile.name?.split(" ")[0] || profile.login;
  const lastName = profile.name?.split(" ").slice(1).join(" ") || "";

  // Get top programming languages for skills section  
  const skillsLanguages = topLanguages
    .slice(0, 8)
    .map(([lang, bytes]) => {
      const percentage = ((bytes / totalBytes) * 100).toFixed(0);
      return `${escapeLatex(lang)} (${percentage}%)`;
    })
    .join(", ");

  // Additional technologies based on common GitHub usage
  const additionalTech =
    "React, Node.js, Docker, AWS, PostgreSQL, MongoDB, Redis, Kubernetes";

  // Get top repositories for pinned projects - show most relevant repos
  const topRepos = repos
    .sort((a, b) => {
      // Improved scoring: prioritize engagement, recency, and completeness
      const getRepoScore = (repo: GitHubRepo) => {
        const starsWeight = repo.stargazers_count * 3;
        const forksWeight = repo.forks_count * 2;
        const recentActivity =
          new Date(repo.updated_at).getTime() / 1000000000000; // Normalize to smaller number
        const hasDescription = repo.description ? 5 : 0; // Bonus for having description
        const hasLanguage = repo.language ? 2 : 0; // Bonus for having primary language
        return (
          starsWeight +
          forksWeight +
          recentActivity +
          hasDescription +
          hasLanguage
        );
      };
      return getRepoScore(b) - getRepoScore(a);
    })
    .slice(0, 4);

  // Get all unique languages from repos - used for display
  const displayLanguages = [
    ...new Set(repos.map((repo) => repo.language).filter(Boolean)),
  ];

  const latex = `%-------------------------
% Resume in Latex
% Author : Generated from GitHub Profile
% License : MIT
%------------------------

\\documentclass[letterpaper,12pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins for bigger layout
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[2]{
  \\item\\small{
    \\textbf{#1}{: #2 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}

\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  CV STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING-----------------
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{\\href{https://github.com/${profile.login}}{\\Large ${escapeLatex(
    firstName
  )} ${escapeLatex(lastName)}}} & ${
    profile.location
      ? `Location: ${escapeLatex(profile.location)}`
      : `Remote Developer`
  }\\\\
  \\href{https://github.com/${profile.login}}{GitHub: ${profile.login}} & ${
    profile.blog
      ? `\\href{${escapeLatex(profile.blog)}}{Portfolio: ${escapeLatex(
          profile.blog.replace(/^https?:\/\//, "")
        )}}`
      : `${profile.public_repos} Public Repositories`
  } \\\\
  ${
    profile.login.includes("@")
      ? `\\href{mailto:${profile.login}}{${profile.login}}`
      : `Member since ${memberSince}`
  } & ${accountAge} years of open source development \\\\
\\end{tabular*}

%-----------SUMMARY-----------------
\\section{Summary}
\\small{${escapeLatex(
    profile.bio || `Passionate about solving problems through technology`
  )}}

%-----------EXPERIENCE-----------------
\\section{Open Source Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {GitHub Community Contributor}{Remote}
      {Software Engineer \\& Code Reviewer}{${memberSince} - Present}
      \\resumeItemListStart
        \\resumeItem{Repository Management}
          {Maintained ${
            profile.public_repos
          } public repositories with focus on ${topLanguages
    .slice(0, 3)
    .map(([lang]) => lang)
    .join(", ")}. Collaborated with ${
    profile.followers
  } followers and contributed to open source ecosystem.}
        \\resumeItem{Community Impact}
          {Earned ${totalStars} total stars across all projects and generated ${totalForks} forks. Active contributor to developer community with consistent coding practices.}
        \\resumeItem{Code Quality}
          {Implemented best practices in version control, documentation, and collaborative development. Expertise in code reviews and mentoring junior developers.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------------
\\section{Featured Projects}
  \\resumeSubHeadingListStart${topRepos
    .map(
      (repo) => `
    \\resumeSubheading
      {\\href{${repo.html_url}}{${escapeLatex(repo.name)}}}{${
        repo.language || "Multiple Technologies"
      }}
      {${escapeLatex(
        repo.description ||
          "Modern software development project showcasing technical skills"
      )}}{${repo.stargazers_count} Stars, ${repo.forks_count} Forks}
      \\resumeItemListStart
        \\resumeItem{Technology Stack}
          {Built with ${repo.language || "multiple technologies"}${
        repo.topics && repo.topics.length > 0
          ? `, featuring ${repo.topics
              .slice(0, 3)
              .map((topic) => escapeLatex(topic))
              .join(", ")}`
          : ""
      }}
        \\resumeItem{Community Engagement}
          {Achieved ${repo.stargazers_count} stars and ${
        repo.forks_count
      } forks, demonstrating ${
        repo.stargazers_count > 5 ? "strong" : "growing"
      } community interest and adoption}
      \\resumeItemListEnd`
    )
    .join("")}
  \\resumeSubHeadingListEnd

%--------PROGRAMMING SKILLS------------
\\section{Programming Skills}
 \\resumeSubHeadingListStart
   \\item{
     \\textbf{Languages}{: ${topLanguages
       .slice(0, 6)
       .map(([lang]) => escapeLatex(lang))
       .join(", ")}}
   }
   \\item{
     \\textbf{Technologies}{: ${additionalTech}}
   }
   \\item{
     \\textbf{GitHub Stats}{: ${
       profile.public_repos
     } repositories, ${totalStars} stars, ${profile.followers} followers}
     \\hfill
     \\textbf{Experience}{: ${accountAge} years of open source development}
   }
 \\resumeSubHeadingListEnd

%-------------------------------------------
\\end{document}`;

  return latex;
}

function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[{}]/g, "\\$&")
    .replace(/[$&%#^_~]/g, "\\$&")
    .replace(/\n/g, " ")
    .trim();
}
