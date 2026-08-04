"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [postHtml1, setPostHtml1] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [usedCount, setUsedCount] = useState<number>(0);
  const [limitCount, setLimitCount] = useState<number>(5);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("id, generations_limit, generations_used")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (sub) {
          setSubId(sub.id);
          setUsedCount(sub.generations_used || 0);
          setLimitCount(sub.generations_limit || 5);
          setCredits(Math.max(0, sub.generations_limit - sub.generations_used));
        } else {
          setCredits(5);
        }
      }
    }

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
    window.location.reload();
  };

  const cleanBusinessName = (input: string) => {
    let name = input.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0].split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const generateBannerHtml = (name: string, url: string, selectedPlatform: string) => {
    return `
      <div style="
        width: 100%; aspect-ratio: 16/9; 
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); 
        border: 2px solid #3730a3; color: white; font-family: sans-serif; 
        border-radius: 16px; padding: 20px; box-sizing: border-box; 
        display: flex; flex-direction: column; justify-content: space-between;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: bold; color: #818cf8; text-transform: uppercase;">${name}</span>
          <span style="background: #fbbf24; color: black; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px;">${selectedPlatform.toUpperCase()} EXCLUSIVE</span>
        </div>
        <div>
          <div style="font-size: 20px; font-weight: 900; line-height: 1.2; color: #ffffff;">
            Official Social Media Content Banner
          </div>
          <p style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
            AI Curated for high engagement and maximum reach.
          </p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 10px; font-size: 11px;">
          <span style="color: #94a3b8;">${url}</span>
          <span style="background: #4f46e5; color: white; padding: 5px 10px; border-radius: 6px; font-weight: bold;">VISIT WEBSITE</span>
        </div>
      </div>
    `;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;

    if (!user) {
      alert("Please login first to generate content!");
      window.location.href = "/login";
      return;
    }

    if (credits !== null && credits <= 0) {
      alert("You have exhausted your credits! Please upgrade in Dashboard.");
      return;
    }

    setLoading(true);
    setResult(null);
    setPostHtml1(null);

    const brandName = cleanBusinessName(inputText);
    const cleanUrl = inputText.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0];

    try {
      // 1. Update Credits in Supabase
      const newUsed = usedCount + 1;
      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ generations_used: newUsed })
          .eq("id", subId);
      }
      setUsedCount(newUsed);
      setCredits(Math.max(0, limitCount - newUsed));

      // 2. Call Real Gemini Backend API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputUrl: inputText, platform }),
      });

      const data = await response.json();

      if (data.success && data.text) {
        setResult(data.text);
        setPostHtml1(generateBannerHtml(brandName, cleanUrl, platform));
      } else {
        alert("Generation Error: " + (data.error || "Something went wrong"));
      }

    } catch (err: any) {
      console.error(err);
      alert("API Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6">
      
      {/* Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          ClipToPosts
        </h1>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1.5 rounded-xl font-bold">
                ⚡ Credits Left: {credits !== null ? credits : "..."}
              </span>
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:underline font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition"
            >
              Login / Register
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full text-center my-6 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          Real AI Social Media Generator
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Powered by Google Gemini 1.5 Flash. Enter any website URL to generate 100% relevant social posts!
        </p>

        {/* Platform Selection Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: "instagram", label: "📸 Instagram" },
            { id: "linkedin", label: "💼 LinkedIn" },
            { id: "facebook", label: "📘 Facebook" },
            { id: "twitter", label: "🐦 Twitter (X)" },
            { id: "youtube", label: "🎥 YouTube" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlatform(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                platform === item.id
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-indigo-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-3 mt-4">
          <input
            type="text"
            required
            placeholder="Business Name or Website URL (e.g. vedaswaram.com)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm shadow-lg"
          >
            {loading ? "Analyzing Website & Generating AI Content..." : `Generate Custom ${platform.toUpperCase()} Content with Gemini AI`}
          </button>
        </form>

        {/* Results Display */}
        {(result || postHtml1) && (
          <div className="mt-8 space-y-6 text-left">
            
            {/* Custom Graphic */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-pink-400">
                🎨 {platform.toUpperCase()} Banner Visual
              </h3>
              <div dangerouslySetInnerHTML={{ __html: postHtml1 || "" }} />
            </div>

            {/* Real Gemini AI Generated Content */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center justify-between">
                <span>🤖 Gemini 1.5 Flash Real AI Output</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md font-normal">
                  Live Scraped
                </span>
              </h3>
              <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {result}
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900">
        © ClipToPosts. Powered by Google Gemini.
      </footer>
    </div>
  );
}
