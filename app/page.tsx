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

  // Design Template 1 (Agency Professional Style)
  const generateTemplate1 = (name: string, url: string) => {
    return `
      <div style="
        width: 100%; aspect-ratio: 1/1; 
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); 
        border: 2px solid #3730a3; color: white; font-family: sans-serif; 
        border-radius: 16px; padding: 24px; box-sizing: border-box; 
        display: flex; flex-direction: column; justify-content: space-between;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: bold; color: #818cf8; text-transform: uppercase;">${name} Agency</span>
          <span style="background: #fbbf24; color: black; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 6px;">PROMO</span>
        </div>
        <div>
          <div style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px;">We're Creative</div>
          <div style="font-size: 26px; font-weight: 900; line-height: 1.1; color: #fbbf24; margin: 5px 0;">BUSINESS GROWTH EXPERTS.</div>
          <p style="font-size: 11px; color: #94a3b8; margin: 5px 0;">Scale your brand with high-impact digital strategies and guaranteed lead generation.</p>
        </div>
        <div style="background: rgba(0,0,0,0.4); border: 1px solid #4338ca; border-radius: 10px; padding: 10px; font-size: 10px; color: #e2e8f0;">
          <div style="font-weight: bold; color: #38bdf8; margin-bottom: 4px;">OUR SERVICES:</div>
          <div>• Digital Marketing & SEO</div>
          <div>• Web Design & Development</div>
          <div>• Social Media Growth</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 10px; font-size: 10px;">
          <span style="color: #94a3b8;">${url}</span>
          <span style="background: #4f46e5; color: white; padding: 5px 10px; border-radius: 6px; font-weight: bold;">REGISTER NOW</span>
        </div>
      </div>
    `;
  };

  // Design Template 2 (Modern Minimalist Style)
  const generateTemplate2 = (name: string, url: string) => {
    return `
      <div style="
        width: 100%; aspect-ratio: 1/1; 
        background: linear-gradient(135deg, #311042 0%, #4c1d95 100%); 
        border: 2px solid #7c3aed; color: white; font-family: sans-serif; 
        border-radius: 16px; padding: 24px; box-sizing: border-box; 
        display: flex; flex-direction: column; justify-content: space-between;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: bold; color: #f472b6;">⚡ ${name}</span>
          <span style="font-size: 10px; color: #ddd;">Verified Partner</span>
        </div>
        <div style="text-align: center; margin: auto 0;">
          <div style="font-size: 24px; font-weight: 900; line-height: 1.2; color: #ffffff;">
            Transform Your Brand Online.
          </div>
          <p style="font-size: 11px; color: #f3e8ff; margin-top: 8px;">
            Stop losing customers to competitors. Get custom solutions designed for high conversion.
          </p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
          <span style="font-size: 10px; color: #cbd5e1;">🌐 ${url}</span>
          <span style="background: #db2777; color: white; font-size: 10px; padding: 5px 10px; border-radius: 6px; font-weight: bold;">GET STARTED</span>
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
        const t1 = generateTemplate1(brandName, cleanUrl);
        const t2 = generateTemplate2(brandName, cleanUrl);

        let contentData = `📢 GENERATED FOR ${platform.toUpperCase()} (${brandName})

🎯 VIRAL HOOK:
"Scale your business faster with ${brandName}. Here is how we do it 👇"

📝 CAPTION & DESCRIPTION:
Are you struggling to get consistent leads? ${brandName} offers complete digital solutions to boost your brand visibility.

1️⃣ Professional Web Design & Development
2️⃣ Strategic SEO & Organic Growth
3️⃣ High-Converting Ad Campaigns

Save this post and visit ${inputText} today! 🚀

🏷️ HASHTAGS:
#${brandName} #DigitalMarketing #BusinessGrowth #SEOStrategy #MarketingAgency2026

⏰ BEST TIME TO POST:
• Peak Hours: 6:00 PM – 9:00 PM`;

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
          Multi-Platform Social Media Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Choose your platform, enter your business, and get 2 professional graphics + human captions instantly!
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
            {loading ? "Generating 2 Professional Designs & Content..." : `Generate For ${platform.toUpperCase()} (2 Options + Content)`}
          </button>
        </form>

        {/* Results Display */}
        {(postHtml1 || result) && (
          <div className="mt-8 space-y-6 text-left">
            
            {/* 2 Banner Graphic Options */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-pink-400">
                🎨 Choose Your Favorite Banner Design (Option 1 vs Option 2)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 mb-2 font-semibold">Option 1: Pro Agency Style</p>
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
                📝 Human-Style Caption, Hashtags & Best Posting Time
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
