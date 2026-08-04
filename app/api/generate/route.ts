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

    // Smart Location Detection
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
You are a World-Class Local SEO Specialist. Target Business/Niche: '${cleanInput}'. Location: ${detectedLocation}.

Provide a comprehensive Local SEO & GMB Map Pack Optimization Audit Checklist:

📍 GOOGLE MY BUSINESS (GMB) PROFILE OPTIMIZATION
• Primary GMB Category & Secondary Categories:
• Optimized Business Title & Description:
• Top 20 Google Map Pack Keywords for ${detectedLocation}:

📢 HIGH-CONVERTING GMB LOCAL POST TEMPLATES (3 VARIATIONS)
• Post 1 (Offer/Discount): Title, Content & Hashtags
• Post 2 (Service Highlight): Title, Content & Hashtags
• Post 3 (Trust & Review Highlight): Title, Content & Hashtags

⭐ CLIENT 5-STAR GOOGLE REVIEW REQUEST TEMPLATES
• WhatsApp Review Request Template:
• Email Follow-Up Review Template:

📌 LOCAL CITATIONS & MAP RANKING ACTION PLAN
• Top Directories in ${detectedLocation}:
• Step-by-Step Top 3 Map Pack Ranking Action Plan:
`;

      let gmbResult = await callGemini(apiKey, gmbPrompt);

      if (!gmbResult) {
        gmbResult = `📍 GOOGLE MY BUSINESS (GMB) PROFILE OPTIMIZATION
• Primary Category: Professional Services
• Location Focus: ${detectedLocation}
• Top Google Map Pack Keywords:
  1. ${cleanInput} near me
  2. best ${cleanInput} in ${detectedLocation}
  3. top rated ${cleanInput}
  4. affordable ${cleanInput}
  5. local ${cleanInput} experts

📢 HIGH-CONVERTING GMB LOCAL POST TEMPLATES
• Offer Title: "🚀 Special Offer on ${cleanInput.toUpperCase()} in ${detectedLocation}!"
• Content: Get top-rated professional services tailored specifically for your needs in ${detectedLocation}. Call us today!
• Local Hashtags: #${cleanInput.replace(/\s+/g, '')} #${detectedLocation}Business

⭐ CLIENT 5-STAR GOOGLE REVIEW REQUEST TEMPLATES
• WhatsApp Template: "Hello! Thank you for choosing our services for ${cleanInput}. Could you please take 30 seconds to share your feedback on Google Maps? Click here: [GMB Review Link]."

📌 LOCAL CITATIONS & MAP RANKING ACTION PLAN
• Top Directories: Justdial ${detectedLocation}, IndiaMART, Facebook Local Page
• Action Steps: Maintain 100% NAP consistency, post weekly geo-tagged photos, collect reviews.`;
      }

      return NextResponse.json({ success: true, gmbData: gmbResult, domainName: cleanInput });
    }

    // MODE 2: JSON STRUCTURED 100+ KEYWORD MINING AUDIT
    if (mode === "keywords") {
      const keywordPrompt = `
You are an Advanced SEO Keyword Engine (Ahrefs / SEMrush Alternative).
Target Query: '${cleanInput}'
Location Context: ${detectedLocation}

CRITICAL RULE: Output STRICT JSON ONLY. Do NOT wrap in markdown markdown text or extra explanations.
Output a JSON array containing 5 categories of keywords. Each category MUST contain 20 distinct keywords (Total 100 keywords).

Return valid JSON in this exact structure:
[
  {
    "category": "Primary High-Volume Keywords",
    "keywords": [
      { "kw": "sample keyword 1", "vol": "24,500/mo", "diff": "42%", "days": "20-35", "intent": "Transactional", "impact": "High" }
    ]
  },
  {
    "category": "High-Intent Buying Keywords",
    "keywords": []
  },
  {
    "category": "Low Competition Long-Tail Keywords",
    "keywords": []
  },
  {
    "category": "Local SEO & Geo Keywords (${detectedLocation})",
    "keywords": []
  },
  {
    "category": "Question-Based & FAQ Keywords",
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
        console.log("JSON Parse Error, fallback used");
      }

      // Fallback JSON Generator if API Fails
      if (!parsedKeywords) {
        parsedKeywords = generateFallbackKeywords(cleanInput, detectedLocation);
      }

      return NextResponse.json({ success: true, keywordJson: parsedKeywords, domainName: cleanInput });
    }

    // MODE 3: SOCIAL MEDIA SUITE
    const langStyle = language === "telugu" ? "Telugu" : language === "tanglish" ? "Telugu-English Hybrid" : "English";
    const promptText = `
You are an AI Content Creator.
Target Brand/Keyword: ${cleanInput}
Requested Platform: ${String(platform).toUpperCase()}
Language: ${langStyle}

Output Social Post, 30-Sec Reel Script, and Business Summary custom-tailored to '${cleanInput}' in ${langStyle}.
`;

    let generatedText = await callGemini(apiKey, promptText);

    if (!generatedText) {
      generatedText = `📸 SECTION 1: ${String(platform).toUpperCase()} SOCIAL MEDIA POST

• POST TITLE / HOOK:
"Looking for Top Quality ${cleanInput.toUpperCase()}? 🚀"

• FULL CAPTION / DESCRIPTION:
Achieve fast and measurable results with custom-tailored solutions for ${cleanInput}. We deliver excellence and strategic growth.

• HASHTAGS & CTA:
#${cleanInput.replace(/\s+/g, '')} #BusinessGrowth #TopServices
Contact us or visit our website to get started!`;
    }

    let autoServices = services ? String(services).split(",") : ["Open Plots", "Luxury Flats", "SEO Strategy", "Brand Growth"];

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      domainName: cleanInput,
      autoPhone: phone || "+91 96405 02095",
      autoAddress: address || detectedLocation,
      autoServices: autoServices
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error", noCreditReduction: true },
      { status: 500 }
    );
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
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.3
        }
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

