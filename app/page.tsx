"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [postHtml, setPostHtml] = useState<string | null>(null);

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

  // Clean URL into Clean Business Name
  const cleanBusinessName = (input: string) => {
    let name = input.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0].split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const generatePostHtml = (name: string, hook: string, tip: string, cta: string) => {
    const cleanUrl = name.toLowerCase() + ".com";
    return `
      <div style="
        width: 100%; 
        aspect-ratio: 4/5; 
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); 
        border: 2px solid #3730a3;
        color: white; 
        font-family: sans-serif; 
        border-radius: 20px; 
        padding: 30px; 
        box-sizing: border-box; 
        display: flex; 
        flex-direction: column; 
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      ">
        <!-- Logo Text -->
        <div style="font-size: 14px; font-weight: bold; color: #818cf8; text-transform: uppercase;">
          ${name}
        </div>

        <!-- Main Hook -->
        <div style="font-size: 32px; font-weight: 900; line-height: 1.1; color: white; margin-top: -20px; text-shadow: 1px 1px 10px rgba(0,0,0,0.5);">
          ${hook}
        </div>

        <!-- Key Tip/Content -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid #4338ca; border-radius: 12px; padding: 15px; font-size: 14px; line-height: 1.5; color: #e0e7ff;">
          <div style="font-weight: bold; color: #f472b6;">⚡ Key Strategy:</div>
          <p style="margin: 5px 0 0 0;">${tip}</p>
        </div>

        <!-- Bottom URL & CTA -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #4338ca; pt-15; margin-top: 20px;">
          <div style="font-size: 11px; color: #a5b4fc; font-weight: normal;">${cleanUrl}</div>
          <div style="font-size: 12px; color: white; background: #6366f1; padding: 6px 12px; border-radius: 8px; font-weight: bold;">
            ${cta}
          </div>
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
    setPostHtml(null);

    const brandName = cleanBusinessName(inputText);

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

      // 2. Generate Human Style Content & Time
      setTimeout(() => {
        let contentData = "";
        let postH = "";

        if (inputText.toLowerCase().includes("seomynds")) {
          postH = generatePostHtml(
            brandName,
            "Are You Still Paying for Ad Leads?",
            "Organic SEO Traffic generates 3X more conversions at half the cost. It's time to build authority with ${brandName}.",
            "Get Free Consultation"
          );
          contentData = `📸 INSTAGRAM POST & REEL (HUMAN CURATED)

🎯 VIRAL HOOK:
"STOP Paying for Ad Leads! Built authority for Free Organic Traffic with ${brandName} instead. 👇"

📝 DESCRIPTION (CAPTION):
In 2026, relying solely on paid ads is a recipe for burn out. Your customers are searching on Google, not just clicking ads. Here is how ${brandName} builds genuine authority that converts visitors into long-term clients:

1️⃣ Search Engine Optimization (SEO) for sustainable organic traffic.
2️⃣ High-Value Content Strategy that positions you as an expert.
3️⃣ Proven Conversion Rate Optimization (CRO).

Save this post right now! Send us a DM or visit ${inputText} to get started today! 🚀

🏷️ HASHTAGS:
#${brandName} #SEOTraffic #LeadGeneration #OrganicGrowth #DigitalVisibility #VizagMarketing #MarketingTips2026

--------------------------------------------------
🎬 INSTAGRAM REEL SCRIPT (15s):

Reel Title:
SEO Strategy over Paid Ads (2026)

Reel Description:
SEO generates more qualified leads at half the cost of paid ads. Watch to learn why!

Script (0-15s):
• [0-3s Hook]: [Text on Screen] Paid Ads getting too expensive?
• [3-8s Value]: [Text on Screen] Stop paying for single clicks! Start building a sustainable asset with Organic SEO...
• [8-12s Benefit]: [Text on Screen] ${brandName} helps you get consistent leads without the ad spend.
• [12-15s CTA]: [Point down to Link] Link in Bio to schedule Free SEO Audit!

--------------------------------------------------
⏰ BEST TIME TO POST ON INSTAGRAM:
• Best Slot: 6:00 PM – 8:30 PM (Peak Engagement)
• Alternative: 11:30 AM – 1:00 PM (Lunch Break)`;
        } else {
          postH = generatePostHtml(
            brandName,
            "Is Your Website Costing You Clients?",
            "A fast, clear, and high-converting website design is crucial for growth in 2026. ${brandName} builds websites that sell.",
            "Schedule Free Demo"
          );
          contentData = `📸 INSTAGRAM POST & REEL (HUMAN CURATED)

🎯 VIRAL HOOK:
"Is your website helping you scale, or is it costing you clients? Built websites that sell with ${brandName} 👇"

📝 DESCRIPTION (CAPTION):
Your website is your best salesperson in 2026. If it's slow, complex, or not designed to convert, you are losing money daily. Here are 3 essentials ${brandName} implements for every high-converting website:

1️⃣ Ultra-fast loading speed and complete mobile-first design.
2️⃣ Clear and compelling Copywriting.
3️⃣ Simple, targeted Call To Actions (CTAs) that guide visitors.

Save this post right now! Send us a DM or visit ${inputText} to book a website consultation today! 🚀

🏷️ HASHTAGS:
#${brandName} #WebsiteDesign #UXStrategy #LeadGeneration #BusinessGrowth #ConversionTips

--------------------------------------------------
🎬 INSTAGRAM REEL SCRIPT (15s):

Reel Title:
3 Fixes to Turn Website Visitors into Clients

Reel Description:
Fast Loading, Compelling Copy, Targeted CTA. These 3 changes make a website that sells.

Script (0-15s):
• [0-3s Hook]: [Text on Screen] Website not getting consistent clients?
• [3-8s Value]: [Text on Screen] It's likely one of these: slow load time, complex layout, or confusing message.
• [8-12s Benefit]: [Text on Screen] Fix these three for instant conversions. We help you with all of them at ${brandName}.
• [12-15s CTA]: [Point to DM] DM us 'AUDIT' to get a free website conversion review!

--------------------------------------------------
⏰ BEST TIME TO POST ON INSTAGRAM:
• Best Slot: 6:00 PM – 8:30 PM (Peak Engagement)
• Alternative: 11:30 AM – 1:00 PM (Lunch Break)`;
        }

        setResult(contentData);
        setPostHtml(postH);
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error(err);
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
          Human-Grade AI Social Media Post Generator
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Type your Business Name or Website URL. Get professional social media posts and Reel scripts in seconds!
        </p>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-3 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Business Name or Website URL (e.g. seomynds.com)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap shadow-lg"
          >
            {loading ? "Crafting Social Media Post & Reel..." : "Generate Instagram Post & Reel"}
          </button>
        </form>

        {/* Results Display */}
        {(result || postHtml) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* AI Generated Post Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 All-In-One Social Media Post</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">High-engagement professional post visual</p>
              </div>

              {postHtml ? (
                <div 
                  className="w-full h-auto rounded-xl shadow-lg border border-indigo-900 mt-3"
                  dangerouslySetInnerHTML={{ __html: postHtml }}
                />
              ) : (
                <div className="aspect-[4/5] bg-slate-950 rounded-xl flex items-center justify-center text-xs text-slate-600">
                  Designing Professional Post...
                </div>
              )}
            </div>

            {/* AI Text Content Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-indigo-400">
                📝 Human-Style Title, Caption & Reel Script
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-[380px] overflow-y-auto">
                {result}
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900">
        © ClipToPosts. All-In-One Social Media AI Suite.
      </footer>
    </div>
  );
}
