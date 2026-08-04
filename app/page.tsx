"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [flyerStyle, setFlyerStyle] = useState("3d-agency"); // 3d-agency, devotional, modern-dark
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [domainName, setDomainName] = useState<string>("");
  const [autoPhone, setAutoPhone] = useState<string>("");
  const [autoAddress, setAutoAddress] = useState<string>("");
  const [autoServices, setAutoServices] = useState<string[]>([]);
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
        body: JSON.stringify({ 
          inputUrl: inputText, 
          platform,
          phone,
          address,
          services
        }),
      });

      const data = await response.json();

      if (data.success && data.text) {
        setResult(data.text);
        setDomainName(data.domainName || inputText);
        setAutoPhone(data.autoPhone);
        setAutoAddress(data.autoAddress);
        setAutoServices(data.autoServices || []);

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

  const getPostHookTitle = () => {
    if (!result) return "";
    const match = result.match(/• POST TITLE \/ HOOK:\s*\n?([^\n]+)/i) || result.match(/🎯 VIRAL HOOK:\s*\n?([^\n]+)/i);
    return match ? match[1].replace(/"/g, "") : `GROW YOUR BRAND WITH ${domainName.toUpperCase()}`;
  };

  const isDevotional = flyerStyle === "devotional" || domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
          ClipToPosts <span className="text-xs bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-md font-mono">PRO SUITE</span>
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
      <main className="max-w-5xl mx-auto w-full text-center my-6 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          All-In-One Enterprise AI Growth Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Deep Business Intelligence, Keyword Research, Short Video Prompts & 3D Pro Flyer Banners!
        </p>

        {/* Platform Selection */}
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

        {/* Business Input Form */}
        <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 text-left shadow-xl">
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">Enter Business Name or Website URL *</label>
            <input
              type="text"
              required
              placeholder="e.g. seomynds.com or Vedaswaram"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
          </div>

          {/* Design Style Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">Select Flyer Graphic Template Style:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "3d-agency", name: "💼 3D Corporate Agency (John Smith Style)" },
                { id: "devotional", name: "🕉️ Sacred Devotional / Temple" },
                { id: "modern-dark", name: "⚡ Modern Dark Tech / E-Com" },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFlyerStyle(style.id)}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold transition text-center ${
                    flyerStyle === style.id
                      ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <details className="text-xs text-slate-400 cursor-pointer pt-1">
            <summary className="hover:text-indigo-400 font-semibold">⚡ Optional Custom Contact Overrides</summary>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <input
                type="text"
                placeholder="Custom Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Custom Services (comma separated)"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Custom Location / Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
              />
            </div>
          </details>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm shadow-xl"
          >
            {loading ? `Deeply Analyzing ${inputText} & Generating Assets...` : `🚀 Run Business Intelligence & Generate ${platform.toUpperCase()} Kit`}
          </button>
        </form>

        {/* Results Display */}
        {result && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* FLYER CARD CONTAINER (Lg: 5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 Pro Graphic Visual Flyer</span>
                  <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded-md font-normal">
                    Sample-2 Style
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">3D Neon elements & Corporate agency layout</p>
              </div>

              {/* 3D GRAPHIC CANVAS FLYER */}
              <div 
                className={`w-full aspect-square rounded-2xl p-5 flex flex-col justify-between border shadow-2xl relative overflow-hidden ${
                  isDevotional 
                    ? "bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950 border-amber-600/50 text-amber-100" 
                    : flyerStyle === "modern-dark"
                    ? "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-purple-600/50 text-white"
                    : "bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border-blue-500/50 text-white"
                }`}
              >
                {/* 3D Neon Rings Graphic Background Simulation */}
                <div className="absolute top-10 -right-10 w-44 h-44 rounded-full border-4 border-indigo-500/30 blur-sm pointer-events-none"></div>
                <div className="absolute bottom-10 -left-10 w-36 h-36 rounded-full border-4 border-pink-500/20 blur-sm pointer-events-none"></div>

                {/* Header: Brand Name & 3D Logo Badge */}
                <div className="flex justify-between items-start border-b border-white/15 pb-3 relative z-10">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-amber-400 block font-bold">WE'RE CREATIVE</span>
                    <span className="text-lg font-black tracking-wider uppercase text-white drop-shadow">
                      {domainName.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3 py-1 rounded-lg font-black text-[10px] shadow-lg flex items-center gap-1">
                    <span>★ PRO AGENCY</span>
                  </div>
                </div>

                {/* Main Offer Title / Hook */}
                <div className="my-2 space-y-1 relative z-10">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                    {isDevotional ? "✨ ఆధ్యాత్మిక విశేషాలు ✨" : "🔥 DIGITAL MARKETING EXPERT"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black leading-tight text-white drop-shadow-md">
                    {getPostHookTitle()}
                  </h3>
                </div>

                {/* 3D Social Media Badges + Key Services Box */}
                <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/15 space-y-2 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">OUR SERVICES:</span>
                    {/* 3D Social Media Floating Icons */}
                    <div className="flex gap-1.5 text-xs">
                      <span className="bg-indigo-600/80 p-1 rounded-md" title="LinkedIn">💼</span>
                      <span className="bg-blue-600/80 p-1 rounded-md" title="Facebook">📘</span>
                      <span className="bg-pink-600/80 p-1 rounded-md" title="Instagram">📸</span>
                      <span className="bg-red-600/80 p-1 rounded-md" title="YouTube">🎥</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-200">
                    {(autoServices.length > 0 ? autoServices : ["Digital Marketing", "SEO Campaign Strategies", "Web Design & Dev", "Brand Growth"]).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1 font-semibold truncate">
                        <span className="text-amber-400">●</span> {s.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Section: Website, CTA & Auto Phone */}
                <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[10px] relative z-10">
                  <div>
                    <span className="block text-slate-400 text-[8px]">Visit our website:</span>
                    <span className="font-bold text-white truncate max-w-[110px] block">{domainName}</span>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] shadow-lg uppercase tracking-wider border border-white/20">
                    REGISTER NOW
                  </div>

                  <div className="text-right">
                    <span className="block text-slate-400 text-[8px]">Call Us For Info:</span>
                    <span className="font-bold text-amber-300">{autoPhone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert("Screenshot / Capture this High-Res 3D Card to post directly on Instagram, LinkedIn, or Facebook!")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition"
              >
                📸 Capture / Save Flyer Image
              </button>
            </div>

            {/* FULL BUSINESS INTELLIGENCE SUITE (Lg: 7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-indigo-400">
                    📊 Complete AI Business Intelligence Suite
                  </h3>
                  
                  <button
                    onClick={handleCopy}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
                  >
                    {copied ? "Copied! ✅" : "📋 Copy All Report"}
                  </button>
                </div>
                
                <p className="text-[11px] mt-1 text-slate-400">
                  Target Platform: <span className="text-pink-400 font-bold uppercase">{platform}</span>
                </p>
              </div>

              <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-[500px] overflow-y-auto mt-2 space-y-2">
                {result}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900">
        © ClipToPosts. All-In-One Enterprise AI Growth Engine.
      </footer>
    </div>
  );
}
