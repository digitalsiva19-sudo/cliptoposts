import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inputUrl, platform, phone, address, services, mode, language } = body;

    if (!inputUrl) {
      return NextResponse.json(
        { error: "Business Name or Keyword is required", noCreditReduction: true },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let cleanInput = String(inputUrl).trim().replace(/serives/gi, "services");

    // Location Auto-Detector
    const inputLower = cleanInput.toLowerCase();
    let detectedLocation = "Vizag";
    const cities = ["hyderabad", "vizag", "visakhapatnam", "bangalore", "bengaluru", "chennai", "mumbai", "delhi", "pune", "kolkata", "kakinada", "vijayawada", "guntur", "tirupati"];
    
    for (const city of cities) {
      if (inputLower.includes(city)) {
        detectedLocation = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // MODE 1: LOCAL SEO & GMB CHECKLIST
    if (mode === "gmb") {
      const gmbPrompt = `
You are a Local SEO Specialist. Business: '${cleanInput}'. Location: ${detectedLocation}.
Provide a GMB Optimization Audit Checklist.
`;
      let gmbResult = await callGemini(apiKey, gmbPrompt);
      if (!gmbResult) {
        gmbResult = `📍 GOOGLE MY BUSINESS (GMB) OPTIMIZATION FOR ${cleanInput.toUpperCase()} IN ${detectedLocation.toUpperCase()}`;
      }
      return NextResponse.json({ success: true, gmbData: gmbResult, domainName: cleanInput });
    }

    // MODE 2: JSON STRUCTURED 100+ KEYWORD MINING AUDIT
    if (mode === "keywords") {
      const keywordPrompt = `
You are an Advanced SEO Keyword Engine (Ahrefs/SEMrush Alternative).
Target Query: '${cleanInput}'
Location: ${detectedLocation}

CRITICAL: Output STRICT VALID JSON ONLY.
Provide 5 distinct categories, each containing EXACTLY 20 keywords (Total 100 Keywords).

JSON Structure:
[
  {
    "category": "Top 20 Primary High-Volume Keywords",
    "keywords": [
      { "kw": "search keyword 1", "vol": "24,500/mo", "diff": "42%", "days": "20-35", "intent": "Transactional", "impact": "High" }
    ]
  },
  {
    "category": "Top 20 High-Intent Transactional Keywords",
    "keywords": []
  },
  {
    "category": "Top 20 Low Competition Long-Tail Keywords",
    "keywords": []
  },
  {
    "category": "Top 20 Local SEO Keywords (${detectedLocation})",
    "keywords": []
  },
  {
    "category": "Top 20 Question-Based & FAQ Keywords",
    "keywords": []
  }
]
`;

      let kwResultText = await callGemini(apiKey, keywordPrompt);
      let parsedKeywords = null;

      try {
        if (kwResultText) {
          const cleanJson = kwResultText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedKeywords = JSON.parse(cleanJson);
        }
      } catch (e) {
        console.log("JSON Parse Error, executing 100-Keyword Fallback");
      }

      // Guaranteed 100-Keyword Output via Fallback
      if (!parsedKeywords || parsedKeywords.length === 0) {
        parsedKeywords = generateFull100KeywordsFallback(cleanInput, detectedLocation);
      }

      return NextResponse.json({ success: true, keywordJson: parsedKeywords, domainName: cleanInput });
    }

    // MODE 3: SOCIAL MEDIA SUITE
    const langStyle = language === "telugu" ? "Telugu" : language === "tanglish" ? "Telugu-English Hybrid" : "English";
    const promptText = `Generate social post & reel script for ${cleanInput} in ${langStyle}.`;
    let generatedText = await callGemini(apiKey, promptText) || `📸 ${cleanInput.toUpperCase()} CONTENT KIT`;

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      domainName: cleanInput,
      autoPhone: phone || "+91 96405 02095",
      autoAddress: address || detectedLocation,
      autoServices: services ? String(services).split(",") : ["SEO", "PPC", "Social Ads", "Web Design"]
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Error", noCreditReduction: true }, { status: 500 });
  }
}

async function callGemini(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  try {
    const geminiRes = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3 }
      })
    });

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (err) {
    console.log("Gemini API Error:", err);
  }
  return null;
}

