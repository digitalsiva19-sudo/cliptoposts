"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [url, setUrl] = useState("");
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
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.result) {
        setGeneratedContent(data.result);
      } else {
        setGeneratedContent("❌ Failed to generate posts: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setGeneratedContent("❌ Error connecting to server.");
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
          Turn Long YouTube Videos into <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Viral Social Media Posts in Seconds
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal">
          Paste any YouTube link. Our AI extracts transcripts, key takeaways, and generates LinkedIn articles, Twitter threads, and Instagram captions instantly.
        </p>

        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-2xl">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube Video URL (e.g. https://youtube.com/watch?v=...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="whitespace-nowrap bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? "AI Processing..." : "✨ Generate Posts"}
            </button>
          </form>
        </div>

        {generatedContent && (
          <div className="max-w-2xl mx-auto text-left bg-slate-900 border border-indigo-500/40 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Generated Output</span>
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

        <div className="pt-16 border-t border-slate-900 space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">Simple, Transparent Pricing</h2>
            <p className="text-xs text-slate-400">Upgrade whenever you need more monthly credits.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Free Trial</h3>
              <div className="text-3xl font-black">₹0 <span className="text-xs text-slate-500 font-normal">/ forever</span></div>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li>✅ 3 Free Video Conversions</li>
                <li>✅ Basic LinkedIn & Twitter Posts</li>
                <li>✅ Standard Processing Speed</li>
              </ul>
              <Link href="/login" className="block text-center w-full bg-slate-800 hover:bg-slate-700 font-bold text-xs py-3 rounded-xl transition">
                Start Free
              </Link>
            </div>

            <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/50 p-6 rounded-3xl space-y-4 relative shadow-xl">
              <span className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-pink-500 text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-wider">
                POPULAR
              </span>
              <h3 className="text-lg font-bold text-indigo-300">Pro Unlimited</h3>
              <div className="text-3xl font-black">₹399 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li>✅ Unlimited Video Conversions</li>
                <li>✅ Long YouTube Video Support</li>
                <li>✅ High-Converting Hook Generators</li>
                <li>✅ Priority Fast Server Speed</li>
              </ul>
              <Link href="/login" className="block text-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-500/20">
                Upgrade to Pro (₹399)
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 text-center py-6 text-xs text-slate-600">
        © 2026 ClipToPosts. Built for Content Creators & Digital Marketers.
      </footer>
    </div>
  );
}
