import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateLatexResume } from '@/lib/latex-generator';

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

    const latexContent = generateLatexResume(profile, repos, languages);

    return NextResponse.json({
      success: true,
      data: {
        latex: latexContent,
        filename: `${profile.login}_resume.tex`
      }
    });

  } catch (error: any) {
    console.error('Error generating LaTeX:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate LaTeX' },
      { status: 500 }
    );
  }
}
