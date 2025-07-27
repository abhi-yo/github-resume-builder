"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Github, FileText } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          <span className="text-slate-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] p-12 text-center">
          
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-white/40 backdrop-blur-sm rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.3),0_20px_60px_rgba(0,0,0,0.1)] flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-700" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            GitHub Resume Builder
          </h1>
          
          {/* Subtitle */}
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            Generate professional LaTeX resumes from your GitHub profile with clean, modern templates
          </p>

          {/* Auth Button */}
          <div className="mb-8">
            <AuthButton />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span>Professional LaTeX templates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span>Automatic GitHub data integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span>Clean, minimalist design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
