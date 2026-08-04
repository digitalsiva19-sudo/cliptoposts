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

      // 2. Set Platform Aspect Ratios & Dimensions
      let width = 1080;
      let height = 1080;
      let aspectLabel = "1080x1350 (4:5 Portrait)";

      if (platform === "instagram") {
        width = 1080; height = 1350; aspectLabel = "1080x1350 (4:5 Portrait)";
      } else if (platform === "linkedin") {
        width = 1200; height = 627; aspectLabel = "1200x627 (1.91:1 Landscape)";
      } else if (platform === "facebook") {
        width = 1200; height = 630; aspectLabel = "1200x630 (FB Banner)";
      } else if (platform === "twitter") {
        width = 1600; height = 900; aspectLabel = "1600x900 (16:9 Widescreen)";
      } else if (platform === "youtube") {
        width = 1080; height = 1920; aspectLabel = "1080x1920 (9:16 Shorts)";
      }

      // 3. Generate Image with Branding Prompt
      const logoPrompt = businessLogo ? `with branding logo text '${businessLogo}'` : "";
      const cleanPrompt = encodeURIComponent(`Professional human-designed ${platform} social media post image for ${inputText} ${logoPrompt}, highly detailed, clean typography, 4k resolution, modern aesthetic`);
      const generatedImg = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true`;
      setImageUrl(generatedImg);

      // 4. Generate Human Touch Content & Best Time to Post
      setTimeout(() => {
        let contentData = "";

        if (platform === "instagram") {
          contentData = `📸 INSTAGRAM POST & REEL (HUMAN CURATED)

🎯 VIRAL TITLE / HOOK:
"Stop making this mistake with ${inputText}! Here's what actually works 👇"

📝 DESCRIPTION (CAPTION):
Let's be real—growing ${inputText} isn't as hard as people make it sound. If you're struggling to get results, here is a simple 3-step strategy that top krew use:

1️⃣ Focus on genuine value first, not just selling.
2️⃣ Be consistent with your message and brand identity.
3️⃣ Build real connections in the comments!

Save this post right now so you don't lose it later. Tag a friend who needs to hear this today! 💡

🏷️ KEYWORDS & HASHTAGS:
#${inputText.replace(/\s+/g, '')} #InstagramGrowth #ViralReel #MarketingHacks #BusinessTips2026

⏰ BEST TIME TO POST ON INSTAGRAM:
• Best Slot: 6:00 PM – 8:30 PM (Peak Engagement)
• Alternative: 11:30 AM – 1:00 PM (Lunch Break)`;
        } else if (platform === "linkedin") {
          contentData = `💼 LINKEDIN PROFESSIONAL THOUGHT LEADERSHIP POST

🎯 ATTENTION HEADLINE:
The Unspoken Truth About ${inputText} in 2026

📝 DESCRIPTION:
Most leaders focus on short-term wins. But when it comes to ${inputText}, real leverage comes from building systems that scale.

Here are 3 core lessons I've learned recently:

🔹 Lesson 1: Strategy without execution is just hallucination.
🔹 Lesson 2: Your brand reputation is built in the micro-moments.
🔹 Lesson 3: Prioritize long-term trust over immediate sales.

What has been your biggest learning experience with ${inputText}? Would love to know your thoughts in the comments! 👇

🏷️ KEYWORDS & HASHTAGS:
#${inputText.replace(/\s+/g, '')} #Leadership #BusinessGrowth #Strategy #Innovation

⏰ BEST TIME TO POST ON LINKEDIN:
• Best Slot: 8:00 AM – 10:30 AM (Tuesday, Wednesday, Thursday)
• Alternative: 12:00 PM – 1:00 PM`;
        } else if (platform === "facebook") {
          contentData = `📘 FACEBOOK COMMUNITY ENGAGEMENT POST

🎯 CATCHY TITLE:
Are you looking to scale your business with ${inputText}?

