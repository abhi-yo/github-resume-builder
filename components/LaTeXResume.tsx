"use client";

import { useState } from "react";
import { GitHubUser, GitHubRepo, LanguageStats } from "@/types/github";
import { Download, FileText, Eye } from "lucide-react";
import { generateLatexResume } from "@/lib/latex-generator";

interface LaTeXResumeProps {
  profile: GitHubUser;
  repos: GitHubRepo[];
  languages: LanguageStats;
}

export default function LaTeXResume({ profile, repos, languages }: LaTeXResumeProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [latexContent, setLatexContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateLatex = async () => {
    setIsGenerating(true);
    try {
      const latex = generateLatexResume(profile, repos, languages);
      setLatexContent(latex);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating LaTeX:', error);
      alert('Failed to generate LaTeX resume');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadLatex = () => {
    if (!latexContent) return;
    
    const blob = new Blob([latexContent], { type: 'application/x-latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.login}_resume.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCompilePDF = async () => {
    if (!latexContent) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/latex/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latexContent,
          filename: `${profile.login}_resume.tex`
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Convert base64 to blob and download
        const pdfData = atob(result.data.pdf);
        const bytes = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          bytes[i] = pdfData.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(`Failed to compile PDF: ${result.error}`);
      }
    } catch (error) {
      console.error('Error compiling PDF:', error);
      alert('Failed to compile PDF. You can download the LaTeX file and compile it locally.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Professional LaTeX Resume Generator
        </h1>
        <p className="text-gray-600 mb-6">
          Generate a professional LaTeX resume from your GitHub profile. LaTeX resumes are the gold standard for academic and technical positions.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGenerateLatex}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate LaTeX Resume'}
          </button>
        </div>
      </div>

      {latexContent && (
        <div className="space-y-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} LaTeX Code
            </button>
            
            <button
              onClick={handleDownloadLatex}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download .tex File
            </button>
            
            <button
              onClick={handleCompilePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Compiling...' : 'Compile & Download PDF'}
            </button>
          </div>

          {showPreview && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                <h3 className="font-medium text-gray-800">LaTeX Source Code</h3>
              </div>
              <pre className="p-4 text-sm overflow-x-auto text-gray-800 font-mono leading-relaxed">
                {latexContent}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              How to Use Your LaTeX Resume
            </h3>
            <div className="text-blue-700 space-y-2">
              <p><strong>Option 1:</strong> Click "Compile & Download PDF" to get a ready-to-use PDF (requires LaTeX on server)</p>
              <p><strong>Option 2:</strong> Download the .tex file and compile locally:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Install LaTeX distribution (TeX Live, MiKTeX, or MacTeX)</li>
                <li>Install the <code className="bg-blue-100 px-1 rounded">moderncv</code> package</li>
                <li>Run: <code className="bg-blue-100 px-1 rounded">pdflatex your_resume.tex</code></li>
                <li>Run twice to ensure proper cross-references</li>
              </ul>
              <p><strong>Online Option:</strong> Upload to Overleaf.com for online compilation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
