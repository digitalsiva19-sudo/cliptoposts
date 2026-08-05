"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [niche, setNiche] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "backlinks" | "keywords" | "gmb" | "pitch" | "social">("overview");

  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [backlinkData, setBacklinkData] = useState<any[] | null>(null);
  const [keywordJson, setKeywordJson] = useState<any[] | null>(null);
  const [gmbStructuredData, setGmbStructuredData] = useState<any | null>(null);
  const [pitchStructuredData, setPitchStructuredData] = useState<any | null>(null);
  const [socialData, setSocialData] = useState<string | null>(null);

  const [bannerInfo, setBannerInfo] = useState<{ headline: string; subheadline: string; phone: string; email: string; services: string[] } | null>(null);

  const [domainName, setDomainName] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [planType, setPlanType] = useState<string>("free");
  const [credits, setCredits] = useState<number | null>(3);
  const [subId, setSubId] = useState<string | null>(null);
  const [usedCount, setUsedCount] = useState<number>(0);

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
      alert("⚠️ You have exhausted your 3 Free Credits! Please upgrade to a Pro Plan.");
      return false;
    }
    return true;
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

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(URL.createObjectURL(file));
    }
  };

  const handleExportCSV = () => {
    if (!keywordJson || keywordJson.length === 0) return;
    let csvContent = "Category,S.No,Search Keyword,Monthly Volume,SEO Difficulty,Est Ranking Days,Search Intent,Revenue Impact\n";

    keywordJson.forEach((catItem: any) => {
      const categoryName = `"${(catItem.category || "").replace(/"/g, '""')}"`;
      catItem.keywords?.forEach((k: any, idx: number) => {
        csvContent += `${categoryName},${idx + 1},"${k.kw}","${k.vol}","${k.diff}","${k.days}","${k.intent}","${k.impact}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${domainName}_SEO_Keywords.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunAnalysis = async (mode: "domain_overview" | "backlinks" | "keywords" | "gmb" | "pitch" | "social") => {
    if (!inputText) {
      alert("Please enter a Domain Name or Business Name!");
      return;
    }

    if (!user) {
      alert("Please login first!");
      window.location.href = "/login";
      return;
    }

    if (!checkCreditLimit()) return;

    setLoading(true);
    setActiveTab(mode);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputUrl: inputText, mode, niche, phone, email, platform }),
      });

      const data = await response.json();

      if (data.success) {
        setDomainName(data.domainName || inputText);
        if (mode === "domain_overview") setOverviewData(data.overviewData);
        if (mode === "backlinks") setBacklinkData(data.backlinkData);
        if (mode === "keywords") setKeywordJson(data.keywordJson);
        if (mode === "gmb") setGmbStructuredData(data.gmbStructuredData);
        if (mode === "pitch") setPitchStructuredData(data.pitchStructuredData);
        if (mode === "social") {
          setSocialData(data.socialData);
          setBannerInfo({
            headline: data.bannerHeadline || `Double Your Sales & Leads`,
            subheadline: data.bannerSubheadline || `High ROI Growth Strategies`,
            phone: data.bannerPhone || "+91 96405 02095",
            email: data.bannerEmail || "support@seomynds.com",
            services: data.bannerServices || ["Google Rank #1", "Social Ads", "GMB Map Pack", "Lead Funnels"]
          });
        }

        await deductCreditOnSuccess();
      } else {
        alert("Analysis Error: " + (data.error || "Failed to analyze domain."));
      }

    } catch (err: any) {
      alert("API Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-2">
          SEOMYNDS <span className="text-xs bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2.5 py-1 rounded-lg font-mono">ENTERPRISE SUITE</span>
        </h1>

        <div className="flex items-center gap-3">
          <a href="mailto:support@seomynds.com" className="hidden sm:inline-block text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition">
            ✉️ Support Email
          </a>
          {user ? (
            <>
              <span className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${planType === "free" ? "bg-amber-950 text-amber-300 border-amber-800" : "bg-emerald-950 text-emerald-300 border-emerald-800"}`}>
                ⚡ {planType === "free" ? `Credits: ${credits}/3` : `PRO UNLIMITED`}
              </span>
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-400 font-semibold">Logout</button>
            </>
          ) : (
            <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition shadow-lg">
              Login / Register
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full text-center my-6 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          All-In-One Enterprise SEO & Social Suite
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Online Presence Audit, 150+ High-DA Do-Follow Backlinks, 100+ Keywords & Custom Social Graphic Banners!
        </p>

        {/* Form Inputs */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-left shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">Business / Domain Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. seomynds.com or digital marketing in vizag"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">Select Business Niche / Category</label>
              <input
                type="text"
                placeholder="e.g. Digital Marketing, Real Estate, Dental Clinic"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">Phone / WhatsApp Number</label>
              <input
                type="text"
                placeholder="+91 96405 02095"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">Support Contact Email</label>
              <input
                type="email"
                placeholder="support@seomynds.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">Upload Brand Logo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-xs cursor-pointer"
              />
            </div>
          </div>

          {/* 6 ACTION BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
            <button
              onClick={() => handleRunAnalysis("domain_overview")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-[11px] shadow-lg"
            >
              🌐 Presence & ROI
            </button>

            <button
              onClick={() => handleRunAnalysis("backlinks")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-[11px] shadow-lg"
            >
              🔗 150+ Backlinks
            </button>

            <button
              onClick={() => handleRunAnalysis("keywords")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-[11px] shadow-lg"
            >
              🔍 100+ Keywords
            </button>

            <button
              onClick={() => handleRunAnalysis("gmb")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-[11px] shadow-lg"
            >
              📍 Local GMB Maps
            </button>

            <button
              onClick={() => handleRunAnalysis("pitch")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-[11px] shadow-lg"
            >
              📄 Executive Audit
            </button>

            <button
              onClick={() => handleRunAnalysis("social")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-[11px] shadow-lg col-span-2 md:col-span-1"
            >
              🎨 Social Post Kit
            </button>
          </div>
        </div>

        {/* DISPLAY 1: OVERVIEW */}
        {overviewData && (
          <div className="bg-slate-900 border border-indigo-500/40 p-6 rounded-2xl text-left space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-indigo-400 uppercase">📊 Online Presence & Business Audit: {domainName}</h3>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg font-bold">
                💰 Est. Revenue: {overviewData.estRevenue || "₹4,85,000"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Domain Authority</div>
                <div className="text-2xl font-black text-white mt-1">{overviewData.domainAuthority}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Organic Keywords</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{overviewData.organicKeywords}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Est. Monthly Traffic</div>
                <div className="text-2xl font-black text-purple-400 mt-1">{overviewData.monthlyTraffic}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 font-semibold">Total Backlinks</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{overviewData.backlinks}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">🌐 Online Business Presence Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {overviewData.onlinePresence?.map((p: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{p.platform}</span>
                      <span className="text-slate-400 text-[10px]">{p.status}</span>
                    </div>
                    <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold px-2.5 py-1 rounded-md text-[10px]">
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DISPLAY 2: 150+ HIGH DA BACKLINKS */}
        {backlinkData && (
          <div className="bg-slate-900 border border-blue-500/40 p-6 rounded-2xl text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-blue-400">🔗 150+ Live High-DA Do-Follow Backlink Opportunities ({domainName})</h3>
            </div>
            <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-blue-950 text-blue-200 border-b border-blue-800 sticky top-0">
                    <th className="p-2.5 border border-slate-800">#</th>
                    <th className="p-2.5 border border-slate-800">Target Directory / Platform</th>
                    <th className="p-2.5 border border-slate-800">Domain Authority (DA)</th>
                    <th className="p-2.5 border border-slate-800">Link Type</th>
                    <th className="p-2.5 border border-slate-800">Indexing Status</th>
                    <th className="p-2.5 border border-slate-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {backlinkData.map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-950/80 border-b border-slate-800/50 text-slate-200">
                      <td className="p-2.5 border border-slate-800/40 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-2.5 border border-slate-800 font-bold text-white">{b.site}</td>
                      <td className="p-2.5 border border-slate-800 text-emerald-400 font-mono font-bold">DA {b.da}</td>
                      <td className="p-2.5 border border-slate-800 text-slate-300">{b.type}</td>
                      <td className="p-2.5 border border-slate-800"><span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-800">{b.status}</span></td>
                      <td className="p-2.5 border border-slate-800">
                        <a href={b.actionUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-3 py-1 rounded-md font-bold transition">Get Backlink ↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISPLAY 3: KEYWORDS */}
        {keywordJson && (
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-2xl text-left space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <h3 className="text-sm font-bold text-emerald-400">🔍 100+ Mined Keywords for: {domainName}</h3>
              <button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition shadow">
                📊 Export to CSV / Excel
              </button>
            </div>

            <div className="space-y-6">
              {keywordJson.map((catItem: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 border-b border-purple-900/50 pb-2 uppercase">{catItem.category}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-indigo-950 text-indigo-200 border-b border-indigo-800">
                          <th className="p-2 border border-slate-800">#</th>
                          <th className="p-2 border border-slate-800">Search Keyword</th>
                          <th className="p-2 border border-slate-800">Volume</th>
                          <th className="p-2 border border-slate-800">Difficulty</th>
                          <th className="p-2 border border-slate-800">Est. Days</th>
                          <th className="p-2 border border-slate-800">Intent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catItem.keywords?.map((k: any, kIdx: number) => (
                          <tr key={kIdx} className="hover:bg-slate-900/80 border-b border-slate-800/50 text-slate-200">
                            <td className="p-2 border border-slate-800/40 text-slate-500 font-mono">{kIdx + 1}</td>
                            <td className="p-2 border border-slate-800/40 font-semibold text-white">{k.kw}</td>
                            <td className="p-2 border border-slate-800/40 text-emerald-400">{k.vol}</td>
                            <td className="p-2 border border-slate-800/40 text-amber-300">{k.diff}</td>
                            <td className="p-2 border border-slate-800/40 text-slate-400">{k.days} Days</td>
                            <td className="p-2 border border-slate-800/40"><span className="bg-indigo-950 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-800">{k.intent}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISPLAY 4: STRUCTURED GMB MAPS AUDIT TABLE */}
        {gmbStructuredData && (
          <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl text-left space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">📍 Local GMB Map Pack Audit: {gmbStructuredData.domain}</h3>
              <button onClick={() => handleCopyText(JSON.stringify(gmbStructuredData, null, 2))} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700">
                {copied ? "Copied! ✅" : "📋 Copy Data"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Primary Recommended Category</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{gmbStructuredData.categories?.primary}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-indigo-400 block uppercase">Secondary Categories</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{gmbStructuredData.categories?.secondary}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-amber-950 text-amber-200 border-b border-amber-800">
                    <th className="p-2.5 border border-slate-800">Checklist Item</th>
                    <th className="p-2.5 border border-slate-800">Audit Finding & Recommendation</th>
                    <th className="p-2.5 border border-slate-800">Status</th>
                    <th className="p-2.5 border border-slate-800">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {gmbStructuredData.checklist?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-950/80 border-b border-slate-800/50 text-slate-200">
                      <td className="p-2.5 border border-slate-800/40 font-bold text-white">{item.check}</td>
                      <td className="p-2.5 border border-slate-800/40 text-slate-300">{item.details}</td>
                      <td className="p-2.5 border border-slate-800/40">
                        <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${item.status === "PASSED" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : item.status === "ACTIVE" ? "bg-indigo-950 text-indigo-300 border border-indigo-800" : "bg-amber-950 text-amber-300 border border-amber-800"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2.5 border border-slate-800/40 font-mono font-bold text-amber-400">{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISPLAY 5: STRUCTURED EXECUTIVE AUDIT & ROADMAP TABLE */}
        {pitchStructuredData && (
          <div className="bg-slate-900 border border-pink-500/50 p-6 rounded-2xl text-left space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-pink-400 uppercase">📄 Executive Website SEO Audit & Roadmap: {pitchStructuredData.domain}</h3>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-pink-400 block uppercase mb-1">Executive Summary</span>
              <p className="text-xs text-slate-300 leading-relaxed">{pitchStructuredData.summary}</p>
            </div>

            {/* Technical Findings Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">⚠️ Technical Website Audit Checklist</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-pink-950 text-pink-200 border-b border-pink-800">
                      <th className="p-2.5 border border-slate-800">Audit Item</th>
                      <th className="p-2.5 border border-slate-800">Technical Issue Description</th>
                      <th className="p-2.5 border border-slate-800">Priority</th>
                      <th className="p-2.5 border border-slate-800">Business Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitchStructuredData.findings?.map((f: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-950/80 border-b border-slate-800/50 text-slate-200">
                        <td className="p-2.5 border border-slate-800 font-bold text-white">{f.item}</td>
                        <td className="p-2.5 border border-slate-800 text-slate-300">{f.issue}</td>
                        <td className="p-2.5 border border-slate-800">
                          <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${f.priority === "HIGH" ? "bg-red-950 text-red-300 border border-red-800" : f.priority === "PASSED" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-amber-950 text-amber-300 border border-amber-800"}`}>
                            {f.priority}
                          </span>
                        </td>
                        <td className="p-2.5 border border-slate-800 font-semibold text-purple-300">{f.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6 Month Strategic Roadmap Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">🚀 6-Month Strategic SEO Action Roadmap</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-indigo-950 text-indigo-200 border-b border-indigo-800">
                      <th className="p-2.5 border border-slate-800">Timeline</th>
                      <th className="p-2.5 border border-slate-800">Strategic Focus</th>
                      <th className="p-2.5 border border-slate-800">Key Deliverables</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitchStructuredData.roadmap?.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-950/80 border-b border-slate-800/50 text-slate-200">
                        <td className="p-2.5 border border-slate-800 font-bold text-amber-400 font-mono">{r.month}</td>
                        <td className="p-2.5 border border-slate-800 font-bold text-white">{r.focus}</td>
                        <td className="p-2.5 border border-slate-800 text-slate-300">{r.keyDeliverable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DISPLAY 6: SOCIAL MEDIA KIT & HIGH-END POSTER GRAPHIC BANNER */}
        {socialData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* HIGH END PRO POSTER BANNER */}
            <div className="lg:col-span-5 bg-slate-900 border border-violet-500/40 p-5 rounded-2xl space-y-4 flex flex-col justify-between shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-fuchsia-400">📸 Generated Pro Social Poster Asset</h3>
                <span className="text-[10px] bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded font-mono">1080x1080 HD</span>
              </div>

              {/* RICH PRO GRAPHIC POSTER CARD */}
              <div id="social-banner-card" className="w-full aspect-square rounded-2xl p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border-2 border-indigo-500/60 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                
                {/* Background Decorative Rings */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

                {/* Poster Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    {logoFile ? (
                      <img src={logoFile} alt="Logo" className="w-9 h-9 rounded-xl object-cover border-2 border-amber-400 shadow-lg" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg">
                        {domainName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="font-black text-sm uppercase text-white tracking-wider block truncate max-w-[130px]">{domainName}</span>
                      <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase block">OFFICIAL AGENCY</span>
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] px-3 py-1 rounded-lg uppercase shadow-lg">★ PRO GROW</span>
                </div>

                {/* Central Main Headline */}
                <div className="my-auto space-y-2 relative z-10">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800 inline-block">
                    🔥 EXCLUSIVE STRATEGY OFFER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                    {bannerInfo?.headline || `DOUBLE YOUR SALES & LEADS`}
                  </h3>
                  <p className="text-xs text-slate-300 leading-snug">
                    {bannerInfo?.subheadline || `Dominate Google Search & Scale Business Revenue in 2026`}
                  </p>
                </div>

                {/* Services Grid Badges */}
                <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-2 relative z-10">
                  <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider border-b border-white/10 pb-1">
                    OUR CORE CAPABILITIES:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-200 font-bold">
                    {bannerInfo?.services?.map((srv, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 truncate">
                        <span className="text-amber-400">●</span> {srv}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Call to Action */}
                <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[10px] relative z-10">
                  <div>
                    <span className="block text-slate-400 text-[8px]">CALL US:</span>
                    <span className="font-bold text-amber-300">{bannerInfo?.phone || "+91 96405 02095"}</span>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-lg font-black text-[9px] shadow-lg uppercase">
                    REGISTER NOW
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400 text-[8px]">EMAIL US:</span>
                    <span className="font-bold text-white truncate max-w-[100px] block">{bannerInfo?.email || "support@seomynds.com"}</span>
                  </div>
                </div>

              </div>

              <button
                onClick={() => alert("Screenshot or save this 1080x1080 Poster Card to share on Instagram or WhatsApp!")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition"
              >
                📸 Save Graphic Poster Card
              </button>
            </div>

            {/* TEXT COPY & REEL SCRIPT */}
            <div className="lg:col-span-7 bg-slate-900 border border-violet-500/40 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-violet-400">📝 Reel Scripts, Captions & Copy Kit</h3>
                  <button onClick={() => handleCopyText(socialData)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-md border border-slate-700">
                    {copied ? "Copied! ✅" : "📋 Copy Text"}
                  </button>
                </div>
              </div>

              <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[420px] overflow-y-auto">
                {socialData}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900 flex flex-col items-center gap-1">
        <div>© SEOMYNDS Enterprise SEO & Automation Suite. All Rights Reserved.</div>
        <div>For Direct Business Support: <a href="mailto:support@seomynds.com" className="text-indigo-400 hover:underline">support@seomynds.com</a></div>
      </footer>
    </div>
  );
}
