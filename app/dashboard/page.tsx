"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState({
    username: "Customer",
    planName: "Free Plan",
    price: 0,
    daysLeft: 0,
    generationsLimit: 5,
    generationsUsed: 0,
  });

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Fetch Subscription
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (sub) {
          const expires = new Date(sub.expires_at);
          const now = new Date();
          const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 3600 * 24));

          setUserPlan({
            username: profile?.username || user.email?.split("@")[0] || "Customer",
            planName: sub.plan_name,
            price: sub.price,
            daysLeft: diffDays > 0 ? diffDays : 0,
            generationsLimit: sub.generations_limit,
            generationsUsed: sub.generations_used,
          });
        }
      }
      setLoading(false);
    }

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome Back, {userPlan.username}!</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your active subscription and usage credits</p>
          </div>
          <Link href="/" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl">
            Go to AI Generator
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading Your Dashboard...</div>
        ) : (
          <>
            {/* Subscription Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <p className="text-xs text-slate-400">Current Plan</p>
                <h3 className="text-xl font-black text-indigo-400">{userPlan.planName}</h3>
                <p className="text-xs text-slate-500">₹{userPlan.price} / Month</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <p className="text-xs text-slate-400">Subscription Validity</p>
                <h3 className="text-xl font-black text-emerald-400">{userPlan.daysLeft} Days Left</h3>
                <p className="text-xs text-slate-500">Active validity</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <p className="text-xs text-slate-400">Generations Remaining</p>
                <h3 className="text-xl font-black text-pink-400">
                  {Math.max(0, userPlan.generationsLimit - userPlan.generationsUsed)} / {userPlan.generationsLimit}
                </h3>
                <p className="text-xs text-slate-500">Resets on renewal</p>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Generations Usage</span>
                <span className="text-indigo-400 font-bold">{userPlan.generationsUsed} used out of {userPlan.generationsLimit}</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (userPlan.generationsUsed / userPlan.generationsLimit) * 100)}%` }}
                ></div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
