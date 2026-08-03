"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password Change Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");

        // Try getting profile username
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();

        if (prof && prof.username) {
          setDisplayName(prof.username);
        } else {
          // Extract from email
          setDisplayName(user.email ? user.email.split("@")[0] : "Valued Member");
        }

        // Fetch Subscription
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setSubscription(sub);
      }
      setLoading(false);
    }

    getUserData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg("❌ " + error.message);
    } else {
      setPasswordMsg("✅ Password updated successfully!");
      setNewPassword("");
      setTimeout(() => setShowPasswordModal(false), 2000);
    }
    setPasswordLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-sm text-slate-400">Loading Dashboard...</p>
      </div>
    );
  }

  const remaining = subscription
    ? Math.max(0, subscription.generations_limit - subscription.generations_used)
    : 5;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back, {displayName}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as: <span className="text-indigo-300 font-semibold">{userEmail}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition border border-slate-700"
            >
              🔒 Change Password
            </button>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg"
            >
              Go to AI Generator
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Current Plan</span>
            <h3 className="text-xl font-black text-indigo-400">
              {subscription?.plan_name || "Free Plan"}
            </h3>
            <p className="text-xs text-slate-500">₹{subscription?.price || 0} / Month</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Subscription Status</span>
            <h3 className="text-xl font-black text-emerald-400">Active</h3>
            <p className="text-xs text-slate-500">Resets monthly</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Generations Remaining</span>
            <h3 className="text-xl font-black text-pink-400">
              {remaining} / {subscription?.generations_limit || 5}
            </h3>
            <p className="text-xs text-slate-500">Credits available</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
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

        {/* Support Section */}
        <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-900/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Need Help or facing issues?</h4>
            <p className="text-xs text-slate-400 mt-0.5">Contact our support team for instant assistance.</p>
          </div>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap"
          >
            💬 Help & Support
          </a>
        </div>

      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Change Password</h3>

            {passwordMsg && (
              <p className="text-xs p-2.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                {passwordMsg}
              </p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
