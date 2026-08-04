import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL or Business Name is required", noCreditReduction: true }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Clean Domain & Brand Name Extraction
    let cleanUrl = inputUrl.trim();
    const domainName = cleanUrl.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
    const brandName = domainName.split(".")[0].toUpperCase();

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
      console.log("Scraping fallback used");
    }

    // 3. Dynamic Image Topic Generation based on Business Name / URL Analysis
    let imageTopic = `${domainName} professional social media modern design 4k`;
    if (domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja") || domainName.includes("astro") || domainName.includes("bhakti")) {
      imageTopic = "sacred indian vedic pooja divine spiritual glow golden aura aesthetic 4k";
    } else if (domainName.includes("kids") || domainName.includes("education")) {
      imageTopic = "vibrant modern education study learning students workspace 4k";
    } else if (domainName.includes("realestate") || domainName.includes("property")) {
      imageTopic = "luxury modern architectural building real estate exterior 4k";
    }

    const encodedPrompt = encodeURIComponent(`${imageTopic}, high resolution, social media post visual banner`);
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true`;

    // 4. Universal & Deep Analysis Prompt for Gemini
    const promptText = `
You are an elite Social Media Growth Strategist and Content Creator.
Target Business Name or URL: ${inputUrl} (Extracted Domain: ${domainName})
Scraped Website Data: ${scrapedMetadata || "Direct Domain Inference"}
Requested Platform: ${platform.toUpperCase()}

TASK:
1. Deeply analyze the input '${inputUrl}'. Determine the exact industry category (e.g., Spiritual/Devotional, Digital Marketing, Education, E-Commerce, Real Estate, Health, Finance, Food/Restaurant, etc.).
2. Adapt the language tone and content 100% specifically to what this business actually does. Use a mix of English and regional context (like Telugu/English blend if Indian/Devotional context) to make it highly engaging and human-curated.

3. Format the final output cleanly for ${platform.toUpperCase()} into TWO DISTINCT SECTIONS:

--------------------------------------------------
📸 PART 1: SOCIAL MEDIA POST (STATIC / CAROUSEL POST)
• POST TITLE / HOOK:
• POST CAPTION / DESCRIPTION:
• KEYWORDS:
• HASHTAGS:

--------------------------------------------------
🎬 PART 2: SHORT VIDEO / REEL / SHORTS SCRIPT
• VIDEO TITLE:
• VIDEO DESCRIPTION:
• COMPLETE SCRIPT (0-15s / 0-60s with Hook, Value Body & CTA):
• VIDEO KEYWORDS:
• VIDEO HASHTAGS:
• BEST TIME TO POST ON ${platform.toUpperCase()}:
--------------------------------------------------

CRITICAL REQUIREMENT:
Analyze the business accurately. DO NOT output generic marketing templates unless the business is an actual digital marketing agency.
`;

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
              break;
            }
          }
        } catch (err) {
          console.log(`Failed candidate: ${endpoint}`);
        }
      }
    }

    // 5. Intelligent Fallback Generator if Gemini API is unreachable
    if (!generatedText) {
      if (domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja") || domainName.includes("astro")) {
        generatedText = `📸 PART 1: SOCIAL MEDIA POST (${platform.toUpperCase()})

• POST TITLE / HOOK:
"మీ ఇంట్లో శాంతి, ఐశ్వర్యం కొరకు పవిత్ర వేద మంత్రాల విశిష్టత! 🕉️"

• POST CAPTION / DESCRIPTION:
వేద స్వరం ద్వారా మీ ఇంట్లో అనుకూల శక్తిని (Positive Energy) నింపండి. పురాతన వేద మంత్రాలు మరియు నియమబద్ధమైన పూజా విధానాలు మీ జీవితంలోని అడ్డంకులను తొలగించి, ప్రశాంతతను అందిస్తాయి.

1️⃣ నిత్య పారాయణం & వేద శ్లోకాల ప్రాముఖ్యత
2️⃣ దోష నివారణ పూజలు & పండితుల ఆధ్యాత్మిక సలహాలు
3️⃣ మంత్రోచ్ఛారణల ద్వారా గృహ శాంతి

మరిన్ని పవిత్ర ఆధ్యాత్మిక వివరాలకు & పూజా సేవలకు ${cleanUrl} సందర్శించండి. 🌺

