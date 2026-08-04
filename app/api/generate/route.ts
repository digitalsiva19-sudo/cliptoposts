import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL or Business Name is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured in Vercel" }, { status: 500 });
    }

    // 1. Safe Fetch Website Metadata as Fallback
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

    // 2. Intelligent Prompt based on limited context
    const prompt = `
You are an expert Social Media & Digital Marketing Strategist.
Target Business / Website: ${inputUrl}
Website Metadata (Scraped): ${scrapedMetadata || "Directly infer business from name."}

Task: Generate extremely specific, human-curated, highly engaging social media content for "${platform.toUpperCase()}".

Platform Specific Requirements:
- If INSTAGRAM: Provide Viral Hook, engaging human-style Caption, 15-Sec Reel Script (0-15s breakdown), Niche Hashtags, and Best Post Time.
- If LINKEDIN: Provide professional Headline, B2B Thought Leadership Post Body, Engagement Question, Hashtags, and Best Post Time.
- If FACEBOOK: Provide catchy Community Hook, Lead Generation Copy with Offer & Call To Action, Hashtags, and Best Post Time.
- If TWITTER: Provide a 5-Tweet Viral Thread (1/5 to 5/5 format), Hashtags, and Best Post Time.
- If YOUTUBE: Provide 5 Viral Short Video Ideas, 60-Second Video Script (Hook, Body, CTA), SEO Title, Description, Tags, and Best Time to Upload.

CRITICAL: Since the scraped content is very limited, you MUST analyze the nature of the business based on the URL name and metadata. Create an extremely detailed, high-converting post specifically tailored to what this type of business does. Do NOT use generic templates. Focus on delivering maximum value and engagement.
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

    // Check if Gemini returned text
    if (!generatedText) {
      // Return a special error that front-end understands so it does not reduce credits
      return NextResponse.json({ error: "Gemini failed to generate content due to limited website data.", noCreditReduction: true }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: generatedText });

  } catch (error: any) {
    console.error(error);
    // Generic error: default behavior should not reduce credits either
    return NextResponse.json({ error: error.message || "Server Error", noCreditReduction: true }, { status: 500 });
  }
}
