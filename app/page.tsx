"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setGeneratedContent(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language }),
      });

      const data = await res.json();

      if (data.result) {
        setGeneratedContent(data.result);
      } else {
        setGeneratedContent("❌ Error: " + (data.error || "Failed to generate posts"));
      }
    } catch (err) {
      setGeneratedContent("❌ Network Error connecting to API.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ClipToPosts
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
            PRO AI
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20">
            Login / Signup
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs font-medium text-amber-300">
          <span>✨ 3 Free AI Credits Available</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          Turn YouTube Videos into <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Viral Social Media Posts & Scripts
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal">
          Paste any YouTube link. Our AI generates LinkedIn posts, Twitter threads, and Reel scripts in English, Telugu, or Hinglish.
        </p>

        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-3">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube Video URL (https://youtube.com/watch?v=...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hinglish">Hinglish / Teluglish</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="whitespace-nowrap bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? "AI Generating..." : "✨ Generate Posts"}
            </button>
          </form>
        </div>

        {generatedContent && (
          <div className="max-w-3xl mx-auto text-left bg-slate-900 border border-indigo-500/40 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Generated Output ({language})</span>
              <button
                onClick={() => navigator.clipboard.writeText(generatedContent)}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 transition"
              >
                📋 Copy All
              </button>
            </div>
            <pre className="text-sm text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
              {generatedContent}
            </pre>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 text-center py-6 text-xs text-slate-600">
        © 2026 ClipToPosts. Built for Content Creators & Digital Marketers.
      </footer>
    </div>
  );
}
