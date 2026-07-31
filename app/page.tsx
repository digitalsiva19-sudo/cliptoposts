"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional & Bold");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!url) return alert("Please enter YouTube URL!");
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
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      alert("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-indigo-400">ClipToPosts</h1>
        <p className="text-slate-400">Turn Any YouTube Video into 15+ Social Media Posts</p>
      </div>

      {/* Input Box */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 shadow-lg">
        <input
          type="text"
          placeholder="Paste YouTube Link here (e.g., https://www.youtube.com/watch?v=...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
            >
              <option value="English">English</option>
              <option value="Natural Telugu">Natural Telugu</option>
              <option value="Tanglish (Telugu + English)">Tanglish</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Brand Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
            >
              <option value="Professional & Bold">Professional & Bold</option>
              <option value="Storytelling & Casual">Storytelling & Casual</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition duration-200"
        >
          {loading ? "⚡ Generating Content..." : "🚀 Repurpose Content"}
        </button>
      </div>

      {/* Output Results */}
      {results && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-emerald-400">Your AI Generated Content:</h2>
          
          {results.linkedin && (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h3 className="text-indigo-400 font-bold mb-3">📄 LinkedIn Posts</h3>
              {results.linkedin.map((post: string, i: number) => (
                <div key={i} className="bg-slate-900 p-4 rounded-lg mb-3 whitespace-pre-line text-slate-300">
                  {post}
                </div>
              ))}
            </div>
          )}

          {results.twitter && (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h3 className="text-sky-400 font-bold mb-3">🐤 Twitter Thread</h3>
              {results.twitter.map((tweet: string, i: number) => (
                <div key={i} className="bg-slate-900 p-3 rounded-lg mb-2 text-slate-300">
                  {tweet}
                </div>
              ))}
            </div>
          )}

          {results.reels && (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h3 className="text-pink-400 font-bold mb-3">🎬 Reel / Short Scripts</h3>
              {results.reels.map((script: string, i: number) => (
                <div key={i} className="bg-slate-900 p-4 rounded-lg mb-3 whitespace-pre-line text-slate-300">
                  {script}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional & Bold");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url) return alert("Please enter YouTube URL!");
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
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      alert("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              ClipToPosts
            </span>
          </div>
          <button 
            onClick={() => alert("Payment Gateway setup next step lo edustham!")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition shadow-lg shadow-orange-500/20"
          >
            ⭐ Upgrade to Pro (₹399/mo)
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Turn Any YouTube Video into 15+ Social Posts
          </h1>
          <p className="text-slate-400 text-lg">
            Generate LinkedIn posts, Twitter threads, and Reel scripts in English, Telugu, and Tanglish in seconds.
          </p>
        </div>

        {/* Input Box */}
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
              <span>🚀 Repurpose Content Now</span>
            )}
          </button>
        </div>

        {/* Output Results */}
        {results && (
          <div className="space-y-8 pt-4">
            <h2 className="text-2xl font-bold text-emerald-400 flex items-center space-x-2">
              <span>✨ Generated Content</span>
            </h2>

            {/* LinkedIn */}
            {results.linkedin && (
              <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="text-xl font-bold text-indigo-400 flex items-center justify-between">
                  <span>📄 LinkedIn Posts</span>
                </h3>
                {results.linkedin.map((post: string, i: number) => {
                  const id = `linkedin-${i}`;
                  return (
                    <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative group space-y-3">
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

            {/* Twitter */}
            {results.twitter && (
              <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="text-xl font-bold text-sky-400">🐤 Twitter Thread</h3>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Full Thread</span>
                    <button
                      onClick={() => copyToClipboard(results.twitter.join("\n\n"), "twitter-all")}
                      className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition"
                    >
                      {copiedIndex === "twitter-all" ? "✅ Copied All!" : "📋 Copy Full Thread"}
                    </button>
                  </div>
                  {results.twitter.map((tweet: string, i: number) => (
                    <div key={i} className="p-3 bg-slate-900 rounded-xl text-slate-300 text-sm">
                      {tweet}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reels */}
            {results.reels && (
              <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="text-xl font-bold text-pink-400">🎬 Reel / Short Scripts</h3>
                {results.reels.map((script: string, i: number) => {
                  const id = `reel-${i}`;
                  return (
                    <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Script #{i + 1}</span>
                        <button
                          onClick={() => copyToClipboard(script, id)}
                          className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition"
                        >
                          {copiedIndex === id ? "✅ Copied!" : "📋 Copy Script"}
                        </button>
                      </div>
                      <p className="whitespace-pre-line text-slate-300 leading-relaxed">{script}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
