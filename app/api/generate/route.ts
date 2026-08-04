import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL or Business Name is required", noCreditReduction: true }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Clean Domain Extraction
    let cleanUrl = inputUrl.trim();
    const domainName = cleanUrl.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
    const brandTitle = domainName.split(".")[0].toUpperCase();

    // 2. Try Fetching Metadata safely
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
      console.log("Microlink fetch fallback triggered");
    }

    // 3. Clean Prompt Construction
    const promptText = `
You are an expert social media growth strategist.
Target Brand / Domain: ${domainName}
Scraped Info: ${scrapedMetadata || "None"}

Instructions:
1. Infer the business category based on domain '${domainName}' or metadata. 
   - If domain contains 'vedaswaram', 'vedas', 'pooja', 'astro', 'bhakti' or spiritual terms: Focus strictly on Vedic astrology, Hindu rituals, mantras, pooja services, and devotional guidance.
   - If domain contains 'seo', 'marketing', 'agency': Focus strictly on SEO, leads, and business growth.
   - For all other domains: Tailor content directly to that specific niche.

2. Generate highly engaging, human-style content specifically for the platform: ${platform.toUpperCase()}.

Content Requirements for ${platform.toUpperCase()}:
- If INSTAGRAM: Viral Hook, Human Caption with Emojis, 15-Sec Reel Script (0-15s breakdown), Niche Hashtags, Best Posting Time.
- If LINKEDIN: Professional B2B Headline, Article/Post Body, Engagement Question, Hashtags, Best Posting Time.
- If FACEBOOK: Catchy Community Hook, Lead Gen Copy with Call-to-action, Hashtags, Best Posting Time.
- If TWITTER: 5-Tweet Viral Thread (1/5 to 5/5 format), Hashtags, Best Posting Time.
- If YOUTUBE: 5 Short Video Ideas, 60-Sec Short Video Script (Hook, Body, CTA), SEO Title, Description, Tags, Best Upload Time.

Do NOT generate generic digital marketing templates if the domain is not marketing. Tailor the content directly to this specific business domain.
`;

    // 4. Try Google Gemini API with multiple candidate model names
    let generatedText = null;

    if (apiKey) {
      const modelCandidates = [
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
      ];

      for (const endpoint of modelCandidates) {
        try {
          const geminiRes = await fetch(`${endpoint}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }]
            })
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const textResult = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResult) {
              generatedText = textResult;
              break; // Success! Exit loop
            }
          }
        } catch (err) {
          console.log(`Failed model candidate: ${endpoint}`);
        }
      }
    }

    // 5. Intelligent Fallback Generator if API fails/is unavailable
    if (!generatedText) {
      if (domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja") || domainName.includes("astro")) {
        generatedText = `🕉️ VEDASWARAM DEVOTIONAL & VEDIC CONTENT PACKAGE (${platform.toUpperCase()})

🎯 VIRAL HOOK:
"మీ ఇంట్లో మానసిక ప్రశాంతత మరియు ఐశ్వర్యం కొరకు వేద మంత్రాల విశిష్టత తెలుసుకోండి! 👇"

📝 CAPTION & DEVOTIONAL STORY:
వేద స్వరం ద్వారా మీ గృహంలో అనుకూల శక్తిని (Positive Energy) నింపండి. పురాతన వేద మంత్రాలు మరియు పవిత్ర పూజా విధానాలు మీ జీవితంలో ఎదురయ్యే అడ్డంకులను తొలగించడంలో సహాయపడతాయి.

1️⃣ నిత్య పారాయణం & శ్లోకాల ప్రాముఖ్యత
2️⃣ దోష నివారణ పూజలు & వేద పండితుల సలహాలు
3️⃣ పవిత్ర మంత్రోచ్చారణల ద్వారా మానసిక ప్రశాంతత

మీ మిత్రులకు, కుటుంబ సభ్యులకు ఈ పవిత్రమైన సమాచారాన్ని షేర్ చేయండి! భక్తి సమాచారం & పూజా సేవలకు ${cleanUrl} ని సందర్శించండి. 🌺

🎬 15-SEC REEL SCRIPT / VIDEO IDEA:
• [0-3s Hook]: [వేద మంత్రోచ్ఛారణ ప్లే అవుతుంది] "మీ గృహంలో శాంతి, సమృద్ధి కలగాలంటే ఈ వేద మంత్రాన్ని రోజు వినండి..."
• [3-10s Value]: "వేద స్వరాల కంపనాలు మీ ఇంటి వాతావరణంలో ఉన్న నకారాత్మక శక్తిని (Negative Energy) తొలగిస్తాయి."
• [10-15s CTA]: "మరిన్ని పవిత్ర విషయాలు & పూజా వివరాల కోసం పైన ఉన్న లింక్ క్లిక్ చేయండి!"

🏷️ HASHTAGS:
#Vedaswaram #DevotionalVibes #VedicMantras #HinduRituals #BhaktiSangeet #PoojaServices

⏰ BEST TIME TO POST:
• Morning Slot: 6:00 AM – 8:00 AM (Devotional Peak Hours)`;
      } else {
        generatedText = `📢 CUSTOM BRAND CONTENT FOR ${brandTitle} (${platform.toUpperCase()})

🎯 ATTENTION HOOK:
"Looking to scale ${brandTitle} effectively in 2026? Here is what you need to know 👇"

📝 CAPTION & DESCRIPTION:
Building a strong online brand presence requires consistency and strategic positioning. Here is how ${brandTitle} delivers value:

1️⃣ High Quality Service & Customer First Approach
2️⃣ Modern Digital Solutions Tailored to Your Need
3️⃣ Proven Track Record of Success

Save this post and visit ${cleanUrl} to learn more today! 🚀

🏷️ HASHTAGS:
#${brandTitle} #BusinessGrowth #DigitalStrategy #Innovation2026

⏰ BEST TIME TO POST:
• Peak Hours: 6:00 PM – 9:00 PM`;
      }
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
