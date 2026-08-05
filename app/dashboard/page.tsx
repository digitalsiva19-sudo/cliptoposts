"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Subscription Details State
  const [planType, setPlanType] = useState<string>("free");
  const [usedCount, setUsedCount] = useState<number>(0);
  const [credits, setCredits] = useState<number>(3);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // Fetch Subscriptions data from Supabase
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("plan_type, generations_used")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (sub) {
            setPlanType(sub.plan_type || "free");
            const used = sub.generations_used || 0;
            setUsedCount(used);
            setCredits(sub.plan_type === "free" ? Math.max(0, 3 - used) : 999999);
          }
        } else {
          // If not logged in, redirect to login page
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Loading User Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6">
      
      {/* Dashboard Navigation Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
          ClipToPosts <span className="text-xs bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-md font-mono">DASHBOARD</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
          >
            🚀 Launch AI Tools
          </Link>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-5xl mx-auto w-full my-8 space-y-8 text-left">
        
        {/* User Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/50 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
          <div>
            <span className="text-[10px] bg-indigo-900 text-indigo-300 font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-indigo-700">
              User Profile
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              Welcome Back, <span className="text-indigo-400">{user?.email?.split("@")[0]}</span> 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-3.5 py-2 rounded-xl font-bold border shadow ${planType === "free" ? "bg-amber-950 text-amber-300 border-amber-800" : "bg-emerald-950 text-emerald-300 border-emerald-800"}`}>
              ⚡ Plan: {planType.toUpperCase()} {planType === "free" ? `(${credits}/3 Credits Left)` : "UNLIMITED"}
            </span>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Current Active Plan</div>
            <div className="text-2xl font-black text-indigo-400 uppercase">{planType} SUITE</div>
            <p className="text-[11px] text-slate-500">
              {planType === "free" ? "Limited to 3 trial generations" : "Full access to 100+ Keywords & 3D Flyers"}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Total AI Generations Used</div>
            <div className="text-2xl font-black text-emerald-400">{usedCount} <span className="text-xs text-slate-500 font-normal">Runs</span></div>
            <p className="text-[11px] text-slate-500">Keyword Audits, GMB Checklists & Social Kit Runs</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Remaining Credits</div>
            <div className="text-2xl font-black text-purple-400">
              {planType === "free" ? `${credits} / 3` : "∞ Unlimited"}
            </div>
            <p className="text-[11px] text-slate-500">
              {planType === "free" ? "Upgrade to Pro for unlimited generation" : "Lifetime / Active Unlimited Access"}
            </p>
          </div>

        </div>

        {/* Subscription Plans & Upgrade CTA Section */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              💎 Manage Subscription & Upgrade Plans
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Upgrade your account to unlock unlimited 100+ Keyword Audits and Whitelabel PDF reports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* PRO MONTHLY */}
            <div className="bg-slate-950 border border-indigo-600/80 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase border border-indigo-800">Popular</span>
                <h4 className="text-base font-bold text-white mt-2">Pro Monthly</h4>
                <div className="text-2xl font-black text-indigo-400 my-1">₹499 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
                  <li>✓ Unlimited AI Generations</li>
                  <li>✓ 100+ Keyword Mining Reports</li>
                  <li>✓ Whitelabel Client PDF Exports</li>
                  <li>✓ Local GMB Map Checklists</li>
                </ul>
              </div>
              <button 
                onClick={() => alert("Redirecting to Secure Gateway for ₹499 Monthly Subscription...")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-lg transition shadow"
              >
                {planType === "monthly" ? "Current Active Plan" : "Upgrade to Pro Monthly"}
              </button>
            </div>

            {/* PRO 6-MONTHS */}
            <div className="bg-slate-950 border border-purple-600/80 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded uppercase border border-purple-800">Save 16%</span>
                <h4 className="text-base font-bold text-white mt-2">Pro 6-Months</h4>
                <div className="text-2xl font-black text-purple-400 my-1">₹2,499 <span className="text-xs text-slate-500 font-normal">/ 6 mos</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
                  <li>✓ Everything in Monthly Plan</li>
                  <li>✓ Priority High-Speed API</li>
                  <li>✓ CSV & Excel Data Exports</li>
                  <li>✓ Agency Client Pitch Deck</li>
                </ul>
              </div>
              <button 
                onClick={() => alert("Redirecting to Secure Gateway for ₹2,499 6-Month Subscription...")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 rounded-lg transition shadow"
              >
                {planType === "6months" ? "Current Active Plan" : "Upgrade 6-Months"}
              </button>
            </div>

            {/* PRO ANNUAL */}
            <div className="bg-slate-950 border border-amber-500/80 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded uppercase border border-amber-800">Best Value</span>
                <h4 className="text-base font-bold text-white mt-2">Pro Annual</h4>
                <div className="text-2xl font-black text-amber-400 my-1">₹4,499 <span className="text-xs text-slate-500 font-normal">/ year</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
                  <li>✓ Full Enterprise Suite Access</li>
                  <li>✓ Unlimited Client PDF Downloads</li>
                  <li>✓ Dedicated Agency Growth Manager</li>
                  <li>✓ Lifetime Feature Updates</li>
                </ul>
              </div>
              <button 
                onClick={() => alert("Redirecting to Secure Gateway for ₹4,499 Annual Subscription...")}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs py-2.5 rounded-lg transition shadow"
              >
                {planType === "annual" ? "Current Active Plan" : "Upgrade Yearly"}
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-900">
        © ClipToPosts Enterprise AI Growth Suite. User Dashboard.
      </footer>
    </div>
  );
}
