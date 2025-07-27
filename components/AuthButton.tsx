'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Github } from 'lucide-react'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="px-8 py-4 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] text-slate-700 font-medium">
        Loading...
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-slate-700 font-medium">
          Welcome, {session.user?.name}
        </span>
        <button
          onClick={() => signOut()}
          className="px-6 py-3 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.5),0_25px_65px_rgba(0,0,0,0.15)] transition-all duration-300 text-slate-700 font-medium"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="inline-flex items-center gap-3 px-8 py-4 bg-white/40 backdrop-blur-sm rounded-2xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.5),0_25px_65px_rgba(0,0,0,0.15)] transition-all duration-300 text-slate-700 font-semibold text-lg"
    >
      <Github className="w-6 h-6" />
      Continue with GitHub
    </button>
  )
}
