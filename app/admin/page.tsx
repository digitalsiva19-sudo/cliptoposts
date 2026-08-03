"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  // Demo Stats (Supabase డాటాతో కనెక్ట్ చేయడానికి)
  const [stats] = useState({
    totalUsers: 124,
    liveUsers: 8,
    totalRevenue: 61876, // INR
    activeSubscriptions: 42,
    totalGenerations: 1450,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Admin Control Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage users, live status, subscriptions & revenue</p>
          </div>
          <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-300">
            Exit Admin
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold">Total Users Registered</p>
            <p className="text-2xl font-bold text-white mt-2">👥 {stats.totalUsers}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold">Live / Active Users</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">🟢 {stats.liveUsers} Online</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-indigo-400 mt-2">₹ {stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold">Auto-Subscriptions</p>
            <p className="text-2xl font-bold text-purple-400 mt-2">🔄 {stats.activeSubscriptions}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold">Total Generations</p>
            <p className="text-2xl font-bold text-pink-400 mt-2">⚡ {stats.totalGenerations}</p>
          </div>
        </div>

        {/* Customer Overview Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Registered Customers Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Plan Status</th>
                  <th className="p-3">Generations Used</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold text-indigo-300">siva_user</td>
                  <td className="p-3">user@example.com</td>
                  <td className="p-3"><span className="bg-indigo-950 text-indigo-400 px-2 py-1 rounded-md">Pro Plan (₹499)</span></td>
                  <td className="p-3">34 / 100</td>
                  <td className="p-3"><span className="text-emerald-400 font-bold">🟢 Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
