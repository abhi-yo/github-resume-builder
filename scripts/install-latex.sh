#!/bin/bash

# LaTeX Installation Script for GitHub Resume Builder
# This script helps users install LaTeX on different operating systems

set -e

echo "🔧 GitHub Resume Builder - LaTeX Installation Helper"
echo "=================================================="

# Detect operating system
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

install_latex() {
    case $OS in
        "linux")
            echo "Installing LaTeX on Linux..."
            if command -v apt-get >/dev/null 2>&1; then
                echo "Using apt-get (Debian/Ubuntu)..."
                sudo apt-get update
                sudo apt-get install -y texlive-latex-recommended texlive-fonts-recommended texlive-latex-extra
            elif command -v yum >/dev/null 2>&1; then
                echo "Using yum (RHEL/CentOS)..."
                sudo yum install -y texlive texlive-latex texlive-collection-latexrecommended
            elif command -v dnf >/dev/null 2>&1; then
                echo "Using dnf (Fedora)..."
                sudo dnf install -y texlive texlive-latex texlive-collection-latexrecommended
            elif command -v pacman >/dev/null 2>&1; then
                echo "Using pacman (Arch Linux)..."
                sudo pacman -S texlive-most
            else
                echo "❌ Could not detect package manager. Please install LaTeX manually."
                exit 1
            fi
            ;;
        "macos")
            echo "Installing LaTeX on macOS..."
            if command -v brew >/dev/null 2>&1; then
                echo "Using Homebrew..."
                echo "Choose installation type:"
                echo "1) Full MacTeX (4+ GB, recommended)"
                echo "2) BasicTeX (minimal, 100MB)"
                read -p "Enter choice (1 or 2): " choice
                
                if [ "$choice" = "1" ]; then
                    brew install --cask mactex
                else
                    brew install --cask basictex
                    echo "Installing additional packages for BasicTeX..."
                    sudo tlmgr update --self
                    sudo tlmgr install moderncv fontawesome geometry multicol xcolor
                fi
            else
                echo "❌ Homebrew not found. Please install Homebrew first:"
                echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            ;;
        "windows")
            echo "For Windows, please install MiKTeX manually:"
            echo "1. Download MiKTeX from: https://miktex.org/download"
            echo "2. Run the installer"
            echo "3. During installation, choose 'Install packages on-the-fly: Yes'"
            echo "4. Restart your terminal after installation"
            echo ""
            echo "Alternative: Use Windows Package Manager (winget):"
            echo "   winget install MiKTeX.MiKTeX"
            ;;
        *)
            echo "❌ Unsupported operating system: $OS"
            echo "Please install LaTeX manually from: https://www.latex-project.org/get/"
            exit 1
            ;;
    esac
}

verify_installation() {
    echo ""
    echo "🔍 Verifying LaTeX installation..."
    
    if command -v pdflatex >/dev/null 2>&1; then
        echo "✅ pdflatex found: $(which pdflatex)"
        echo "✅ Version: $(pdflatex --version | head -n1)"
    else
        echo "❌ pdflatex not found. Installation may have failed."
        return 1
    fi
    
    # Test if moderncv package is available
    echo "🔍 Testing moderncv package..."
    if echo '\documentclass{moderncv}\begin{document}\end{document}' | pdflatex -interaction=nonstopmode > /dev/null 2>&1; then
        echo "✅ moderncv package is available"
    else
        echo "⚠️  moderncv package not found. You may need to install it manually:"
        if [[ "$OS" == "macos" ]]; then
            echo "   sudo tlmgr install moderncv"
        elif [[ "$OS" == "linux" ]]; then
            echo "   sudo apt-get install texlive-latex-extra (Debian/Ubuntu)"
            echo "   or install the texlive-collection-latexextra package"
        fi
    fi
}

show_usage() {
    echo ""
    echo "📖 Usage Instructions:"
    echo "====================="
    echo ""
    echo "1. Start the GitHub Resume Builder:"
    echo "   pnpm dev"
    echo ""
    echo "2. Generate your LaTeX resume from the web interface"
    echo ""
    echo "3. Compile the downloaded .tex file:"
    echo "   pdflatex your_resume.tex"
    echo "   pdflatex your_resume.tex  # Run twice for cross-references"
    echo ""
    echo "4. Alternative: Use Overleaf online:"
    echo "   - Upload your .tex file to https://www.overleaf.com"
    echo "   - Compile online without local installation"
    echo ""
}

# Main execution
echo "This script will help you install LaTeX for compiling resumes."
echo "Do you want to proceed with installation? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    install_latex
    verify_installation
    show_usage
    echo ""
    echo "🎉 LaTeX installation complete! You're ready to generate professional resumes."
else
    echo ""
    echo "💡 Alternative: You can use Overleaf (https://www.overleaf.com) for online compilation"
    echo "   without installing LaTeX locally."
    show_usage
fi

echo ""
echo "📚 Additional Resources:"
echo "• LaTeX documentation: https://www.latex-project.org/help/documentation/"
echo "• ModernCV examples: https://www.overleaf.com/latex/templates/moderncv-casual/prbbdkwxkxzc"
echo "• GitHub Resume Builder: http://localhost:3000"
