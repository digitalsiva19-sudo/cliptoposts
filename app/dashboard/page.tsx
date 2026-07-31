"use client";
import { useState } from "react";
import Link from "next/link";

export default function CustomerDashboard() {
  const [user] = useState({
    name: "Customer",
    email: "user@cliptoposts.in",
    plan: "Pro Plan (₹399/mo)",
    credits: "Unlimited 🔥",
    joinedDate: "July 2026",
  });

  const [history] = useState([
    {
      id: 1,
      url: "https://youtube.com/watch?v=sample1",
      date: "31 July 2026",
      type: "LinkedIn & Twitter Posts",
    },
    {
      id: 2,
      url: "https://youtube.com/watch?v=sample2",
      date: "30 July 2026",
      type: "Reel Script (Telugu)",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            ClipToPosts
          </Link>
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition">
            ➕ Generate New Posts
          </Link>
        </div>

        {/* User Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Current Plan</h3>
            <p className="text-2xl font-bold text-amber-400 mt-2">{user.plan}</p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Available Credits</h3>
            <p className="text-2xl font-bold text-indigo-400 mt-2">{user.credits}</p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Account Status</h3>
            <p className="text-2xl font-bold text-emerald-400 mt-2">Active ✅</p>
          </div>
        </div>

        {/* Repurpose History Table */}
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h2 className="text-xl font-bold text-white">Your Past Content Generations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-4 rounded-l-xl">YouTube Link</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Generated Date</th>
                  <th className="p-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-mono text-indigo-300">{item.url}</td>
                    <td className="p-4">{item.type}</td>
                    <td className="p-4 text-slate-400">{item.date}</td>
                    <td className="p-4">
                      <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-white">
                        View Posts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
