# GitHub LaTeX Resume Builder

A professional resume generator that transforms your GitHub profile into a beautiful LaTeX resume. Perfect for developers, researchers, and technical professionals who want industry-standard resume formatting.

## ✨ Features

- **Automatic Data Collection**: Pulls data from your GitHub profile, repositories, and language statistics
- **Professional LaTeX Output**: Generates clean, well-formatted LaTeX source code
- **PDF Compilation**: Optional server-side PDF compilation for immediate download
- **Industry Standard**: Uses the `moderncv` LaTeX class for professional appearance
- **Open Source Showcase**: Highlights your contributions, stars, forks, and impact
- **Customizable**: Download .tex file for further customization

## 🚀 Why LaTeX Resumes?

LaTeX resumes are the gold standard for:
- Academic positions (PhD, PostDoc, Faculty)
- Research institutions
- Technical companies (especially in Silicon Valley)
- Engineering roles
- Data science positions

Benefits:
- **Superior Typography**: Professional spacing and font rendering
- **ATS Friendly**: Clean structure that passes Applicant Tracking Systems
- **Version Control**: Plain text format works with Git
- **Consistency**: Identical appearance across all platforms
- **Customization**: Full control over layout and styling

## 🛠️ Getting Started

### Prerequisites

For full functionality, install a LaTeX distribution:

**Windows:**
```bash
# Install MiKTeX
winget install MiKTeX.MiKTeX
```

**macOS:**
```bash
# Install MacTeX (recommended) or BasicTeX
brew install --cask mactex
# OR for smaller installation:
brew install --cask basictex
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install texlive-full
```

**Online Alternative:**
Use [Overleaf](https://www.overleaf.com) for online LaTeX compilation without local installation.

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/github-resume-builder.git
cd github-resume-builder
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your GitHub OAuth credentials:
```env
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Usage

1. **Sign In**: Authenticate with your GitHub account
2. **Generate Resume**: Click "Generate LaTeX Resume" 
3. **Download Options**:
   - **LaTeX File (.tex)**: Download source code for customization
   - **PDF**: Compile and download PDF (requires LaTeX on server)
4. **Compile Locally**: Use the .tex file with your LaTeX installation

### Local Compilation

After downloading the .tex file:

```bash
# Basic compilation
pdflatex your_resume.tex

# For best results, run twice for cross-references
pdflatex your_resume.tex
pdflatex your_resume.tex
```

## 🏗️ Architecture

```
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth configuration
│   │   ├── github/        # GitHub API endpoints
│   │   └── latex/         # LaTeX generation & compilation
│   ├── page.tsx           # Landing page
│   └── resume/page.tsx    # Main resume display
├── components/
│   ├── GitHubResume.tsx   # Resume display & LaTeX controls
│   └── LaTeXResume.tsx    # LaTeX-specific component
├── lib/
│   ├── auth.ts            # Authentication config
│   ├── github.ts          # GitHub API utilities
│   └── latex-generator.ts # LaTeX generation logic
└── types/
    └── github.ts          # TypeScript definitions
```

## 🔧 Configuration

### LaTeX Template Customization

The LaTeX template uses the `moderncv` class. To customize:

1. Download the .tex file
2. Modify the template in `lib/latex-generator.ts`
3. Adjust styling, colors, or layout as needed

### Environment Variables

```env
# GitHub OAuth (required)
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_secret

# NextAuth (required)
NEXTAUTH_SECRET=random_secret_key
NEXTAUTH_URL=http://localhost:3000

# Optional: For enhanced GitHub API access
GITHUB_TOKEN=personal_access_token
```

## 🐳 Docker Support

```dockerfile
# Coming soon - Docker configuration for LaTeX compilation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 LaTeX Dependencies

The generated resume uses these LaTeX packages:
- `moderncv` - Modern CV class
- `fontawesome` - Icon support
- `geometry` - Page layout
- `multicol` - Multi-column layouts
- `xcolor` - Color support

## 🔗 Useful Links

- [LaTeX Installation Guide](https://www.latex-project.org/get/)
- [Overleaf Documentation](https://www.overleaf.com/learn)
- [ModernCV Documentation](https://ctan.org/pkg/moderncv)
- [GitHub OAuth Apps](https://github.com/settings/developers)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication via [NextAuth.js](https://next-auth.js.org/)
- LaTeX template based on [ModernCV](https://ctan.org/pkg/moderncv)
- Icons by [Lucide React](https://lucide.dev/)

---

**Transform your GitHub profile into a professional LaTeX resume today!** 🚀
