"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText } from "lucide-react";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/resume");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-800 border-t-zinc-400"></div>
          <span className="text-zinc-500 text-base">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-20">
          {/* Main Content */}
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-7xl font-doto text-white tracking-tight leading-tight">
                <span className="text-zinc-300">Resume</span>
              </h1>
              <p className=" text-zinc-400 text-md leading-relaxed max-w-md mx-auto">
                Transform your GitHub profile into a beautifully crafted LaTeX
                resume in seconds
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-8">
              <AuthButton />

              {/* Features hint */}
              <div className="flex items-center justify-center gap-8 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                  <span>LaTeX Export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                  <span>GitHub Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                  <span>Professional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
