import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ResumePDFPage({ 
  searchParams 
}: { 
  searchParams: { data?: string } 
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  if (!searchParams.data) {
    redirect('/resume');
  }

  let resumeData;
  try {
    resumeData = JSON.parse(decodeURIComponent(searchParams.data));
  } catch {
    redirect('/resume');
  }

  const { profile, repos, languages } = resumeData;

  if (!profile) {
    redirect('/resume');
  }

  const topLanguages = Object.entries(languages || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8);

  const totalBytes = Object.values(languages || {}).reduce((sum: number, bytes) => sum + (bytes as number), 0);
  const memberSince = new Date(profile.created_at).getFullYear();
  const totalStars = (repos || []).reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
  const totalForks = (repos || []).reduce((sum: number, repo: any) => sum + repo.forks_count, 0);

  return (
    <html>
      <head>
        <title>{profile.name || profile.login} - Resume</title>
        <meta charSet="UTF-8" />
        <style>{`
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
          
          @media print {
            body { 
              font-size: 10pt; 
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
          
          .container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
          }
          
          .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
          }
          
          .print-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
          }
          
          .print-btn:hover {
            background: #2563eb;
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
        `}</style>
      </head>
      <body>
        <div className="print-controls no-print">
          <button className="print-btn" onClick={() => window.print()}>
            🖨️ Print/Save as PDF
          </button>
          <button className="print-btn" onClick={() => window.close()}>
            ✕ Close
          </button>
        </div>

        <div className="container">
          <div className="header">
            <h1>{profile.name || profile.login}</h1>
            <h2>Full Stack Developer & Open Source Contributor</h2>
            <div className="contact">
              <div>📧 {profile.login}@users.noreply.github.com</div>
              <div>🐙 github.com/{profile.login}</div>
              {profile.location && <div>📍 {profile.location}</div>}
              {profile.blog && <div>🌐 {profile.blog.replace(/^https?:\/\//, '')}</div>}
            </div>
          </div>
          
          <div className="content">
            {profile.bio && (
              <div className="section">
                <div className="bio">"{profile.bio}"</div>
              </div>
            )}
            
            <div className="section">
              <h3>Professional Summary</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{profile.public_repos}</div>
                  <div className="stat-label">Public Repositories</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{totalStars}</div>
                  <div className="stat-label">Total Stars</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{profile.followers}</div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{topLanguages.length}</div>
                  <div className="stat-label">Languages</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{totalForks}</div>
                  <div className="stat-label">Total Forks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{memberSince}</div>
                  <div className="stat-label">Member Since</div>
                </div>
              </div>
            </div>
            
            <div className="section">
              <h3>Technical Skills</h3>
              <div className="skills-grid">
                <div>
                  <h4 style={{ fontSize: '11pt', marginBottom: '10px', color: '#374151' }}>Programming Languages</h4>
                  {topLanguages.slice(0, 6).map(([language, bytes]) => {
                    const percentage = ((bytes as number / totalBytes) * 100);
                    return (
                      <div key={language} className="skill-item">
                        <div className="skill-name">{language}</div>
                        <div className="skill-bar">
                          <div className="skill-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="skill-percent">{percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h4 style={{ fontSize: '11pt', marginBottom: '10px', color: '#374151' }}>Technologies & Tools</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {topLanguages.slice(6).map(([lang]) => (
                      <span key={lang} className="tech-tag">{lang}</span>
                    ))}
                    <span className="tech-tag">Git</span>
                    <span className="tech-tag">Docker</span>
                    <span className="tech-tag">CI/CD</span>
                    <span className="tech-tag">REST APIs</span>
                    <span className="tech-tag">Databases</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section">
              <h3>Featured Projects</h3>
              {(repos || []).slice(0, 4).map((repo: any) => (
                <div key={repo.id} className="project">
                  <h4>{repo.name}</h4>
                  <div className="meta">{repo.language || 'Various'} • ⭐ {repo.stargazers_count} stars • 🍴 {repo.forks_count} forks</div>
                  <p>{repo.description || 'No description available'}</p>
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="tech-tags">
                      {repo.topics.slice(0, 5).map((topic: string) => (
                        <span key={topic} className="tech-tag">{topic}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="two-column">
              <div className="section">
                <h3>Open Source Impact</h3>
                <ul>
                  <li>Contributed to {profile.public_repos} public repositories</li>
                  <li>Earned {totalStars} stars across all projects</li>
                  <li>Generated {totalForks} forks from community</li>
                  <li>Built following of {profile.followers} developers</li>
                  <li>Active in {topLanguages.length} programming languages</li>
                  <li>GitHub member since {memberSince}</li>
                </ul>
              </div>
              
              <div className="section">
                <h3>Contact Information</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <span>🐙</span>
                    <span>github.com/{profile.login}</span>
                  </div>
                  {profile.blog && (
                    <div className="contact-item">
                      <span>🌐</span>
                      <span>{profile.blog.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="contact-item">
                      <span>📍</span>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="contact-item">
                    <span>📧</span>
                    <span>{profile.login}@users.noreply.github.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script>{`
          // Auto-trigger print dialog after page loads
          window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('autoprint') === 'true') {
              setTimeout(() => window.print(), 500);
            }
          });
        `}</script>
      </body>
    </html>
  );
}
