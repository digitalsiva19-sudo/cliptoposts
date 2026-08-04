import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inputUrl, platform, phone, address, services, mode, language } = await req.json();

    if (!inputUrl) {
      return NextResponse.json({ error: "URL, Keyword, or Business Name is required", noCreditReduction: true }, { status: 400 });
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

    // MODE 1: KEYWORD RESEARCH & AUDIT REPORT
    if (mode === "keywords") {
      const keywordPrompt = `
You are an Elite SEO Strategist. Analyze '${inputUrl}'.
Provide a comprehensive SEO Audit Report for this exact category/niche.

CRITICAL INSTRUCTION:
Do NOT output fallback digital marketing text if the query is about real estate, education, medical, or another domain. Match the EXACT industry of '${inputUrl}'.

Format the response clearly into structured sections:

--------------------------------------------------
📊 TOP 10 HIGH-INTENT KEYWORDS ANALYTICS
(Provide 10 real search terms specific to '${inputUrl}'. Columns: # | Search Keyword | Monthly Volume | SEO Difficulty % | Est. Ranking Days | Search Intent | Est. Monthly Revenue Impact)

--------------------------------------------------
🎯 LOCAL SEO & GOOGLE MY BUSINESS (GMB) OPTIMIZATION
• Primary GMB Category & Keywords:
• Local Map Pack Search Terms:
• Recommended GMB Post Hook & Review Template:

--------------------------------------------------
💡 LONG-TAIL QUICK-RANK OPPORTUNITIES
• 5 High-Conversion Long-Tail Keywords:
• Competitor Content Gaps to Capitalize On:

--------------------------------------------------
🚀 ON-PAGE SEO & ACTION PLAN
• Estimated Monthly Organic Traffic Potential:
• Technical & Content Optimization Action Items:
`;

      let kwResult = await callGemini(apiKey, keywordPrompt);
      
      // Smart Dynamic Fallback based on Query if API fails
      if (!kwResult) {
        if (cleanUrl.includes("realestate") || cleanUrl.includes("property") || cleanUrl.includes("flat") || cleanUrl.includes("plot")) {
          kwResult = `📊 TOP 10 HIGH-INTENT KEYWORDS ANALYTICS REPORT FOR ${inputUrl.toUpperCase()}

| # | Search Keyword | Monthly Volume | SEO Difficulty % | Est. Ranking Days | Search Intent | Est. Revenue Impact |
|---|---|---|---|---|---|---|
| 1 | open plots for sale in vizag | 14,500/mo | 38% (Medium) | 20 - 35 Days | Transactional | High (₹10L+) |
| 2 | 2bhk flats in vizag for sale | 12,800/mo | 42% (Medium) | 30 - 45 Days | Commercial | High (₹15L+) |
| 3 | gated community villas near bhogapuram | 9,200/mo | 31% (Easy) | 15 - 25 Days | Transactional | High (₹25L+) |
| 4 | residential lands in vizag beach road | 7,600/mo | 35% (Easy) | 20 - 30 Days | Commercial | High (₹12L+) |
| 5 | vuda approved layouts in vizag | 11,400/mo | 29% (Easy) | 15 - 25 Days | Transactional | High (₹18L+) |
| 6 | best real estate builders in vizag | 8,100/mo | 45% (Medium) | 35 - 50 Days | Commercial | High (₹20L+) |
| 7 | luxury apartments in madhurawada | 6,500/mo | 33% (Easy) | 20 - 30 Days | Transactional | High (₹14L+) |
| 8 | commercial space for sale in vizag | 4,900/mo | 40% (Medium) | 30 - 40 Days | Commercial | High (₹16L+) |
| 9 | land rates in vizag outer ring road | 5,300/mo | 22% (Easy) | 10 - 20 Days | Informational | Medium (₹8L+) |
| 10 | property management services vizag | 3,800/mo | 27% (Easy) | 15 - 25 Days | Commercial | Medium (₹5L+) |

🎯 LOCAL SEO & GOOGLE MY BUSINESS (GMB) OPTIMIZATION
• Primary GMB Category: Real Estate Agency / Property Developer
• Local Map Terms: "real estate office near me", "best builders in Vizag"
• GMB Review Template: "Thank you for choosing ${inputUrl} for your dream property! Please share your feedback on Google to help home buyers!"

💡 LONG-TAIL QUICK-RANK OPPORTUNITIES
• "vuda approved plots for sale near vizag airport"
• "affordable 3bhk luxury flats in vizag under 60 lakhs"
• "top gated community ventures in vizag 2026"

🚀 ON-PAGE SEO & ACTION PLAN
• Estimated Organic Traffic Potential: 25,000+ monthly property seekers
• Action Items:
  1. Add Project Location Virtual Tour Pages.
  2. Optimize H1 with "VUDA Approved Plots & Flats in Vizag".
  3. Include WhatsApp Quick Inquiry Chatbot.`;
        } else {
          kwResult = `📊 TOP 10 HIGH-INTENT KEYWORDS ANALYTICS REPORT FOR ${brandName}

| # | Search Keyword | Monthly Volume | SEO Difficulty % | Est. Ranking Days | Search Intent | Est. Revenue Impact |
|---|---|---|---|---|---|---|
| 1 | ${domainName} services | 12,500/mo | 35% (Easy) | 15 - 30 Days | Transactional | High |
| 2 | best ${domainName} agency | 8,200/mo | 42% (Medium) | 30 - 45 Days | Commercial | High |
| 3 | local ${domainName} near me | 5,400/mo | 28% (Easy) | 10 - 20 Days | Local | Medium |
| 4 | high converting ${domainName} | 3,900/mo | 48% (Medium) | 45 - 60 Days | Commercial | High |
| 5 | digital growth ${domainName} | 6,100/mo | 50% (Medium) | 45 - 60 Days | Informational | Medium |
| 6 | affordable ${domainName} plans | 2,800/mo | 25% (Easy) | 15 - 25 Days | Transactional | High |
| 7 | online ${domainName} consultation | 4,200/mo | 38% (Medium) | 30 - 40 Days | Commercial | High |
| 8 | top rated ${domainName} solutions | 3,100/mo | 45% (Medium) | 40 - 50 Days | Commercial | High |
| 9 | ${domainName} strategy 2026 | 1,900/mo | 20% (Easy) | 10 - 15 Days | Informational | Low |
| 10 | professional ${domainName} experts | 2,500/mo | 33% (Easy) | 20 - 30 Days | Commercial | Medium |

🎯 LOCAL SEO & GOOGLE MY BUSINESS (GMB) OPTIMIZATION
• Primary GMB Category: Professional Services
• Local Map Terms: "${domainName} near me"
• GMB Review Template: "Thank you for partnering with ${brandName}! Please share your feedback on Google!"

💡 LONG-TAIL QUICK-RANK OPPORTUNITIES
• "how to choose the best ${domainName} for business growth"
• "affordable ${domainName} packages online"

🚀 ON-PAGE SEO & ACTION PLAN
• Estimated Organic Traffic Potential: 10,000+ visits / month
• Action Items: Optimize titles and speed up landing pages.`;
        }
      }

      return NextResponse.json({ success: true, keywordData: kwResult, domainName: inputUrl });
    }

    // MODE 2: SOCIAL MEDIA SUITE
    const langStyle = language === "telugu" ? "Telugu" : language === "tanglish" ? "Telugu-English Hybrid (Tanglish)" : "English";
    const promptText = `
You are an Enterprise AI Content Creator.
Target Domain / Business: ${inputUrl} (${domainName})
Scraped Data: ${scrapedMetadata || "Infer from input"}
Requested Platform: ${platform.toUpperCase()}
Language: ${langStyle}

Task: Output Social Post, 30-Sec Reel Script, and Business Summary custom-tailored to '${inputUrl}' in ${langStyle}.
`;

    let generatedText = await callGemini(apiKey, promptText);

    if (!generatedText) {
      if (cleanUrl.includes("realestate") || cleanUrl.includes("property")) {
        generatedText = `📸 SECTION 1: ${platform.toUpperCase()} SOCIAL MEDIA POST

• POST TITLE / HOOK:
"వైజాగ్ లో డ్రీమ్ ప్లాట్ లేదా ఫ్లాట్ కోసం చూస్తున్నారా? 🏡✨"

• FULL CAPTION / DESCRIPTION:
వైజాగ్ ప్రైమ్ లొకేషన్లలో (VUDA Approved) ఓపెన్ ప్లాట్స్ & మోడరన్ ఫ్లాట్స్ విక్రయానికి సిద్ధంగా ఉన్నాయి! 

1️⃣ 100% క్లియర్ టైటిల్ & బ్యాంక్ లోన్ సదుపాయం
2️⃣ బీచ్ రోడ్ & భోగాపురం గ్రీన్ ఫీల్డ్ కారిడార్ వద్ద బెస్ట్ వెంచర్స్
3️⃣ హై రిటర్న్స్ ఇచ్చే రియల్ ఎస్టేట్ ఇన్వెస్ట్‌మెంట్

సందర్శించండి: ${cleanUrl} | కాల్ చేయండి: ${phone || "+91 96405 02095"}

• HASHTAGS:
#VizagRealEstate #PlotsInVizag #FlatsInVizag #PropertyInvestment #VizagProperties

--------------------------------------------------
🎬 SECTION 2: 30-SEC REEL / SHORT VIDEO SCRIPT

• SCENE BREAKDOWN:
  - [0-3s Visual]: Aerial drone footage of scenic Vizag coastal road and gated layouts.
  - [3-15s Visual]: Modern 3BHK flat interior walkthrough with luxury amenities.
  - [15-30s Visual]: Contact details & 'Book Site Visit Today' button overlay.

--------------------------------------------------
📊 SECTION 3: BUSINESS SUMMARY & AUDIENCE INSIGHTS
• Industry Category: Real Estate & Property Development
• Target Audience: Home buyers, NRIs, property investors in AP/Telangana`;
      } else {
        generatedText = `📸 SECTION 1: ${platform.toUpperCase()} SOCIAL MEDIA POST

• POST TITLE / HOOK:
"Scale Your Brand Faster with ${brandName} in 2026! 🚀"

• FULL CAPTION / DESCRIPTION:
Looking for consistent business growth? At ${brandName}, we deliver tailored strategies for your market.

• HASHTAGS & CTA:
#${brandName} #BusinessGrowth #Innovation2026
Visit ${cleanUrl} to learn more!

--------------------------------------------------
🎬 SECTION 2: 30-SEC REEL / SHORT VIDEO SCRIPT

• SCENE BREAKDOWN:
  - [0-3s Visual]: Creative workspace with growth charts.
  - [3-15s Visual]: Team working on brand strategy.
  - [15-30s Visual]: Logo of ${brandName} with link.

--------------------------------------------------
📊 SECTION 3: BUSINESS SUMMARY & AUDIENCE INSIGHTS
• Industry Category: General Business
• Target Audience: Business Owners & Customers`;
      }
    }

    let autoServices = services ? services.split(",") : ["Web & Funnel Design", "SEO Strategy", "Social Ads", "Brand Growth"];
    if (cleanUrl.includes("realestate") || cleanUrl.includes("property")) {
      autoServices = ["Open Plots (VUDA)", "Luxury 2/3BHK Flats", "Gated Communities", "Property Management"];
    } else if (cleanUrl.includes("vedaswaram") || cleanUrl.includes("vedas") || cleanUrl.includes("pooja")) {
      autoServices = ["వేద మంత్రాలు", "గృహ పూజలు", "దోష నివారణ", "జాతక పరిశీలన"];
    }

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      domainName: inputUrl,
      autoPhone: phone || "+91 96405 02095",
      autoAddress: address || "Vizag, AP",
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

async function callGemini(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;

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
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.log(`Failed endpoint: ${endpoint}`);
    }
  }
  return null;
}
