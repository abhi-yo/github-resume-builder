import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

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
    const { latexContent, filename } = body;

    if (!latexContent) {
      return NextResponse.json(
        { success: false, error: 'LaTeX content is required' },
        { status: 400 }
      );
    }

    // Create a temporary directory for compilation
    const tempDir = path.join('/tmp', `latex-${uuidv4()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const texFile = path.join(tempDir, 'resume.tex');
    const pdfFile = path.join(tempDir, 'resume.pdf');

    try {
      // Write LaTeX content to file
      await fs.writeFile(texFile, latexContent, 'utf-8');

      // Compile LaTeX to PDF using pdflatex
      // Run twice to ensure proper cross-references
      await execAsync(`cd "${tempDir}" && pdflatex -interaction=nonstopmode resume.tex`);
      await execAsync(`cd "${tempDir}" && pdflatex -interaction=nonstopmode resume.tex`);

      // Check if PDF was created
      try {
        await fs.access(pdfFile);
      } catch {
        // If pdflatex failed, try with xelatex
        await execAsync(`cd "${tempDir}" && xelatex -interaction=nonstopmode resume.tex`);
        await execAsync(`cd "${tempDir}" && xelatex -interaction=nonstopmode resume.tex`);
      }

      // Read the generated PDF
      const pdfBuffer = await fs.readFile(pdfFile);
      
      // Clean up temporary files
      await fs.rm(tempDir, { recursive: true, force: true });

      // Return PDF as base64
      const pdfBase64 = pdfBuffer.toString('base64');

      return NextResponse.json({
        success: true,
        data: {
          pdf: pdfBase64,
          filename: filename?.replace('.tex', '.pdf') || 'resume.pdf'
        }
      });

    } catch (compilationError: any) {
      // Clean up on error
      await fs.rm(tempDir, { recursive: true, force: true });
      
      console.error('LaTeX compilation error:', compilationError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to compile LaTeX to PDF. Please ensure LaTeX is properly installed on the server.',
          details: compilationError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error compiling PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compile PDF' },
      { status: 500 }
    );
  }
}