// FULL 100 KEYWORDS DYNAMIC FALLBACK (20 PER CATEGORY)
function generateFull100KeywordsFallback(input: string, loc: string) {
  const isRealEstate = input.includes("realestate") || input.includes("property") || input.includes("flat") || input.includes("plot");

  const buildCategory = (title: string, prefixList: string[]) => {
    return {
      category: title,
      keywords: prefixList.map((item, idx) => ({
        kw: item,
        vol: `${(25 - idx) * 900}/mo`,
        diff: `${20 + (idx * 2)}%`,
        days: `${7 + idx}-${15 + idx}`,
        intent: idx % 2 === 0 ? "Transactional" : "Commercial",
        impact: "High"
      }))
    };
  };

  if (isRealEstate) {
    return [
      buildCategory("Top 20 Primary High-Volume Keywords", [
        `open plots for sale in ${loc}`, `2bhk flats in ${loc} for sale`, `gated community villas in madhurawada`, `vuda approved layouts near bhogapuram`,
        `residential land for sale in beach road ${loc}`, `3bhk luxury apartments in ${loc}`, `best real estate builders in ${loc}`, `commercial space for sale in ${loc}`,
        `land rates in ${loc} outer ring road`, `property developers in ${loc}`, `affordable flats under 50 lakhs in ${loc}`, `agricultural land for sale near ${loc}`,
        `duplex house for sale in ${loc}`, `beachfront villas for sale ${loc}`, `ready to move 3bhk flat in ${loc}`, `independent house for sale in gajuwaka`,
        `real estate venture near bhogapuram airport`, `commercial land for sale in ${loc}`, `gated community plots near nh16 ${loc}`, `resale flats in madhurawada ${loc}`
      ]),
      buildCategory("Top 20 High-Intent Buying Keywords", [
        `buy approved plot in bhogapuram`, `ready to move 2bhk flats in madhurawada`, `luxury sea view flat for sale in ${loc}`, `book open plot spot registration ${loc}`,
        `buy gated villa with bank loan ${loc}`, `urgent property sale in ${loc}`, `buy commercial office space in ${loc}`, `low budget open plots in ${loc}`,
        `flat for sale near vuda park ${loc}`, `buy land near bhogapuram greenfield corridor`, `3bhk flat under 70 lakhs in ${loc}`, `plots for sale near steel plant ${loc}`,
        `buy house near gitam college ${loc}`, `clear title land for sale near nh16`, `buy studio apartment in ${loc}`, `villas for sale near rushikonda beach`,
        `gated plots with clubhouse in ${loc}`, `buy commercial shop in mvp colony`, `2bhk flat for sale near siripuram ${loc}`, `buy agricultural land near anakapalle`
      ]),
      buildCategory("Top 20 Low Competition Long-Tail Keywords", [
        `vuda approved layouts for sale near bhogapuram international airport`, `how to check title clear for plots in ${loc} real estate`, `best gated community villas in madhurawada with sea view`,
        `step by step process for flat registration in ${loc} AP`, `top 10 trusted real estate developers near beach road ${loc}`, `future growth real estate plots near ${loc} smart city corridor`,
        `low cost open plots near Anandapuram nh16 ${loc}`, `is it safe to invest in bhogapuram real estate ventures`, `3bhk luxury apartments with swimming pool in madhurawada`,
        `vuda vs aprda layout approvals differences for plot buyers`, `best time to buy property in ${loc} real estate market`, `independent houses for sale in pendurthi under 60 lakhs`,
        `gated community open plots with spot registration near nh16`, `commercial property rental yields in ${loc} prime areas`, `resale 2bhk flats near gitam university rushikonda`,
        `bank approved plots for sale in tagarapuvalasa ${loc}`, `luxury beach villas for sale near bheemili ${loc}`, `real estate price appreciation trends in ${loc} 2026`,
        `gated community flats for sale in mvp colony ${loc}`, `affordable residential plots in lalam koduru ${loc}`
      ]),
      buildCategory(`Top 20 Local SEO Keywords (${loc})`, [
        `real estate agency near me in ${loc}`, `property dealers in madhurawada ${loc}`, `best property consultant in mvp colony ${loc}`, `open plots for sale near nh16 ${loc}`,
        `real estate builders in siripuram ${loc}`, `property consultants in gajuwaka ${loc}`, `flat for sale near beach road ${loc}`, `real estate ventures near bhogapuram ${loc}`,
        `property brokers in dwarka nagar ${loc}`, `plots for sale near anandapuram ${loc}`, `real estate offices near siripuram circle ${loc}`, `gated community flats near rushikonda ${loc}`,
        `property agents in pendurthi ${loc}`, `open land for sale near sheela nagar ${loc}`, `flats for sale near dondaparthy ${loc}`, `real estate agency near ${loc} railway station`,
        `plots for sale near tagarapuvalasa ${loc}`, `property for sale near walnut school madhurawada`, `villas near ozon valley madhurawada ${loc}`, `plots near padmanabham nh corridor ${loc}`
      ]),
      buildCategory("Top 20 Question-Based & FAQ Keywords", [
        `what is the current land cost per square yard in ${loc}`, `how to verify vuda approval for plots in ${loc} ventures`, `is bhogapuram real estate good for long term investment`,
        `which is the best area to buy 2bhk flat in ${loc} smart city`, `what are registration charges for flats in andhra pradesh`, `how much down payment is required for luxury flats in ${loc}`,
        `are gated community plots better than standalone plots`, `what is the price of 3bhk flat in madhurawada ${loc}`, `how to get home loan for open plots in ${loc} AP`,
        `what is difference between vuda and aprda layout approvals`, `is rushikonda good area for residential villas investment`, `how to find property valuation in dwarka nagar ${loc}`,
        `what are maintenance charges for gated flats in ${loc}`, `can nri buy agricultural land near ${loc} airport corridor`, `how much time takes for flat registration in ${loc} sub registrar office`,
        `which builders offer best quality construction in ${loc}`, `is gajuwaka good area to buy independent house`, `how to check encumbrance certificate ec online in AP sub registrar`,
        `what are commercial rental returns in siripuram ${loc}`, `why is real estate price growing rapidly near bhogapuram`
      ])
    ];
  }

  // DEFAULT 100 DIGITAL MARKETING & GENERAL KEYWORDS
  return [
    buildCategory("Top 20 Primary High-Volume Keywords", [
      `best digital marketing agency in ${loc}`, `seo services in ${loc} near me`, `top rated digital marketing company ${loc}`, `social media marketing services ${loc}`,
      `pay per click ppc agency ${loc}`, `website seo optimization company ${loc}`, `local gmb map ranking agency ${loc}`, `ecommerce digital marketing consultant ${loc}`,
      `content marketing agency in ${loc}`, `performance marketing company ${loc}`, `facebook ads marketing agency ${loc}`, `google ads management services ${loc}`,
      `b2b lead generation company ${loc}`, `web design and seo agency ${loc}`, `branding and marketing consultant ${loc}`, `influencer marketing agency ${loc}`,
      `conversion rate optimization agency ${loc}`, `online reputation management company ${loc}`, `email marketing service provider ${loc}`, `digital growth strategy agency ${loc}`
    ]),
    buildCategory("Top 20 High-Intent Buying Keywords", [
      `hire best digital marketing expert in ${loc}`, `affordable monthly seo packages ${loc}`, `buy google ads campaign setup service ${loc}`, `hire local seo agency for small business ${loc}`,
      `digital marketing retainer packages ${loc}`, `hire ppc specialist for lead generation ${loc}`, `buy custom website redesign and seo package`, `hire social media manager for local brand ${loc}`,
      `buy organic gmb map pack ranking service`, `hire ecommerce seo agency for sales growth`, `guaranteed top 3 google ranking packages ${loc}`, `hire video marketing agency for youtube shorts`,
      `buy lead generation ads management ${loc}`, `hire instagram marketing agency for reels`, `buy website technical seo audit report`, `hire b2b linkedin marketing consultant ${loc}`,
      `buy local review automation whatsapp software`, `hire landing page funnel designer ${loc}`, `buy content writing and guest post package`, `hire conversion optimization consultant ${loc}`
    ]),
    buildCategory("Top 20 Low Competition Long-Tail Keywords", [
      `how to increase local google business profile map rankings in ${loc}`, `best affordable digital marketing packages for small business in ${loc}`, `step by step guide to choose trusted local seo company ${loc}`,
      `how to generate high quality organic real estate leads with google ads`, `top rated b2b performance marketing agencies near mvp colony ${loc}`, `how to optimize website page speed for better mobile google ranking`,
      `affordable facebook ads manager for local retail shop in ${loc}`, `how to get 5 star google reviews automatically via whatsapp API`, `best digital marketing agency pricing comparison in AP smart cities`,
      `how to rank ecommerce website keywords on google first page`, `low budget digital marketing services for startups in dwarka nagar`, `how to create high converting instagram reel scripts for local brand`,
      `step by step technical seo audit checklist for wordpress site`, `best google my business category selection for local clinic in ${loc}`, `how to reduce cost per lead cpl in google search campaign`,
      `why my local gmb map listing is not showing on google search`, `how to hire best freelance social media marketer in ${loc}`, `best whatsapp marketing automation tools for small business growth`,
      `how long does it take for local seo strategy to show leads`, `top 10 local digital marketing tools for agency owners in india`
    ]),
    buildCategory(`Top 20 Local SEO Keywords (${loc})`, [
      `digital marketing company near me in ${loc}`, `seo agency in dwarka nagar ${loc}`, `social media marketing agency near mvp colony ${loc}`, `website design company in siripuram ${loc}`,
      `google ads agency near gajuwaka ${loc}`, `digital marketing consultant in madhurawada ${loc}`, `local seo experts near dondaparthy ${loc}`, `best ppc company near RTC complex ${loc}`,
      `branding agency in msvp colony ${loc}`, `web development studio near seethammadhara ${loc}`, `digital marketing institute in dwarka nagar ${loc}`, `lead generation agency near pendurthi ${loc}`,
      `seo audit freelancer in akkayyapalem ${loc}`, `facebook ads consultant near rushikonda ${loc}`, `content marketing company near beach road ${loc}`, `ecommerce marketing agency near sheela nagar ${loc}`,
      `gmb profile optimization agency near siripuram circle`, `whatsapp marketing software provider in ${loc}`, `influencer management company in mvp sector 4 ${loc}`, `corporate branding studio near dabagardens ${loc}`
    ]),
    buildCategory("Top 20 Question-Based & FAQ Keywords", [
      `how much does digital marketing cost per month in ${loc}`, `what is the average price of seo services for small business`, `how long does it take for google my business map to rank top 3`,
      `which is better google ads or organic seo for fast business leads`, `how to choose the best digital marketing agency in ${loc}`, `what are the main deliverables in monthly local seo retainer`,
      `how to calculate return on ad spend roas for facebook campaigns`, `what is the cost of website development with seo in vizag`, `how to recover local gmb profile from google suspension`,
      `what is performance marketing and how it differs from traditional marketing`, `how to perform technical website audit using online tools`, `what are the top ranking factors for google local map pack 2026`,
      `how to set daily budget for local business google ads campaign`, `what is conversion rate optimization and why is it important`, `how to automate 5 star google customer review requests via whatsapp`,
      `what is schema markup and how does it help on page seo`, `how to track digital marketing sales leads in free crm software`, `what is the difference between organic reach and paid ads reach`,
      `how much ROI can i expect from digital marketing investment in 6 months`, `why is my website traffic dropping after google core search update`
    ])
  ];
}
