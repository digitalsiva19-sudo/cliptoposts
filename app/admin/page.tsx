"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type UserData = {
  id: string;
  email: string;
  plan?: string;
  created_at?: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase.from("users").select("*");
        if (data) {
          setUsers(data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const totalProUsers = users.filter((u) => u.plan?.includes("Pro")).length;
  const totalRevenue = totalProUsers * 399;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400">
              ⚡ ClipToPosts Super Admin Panel
            </h1>
            <p className="text-slate-400 text-sm">
              Owner Analytics & Platform Controls
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-sm">Total Revenue</h3>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-sm">Total Active Pro Users</h3>
            <p className="text-3xl font-bold text-indigo-400 mt-1">
              {totalProUsers} Users
            </p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-sm">Total Registered Users</h3>
            <p className="text-3xl font-bold text-sky-400 mt-1">
              {users.length} Users
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-4">
            User Management & Status
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading database records...</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-3">Email</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500 text-sm">
                      No users found in database yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-800/50 text-sm hover:bg-slate-800/30"
                    >
                      <td className="p-3 font-semibold text-slate-200">
                        {u.email}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.plan?.includes("Pro")
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {u.plan || "Free Trial"}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold text-xs">
                        Active
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
