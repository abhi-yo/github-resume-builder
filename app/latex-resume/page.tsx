import LaTeXResume from '@/components/LaTeXResume';
import AuthButton from '@/components/AuthButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LaTeXResumePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Professional LaTeX Resume Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in with GitHub to generate a professional LaTeX resume from your profile and repositories.
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  // This would need to be implemented with proper data fetching
  // For now, redirect to main resume page
  redirect('/resume');
}

export const metadata = {
  title: 'LaTeX Resume Generator - GitHub Resume Builder',
  description: 'Generate professional LaTeX resumes from your GitHub profile',
};
