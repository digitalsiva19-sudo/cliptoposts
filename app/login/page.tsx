"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  // 2. Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-400 font-bold hover:underline">
              Start 3 Free Trials
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs p-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-3.5 rounded-xl transition text-xs flex items-center justify-center gap-3 shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-[10px] text-slate-500 uppercase font-bold">OR EMAIL</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        {/* Email & Password Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
