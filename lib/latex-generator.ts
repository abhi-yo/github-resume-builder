import { GitHubUser, GitHubRepo, LanguageStats } from '@/types/github';

export function generateLatexResume(
  profile: GitHubUser,
  repos: GitHubRepo[],
  languages: LanguageStats
): string {
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  const memberSince = new Date(profile.created_at).getFullYear();
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  const firstName = profile.name?.split(' ')[0] || profile.login;
  const lastName = profile.name?.split(' ').slice(1).join(' ') || '';
  
  // Get top programming languages for skills section
  const primaryLanguages = topLanguages.slice(0, 6).map(([lang]) => escapeLatex(lang)).join(', ');
  const frameworks = topLanguages.length > 6 ? topLanguages.slice(6).map(([lang]) => escapeLatex(lang)).join(', ') : 'React, Node.js, Docker, AWS';

  // Get top repositories for projects section
  const topRepos = repos
    .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
    .slice(0, 4);

  const latex = `%-------------------------
% Resume in Latex
% Author : Generated from GitHub Profile
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

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

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.375in}
\\addtolength{\\evensidemargin}{-0.375in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
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
  \\textbf{\\href{https://github.com/${profile.login}}{\\Large ${escapeLatex(firstName)} ${escapeLatex(lastName)}}} & Email : \\href{mailto:${profile.login}@users.noreply.github.com}{${profile.login}@users.noreply.github.com}\\\\
  \\href{https://github.com/${profile.login}}{https://github.com/${profile.login}} & GitHub: ${profile.login} \\\\
  ${profile.blog ? `\\href{${escapeLatex(profile.blog)}}{${escapeLatex(profile.blog.replace(/^https?:\/\//, ''))}} & Portfolio` : `Location: ${escapeLatex(profile.location || 'Remote')} &`} \\\\
\\end{tabular*}

%-----------SUMMARY-----------------
\\section{Summary}
\\small{${escapeLatex(profile.bio || 'Passionate developer with ' + profile.public_repos + ' open source repositories and ' + totalStars + ' GitHub stars. Experienced in ' + primaryLanguages + ' with a strong track record of building scalable applications and contributing to the developer community.')}}

%-----------EXPERIENCE-----------------
\\section{Open Source Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Open Source Developer}{GitHub Platform}
      {Full Stack Developer \\& Maintainer}{${memberSince} - Present}
      \\resumeItemListStart${topRepos.slice(0, 3).map(repo => `
        \\resumeItem{${escapeLatex(repo.name)}}
          {${escapeLatex(repo.description || 'Open source project demonstrating modern development practices')}. Built with ${repo.language || 'multiple technologies'}. Achieved ${repo.stargazers_count} stars and ${repo.forks_count} forks from the community.}`).join('')}
      \\resumeItemListEnd

    \\resumeSubheading
      {GitHub Community Contributor}{Remote}
      {Software Engineer \\& Code Reviewer}{${memberSince} - Present}
      \\resumeItemListStart
        \\resumeItem{Repository Management}
          {Maintained ${profile.public_repos} public repositories with focus on ${primaryLanguages}. Collaborated with ${profile.followers} followers and contributed to open source ecosystem.}
        \\resumeItem{Community Impact}
          {Earned ${totalStars} total stars across all projects and generated ${totalForks} forks. Active contributor to developer community with consistent coding practices.}
        \\resumeItem{Code Quality}
          {Implemented best practices in version control, documentation, and collaborative development. Expertise in code reviews and mentoring junior developers.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------------
\\section{Featured Projects}
  \\resumeSubHeadingListStart${topRepos.map(repo => `
    \\resumeSubItem{${escapeLatex(repo.name)}}
      {${escapeLatex(repo.description || 'Professional software project showcasing modern development practices')}. Language: ${repo.language || 'Multiple'}. Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}.}`).join('')}
  \\resumeSubHeadingListEnd

%--------PROGRAMMING SKILLS------------
\\section{Programming Skills}
 \\resumeSubHeadingListStart
   \\item{
     \\textbf{Languages}{: ${primaryLanguages}}
     \\hfill
     \\textbf{Technologies}{: ${frameworks}, Git, Docker, CI/CD}
   }
   \\item{
     \\textbf{GitHub Stats}{: ${profile.public_repos} repositories, ${totalStars} stars, ${profile.followers} followers}
     \\hfill
     \\textbf{Experience}{: ${new Date().getFullYear() - memberSince + 1} years of open source development}
   }
 \\resumeSubHeadingListEnd

%-------------------------------------------
\\end{document}`;

  return latex;
}

function escapeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[{}]/g, '\\$&')
    .replace(/[$&%#^_~]/g, '\\$&')
    .replace(/\n/g, ' ')
    .trim();
}
