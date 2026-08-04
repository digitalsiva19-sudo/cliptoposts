"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [domainName, setDomainName] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [usedCount, setUsedCount] = useState<number>(0);
  const [limitCount, setLimitCount] = useState<number>(5);

  const refreshUserCredits = async (userId: string) => {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, generations_limit, generations_used")
      .eq("user_id", userId)
      .maybeSingle();

    if (sub) {
      setSubId(sub.id);
      setUsedCount(sub.generations_used || 0);
      setLimitCount(sub.generations_limit || 5);
      setCredits(Math.max(0, sub.generations_limit - sub.generations_used));
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await refreshUserCredits(session.user.id);
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

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputUrl: inputText, platform }),
      });

      const data = await response.json();

      if (data.success && data.text) {
        setResult(data.text);
        setDomainName(data.domainName || inputText);

        const newUsed = usedCount + 1;
        if (subId) {
          await supabase
            .from("subscriptions")
            .update({ generations_used: newUsed })
            .eq("id", subId);
        }
        setUsedCount(newUsed);
        setCredits(Math.max(0, limitCount - newUsed));

      } else {
        alert("Error: " + (data.error || "Something went wrong. Credits were not deducted."));
      }

    } catch (err: any) {
      console.error(err);
      alert("API Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract post title for poster visual
  const getPostHookTitle = () => {
    if (!result) return "";
    const match = result.match(/• POST TITLE \/ HOOK:\s*\n?([^\n]+)/i) || result.match(/🎯 VIRAL HOOK:\s*\n?([^\n]+)/i);
    return match ? match[1].replace(/"/g, "") : `${domainName.toUpperCase()} Official Update`;
  };

  const isDevotional = domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja") || domainName.includes("astro");

  // Dynamic High-Quality Background Patterns based on Niche
  const getBgImage = () => {
    if (isDevotional) {
      return "https://images.unsplash.com/photo-1609348085359-7104dd2d431c?q=80&w=1000&auto=format&fit=crop"; // Rich Indian Temple / Golden Lights Background
    } else if (domainName.includes("kids") || domainName.includes("education")) {
      return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop"; // Education / Learning Graphic
    } else {
      return "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"; // Modern High-Tech Business Dark Gradient
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
          Universal Business AI Social Generator
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Type ANY Website URL or Business Name. Get high-converting visual banners, video scripts & keywords!
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
            placeholder="Type Business Name or Website URL (e.g. vedaswaram.com or seomynds.com)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm shadow-lg"
          >
            {loading ? `Analyzing ${inputText} with Gemini AI...` : `Generate ${platform.toUpperCase()} Banner & Scripts`}
          </button>
        </form>

        {/* Results Display */}
        {result && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Rich Graphic Banner Visual */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 {platform.toUpperCase()} Rich Social Graphic</span>
                  <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded-md font-normal">
                    Pro Design
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">HD Background + Typography Banner</p>
              </div>

              {/* Rich Graphic Visual Overlay */}
              <div 
                className="w-full aspect-square rounded-2xl p-6 flex flex-col justify-between border border-white/20 shadow-2xl relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${getBgImage()})` }}
              >
                {/* Dark Overlay for readability */}
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0"></div>

                {/* Content over background */}
                <div className="relative z-10 flex justify-between items-center border-b border-white/20 pb-3">
                  <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    {isDevotional ? "🕉️ " + domainName : domainName}
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-indigo-600 text-white font-bold uppercase tracking-wider shadow">
                    {platform}
                  </span>
                </div>

                <div className="relative z-10 my-auto text-center px-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 mb-1 block">
                    {isDevotional ? "✨ ఆధ్యాత్మిక విశేషాలు ✨" : "⚡ BRAND GROWTH INSIGHT"}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg block">
                    {getPostHookTitle()}
                  </span>
                </div>

                <div className="relative z-10 flex justify-between items-center border-t border-white/20 pt-3 text-[11px] text-slate-200 font-medium">
                  <span className="bg-black/50 px-2.5 py-1 rounded text-slate-300 border border-white/10">🌐 {domainName}</span>
                  <span className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg ${isDevotional ? "bg-amber-500 text-slate-950" : "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"}`}>
                    SWIPE TO LEARN ➔
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500">
                100% Professional & Safe Social Visual
              </p>
            </div>

            {/* AI Text Output Box with COPY BUTTON */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-indigo-400">
                    📝 Post Content & Reel Script Package
                  </h3>
                  
                  <button
                    onClick={handleCopy}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
                  >
                    {copied ? "Copied! ✅" : "📋 Copy Content"}
                  </button>
                </div>
                
                <p className="text-[11px] mt-1 text-slate-400">
                  Target Platform: <span className="text-pink-400 font-bold uppercase">{platform}</span>
                </p>
              </div>

              <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-[460px] overflow-y-auto mt-2">
                {result}
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900">
        © ClipToPosts. All-In-One Universal Business AI Suite.
      </footer>
    </div>
  );
}
