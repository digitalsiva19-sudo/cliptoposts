"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional & Bold");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(3);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [payLoading, setPayLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedCredits = localStorage.getItem("clip_credits");
    if (savedCredits !== null) {
      setCredits(parseInt(savedCredits, 10));
    } else {
      localStorage.setItem("clip_credits", "3");
    }
  }, []);

  const handleGenerate = async () => {
    if (!url) return alert("Please enter YouTube URL!");

    if (credits <= 0) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url, language, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        const newCredits = credits - 1;
        setCredits(newCredits);
        localStorage.setItem("clip_credits", newCredits.toString());
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      alert("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayUCheckout = async () => {
    setPayLoading(true);
    try {
      const res = await fetch("/api/payu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: "399.00",
          firstname: "Customer",
          email: "customer@cliptoposts.in",
          phone: "9999999999",
          productinfo: "ClipToPosts Pro Subscription",
        }),
      });

      const data = await res.json();
      if (data.success && data.payuData) {
        const { action, ...fields } = data.payuData;

        const form = document.createElement("form");
        form.method = "POST";
        form.action = action;

        Object.keys(fields).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = fields[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Payment initialization failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error initiating payment.");
    } finally {
      setPayLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans relative">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              ClipToPosts
            </span>
            <span className="text-xs bg-slate-800 text-indigo-300 font-bold px-2.5 py-1 rounded-full border border-slate-700">
              ⚡ {credits} Free Credits Left
            </span>
          </div>
          <button 
            onClick={() => setShowPaywall(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition shadow-lg shadow-orange-500/20"
          >
            ⭐ Upgrade to Pro (₹399/mo)
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Turn Any YouTube Video into 15+ Social Posts
          </h1>
          <p className="text-slate-400 text-lg">
            Generate LinkedIn posts, Twitter threads, and Reel scripts in English, Telugu, and Tanglish in seconds.
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-700/80 space-y-5 shadow-2xl">
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">YouTube Video URL</label>
            <input
              type="text"
              placeholder="Paste YouTube Link here (e.g., https://www.youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Target Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Natural Telugu">Natural Telugu</option>
                <option value="Tanglish (Telugu + English)">Tanglish</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Brand Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Professional & Bold">Professional & Bold</option>
                <option value="Storytelling & Casual">Storytelling & Casual</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition duration-200 shadow-lg shadow-indigo-600/30 text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>⚡ Generating Viral Content...</span>
            ) : (
              <span>🚀 Repurpose Content ({credits} Free Left)</span>
            )}
          </button>
        </div>

        {results && (
          <div className="space-y-8 pt-4">
            <h2 className="text-2xl font-bold text-emerald-400 flex items-center space-x-2">
              <span>✨ Generated Content</span>
            </h2>

            {results.linkedin && (
              <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="text-xl font-bold text-indigo-400 flex items-center justify-between">
                  <span>📄 LinkedIn Posts</span>
                </h3>
                {results.linkedin.map((post: string, i: number) => {
                  const id = `linkedin-${i}`;
                  return (
                    <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Post #{i + 1}</span>
                        <button
                          onClick={() => copyToClipboard(post, id)}
                          className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition"
                        >
                          {copiedIndex === id ? "✅ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                      <p className="whitespace-pre-line text-slate-300 leading-relaxed">{post}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="inline-block p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <span className="text-4xl">🚀</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Upgrade to Pro</h3>
              <p className="text-slate-400 text-sm">
                Unlock unlimited YouTube video repurposing with Pro tier.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2">
              <div className="text-amber-400 font-bold text-xl">₹399 / month</div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>✅ Unlimited YouTube Video Repurposing</li>
                <li>✅ Natural Telugu & Tanglish Output</li>
                <li>✅ High-converting LinkedIn & Twitter Posts</li>
                <li>✅ Instant Copy to Clipboard</li>
              </ul>
            </div>
            <button
              onClick={handlePayUCheckout}
              disabled={payLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold py-3.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-orange-500/20 flex items-center justify-center"
            >
              {payLoading ? "Redirecting to PayU..." : "Get Instant Access Now (₹399)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
