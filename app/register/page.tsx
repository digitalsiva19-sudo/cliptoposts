"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    whatsapp: "",
    website: "",
    location: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Save detailed info into profiles table
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            username: formData.fullName,
            full_name: formData.fullName,
            business_name: formData.businessName,
            email: formData.email,
            whatsapp_number: formData.whatsapp,
            website: formData.website,
            location: formData.location,
            role: "user",
          },
        ]);

        if (profileError) console.error("Profile saving error:", profileError);

        // 3. Create default Free Subscription
        await supabase.from("subscriptions").insert([
          {
            user_id: authData.user.id,
            plan_name: "Free Plan",
            generations_limit: 3,
            generations_used: 0,
            price: 0,
          },
        ]);

        alert("Registration Successful! Welcome aboard.");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Start your 3 Free Trials
          </h2>
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs p-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Siva Kumar"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              placeholder="e.g. SEO Mynds Media"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Work Email *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number *</label>
            <input
              type="tel"
              name="whatsapp"
              required
              placeholder="+91 99999 99999"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Website (Optional)</label>
            <input
              type="url"
              name="website"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Visakhapatnam, AP"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password *</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Start Free Trial"}
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500 leading-relaxed">
          By starting your trial, you agree to our{" "}
          <span className="text-slate-400 underline">Terms of Service</span> and{" "}
          <span className="text-slate-400 underline">Privacy Policy</span>.
        </p>

      </div>
    </div>
  );
}
