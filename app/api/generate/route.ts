import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform, phone, address, services } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL or Business Name is required", noCreditReduction: true }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let cleanUrl = inputUrl.trim();
    const domainName = cleanUrl.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
    const brandName = domainName.split(".")[0].toUpperCase();

    // Fetch Metadata safely
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

    // Universal Prompt for Gemini
    const promptText = `
You are an elite Social Media Growth Strategist and Content Creator.
Target Business Name or URL: ${inputUrl} (Extracted Domain: ${domainName})
Scraped Website Data: ${scrapedMetadata || "Direct Domain Inference"}
Requested Platform: ${platform.toUpperCase()}

TASK:
1. Deeply analyze '${inputUrl}'. Determine the exact industry category.
2. Auto-extract or infer:
   - 4 Key Bullet Services
   - Standard Contact Phone (if provided or construct professional placeholder e.g., +91 98765 43210)
   - Estimated Location/Address (e.g., India / Online Services)

3. Output MUST be formatted into TWO DISTINCT SECTIONS for ${platform.toUpperCase()}:

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

    if (!generatedText) {
      generatedText = `📸 PART 1: SOCIAL MEDIA POST (${platform.toUpperCase()})

• POST TITLE / HOOK:
"Scale Your Brand Faster with ${brandName}!"

• POST CAPTION / DESCRIPTION:
Looking for genuine growth? At ${brandName}, we provide high-converting agency solutions tailored to your business goals.

1️⃣ High Converting Web & Funnel Design
2️⃣ Organic SEO & Lead Strategy
3️⃣ Social Media Management
4️⃣ Paid Ad Campaign Growth

Contact us today at ${phone || "+91 98765 43210"} or visit ${cleanUrl}! 🚀

• KEYWORDS:
${brandName}, Business Growth, Marketing Agency, Digital Solutions

• HASHTAGS:
#${brandName} #BusinessAgency #DigitalMarketing #BrandGrowth

--------------------------------------------------
🎬 PART 2: SHORT VIDEO / REEL / SHORTS SCRIPT

• VIDEO TITLE:
"Why ${brandName} is Your Best Choice"

• VIDEO DESCRIPTION:
Stop relying on outdated marketing methods. Here is how ${brandName} scales your reach.

• COMPLETE SCRIPT (0-15s):
• [0-3s Hook]: "Struggling to get high quality leads for your business?"
• [3-10s Body]: "We build custom strategies, high-speed websites, and targeted ad funnels that deliver real results."
• [10-15s CTA]: "Call us at ${phone || "+91 98765 43210"} or visit ${cleanUrl} to get started!"

• VIDEO KEYWORDS:
Agency Services, Business Lead Strategy, ${brandName} Shorts

• VIDEO HASHTAGS:
#${brandName}Shorts #BusinessStrategy #MarketingGrowth

• BEST TIME TO POST ON ${platform.toUpperCase()}:
• Peak Hours: 6:00 PM – 8:30 PM (Evening)`;
    }

    // Auto-detect services based on domain if not passed
    let autoServices = services ? services.split(",") : ["Web & Funnel Design", "SEO Strategy", "Social Ads", "Brand Growth"];
    if (domainName.includes("vedaswaram") || domainName.includes("vedas") || domainName.includes("pooja")) {
      autoServices = ["వేద మంత్రాలు", "గృహ పూజలు", "దోష నివారణ", "జాతక పరిశీలన"];
    } else if (domainName.includes("kids") || domainName.includes("education")) {
      autoServices = ["School Exams Prep", "IIT JEE Foundation", "EAMCET Coaching", "Test Papers"];
    }

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      domainName: domainName,
      autoPhone: phone || "+91 98765 43210",
      autoAddress: address || "Vizag, AP / India",
      autoServices: autoServices
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error", 
      noCreditReduction: true 
    }, { status: 500 });
  }
}
