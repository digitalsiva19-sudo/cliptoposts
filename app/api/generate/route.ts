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

    // 1. Try Fetching Website Metadata
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
      console.log("Scraping fallback triggered");
    }

    // Extract Domain Name for Gemini context when scraping fails
    const domainName = inputUrl.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0];

    // 2. Ultra-Resilient Prompt for Gemini
    const prompt = `
You are an expert Social Media & Digital Marketing Strategist.
Target Business / Website Domain: ${domainName} (Raw Input: ${inputUrl})
Scraped Website Data:
${scrapedMetadata || "None (Scraping was blocked by target server)."}

CRITICAL INSTRUCTION FOR DOMAIN INFERENCE:
Analyze the Domain Name '${domainName}' very carefully.
- If it sounds like devotional/astrology/vedas/pooja (e.g., 'vedaswaram'): Focus entirely on Vedic astrology, Hindu rituals, mantras, pooja services, spiritual wellness, and devotion.
- If it sounds like digital marketing/SEO (e.g., 'seomynds'): Focus on SEO, organic traffic, leads, and digital growth.
- If it sounds like education/kids (e.g., 'kidseducationhub'): Focus on nursery to 10th school exams, IIT/JEE, and EAMCET prep.

Task: Generate 100% relevant, highly engaging social media content for "${platform.toUpperCase()}".

Platform Specific Output Format:
- If INSTAGRAM: Provide a Viral Hook, Human-style Telugu/English blended Caption, 15-Sec Reel Script (0-15s breakdown), Niche Hashtags, and Best Time to Post.
- If LINKEDIN: Provide a B2B Professional Headline, Thought Leadership Post Body, Engagement Question, Hashtags, and Best Time to Post.
- If FACEBOOK: Provide a Catchy Community Hook, Lead Generation Copy with Offer & Call To Action, Hashtags, and Best Time to Post.
- If TWITTER: Provide a 5-Tweet Viral Thread (1/5 to 5/5 format), Hashtags, and Best Time to Post.
- If YOUTUBE: Provide 5 Viral Short Video Ideas, 60-Second Short Video Script (Hook, Body, CTA), SEO Title, Description, Tags, and Best Time to Upload.

Do NOT output generic marketing templates. Custom-tailor all text specifically to their exact business domain inferred from the domain name or scraped metadata.
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
      return NextResponse.json({ 
        error: "Gemini API failed to parse prompt. Please try again.", 
        noCreditReduction: true 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: generatedText });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      error: error.message || "Server Error", 
      noCreditReduction: true 
    }, { status: 500 });
  }
}
