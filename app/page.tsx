"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState("");
  
  // Dropdowns
  const [platform, setPlatform] = useState("instagram");
  const [language, setLanguage] = useState("english");
  const [flyerStyle, setFlyerStyle] = useState("3d-agency");
  
  const [loading, setLoading] = useState(false);
  const [kwLoading, setKwLoading] = useState(false);
  const [gmbLoading, setGmbLoading] = useState(false);
  
  const [result, setResult] = useState<string | null>(null);
  const [keywordReport, setKeywordReport] = useState<string | null>(null);
  const [gmbReport, setGmbReport] = useState<string | null>(null);
  
  const [domainName, setDomainName] = useState<string>("");
  const [autoPhone, setAutoPhone] = useState<string>("");
  const [autoAddress, setAutoAddress] = useState<string>("");
  const [autoServices, setAutoServices] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // User & Subscription Credits State
  const [user, setUser] = useState<any>(null);
  const [planType, setPlanType] = useState<string>("free");
  const [credits, setCredits] = useState<number | null>(3);
  const [subId, setSubId] = useState<string | null>(null);
  const [usedCount, setUsedCount] = useState<number>(0);
  const [limitCount, setLimitCount] = useState<number>(3);

  const refreshUserCredits = async (userId: string) => {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, plan_type, generations_limit, generations_used")
      .eq("user_id", userId)
      .maybeSingle();

    if (sub) {
      setSubId(sub.id);
      setPlanType(sub.plan_type || "free");
      setUsedCount(sub.generations_used || 0);
      
      const maxLimit = sub.plan_type === "free" ? 3 : 999999;
      setLimitCount(maxLimit);
      setCredits(sub.plan_type === "free" ? Math.max(0, 3 - (sub.generations_used || 0)) : 999999);
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

  const checkCreditLimit = () => {
    if (planType === "free" && credits !== null && credits <= 0) {
      alert("⚠️ You have exhausted your 3 Free Credits! Please upgrade to a Pro Plan below to continue unlimited AI generations.");
      return false;
    }
    return true;
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderFormattedHTML = (text: string) => {
    if (!text) return "";
    let formatted = text;
    const tableRegex = /\|(.+)\|[\r\n]\|[-| ]+\|[\r\n]((?:\|.+\|[\r\n]?)+)/g;
    formatted = formatted.replace(tableRegex, (match, headerRow, bodyRows) => {
      const headers = headerRow.split("|").map((h: string) => h.trim()).filter(Boolean);
      const rows = bodyRows.trim().split("\n").map((r: string) => r.split("|").map((c: string) => c.trim()).filter(Boolean));

      let tableHtml = `<table style="width:100%; border-collapse:collapse; margin:15px 0; font-size:12px; background:#fff; border-radius:8px; overflow:hidden;">`;
      tableHtml += `<thead style="background:#4f46e5; color:#fff;"><tr>`;
      headers.forEach((h: string) => {
        tableHtml += `<th style="padding:10px; border:1px solid #c7d2fe; text-align:left;">${h}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;

      rows.forEach((row: string[], idx: number) => {
        const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
        tableHtml += `<tr style="background:${bg};">`;
        row.forEach((cell: string) => {
          tableHtml += `<style>td{padding:8px 10px; border:1px solid #e2e8f0; color:#1e293b;}</style><td>${cell}</td>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</tbody></table>`;
      return tableHtml;
    });

    return formatted;
  };

  const handleDownloadPDF = (contentToPrint: string) => {
    if (!contentToPrint) return;

    const reportContent = renderFormattedHTML(contentToPrint);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${domainName.toUpperCase()} - Executive Client Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; background: #ffffff; }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .brand-title { font-size: 26px; font-weight: 800; color: #4f46e5; text-transform: uppercase; }
            .badge { background: #4f46e5; color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
            th { background: #312e81; color: #ffffff; padding: 10px; border: 1px solid #4338ca; text-align: left; }
            td { padding: 9px 10px; border: 1px solid #cbd5e1; color: #1e293b; }
            tr:nth-child(even) { background-color: #f1f5f9; }
            .footer { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-title">${domainName.toUpperCase()}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">Executive Whitelabel Client Report | Date: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="badge">${planType.toUpperCase()} SUITE</div>
          </div>
          <div>${reportContent}</div>
          <div class="footer">Generated by ClipToPosts Enterprise AI Growth Suite. Confidential.</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const deductCreditOnSuccess = async () => {
    if (planType === "free") {
      const newUsed = usedCount + 1;
      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ generations_used: newUsed })
          .eq("id", subId);
      }
      setUsedCount(newUsed);
      setCredits(Math.max(0, 3 - newUsed));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;

    if (!user) {
      alert("Please login first to generate content!");
      window.location.href = "/login";
      return;
    }

    if (!checkCreditLimit()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inputUrl: inputText, 
          platform,
          language,
          phone,
          address,
          services,
          mode: "suite"
        }),
      });

      const data = await response.json();

      if (data.success && data.text) {
        setResult(data.text);
        setDomainName(data.domainName || inputText);
        setAutoPhone(data.autoPhone);
        setAutoAddress(data.autoAddress);
        setAutoServices(data.autoServices || []);

        await deductCreditOnSuccess();

      } else {
        alert("Error: " + (data.error || "Something went wrong."));
      }

    } catch (err: any) {
      console.error(err);
      alert("API Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordResearch = async () => {
    if (!inputText) {
      alert("Please enter a Business Name, Keyword, or Website URL first!");
      return;
    }

    if (!user) {
      alert("Please login first!");
      window.location.href = "/login";
      return;
    }

    if (!checkCreditLimit()) return;

    setKwLoading(true);
    setKeywordReport(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inputUrl: inputText, 
          mode: "keywords"
        }),
      });

      const data = await response.json();

      if (data.success && data.keywordData) {
        setKeywordReport(data.keywordData);
        setDomainName(data.domainName || inputText);
        await deductCreditOnSuccess();
      } else {
        alert("Keyword Research Error: " + (data.error || "Failed to fetch keyword analytics."));
      }

    } catch (err: any) {
      console.error(err);
      alert("API Error: " + err.message);
    } finally {
      setKwLoading(false);
    }
  };

  const handleGmbChecklist = async () => {
    if (!inputText) {
      alert("Please enter a Business Name, Keyword, or Website URL first!");
      return;
    }

    if (!user) {
      alert("Please login first!");
      window.location.href = "/login";
      return;
    }

    if (!checkCreditLimit()) return;

    setGmbLoading(true);
    setGmbReport(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inputUrl: inputText, 
          mode: "gmb"
        }),
      });

      const data = await response.json();

      if (data.success && data.gmbData) {
        setGmbReport(data.gmbData);
        setDomainName(data.domainName || inputText);
        await deductCreditOnSuccess();
      } else {
        alert("GMB Checklist Error: " + (data.error || "Failed to fetch GMB data."));
      }

    } catch (err: any) {
      console.error(err);
      alert("API Error: " + err.message);
    } finally {
      setGmbLoading(false);
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
          ClipToPosts <span className="text-xs bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-md font-mono">PRO ENTERPRISE</span>
        </h1>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${planType === "free" ? "bg-amber-950 text-amber-300 border-amber-800" : "bg-emerald-950 text-emerald-300 border-emerald-800"}`}>
                ⚡ {planType === "free" ? `Free Credits: ${credits !== null ? credits : 3}/3` : `PRO UNLIMITED (${planType.toUpperCase()})`}
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition shadow-lg"
            >
              Login / Register
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full text-center my-6 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          All-In-One Enterprise Business AI Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          3 Dedicated AI Tools: Social 3D Flyers, 100+ SEO Keyword Audits & Local GMB Map Pack Checklists!
        </p>

        {/* Input Form with Dropdown Selectors */}
        <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-left shadow-xl">
          
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1.5 block">Enter Business Name, Keyword, or Website URL *</label>
            <input
              type="text"
              required
              placeholder="e.g. realestate in vizag or dental clinic in kakinada or seomynds.com"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            />
          </div>

          {/* DROPDOWN SELECTORS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* LANGUAGE DROPDOWN */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">🌐 Select Content Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold cursor-pointer"
              >
                <option value="english">English (Professional)</option>
                <option value="telugu">తెలుగు (Telugu)</option>
                <option value="tanglish">Tanglish (Telugu + English Hybrid)</option>
              </select>
            </div>

            {/* PLATFORM DROPDOWN */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">📱 Select Social Platform:</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold cursor-pointer"
              >
                <option value="instagram">📸 Instagram (Posts & Reels)</option>
                <option value="linkedin">💼 LinkedIn (B2B Articles)</option>
                <option value="facebook">📘 Facebook (Community Posts)</option>
                <option value="youtube">🎥 YouTube (Shorts & Video Prompts)</option>
                <option value="twitter">🐦 Twitter / X (Threads & Updates)</option>
              </select>
            </div>

          </div>

          {/* 3 ACTION BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            
            {/* BUTTON 1: SOCIAL FLYER & CONTENT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs shadow-xl"
            >
              {loading ? `Generating Flyer Kit...` : `🚀 Generate 3D Flyer & Social Kit`}
            </button>

            {/* BUTTON 2: NATIONAL SEO KEYWORDS & AUDIT (100 - 150 KEYWORDS) */}
            <button
              type="button"
              onClick={handleKeywordResearch}
              disabled={kwLoading}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs shadow-xl border border-emerald-400/30 flex items-center justify-center gap-1.5"
            >
              {kwLoading ? `Mining 100+ Keywords...` : `🔍 Mine 100-150 SEO Keywords & Audit Report`}
            </button>

            {/* BUTTON 3: LOCAL SEO & GMB MAP CHECKLIST */}
            <button
              type="button"
              onClick={handleGmbChecklist}
              disabled={gmbLoading}
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-xs shadow-xl border border-amber-400/30 flex items-center justify-center gap-1.5"
            >
              {gmbLoading ? `Analyzing GMB Data...` : `📍 Local SEO & GMB Map Checklist`}
            </button>

          </div>
        </form>

        {/* PRICING & SUBSCRIPTION PACKAGES SECTION */}
        <section className="mt-12 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-6 shadow-xl">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-white">💎 Choose Your ClipToPosts Growth Plan</h3>
            <p className="text-xs text-slate-400">Unlock unlimited AI generations, Whitelabel Client PDF Reports & 3D Visual Flyers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* FREE TRIAL PLAN */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md uppercase">Free Trial</span>
                <h4 className="text-lg font-bold text-white mt-2">Starter Test</h4>
                <div className="text-2xl font-black text-white my-1">₹0 <span className="text-xs text-slate-500 font-normal">/ forever</span></div>
                <ul className="text-xs text-slate-400 space-y-1.5 mt-3">
                  <li>✓ 3 Free Credits</li>
                  <li>✓ Standard Social Posts</li>
                  <li>✓ Basic Keyword List</li>
                </ul>
              </div>
              <button disabled className="w-full bg-slate-800 text-slate-400 text-xs font-bold py-2 rounded-lg cursor-not-allowed">
                {planType === "free" ? "Current Plan" : "Free Plan"}
              </button>
            </div>

            {/* MONTHLY PRO PLAN */}
            <div className="bg-slate-950 border border-indigo-600 p-5 rounded-xl space-y-3 flex flex-col justify-between relative shadow-lg">
              <div>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold px-2 py-0.5 rounded-md uppercase">Popular</span>
                <h4 className="text-lg font-bold text-white mt-2">Pro Monthly</h4>
                <div className="text-2xl font-black text-indigo-400 my-1">₹499 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
                  <li>✓ Unlimited AI Generations</li>
                  <li>✓ 100+ Keyword Mining Reports</li>
                  <li>✓ Whitelabel PDF Client Audits</li>
                  <li>✓ Local GMB Map Checklists</li>
                </ul>
              </div>
              <button 
                onClick={() => alert("Redirecting to Razorpay / PhonePe Gateway for ₹499 Monthly Pro Subscription...")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition"
              >
                Upgrade Monthly
              </button>
            </div>

            {/* 6 MONTHS PLAN */}
            <div className="bg-slate-950 border border-purple-600 p-5 rounded-xl space-y-3 flex flex-col justify-between relative shadow-lg">
              <div>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 font-bold px-2 py-0.5 rounded-md uppercase">Save 16%</span>
                <h4 className="text-lg font-bold text-white mt-2">Pro 6-Months</h4>
                <div className="text-2xl font-black text-purple-400 my-1">₹2,499 <span className="text-xs text-slate-400 font-normal">/ 6 mos</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
                  <li>✓ Everything in Monthly</li>
                  <li>✓ Priority API Speed</li>
                  <li>✓ CSV & Excel Data Export</li>
                  <li>✓ Agency Client Pitch Deck</li>
                </ul>
              </div>
              <button 
                onClick={() => alert("Redirecting to Razorpay / PhonePe Gateway for ₹2,499 6-Month Pro Subscription...")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded-lg transition"
              >
                Upgrade 6-Months
              </button>
            </div>

            {/* YEARLY PLAN */}
            <div className="bg-slate-950 border border-amber-500 p-5 rounded-xl space-y-3 flex flex-col justify-between relative shadow-lg">
              <div>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 font-bold px-2 py-0.5 rounded-md uppercase">Best Value (Save 25%)</span>
                <h4 className="text-lg font-bold text-white mt-2">Pro Annual</h4>
                <div className="text-2xl font-black text-amber-400 my-1">₹4,499 <span className="text-xs text-slate-400 font-normal">/ year</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
                  <li>✓ Full Enterprise Suite Access</li>
                  <li>✓ Unlimited Whitelabel Client PDFs</li>
                  <li>✓ Dedicated Agency Growth Manager</li>
                  <li>✓ Lifetime Feature Updates</li>
                </ul>
              </div>
              <button 
                onClick={() => alert("Redirecting to Razorpay / PhonePe Gateway for ₹4,499 Annual Enterprise Subscription...")}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs py-2 rounded-lg transition shadow-lg"
              >
                Upgrade Yearly
              </button>
            </div>

          </div>
        </section>

        {/* SECTION A: GMB REPORT BOX */}
        {gmbReport && (
          <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl text-left space-y-4 shadow-2xl animate-fade-in">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <span>📍 Local SEO & Google My Business (GMB) Map Optimization Report</span>
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownloadPDF(gmbReport)} className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition shadow border border-amber-400">
                  📄 Download GMB PDF Report
                </button>
                <button onClick={() => handleCopy(gmbReport)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition">
                  {copied ? "Copied! ✅" : "📋 Copy Text"}
                </button>
              </div>
            </div>
            <div className="text-slate-200 text-xs leading-relaxed bg-slate-950 p-5 rounded-xl border border-slate-800 whitespace-pre-line font-sans">
              {gmbReport}
            </div>
          </div>
        )}

        {/* SECTION B: SEO KEYWORDS REPORT BOX */}
        {keywordReport && (
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-2xl text-left space-y-4 shadow-2xl animate-fade-in">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <span>🔍 Whitelabel Client SEO Audit & Keyword Intelligence Report (100+ Keywords)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownloadPDF(keywordReport)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition shadow border border-indigo-400">
                  📄 Download Professional Client PDF
                </button>
                <button onClick={() => handleCopy(keywordReport)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition">
                  {copied ? "Copied! ✅" : "📋 Copy Raw Text"}
                </button>
              </div>
            </div>
            <div 
              className="text-slate-200 text-xs leading-relaxed bg-slate-950 p-5 rounded-xl border border-slate-800 overflow-x-auto font-sans"
              dangerouslySetInnerHTML={{ __html: renderFormattedHTML(keywordReport) }}
            />
          </div>
        )}

        {/* SECTION C: FLYER & CONTENT SUITE */}
        {result && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-pink-400 flex items-center justify-between">
                  <span>🎨 Pro Graphic Visual Flyer</span>
                </h3>
              </div>

              <div className={`w-full aspect-square rounded-2xl p-5 flex flex-col justify-between border shadow-2xl relative overflow-hidden ${isDevotional ? "bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950 border-amber-600/50 text-amber-100" : "bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border-blue-500/50 text-white"}`}>
                <div className="flex justify-between items-start border-b border-white/15 pb-3 relative z-10">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-amber-400 block font-bold">WE'RE CREATIVE</span>
                    <span className="text-lg font-black tracking-wider uppercase text-white drop-shadow">{domainName.toUpperCase()}</span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3 py-1 rounded-lg font-black text-[10px] shadow-lg">★ PRO AGENCY</div>
                </div>

                <div className="my-2 space-y-1 relative z-10">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">{isDevotional ? "✨ ఆధ్యాత్మిక విశేషాలు ✨" : "🔥 EXCLUSIVE OFFER & SERVICES"}</span>
                  <h3 className="text-lg sm:text-xl font-black leading-tight text-white drop-shadow-md">{getPostHookTitle()}</h3>
                </div>

                <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/15 space-y-2 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">OUR SERVICES:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-200">
                    {(autoServices.length > 0 ? autoServices : ["Digital Marketing", "SEO Strategy", "Funnel Design", "Brand Growth"]).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1 font-semibold truncate"><span className="text-amber-400">●</span> {s.trim()}</div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[10px] relative z-10">
                  <div><span className="block text-slate-400 text-[8px]">Website:</span><span className="font-bold text-white truncate max-w-[110px] block">{domainName}</span></div>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] shadow-lg uppercase">REGISTER NOW</div>
                  <div className="text-right"><span className="block text-slate-400 text-[8px]">Call Us:</span><span className="font-bold text-amber-300">{autoPhone}</span></div>
                </div>
              </div>

              <button onClick={() => alert("Capture this High-Res 3D Card to post directly on Social Media!")} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition">
                📸 Capture / Save Flyer Image
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-indigo-400">📝 Social Posts, Reel Scripts & Copy Package</h3>
                  <button onClick={() => handleDownloadPDF(result)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow">📄 Export PDF</button>
                </div>
              </div>

              <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-[500px] overflow-y-auto mt-2">
                {result}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900">
        © ClipToPosts. Enterprise AI Growth Suite.
      </footer>
    </div>
  );
}
