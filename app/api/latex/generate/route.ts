import { NextRequest, NextResponse } from 'next/server';
import { generateLatexResume } from '@/lib/latex-generator';
import { validateRequest, addSecurityHeaders, sanitizeString } from '@/lib/validation';

export async function POST(request: NextRequest) {
  // Validate request with rate limiting and body validation
  const validationError = await validateRequest(request, {
    requireAuth: true,
    rateLimit: { windowMs: 60000, maxRequests: 5 }, // 5 requests per minute (resource intensive)
    validateBody: {
      profile: { required: true, type: 'object' },
      repos: { required: true, type: 'object' },
      languages: { required: true, type: 'object' }
    }
  })
  
  if (validationError) {
    return validationError
  }

  try {
    const body = await request.json();
    const { profile, repos, languages } = body;

    // Sanitize profile data
    const sanitizedProfile = { ...profile };
    if (sanitizedProfile.name) {
      sanitizedProfile.name = sanitizeString(sanitizedProfile.name);
    }
    if (sanitizedProfile.bio) {
      sanitizedProfile.bio = sanitizeString(sanitizedProfile.bio);
    }
    if (sanitizedProfile.location) {
      sanitizedProfile.location = sanitizeString(sanitizedProfile.location);
    }
    if (sanitizedProfile.blog) {
      sanitizedProfile.blog = sanitizeString(sanitizedProfile.blog);
    }

    // Sanitize repository data
    const sanitizedRepos = Array.isArray(repos) ? repos.map(repo => ({
      ...repo,
      name: repo.name ? sanitizeString(repo.name) : '',
      description: repo.description ? sanitizeString(repo.description) : '',
    })) : repos;

    const latexContent = generateLatexResume(sanitizedProfile, sanitizedRepos, languages);

    const response = NextResponse.json({
      success: true,
      data: {
        latex: latexContent,
        filename: `${sanitizeString(sanitizedProfile.login || 'resume')}_resume.tex`
      }
    });
    
    return addSecurityHeaders(response);
  } catch (error: unknown) {
    console.error('Error generating LaTeX:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate LaTeX' },
      { status: 500 }
    );
  }
}
