"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [businessLogo, setBusinessLogo] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  // Clean URL/Input into Clean Business Name
  const cleanBusinessName = (input: string) => {
    let name = input.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0].split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
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
    setImageUrl(null);

    const brandName = cleanBusinessName(inputText);
    const logoName = businessLogo ? businessLogo : brandName;

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

      // 2. Set Platform Aspect Ratios
      let width = 1080;
      let height = 1350;

      if (platform === "instagram") { width = 1080; height = 1350; }
      else if (platform === "linkedin") { width = 1200; height = 627; }
      else if (platform === "facebook") { width = 1200; height = 630; }
      else if (platform === "twitter") { width = 1600; height = 900; }
      else if (platform === "youtube") { width = 1080; height = 1920; }

      // 3. Ultra-High Quality Social Media Graphic Design Prompt
      const imagePrompt = encodeURIComponent(
        `Modern infographic social media post banner for ${brandName}, digital marketing design, clean typography headline, professional aesthetic, vibrant gradient background, vector art style, graphic design layout, 4k`
      );
      const generatedImg = `https://image.pollinations.ai/prompt/${imagePrompt}?width=${width}&height=${height}&nologo=true`;
      setImageUrl(generatedImg);

      // 4. Clean Human Content Output
      setTimeout(() => {
        let contentData = "";

        if (platform === "instagram") {
          contentData = `📸 INSTAGRAM POST & REEL (HUMAN CURATED)

🎯 VIRAL HOOK:
"3 Proven Strategies to Scale ${brandName} in 2026 👇"

📝 DESCRIPTION (CAPTION):
Are you looking to boost your online reach and convert visitors into clients? Here is what ${brandName} focuses on to drive maximum growth:

1️⃣ Search Engine Optimization (SEO) for Organic Traffic.
2️⃣ Targeted Meta & Google Ads for Instant Leads.
3️⃣ High-Converting Landing Page Design.

Save this post right now! Send us a DM or visit ${inputText} to get started today! 🚀

🏷️ KEYWORDS & HASHTAGS:
#${brandName} #DigitalMarketing #SEOStrategy #BusinessGrowth #VizagMarketing #MarketingTips2026

⏰ BEST TIME TO POST ON INSTAGRAM:
• Best Slot: 6:00 PM – 8:30 PM (Peak Engagement)
• Alternative: 11:30 AM – 1:00 PM (Lunch Break)`;
        } else if (platform === "linkedin") {
          contentData = `💼 LINKEDIN PROFESSIONAL POST

🎯 ATTENTION HEADLINE:
How ${brandName} is transforming digital visibility for businesses.

📝 DESCRIPTION:
In today's digital-first economy, visibility is profitability. At ${brandName}, we believe that a strong digital strategy relies on 3 pillars:

🔹 Pillar 1: Data-Driven Keyword Optimization.
🔹 Pillar 2: Authority Building & Backlink Strategy.
🔹 Pillar 3: User Experience & Conversion Rate Optimization.

What is your biggest hurdle when it comes to online branding? Let's connect in the comments! 👇

🏷️ KEYWORDS & HASHTAGS:
#${brandName} #SEO #B2BMarketing #BusinessGrowth #Leadership

⏰ BEST TIME TO POST ON LINKEDIN:
• Best Slot: 8:00 AM – 10:30 AM (Tue, Wed, Thu)`;
        } else if (platform === "facebook") {
          contentData = `📘 FACEBOOK COMMUNITY ENGAGEMENT POST

🎯 CATCHY TITLE:
Ready to take ${brandName} to the next level?

📝 DESCRIPTION:
Hey Business Owners! 👋 Struggling to get consistent leads online? ${brandName} helps you build a strong online presence that gets actual results.

✅ Custom Website Solutions
✅ Complete SEO & Marketing Strategy
✅ Guaranteed Growth Framework

Click the link below or message us directly to book a free consultation today! 👇

🏷️ HASHTAGS:
#${brandName} #SmallBusinessSupport #DigitalGrowth #MarketingAgency

⏰ BEST TIME TO POST ON FACEBOOK:
• Best Slot: 1:00 PM – 4:00 PM`;
        } else if (platform === "twitter") {
          contentData = `🐦 TWITTER / X VIRAL THREAD

1/5 Most businesses struggle with SEO because they overcomplicate it. Here is how ${brandName} simplifies organic growth 👇

2/5 Step 1: Target high-intent keywords that your customers are actively searching for.

3/5 Step 2: Create clear, fast-loading, and responsive web pages.

4/5 Step 3: Track conversions, not just vanity metrics.

5/5 Retweet if you found this helpful! Follow for more growth insights from ${brandName}. 🚀

⏰ BEST TIME TO POST ON TWITTER:
• Best Slot: 9:00 AM or 5:00 PM`;
        } else if (platform === "youtube") {
          contentData = `🎥 YOUTUBE SHORTS SCRIPT & SEO

🎯 VIRAL VIDEO TITLE IDEAS:
1. How ${brandName} Boosts Website Traffic Fast!
2. The Ultimate Marketing Strategy for 2026 🚀

📝 SHORTS SCRIPT (15s):
• [0-3s Hook]: "Want to rank #1 on Google for your business?"
• [3-10s Value]: "Here is how ${brandName} helps you get organic leads without burning ad budget..."
• [10-15s CTA]: "Subscribe now and visit our website to learn more!"

🏷️ SEO TAGS:
${brandName}, digital marketing, SEO tips, organic traffic, marketing agency

⏰ BEST TIME TO POST ON YOUTUBE:
• Best Slot: 5:00 PM – 8:00 PM`;
        }

        setResult(contentData);
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
          Human-Grade AI Social Media & Banner Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Type your Business Name or Website URL. Get high-converting social media posts and graphic banners in seconds!
        </p>

        {/* Platform Selection Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: "instagram", label: "📸 Instagram (4:5)", color: "hover:border-pink-500" },
            { id: "linkedin", label: "💼 LinkedIn (Banner)", color: "hover:border-blue-500" },
            { id: "facebook", label: "📘 Facebook (Post)", color: "hover:border-blue-600" },
            { id: "twitter", label: "🐦 Twitter Thread", color: "hover:border-sky-400" },
            { id: "youtube", label: "🎥 YouTube Shorts", color: "hover:border-red-500" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlatform(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                platform === item.id
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg"
                  : "bg-slate-900 text-slate-400 border-slate-800 " + item.color
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="space-y-3 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Business Name or Website URL (e.g. https://seomynds.com)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
            <input
              type="text"
              placeholder="Brand/Logo Text (Optional)"
              value={businessLogo}
              onChange={(e) => setBusinessLogo(e.target.value)}
              className="sm:w-1/3 bg-slate-900 border border-slate-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap shadow-lg"
          >
            {loading ? "Crafting Social Media Graphic & Post..." : `Generate ${platform.toUpperCase()} Post + Banner Graphic`}
          </button>
        </form>

        {/* Results Display */}
        {(result || imageUrl) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* AI Image Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 Social Media Banner Graphic</span>
                  <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded-md font-normal">
                    {platform.toUpperCase()}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Infographic style marketing visual</p>
              </div>

              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-800 my-2">
                  <img
                    src={imageUrl}
                    alt="AI Generated Social Media Banner"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                  <a
                    href={imageUrl}
                    target="_blank"
                    download="social_post_banner.jpg"
                    className="mt-3 block text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg transition border border-slate-700"
                  >
                    ⬇️ Download Banner Graphic
                  </a>
                </div>
              ) : (
                <div className="h-48 bg-slate-950 rounded-xl flex items-center justify-center text-xs text-slate-600">
                  Generating Graphic Design...
                </div>
              )}
            </div>

            {/* AI Text Content Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-indigo-400">
                📝 Human-Style Content & Timings
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
