"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        // Sign Up User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create Profile
          await supabase.from("profiles").insert([
            {
              id: authData.user.id,
              username: username || email.split("@")[0],
              email: email,
              role: "customer",
            },
          ]);

          // Create Default Free Subscription
          await supabase.from("subscriptions").insert([
            {
              user_id: authData.user.id,
              plan_name: "Free Plan",
              price: 0,
              generations_limit: 5,
              generations_used: 0,
              status: "active",
            },
          ]);

          alert("Registration Successful! Redirecting...");
          router.push("/dashboard");
        }
      } else {
        // Login User
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-xs text-slate-400">
            {isSignUp ? "Sign up to start converting clips to posts" : "Login to access your dashboard"}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          {isSignUp && (
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Username</label>
              <input
                type="text"
                required={isSignUp}
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Password</label>
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className="text-indigo-400 hover:underline font-bold"
          >
            {isSignUp ? "Login here" : "Register here"}
          </button>
        </div>

        <div className="text-center">
          <Link href="/" className="text-slate-500 text-xs hover:text-slate-400">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
