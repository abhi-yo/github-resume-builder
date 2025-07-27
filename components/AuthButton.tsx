"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Github, LogOut } from "lucide-react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="px-10 py-4 bg-zinc-950 rounded-xl border border-zinc-800/50 text-zinc-500 text-base"
        style={{
          boxShadow: `
               inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
               0 2px 8px 0 rgba(0, 0, 0, 0.5)
             `,
        }}
      >
        Loading...
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col items-center gap-6">
        <span className="text-zinc-400 text-base">
          Welcome back, {session.user?.name}
        </span>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-950 hover:bg-zinc-900 rounded-xl border border-zinc-800/50 transition-all duration-300 text-zinc-400 hover:text-zinc-300 text-base group"
          style={{
            boxShadow: `
              inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
              0 2px 8px 0 rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="inline-flex items-center gap-4 px-10 py-4 bg-zinc-950 hover:bg-zinc-900 rounded-xl transition-all duration-300 text-zinc-200 hover:text-white text-base border border-zinc-800/50 hover:border-zinc-700/50 group font-medium"
      style={{
        boxShadow: `
          inset 0 2px 0 0 rgba(255, 255, 255, 0.1),
          0 4px 16px 0 rgba(0, 0, 0, 0.6),
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
      Continue with GitHub
    </button>
  );
}
