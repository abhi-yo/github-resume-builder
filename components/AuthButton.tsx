'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="border-2 border-black px-6 py-3 bg-white text-black font-mono">
        <span className="font-bold">LOADING...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-4 font-mono">
        <span className="text-sm font-bold">
          WELCOME, {session.user?.name?.toUpperCase()}
        </span>
        <button
          onClick={() => signOut()}
          className="bg-white text-black border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
        >
          SIGN OUT
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="bg-black text-white border-2 border-black px-6 py-3 font-bold hover:bg-white hover:text-black transition-colors font-mono"
    >
      SIGN IN WITH GITHUB
    </button>
  )
}
