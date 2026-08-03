"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAndFetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user is Admin
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (prof?.role === "admin") {
          setIsAdmin(true);

          // Fetch all profiles along with their subscription credits
          const { data: allProfiles } = await supabase
            .from("profiles")
            .select(`
              *,
              subscriptions (
                plan_name,
                generations_limit,
                generations_used
              )
            `);

          setProfiles(allProfiles || []);
        }
      }
      setLoading(false);
    }

    checkAdminAndFetchData();
  }, []);

  const handleUpdateCredits = async (userId: string, currentLimit: number) => {
    const newLimit = prompt("Enter new Credits Limit:", currentLimit.toString());
    if (!newLimit) return;

    const limitNum = parseInt(newLimit, 10);
    if (isNaN(limitNum)) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({ generations_limit: limitNum })
      .eq("user_id", userId);

    if (error) {
      alert("Error updating credits: " + error.message);
    } else {
      alert("Credits updated successfully!");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-sm text-slate-400">Checking Admin Authorization...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans space-y-4">
        <h1 className="text-2xl font-bold text-red-400">🚫 Access Denied</h1>
        <p className="text-xs text-slate-400">You do not have Admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              ClipToPosts - Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400">Manage all registered users & subscriptions</p>
          </div>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-3 py-1 rounded-xl font-bold">
            Admin Active
          </span>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Business / WhatsApp</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Current Plan</th>
                  <th className="p-4 font-semibold">Credits Used</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profiles.map((p) => {
                  const sub = Array.isArray(p.subscriptions) ? p.subscriptions[0] : p.subscriptions;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-white">{p.full_name || p.username || "N/A"}</div>
                        <div className="text-[11px] text-slate-400">{p.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-200">{p.business_name || "-"}</div>
                        <div className="text-[11px] text-indigo-400">{p.whatsapp_number || "-"}</div>
                      </td>
                      <td className="p-4 text-slate-300">{p.location || "-"}</td>
                      <td className="p-4">
                        <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md font-semibold">
                          {sub?.plan_name || "Free"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-pink-400">
                          {sub?.generations_used || 0} / {sub?.generations_limit || 5}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleUpdateCredits(p.id, sub?.generations_limit || 5)}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          ✏️ Edit Credits
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
