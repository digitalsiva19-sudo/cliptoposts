import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL or Business Name is required", noCreditReduction: true }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured in Vercel settings", noCreditReduction: true }, { status: 500 });
    }

    // 1. Clean Domain Extraction
    let cleanUrl = inputUrl.trim();
    const domainName = cleanUrl.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0];

    // 2. Fetch Metadata safely
    let scrapedMetadata = "";
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }

    try {
      const fetchRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const metaData = await fetchRes.json();
      if (metaData.status === "success" && metaData.data) {
        scrapedMetadata = `Title: ${metaData.data.title || ""}, Description: ${metaData.data.description || ""}`;
      }
    } catch (e) {
      console.log("Microlink fetch fallback");
    }

    // 3. Clean Prompt Construction
    const promptText = `
You are a social media growth expert.
Target Brand / Domain: ${domainName}
Scraped Info: ${scrapedMetadata || "None"}

Instructions:
1. Infer the business category based on domain '${domainName}' or metadata. (e.g., if domain contains 'vedaswaram' or related terms, focus on Vedic astrology, rituals, mantras, and devotional services).
2. Generate highly engaging, human-style content specifically for the platform: ${platform.toUpperCase()}.

Content Requirements for ${platform.toUpperCase()}:
- If INSTAGRAM: Viral Hook, Caption with Emojis, 15-Sec Reel Script, Relevant Hashtags, Best Posting Time.
- If LINKEDIN: Professional Headline, Article/Post Body, Discussion Question, Hashtags, Best Posting Time.
- If FACEBOOK: Catchy Community Hook, Lead Gen Copy with Call-to-action, Hashtags, Best Posting Time.
- If TWITTER: 5-Tweet Viral Thread (1/5 to 5/5 format), Hashtags, Best Posting Time.
- If YOUTUBE: 5 Short Video Ideas, 60-Sec Short Video Script (Hook, Body, CTA), SEO Title, Description, Tags, Best Upload Time.

Do NOT generate generic templates. Tailor the content directly to this specific domain/business.
`;

    // 4. API Request Body Formation
    const payload = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ]
    };

    // Updated Model Name to gemini-2.0-flash / gemini-1.5-flash-latest
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini API Status Error:", geminiData);
      return NextResponse.json({ 
        error: geminiData?.error?.message || "Gemini API Error. Check your API key or quota.", 
        noCreditReduction: true 
      }, { status: 500 });
    }

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json({ 
        error: "Gemini did not return text. Please try again.", 
        noCreditReduction: true 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: generatedText });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error", 
      noCreditReduction: true 
    }, { status: 500 });
  }
}
