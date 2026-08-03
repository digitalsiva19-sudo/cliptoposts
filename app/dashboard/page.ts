"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CustomerDashboard() {
  const [userPlan] = useState({
    username: "Customer",
    planName: "Pro Subscription",
    price: 499,
    daysLeft: 23,
    generationsLimit: 100,
    generationsUsed: 34,
    status: "Active",
  });

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
            <p className="text-xs text-slate-500">Auto-renewal active</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <p className="text-xs text-slate-400">Generations Remaining</p>
            <h3 className="text-xl font-black text-pink-400">
              {userPlan.generationsLimit - userPlan.generationsUsed} / {userPlan.generationsLimit}
            </h3>
            <p className="text-xs text-slate-500">Resets next month</p>
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
              style={{ width: `${(userPlan.generationsUsed / userPlan.generationsLimit) * 100}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
