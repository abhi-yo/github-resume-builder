const { generateLatexResume } = require('../lib/latex-generator');

// Sample test data
const sampleProfile = {
  id: 12345,
  login: 'testuser',
  name: 'John Developer',
  avatar_url: 'https://github.com/testuser.png',
  bio: 'Full-stack developer passionate about open source',
  location: 'San Francisco, CA',
  blog: 'https://johndeveloper.dev',
  public_repos: 25,
  followers: 150,
  following: 80,
  created_at: '2018-01-01T00:00:00Z',
  html_url: 'https://github.com/testuser'
};

const sampleRepos = [
  {
    id: 1,
    name: 'awesome-project',
    description: 'A really cool web application built with React and Node.js',
    language: 'TypeScript',
    stargazers_count: 45,
    forks_count: 12,
    topics: ['react', 'nodejs', 'typescript', 'web-app'],
    html_url: 'https://github.com/testuser/awesome-project'
  },
  {
    id: 2,
    name: 'data-analysis-tool',
    description: 'Python tool for analyzing large datasets',
    language: 'Python',
    stargazers_count: 28,
    forks_count: 8,
    topics: ['python', 'data-science', 'pandas', 'matplotlib'],
    html_url: 'https://github.com/testuser/data-analysis-tool'
  }
];

const sampleLanguages = {
  'TypeScript': 1500000,
  'Python': 1200000,
  'JavaScript': 800000,
  'Go': 400000,
  'Rust': 300000
};

// Test the LaTeX generation
console.log('🧪 Testing LaTeX Resume Generation...');
console.log('=====================================\n');

try {
  const latexContent = generateLatexResume(sampleProfile, sampleRepos, sampleLanguages);
  
  console.log('✅ LaTeX generation successful!');
  console.log(`📄 Generated ${latexContent.split('\n').length} lines of LaTeX code`);
  console.log(`📊 Included ${sampleRepos.length} projects`);
  console.log(`🔧 Showcased ${Object.keys(sampleLanguages).length} programming languages`);
  
  // Check for key sections
  const sections = [
    'documentclass',
    'Professional Summary',
    'Technical Skills',
    'Featured Projects',
    'Open Source Contributions'
  ];
  
  console.log('\n📋 Verifying resume sections:');
  sections.forEach(section => {
    if (latexContent.includes(section)) {
      console.log(`   ✅ ${section}`);
    } else {
      console.log(`   ❌ ${section} - MISSING`);
    }
  });
  
  // Save sample output for inspection
  const fs = require('fs');
  const path = require('path');
  
  const outputPath = path.join(__dirname, '../sample-output.tex');
  fs.writeFileSync(outputPath, latexContent);
  console.log(`\n💾 Sample LaTeX saved to: ${outputPath}`);
  
  console.log('\n🎉 Test completed successfully!');
  console.log('\n📝 To compile the sample:');
  console.log('   cd github-resume-builder');
  console.log('   pdflatex sample-output.tex');
  
} catch (error) {
  console.error('❌ LaTeX generation failed:', error);
  process.exit(1);
}
