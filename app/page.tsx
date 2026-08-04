"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [postHtml1, setPostHtml1] = useState<string | null>(null);
  const [postHtml2, setPostHtml2] = useState<string | null>(null);

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

  // Option 1 Design Template
  const generateTemplate1 = (name: string, url: string, selectedPlatform: string) => {
    const isLandscape = selectedPlatform === "linkedin" || selectedPlatform === "facebook" || selectedPlatform === "twitter";
    const aspectRatio = isLandscape ? "16/9" : "1/1";

    return `
      <div style="
        width: 100%; aspect-ratio: ${aspectRatio}; 
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); 
        border: 2px solid #3730a3; color: white; font-family: sans-serif; 
        border-radius: 16px; padding: 20px; box-sizing: border-box; 
        display: flex; flex-direction: column; justify-content: space-between;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: bold; color: #818cf8; text-transform: uppercase;">${name}</span>
          <span style="background: #fbbf24; color: black; font-size: 9px; font-weight: bold; padding: 3px 6px; border-radius: 4px;">${selectedPlatform.toUpperCase()} EXCLUSIVE</span>
        </div>
        <div>
          <div style="font-size: 10px; color: #cbd5e1; text-transform: uppercase;">GROW YOUR BRAND</div>
          <div style="font-size: 22px; font-weight: 900; line-height: 1.1; color: #fbbf24; margin: 4px 0;">HIGH IMPACT RESULTS.</div>
          <p style="font-size: 10px; color: #94a3b8; margin: 0;">Dominate organic reach & high-converting ad campaigns.</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 8px; font-size: 10px;">
          <span style="color: #94a3b8;">${url}</span>
          <span style="background: #4f46e5; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold;">LEARN MORE</span>
        </div>
      </div>
    `;
  };

  // Option 2 Design Template
  const generateTemplate2 = (name: string, url: string, selectedPlatform: string) => {
    const isLandscape = selectedPlatform === "linkedin" || selectedPlatform === "facebook" || selectedPlatform === "twitter";
    const aspectRatio = isLandscape ? "16/9" : "1/1";

    return `
      <div style="
        width: 100%; aspect-ratio: ${aspectRatio}; 
        background: linear-gradient(135deg, #311042 0%, #4c1d95 100%); 
        border: 2px solid #7c3aed; color: white; font-family: sans-serif; 
        border-radius: 16px; padding: 20px; box-sizing: border-box; 
        display: flex; flex-direction: column; justify-content: space-between;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: bold; color: #f472b6;">⚡ ${name}</span>
          <span style="font-size: 9px; color: #ddd;">Verified Design</span>
        </div>
        <div style="text-align: center; margin: auto 0;">
          <div style="font-size: 20px; font-weight: 900; line-height: 1.2; color: #ffffff;">
            Scale Your Digital Reach
          </div>
          <p style="font-size: 10px; color: #f3e8ff; margin-top: 6px;">
            Get custom marketing solutions that generate real revenue.
          </p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px;">
          <span style="font-size: 9px; color: #cbd5e1;">🌐 ${url}</span>
          <span style="background: #db2777; color: white; font-size: 9px; padding: 4px 8px; border-radius: 6px; font-weight: bold;">GET STARTED</span>
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
    setPostHtml2(null);

    const brandName = cleanBusinessName(inputText);
    const cleanUrl = inputText.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0];

    try {
      const newUsed = usedCount + 1;
      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ generations_used: newUsed })
          .eq("id", subId);
      }
      setUsedCount(newUsed);
      setCredits(Math.max(0, limitCount - newUsed));

      setTimeout(() => {
        const t1 = generateTemplate1(brandName, cleanUrl, platform);
        const t2 = generateTemplate2(brandName, cleanUrl, platform);

        let contentData = "";

        if (platform === "instagram") {
          contentData = `📸 INSTAGRAM SPECIFIC CONTENT (${brandName})

📌 VIRAL REEL / POST HOOK:
"Stop making this major mistake with ${brandName} in 2026 👇"

📝 CAPTION & STORY:
Are you struggling to get high-converting leads? Most businesses waste ad spend without optimizing their funnels. Here is how ${brandName} fixes that:

1️⃣ Optimized SEO for Organic Search Leads
2️⃣ High-Converting Landing Page Design
3️⃣ Laser-Targeted Meta & Google Ads

Save this post right now! Send us a DM or visit ${cleanUrl} to schedule a consultation. 🚀

🎬 15-SEC REEL SCRIPT:
• [0-3s Hook]: "Want more leads without doubling your ad budget?"
• [3-10s Value]: "Focus on landing page speed and targeted SEO. Here is what we do at ${brandName}..."
• [10-15s CTA]: "Comment 'GROWTH' to get our free strategy breakdown!"

🏷️ HASHTAGS:
#${brandName} #InstagramReels #DigitalMarketingTips #SEOStrategy #BusinessGrowth

⏰ BEST TIME TO POST ON INSTAGRAM:
• Peak Hours: 6:00 PM – 8:30 PM (Evening)`;

        } else if (platform === "linkedin") {
          contentData = `💼 LINKEDIN PROFESSIONAL THOUGHT LEADERSHIP (${brandName})

🎯 HEADLINE:
How ${brandName} is rethinking customer acquisition in 2026.

📝 ARTICLE / POST BODY:
In B2B and modern services, buyer trust is everything. Relying solely on cold outreach or generic ads no longer yields high ROI. 

Here are 3 core frameworks we execute at ${brandName}:

1. Authority First: Publish insightful case studies over sales pitches.
2. Search Intent Optimization: Position your business where decisions are made.
3. Frictionless Conversion: Simplify your lead forms to maximize conversion rate.

What is your primary strategy for B2B growth this quarter? Let's discuss in the comments below. 👇

🏷️ HASHTAGS:
#${brandName} #B2BMarketing #Leadership #SEO #BusinessStrategy

⏰ BEST TIME TO POST ON LINKEDIN:
• Peak Hours: 8:00 AM – 10:30 AM (Tuesday - Thursday)`;

        } else if (platform === "facebook") {
          contentData = `📘 FACEBOOK COMMUNITY & LEAD GEN POST (${brandName})

🎯 ATTENTION HOOK:
Attention Business Owners! Looking to scale ${brandName} this month?

📝 COMMUNITY POST COPY:
Getting consistent, high-quality clients shouldn't be a guessing game. At ${brandName}, we provide end-to-end digital marketing solutions built to generate real ROI:

✅ Custom Website Development
✅ Guaranteed Local SEO Ranking
✅ Profitable Ad Campaigns

👉 Click 'Learn More' below or visit ${cleanUrl} to claim your Free Digital Audit today!

🏷️ HASHTAGS:
#${brandName} #LocalBusiness #DigitalMarketing #LeadGeneration #SmallBizGrowth

⏰ BEST TIME TO POST ON FACEBOOK:
• Peak Hours: 1:00 PM – 4:00 PM (Thursdays & Fridays)`;

        } else if (platform === "twitter") {
          contentData = `🐦 TWITTER / X VIRAL THREAD (${brandName})

1/5 Most people overcomplicate scaling ${brandName}. Here is a quick 4-tweet framework to fix your marketing pipeline 👇

2/5 Step 1: Fix your core offer. If your value proposition isn't crystal clear in 3 seconds, visitors leave.

3/5 Step 2: Build search engine authority. Organic Google traffic converts 3x better than impulse social clicks.

4/5 Step 3: Retarget lost visitors with retargeting campaigns.

5/5 Found this breakdown useful?
• Retweet the first tweet to help others.
• Follow @${brandName.toLowerCase()} and visit ${cleanUrl} for more insights! 🚀

⏰ BEST TIME TO POST ON TWITTER:
• Peak Hours: 9:00 AM & 5:00 PM`;

        } else if (platform === "youtube") {
          contentData = `🎥 YOUTUBE SHORTS & VIDEO IDEAS PACKAGE (${brandName})

💡 5 VIRAL YOUTUBE SHORT IDEAS:
1. "The #1 Marketing Mistake ${brandName} Fixes Instantly"
2. "How To Rank #1 On Google in 2026 (Step-by-step)"
3. "Stop Wasting Money On Ads! Do This Instead..."
4. "3 Website Design Hacks That Double Your Conversions"
5. "Behind The Scenes: Scaling ${brandName} To The Top"

--------------------------------------------------
🎬 60-SECOND YOUTUBE SHORT SCRIPT:

• [0-5s Hook]: "If you own a business and aren't ranking on Google, you're giving away free money to your competitors!"
• [5-20s Problem]: "Most website owners spend thousands on ads, but their site takes 5 seconds to load and has zero SEO structure."
• [20-45s Solution]: "At ${brandName}, we optimize your site speed, fix target keywords, and build high-quality backlinks."
• [45-60s CTA]: "Want a free audit? Click the link in our pinned comment and let's scale your brand today!"

--------------------------------------------------
🏷️ YOUTUBE SEO TITLE, DESCRIPTION & TAGS:
• High-CTR Title: How ${brandName} Scales Businesses Fast (2026 SEO Guide)
• Description: Learn how to grow your business using smart digital marketing, SEO, and high-converting website strategies with ${brandName}. Visit ${cleanUrl} for more details.
• Tags: ${brandName}, digital marketing 2026, seo tips, youtube shorts strategy, website design

⏰ BEST TIME TO UPLOAD ON YOUTUBE:
• Peak Hours: 5:00 PM – 8:00 PM`;
        }

        setResult(contentData);
        setPostHtml1(t1);
        setPostHtml2(t2);
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
          Multi-Platform AI Content Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Select a platform, type your website or business, and get platform-tailored graphics, thread ideas, or YouTube Short scripts instantly!
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
            placeholder="Business Name or Website URL (e.g. seomynds.com)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm shadow-lg"
          >
            {loading ? `Generating Custom ${platform.toUpperCase()} Suite...` : `Generate For ${platform.toUpperCase()} (Graphics + Custom Script)`}
          </button>
        </form>

        {/* Results Display */}
        {(postHtml1 || result) && (
          <div className="mt-8 space-y-6 text-left">
            
            {/* 2 Banner Graphic Options */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-pink-400">
                🎨 {platform.toUpperCase()} Custom Graphic Options
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 mb-2 font-semibold">Option 1: Pro Banner Style</p>
                  <div dangerouslySetInnerHTML={{ __html: postHtml1 || "" }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 mb-2 font-semibold">Option 2: Modern Minimalist Style</p>
                  <div dangerouslySetInnerHTML={{ __html: postHtml2 || "" }} />
                </div>
              </div>
            </div>

            {/* AI Text Content Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-indigo-400">
                📝 Platform Specific Script, Content & Timings
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80">
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
