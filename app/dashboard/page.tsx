"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState("Free Trial");
  const [credits, setCredits] = useState<number | string>(3);

  useEffect(() => {
    async function getUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setUserEmail(user.email);

          // Fetch user info from database
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          if (data) {
            setUserPlan(data.plan || "Free Trial");
            setCredits(data.credits ?? 3);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            ClipToPosts
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20">
              ➕ Generate New Posts
            </Link>
          </div>
        </div>

        {/* User Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Logged In User</h3>
            <p className="text-lg font-bold text-slate-200 mt-2 truncate">
              {loading ? "Loading..." : userEmail || "Guest User"}
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Plan</h3>
            <p className="text-2xl font-bold text-amber-400 mt-2">
              {loading ? "..." : userPlan}
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Available Credits</h3>
            <p className="text-2xl font-bold text-indigo-400 mt-2">
              {loading ? "..." : `${credits} Credits`}
            </p>
          </div>
        </div>

        {/* Upgrade Pro Plan Card */}
        {userPlan === "Free Trial" && (
          <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-500/40 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Upgrade to Pro Plan (₹399/mo)</h3>
              <p className="text-xs text-slate-300 mt-1">Get unlimited AI post generations and priority processing speed.</p>
            </div>
            <form action="/api/payu" method="POST">
              <input type="hidden" name="email" value={userEmail || ""} />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-lg whitespace-nowrap"
              >
                ⚡ Upgrade Now (₹399)
              </button>
            </form>
          </div>
        )}

        {/* Repurpose History Table */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Your Past Content Generations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-4 rounded-l-xl">YouTube Link</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/50">
                  <td className="p-4 font-mono text-indigo-300">https://youtube.com/watch?v=sample1</td>
                  <td className="p-4">LinkedIn & Twitter Posts</td>
                  <td className="p-4 text-emerald-400 font-bold text-xs">Completed ✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
