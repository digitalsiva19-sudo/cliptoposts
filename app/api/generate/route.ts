import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL or Business Name is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is missing in Vercel settings" }, { status: 500 });
    }

    // 1. Scrape metadata/content from URL
    let scrapedMetadata = "";
    let cleanUrl = inputUrl.trim();
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }

    try {
      const fetchRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const metaData = await fetchRes.json();
      if (metaData.status === "success" && metaData.data) {
        scrapedMetadata = `Title: ${metaData.data.title || ""}\nDescription: ${metaData.data.description || ""}`;
      }
    } catch (e) {
      console.log("Scraping fallback");
    }

    // 2. Intelligent Custom Gemini Prompt
    const prompt = `
You are an expert Social Media & Digital Marketing Strategist.
Target Business / Website: ${inputUrl}
Website Metadata Scraped:
${scrapedMetadata || "Infer domain specifics directly from the name/URL."}

Task: Generate 100% specific, highly relevant social media content for "${platform.toUpperCase()}".

Platform Specific Output Requirements:
- INSTAGRAM: Provide a Viral Hook, Human-style Caption, 15-Sec Reel Script (0-15s breakdown), Niche Hashtags, and Best Time to Post.
- LINKEDIN: Provide a B2B Professional Headline, Thought Leadership Article/Post Body, Engagement Question, Hashtags, and Best Time to Post.
- FACEBOOK: Provide a Catchy Community Hook, Lead Gen Copy with Offer & Call To Action, Hashtags, and Best Time to Post.
- TWITTER: Provide a 5-Tweet Viral Thread (1/5 to 5/5 format), Hashtags, and Best Time to Post.
- YOUTUBE: Provide 5 Viral Short Video Ideas, 60-Second Video Script (Hook, Body, CTA), SEO Title, Description, Tags, and Best Time to Upload.

CRITICAL INSTRUCTION: Analyze what this specific website or business ACTUALLY DOES (e.g., devotional/puja/astrology vs digital marketing vs ecommerce). Do NOT return generic marketing templates. Custom-tailor all text specifically to their exact business domain.
`;

    // 3. Call Real Gemini 1.5 Flash API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const geminiData = await geminiRes.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json({ error: "Gemini API failed to return text" }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: generatedText });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
