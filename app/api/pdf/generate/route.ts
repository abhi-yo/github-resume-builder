import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profile, repos, languages } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Generate HTML for PDF conversion
    const htmlContent = generateResumeHTML(profile, repos, languages);

    // For now, we'll return the HTML content that can be converted to PDF on the client side
    // using browser's print functionality or a client-side PDF library
    return NextResponse.json({
      success: true,
      data: {
        html: htmlContent,
        filename: `${profile.login}_resume.html`
      }
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateResumeHTML(profile: any, repos: any[], languages: any) {
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8);

  const totalBytes = Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0);
  const memberSince = new Date(profile.created_at).getFullYear();
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.name || profile.login} - Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            font-size: 11pt;
        }
        
        .container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .header h2 {
            font-size: 16pt;
            font-weight: 300;
            margin-bottom: 15px;
            opacity: 0.9;
        }
        
        .header .contact {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            font-size: 10pt;
        }
        
        .header .contact div {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .content {
            padding: 25px 30px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section h3 {
            font-size: 14pt;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            text-align: center;
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .stat-number {
            font-size: 18pt;
            font-weight: bold;
            color: #1e3a8a;
        }
        
        .stat-label {
            font-size: 9pt;
            color: #64748b;
            margin-top: 3px;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .skill-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .skill-name {
            width: 100px;
            font-weight: 500;
            font-size: 10pt;
        }
        
        .skill-bar {
            flex: 1;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            margin: 0 10px;
            overflow: hidden;
        }
        
        .skill-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            border-radius: 4px;
        }
        
        .skill-percent {
            font-size: 9pt;
            color: #64748b;
            width: 35px;
        }
        
        .project {
            margin-bottom: 15px;
            padding: 12px;
            border-left: 3px solid #3b82f6;
            background: #f8fafc;
        }
        
        .project h4 {
            font-size: 12pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        
        .project .meta {
            font-size: 9pt;
            color: #64748b;
            margin-bottom: 5px;
        }
        
        .project p {
            font-size: 10pt;
            line-height: 1.4;
            color: #475569;
        }
        
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 8px;
        }
        
        .tech-tag {
            background: #e0e7ff;
            color: #3730a3;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8pt;
            font-weight: 500;
        }
        
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
        }
        
        ul {
            padding-left: 20px;
        }
        
        li {
            margin-bottom: 3px;
            font-size: 10pt;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
            font-size: 10pt;
        }
        
        .bio {
            font-size: 11pt;
            line-height: 1.5;
            color: #475569;
            margin-bottom: 15px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${profile.name || profile.login}</h1>
            <h2>Full Stack Developer & Open Source Contributor</h2>
            <div class="contact">
                <div>📧 ${profile.login}@users.noreply.github.com</div>
                <div>🐙 github.com/${profile.login}</div>
                ${profile.location ? `<div>📍 ${profile.location}</div>` : ''}
                ${profile.blog ? `<div>🌐 ${profile.blog.replace(/^https?:\/\//, '')}</div>` : ''}
            </div>
        </div>
        
        <div class="content">
            ${profile.bio ? `
            <div class="section">
                <div class="bio">"${profile.bio}"</div>
            </div>
            ` : ''}
            
            <div class="section">
                <h3>Professional Summary</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${profile.public_repos}</div>
                        <div class="stat-label">Public Repositories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${totalStars}</div>
                        <div class="stat-label">Total Stars</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${profile.followers}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${topLanguages.length}</div>
                        <div class="stat-label">Languages</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${totalForks}</div>
                        <div class="stat-label">Total Forks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${memberSince}</div>
                        <div class="stat-label">Member Since</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3>Technical Skills</h3>
                <div class="skills-grid">
                    <div>
                        <h4 style="font-size: 11pt; margin-bottom: 10px; color: #374151;">Programming Languages</h4>
                        ${topLanguages.slice(0, 6).map(([language, bytes]) => {
                          const percentage = ((bytes as number / totalBytes) * 100);
                          return `
                            <div class="skill-item">
                                <div class="skill-name">${language}</div>
                                <div class="skill-bar">
                                    <div class="skill-fill" style="width: ${percentage}%"></div>
                                </div>
                                <div class="skill-percent">${percentage.toFixed(1)}%</div>
                            </div>
                          `;
                        }).join('')}
                    </div>
                    <div>
                        <h4 style="font-size: 11pt; margin-bottom: 10px; color: #374151;">Technologies & Tools</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${topLanguages.slice(6).map(([lang]) => `<span class="tech-tag">${lang}</span>`).join('')}
                            <span class="tech-tag">Git</span>
                            <span class="tech-tag">Docker</span>
                            <span class="tech-tag">CI/CD</span>
                            <span class="tech-tag">REST APIs</span>
                            <span class="tech-tag">Databases</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3>Featured Projects</h3>
                ${repos.slice(0, 4).map(repo => `
                    <div class="project">
                        <h4>${repo.name}</h4>
                        <div class="meta">${repo.language || 'Various'} • ⭐ ${repo.stargazers_count} stars • 🍴 ${repo.forks_count} forks</div>
                        <p>${repo.description || 'No description available'}</p>
                        ${repo.topics && repo.topics.length > 0 ? `
                            <div class="tech-tags">
                                ${repo.topics.slice(0, 5).map((topic: string) => `<span class="tech-tag">${topic}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div class="two-column">
                <div class="section">
                    <h3>Open Source Impact</h3>
                    <ul>
                        <li>Contributed to ${profile.public_repos} public repositories</li>
                        <li>Earned ${totalStars} stars across all projects</li>
                        <li>Generated ${totalForks} forks from community</li>
                        <li>Built following of ${profile.followers} developers</li>
                        <li>Active in ${topLanguages.length} programming languages</li>
                        <li>GitHub member since ${memberSince}</li>
                    </ul>
                </div>
                
                <div class="section">
                    <h3>Contact Information</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <span>🐙</span>
                            <span>github.com/${profile.login}</span>
                        </div>
                        ${profile.blog ? `
                        <div class="contact-item">
                            <span>🌐</span>
                            <span>${profile.blog.replace(/^https?:\/\//, '')}</span>
                        </div>
                        ` : ''}
                        ${profile.location ? `
                        <div class="contact-item">
                            <span>📍</span>
                            <span>${profile.location}</span>
                        </div>
                        ` : ''}
                        <div class="contact-item">
                            <span>📧</span>
                            <span>${profile.login}@users.noreply.github.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
