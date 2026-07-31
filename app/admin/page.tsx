"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [users] = useState([
    { id: 1, name: "Siva", email: "siva@gmail.com", plan: "Pro", status: "Active", revenue: "₹399" },
    { id: 2, name: "User 2", email: "user2@gmail.com", plan: "Free Trial", status: "Expired", revenue: "₹0" },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400">⚡ ClipToPosts Super Admin Panel</h1>
            <p className="text-slate-400 text-sm">Owner Analytics & Platform Controls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-sm">Total Revenue</h3>
            <p className="text-3xl font-bold text-emerald-400 mt-1">₹12,768</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-sm">Total Active Pro Users</h3>
            <p className="text-3xl font-bold text-indigo-400 mt-1">32 Users</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-sm">Free Trial Conversions</h3>
            <p className="text-3xl font-bold text-sky-400 mt-1">18.4%</p>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">User Management & Status</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/50 text-sm">
                  <td className="p-3 font-semibold">{u.name}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3"><span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">{u.plan}</span></td>
                  <td className="p-3 text-emerald-400 font-bold">{u.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