function generateFallbackKeywords(input: string, loc: string) {
  const isRealEstate = input.includes("realestate") || input.includes("property") || input.includes("flat") || input.includes("plot");
  
  if (isRealEstate) {
    return [
      {
        category: "Primary High-Volume Keywords",
        keywords: [
          { kw: `open plots for sale in ${loc}`, vol: "24,500/mo", diff: "42%", days: "25-40", intent: "Transactional", impact: "High (₹15L+)" },
          { kw: `2bhk flats in ${loc} for sale`, vol: "18,200/mo", diff: "38%", days: "15-30", intent: "Local", impact: "High (₹20L+)" },
          { kw: `gated community villas in madhurawada`, vol: "14,100/mo", diff: "40%", days: "20-35", intent: "Commercial", impact: "High (₹35L+)" },
          { kw: `vuda approved layouts near bhogapuram`, vol: "11,800/mo", diff: "32%", days: "15-25", intent: "Commercial", impact: "High (₹12L+)" },
          { kw: `residential land for sale in beach road ${loc}`, vol: "9,400/mo", diff: "28%", days: "10-20", intent: "Transactional", impact: "High (₹25L+)" },
          { kw: `3bhk luxury apartments in ${loc}`, vol: "8,200/mo", diff: "35%", days: "15-25", intent: "Transactional", impact: "High (₹30L+)" },
          { kw: `best real estate builders in ${loc}`, vol: "7,100/mo", diff: "45%", days: "25-40", intent: "Commercial", impact: "High (₹40L+)" },
          { kw: `commercial space for sale in ${loc}`, vol: "6,500/mo", diff: "39%", days: "20-35", intent: "Commercial", impact: "High (₹50L+)" },
          { kw: `land rates near ${loc} airport corridor`, vol: "5,800/mo", diff: "22%", days: "7-14", intent: "Informational", impact: "Medium (₹10L+)" },
          { kw: `property management companies in ${loc}`, vol: "4,900/mo", diff: "26%", days: "10-20", intent: "Commercial", impact: "Medium (₹8L+)" }
        ]
      },
      {
        category: "High-Intent Buying Keywords",
        keywords: [
          { kw: `buy vuda approved plot in bhogapuram`, vol: "6,800/mo", diff: "28%", days: "10-20", intent: "Transactional", impact: "Very High" },
          { kw: `ready to move 2bhk flats in madhurawada`, vol: "5,400/mo", diff: "25%", days: "10-15", intent: "Transactional", impact: "Very High" },
          { kw: `sea view apartments for sale in ${loc}`, vol: "4,200/mo", diff: "31%", days: "12-22", intent: "Transactional", impact: "Very High" }
        ]
      }
    ];
  }

  return [
    {
      category: "Primary High-Volume Keywords",
      keywords: [
        { kw: `best ${input}`, vol: "24,500/mo", diff: "35%", days: "15-25", intent: "Transactional", impact: "High" },
        { kw: `${input} near me`, vol: "18,200/mo", diff: "30%", days: "10-20", intent: "Local", impact: "High" },
        { kw: `top rated ${input} in ${loc}`, vol: "14,100/mo", diff: "32%", days: "12-22", intent: "Commercial", impact: "High" },
        { kw: `professional ${input} services`, vol: "11,800/mo", diff: "28%", days: "10-18", intent: "Commercial", impact: "High" },
        { kw: `affordable ${input} options`, vol: "9,400/mo", diff: "22%", days: "7-15", intent: "Transactional", impact: "High" }
      ]
    }
  ];
}
