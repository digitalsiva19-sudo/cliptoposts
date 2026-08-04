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
    return match ? match[1].replace(/"/g, "") : `GROW YOUR BUSINESS WITH ${domainName.toUpperCase()}`;
  };

  const isDevotional = domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja") || domainName.includes("astro");

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
          3D Graphic Agency Social Generator
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Type ANY Business Name or URL. Gemini AI auto-generates your Services, Contact, 3D Marketing Graphics & Reel Scripts!
        </p>

        {/* Platform Buttons */}
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
        <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 text-left shadow-xl">
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">Business Name or Website URL *</label>
            <input
              type="text"
              required
              placeholder="e.g. seomynds.com or Vedaswaram"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <details className="text-xs text-slate-400 cursor-pointer pt-1">
            <summary className="hover:text-indigo-400 font-semibold">⚡ Optional Custom Overrides (Phone, Address, Services)</summary>
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
                placeholder="Custom Address / Location"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
              />
            </div>
          </details>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm shadow-lg"
          >
            {loading ? `Analyzing Business & Designing 3D Graphic...` : `🚀 Auto-Generate 3D Pro Flyer & ${platform.toUpperCase()} Kit`}
          </button>
        </form>

        {/* Results Display */}
        {result && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* 3D GRAPHIC MARKETING FLYER CARD */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 3D Graphic Agency Flyer</span>
                  <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded-md font-normal">
                    Ready Post
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Full 3D social icons + agency branding layout</p>
              </div>

              {/* Ultra Pro 3D Graphic Flyer Canvas */}
              <div 
                className={`w-full aspect-square rounded-2xl p-5 flex flex-col justify-between border shadow-2xl relative overflow-hidden ${
                  isDevotional 
                    ? "bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950 border-amber-600/50 text-amber-100" 
                    : "bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 border-indigo-500/50 text-white"
                }`}
              >
                {/* 3D Floating Graphic Badges background */}
                <div className="absolute top-12 right-4 opacity-20 pointer-events-none flex gap-2 text-4xl">
                  <span>📱</span><span>🚀</span><span>📈</span>
                </div>

                {/* Header: Brand Name & 3D Logo Badge */}
                <div className="flex justify-between items-start border-b border-white/15 pb-3 relative z-10">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 block font-bold">WE ARE CREATIVE</span>
                    <span className="text-xl font-black tracking-wider uppercase text-white drop-shadow">
                      {domainName.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3 py-1 rounded-lg font-black text-[10px] shadow-lg flex items-center gap-1">
                    <span>⚡ AGENCY</span>
                  </div>
                </div>

                {/* Main Offer Title / Hook */}
                <div className="my-2 space-y-1 relative z-10">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                    {isDevotional ? "✨ ఆధ్యాత్మిక విశేషాలు ✨" : "🔥 DIGITAL MARKETING & BRAND GROWTH"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black leading-tight text-white drop-shadow-md">
                    {getPostHookTitle()}
                  </h3>
                </div>

                {/* 3D Social Media Badges + Key Services Box */}
                <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/15 space-y-2 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">OUR KEY SERVICES:</span>
                    {/* 3D Social Media Icons */}
                    <div className="flex gap-1.5 text-xs">
                      <span title="Instagram">📸</span>
                      <span title="Facebook">📘</span>
                      <span title="LinkedIn">💼</span>
                      <span title="YouTube">🎥</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-200">
                    {(autoServices.length > 0 ? autoServices : ["Web & Funnel Design", "Organic SEO Strategy", "Lead Generation", "Brand Positioning"]).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1 font-semibold truncate">
                        <span className="text-amber-400">✓</span> {s.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Section: Website, CTA & Auto Phone */}
                <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[10px] relative z-10">
                  <div>
                    <span className="block text-slate-400 text-[8px]">Visit Website:</span>
                    <span className="font-bold text-white truncate max-w-[110px] block">{domainName}</span>
                  </div>

                  <div className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] shadow-lg uppercase tracking-wider">
                    REGISTER NOW ➔
                  </div>

                  <div className="text-right">
                    <span className="block text-slate-400 text-[8px]">Call Us For Info:</span>
                    <span className="font-bold text-amber-300">{autoPhone}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500">
                100% Agency Grade 3D Visual Flyer
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
        © ClipToPosts. Pro Business Social Media Suite.
      </footer>
    </div>
  );
}