📝 DESCRIPTION:
Hey Everyone! 👋 If you've been wanting to take your ${inputText} to the next level without spending hours figuring everything out, we have something special for you.

Here is what we focus on:
✅ High Quality Execution
✅ Dedicated Support
✅ Proven Growth Framework

Drop a "YES" in the comments if you want the free guide sent directly to your inbox! 👇

🏷️ HASHTAGS:
#${inputText.replace(/\s+/g, '')} #BusinessCommunity #DigitalMarketing #SmallBusinessSupport

⏰ BEST TIME TO POST ON FACEBOOK:
• Best Slot: 1:00 PM – 4:00 PM (Thursdays & Fridays)
• Alternative: 8:00 PM – 9:30 PM`;
        } else if (platform === "twitter") {
          contentData = `🐦 TWITTER / X VIRAL THREAD (HUMAN STYLE)

🧵 THREAD TITLE:
How to master ${inputText} in 2026 (without burning out):

1/5 Most people overcomplicate ${inputText}. Here is the exact framework broken down into simple steps 👇

2/5 Step 1: Simplify your message. If a 10-year-old can't understand what you do, you're losing customers.

3/5 Step 2: Double down on what works and cut out the noise.

4/5 Step 3: Automate repetitive tasks using modern tools.

5/5 Found this useful? 
• RT the first tweet to help others.
• Follow for more daily insights on ${inputText}! 🚀

⏰ BEST TIME TO POST ON TWITTER (X):
• Best Slot: 9:00 AM or 5:00 PM
• Peak Days: Wednesday & Friday`;
        } else if (platform === "youtube") {
          contentData = `🎥 YOUTUBE SHORTS SCRIPT & SEO GUIDE

🎯 VIRAL VIDEO TITLE IDEAS:
1. Don't Do ${inputText} Until You Watch This!
2. How I Mastered ${inputText} in 30 Days 🚀

📝 15-SECOND SHORTS SCRIPT:
• [0-3s Hook]: "If you are doing ${inputText}, stop what you're doing and watch this!"
• [3-10s Value]: "Here is the #1 shortcut that doubles your efficiency in half the time..."
• [10-15s CTA]: "Subscribe now for daily growth hacks!"

🏷️ SEO DESCRIPTION & TAGS:
Ultimate guide on ${inputText}. Learn the practical tips and tricks to succeed fast.
Tags: ${inputText}, ${inputText} strategy, ${inputText} tips, youtube shorts

⏰ BEST TIME TO POST ON YOUTUBE:
• Best Slot: 4:00 PM – 7:00 PM (Weekdays)
• Weekends: 12:00 PM – 3:00 PM`;
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
          Human-Grade AI Social Media & Image Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Generate pixel-perfect platform images, human-style captions, tags & exact posting times in seconds!
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
              placeholder="Topic / Business Name (e.g. SEO Mynds Media, Vizag)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
            <input
              type="text"
              placeholder="Brand/Logo Text (Optional Watermark)"
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
            {loading ? "Crafting Human Content..." : `Generate ${platform.toUpperCase()} Post + Perfect Image`}
          </button>
        </form>

        {/* Results Display */}
        {(result || imageUrl) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* AI Image Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 Platform Specific Image</span>
                  <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded-md font-normal">
                    {platform.toUpperCase()}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Sized perfectly for engagement</p>
              </div>

              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-800 my-2">
                  <img
                    src={imageUrl}
                    alt="AI Generated Banner"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                  <a
                    href={imageUrl}
                    target="_blank"
                    download="social_post_image.jpg"
                    className="mt-3 block text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg transition border border-slate-700"
                  >
                    ⬇️ Download High-Res Image
                  </a>
                </div>
              ) : (
                <div className="h-48 bg-slate-950 rounded-xl flex items-center justify-center text-xs text-slate-600">
                  Generating Custom Image...
                </div>
              )}
            </div>

            {/* AI Text Content Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-indigo-400">
                📝 Human-Style Title, Caption & Timings
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
