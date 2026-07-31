"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("✅ Magic Login Link sent! Check your email inbox to access dashboard.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            ClipToPosts
          </Link>
          <h2 className="text-xl font-bold text-slate-200">Welcome Back</h2>
          <p className="text-xs text-slate-400">Enter your email to receive a passwordless magic login link.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-sm py-3 rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Sending Magic Link..." : "✨ Send Login Link"}
          </button>
        </form>

        {message && (
          <div className="bg-slate-950 border border-slate-700 p-4 rounded-xl text-center text-xs font-medium text-amber-300">
            {message}
          </div>
        )}

        <div className="text-center border-t border-slate-800 pt-4">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
