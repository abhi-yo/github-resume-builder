"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Github, Zap, FileText, Share2, Download, Star } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Professional Resume Generator
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                GitHub{" "}
              </span>
              Into a Professional PDF Resume
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Automatically generate beautiful, professional PDF resumes from your
              GitHub profile. Perfect for job applications, with both PDF download
              and LaTeX source options available.
            </p>

            <div className="mb-12">
              <AuthButton />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Zap className="w-8 h-8 text-blue-600" />,
                title: "Instant Generation",
                description:
                  "Login with GitHub and get your professional resume in seconds. No manual data entry required.",
              },
              {
                icon: <FileText className="w-8 h-8 text-green-600" />,
                title: "Professional PDF Output",
                description:
                  "Generate print-ready PDF resumes instantly using your browser's print function. No software installation required.",
              },
              {
                icon: <Github className="w-8 h-8 text-purple-600" />,
                title: "Real Data",
                description:
                  "Showcases your actual projects, skills, and contributions with verifiable GitHub statistics.",
              },
              {
                icon: <Share2 className="w-8 h-8 text-orange-600" />,
                title: "Easy Sharing",
                description:
                  "Share your resume link instantly or download as PDF for job applications.",
              },
              {
                icon: <Download className="w-8 h-8 text-red-600" />,
                title: "PDF & LaTeX Export",
                description:
                  "Download professional PDF resumes instantly, or get LaTeX source code for advanced customization.",
              },
              {
                icon: <Star className="w-8 h-8 text-yellow-600" />,
                title: "Auto Updates",
                description:
                  "Your resume stays current as your GitHub profile grows with new projects and skills.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Sample Resume Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Professional Resume Layout
            </h2>
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-6 rounded-lg mb-6">
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                  <Github className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Your Name</h3>
                  <p className="text-blue-200 text-lg">Full Stack Developer</p>
                  <p className="text-gray-200 mt-2">
                    Passionate developer with X years of experience...
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Technical Skills
                </h4>
                <div className="space-y-2">
                  {["JavaScript", "TypeScript", "React", "Node.js"].map(
                    (skill, i) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="w-20 text-gray-700">{skill}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${90 - i * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Featured Projects
                </h4>
                <div className="space-y-3">
                  {[
                    "E-commerce Platform",
                    "Task Management App",
                    "Data Visualization Tool",
                  ].map((project) => (
                    <div
                      key={project}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <h5 className="font-medium text-gray-900">{project}</h5>
                      <p className="text-gray-600 text-xs mt-1">
                        Professional project description...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Your Professional Resume?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers who've already transformed their
              GitHub profiles
            </p>
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  );
}
