"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch Profile for Username
        const { data: profData } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", user.id)
          .single();

        setProfile(profData || { username: user.email?.split("@")[0] });

        // Fetch Subscription Data
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setSubscription(subData);
      }
      setLoading(false);
    }

    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-sm text-slate-400">Loading your dashboard...</p>
      </div>
    );
  }

  const remaining = subscription 
    ? Math.max(0, subscription.generations_limit - subscription.generations_used)
    : 5;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back, {profile?.username || "Customer"}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your active subscription and usage credits
            </p>
          </div>
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg"
          >
            Go to AI Generator
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Plan</span>
            <h3 className="text-2xl font-black text-indigo-400">
              {subscription?.plan_name || "Free Plan"}
            </h3>
            <p className="text-xs text-slate-500">₹{subscription?.price || 0} / Month</p>
          </div>

          {/* Status */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Subscription Validity</span>
            <h3 className="text-2xl font-black text-emerald-400">Active</h3>
            <p className="text-xs text-slate-500">Resets monthly</p>
          </div>

          {/* Generations Remaining */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Generations Remaining</span>
            <h3 className="text-2xl font-black text-pink-400">
              {remaining} / {subscription?.generations_limit || 5}
            </h3>
            <p className="text-xs text-slate-500">Credits available</p>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Generations Usage</span>
            <span className="text-indigo-400">
              {subscription?.generations_used || 0} used out of {subscription?.generations_limit || 5}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  ((subscription?.generations_used || 0) / (subscription?.generations_limit || 5)) * 100
                )}%`,
              }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