• KEYWORDS:
వేద మంత్రాలు, గృహ పూజలు, ఆధ్యాత్మిక సలహాలు, Veda Mantras, Vedic Pooja Services, Spiritual Peace, Hindu Rituals

• HASHTAGS:
#Vedaswaram #DevotionalVibes #VedicMantras #PoojaServices #BhaktiSangeet #SpiritualGrowth

--------------------------------------------------
🎬 PART 2: SHORT VIDEO / REEL / SHORTS SCRIPT

• VIDEO TITLE:
"ఈ పవిత్ర వేద మంత్రం మీ ఇంటి వాతావరణాన్ని ఎలా మారుస్తుందో చూడండి! 🕉️"

• VIDEO DESCRIPTION:
ఇంట్లో ప్రతికూల శక్తి తొలగిపోయి లక్ష్మీదేవి అనుగ్రహం కలగడానికి వేద మంత్రాల విశిష్టతను తెలుసుకోండి. Full details at ${cleanUrl}.

• COMPLETE SCRIPT (0-15s):
• [0-3s Hook]: [పవిత్రమైన వేద మంత్ర ధ్వని] "మీ ఇంట్లో ఎప్పుడూ నిరాశ లేదా ఒత్తిడి అనిపిస్తోందా?"
• [3-10s Body]: "ప్రతిరోజూ ఉదయం వేద స్వరాల కంపనాలు మీ ఇంటి వాతావరణంలో ఉన్న నకారాత్మక శక్తిని పూర్తిగా తొలగిస్తాయి."
• [10-15s CTA]: "మరిన్ని వేద సూక్తులు & సేవలకు పైన ఉన్న లింక్ ద్వారా ${cleanUrl} ని సందర్శించండి!"

• VIDEO KEYWORDS:
Vedic Chant Shorts, Devotional Reel Script, House Pooja Tips, Mantra Benefits

• VIDEO HASHTAGS:
#VedaSwaramReels #SpiritualShorts #MantraPower #DevotionalShorts

• BEST TIME TO POST ON ${platform.toUpperCase()}:
• Devotional Peak Hours: 6:00 AM – 8:30 AM (Morning)`;
      } else {
        generatedText = `📸 PART 1: SOCIAL MEDIA POST (${platform.toUpperCase()})

• POST TITLE / HOOK:
"Scale Your Brand Faster with ${brandName} in 2026 👇"

• POST CAPTION / DESCRIPTION:
Looking for genuine growth? At ${brandName}, we provide custom solutions tailored to your market needs:

1️⃣ High Quality Service & Customer First Approach
2️⃣ Strategic Brand Positioning
3️⃣ High-Converting Lead Funnels

Save this post and visit ${cleanUrl} to learn more today! 🚀

• KEYWORDS:
${brandName}, Business Growth, Digital Solutions, Marketing Strategy, Brand Success

• HASHTAGS:
#${brandName} #BusinessGrowth #BrandSuccess #Innovation2026

--------------------------------------------------
🎬 PART 2: SHORT VIDEO / REEL / SHORTS SCRIPT

• VIDEO TITLE:
"How ${brandName} Helps You Achieve 10X Better Results"

• VIDEO DESCRIPTION:
Stop relying on outdated methods. Here is how ${brandName} scales your reach.

• COMPLETE SCRIPT (0-15s):
• [0-3s Hook]: "Struggling to get consistent results for your brand?"
• [3-10s Body]: "Here is how ${brandName} simplifies the process and maximizes your impact..."
• [10-15s CTA]: "Visit ${cleanUrl} or click the link in bio to learn more!"

• VIDEO KEYWORDS:
Growth Tips, Brand Strategy, ${brandName} Short

• VIDEO HASHTAGS:
#${brandName}Shorts #ViralGrowth #BusinessStrategy

• BEST TIME TO POST ON ${platform.toUpperCase()}:
• Peak Hours: 6:00 PM – 8:30 PM (Evening)`;
      }
    }

    return NextResponse.json({ 
      success: true, 
      text: generatedText, 
      imageUrl: generatedImageUrl 
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error", 
      noCreditReduction: true 
    }, { status: 500 });
  }
}
