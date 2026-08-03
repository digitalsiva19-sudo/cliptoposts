"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <Link href="/" className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          ClipToPosts
        </Link>
        <h2 className="text-xl font-bold text-slate-200">Welcome Back</h2>
        <p className="text-xs text-slate-400">Login feature is coming soon! You can use the free generator on the homepage.</p>
        <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition">
          Go to Home Generator
        </Link>
      </div>
    </div>
  );
}
